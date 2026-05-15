# 🕌 Masjid Tracker - Panduan Build APK Android

## Yang Dibutuhkan
- **Node.js** v18+ → https://nodejs.org
- **Android Studio** → https://developer.android.com/studio
- **JDK 17** (biasanya sudah include di Android Studio)

---

## Langkah Build APK

### 1. Install dependencies
```bash
cd masjid-tracker
npm install
```

### 2. Tambah platform Android
```bash
npx cap add android
```

### 3. Sync file web ke Android
```bash
npx cap sync android
```

### 4. Buka di Android Studio
```bash
npx cap open android
```

### 5. Build APK di Android Studio
- Tunggu Gradle sync selesai
- Menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK ada di: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Install APK ke HP
1. Copy file `app-debug.apk` ke HP
2. Buka file manager, tap APK-nya
3. Izinkan "Install dari sumber tidak dikenal" jika diminta
4. Install!

---

## Izin yang Diminta App
- **Lokasi** - untuk menampilkan posisi Anda di peta
- **Kamera** - untuk foto masjid
- **Penyimpanan** - untuk menyimpan foto dari galeri

---

## Catatan
- Data tersimpan di localStorage device (tidak hilang saat app ditutup)
- Butuh internet untuk load peta (CartoDB tiles) dan pencarian nama masjid (Nominatim)
- Untuk mode offline penuh, perlu tambahkan tile caching (pengembangan lanjutan)
