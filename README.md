# Discord Api ve Auracord-main

Bu repoda iki farklı sistemin detaylı açıklamalarını, kurulum adımlarını ve çalışma prensiplerini bulabilirsiniz.

---

## Discord Api

### Amaç
Discord Api, Discord sunucuları için kullanıcı ve sunucu aktivitelerini izleyen, güncelleyen ve çeşitli otomasyonlar sağlayan bir Node.js tabanlı API sistemidir.

### Özellikler
- Kullanıcı güncellemeleri (kullanıcı adı, profil resmi vs.)
- Sunucuya katılan/ayrılan üyelerin takibi
- Sesli kanala giriş/çıkış güncellemeleri
- Webhook ile bildirimler
- MongoDB ile veri saklama

### Kurulum
1. Depoyu klonla veya dosyaları indir.
2. Komut satırında Discord Api klasörüne gir:
   ```sh
   cd "Discord Api"
   ```
3. Bağımlılıkları yükle:
   ```sh
   npm install
   ```
4. Ayarları yap:
   `config.json` dosyasını düzenleyerek gerekli API anahtarlarını ve bağlantı bilgilerini gir.
5. Başlat:
   ```sh
   node API.js
   ```

### Çalışma Şekli
- Sistem başlatıldığında Discord sunucusundaki aktiviteleri otomatik olarak izler ve günceller.
- Webhook ile belirlenen kanallara bildirim gönderir.

### Dosya Yapısı
- `API/` : Ana API dosyaları
- `Models/` : MongoDB modelleri
- `src/` : Ekstra yardımcı dosyalar ve güncellemeler

---

## Auracord-main

### Amaç
Auracord, Discord benzeri bir arayüz sunan, kullanıcı dostu ve güvenli bir web uygulamasıdır. Modern teknolojilerle geliştirilmiştir.

### Özellikler
- Kullanıcı profili görüntüleme
- Captcha ile güvenlik
- Modern ve responsive arayüz (React + TailwindCSS)
- API proxy ile backend bağlantısı

### Kurulum
1. Depoyu klonla veya dosyaları indir.
2. Komut satırında Auracord-main klasörüne gir:
   ```sh
   cd Auracord-main
   ```
3. Bağımlılıkları yükle:
   ```sh
   npm install
   ```
4. Geliştirme sunucusunu başlat:
   ```sh
   npm run dev
   ```
5. Tarayıcıda aç:
   ```
   http://localhost:5173
   ```

### Çalışma Şekli
- Kullanıcılar web arayüzü üzerinden giriş yapabilir, profillerini görüntüleyebilir.
- Captcha ile güvenlik sağlanır.
- API proxy ile backend sistemine istekler iletilir.

### Dosya Yapısı
- `src/components/` : React bileşenleri
- `src/pages/` : Sayfa bileşenleri
- `src/utils/` : Yardımcı fonksiyonlar

### API ile Bağlantı (Veri Çekme)
Auracord-main, arka planda Discord Api (veya başka bir backend) ile haberleşerek veri çeker. Bu bağlantı, `src/utils/apiProxy.ts` dosyasında tanımlanır. Burada, API'ye yapılacak isteklerin adresi ve doğrulama işlemleri yönetilir.

- API adresini ve bağlantı ayarlarını değiştirmek için `src/utils/apiProxy.ts` dosyasını düzenleyebilirsiniz.
- Frontend (site) tarafında veri çekmek için genellikle bu dosyadaki fonksiyonlar kullanılır.
- Örnek kullanım:
  ```ts
  import apiProxy from '../utils/apiProxy';
  // Kullanıcı verisi çekmek için:
  const userData = await apiProxy.getUser(userId);
  ```
- API adresi genellikle backend'in çalıştığı sunucuya göre ayarlanır (örn: `http://localhost:3000/api`).

Daha fazla detay ve özelleştirme için `src/utils/apiProxy.ts` dosyasını inceleyebilirsiniz.

### API Proxy Yönlendirmesi (Proxy Ayarı)

Auracord-main projesinde, frontend (site) tarafından atılan `/api` ile başlayan tüm istekler doğrudan backend'e (ör: Discord Api) yönlendirilmez. Bunun yerine, geliştirme ortamında Vite'ın proxy özelliği kullanılır. Bu sayede, site içinden yapılan istekler backend sunucusuna otomatik olarak iletilir.

#### Nasıl Çalışır?
- `vite.config.ts` dosyasında aşağıdaki gibi bir proxy ayarı bulunur:
  ```js
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  ```
- Yani, site içinden `/api/...` şeklinde yapılan her istek, otomatik olarak `http://localhost:3000/api/...` adresine yönlendirilir.
- Örneğin, frontend'den `/api/user?id=123` isteği atılırsa, bu istek arka planda `http://localhost:3000/api/user?id=123` adresine gider.

#### Neden Proxy Kullanılır?
- Geliştirme ortamında CORS (cross-origin) hatalarını önler.
- Frontend ve backend'i ayrı çalıştırırken, sanki aynı sunucudaymış gibi kolayca veri alışverişi yapılmasını sağlar.

#### Kısaca Akış
1. React uygulaması içinden `/api` ile başlayan bir istek atılır.
2. Vite'ın proxy ayarı sayesinde bu istek otomatik olarak backend sunucusuna yönlendirilir.
3. Backend'den gelen cevap, frontend'e iletilir.

Daha fazla bilgi için `vite.config.ts` dosyasını inceleyebilirsiniz.

---

Her iki sistem için de katkı sağlamak isterseniz, pull request ve issue açabilirsiniz.

**Lisans:** MIT 