// esm.sh is used to compile stripe-node to be compatible with ES modules.
import Stripe from 'https://esm.sh/stripe@13.10.0?target=deno&deno-std=0.132.0&no-check';

export const stripe = Stripe(Deno.env.get('EXPO_PUBLIC_STRIPE_SECRET_KEY') ?? '', {
  httpClient: Stripe.createFetchHttpClient(),
});

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};