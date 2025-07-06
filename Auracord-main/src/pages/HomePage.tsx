import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Users, MessageSquare, ExternalLink, Shield, Zap, Eye, Lock, Globe, Code, Copyright, AlertTriangle } from 'lucide-react';
import AuraCoreLogo from '../components/AuraCoreLogo';
import CaptchaChallenge from '../components/CaptchaChallenge';
import SecurityNotice from '../components/SecurityNotice';

const HomePage: React.FC = () => {
  const [discordId, setDiscordId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showCaptcha, setShowCaptcha] = useState(false);
  const [captchaDifficulty, setCaptchaDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();


  useEffect(() => {
    if (location.state?.error) {
      setErrorMessage(location.state.error);
   
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!discordId.trim()) return;


    setShowCaptcha(true);
  };

  const handleCaptchaSuccess = () => {
    setShowCaptcha(false);
    setIsLoading(true);
    

    setTimeout(() => {
      navigate(`/profile/${discordId.trim()}`);
      setIsLoading(false);
    }, 1000);
  };

  const handleCaptchaCancel = () => {
    setShowCaptcha(false);
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Sunucu Bilgileri",
      description: "Kullanıcının dahil olduğu sunucuları görüntüle"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "Son Aktivite",
      description: "Son mesajlar ve voice chat bilgileri"
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "Profil Detayları",
      description: "Avatar, banner ve rozet bilgileri"
    }
  ];

  const advancedFeatures = [
    {
      icon: <Eye className="w-5 h-5" />,
      title: "Gerçek Zamanlı Takip",
      description: "Kullanıcının anlık durumu ve aktiviteleri"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Güvenli API",
      description: "Discord'un resmi API'sini kullanarak güvenli veri erişimi"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Hızlı Sorgulama",
      description: "Optimize edilmiş veri getirme ve önbellekleme"
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Çoklu Platform",
      description: "Desktop, mobil ve web platformlarında çalışır"
    },
    {
      icon: <Lock className="w-5 h-5" />,
      title: "Gizlilik Odaklı",
      description: "Kullanıcı verilerini saklamaz, sadece görüntüler"
    },
    {
      icon: <Code className="w-5 h-5" />,
      title: "Profesyonel Geliştirme",
      description: "Özel lisans ile korumalı kaynak kod"
    }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <AuraCoreLogo size="xl" animated={true} />
          </div>
          
          <p className="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
            Discord kullanıcı bilgilerini keşfedin. Profil detayları, sunucu bilgileri ve daha fazlası için Discord ID'nizi girin.
          </p>

          {/* Discord Server Link */}
          <div className="mb-6">
            <a
              href="https://discord.gg/auranest"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 px-6 py-4 bg-discord-blurple hover:bg-discord-blurple/90 text-white rounded-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
              <span className="font-semibold">Discord Sunucumuza Katıl</span>
              <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>
        </div>

        {/* Search Form */}
        <div className="mb-16 animate-slide-up">
          {/* Error Message */}
          {errorMessage && (
            <div className="max-w-md mx-auto mb-6">
              <SecurityNotice
                type="error"
                title="Güvenlik Hatası"
                message={errorMessage}
              />
            </div>
          )}

          {/* Security Warning */}
          <div className="max-w-md mx-auto mb-6">
            <SecurityNotice
              type="warning"
              title="Güvenlik Doğrulaması"
              message="Kullanıcı araması yapmak için bu sorular çöz benzeri güvenlik doğrulamasından geçmeniz gerekmektedir."
            />
          </div>

          {/* Difficulty Selection */}
          <div className="max-w-md mx-auto mb-6">
            <div className="bg-dark-card/30 backdrop-blur-sm border border-gray-600/20 rounded-xl p-4">
              <h4 className="text-white font-semibold mb-3 text-center">Doğrulama Zorluğu</h4>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'easy', label: 'Kolay', color: 'from-green-500 to-emerald-500' },
                  { value: 'medium', label: 'Orta', color: 'from-yellow-500 to-orange-500' },
                  { value: 'hard', label: 'Zor', color: 'from-red-500 to-pink-500' }
                ].map((level) => (
                  <button
                    key={level.value}
                    onClick={() => setCaptchaDifficulty(level.value as 'easy' | 'medium' | 'hard')}
                    className={`p-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                      captchaDifficulty === level.value
                        ? `bg-gradient-to-r ${level.color} text-white shadow-lg`
                        : 'bg-dark-card/50 text-gray-400 hover:text-white hover:bg-dark-card/70'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="relative max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={discordId}
                onChange={(e) => setDiscordId(e.target.value)}
                placeholder="Discord ID girin (örn: 879720373984313495)"
                className="w-full pl-12 pr-4 py-4 bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-glow/50 focus:border-purple-glow/50 transition-all duration-300"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !discordId.trim()}
              className="w-full mt-4 py-4 bg-gradient-to-r from-purple-glow to-blue-glow text-white font-semibold rounded-2xl hover:from-purple-glow/90 hover:to-blue-glow/90 focus:outline-none focus:ring-2 focus:ring-purple-glow/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Aranıyor...
                </div>
              ) : (
                'Kullanıcı Ara'
              )}
            </button>
          </form>
        </div>

        {/* Main Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 bg-dark-card/30 backdrop-blur-sm border border-gray-600/20 rounded-2xl hover:bg-dark-card/50 hover:border-purple-glow/30 transition-all duration-300 group"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-purple-glow/20 to-blue-glow/20 text-purple-glow mb-4 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Advanced Features */}
        <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Gelişmiş Özellikler</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              AuraCore, Discord kullanıcı keşfi için en gelişmiş araçları sunar
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {advancedFeatures.map((feature, index) => (
              <div
                key={index}
                className="p-4 bg-dark-card/20 backdrop-blur-sm border border-gray-600/20 rounded-xl hover:bg-dark-card/40 hover:border-purple-glow/20 transition-all duration-300 group"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-glow/20 to-blue-glow/20 flex items-center justify-center text-purple-glow group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-1">{feature.title}</h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* License & Legal */}
        <div className="mb-16 animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <div className="bg-dark-card/30 backdrop-blur-sm border border-gray-600/20 rounded-2xl p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-white mb-2 flex items-center justify-center gap-3">
                <Copyright className="w-6 h-6 text-orange-500" />
                Lisans ve Yasal Bilgiler
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-orange-500" />
                    🔒 Özel Lisans
                  </h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Bu yazılım özel lisans altında korunmaktadır. Kaynak kod ve fikri mülkiyet hakları 
                    realnagatso'ya aittir. İzinsiz kullanım, kopyalama veya dağıtım yasaktır.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">🔒 Gizlilik Politikası</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Kullanıcı verilerini saklamıyoruz. Tüm bilgiler Discord'un resmi API'si 
                    üzerinden gerçek zamanlı olarak alınır ve görüntülenir. Kişisel veriler korunur.
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">⚖️ Kullanım Şartları</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Bu hizmet yalnızca yasal amaçlar için kullanılabilir. Discord'un Hizmet Şartları'na 
                    uygun kullanım zorunludur. Kötüye kullanım tespit edildiğinde erişim engellenebilir.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">🛡️ Sorumluluk Reddi</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">
                    Bu araç eğitim ve araştırma amaçlıdır. Elde edilen bilgilerin kötüye kullanımından, 
                    veri kaybından veya hizmet kesintilerinden sorumlu değiliz.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-600/30">
              <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Copyright className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-orange-400 font-semibold mb-2">Telif Hakkı Bildirimi</h4>
                    <p className="text-gray-300 text-sm leading-relaxed">
                      © 2025 AuraCore - Tüm hakları saklıdır. Bu yazılımın kaynak kodu, tasarımı ve 
                      algoritmaları realnagatso'nun fikri mülkiyetidir. İzinsiz kullanım yasal işlem gerektirir.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                Bu proje Discord Inc. ile bağlantılı değildir. Discord, Discord Inc.'in ticari markasıdır.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center mb-12 animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={() => navigate('/profile/879720373984313495')}
            className="inline-flex items-center px-6 py-3 bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-xl text-gray-300 hover:text-white hover:border-purple-glow/30 transition-all duration-300"
          >
            <AuraCoreLogo size="sm" showText={false} className="mr-2" />
            Demo Profili Görüntüle
          </button>
        </div>

        {/* Footer - Credits */}
        <div className="mt-16 pt-8 border-t border-gray-600/30 text-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-glow to-blue-glow rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">R</span>
              </div>
              <div className="text-left">
                <p className="text-gray-300 font-medium">realnagatso tarafından yapıldı</p>
                <p className="text-gray-500 text-sm">AuraCore Discord User Discovery System</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm text-gray-400 flex-wrap justify-center">
              <span>© 2025 AuraCore</span>
              <span>•</span>
              <a 
                href="https://discord.gg/auranest" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-purple-glow transition-colors"
              >
                Discord Sunucusu
              </a>
              <span>•</span>
              <span className="text-purple-glow">v1.0.0</span>
              <span>•</span>
              <span className="text-orange-400 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Proprietary License
              </span>
            </div>
          </div>
        </div>

        {/* CAPTCHA Challenge */}
        {showCaptcha && (
          <CaptchaChallenge
            onSuccess={handleCaptchaSuccess}
            onCancel={handleCaptchaCancel}
            difficulty={captchaDifficulty}
          />
        )}
      </div>
    </div>
  );
};

export default HomePage;
