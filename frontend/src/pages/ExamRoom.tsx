import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, CheckCircle, ShieldAlert, Play, ArrowRight } from 'lucide-react';
import { usePopup } from '../contexts/PopupContext';


interface ExamEvaluation {
  id: number;
  title: string;
  duration?: string;
  [key: string]: unknown;
}

const TypewriterRule: React.FC<{ title: string, text: string, delay: number, onComplete?: () => void, fastForward?: boolean }> = ({ title, text, delay, onComplete, fastForward }) => {
  const [showTitle, setShowTitle] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  // Keep onComplete in a ref so it never causes the effect to re-fire
  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => { onCompleteRef.current = onComplete; });
  // Guard to ensure the animation only fires once
  const hasFiredRef = React.useRef(false);

  useEffect(() => {
    // Don't restart if already done
    if (hasFiredRef.current) return;

    if (fastForward) {
      hasFiredRef.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setShowTitle(true);
      setDisplayedText(text);
      if (onCompleteRef.current) onCompleteRef.current();
      return;
    }


    let interval: ReturnType<typeof setInterval>;

    const timeout = setTimeout(() => {
      setShowTitle(true);
      let i = 0;
      interval = setInterval(() => {
        setDisplayedText(text.slice(0, i + 1));
        i++;
        if (i >= text.length) {
          clearInterval(interval);
          hasFiredRef.current = true;
          if (onCompleteRef.current) onCompleteRef.current();
        }
      }, 15);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [text, delay, fastForward]);

  if (!showTitle && displayedText === '') return null;

  return (
    <li>
      <strong style={{ color: 'var(--text-primary)' }}>{title}</strong> <span style={{ color: 'var(--text-secondary)' }}>{displayedText}</span>
    </li>
  );
};

const ExamRoom: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showAlert, showConfirm } = usePopup();

  const [evaluation, setEvaluation] = useState<ExamEvaluation | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, unknown>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [userProfile, setUserProfile] = useState<{ id: number | string, firstName: string, lastName: string, email: string } | null>(null);

  // Timer state
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Exam state
  const [examStatus, setExamStatus] = useState<'intro' | 'active' | 'submitting'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isFocused, setIsFocused] = useState(document.hasFocus());

  // Anti-fraude : système de 3 avertissements
  const [warningCount, setWarningCount] = useState(0);
  const [showWarningOverlay, setShowWarningOverlay] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const warningCountRef = React.useRef(0); // ref pour accès dans les listeners
  const submittingRef = React.useRef(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const isOfflineRef = React.useRef(!navigator.onLine);
  // Typewriter animation state
  const [currentRuleIndex, setCurrentRuleIndex] = useState(0);
  const [typingComplete, setTypingComplete] = useState(false);
  const [fastForward, setFastForward] = useState(false);
  const [isRestored, setIsRestored] = useState(false);

  // Vérification de l'appareil (bloquer les mobiles)
  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      showAlert("L'examen ne peut être passé que sur un ordinateur (PC/Mac). Les appareils mobiles sont interdits pour des raisons de surveillance.", "error");
      navigate('/evaluations');
    }
  }, [navigate, showAlert]);

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await axios.get(`/api/evaluations/${id}/exam`, { withCredentials: true });
        setEvaluation(res.data.evaluation);
        setQuestions(res.data.questions);

        // Parse duration if it exists
        if (res.data.evaluation.duration && res.data.evaluation.date) {
          const durStr = res.data.evaluation.duration.toLowerCase();
          let minutes = 60; // default
          if (durStr.includes('h')) {
            const parts = durStr.split('h');
            minutes = parseInt(parts[0]) * 60 + (parts[1] ? parseInt(parts[1]) : 0);
          } else if (durStr.includes(':')) {
            const parts = durStr.split(':');
            minutes = parseInt(parts[0]) * 60 + parseInt(parts[1]);
          } else if (!isNaN(parseInt(durStr))) {
            minutes = parseInt(durStr) * 60;
          }

          const totalSeconds = minutes * 60;
          const examDate = new Date(res.data.evaluation.date);
          const now = new Date();
          const elapsedSeconds = Math.floor((now.getTime() - examDate.getTime()) / 1000);
          const remainingSeconds = Math.max(0, totalSeconds - elapsedSeconds);

          setTimeLeft(remainingSeconds);
        }

        // Initialize answers
        const initialAnswers: Record<number, unknown> = {};
        res.data.questions.forEach((q: any) => {
          if (q.type === 'QRM') initialAnswers[q.id] = [];
          else if (q.type === 'COURTE') initialAnswers[q.id] = '';
          else initialAnswers[q.id] = null;
        });
        setAnswers(initialAnswers);

      } catch (err: unknown) {
        console.error('Erreur chargement examen:', err);
        const error = err as { response?: { data?: { message?: string, score?: number, startsAt?: string }, status?: number } };
        const errorMessage = error.response?.data?.message || 'Erreur lors du chargement.';
        if (error.response?.status === 400 && error.response?.data?.score !== undefined) {
          showAlert(`Vous avez déjà passé cet examen. Votre note : ${error.response.data.score}/20`, 'error');
        } else if (error.response?.status === 403 && error.response?.data?.startsAt) {
          const startDate = new Date(error.response.data.startsAt);
          const formattedDate = startDate.toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
          showAlert(` Cet examen n'est pas encore disponible. Il débutera le ${formattedDate}.`, 'error');
        } else {
          showAlert(errorMessage, 'error');
        }
        navigate('/evaluations');
      } finally {
        setLoading(false);
      }
    };

    const fetchProfile = async () => {
      try {
        const res = await axios.get('/api/auth/profile', { withCredentials: true });
        setUserProfile(res.data);
      } catch (err) {
        console.error("Erreur profil", err);
      }
    };

    fetchExam();
    fetchProfile();
  }, [id, navigate, showAlert]);

  // --- AUTO-SAVE LOGIC ---
  // 1. Restauration de l'état sauvegardé
  useEffect(() => {
    if (userProfile?.id && id && questions.length > 0 && !isRestored) {
      const saveKey = `exam_save_${userProfile.id}_${id}`;
      const savedData = localStorage.getItem(saveKey);
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          // eslint-disable-next-line react-hooks/set-state-in-effect
          if (parsed.answers) setAnswers(parsed.answers);
          if (parsed.currentQuestionIndex !== undefined) setCurrentQuestionIndex(parsed.currentQuestionIndex);
          if (parsed.timeLeft !== undefined) setTimeLeft(parsed.timeLeft);
          if (parsed.warningCount !== undefined) {
            setWarningCount(parsed.warningCount);
            warningCountRef.current = parsed.warningCount; // sync ref
          }
        } catch (e) {
          console.error("Erreur parsing sauvegarde", e);
        }
      }
      setIsRestored(true);
    }
  }, [userProfile, id, questions.length, isRestored]);

  // 2. Sauvegarde continue de l'état
  useEffect(() => {
    if (isRestored && userProfile?.id && id) {
      const saveKey = `exam_save_${userProfile.id}_${id}`;
      const dataToSave = {
        answers,
        currentQuestionIndex,
        timeLeft,
        warningCount
      };
      localStorage.setItem(saveKey, JSON.stringify(dataToSave));
    }
  }, [answers, currentQuestionIndex, timeLeft, warningCount, isRestored, userProfile, id]);
  // -------------------------

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m ${s.toString().padStart(2, '0')}s`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (qId: number, value: unknown) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleCheckboxChange = (qId: number, optId: string) => {
    setAnswers(prev => {
      const current = prev[qId] as string[];
      if (current.includes(optId)) {
        return { ...prev, [qId]: current.filter(id => id !== optId) };
      } else {
        return { ...prev, [qId]: [...current, optId] };
      }
    });
  };



  // Soumission
  const handleSubmit = useCallback(async (autoSubmit = false, isFraud = false, fraudReason = '') => {
    if (submitting) return; // Prevent double submission

    if (!autoSubmit) {
      const confirmed = await showConfirm("Voulez-vous vraiment soumettre votre copie ? Cette action est irréversible.");
      if (!confirmed) return;
    }

    setSubmitting(true);
    setExamStatus('submitting');

    // Sortir proprement du plein écran
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }

    try {
      const payload = { answers, isFraud, fraudReason };
      const res = await axios.post(`/api/evaluations/${id}/submit-qcm`, payload, { withCredentials: true });

      // Nettoyer la sauvegarde locale après succès
      if (userProfile?.id) {
        localStorage.removeItem(`exam_save_${userProfile.id}_${id}`);
      }

      if (isFraud) {
        showAlert(`Examen annulé pour fraude. Votre note est de 0/20.`, 'error');
      } else {
        showAlert(`Examen terminé ! Votre note : ${res.data.score}/20`, 'success');
      }
      navigate('/evaluations');
    } catch (err: unknown) {
      console.error("Erreur soumission:", err);
      const error = err as { response?: { data?: { message?: string } } };
      showAlert(error.response?.data?.message || "Erreur lors de la soumission.", 'error');
      navigate('/evaluations');
    }
  }, [answers, id, navigate, showAlert, showConfirm, submitting, userProfile]);

  // Sync refs
  React.useEffect(() => { submittingRef.current = submitting; }, [submitting]);
  React.useEffect(() => { warningCountRef.current = warningCount; }, [warningCount]);

  // Anti-fraude listeners (Focus, Visibilité, et Raccourcis Clavier de Capture)
  useEffect(() => {
    if (examStatus !== 'active' || submitting) return;

    const triggerInfraction = (reason: string) => {
      if (submittingRef.current || isOfflineRef.current) return;
      const count = warningCountRef.current + 1;

      if (count < 3) {
        // Avertissement 1 ou 2 : on affiche un message et on refocus
        warningCountRef.current = count;
        setWarningCount(count);

        if (count === 1) {
          setWarningMessage(` Avertissement 1/3 — ${reason}.\n\nCeci est une infraction. À la 3ème infraction, votre examen sera verrouillé avec la note 0/20.`);
        } else {
          // Avertissement 2 : notifier l'enseignant via socket
          import('../utils/socket').then(({ default: socket }) => {
            socket.emit('fraud_warning', {
              reason,
              warning: 2,
              examId: id
            });
          });
          setWarningMessage(`Avertissement 2/3 — ${reason}.\n\nL'enseignant a été notifié en temps réel. La prochaine infraction verrouillera votre examen définitivement.`);
        }
        setShowWarningOverlay(true);
        // Refocus la fenêtre après un court délai
        setTimeout(() => { window.focus(); }, 300);
      } else {
        // 3ème infraction : verrouillage définitif
        document.body.style.backgroundColor = 'black';
        document.body.style.display = 'none';
        handleSubmit(true, true, `3ème infraction — ${reason}`);
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        triggerInfraction("Vous avez quitté l'onglet de l'examen");
      }
    };

    const handleBlur = () => {
      triggerInfraction("Perte de focus de la fenêtre (outil de capture ou clic extérieur)");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        setIsFocused(false);
        triggerInfraction("Touche de capture d'écran pressée");
      }
      // Raccourcis Windows (Win + Shift + S) ou Mac (Cmd + Shift + 4/3/5)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 's' || e.key === 'S' || e.key === '3' || e.key === '4' || e.key === '5')) {
        e.preventDefault();
        setIsFocused(false);
        triggerInfraction("Raccourci de capture d'écran pressé");
      }
      // Capture d'écran Mac raccourci direct
      if (e.metaKey && e.shiftKey) {
        e.preventDefault();
      }
      // Ctrl + P (Impression)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        setIsFocused(false);
        triggerInfraction("Tentative d'impression de la page");
      }
      // Bloquer F12 (DevTools)
      if (e.key === 'F12' || e.code === 'F12') {
        e.preventDefault();
        triggerInfraction("Tentative d'ouverture des outils de développement");
      }
    };

    const handleFocus = () => setIsFocused(true);
    const windowBlur = () => {
      setIsFocused(false);
      handleBlur();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', windowBlur);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', windowBlur);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.display = 'block';
      document.body.style.backgroundColor = '';
    };
  }, [examStatus, submitting, handleSubmit, id]);

  // Gestion des déconnexions (Wifi drop ou Socket disconnect)
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      isOfflineRef.current = true;
    };
    const handleOnline = () => {
      setIsOffline(false);
      isOfflineRef.current = false;
    };

    window.addEventListener('offline', handleOffline);
    window.addEventListener('online', handleOnline);

    let socketInstance: { on: (event: string, fn: () => void) => void, off: (event: string, fn: () => void) => void } | null = null;
    const setupSocket = async () => {
      try {
        const { default: socket } = await import('../utils/socket');
        socketInstance = socket;
        socket.on('disconnect', handleOffline);
        socket.on('connect', handleOnline);
      } catch (err) {
        console.error("Socket error", err);
      }
    };
    setupSocket();

    return () => {
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('online', handleOnline);
      if (socketInstance) {
        socketInstance.off('disconnect', handleOffline);
        socketInstance.off('connect', handleOnline);
      }
    };
  }, []);

  // Décompte du temps
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || submitting || examStatus !== 'active') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev && prev <= 1) {
          clearInterval(timer);
          handleSubmit(true); // Auto-submit time up
          return 0;
        }
        return prev ? prev - 1 : 0;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, submitting, examStatus, handleSubmit]);

  const startExam = async () => {
    try {
      const doc = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
        msRequestFullscreen?: () => Promise<void>;
      };
      if (doc.requestFullscreen) {
        await doc.requestFullscreen();
      } else if (doc.webkitRequestFullscreen) {
        await doc.webkitRequestFullscreen();
      } else if (doc.msRequestFullscreen) {
        await doc.msRequestFullscreen();
      }
    } catch (err) {
      console.warn("Fullscreen error", err);
    }
    setExamStatus('active');
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  // Fonction pour vérifier si la question actuelle a été répondue
  const isQuestionAnswered = (q: any) => {
    const ans = answers[q.id];
    if (q.type === 'VRAI_FAUX' || q.type === 'QCM') {
      return ans !== undefined && ans !== null;
    }
    if (q.type === 'QRM') {
      return Array.isArray(ans) && ans.length > 0;
    }
    if (q.type === 'COURTE') {
      return typeof ans === 'string' && ans.trim().length > 0;
    }
    return false;
  };

  if (loading) {
    return <div style={{ height: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>Préparation de l'examen...</div>;
  }

  // --- RENDU INTRO ---
  if (examStatus === 'intro') {
    return (
      <div style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', padding: '2rem', overflowY: 'auto' }}>
        <div className="glass-panel animate-fade-in" style={{ margin: 'auto', maxWidth: '800px', width: '100%', padding: 'clamp(1.5rem, 4vw, 3rem)', backgroundColor: 'var(--bg-secondary)' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 2.2rem)', color: 'var(--text-primary)', marginBottom: '1rem', textAlign: 'center' }}>{evaluation?.title}</h1>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'clamp(1rem, 3vw, 2.5rem)', flexWrap: 'wrap', marginBottom: '2.5rem', color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Clock size={20} /> Durée : {evaluation?.duration || 'Non définie'}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckCircle size={20} /> {questions.length} Questions</span>
          </div>

          <div
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '12px', padding: 'clamp(1.2rem, 3vw, 2rem)', marginBottom: '3rem', cursor: typingComplete ? 'default' : 'pointer' }}
            onClick={() => {
              if (!typingComplete) {
                setFastForward(true);
                setTypingComplete(true);
                setCurrentRuleIndex(3);
              }
            }}
          >
            <h3 style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', color: '#ef4444', margin: '0 0 1.5rem 0', fontSize: 'clamp(1.1rem, 4vw, 1.4rem)' }}>
              <ShieldAlert size={28} />
              Règles Strictes de l'Examen
              {!typingComplete && <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto', fontWeight: 'normal' }}>Cliquez pour passer l'animation</span>}
            </h3>

            <ul style={{ lineHeight: '2', margin: 0, paddingLeft: '1.5rem', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', minHeight: '300px' }}>
              {currentRuleIndex >= 0 && (
                <TypewriterRule
                  title="Plein Écran & Focus :"
                  text="L'examen s'affichera en plein écran. Vous devez impérativement fermer tous vos autres onglets et fenêtres avant de commencer."
                  delay={500}
                  fastForward={fastForward}
                  onComplete={() => { if (currentRuleIndex === 0) setCurrentRuleIndex(1); }}
                />
              )}
              {currentRuleIndex >= 1 && (
                <TypewriterRule
                  title="Tolérance Zéro (Fraude) :"
                  text="Si vous ouvrez une autre page, cliquez en dehors de la fenêtre, utilisez un outil de capture d'écran, ou recevez une notification qui coupe l'écran, l'examen s'arrêtera immédiatement et sera noté 0/20 pour fraude. Mettez votre PC en mode 'Ne pas déranger'."
                  delay={100}
                  fastForward={fastForward}
                  onComplete={() => { if (currentRuleIndex === 1) setCurrentRuleIndex(2); }}
                />
              )}
              {currentRuleIndex >= 2 && (
                <TypewriterRule
                  title="Alimentation :"
                  text="Il est fortement conseillé de brancher votre ordinateur sur secteur pour éviter toute coupure."
                  delay={100}
                  fastForward={fastForward}
                  onComplete={() => { if (currentRuleIndex === 2) setCurrentRuleIndex(3); }}
                />
              )}
              {currentRuleIndex >= 3 && (
                <TypewriterRule
                  title="Passage Séquentiel :"
                  text="Les questions s'afficheront une par une. Vous devez sélectionner une réponse pour pouvoir passer à la suite. Une fois validée, vous ne pourrez plus revenir en arrière."
                  delay={100}
                  fastForward={fastForward}
                  onComplete={() => { if (currentRuleIndex === 3) setTypingComplete(true); }}
                />
              )}
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', opacity: typingComplete ? 1 : 0, transition: 'opacity 0.5s ease', pointerEvents: typingComplete ? 'auto' : 'none' }}>
            <button
              onClick={startExam}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%', padding: 'clamp(1rem, 3vw, 1.2rem) clamp(1rem, 3vw, 3rem)', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: 'clamp(1rem, 3vw, 1.2rem)', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(var(--accent-primary-rgb), 0.4)', transition: 'transform 0.2s' }}
              onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <Play size={22} fill="white" style={{ flexShrink: 0 }} />
              <span style={{ textAlign: 'center' }}>J'ai lu et compris les règles, Commencer l'examen</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDU EXAMEN ACTIF ---
  const q = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isAnswered = q ? isQuestionAnswered(q) : false;

  return (
    <div className="exam-container" style={{ height: '100dvh', backgroundColor: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', userSelect: 'none' }}>
      <style>{`
        @media print {
          body {
            display: none !important;
            background-color: black !important;
          }
        }
        .exam-container {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>

      {/* HEADER FIXE */}
      <div style={{ position: 'sticky', top: 0, zIndex: 100, backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)' }}>{evaluation?.title}</h1>
          <div style={{ padding: '0.4rem 1rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '20px', color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 600 }}>
            Question {currentQuestionIndex + 1} sur {questions.length}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Compteur d'avertissements */}
          {warningCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', backgroundColor: warningCount === 1 ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)', color: warningCount === 1 ? '#eab308' : '#ef4444', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 700, fontSize: '0.9rem', border: `1px solid ${warningCount === 1 ? 'rgba(234,179,8,0.4)' : 'rgba(239,68,68,0.4)'}` }}>
              <ShieldAlert size={16} />
              {warningCount}/2 avert.
            </div>
          )}

          {timeLeft !== null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: timeLeft < 300 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(var(--accent-primary-rgb), 0.1)', color: timeLeft < 300 ? '#ef4444' : 'var(--accent-primary)', padding: '0.6rem 1.2rem', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
              <Clock size={20} />
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* OVERLAY D'AVERTISSEMENT */}
      {showWarningOverlay && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '3rem', maxWidth: '520px', width: '100%', border: `3px solid ${warningCount >= 2 ? '#ef4444' : '#eab308'}`, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{warningCount >= 2 ? '🚨' : '⚠️'}</div>
            <h2 style={{ color: warningCount >= 2 ? '#ef4444' : '#eab308', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
              {warningCount >= 2 ? 'Dernier Avertissement !' : 'Avertissement'}
            </h2>
            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
              {warningMessage}
            </p>
            <button
              onClick={() => {
                setShowWarningOverlay(false);
                setTimeout(() => window.focus(), 100);
              }}
              style={{ padding: '1rem 3rem', backgroundColor: warningCount >= 2 ? '#ef4444' : '#eab308', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 700, cursor: 'pointer' }}
            >
              J'ai compris, reprendre l'examen
            </button>
          </div>
        </div>
      )}

      {/* OVERLAY HORS LIGNE (DECONNEXION) */}
      {isOffline && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, backgroundColor: 'rgba(0,0,0,0.95)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ backgroundColor: 'var(--bg-secondary)', borderRadius: '16px', padding: '3rem', maxWidth: '520px', width: '100%', border: '3px solid #ef4444', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
              <ShieldAlert size={64} color="#ef4444" />
            </div>
            <h2 style={{ color: '#ef4444', marginBottom: '1.5rem', fontSize: '1.6rem' }}>
              Connexion Perdue
            </h2>
            <p style={{ color: 'var(--text-primary)', whiteSpace: 'pre-line', lineHeight: 1.7, marginBottom: '2rem', fontSize: '1rem' }}>
              Votre connexion Wi-Fi ou réseau a été interrompue. L'examen est en pause de sécurité.
              <br /><br />
              Veuillez rétablir votre connexion internet. Le système se reconnectera automatiquement et vous pourrez reprendre l'examen.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: 'var(--text-secondary)' }}>
              <div style={{ width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontWeight: 600 }}>Reconnexion en cours...</span>
            </div>
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}

      {/* CONTENU DE LA QUESTION */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: 'clamp(1.5rem, 4vw, 3rem) 1rem',
          display: 'flex',
          justifyContent: 'center',
          opacity: (isFocused && !showWarningOverlay) ? 1 : 0,
          pointerEvents: (isFocused && !showWarningOverlay) ? 'auto' : 'none',
          transition: 'opacity 0.1s ease',
        }}
      >
        <div style={{ width: '100%', maxWidth: '800px', position: 'relative', zIndex: 1 }}>

          <div style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: 'clamp(1.5rem, 4vw, 2.5rem)', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', gap: '1rem' }}>
              <h3 style={{ margin: 0, fontSize: 'clamp(1.1rem, 4vw, 1.3rem)', color: 'var(--text-primary)', lineHeight: '1.5' }}>
                <span style={{ color: 'var(--accent-primary)', marginRight: '0.75rem', fontSize: '1.5rem' }}>Q{currentQuestionIndex + 1}.</span>
                {q.question}
              </h3>
              <span style={{ fontSize: '0.9rem', backgroundColor: 'rgba(255,255,255,0.05)', padding: '0.3rem 0.8rem', borderRadius: '4px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                {q.points} pt(s)
              </span>
            </div>

            <div style={{ marginTop: '2rem' }}>
              {/* RENDU SELON LE TYPE */}

              {(q.type === 'VRAI_FAUX' || q.type === 'QCM') && q.options?.map((opt: string, idx: number) => {
                const optId = String(idx + 1); // 1-indexed to match REPONSE_CORRECTE
                return (
                  <label key={optId} style={{ display: 'block', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: answers[q.id] === optId ? 'var(--accent-primary)' : 'var(--bg-primary)', transition: 'all 0.2s' }}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={optId}
                      checked={answers[q.id] === optId}
                      onChange={() => handleAnswerChange(q.id, optId)}
                      style={{ display: 'none' }}
                    />
                    <span style={{ color: answers[q.id] === optId ? 'white' : 'var(--text-primary)', fontSize: '1.1rem' }}>{opt}</span>
                  </label>
                );
              })}

              {q.type === 'QRM' && q.options?.map((opt: string, idx: number) => {
                const optId = String(idx + 1); // 1-indexed to match REPONSE_CORRECTE
                const isChecked = (answers[q.id] as string[])?.includes(optId) || false;
                return (
                  <label key={optId} style={{ display: 'block', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', cursor: 'pointer', backgroundColor: isChecked ? 'rgba(var(--accent-primary-rgb), 0.1)' : 'var(--bg-primary)', borderColor: isChecked ? 'var(--accent-primary)' : 'var(--border-color)', transition: 'all 0.2s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleCheckboxChange(q.id, optId)}
                        style={{ transform: 'scale(1.4)' }}
                      />
                      <span style={{ color: 'var(--text-primary)', fontSize: '1.1rem' }}>{opt}</span>
                    </div>
                  </label>
                );
              })}

              {q.type === 'COURTE' && (
                <div style={{ display: 'block', padding: '1.2rem', border: '1px solid var(--border-color)', borderRadius: '8px', marginBottom: '0.75rem', backgroundColor: 'var(--bg-primary)' }}>
                  <input
                    type="text"
                    value={(answers[q.id] as string) || ''}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    placeholder="Votre réponse..."
                    style={{ width: '100%', padding: '0.8rem', fontSize: '1.1rem', backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}
                  />
                </div>
              )}


            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2.5rem', marginBottom: '4rem' }}>
            {isLastQuestion ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '1rem', width: '100%' }}>
                <button
                  onClick={() => handleSubmit()}
                  disabled={submitting || !isAnswered}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 3rem', backgroundColor: 'var(--accent-primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: (submitting || !isAnswered) ? 'not-allowed' : 'pointer', opacity: (submitting || !isAnswered) ? 0.5 : 1, boxShadow: (!submitting && isAnswered) ? '0 4px 15px rgba(var(--accent-primary-rgb), 0.4)' : 'none', transition: 'all 0.2s' }}
                >
                  <CheckCircle size={24} />
                  {submitting ? 'Envoi en cours...' : 'Soumettre ma copie et démarrer la correction'}
                </button>
              </div>
            ) : (
              <button
                onClick={handleNext}
                disabled={!isAnswered}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 3rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', cursor: !isAnswered ? 'not-allowed' : 'pointer', opacity: !isAnswered ? 0.5 : 1, boxShadow: isAnswered ? '0 4px 15px rgba(59, 130, 246, 0.4)' : 'none', transition: 'all 0.2s' }}
              >
                Question suivante
                <ArrowRight size={24} />
              </button>
            )}
          </div>

        </div>
      </div>

      {/* FILIGRANE ANTI-FRAUDE */}
      {userProfile && (
        <div style={{
          position: 'fixed',
          top: '-50%',
          left: '-50%',
          width: '200%',
          height: '200%',
          pointerEvents: 'none',
          zIndex: 9998,
          display: 'flex',
          flexWrap: 'wrap',
          opacity: 10, // Plus visible
          transform: 'rotate(-30deg)',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden'
        }}>
          {Array.from({ length: 150 }).map((_, i) => (
            <span key={i} style={{
              fontSize: '1.5rem',
              fontWeight: 'bold',
              color: 'var(--text-primary)',
              padding: '2rem 4rem',
              whiteSpace: 'nowrap'
            }}>
              {userProfile.firstName} {userProfile.lastName} - {userProfile.email}
            </span>
          ))}
        </div>
      )}

    </div>
  );
};

export default ExamRoom;
