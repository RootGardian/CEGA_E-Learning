import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';

import axios from 'axios';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const tx = searchParams.get('tx');

  const [loading, setLoading] = useState(true);
  const [verifiedStatus, setVerifiedStatus] = useState<string | null>(status);

  useEffect(() => {
    const verifyTransaction = async () => {
      if (tx) {
        try {
          const res = await axios.get(`/api/payments/cinetpay/status/${tx}`);
          if (res.data.status === 'succeeded') {
            setVerifiedStatus('success');
          } else if (res.data.status === 'failed') {
            setVerifiedStatus('failed');
          }
        } catch (error) {
          console.error("Erreur lors de la vérification:", error);
        }
      }
      setLoading(false);
    };

    verifyTransaction();
  }, [tx]);

  if (loading) {
    return (
      <div className="auth-layout" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div style={{ color: 'var(--text-primary)' }}>Vérification du paiement en cours...</div>
      </div>
    );
  }

  const isSuccess = verifiedStatus === 'success';

  return (
    <div className="auth-layout">
      <div className="auth-container glass-panel animate-slide-up" style={{ maxWidth: '500px', textAlign: 'center' }}>
        {isSuccess ? (
          <>
            <CheckCircle size={64} color="var(--accent-primary)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h1 className="gradient-text" style={{ marginBottom: '1rem' }}>Paiement Réussi !</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Votre paiement a été traité avec succès. Votre compte a été créé et activé. Vous pouvez dès à présent vous connecter.
              <br /><br />
              <small>Transaction ID: {tx}</small>
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/login')} style={{ width: '100%', justifyContent: 'center' }}>
              Se connecter <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          </>
        ) : (
          <>
            <XCircle size={64} color="var(--error-color)" style={{ margin: '0 auto 1.5rem auto' }} />
            <h1 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Paiement Échoué</h1>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Nous n'avons pas pu valider votre paiement. Veuillez réessayer.
              <br /><br />
              <small>Transaction ID: {tx}</small>
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/payment-gateway')} style={{ width: '100%', justifyContent: 'center' }}>
              Réessayer le paiement <ArrowRight size={20} style={{ marginLeft: '0.5rem' }} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentCallback;
