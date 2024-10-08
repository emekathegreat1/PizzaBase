import { StyleSheet, FlatList, ActivityIndicator, View } from 'react-native';

import ProductListItem from "@/src/components/ProductListItem";
import { ThemedView } from "@/src/components/ThemedView";
import { ThemedText } from "@/src/components/ThemedText";
import { HelloWave } from "@/src/components/HelloWave";
import { Link, Stack } from "expo-router";
import { useProductList } from "@/src/api/products";
import { Colors } from "@/src/constants/Colors";

export default function HomeScreen() {
  const { data: products, error, isLoading } = useProductList();

  if (isLoading) {
    return <ActivityIndicator/>
  }

  if (error) {
    <ThemedView>
      <ThemedText style={{ color: "red" }}>Failed to fetch components</ThemedText>
      <Link href={'/'}>Go back home <HelloWave /> </Link>
    </ThemedView>
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductListItem product={item}/> }
        numColumns={2}
        contentContainerStyle={{ gap: 10, padding: 10, marginBottom: 40 }}
        columnWrapperStyle={{ gap: 10 }}
      />
     </View> 
  );
}

const styles = StyleSheet.create({
  container : {
    backgroundColor: Colors.light.tint
  }
})