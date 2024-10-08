import { useState, useEffect, createContext, useContext, PropsWithChildren, useCallback } from "react";
import { randomUUID } from 'expo-crypto';
import { Linking, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useStripe } from '@stripe/stripe-react-native';

import { CartItem, Tables } from "../types";
import { useCreateOrder } from "../api/orders";
import { useInsertOrderItems } from "../api/order-items";
import { initialisePaymentSheet, openPaymentSheet } from "@/src/lib/stripe";

type Product = Tables<'products'>;

type CartType = {
  items: CartItem[];
  addItem: (product: Product, size: CartItem["size"]) => void;
  updateQuantity: (itemId: string, amount: -1 | 1) => void;
  total: number;
  totalQuantity: number;
  checkout: () => void;
  loading: boolean;
}

export const CartContext = createContext<CartType>({ 
  items: [],
  addItem: () => {},
  updateQuantity: () => {},
  total: 0,
  totalQuantity: 0,
  checkout: () => { },
  loading: false,
});

const CartProvider = ({ children }: PropsWithChildren ) => {
  const [items, setItems] = useState<CartItem[]>([]);
  
  const { mutate: createOrder } = useCreateOrder();
  const { mutate: insertOrderItems } = useInsertOrderItems();

  const router = useRouter();

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function initialize() {
      initialisePaymentSheet();
      setLoading(true)
    }
    initialize();
  }, []);
  
  const addItem = (product: Product, size: CartItem['size']) => {
    // if already in cart; increment quantity
    const existingItem = items.find(
      (item) => item.product === product && item.size === size
    );

    if (existingItem) {
      updateQuantity(existingItem.id, 1);
      return
    }

    const newCartItem: CartItem = {
      id: randomUUID(),
      product,
      product_id: product.id,
      size,
      quantity: 1
    };

    setItems([newCartItem, ...items]);
  };

  // updateQuantity
  const updateQuantity = (itemId: string, amount: -1 | 1) => {
    setItems(
      items
        .map((item) =>
          item.id !== itemId
            ? item
            : { ...item, quantity: item.quantity + amount }
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const total = Number(items.reduce(
    (sum, item) => (sum += item.product.price * item.quantity),
    0
  ).toFixed(2));

  const totalQuantity = Number(items.reduce(
    (sum, item) => (sum += item.quantity), 0 ).toFixed(2));

  const clearCart = () => {
    setItems([]);
  };



  const checkout = async () => {
    await initialisePaymentSheet(
      Math.round(total * 100),
      "usd",
    );

    const payed = await openPaymentSheet();

    if (!items) return;
    

    createOrder({ total }, { 
      onSuccess: saveOrderitems
    });
  }

  const  saveOrderitems = (order: Tables<'orders'>) => {
    const orderItems = items.map((cartItem) => ({
        order_id: order.id,
        product_id: cartItem.product_id,
        quantity: cartItem.quantity,
        size: cartItem.size
      }
    ));

    insertOrderItems(
      orderItems,
      {
        onSuccess() {
          clearCart()
          router.push(`/(user)/orders/${order.id}`)
        }
      }
    );
  }

  return (
    <CartContext.Provider value={{ items, addItem, updateQuantity, total, totalQuantity, checkout, loading }} >
      { children }
    </CartContext.Provider>
  )
}

export default CartProvider;

export const useCart = () => useContext(CartContext);