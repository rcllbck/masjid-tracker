# 🕌 Masjid Tracker

Aplikasi Android untuk melacak masjid yang pernah dikunjungi dan mencatat ibadah sholat berjamaah.

## ✨ Fitur

- 🗺️ Peta interaktif untuk melihat lokasi masjid
- ➕ Tambah masjid baru via double tap peta atau tombol +
- 🙏 Catat sholat berjamaah (Subuh, Dzuhur, Ashar, Maghrib, Isya)
- ⭐ Rating masjid dengan bintang
- 📷 Foto masjid dari kamera atau galeri
- 📝 Catatan pribadi per masjid
- 📌 Tambah patokan lokasi (long press peta)
- 🔍 Cari masjid dari daftar
- 💾 Data tersimpan lokal di perangkat

  ## 📱 Screenshot

<p align="center">
  <img width= 200 alt="image" src="https://github.com/user-attachments/assets/d18c29f2-5cf6-4917-ad60-734ed77ce278" />
<img width= 200 alt="WhatsApp Image 2026-05-15 at 2 07 14 PM" src="https://github.com/user-attachments/assets/da3a8eca-7c6f-4f83-95e1-13a86bd6c63d" />

</p>

## 📥 Download APK

👉 [Download versi terbaru di Releases](../../releases)

> Install: Buka file APK di HP → izinkan install dari sumber tidak dikenal → Install

## 🛠️ Build dari Source

### Yang Dibutuhkan
- [Node.js](https://nodejs.org) v18+
- [Android Studio](https://developer.android.com/studio)

### Langkah-langkah

```bash
# 1. Clone repo
git clone https://github.com/rcllbck/masjid-tracker.git
cd masjid-tracker

# 2. Install dependencies
npm install

# 3. Tambah platform Android
npx cap add android

# 4. Sync file web
npx cap sync android

# 5. Buka di Android Studio
npx cap open android
```

Di Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

APK ada di: `android/app/build/outputs/apk/debug/`

## 🔧 Teknologi

- HTML, CSS, JavaScript
- [Leaflet.js](https://leafletjs.com) — peta interaktif
- [Capacitor](https://capacitorjs.com) — wrapper Android native
- [CartoDB](https://carto.com) — tile peta dark mode
- [Nominatim](https://nominatim.org) — pencarian nama masjid

## 📄 Lisensi

MIT License — bebas digunakan dan dimodifikasi.
