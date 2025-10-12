import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY!);

interface StripeTestButtonProps {
  creatorHandle: string;
}

export function StripeTestButton({ creatorHandle }: StripeTestButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const createTestCheckoutSession = useMutation(api.payments.createTestCheckoutSession);

  const handleClick = async () => {
    try {
      setIsLoading(true);
      
      // Create checkout session
      const session = await createTestCheckoutSession({
        amount: 500, // $5.00 in cents
        title: "Test Coffee ☕",
        creatorHandle,
      });

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (stripe && session.sessionId) {
        const { error } = await stripe.redirectToCheckout({
          sessionId: session.sessionId,
        });
        
        if (error) {
          console.error("Stripe redirect error:", error);
          alert("Payment failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Payment failed. Please check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Processing...
        </>
      ) : (
        <>
          🍺 Buy Test Coffee - $5.00
        </>
      )}
    </button>
  );
}

/**
 * Test Stripe Connection Button
 */
export function StripeConnectionTest() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string>("");
  const testConnection = useMutation(api.payments.testStripeConnection);

  const handleTest = async () => {
    try {
      setIsLoading(true);
      setResult("");
      
      const response = await testConnection();
      
      if (response.success) {
        setResult(`✅ Stripe Connected! Account: ${response.accountId} (${response.country})`);
      } else {
        setResult(`❌ Stripe Error: ${response.error}`);
      }
    } catch (error) {
      setResult(`❌ Connection Failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-[#232323] border border-[#2a2a2a] rounded-lg p-6 mb-6">
      <h3 className="text-white font-semibold mb-4">🧪 Stripe Test Zone</h3>
      
      <button
        onClick={handleTest}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded font-medium transition-colors mb-3"
      >
        {isLoading ? "Testing..." : "Test Stripe Connection"}
      </button>
      
      {result && (
        <div className="text-sm mt-3 p-3 bg-[#1f1f1f] rounded border border-[#333]">
          <code className="text-slate-300">{result}</code>
        </div>
      )}
      
      <div className="text-xs text-slate-400 mt-3">
        Use test card: <code>4242 4242 4242 4242</code> • Any future date • Any CVC
      </div>
    </div>
  );
}