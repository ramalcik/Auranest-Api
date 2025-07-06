import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  MessageSquare, 
  Mic, 
  MicOff, 
  Headphones, 
  Volume2, 
  VolumeX,
  Calendar,
  MapPin,
  Crown,
  Shield,
  Clock,
  Activity,
  Music,
  Play,
  Pause,
  Monitor,
  Smartphone,
  Globe,
  Radio,
  Eye,
  EyeOff,
  AlertTriangle,
  Lock
} from 'lucide-react';
import ApiProxy from '../utils/apiProxy';

interface User {
  success: boolean;
  user: {
    id: string;
    globalName: string;
    displayName: string;
    avatar: string;
    Banner: string | null;
    avatarDecoration: string | null;
    status: string;
    platforms: string[];
    badges: any[] | null;
    guildStaff: any[];
    Guilds: Guild[];
    bio: string | null;
    activities: Activity[];
    spotify: SpotifyActivity | null;
    customStatus?: { text: string; emoji: string | null };
  };
  displayNames: string[];
  WhereNow: {
    type: string;
    channelName: string;
    guildName: string;
    guildId: string;
    joinedAt: string;
    icon: {
      url: string;
      format: string;
      animated: boolean;
    };
    banner: {
      url: string;
      format: string;
      animated: boolean;
    };
    members: VoiceMember[];
  } | null;
  LastSeen: {
    Message: {
      content: string;
      channelName: string;
      guildName: string;
      timestamp: string;
    };
    Voice: {
      channelName: string;
      guildName: string;
      timestamp: string;
      members: VoiceMember[];
    };
  };
  TopName: string;
  TopAge: string | number;
  TopSex: string;
  GuildStaff: any[];
}

interface Guild {
  guildName: string;
  displayName: string;
  guildId: string;
  boostCount: number;
  icon: {
    url: string;
    format: string;
    animated: boolean;
  };
  banner: {
    url: string;
    format: string;
    animated: boolean;
  } | null;
  voice: {
    totalMembers: number;
    totalUsersInVoice: number;
    totalMutedUsers: number;
    totalDeafenedUsers: number;
    totalStreamingUsers: number;
  };
  isAdmin: boolean;
  isOwner: boolean;
}

interface VoiceMember {
  id: string;
  username: string;
  displayName: string;
  avatar: string | null;
  isMuted: boolean;
  isDeafened: boolean;
  isStreaming: boolean;
}

interface Activity {
  name: string;
  type: string;
  state?: string;
  details?: string;
  url?: string | null;
}

interface SpotifyActivity {
  name: string;
  artist: string;
  albumArt: string | null;
  url: string | null;
  start: string | null;
  end: string | null;
}


const specialEffectUserIds = [
  '879720373984313495', 

];


type SpecialNameType = JSX.Element;
const getSpecialName = (name: string, userId: string): SpecialNameType => {
  if (specialEffectUserIds.includes(userId)) {
    return (
      <span className="font-extrabold text-3xl text-white drop-shadow-[0_0_8px_#faff00] glow-effect">
        <span className="mr-2 align-middle">✝</span>{name}
      </span>
    );
  }
  return <span className="font-bold text-2xl text-white">{name}</span>;
};

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rateLimitStatus, setRateLimitStatus] = useState<any>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) return;
      setIsLoading(true);
      setError(null);
      
      try {
        const apiProxy = ApiProxy.getInstance();
        const result = await apiProxy.fetchUserData(userId);
        
        if (result.success && result.data) {
          setUserData(result.data);
          setRateLimitStatus(apiProxy.getRateLimitStatus());
        } else {
          throw new Error(result.error || 'API error');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Kullanıcı bilgileri yüklenirken bir hata oluştu.';
        setError(errorMessage);
        
   
        if (errorMessage.includes('rate limit') || errorMessage.includes('Unauthorized')) {
          setTimeout(() => {
            navigate('/', { 
              state: { 
                error: 'Güvenlik doğrulaması gerekli. Lütfen tekrar deneyin.' 
              } 
            });
          }, 3000);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, [userId, navigate]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSince = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} gün önce`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-discord-green';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-discord-red';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online': return 'Çevrimiçi';
      case 'idle': return 'Boşta';
      case 'dnd': return 'Rahatsız Etmeyin';
      default: return 'Çevrimdışı';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'LISTENING': return <Music className="w-4 h-4" />;
      case 'PLAYING': return <Play className="w-4 h-4" />;
      case 'WATCHING': return <Activity className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'desktop': return <Monitor className="w-4 h-4" />;
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'web': return <Globe className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  const getPlatformText = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'desktop': return 'Masaüstü';
      case 'mobile': return 'Mobil';
      case 'web': return 'Web';
      default: return platform;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-purple-glow/30 border-t-purple-glow rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300 text-lg">Kullanıcı bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !userData?.success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-discord-red/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 text-discord-red" />
          </div>
          <p className="text-red-400 text-lg mb-4">{error || 'Kullanıcı bulunamadı'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-purple-glow hover:bg-purple-glow/90 text-white rounded-xl transition-colors"
          >
            Ana Sayfaya Dön
          </button>
        </div>
      </div>
    );
  }

  const { user } = userData;

  
  const customStatusText =
    user.customStatus?.text ||
    (user.activities?.find((a) => a.type === 'CUSTOM')?.state ?? '');

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <button
            onClick={() => navigate('/')}
            className="p-3 bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-xl hover:bg-dark-card/70 hover:border-purple-glow/30 transition-all duration-300"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-2xl font-bold text-white">Kullanıcı Profili</h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - User Profile */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl overflow-hidden animate-slide-up">
              {/* Banner */}
              {user.Banner && (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={user.Banner}
                    alt="User Banner"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-card/80 to-transparent"></div>
                </div>
              )}
              
              <div className="p-6">
                <div className="text-center">
                  {/* Avatar with decoration */}
                  <div className={`relative inline-block ${user.Banner ? '-mt-16' : ''} mb-4`}>
                    <div className="relative">
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-32 h-32 rounded-full border-4 border-purple-glow/50 bg-dark-card relative z-10"
                      />
                      {user.avatarDecoration && (
                        <div className="absolute inset-0 flex items-center justify-center z-20">
                          <img
                            src={user.avatarDecoration}
                            alt="Avatar Decoration"
                            className="w-40 h-40 pointer-events-none"
                            style={{ 
                              filter: 'drop-shadow(0 0 10px rgba(139, 92, 246, 0.3))',
                              transform: 'scale(1.1)'
                            }}
                          />
                        </div>
                      )}
                      <div className={`absolute bottom-2 right-2 w-8 h-8 ${getStatusColor(user.status)} rounded-full border-4 border-dark-card z-30`}></div>
                    </div>
                  </div>

                  {/* Profilde üstte büyük efektli isim ve @ ile gösterim */}
                  <div className="mb-2">
                    {getSpecialName(`@${user.globalName}`, user.id)}
                  </div>
                  {/* Altta normal isim gösterimi */}
                  <h2 className="text-xl font-bold text-white mb-2">{user.displayName}</h2>
                  <p className="text-gray-400 mb-1">ID: {user.id}</p>

                  {/* Status */}
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <div className={`w-3 h-3 ${getStatusColor(user.status)} rounded-full`}></div>
                    <span className="text-sm text-gray-300">{getStatusText(user.status)}</span>
                  </div>

                  {/* Platforms */}
                  {user.platforms && user.platforms.length > 0 && (
                    <div className="flex items-center justify-center gap-3 mb-4 flex-wrap">
                      {user.platforms.map((platform, index) => (
                        <div key={index} className="flex items-center gap-1 bg-dark-accent/50 px-3 py-1 rounded-full">
                          {getPlatformIcon(platform)}
                          <span className="text-xs text-gray-300">{getPlatformText(platform)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* User Info */}
                  {(userData.TopAge || userData.TopSex !== 'Belirsiz' || userData.TopName) && (
                    <div className="space-y-3 text-left">
                      {userData.TopAge && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <Calendar className="w-4 h-4 text-purple-glow" />
                          <span className="text-sm">{userData.TopAge} yaşında</span>
                        </div>
                      )}
                      {userData.TopSex !== 'Belirsiz' && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <Users className="w-4 h-4 text-blue-glow" />
                          <span className="text-sm">{userData.TopSex}</span>
                        </div>
                      )}
                      {/* TopName (ör: enes 20) efektli gösterim */}
                      {userData.TopName && (
                        <div className="flex items-center gap-3 text-gray-300">
                          <span className="text-sm">{getSpecialName(userData.TopName, user.id)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {customStatusText && (
                    <div className="flex items-center justify-center mt-2 mb-2">
                      {user.customStatus?.emoji && (
                        <span className="mr-2 text-xl">{user.customStatus.emoji}</span>
                      )}
                      <span className="text-sm text-gray-200 bg-dark-accent/60 px-3 py-1 rounded-full">
                        {customStatusText}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Current Voice Activity */}
            {userData.WhereNow && userData.WhereNow.type === 'voice' && (
              <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-discord-green/20 rounded-full flex items-center justify-center">
                    <Radio className="w-5 h-5 text-discord-green animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Şu An Sesli Kanalda</h3>
                    <p className="text-sm text-green-400">🔴 Canlı</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={userData.WhereNow.icon.url}
                      alt={userData.WhereNow.guildName}
                      className="w-8 h-8 rounded-full"
                    />
                    <div>
                      <p className="text-white font-medium">{userData.WhereNow.guildName}</p>
                      <p className="text-sm text-gray-400">{userData.WhereNow.channelName}</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Katıldı: {getTimeSince(userData.WhereNow.joinedAt)}</p>
                    <p className="text-gray-400 mt-1">{formatDate(userData.WhereNow.joinedAt)}</p>
                  </div>
                </div>

                {/* Voice Members */}
                <div className="mt-4 pt-4 border-t border-gray-600/30">
                  <p className="text-sm text-gray-400 mb-3">Kanaldaki Üyeler ({userData.WhereNow.members.length})</p>
                  <div className="space-y-2">
                    {userData.WhereNow.members.map((member) => (
                      <div key={member.id} className="flex items-center gap-3 p-2 bg-dark-accent/30 rounded-lg">
                        <div className="relative">
                          <img
                            src={member.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(member.id) % 5}.png`}
                            alt={member.displayName}
                            className="w-8 h-8 rounded-full"
                          />
                          {/* Voice status indicators */}
                          <div className="absolute -bottom-1 -right-1 flex gap-1">
                            {member.isMuted && (
                              <div className="w-4 h-4 bg-discord-red rounded-full flex items-center justify-center">
                                <MicOff className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {member.isDeafened && (
                              <div className="w-4 h-4 bg-discord-red rounded-full flex items-center justify-center">
                                <VolumeX className="w-2 h-2 text-white" />
                              </div>
                            )}
                            {member.isStreaming && (
                              <div className="w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                                <Eye className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <span className="text-sm text-gray-300">{member.displayName}</span>
                          <div className="flex gap-2 mt-1">
                            {!member.isMuted && !member.isDeafened && (
                              <span className="text-xs text-green-400">🎤 Konuşabiliyor</span>
                            )}
                            {member.isMuted && (
                              <span className="text-xs text-red-400">🔇 Susturulmuş</span>
                            )}
                            {member.isDeafened && (
                              <span className="text-xs text-red-400">🔇 Sağırlaştırılmış</span>
                            )}
                            {member.isStreaming && (
                              <span className="text-xs text-purple-400">📺 Yayında</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Activities */}
            {user.activities && user.activities.length > 0 && (
              <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-3">
                  <Activity className="w-5 h-5 text-purple-glow" />
                  Aktiviteler
                </h3>
                
                <div className="space-y-3">
                  {user.activities.map((activity, index) => (
                    <div key={index} className="bg-dark-accent/50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        {getActivityIcon(activity.type)}
                        <span className="text-sm font-medium text-white">{activity.name}</span>
                        <span className="text-xs text-gray-500 bg-gray-600/30 px-2 py-1 rounded">
                          {activity.type}
                        </span>
                      </div>
                      {activity.details && (
                        <p className="text-gray-300 text-sm mb-1">{activity.details}</p>
                      )}
                      {activity.state && (
                        <p className="text-gray-400 text-xs">{activity.state}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Spotify */}
            {user.spotify && (
              <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <Music className="w-5 h-5 text-green-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Spotify'da Dinliyor</h3>
                    <p className="text-sm text-green-400">🎵 Müzik çalıyor</p>
                  </div>
                </div>

                <div className="bg-dark-accent/50 rounded-xl p-4">
                  <div className="space-y-2">
                    <p className="text-white font-medium">{user.spotify.name}</p>
                    <p className="text-gray-400 text-sm">by {user.spotify.artist}</p>
                  </div>
                  
                  {user.spotify.albumArt && (
                    <div className="mt-3">
                      <img
                        src={user.spotify.albumArt}
                        alt="Album Art"
                        className="w-16 h-16 rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Guilds and Activity */}
          <div className="lg:col-span-2 space-y-6">
            {/* Last Activity */}
            <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-purple-glow" />
                Son Aktivite
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Last Message */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-glow" />
                    <h4 className="font-semibold text-white">Son Mesaj</h4>
                  </div>
                  <div className="bg-dark-accent/50 rounded-xl p-4">
                    <p className="text-gray-300 mb-2 break-words">"{userData.LastSeen?.Message?.content || 'Mesaj içeriği yok'}"</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="text-gray-400">#{userData.LastSeen?.Message?.channelName || 'Bilinmeyen kanal'}</p>
                      <p className="text-gray-400">{userData.LastSeen?.Message?.guildName || 'Bilinmeyen sunucu'}</p>
                      <p className="text-purple-400">{getTimeSince(userData.LastSeen?.Message?.timestamp || '')}</p>
                      <p>{formatDate(userData.LastSeen?.Message?.timestamp || '')}</p>
                    </div>
                  </div>
                </div>

                {/* Last Voice */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-5 h-5 text-discord-green" />
                    <h4 className="font-semibold text-white">Son Sesli Kanal</h4>
                  </div>
                  <div className="bg-dark-accent/50 rounded-xl p-4">
                    <p className="text-gray-300 mb-2">{userData.LastSeen?.Voice?.channelName || 'Bilinmeyen kanal'}</p>
                    <div className="text-xs text-gray-500 space-y-1">
                      <p className="text-gray-400">{userData.LastSeen?.Voice?.guildName || 'Bilinmeyen sunucu'}</p>
                      <p className="text-purple-400">{getTimeSince(userData.LastSeen?.Voice?.timestamp || '')}</p>
                      <p>{formatDate(userData.LastSeen?.Voice?.timestamp || '')}</p>
                    </div>
                    
                    {userData.LastSeen?.Voice?.members?.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-600/30">
                        <p className="text-xs text-gray-400 mb-2">O sırada kanaldaki üyeler:</p>
                        <div className="space-y-1">
                          {userData.LastSeen.Voice.members.map((member) => (
                            <div key={member.id} className="flex items-center gap-2">
                              <img
                                src={member.avatar || `https://cdn.discordapp.com/embed/avatars/${parseInt(member.id) % 5}.png`}
                                alt={member.displayName}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-xs text-gray-300">{member.displayName}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Guilds */}
            <div className="bg-dark-card/50 backdrop-blur-sm border border-gray-600/30 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-3">
                <Users className="w-6 h-6 text-purple-glow" />
                Sunucular ({user.Guilds.length})
              </h3>

              <div className="grid gap-4">
                {user.Guilds.map((guild) => (
                  <div key={guild.guildId} className="bg-dark-accent/30 border border-gray-600/20 rounded-xl overflow-hidden hover:bg-dark-accent/50 hover:border-purple-glow/30 transition-all duration-300">
                    {/* Guild Banner */}
                    {guild.banner?.url && (
                      <div className="relative h-24 overflow-hidden">
                        <img
                          src={guild.banner.url}
                          alt={`${guild.guildName} banner`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-accent/80 to-transparent"></div>
                      </div>
                    )}
                    
                    <div className="p-4">
                      <div className="flex items-start gap-4">
                        <div className="relative flex-shrink-0">
                          <img
                            src={guild.icon?.url || '/default-server-icon.png'}
                            alt={guild.guildName}
                            className={`w-16 h-16 rounded-2xl ${guild.banner?.url ? 'border-2 border-dark-card' : ''}`}
                          />
                          {guild.isOwner && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-500 rounded-full flex items-center justify-center">
                              <Crown className="w-3 h-3 text-white" />
                            </div>
                          )}
                          {guild.isAdmin && !guild.isOwner && (
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                              <Shield className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-semibold text-white mb-1">{guild.guildName}</h4>
                          <p className="text-sm text-gray-400 mb-3">Görünür İsim: {guild.displayName}</p>
                          
                          {/* Role indicators */}
                          <div className="flex gap-2 mb-3">
                            {guild.isOwner && (
                              <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full flex items-center gap-1">
                                <Crown className="w-3 h-3" />
                                Sahip
                              </span>
                            )}
                            {guild.isAdmin && !guild.isOwner && (
                              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                Yönetici
                              </span>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <p className="text-gray-400">Toplam Üye</p>
                              <p className="text-white font-semibold">{guild.voice.totalMembers}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Seste</p>
                              <p className="text-discord-green font-semibold">{guild.voice.totalUsersInVoice}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Boost</p>
                              <p className="text-purple-glow font-semibold">{guild.boostCount}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-gray-400">Yayında</p>
                              <p className="text-blue-glow font-semibold">{guild.voice.totalStreamingUsers}</p>
                            </div>
                          </div>

                          {/* Voice stats */}
                          <div className="mt-3 pt-3 border-t border-gray-600/30">
                            <div className="grid grid-cols-2 gap-4 text-xs">
                              <div className="flex items-center gap-2 text-gray-400">
                                <MicOff className="w-3 h-3" />
                                <span>Susturulmuş: {guild.voice.totalMutedUsers}</span>
                              </div>
                              <div className="flex items-center gap-2 text-gray-400">
                                <VolumeX className="w-3 h-3" />
                                <span>Sağırlaştırılmış: {guild.voice.totalDeafenedUsers}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
