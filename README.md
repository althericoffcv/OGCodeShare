# Code Share Zone — OG Image Generator + Public API

Website full-stack dan Public API production-ready untuk menghasilkan Open Graph (OG) Image 1200×630 beresolusi tinggi dengan estetika Neo-Brutalism presisi tinggi untuk data **Product** dan **Snippet**.

Frontend dan backend terintegrasi penuh dalam **SATU Next.js application** (App Router) pada **SATU deployment/domain**.

---

## 🚀 Fitur Utama & Arsitektur

1. **Rendering Engine Presisi Tinggi (@napi-rs/canvas + Skia)**
   - Menggunakan engine native Skia via `@napi-rs/canvas` untuk menghasilkan gambar PNG 1200×630 px berkecepatan tinggi dengan rendering sub-piksel presisi.
   - Tipografi sans-serif lokal dibundel (`Inter-Bold`, `Inter-SemiBold`, `Inter-Regular`, `Inter-ExtraBold`) di `public/fonts/`.
   - Asset resmi Favicon C asli (`lumi_1792957534396_487fc8f8.jpeg`) dan Sample Product Image (`lumi_1785927127089_c63f4979.jpg`) dibundel secara lokal di `public/assets/` dengan cache aman.

2. **Dukungan Format Gambar Fleksibel (HTTPS URL & Base64 Data URL)**
   - Mendukung remote HTTPS image URL.
   - **Mendukung Base64 Data URL** (`data:image/png;base64,...` atau `data:image/jpeg;base64,...`) maupun raw Base64 string.
   - Di frontend tersedia tombol **"Upload Image"** yang otomatis mengonversi gambar lokal dari perangkat/HP menjadi Base64 tanpa perlu upload ke hosting eksternal.

3. **Dukungan Multi-Metode API (POST & GET)**
   - **POST (Utama & Rekomendasi)**: Mengirim JSON payload lengkap di request body, cocok untuk teks panjang, gambar Base64, dan payload custom.
   - **GET (Opsional)**: Menggunakan query parameters (misal: `GET /api/og/product?name=...&price=...`), sangat praktis disematkan langsung di `<meta property="og:image" content="...">` atau tag HTML `<img>`.

4. **Desain Neo-Brutalism (Sesuai Referensi)**
   - **Product OG Template**:
     - Background default: Bright Purple (`#9700FF`).
     - Main Card putih (`1080×510 px`) dengan border hitam 4px, rounded corners 20px, dan solid black offset shadow (tanpa blur).
     - Badge hitam di kiri atas: `"Code Share Zone"`.
     - Judul besar bold dengan auto-font scaling & wrapping engine.
     - Deskripsi abu-abu gelap dengan controlled ellipsis.
     - Divider abu-abu muda & domain `"codeshare.zone.id"`.
     - Harga bold `"Rp 45.000"` sejajar dengan tombol hitam `"Buy Now"`.
     - Kotak gambar produk di kolom kanan (`480×431 px`) dengan `object-fit: cover` dan rounded corners 16px.
     - Favicon C asli di atas sudut kiri atas kotak gambar.
   - **Snippet OG Template**:
     - Background default: Bright Yellow (`#FFC900`).
     - Badge `"Code Share Zone"`, judul snippet, deskripsi, divider, domain.
     - Nama author di kiri bawah sejajar dengan tombol `"Get Snippet"`.
     - Visual fallback code editor neo-brutalist jika `authorImage` tidak diisi.
     - Favicon C asli di atas gambar.

5. **Security & SSRF Protection Ketat (`src/lib/security/`)**
   - Pemblokiran menyeluruh untuk hostname dan IP privat/internal (Loopback `127.0.0.1`, RFC1918 `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, CGNAT `100.64.0.0/10`, AWS/GCP metadata `169.254.169.254`, IPv6 `::1`, `fc00::/7`, `fe80::/10`).
   - Resolusi DNS sebelum fetch dengan pemeriksaan setiap IP hasil resolve.
   - Redirect tracker manual dibatasi maksimal 3 kali.
   - Batas ukuran gambar maksimal 5 MB dan timeout 7 detik.
   - Validasi Magic Bytes (PNG, JPEG, WebP, GIF) untuk mencegah eksekusi skrip berbahaya.
   - Rate limiting (60 request/menit per IP) dengan header `X-RateLimit-*`.

---

## 📡 Public API Reference

Base URL: `http://localhost:3000` (atau domain deployment)

### 1. Generate Product OG Image via POST (Rekomendasi)
- **Endpoint**: `POST /api/og/product`
- **Content-Type**: `application/json`
- **Response**: `image/png` (1200×630)

Contoh Body dengan **HTTPS URL**:
```bash
curl -X POST "http://localhost:3000/api/og/product" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raiden Ai V19",
    "description": "Bot Whatsapp Raiden Ai Memiliki Banyak Fitur, Terdiri dari fitur Ai, Downloader, DLL",
    "price": "Rp 45.000",
    "image": "https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg"
  }' \
  --output product-og.png
```

Contoh Body dengan **Base64 Data URL**:
```bash
curl -X POST "http://localhost:3000/api/og/product" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Raiden Ai V19",
    "description": "Bot Whatsapp Raiden Ai",
    "price": "Rp 45.000",
    "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  }' \
  --output product-og.png
```

### 2. Generate Product OG Image via GET (Untuk Embed HTML)
```bash
curl "http://localhost:3000/api/og/product?name=Raiden+Ai+V19&description=Bot+WhatsApp&price=Rp+45.000&image=https://api.lumi-base.my.id/imgurl/lumi_1785927127089_c63f4979.jpg" \
  --output product-get.png
```

### 3. Generate Snippet OG Image via POST
```bash
curl -X POST "http://localhost:3000/api/og/snippet" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "All In One Downloader",
    "description": "All in one is....",
    "author": "Bayu Official"
  }' \
  --output snippet-og.png
```

### 4. Universal Generate (JSON Base64 / Binary)
- **Endpoint**: `POST /api/og/generate`
- **Request**:
```json
{
  "type": "product",
  "data": {
    "name": "Raiden Ai V19",
    "description": "Bot WhatsApp",
    "price": "Rp 45.000",
    "image": "https://example.com/product.jpg"
  },
  "responseType": "base64"
}
```

### 5. Health Check
- **Endpoint**: `GET /api/health`
- **Response**: `{ "success": true, "service": "Code Share Zone OG Generator", "status": "ok" }`

---

## 🧪 Testing & Verification

```bash
# Menjalankan seluruh test suite (16 tests pass)
npm test

# Menjalankan pemeriksaan tipe TypeScript (0 errors)
npm run typecheck

# Menjalankan production build
npm run build
```
