require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ['https://walaoe.vercel.app'],
    methods: ['POST']
  })
);

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
  console.error("ERROR: OPENAI_API_KEY tidak ditemukan di .env!");
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

app.post('/generate', async (req, res) => {
  try {
    const { keyword } = req.body;
    if (!keyword || typeof keyword !== 'string') {
      return res.status(400).json({ error: "Keyword harus berupa teks!" });
    }

    const Keyword = keyword.trim();
    if (Trimeyword.length > 100) {
      return res.status(400).json({ error: "Keyword terlalu panjang! Maksimal 200 karakter." });
    }

    console.log(`[${new Date().toISOString()}] Keyword diterima: ${Trimeyword}`);

    
   const prompt = ` Tuliskan Artikel yang Di Optimasi SEO, Berbagai macam kata-kata unik dan menarik minimal 1000 kata ${Trimeyword}.
                    Artikel harus informatif dan mudah dipahami. Gunakan bahasa Indonesia yang baik dan sopan.
                    Struktur artikel SEO memiliki beragam jenis gaya penulisan sehingga artikel yang dihasilkan berkualitas tinggi.
                    Beberapa isi dalam artikel yaitu judul utama, subjudul, listicle, paragraf, dan berikan hasil terbaik versi kamu.
                    Gunakan <h1> untuk judul utama,
                    Gunakan <h2> untuk subjudul yang relevan,
                    Gunakan <p> untuk isi paragraf.
                    Gunakan <ol> untuk listicle.
                    Gunakan <ul> untuk bagian terpenting dalam makna.
                    Pastikan ada minimal 8 judul sampai 10 subjudul.
                    Berikan informasi yang mendalam dan menarik.
                    Ubah kata slot menjadi game, permainan.
                    Buat judul utama artikel dengan mode clickbait dan jangan menggunakan kata tunggal; bila perlu, buat judul bervariasi.
                    Artikel yang saya berikan di bawah ini hanyalah contoh jika ada penyampaian yang saya berikan kurang kamu mengerti.
      
                    Buat Judul Utama Clickbait dengan metode Spinning kata dan ikuti kata-kata contoh judul di bawah ini supaya lebih menarik.
      
                    Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan dengan Manajemen Modal yang Efektif
                    Strategi Jitu Bermain Live Casino! Cara Menguasai Baccarat dan Roulette dengan Teknik Taruhan yang Bisa Memaksimalkan Keuntungan
                    Dari Modal Receh ke Kaya Raya! Pemain Bisa Bongkar Strategi Lucky Neko yang Bantu Ubah Hidup Dari Pertalite ke Pertamax
                    Dari Modal Receh ke Kaya Raya! Pemain Bisa Bongkar Strategi Lucky Neko yang Bantu Ubah Hidup Dari Pertalite ke Pertamax
                    Gak Perlu Duit Turun Segunung! Inilah Teknik Taruhan Awal yang Dipakai Bang Topan untuk Menembus Perkalian Monster di Wild Bandito Terbukti Ampuh Berkat Panduan Admin Sekkia
                    Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan Kamu Hanya Dengan Modal Receh Auto Jadi Jutawan
                    Cara Hilangkan Pusing Jadi Saldo Rekening! Hanya 5 Langkah Mudah Raih Kemenangan Maksimal 250 Juta di Fortune Tiger PG Soft
                    Teknik Bermain Jitu yang Wajib untuk Kamu Terapkan Pada Saat Bermain Mahjong Ways Dengan Menggunakan Fasilitas Disini
                    Dikit Dikit Jadi Bukit Lama Kelamaan Jadi Naga! Ayo Buruan Gabung di Game Mahjong Ghacor Rasakan Sensasi Menang Maksimal
                    Si Buta Gua Hantu Turun Gunung Kembali Menangkan Jackpot Fantastis Menggunakan 5 Pola Menang Maksimal Ekstrim Jepe 222 Juta di Mahjong Wins 3 Pragmatic dengan Perkalian x550!
                    Tak Perlu Duit Segunung! Teknik Taruhan Awal yang Dipakai Bang Topan untuk Menembus Perkalian Monster di Wild Bandito Terbukti Ampuh Berkat Panduan Admin Nenthau
                    Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan dengan Manajemen Modal yang Efektif
                    Pola Mahjong Wins 3 Hari Ini Kembali Viral Hari ini Dijamin Langsung Profit Hingga Kantong Jadi Sempit
                    Contoh Judul gunakan kata-kata Clikbait dan unik berikut contohnya judul yang diinginkan:
                    Bagaimana Hujan Maxwin Hingga Rp500 Juta Menerjang di Mahjong Ways? Kang Asep Ungkap Pola Gacor yang Selalu Berhasil. Simak Caranya!
                    Menurut Pengamat Geologi Rian Arifin! Orang sukses Bermain Olympus Xmas 1000 Biasa Mempunyai Kebiasaan Mengulangi Buy Spin Sebanyak 5X
                    Raih Sensasi Kemenangan Luar Biasa di Princess 1000 Strategi Jitu untuk Meraih Keuntungan 711 Juta
                    Apa yang Membuat 5 Shio Ini Berhasil Meraih Kekayaan di Mahjong Ways 2? Kesabaran atau Keberuntungan?
                    Ingin Tahun 2025 Penuh Kebahagiaan? Temukan 6 Shio Hoki yang Dapat Membawa Kemakmuran di Mahjong Ways 3!
                    Jalan Ninja Sukses Mudah! Kisah Inspiratif Kang Asep Tinggalkan Game Lama dan Wujudkan Kekayaan Instan dalam Sehari Lewat Mahjong Ways
                    Penghasilan Tak Terduga! Tangis Bahagia Master Topan, Impiannya Wujud Berkat Mahjong Ways. Kini Sukses Jalankan Usaha Besar yang di Idamkan
                    Pemanggil Scatter Jepe Modal Kecil Mahjong Ways 2 Menggila di Setiap Putaran
                    Rahasia Jackpot di Mahjong Wins3 Settingan Bet Pemicu Black Scatter!
                    Rahasia Menang Banyak di Scatter Mahjong Ways! Yuk Coba Trik Anti Boncos Terbaik!
                    Mungkinkah Zeus di Gates of Olympus Suka Kaget?Master Topan Klaim Hasilkan Rp500 Juta dari Petir Maxwin di Jam Gacor, Katanya Putu Sampai Malu Kena Spin Receh
                    Pengaruh Permainan pada Pemilihan Jam Gacor yang Benar untuk Mendapatkan Maxwin dengan Cepat dan Mudah yang Dipadukan dengan RTP Live yang Akurat
                    Benarkah Modal Receh Bisa Jadi Rp400 Juta? Kisah Kuli Bangunan Raih Maxwin Berkat RTP Live dan Pola Gacor Mahjong Wins3, Ini Rahasianya
                    Terbaru! Simpelnya Taktik Gacor Mahjong Ways 3 Memudahkan Munculnya Jackpot Tiada Henti Khusus Hari Ini! Informasi Gacor
                    Turunnya Scatter dengan Sambarang Petir Maut Gates of Olympus Pola Gacor Bang Danru Semakin Mudah Maxwin dengan Cepat dari Hasil RTP LIVE yang Akurat
                    Main Mahjong Ways Scatter Hitam di Bet 1000 dengan RTP Live Akurat dan Tempo Spin yang Benar Dijamin 100% Dapatkan Maxwin Spektakuler
                    Bocoran RTP Game Gacor Malam Ini Di Provider Pragmatic Play Bisa Ciptakan Cuan Besarmu
                    Inovasi Baru dalam Mahjong Ways Kombinasi Tempo Spin dan RTP LIVE untuk Kemenangan Besar 
                    Dewa Keberuntungan Dikemas Maxwin Total Sweet Bonanza Xmas Paling Tinggi Live RTP dalam  Dipenghujung Tahun 2025
                    Selpot Kini Merubah Cara Main Mahjong Ways Dengan Menggunakan Pola Popot Dan Jam Gacor Hanya 12 Kali Spin Auto Sultan!
                    Kisah Sukses Banyak Pemain Yang Dapat Scatter Hitam Mahjong Wins Dan Raih Cuan Besar Tanpa Strategi Khusus Dari Sifu Pragmatic Play`;

    console.log(`[${new Date().toISOString()}] Mengirim prompt ke OpenAI...`);
    const response = await openai.chat.completions.create({
    model: 'o3-mini',
      messages: [{ role: 'user', content: prompt }]
    });

    if (!response.choices || !response.choices[0] || !response.choices[0].message.content) {
      throw new Error("OpenAI API tidak mengembalikan hasil yang valid.");
    }

    let htmlArticle = response.choices[0].message.content;
    htmlArticle = htmlArticle.replace(/```html|```/g, "").trim();
    console.log(`[${new Date().toISOString()}] Artikel berhasil dibuat, panjang karakter: ${htmlArticle.length}`);
    res.json({ text: htmlArticle });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] Error OpenAI API:`,
      error.response ? error.response.data : error.message
    );
    let errorMessage = "Terjadi kesalahan saat membuat artikel.";
    if (error.response && error.response.status === 429) {
      errorMessage = "Terlalu banyak permintaan ke OpenAI API. Silakan coba lagi nanti.";
    }
    res.status(500).json({ error: errorMessage });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => console.log(`[${new Date().toISOString()}] Backend berjalan di port ${PORT}`));
