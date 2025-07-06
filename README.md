# Discord Tracking Bot

Discord sunucularındaki kullanıcı aktivitelerini takip eden gelişmiş bir bot. Hem Discord.js v14 hem de Discord selfbot kullanarak kapsamlı izleme yapar.

## 🚀 Özellikler

### 📊 Takip Edilen Aktivite Türleri
- **Mesaj Aktivitesi**: Gönderilen, düzenlenen ve silinen mesajlar
- **Ses Aktivitesi**: Ses kanallarına girme/çıkma, süre takibi
- **Durum Değişiklikleri**: Online/offline/idle/dnd durumları
- **Aktivite Değişiklikleri**: Oyun oynama, müzik dinleme vb.
- **Son Görülme Zamanları**: Kullanıcıların son aktif olduğu zamanlar

### 🗄️ Veri Saklama
- **MongoDB** veritabanı ile güvenli veri saklama
- Kullanıcı profilleri ve aktivite geçmişi
- Otomatik veri temizleme (30 gün eski veriler)

### 🤖 Çift Bot Sistemi
- **Discord.js v14**: Resmi bot API'si ile güvenli izleme
- **Discord Selfbot**: Ek izleme kapasitesi için

## 📋 Gereksinimler

- Node.js 16.x veya üzeri
- MongoDB veritabanı
- Discord Bot Token
- Discord Selfbot Token (opsiyonel)

## 🛠️ Kurulum

### 1. Projeyi İndirin
```bash
git clone <repository-url>
cd discord-track-bot
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
```

### 3. MongoDB Kurulumu
MongoDB'yi yerel olarak kurun veya MongoDB Atlas kullanın:
```bash
# Yerel MongoDB kurulumu (Ubuntu/Debian)
sudo apt update
sudo apt install mongodb

# MongoDB'yi başlatın
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 4. Konfigürasyon
`config.json` dosyasını düzenleyin:

```json
{
  "botToken": "YOUR_BOT_TOKEN_HERE",
  "selfbotToken": "YOUR_SELFBOT_TOKEN_HERE",
  "prefix": "!",
  "mongoUri": "mongodb://localhost:27017/discord_tracker",
  "logChannelId": "YOUR_LOG_CHANNEL_ID",
  "trackedServers": [
    "SERVER_ID_1",
    "SERVER_ID_2"
  ],
  "trackedUsers": [
    "USER_ID_1",
    "USER_ID_2"
  ],
  "enableVoiceTracking": true,
  "enableMessageTracking": true,
  "enablePresenceTracking": true,
  "enableActivityTracking": true
}
```

### 5. Discord Bot Token Alma
1. [Discord Developer Portal](https://discord.com/developers/applications)'a gidin
2. Yeni bir uygulama oluşturun
3. Bot sekmesine gidin ve bot oluşturun
4. Token'ı kopyalayın ve `config.json`'a ekleyin
5. Gerekli izinleri verin:
   - Read Messages
   - Send Messages
   - View Channels
   - Voice States
   - Presence Intent
   - Server Members Intent

### 6. Botu Başlatın
```bash
npm start
```

## 📝 Komutlar

### Temel Komutlar
- `!help` - Yardım menüsünü gösterir
- `!track <kullanıcı_id>` - Kullanıcıyı takip listesine ekler
- `!userinfo <kullanıcı_id>` - Kullanıcı bilgilerini gösterir
- `!serverinfo [sunucu_id]` - Sunucu aktivitelerini gösterir
- `!voiceinfo [sunucu_id]` - Aktif ses kullanıcılarını gösterir

### Örnek Kullanım
```
!track 123456789012345678
!userinfo 123456789012345678
!serverinfo 987654321098765432
!voiceinfo
```

## 📊 Veritabanı Şemaları

### UserActivity (Kullanıcı Aktivitesi)
```javascript
{
  userId: String,
  username: String,
  serverId: String,
  serverName: String,
  activityType: String, // message, voice_join, voice_leave, presence_change, activity_change
  details: Object,
  timestamp: Date
}
```

### UserProfile (Kullanıcı Profili)
```javascript
{
  userId: String,
  username: String,
  discriminator: String,
  avatar: String,
  createdAt: Date,
  lastSeen: Date,
  totalMessages: Number,
  totalVoiceTime: Number,
  servers: Array
}
```

### VoiceActivity (Ses Aktivitesi)
```javascript
{
  userId: String,
  username: String,
  serverId: String,
  serverName: String,
  channelId: String,
  channelName: String,
  joinTime: Date,
  leaveTime: Date,
  duration: Number,
  isActive: Boolean
}
```

### Message (Mesaj)
```javascript
{
  messageId: String,
  userId: String,
  username: String,
  serverId: String,
  serverName: String,
  channelId: String,
  channelName: String,
  content: String,
  timestamp: Date,
  attachments: Array,
  mentions: Array,
  edited: Boolean,
  deleted: Boolean
}
```

## 🔧 Gelişmiş Konfigürasyon

### Takip Edilen Sunucuları Ayarlama
`config.json` dosyasında `trackedServers` dizisine sunucu ID'lerini ekleyin:
```json
"trackedServers": [
  "123456789012345678",
  "987654321098765432"
]
```

### Takip Edilen Kullanıcıları Ayarlama
`config.json` dosyasında `trackedUsers` dizisine kullanıcı ID'lerini ekleyin:
```json
"trackedUsers": [
  "111111111111111111",
  "222222222222222222"
]
```

### İzleme Özelliklerini Açma/Kapama
```json
{
  "enableVoiceTracking": true,
  "enableMessageTracking": true,
  "enablePresenceTracking": true,
  "enableActivityTracking": true
}
```

## ⚠️ Güvenlik Uyarıları

1. **Selfbot Kullanımı**: Discord selfbot kullanımı Discord ToS'a aykırı olabilir. Kendi sorumluluğunuzda kullanın.
2. **Token Güvenliği**: Bot tokenlarınızı asla paylaşmayın veya public repository'lere yüklemeyin.
3. **Veri Gizliliği**: Takip edilen verilerin gizliliğini koruyun ve yasal sınırlar içinde kullanın.

## 🐛 Sorun Giderme

### MongoDB Bağlantı Hatası
```bash
# MongoDB servisinin çalıştığını kontrol edin
sudo systemctl status mongodb

# MongoDB'yi yeniden başlatın
sudo systemctl restart mongodb
```

### Bot Bağlantı Hatası
- Bot token'ının doğru olduğunu kontrol edin
- Bot'un gerekli izinlere sahip olduğunu kontrol edin
- Bot'un sunucuya eklendiğini kontrol edin

### Selfbot Bağlantı Hatası
- Selfbot token'ının doğru olduğunu kontrol edin
- Selfbot hesabının 2FA'sının kapalı olduğunu kontrol edin

## 📈 Performans Optimizasyonu

### Veritabanı İndeksleri
MongoDB'de performans için aşağıdaki indeksleri oluşturun:
```javascript
// UserActivity koleksiyonu için
db.useractivities.createIndex({ "userId": 1, "timestamp": -1 })
db.useractivities.createIndex({ "serverId": 1, "timestamp": -1 })

// Message koleksiyonu için
db.messages.createIndex({ "userId": 1, "timestamp": -1 })
db.messages.createIndex({ "serverId": 1, "timestamp": -1 })
```

### Bellek Optimizasyonu
- Periyodik temizlik işlemlerini aktif tutun
- Eski verileri düzenli olarak arşivleyin
- MongoDB bağlantı havuzu boyutunu ayarlayın

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## ⚖️ Yasal Uyarı

Bu bot sadece eğitim ve kişisel kullanım amaçlıdır. Discord'un Kullanım Şartları'na uygun kullanım kullanıcının sorumluluğundadır. Geliştirici, bu botun kötüye kullanımından sorumlu değildir. 