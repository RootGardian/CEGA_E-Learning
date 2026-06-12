import { useEffect, useState } from 'react';
import { useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51TKdreHTTgYbk5AbmdIxHtghkUsUDjUoU2YDiPmV3G80IA0fFBBLvA1eXK1thbthuLl0PiHrCuAU6RVb7EIPJHn3002GBq5FOq');

const PaymentResultContent = () => {
  const stripe = useStripe();
  const [message, setMessage] = useState<string | null>(null);
  const [status, setStatus] = useState<'success' | 'processing' | 'requires_payment_method' | 'default'>('default');

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      'payment_intent_client_secret'
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      if (!paymentIntent) return;

      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Paiement réussi ! Votre compte est maintenant activé.');
          setStatus('success');
          break;
        case 'processing':
          setMessage("Votre paiement est en cours de traitement.");
          setStatus('processing');
          break;
        case 'requires_payment_method':
          setMessage('Le paiement a échoué. Veuillez essayer avec un autre moyen de paiement.');
          setStatus('requires_payment_method');
          break;
        default:
          setMessage("Un problème inattendu est survenu.");
          setStatus('default');
          break;
      }
    });
  }, [stripe]);

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up" style={{ maxWidth: '500px', textAlign: 'center' }}>
        {status === 'default' && !message ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0' }}>
            <Loader2 className="spinner" size={48} color="var(--accent-primary)" style={{ animation: 'spin 2s linear infinite' }} />
            <h2 style={{ marginTop: '1.5rem', color: 'var(--text-primary)' }}>Vérification du paiement...</h2>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {status === 'success' && <CheckCircle size={64} color="var(--accent-primary)" style={{ marginBottom: '1rem' }} />}
            {(status === 'requires_payment_method' || status === 'default') && <XCircle size={64} color="#ef4444" style={{ marginBottom: '1rem' }} />}
            {status === 'processing' && <Loader2 size={64} color="#3b82f6" style={{ marginBottom: '1rem', animation: 'spin 2s linear infinite' }} />}
            
            <h1 className="gradient-text" style={{ fontSize: '1.75rem', marginBottom: '1rem' }}>
              {status === 'success' ? 'Inscription Validée' : 'Statut du paiement'}
            </h1>
            
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              {message}
            </p>

            {status === 'success' ? (
              <Link to="/login" className="btn btn-primary" style={{ width: '100%' }}>
                Se connecter à l'espace étudiant
              </Link>
            ) : (
              <Link to="/payment-gateway" className="btn btn-secondary" style={{ width: '100%' }}>
                Réessayer le paiement
              </Link>
            )}
          </div>
        )}
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const PaymentResult = () => (
  <Elements stripe={stripePromise}>
    <PaymentResultContent />
  </Elements>
);

export default PaymentResult;
