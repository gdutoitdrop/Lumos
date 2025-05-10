import Stripe from "stripe"

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing STRIPE_SECRET_KEY")
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
})

export const PLANS = {
  PREMIUM: {
    name: "Premium",
    id: process.env.STRIPE_PREMIUM_PRICE_ID || "price_1234567890",
    price: 9.99,
    features: [
      "Advanced matching algorithm",
      "Unlimited matches",
      "See who liked you",
      "Priority support",
      "Ad-free experience",
    ],
  },
}
