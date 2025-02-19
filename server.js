require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
// Inisialisasi Express
const app = express();
app.use(express.json());
// Konfigurasi CORS agar lebih aman
app.use(cors({
    origin: ['http://localhost:3000'], // Ganti dengan domain frontend Anda
    methods: ['POST']
}));
// Ambil API Key dari .env
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
        if (keyword.length > 100) {
            return res.status(400).json({ error: "❌ Keyword terlalu panjang! Maksimal 100 karakter." });
        }
        console.log(`[${new Date().toISOString()}] ✅ Keyword diterima: ${keyword}`);
        // Prompt yang lebih optimal untuk OpenAI
        const prompt = `
        Buat artikel Google Discover dalam bahasa Indonesia dengan Keyword "${keyword}". 
        Tulis lebih dari 1500 kata dengan gaya Wikipedia, informatif, dan menarik perhatian.
        Buat judul utama dan subjudul setiap 3 paragraf.
        Tambahkan minimal 8 bagian dengan struktur SEO-friendly.
        Format output dalam HTML murni tanpa markdown.
        Contoh Format Output:
        <h1>Judul Artikel</h1>
        <p>paragraf</p>
        <p>paragraf</p>
        <p>paragraf</p>
        <h2>Subjudul 1</h2>
        <p>paragraf</p>
        <p>paragraf</p>
        <p>paragraf</p>
        <h2>Kesimpulan</h2>
        <p>paragraf</p>
        <p>paragraf</p>
        <p>paragraf</p>
        `;
        console.log(`[${new Date().toISOString()}] ✅ Mengirim prompt ke OpenAI...`);
        // Panggil OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 3000,
            temperature: 0.7
        });
        let htmlArticle = response.choices[0].message.content;
        // Hapus simbol pemformatan yang tidak diinginkan
        htmlArticle = htmlArticle.replace(/```html|```/g, "").trim();
        console.log(`[${new Date().toISOString()}] ✅ Artikel berhasil dibuat, panjang karakter: ${htmlArticle.length}`);
        res.json({ text: htmlArticle });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] ❌ Error OpenAI API:`, error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Terjadi kesalahan dengan OpenAI API" });
    }
});
// Jalankan Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] ✅ Backend berjalan di port ${PORT}`));