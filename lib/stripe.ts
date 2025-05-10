import Stripe from "stripe"

// Define subscription plans
export const PLANS = {
  premium: {
    name: "Premium",
    id: process.env.STRIPE_PREMIUM_PRICE_ID || "",
    features: [
      "Advanced matching algorithm",
      "Unlimited matches",
      "See who liked you",
      "Priority support",
      "Ad-free experience",
    ],
    price: "$9.99",
    interval: "month",
  },
}

// Create a function to get the Stripe client
export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    console.warn("Missing Stripe secret key")
    throw new Error("Stripe is not properly configured")
  }

  return new Stripe(secretKey, {
    apiVersion: "2023-10-16", // Use the latest API version
    appInfo: {
      name: "Lumos Platform",
      version: "1.0.0",
    },
  })
}

// Create a function to get the Stripe publishable key
export function getStripePublishableKey() {
  return process.env.STRIPE_PUBLISHABLE_KEY || ""
}
