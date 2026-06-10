const fs = require('fs');

const file = 'C:/Users/alber/Documents/GitHub/CEGA_E_Learning/frontend/src/components/LessonIA_Geo_S1.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace(/import '\.\/LessonIA\.css';/, "import './LessonIA.css';\nimport { quizDataS1, QuizQuestion } from '../data/quizData_S1';");

// 2. Remove the old quizData constant entirely
// It starts with "const quizData = [" and ends with "];\n\n  const [quizAnswers"
content = content.replace(/const quizData = \[[\s\S]*?\];\n\n  const \[quizAnswers/, "const [quizAnswers");

// 3. Add the new state and logic
const newLogic = `const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);

  useEffect(() => {
    if (activeTab === 's7' && currentQuiz.length === 0) {
      const shuffled = [...quizDataS1].sort(() => 0.5 - Math.random());
      setCurrentQuiz(shuffled.slice(0, 5));
    }
  }, [activeTab, currentQuiz.length]);

  const restartQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    const shuffled = [...quizDataS1].sort(() => 0.5 - Math.random());
    setCurrentQuiz(shuffled.slice(0, 5));
    window.scrollTo(0, 0);
  };`;

content = content.replace(/const \[quizAnswers, setQuizAnswers\] = useState<Record<number, number>>\(\{\}\);\n  const \[quizSubmitted, setQuizSubmitted\] = useState\(false\);/, newLogic);

// 4. Update references from quizData to currentQuiz
content = content.replace(/quizData\.forEach/g, "currentQuiz.forEach");
content = content.replace(/quizData\.map/g, "currentQuiz.map");

// 5. Update the "Reprendre le quiz" button to use restartQuiz()
// The button has:
// setQuizAnswers({});
// setQuizSubmitted(false);
// window.scrollTo(0,0);
const oldButtonLogic = `setQuizAnswers({});
                    setQuizSubmitted(false);
                    window.scrollTo(0,0);`;
                    
content = content.replace(oldButtonLogic, `restartQuiz();`);

fs.writeFileSync(file, content);
console.log('Quiz logic updated');
