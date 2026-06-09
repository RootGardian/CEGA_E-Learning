import React, { useState } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { ArrowRight } from 'lucide-react';

export const StripePaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    // Confirm the payment
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Return URL where the customer should be redirected after the payment
        return_url: `${window.location.origin}/payment-result`,
      },
    });

    if (error) {
      // Show error to your customer
      setErrorMessage(error.message || "Une erreur inattendue s'est produite.");
      setIsProcessing(false);
    } else {
      // Payment successful, the return_url will be hit
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
      <PaymentElement />
      <button 
        disabled={!stripe || isProcessing}
        className="btn btn-primary"
        style={{ width: '100%', marginTop: '2rem', opacity: isProcessing ? 0.7 : 1 }}
      >
        {isProcessing ? 'Traitement en cours...' : 'Confirmer le paiement'}
        {!isProcessing && <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />}
      </button>
      {errorMessage && (
        <div style={{ color: 'red', marginTop: '1rem', textAlign: 'center' }}>
          {errorMessage}
        </div>
      )}
    </form>
  );
};
