import React, { useState } from 'react';
import { CreditCard, Smartphone, CheckCircle, ArrowRight } from 'lucide-react';

import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { StripePaymentForm } from '../components/StripePaymentForm';
import { usePopup } from '../contexts/PopupContext';
import { useLocation, useNavigate } from 'react-router-dom';

// Initialize Stripe outside component to avoid recreating the Stripe object on every render
const stripePromise = loadStripe('pk_test_51TKdreHTTgYbk5AbmdIxHtghkUsUDjUoU2YDiPmV3G80IA0fFBBLvA1eXK1thbthuLl0PiHrCuAU6RVb7EIPJHn3002GBq5FOq');

const PaymentGateway: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const registrationData = location.state?.registrationData;

  const [selectedMethod, setSelectedMethod] = useState<'stripe' | 'cinetpay' | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formationPrice, setFormationPrice] = useState<number | null>(null);

  const { showAlert } = usePopup();

  React.useEffect(() => {
    if (!registrationData) {
      navigate('/register');
      return;
    }

    const fetchPrice = async () => {
      try {
        const res = await axios.get('/api/auth/public/formations');
        const formations = res.data;
        const selectedFormation = formations.find((f: any) => f.code_formation === registrationData.department);
        if (selectedFormation && selectedFormation.frais_inscription) {
          setFormationPrice(parseInt(selectedFormation.frais_inscription, 10));
        } else {
          setFormationPrice(500); // Default
        }
      } catch (err) {
        console.error("Failed to fetch public formations for price", err);
        setFormationPrice(500);
      }
    };
    fetchPrice();
  }, [registrationData, navigate]);

  const handlePaymentInit = async () => {
    if (!selectedMethod) return;

    setIsLoading(true);
    if (selectedMethod === 'stripe') {
      try {
        const response = await axios.post('/api/payments/create-intent', {
          currency: 'gnf',
          description: 'Frais de scolarité CEGA E-Learning',
          registrationData,
        });
        
        setClientSecret(response.data.clientSecret);
      } catch (error) {
        console.error('Erreur lors de la création de la session Stripe:', error);
        showAlert('Erreur lors de l\'initialisation du paiement', 'error');
      } finally {
        setIsLoading(false);
      }
    } else {
      try {
        const response = await axios.post('/api/payments/cinetpay/init', {
          currency: 'XOF', // CinetPay sandbox usually works better with XOF/XAF for OM
          description: 'Frais de scolarité CEGA E-Learning',
          registrationData,
        });

        if (response.data && response.data.payment_url) {
          window.location.href = response.data.payment_url;
        } else {
          showAlert('Erreur: Impossible de récupérer le lien de paiement CinetPay', 'error');
        }
      } catch (error) {
        console.error('Erreur lors de la création de la session CinetPay:', error);
        showAlert('Erreur lors de l\'initialisation du paiement CinetPay', 'error');
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
                <span style={{ color: 'var(--text-secondary)' }}>Frais d'inscription</span>
                <span style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {formationPrice !== null ? `${formationPrice.toLocaleString('fr-FR')} GNF` : 'Chargement...'}
                </span>
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
                  background: selectedMethod === 'cinetpay' ? 'rgba(var(--accent-primary-rgb), 0.05)' : 'rgba(255,255,255,0.02)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                {selectedMethod === 'cinetpay' && <CheckCircle size={20} style={{ position: 'absolute', top: '10px', right: '10px', color: 'var(--accent-primary)' }} />}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <Smartphone size={32} color={selectedMethod === 'cinetpay' ? 'var(--accent-primary)' : 'var(--text-secondary)'} />
                  <span style={{ fontWeight: '500', textAlign: 'center' }}>Mobile Money</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'center' }}>Orange Money, MTN Momo</span>
                </div>
              </div>

              <div 
                onClick={() => setSelectedMethod('stripe')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0',
                  border: `2px solid ${selectedMethod === 'stripe' ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  background: selectedMethod === 'stripe' ? 'rgba(var(--accent-primary-rgb), 0.05)' : 'rgba(255,255,255,0.02)',
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
