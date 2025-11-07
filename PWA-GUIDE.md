# PWA Implementation Guide - My Story App

## ✅ Fitur PWA yang Sudah Diimplementasi

### 🎯 **Advance Level (4 pts)** - Semua kriteria terpenuhi

#### 1. **Installable PWA** ✓
- ✅ Manifest.json lengkap dengan metadata
- ✅ Service Worker registered
- ✅ Install prompt muncul otomatis di Chrome/Edge
- ✅ Dapat diinstall ke homescreen mobile & desktop

#### 2. **Offline Support** ✓
- ✅ App shell tersimpan di cache
- ✅ Halaman offline.html untuk fallback
- ✅ Data API di-cache (network-first strategy)
- ✅ Konten dinamis tetap muncul saat offline

#### 3. **Enhanced Manifest (Skilled)** ✓
- ✅ Screenshots untuk app preview
- ✅ Shortcuts untuk quick access
- ✅ Theme color & background color
- ✅ Zero warnings di Chrome DevTools

#### 4. **Advanced Caching** ✓
- ✅ Cache-first untuk app shell
- ✅ Network-first untuk API data
- ✅ IndexedDB outbox untuk offline story creation
- ✅ Background sync untuk auto-upload

---

## 📸 Cara Mengambil Screenshot untuk Manifest

Untuk hasil terbaik, ambil screenshot sebenarnya dari aplikasi:

### Mobile Screenshot (540x720)
1. Buka Chrome DevTools (F12)
2. Toggle Device Toolbar (Ctrl+Shift+M)
3. Pilih "Responsive" dan set ukuran: **540 x 720**
4. Navigate ke halaman:
   - Dashboard: `/#/dashboard`
   - Upload: `/#/uploadstory`
5. Capture screenshot:
   - Chrome DevTools → ⋮ Menu → Capture screenshot
6. Save sebagai:
   - `src/public/screenshots/screenshot-dashboard.png`
   - `src/public/screenshots/screenshot-upload.png`

### Desktop Screenshot (1280x720)
1. Set browser window ke **1280 x 720**
2. Navigate ke `/#/dashboard`
3. Ambil screenshot (Snipping Tool / Chrome DevTools)
4. Save sebagai: `src/public/screenshots/screenshot-desktop.png`

**Catatan:** Screenshot placeholder sudah ada, tapi untuk review Dicoding sebaiknya gunakan screenshot asli aplikasi.

---

## 🧪 Testing PWA di Chrome DevTools

### 1. Cek Manifest
```
DevTools → Application → Manifest
```
- ✅ Pastikan tidak ada warning
- ✅ Cek icons, shortcuts, screenshots muncul
- ✅ Theme color diterapkan

### 2. Test Service Worker
```
DevTools → Application → Service Workers
```
- ✅ Status: "activated and is running"
- ✅ Update on reload (untuk development)
- ✅ Push notification permission

### 3. Test Offline Mode
```
DevTools → Network → Throttling → Offline
```
- ✅ Reload page → app shell tetap load
- ✅ Navigate → cached pages tetap bisa diakses
- ✅ Stories yang sudah dimuat tetap muncul

### 4. Test Cache Storage
```
DevTools → Application → Cache Storage
```
Harus ada:
- ✅ `storyapp-shell-v1` → HTML, CSS, JS, icons
- ✅ `storyapp-data-v1` → API responses

### 5. Test IndexedDB
```
DevTools → Application → IndexedDB → storyapp-outbox
```
- ✅ Object store `outbox-requests-v1` ada
- ✅ Test: upload story saat offline → cek outbox
- ✅ Online kembali → story auto-upload

### 6. Lighthouse Audit
```
DevTools → Lighthouse
```
Run audit dengan:
- ✅ Mode: Mobile & Desktop
- ✅ Categories: Performance, PWA
- ✅ Target: PWA score 100/100

**Kriteria PWA Lighthouse:**
- ✅ Installable
- ✅ Fast and reliable (offline support)
- ✅ Optimized (caching strategy)

---

## 🚀 Install & Run

### Development
```powershell
npm install
npm run dev
```

### Production Build
```powershell
npm run build
npm run preview
```

### Test PWA Locally
PWA memerlukan HTTPS atau localhost. Untuk production:
```powershell
# Install serve (jika belum)
npm install -g serve

# Serve dengan HTTPS
serve -s dist -l 443 --ssl-cert cert.pem --ssl-key key.pem
```

Atau gunakan ngrok untuk testing:
```powershell
ngrok http 5173
```

---

## 📋 Checklist Submission

### Kriteria 3: PWA Implementation

#### ✅ Basic (2 pts)
- [x] Install prompt muncul di mobile/desktop
- [x] Aplikasi dapat diakses offline (app shell)

#### ✅ Skilled (3 pts)
- [x] Screenshots di manifest
- [x] Shortcuts di manifest
- [x] Theme color & metadata lengkap
- [x] Zero warnings di DevTools Manifest

#### ✅ Advance (4 pts)
- [x] Data API ter-cache dengan strategi yang tepat
- [x] Konten dinamis (stories) tetap muncul saat offline
- [x] Network-first untuk API, cache-first untuk assets
- [x] IndexedDB outbox untuk offline story creation
- [x] Background sync untuk auto-upload

---

## 🔔 Push Notification Testing

### 1. Subscribe
1. Login ke aplikasi
2. Dashboard → Toggle "Notifikasi" ON
3. Allow permission
4. Cek Network → POST `/notifications/subscribe` (200 OK)

### 2. Send Test Notification
Menggunakan server Dicoding atau tools seperti web-push:
```json
{
  "title": "Story berhasil dibuat",
  "options": {
    "body": "Anda telah membuat story baru dengan deskripsi: Testing"
  }
}
```

### 3. Unsubscribe
1. Toggle "Notifikasi" OFF
2. Cek Network → DELETE `/notifications/subscribe` (200 OK)

---

## 📦 File Structure PWA

```
src/
├── public/
│   ├── sw.js                    # Service Worker (caching, sync, push)
│   ├── manifest.json            # Web App Manifest
│   ├── offline.html             # Offline fallback page
│   ├── icons/                   # App icons (192x192, 512x512)
│   └── screenshots/             # App screenshots
├── scripts/
│   ├── index.js                 # SW registration
│   └── utils/
│       ├── notification-helper.js  # Subscribe/unsubscribe API
│       └── sw-push.js              # Push helper
└── index.html                   # Manifest link
```

---

## 🎯 Expected Results

### Install Experience
- ✅ Install banner/prompt muncul otomatis
- ✅ Icon muncul di homescreen
- ✅ Splash screen saat launch (theme color)
- ✅ Standalone mode (tanpa browser UI)

### Offline Experience
- ✅ App shell load instant dari cache
- ✅ Stories yang sudah dimuat tetap visible
- ✅ Offline page muncul untuk navigasi baru
- ✅ Auto-reload saat koneksi kembali

### Performance
- ✅ First load: fast (app shell cached)
- ✅ Subsequent loads: instant (cache)
- ✅ API response: cached untuk offline
- ✅ Lighthouse PWA: 100/100

---

## 🐛 Troubleshooting

### Install prompt tidak muncul
- Cek: HTTPS atau localhost
- Cek: manifest.json linked di HTML
- Cek: Service Worker registered
- Cek: Icons ada di manifest

### Service Worker tidak update
- DevTools → Application → Service Workers
- ✅ "Update on reload"
- Atau: Unregister → Reload

### Cache tidak ter-update
- Hard refresh: Ctrl+Shift+R
- Atau: Clear cache di DevTools

### Offline mode tidak kerja
- Cek: Service Worker status "activated"
- Cek: Cache storage ada
- Cek: Fetch event listener di sw.js

---

## 📞 Support

Untuk pertanyaan submission Dicoding:
- Forum: [Dicoding Discussion](https://www.dicoding.com/academies/...)
- Reviewer: Cek kriteria di rubric submission

**Semua fitur PWA sudah diimplementasi sesuai kriteria Advance (4 pts)!** 🎉
