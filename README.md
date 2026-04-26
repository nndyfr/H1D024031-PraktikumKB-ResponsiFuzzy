# HemoScan (Sistem Deteksi Risiko Anemia Berbasis Logika Fuzzy)

Sistem inferensi fuzzy berbasis web untuk mendeteksi tingkat risiko anemia secara dini menggunakan metode **Fuzzy Mamdani**.

---

## Identitas Mahasiswa

| Keterangan | Detail |
|---|---|
| **Nama** | Nindy Alif Romland |
| **NIM** | H1D024031 |
| **Shift KRS** | A |
| **Shift Baru** | F |
| **Program Studi** | Informatika |
| **Fakultas** | Fakultas Teknik, Universitas Jenderal Soedirman |
| **Mata Kuliah** | Praktikum Kecerdasan Buatan |

---

## Deskripsi Proyek

HemoScan adalah sistem deteksi dini risiko anemia berbasis logika fuzzy yang berjalan sepenuhnya di browser tanpa memerlukan server atau instalasi tambahan. Sistem menerima tiga input klinis, yaitu kadar hemoglobin, skor gejala, dan durasi keluhan, lalu memprosesnya menggunakan mesin inferensi Fuzzy Mamdani dengan 16 aturan fuzzy untuk menghasilkan nilai risiko anemia pada skala 0–100.

Output sistem dikategorikan ke dalam empat tingkat risiko: Rendah, Sedang, Tinggi, dan Sangat Tinggi, disertai rekomendasi tindakan medis yang sesuai. Sistem ini bersifat indikatif dan tidak menggantikan diagnosis tenaga medis profesional.

---

## Fitur Utama

- **Input interaktif** berupa slider untuk hemoglobin dan durasi keluhan, serta tombol pilihan gejala
- **Mesin fuzzy Mamdani** lengkap dengan fuzzifikasi, evaluasi 16 aturan, agregasi, dan defuzzifikasi COG (Centroid of Gravity)
- **Visualisasi hasil** berupa progress bar tingkat risiko beserta nilai defuzzifikasi numerik
- **Rekomendasi otomatis** berdasarkan kategori risiko yang dihasilkan
- **Reset & analisis ulang** tanpa reload halaman
- Antarmuka responsif, berjalan 100% di sisi klien (pure HTML/CSS/JS)

---

## Variabel dan Himpunan Fuzzy

### Input 1 Kadar Hemoglobin (g/dL) | rentang: 0–15

| Himpunan | Fungsi | Parameter |
|---|---|---|
| Berat | Trapesium | [0, 0, 6, 9] |
| Sedang | Segitiga | [7, 9, 11] |
| Ringan | Segitiga | [9, 11, 13] |
| Normal | Trapesium | [11, 13, 15, 15] |

### Input 2 Skor Gejala (jumlah gejala) | rentang: 0–10

| Himpunan | Fungsi | Parameter |
|---|---|---|
| Jarang | Trapesium | [0, 0, 2, 4] |
| Kadang | Segitiga | [2, 4, 6] |
| Sering | Segitiga | [4, 6, 8] |
| Sangat Sering | Trapesium | [6, 8, 10, 10] |

Gejala yang dinilai: pucat/kuku pucat, lemas & mudah lelah, pusing, sesak napas ringan, jantung berdebar, sulit konsentrasi, kuku rapuh, lidah nyeri/licin, tangan & kaki dingin, nyeri dada saat aktivitas.

### Input 3 Durasi Keluhan (minggu) | rentang: 1–6

| Himpunan | Fungsi | Parameter |
|---|---|---|
| Baru | Trapesium | [1, 1, 2, 3] |
| Sedang | Segitiga | [2, 3, 5] |
| Lama | Trapesium | [4, 5, 6, 6] |

### Output Tingkat Risiko Anemia | rentang: 0–100

| Himpunan | Fungsi | Parameter |
|---|---|---|
| Rendah | Trapesium | [0, 0, 15, 28] |
| Sedang | Segitiga | [20, 38, 56] |
| Tinggi | Segitiga | [48, 64, 80] |
| Sangat Tinggi | Trapesium | [72, 84, 100, 100] |

### Aturan Fuzzy (16 Aturan)

| No | Hemoglobin | Gejala | Durasi | Output |
|---|---|---|---|---|
| 1 | Berat | Sangat Sering | Lama | Sangat Tinggi |
| 2 | Berat | Sering | Lama | Sangat Tinggi |
| 3 | Berat | Sangat Sering | Sedang | Sangat Tinggi |
| 4 | Berat | Kadang | Sedang | Tinggi |
| 5 | Berat | Jarang | Baru | Tinggi |
| 6 | Sedang | Sangat Sering | Lama | Tinggi |
| 7 | Sedang | Sering | Sedang | Tinggi |
| 8 | Sedang | Sering | Lama | Tinggi |
| 9 | Sedang | Kadang | Baru | Sedang |
| 10 | Sedang | Jarang | Baru | Sedang |
| 11 | Ringan | Sangat Sering | Sedang | Sedang |
| 12 | Ringan | Sering | Baru | Sedang |
| 13 | Ringan | Kadang | Baru | Sedang |
| 14 | Normal | Jarang | — | Rendah |
| 15 | Normal | Kadang | Baru | Rendah |
| 16 | Ringan | Jarang | Baru | Rendah |

Operator AND menggunakan fungsi **minimum**, defuzzifikasi menggunakan metode **Centroid of Gravity (COG)** dengan 401 titik diskretisasi (x = 0.0 s.d. 100.0, step 0.25).

---

## Teknologi yang Digunakan

| Teknologi | Keterangan |
|---|---|
| HTML5 | Struktur antarmuka |
| CSS3 | Styling dan animasi (custom properties, flexbox, grid) |
| Vanilla JavaScript (ES6+) | Mesin fuzzy dan logika interaksi |
| Google Fonts | Tipografi (Playfair Display, Plus Jakarta Sans) |

Tidak menggunakan framework atau library eksternal apapun — seluruh logika fuzzy diimplementasikan secara manual dalam `script.js`.

---

## Instalasi Lokal

Proyek ini tidak memerlukan instalasi atau server karena berjalan sepenuhnya di browser.

**Langkah menjalankan:**

```bash
# 1. Clone atau extract repository
git clone <url-repo>
cd "Fuzzy Anemia"

# 2. Buka langsung di browser
# Klik dua kali file index.html, atau:
open index.html          # macOS
start index.html         # Windows
xdg-open index.html      # Linux
```

> Tidak diperlukan `npm install`, `pip install`, atau konfigurasi apapun.

---

## Struktur Folder

```
Fuzzy Anemia/
├── index.html      # Halaman utama antarmuka sistem
├── style.css       # Seluruh styling dan layout
└── script.js       # Mesin fuzzy Mamdani dan logika interaksi
```

---

## Disclaimer

Hasil analisis HemoScan bersifat **indikatif** dan **tidak menggantikan diagnosis dokter**. Selalu konsultasikan kondisi kesehatan Anda kepada tenaga medis profesional.