"use client"

import type React from "react"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Crown, Loader2 } from "lucide-react"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentFormProps {
  planType: "premium" | "premium_plus"
  onSuccess: () => void
}

function CheckoutForm({ planType, onSuccess }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const planDetails = {
    premium: {
      name: "Premium",
      price: "$9.99",
      features: ["Unlimited matches", "See who liked you", "Advanced messaging"],
    },
    premium_plus: {
      name: "Premium Plus",
      price: "$19.99",
      features: ["All Premium features", "Exclusive events", "AI conversation starter"],
    },
  }

  const plan = planDetails[planType]

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create payment intent
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planType }),
      })

      const { clientSecret, error: apiError } = await response.json()

      if (apiError) {
        throw new Error(apiError)
      }

      // Confirm payment
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
        },
      })

      if (stripeError) {
        throw new Error(stripeError.message)
      }

      if (paymentIntent?.status === "succeeded") {
        // Confirm payment on backend
        await fetch("/api/confirm-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ paymentIntentId: paymentIntent.id }),
        })

        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <Crown className="h-12 w-12 text-amber-500 mx-auto mb-4" />
        <CardTitle>Upgrade to {plan.name}</CardTitle>
        <CardDescription className="text-2xl font-bold">{plan.price}/month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h4 className="font-medium mb-2">What you'll get:</h4>
          <ul className="space-y-1 text-sm text-muted-foreground">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-3 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                },
              }}
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-rose-500 to-amber-500 text-white"
            disabled={!stripe || loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Subscribe for ${plan.price}/month`
            )}
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Your subscription will automatically renew monthly. Cancel anytime.
        </p>
      </CardContent>
    </Card>
  )
}

export function PaymentForm({ planType, onSuccess }: PaymentFormProps) {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm planType={planType} onSuccess={onSuccess} />
    </Elements>
  )
}
