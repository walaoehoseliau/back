require('dotenv').config();
const express = require('express');
const cors = require('cors');
const OpenAI = require('openai');
const app = express();
app.use(express.json());
app.use(cors({
    origin: ['https://walaoe.vercel.app'],
    methods: ['POST']
}));
const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("ERROR: OPENAI_API_KEY tidak ditemukan di .env!");
    process.exit(1);
}
const openai = new OpenAI({ apiKey });
app.post('/generate', async (req, res) => {
    try {
        const { keyword } = req.body;
        if (!keyword || typeof keyword !== "string") {
            return res.status(400).json({ error: "Keyword harus berupa teks!" });
        }
        const trimmedKeyword = keyword.trim();
        if (trimmedKeyword.length > 100) {
            return res.status(400).json({ error: "Keyword terlalu panjang! Maksimal 100 karakter." });
        }
        console.log(`[${new Date().toISOString()}] Keyword diterima: ${trimmedKeyword}`);
        const prompt = `
        Buatlah Artikel SEO menggunakan Tag HTML yang telah dioptimalkan tentang  ${trimmedKeyword}.
        Tulislah dengan nada Informatif. Gunakan kata transisi, kalimat aktif dan unik. Tulis lebih dari 1500 kata.
        Pikirkan Terlebih dahulu sebelum memberikan judul dari topik trending artikel ini dan kreatif contoh. Tambahkan judul untuk setiap bagian.
        Buat teks mudah dipahami dan dibaca. Pastikan ada minimal 10 bagian.
        Setiap bagian harus memiliki minimal dua paragraf.
        Cantumkan kata kunci berikut yang telah dioptimalkan SEO ${trimmedKeyword}.
        Tulis dalam Bahasa Indonesia.
        
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
        <p>Paragraf</p>
        <ul>
        <li>Paragraf</li>
        <li>Paragraf</li>
        <li>Paragraf</li>
        <li>Paragraf</li>
        </ul>
        
        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <p>Paragraf</p>
        
        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <ul>
        <li>Paragraf</li>
        <li>Paragraf</li>
        <li>Paragraf</li>
        </ul>

        <h2>Subjudul</h2>
        <p>Paragraf</p>
        <p>Paragraf</p>
        
        <h2>Kesimpulan</h2>
        <p>Kesimpulan</p>
        <p>Kesimpulan</p>
        `;
        console.log(`[${new Date().toISOString()}] Mengirim prompt ke OpenAI...`);
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 1.2,
            max_completion_tokens: 5000,
            top_p: 0.5,
            frequency_penalty: 1,
            presence_penalty: 1
        });
        if (!response.choices || !response.choices[0] || !response.choices[0].message.content) {
            throw new Error("OpenAI API tidak mengembalikan hasil yang valid.");
        }
        let htmlArticle = response.choices[0].message.content;
        htmlArticle = htmlArticle.replace(/```html|```/g, "").trim();
        console.log(`[${new Date().toISOString()}] Artikel berhasil dibuat, panjang karakter: ${htmlArticle.length}`);
        res.json({ text: htmlArticle });
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error OpenAI API:`, error.response ? error.response.data : error.message);
        let errorMessage = "Terjadi kesalahan saat membuat artikel.";
        if (error.response && error.response.status === 429) {
            errorMessage = "Terlalu banyak permintaan ke OpenAI API. Silakan coba lagi nanti.";
        }
        res.status(500).json({ error: errorMessage });
    }
});
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`[${new Date().toISOString()}] Backend berjalan di port ${PORT}`));
