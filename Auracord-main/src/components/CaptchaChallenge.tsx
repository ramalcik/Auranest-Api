import React, { useState, useEffect, useRef } from 'react';
import { RefreshCw, Check, X, AlertTriangle, Shield, Lock } from 'lucide-react';

interface CaptchaChallengeProps {
  onSuccess: () => void;
  onCancel: () => void;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface Challenge {
  type: 'math' | 'puzzle' | 'image' | 'sequence' | 'logic';
  question: string;
  answer: string | number;
  options?: string[];
  imageUrl?: string;
  hint?: string;
}

const CaptchaChallenge: React.FC<CaptchaChallengeProps> = ({ 
  onSuccess, 
  onCancel, 
  difficulty = 'medium' 
}) => {
  const [currentChallenge, setCurrentChallenge] = useState<Challenge | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [showHint, setShowHint] = useState(false);
  const [challengeHistory, setChallengeHistory] = useState<Challenge[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxAttempts = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 2 : 1;


  const generateChallenge = (): Challenge => {
    const challenges: Challenge[] = [];

 
    if (difficulty === 'easy') {
      challenges.push(
        { type: 'math', question: '15 + 27 = ?', answer: 42 },
        { type: 'math', question: '8 × 6 = ?', answer: 48 },
        { type: 'math', question: '100 ÷ 4 = ?', answer: 25 },
        { type: 'math', question: '7² - 3 = ?', answer: 46 },
        { type: 'math', question: '√16 + 5 = ?', answer: 9 }
      );
    } else if (difficulty === 'medium') {
      challenges.push(
        { type: 'math', question: '√144 + 7² = ?', answer: 19 },
        { type: 'math', question: '3³ + 4² - 5 = ?', answer: 32 },
        { type: 'math', question: '2⁴ × 3 - 10 = ?', answer: 38 },
        { type: 'math', question: 'log₂(32) + 5 = ?', answer: 10 },
        { type: 'math', question: 'sin(90°) + cos(0°) = ?', answer: 2 },
        { type: 'math', question: 'e^(ln(5)) + 3 ≈ ?', answer: 8 }
      );
    } else {
      challenges.push(
        { type: 'math', question: 'log₂(32) + √81 = ?', answer: 14 },
        { type: 'math', question: 'sin(90°) + cos(0°) = ?', answer: 2 },
        { type: 'math', question: 'e^(ln(5)) + π ≈ ?', answer: 8 },
        { type: 'math', question: '∫x²dx (0 to 3) = ?', answer: 9 },
        { type: 'math', question: 'lim(x→0) sin(x)/x = ?', answer: 1 },
        { type: 'math', question: '∑(n=1 to 5) n² = ?', answer: 55 }
      );
    }


    if (difficulty === 'medium' || difficulty === 'hard') {
      challenges.push(
        {
          type: 'logic',
          question: 'Bir sayı dizisinde: 2, 6, 12, 20, 30, ? Sıradaki sayı nedir?',
          answer: 42,
          hint: 'Her sayı bir önceki sayıya artan bir değer eklenerek oluşuyor'
        },
        {
          type: 'logic',
          question: 'A=1, B=2, C=3 ise ABC + CBA = ?',
          answer: 444,
          hint: 'ABC = 123, CBA = 321'
        },
        {
          type: 'logic',
          question: 'Bir kelime: AURACORE. Her harf 1-26 arası sayıya karşılık geliyorsa toplamı nedir?',
          answer: 89,
          hint: 'A=1, U=21, R=18, A=1, C=3, O=15, R=18, E=5'
        }
      );
    }


    if (difficulty === 'hard') {
      challenges.push(
        {
          type: 'sequence',
          question: 'Fibonacci dizisinin 8. terimi nedir? (1,1,2,3,5,8,13,?)',
          answer: 21
        },
        {
          type: 'sequence',
          question: '2, 6, 18, 54, ? dizisinde sıradaki sayı nedir?',
          answer: 162,
          hint: 'Her sayı 3 ile çarpılıyor'
        },
        {
          type: 'sequence',
          question: '1, 4, 9, 16, 25, ? dizisinde sıradaki sayı nedir?',
          answer: 36,
          hint: 'Bu kare sayılar dizisi'
        },
        {
          type: 'sequence',
          question: '1, 3, 6, 10, 15, ? dizisinde sıradaki sayı nedir?',
          answer: 21,
          hint: 'Her sayı bir önceki sayıya artan değer ekleniyor'
        }
      );
    }


    challenges.push(
      {
        type: 'puzzle',
        question: 'Bir saatin akrep ve yelkovanı 3:15\'te kaç derece açı yapar?',
        answer: 7.5,
        hint: 'Saat başına 30°, dakika başına 6°'
      },
      {
        type: 'puzzle',
        question: 'Bir küpün köşegen uzunluğu 5√3 ise bir kenarının uzunluğu nedir?',
        answer: 5,
        hint: 'Küpün köşegeni = a√3'
      }
    );

    if (difficulty === 'hard') {
      challenges.push(
        {
          type: 'image',
          question: 'Aşağıdaki şekilde kaç tane üçgen var? (Görsel: 3 üçgen)',
          answer: 3,
          hint: 'Büyük üçgen ve içindeki küçük üçgenleri sayın'
        },
        {
          type: 'image',
          question: 'Şekilde kaç tane kare var? (Görsel: 5 kare)',
          answer: 5,
          hint: 'Farklı boyutlardaki kareleri sayın'
        }
      );
    }

    const randomChallenge = challenges[Math.floor(Math.random() * challenges.length)];
    

    if (challengeHistory.some((ch: Challenge) => ch.question === randomChallenge.question)) {
      return generateChallenge();
    }

    return randomChallenge;
  };


  const generatePuzzleImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 300;
    canvas.height = 200;

 
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, 300, 200);


    ctx.fillStyle = '#16213e';
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.arc(50 + i * 50, 100, 20 + i * 5, 0, 2 * Math.PI);
      ctx.fill();
    }


    ctx.strokeStyle = '#0f3460';
    ctx.lineWidth = 2;
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * 25);
      ctx.lineTo(300, i * 25);
      ctx.stroke();
    }


    ctx.fillStyle = '#e94560';
    ctx.font = 'bold 24px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('PUZZLE', 150, 50);
  };

  useEffect(() => {
    const newChallenge = generateChallenge();
    setCurrentChallenge(newChallenge);
    setChallengeHistory((prev: Challenge[]) => [...prev, newChallenge]);
    
    if (newChallenge.type === 'puzzle') {
      generatePuzzleImage();
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev: number) => {
        if (prev <= 1) {
          clearInterval(timer);
          onCancel();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onCancel]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentChallenge || !userAnswer.trim()) return;

    setIsLoading(true);


    setTimeout(() => {
      const isCorrect = userAnswer.trim().toLowerCase() === currentChallenge.answer.toString().toLowerCase();
      
      if (isCorrect) {
        onSuccess();
      } else {
        setAttempts((prev: number) => prev + 1);
        setUserAnswer('');
        setShowHint(false);
        
        if (attempts + 1 >= maxAttempts) {
          onCancel();
        } else {
     
          const newChallenge = generateChallenge();
          setCurrentChallenge(newChallenge);
          setChallengeHistory((prev: Challenge[]) => [...prev, newChallenge]);
          
          if (newChallenge.type === 'puzzle') {
            generatePuzzleImage();
          }
        }
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleRefresh = () => {
    const newChallenge = generateChallenge();
    setCurrentChallenge(newChallenge);
    setChallengeHistory((prev: Challenge[]) => [...prev, newChallenge]);
    setUserAnswer('');
    setShowHint(false);
    
    if (newChallenge.type === 'puzzle') {
      generatePuzzleImage();
    }
  };

  if (!currentChallenge) {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-dark-card/90 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-purple-glow/30 border-t-purple-glow rounded-full animate-spin"></div>
          </div>
          <p className="text-center text-gray-300">Doğrulama hazırlanıyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-dark-card/90 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Güvenlik Doğrulaması</h2>
              <p className="text-sm text-gray-400">AWS Güvenlik Sistemi</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-400">Kalan Süre</div>
            <div className={`text-lg font-mono ${timeLeft < 30 ? 'text-red-400' : 'text-green-400'}`}>
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
            <span>Deneme: {attempts + 1}/{maxAttempts}</span>
            <span>Zorluk: {difficulty === 'easy' ? 'Kolay' : difficulty === 'medium' ? 'Orta' : 'Zor'}</span>
          </div>
          <div className="w-full bg-gray-600/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((attempts + 1) / maxAttempts) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Challenge */}
        <div className="mb-6">
          <div className="bg-dark-card/50 border border-gray-600/20 rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-purple-glow" />
                <span className="text-sm text-gray-400 uppercase tracking-wide">
                  {currentChallenge.type === 'math' ? 'Matematik Problemi' :
                   currentChallenge.type === 'logic' ? 'Mantık Sorusu' :
                   currentChallenge.type === 'sequence' ? 'Sayı Dizisi' :
                   currentChallenge.type === 'puzzle' ? 'Görsel Bulmaca' : 'Doğrulama'}
                </span>
              </div>
              <button
                onClick={handleRefresh}
                className="p-2 text-gray-400 hover:text-white transition-colors"
                title="Yeni soru"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-4">
              <h3 className="text-lg font-semibold text-white mb-3">{currentChallenge.question}</h3>
              
              {currentChallenge.type === 'puzzle' && (
                <div className="mb-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-32 bg-gray-800 rounded-lg border border-gray-600/30"
                  />
                </div>
              )}
            </div>

            {/* Hint */}
            {currentChallenge.hint && (
              <div className="mb-4">
                <button
                  onClick={() => setShowHint(!showHint)}
                  className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {showHint ? 'İpucunu gizle' : 'İpucu göster'}
                </button>
                {showHint && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-300">{currentChallenge.hint}</p>
                  </div>
                )}
              </div>
            )}

            {/* Answer Input */}
            <form onSubmit={handleSubmit}>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Cevabınızı girin..."
                  className="flex-1 px-4 py-3 bg-dark-card/50 border border-gray-600/30 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-glow/50 focus:border-purple-glow/50 transition-all duration-300"
                  disabled={isLoading}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isLoading || !userAnswer.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl hover:from-green-600 hover:to-emerald-600 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Kontrol
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Doğrula
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Warning */}
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-orange-400 font-semibold mb-1">Güvenlik Uyarısı</h4>
              <p className="text-gray-300 text-sm">
                Bu doğrulama sistemi bot saldırılarını önlemek için tasarlanmıştır. 
                {maxAttempts - attempts - 1} deneme hakkınız kaldı.
              </p>
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <div className="flex justify-center">
          <button
            onClick={onCancel}
            className="px-6 py-3 bg-gray-600/30 text-gray-300 rounded-xl hover:bg-gray-600/50 transition-all duration-300 flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            İptal Et
          </button>
        </div>
      </div>
    </div>
  );
};

export default CaptchaChallenge; 