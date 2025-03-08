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

    const trimmedKeyword = keyword.trim();
    if (trimmedKeyword.length > 100) {
      return res.status(400).json({ error: "Keyword terlalu panjang! Maksimal 100 karakter." });
    }

    console.log(`[${new Date().toISOString()}] Keyword diterima: ${trimmedKeyword}`);

    const prompt = `
      Tuliskan Artikel yang Di Optimasi SEO, Berbagai macam kata-kata unik dan flexible sepanjang 5000 kata ${trimmedKeyword}.
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
      
      Contoh Judul Utama Harus Clickbait
      
      Dari Modal Receh ke Kaya Raya! Pemain Bisa Bongkar Strategi Lucky Neko yang Bantu Ubah Hidup Dari Pertalite ke Pertamax
      
      Strategi Jitu Bermain Live Casino! Cara Menguasai Baccarat dan Roulette dengan Teknik Taruhan yang Bisa Memaksimalkan Keuntungan
      
      Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan dengan Manajemen Modal yang Efektif
      
      Gak Perlu Duit Turun Segunung! Inilah Teknik Taruhan Awal yang Dipakai Bang Topan untuk Menembus Perkalian Monster di Wild Bandito Terbukti Ampuh Berkat Panduan Admin Sekkia
      
      Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan Kamu Hanya Dengan Modal Receh Auto Jadi Jutawan
      
      Cara Hilangkan Pusing Jadi Saldo Rekening! Hanya 5 Langkah Mudah Raih Kemenangan Maksimal 250 Juta di Fortune Tiger PG Soft
      
      Teknik Bermain Jitu yang Wajib untuk Kamu Terapkan Pada Saat Bermain Mahjong Ways Dengan Menggunakan Fasilitas Disini
      
      Dikit Dikit Jadi Bukit Lama Kelamaan Jadi Naga! Ayo Buruan Gabung di Game Mahjong Ghacor Rasakan Sensasi Menang Maksimal
      
      Si Buta Gua Hantu Turun Gunung Kembali Menangkan Jackpot Fantastis Menggunakan 5 Pola Menang Maksimal Ekstrim Jepe 222 Juta di Mahjong Wins 3 Pragmatic dengan Perkalian x550!
      
      Tak Perlu Duit Segunung! Teknik Taruhan Awal yang Dipakai Bang Topan untuk Menembus Perkalian Monster di Wild Bandito Terbukti Ampuh Berkat Panduan Admin Nenthau
      
      Strategi Terbaru Mahjong Wins 3! Teknik Pola Scatter Hitam yang Bisa Menggandakan Kemenangan dengan Manajemen Modal yang Efektif
      
      Pola Mahjong Wins 3 Hari Ini Kembali Viral Hari ini Dijamin Langsung Profit Hingga Kantong Jadi Sempit
      
      Kisah Sukses Banyak Pemain Yang Dapat Scatter Hitam Mahjong Wins Dan Raih Cuan Besar Tanpa Strategi Khusus Dari Sifu Pragmatic Play
    `;

    console.log(`[${new Date().toISOString()}] Mengirim prompt ke OpenAI...`);
    const response = await openai.chat.completions.create({
      model: 'o3-mini',
      messages: [{ role: 'Owner', content: prompt }]
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
