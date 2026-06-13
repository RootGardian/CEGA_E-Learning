import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { usePopup } from '../contexts/PopupContext';

// Initialize Stripe outside component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe('pk_test_51TKdreHTTgYbk5AbmdIxHtghkUsUDjUoU2YDiPmV3G80IA0fFBBLvA1eXK1thbthuLl0PiHrCuAU6RVb7EIPJHn3002GBq5FOq');

type AuthUser = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: string;
  department?: string;
};

const PaymentGateway: React.FC = () => {
  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'cinetpay' | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formationPrice, setFormationPrice] = useState<number>(150000);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  const { showAlert } = usePopup();

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get('/api/auth/me', { withCredentials: true });
        setCurrentUser(userRes.data);

        // Fetch formations to get specific price
        const formationsRes = await axios.get('/api/auth/public/formations');
        const formations = formationsRes.data;
        const selectedFormation = formations.find((f: any) => f.code_formation === userRes.data.department);

        if (selectedFormation && selectedFormation.frais_inscription) {
          setFormationPrice(parseInt(selectedFormation.frais_inscription, 10));
        } else {
          // Fallback to settings
          const settingsRes = await axios.get('/api/auth/public/settings');
          if (settingsRes.data.formationPrice) {
            setFormationPrice(parseInt(settingsRes.data.formationPrice, 10));
          }
        }
      } catch (err) {
        console.error("Failed to fetch user or price details", err);
      }
    };
    fetchData();
  }, []);

  const handlePaymentInit = async () => {
    if (!selectedMethod) return;

    if (!currentUser) {
      showAlert('Veuillez vous connecter avant de lancer le paiement', 'error');
      return;
    }

    setIsLoading(true);
    if (selectedMethod === 'stripe') {
      try {
        // En conditions réelles, on récupère l'email de l'utilisateur connecté ou des props
        const response = await axios.post('/api/payments/create-intent', {
          amount: formationPrice,
          currency: 'gnf',
          description: "Frais d'inscription CEGA E-Learning",
          email: currentUser.email,
        }, {
          withCredentials: true
        });

        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
        showAlert(message || 'Erreur lors de l\'initialisation du paiement', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await axios.post('/api/payments/cinetpay/init', {
          amount: formationPrice,
          country: 'GN',
          currency: 'GNF',
          paymentMethod: 'ALL',
          description: "Frais d'inscription CEGA E-Learning",
          phone: currentUser.phone,
        }, {
          withCredentials: true
        });

        const paymentUrl = response.data?.payment_url || response.data?.paymentUrl;
        if (paymentUrl) {
          window.location.href = paymentUrl;
        } else {
          showAlert('Erreur: Impossible de récupérer le lien de paiement CinetPay', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la création de la session CinetPay:', error);
        const message = axios.isAxiosError(error) ? error.response?.data?.message : null;
        showAlert(message || 'Erreur lors de l\'initialisation du paiement CinetPay', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up" style={{ maxWidth: '550px' }}>
        <div className="auth-header">
          <h1 className="gradient-text">Finalisez votre Inscription</h1>
          <p>Choisissez votre méthode de paiement pour activer votre compte étudiant.</p>
        </div>

        {!clientSecret ? (
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0', border: '1px solid var(--border-color)', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Frais d'inscription CEGA E-Learning</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>{formationPrice.toLocaleString('fr-FR')} GNF</span>
              </div>
            </div>

            <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-primary)' }}>Méthode de paiement</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div
                onClick={() => setSelectedMethod('cinetpay')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0',
                  border: `2px solid ${selectedMethod === 'cinetpay' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: selectedMethod === 'cinetpay' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedMethod === 'cinetpay' && <CheckCircle size={20} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-primary)' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <Smartphone size={32} color={selectedMethod === 'cinetpay' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontWeight: '500', textAlign: 'center' }}>CinetPay</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Mobile Money & Cartes</span>
                </div>
              </div>

              <div
                onClick={() => setSelectedMethod('stripe')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0',
                  border: `2px solid ${selectedMethod === 'stripe' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: selectedMethod === 'stripe' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedMethod === 'stripe' && <CheckCircle size={20} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-primary)' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <CreditCard size={32} color={selectedMethod === 'stripe' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontWeight: '500', textAlign: 'center' }}>Carte Bancaire</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Visa, Mastercard</span>
                </div>
              </div>
            </div>

            <button
              onClick={handlePaymentInit}
              disabled={!selectedMethod || isLoading}
              className={`btn ${selectedMethod ? 'btn-primary' : 'btn-secondary'}`}
              style={{ opacity: selectedMethod && !isLoading ? 1 : 0.5, cursor: selectedMethod ? 'pointer' : 'not-allowed', width: '100%', marginTop: '2rem' }}
            >
              {isLoading ? 'Chargement...' : (selectedMethod ? 'Procéder au paiement' : 'Sélectionnez une méthode')}
              {selectedMethod && !isLoading && <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />}
            </button>
          </div>
        ) : (
          <Elements options={{ clientSecret, appearance: { theme: 'night' } }} stripe={stripePromise}>
            <StripePaymentForm />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default PaymentGateway;
