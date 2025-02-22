require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');

// Inisialisasi Express
const app = express();
app.use(express.json());

// Konfigurasi CORS agar lebih aman
app.use(cors({
    origin: ['https://walaoe.vercel.app'], // Ganti dengan domain frontend Anda
    methods: ['POST']
}));

// Ambil API Key dari .env dengan validasi
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("❌ ERROR: OPENAI_API_KEY tidak ditemukan di .env!");
    process.exit(1);
}

// Inisialisasi OpenAI
const openai = new OpenAI({ apiKey });

// Endpoint untuk Generate Artikel
app.post('/generate', async (req, res) => {
    try {
        const { keyword } = req.body;

        // Validasi input keyword
        if (!keyword || typeof keyword !== "string") {
            return res.status(400).json({ error: "❌ Keyword harus berupa teks!" });
        }

        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 100) {
            return res.status(400).json({ error: "❌ Keyword terlalu panjang! Maksimal 100 karakter." });
        }

        console.log(`[${new Date().toISOString()}] ✅ Keyword diterima: ${trimmedKeyword}`);

        // Prompt yang lebih optimal untuk OpenAI
        const prompt = `
        Tulis dalam Bahasa Indonesia dan jangan gunakan Markdown seperti tanda ini (# ## ###).
        Buatlah postingan blog dengan menggunakan Tag HTML yang telah dioptimalkan untuk SEO sekitar ${trimmedKeyword}.
        Tulislah dengan gaya SEO. Gunakan kata transisi. Gunakan kalimat aktif. Tulis lebih dari 1000 kata.
        Gunakan judul yang sangat kreatif untuk postingan blog. Tambahkan judul untuk setiap bagian.
        Buat teks mudah dipahami dan dibaca. Pastikan ada minimal 10 bagian.
        Setiap bagian harus memiliki minimal dua paragraf.
        Cantumkan kata kunci berikut yang telah dioptimalkan: ${trimmedKeyword}.
        Output:        
        <h1>Judul Utama</h1>
        <p>Paragraf</p>
        <p>Paragraf</p>
        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <p>Paragraf</p>
        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <p>Paragraf</p>
        <h2>Subjudul</h2>
        <li>Paragraf</li>
        <li>Paragraf</li>
        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <p>Paragraf</p>
        <h3>Subjudul</h3>
        <li>Paragraf</li>
        <li>Paragraf</li>
        <h2>Kesimpulan</h2>
        <p>Kesimpulan</p>
        `;
        console.log(`[${new Date().toISOString()}] ✅ Mengirim prompt ke OpenAI...`);

        // Panggil OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 2,
            max_completion_tokens: 12231,
            top_p: 0,
            frequency_penalty: 0,
            presence_penalty: 0
        });

        // Pastikan response memiliki konten
        if (!response.choices || !response.choices[0] || !response.choices[0].message.content) {
            throw new Error("OpenAI API tidak mengembalikan hasil yang valid.");
        }

        let htmlArticle = response.choices[0].message.content;

        // Hapus simbol pemformatan yang tidak diinginkan
        htmlArticle = htmlArticle.replace(/```html|```/g, "").trim();

        console.log(`[${new Date().toISOString()}] ✅ Artikel berhasil dibuat, panjang karakter: ${htmlArticle.length}`);

        res.json({ text: htmlArticle });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error OpenAI API:`, error.response ? error.response.data : error.message);

        let errorMessage = "Terjadi kesalahan saat membuat artikel.";
        if (error.response && error.response.status === 429) {
            errorMessage = "Terlalu banyak permintaan ke OpenAI API. Silakan coba lagi nanti.";
        }

        res.status(500).json({ error: errorMessage });
    }
});

// Jalankan Server
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] ✅ Backend berjalan di port ${PORT}`));
