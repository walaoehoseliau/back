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
        Create a blog post that has been optimized for SEO about ${trimmedKeyword}. Write it in a SEO tone. Use transition words. Use active voice. Write over 1000 words. Use very creative titles for the blog post. Add a title for each section. Make the text easy to understand and read. Ensure there are a minimum of 10 sections. Each section should have a minimum of two paragraphs. Include the following keywords that have been optimized: ${trimmedKeyword}. Write In Indonesia Language.
        `;

        console.log(`[${new Date().toISOString()}] ✅ Mengirim prompt ke OpenAI...`);

        // Panggil OpenAI API
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 3000,
            temperature: 0.9
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
