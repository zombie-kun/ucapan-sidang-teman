# Surat Selamat Sidang — Website Hadiah Interaktif 🌸

Website hadiah digital bertema "Surat Ucapan Selamat Sidang" — amplop premium yang terbuka menjadi
surat, disusul galeri kenangan, timeline perjalanan, kutipan, dan penutup yang hangat.
Dibangun dengan **HTML5, CSS3, dan Vanilla JavaScript** (tanpa framework), memakai **GSAP**,
**AOS**, dan **canvas-confetti** melalui CDN.

## Struktur folder

```
gift-website/
├── index.html          # struktur halaman & semua konten teks
├── style.css            # seluruh desain, warna, tipografi, animasi CSS
├── script.js             # logika interaksi: amplop, surat, galeri, musik, confetti
├── README.md
└── assets/
    ├── images/          # foto galeri kenangan (memory-01.jpg, memory-02.jpg, ...)
    ├── music/           # musik latar (background-music.mp3)
    ├── fonts/           # (opsional) font lokal jika tidak memakai Google Fonts
    └── icons/           # (opsional) ikon tambahan
```

## 1. Cara menjalankan website

Karena semua file bersifat statis, cukup buka `index.html` langsung di browser,
atau — lebih disarankan — jalankan local server agar path gambar/musik lebih stabil:

```bash
# dengan Python
python3 -m http.server 8000
# lalu buka http://localhost:8000

# atau dengan VS Code
# klik kanan index.html → "Open with Live Server"
```

## 2. Cara mengganti isi surat

Buka `index.html`, cari bagian `LETTER STAGE`:

```html
<p class="letter-kop">Untuk seseorang yang telah berjuang,</p>
<h2 class="letter-name">{{NAMA}}</h2>
<div id="letter-body" class="letter-body">{{ISI_SURAT}}</div>
```

- Ganti `{{NAMA}}` dengan nama temanmu.
- Ganti `{{ISI_SURAT}}` dengan isi surat. **Pisahkan setiap paragraf dengan baris kosong**
  (tekan Enter dua kali) — setiap paragraf akan muncul satu per satu dengan animasi fade,
  persis seperti membaca surat sungguhan.
- Judul tab browser (`<title>`) juga memuat `{{NAMA}}`, boleh diganti juga.

## 3. Cara mengganti foto galeri

1. Simpan foto ke folder `assets/images/`.
2. Di `index.html`, cari `#gallery-grid`. Setiap foto adalah satu blok:

```html
<figure class="gallery-item" data-aos="fade-up">
  <img src="assets/images/memory-01.jpg" alt="Kenangan 1" loading="lazy">
</figure>
```

3. Duplikasi blok `<figure>` tersebut sebanyak foto yang kamu punya, lalu ubah `src` dan `alt`.
   Layout galeri (masonry) otomatis menyesuaikan berapa pun jumlah foto — tidak ada batas praktis,
   direkomendasikan hingga puluhan foto agar tetap ringan dimuat.
4. Foto otomatis memakai *lazy loading*, jadi tidak akan memperlambat waktu buka halaman.

## 4. Cara mengganti musik

1. Simpan file musik (format `.mp3`) ke `assets/music/`.
2. Beri nama file persis `background-music.mp3`, **atau** ubah nama file di `index.html`:

```html
<audio id="bg-music" loop preload="none">
  <source src="assets/music/NAMA-FILE-KAMU.mp3" type="audio/mpeg">
</audio>
```

Musik tidak akan diputar otomatis saat halaman dibuka (mengikuti kebijakan browser modern).
Musik mulai diputar begitu pengunjung menekan tombol **"Buka Surat"**, dan bisa
dijeda/dinyalakan kapan saja lewat tombol musik mengambang di pojok kanan bawah.

## 5. Cara mengubah warna tema

Semua warna terpusat di bagian atas `style.css`, dalam blok `:root { ... }`:

```css
:root{
  --cream:      #FBF6EC;
  --warm-white: #FFFDF8;
  --beige:      #F3E9D8;
  --soft-pink:  #F3D6DA;
  --blush:      #EFC3CB;
  --gold:       #C7A369;
  --rose-gold:  #C68B85;
  --ink:        #3B2B28;  /* warna teks utama */
  --ink-soft:   #7A655F;  /* warna teks sekunder */
}
```

Ubah nilai hex di sana — seluruh halaman (tombol, amplop, teks, latar) akan otomatis mengikuti,
karena semua elemen memakai variabel warna ini, bukan warna yang ditulis manual berulang-ulang.

## 6. Cara mengganti font

Font diambil dari Google Fonts di `<head>` `index.html`. Ganti tautan `<link>` Google Fonts,
lalu perbarui nama font di `style.css`:

```css
--font-display: 'Playfair Display', 'Cormorant Garamond', serif; /* judul */
--font-script:  'Great Vibes', cursive;                          /* nama & tanda tangan */
--font-body:    'Poppins', 'Inter', sans-serif;                  /* isi teks */
```

## 7. Deploy ke GitHub Pages

```bash
git init
git add .
git commit -m "Surat selamat sidang"
git branch -M main
git remote add origin https://github.com/USERNAME/NAMA-REPO.git
git push -u origin main
```

Lalu di GitHub: **Settings → Pages → Source: `main` branch, folder `/root`** → Save.
Website akan tersedia di `https://USERNAME.github.io/NAMA-REPO/`.

## 8. Deploy ke Netlify

- **Cara tercepat**: buka [app.netlify.com/drop](https://app.netlify.com/drop) dan seret (drag & drop)
  seluruh folder `gift-website` ke halaman tersebut.
- **Atau via Git**: hubungkan repository GitHub kamu di Netlify → New site from Git →
  build command kosongkan, publish directory diisi `.` (folder root), lalu Deploy.

## 9. Deploy ke Vercel

```bash
npm i -g vercel
cd gift-website
vercel
```

Ikuti instruksi di terminal (pilih project baru, root directory `.`). Setelah selesai,
Vercel akan memberikan URL live. Atau, impor repository GitHub kamu langsung dari
dashboard [vercel.com/new](https://vercel.com/new) — tidak perlu setting build khusus
karena ini adalah situs statis murni.

## Catatan teknis

- Tidak menggunakan React/Vue — murni HTML/CSS/JS agar mudah diedit siapa saja.
- Animasi memakai GSAP + AOS + Canvas API (untuk kelopak sakura & confetti), dimuat via CDN.
- Menghormati preferensi `prefers-reduced-motion` pengguna.
- Gambar galeri saat ini adalah *placeholder* bergradasi pastel — ganti dengan foto asli
  mengikuti langkah di bagian 3.
- Struktur kode dikomentari per bagian di `script.js` dan `style.css` agar mudah ditelusuri.

Selamat mengedit dan semoga hadiahnya berkesan! 🌸
