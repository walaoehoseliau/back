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
        const prompt = 
                `Tulis artikel SEO sepanjang 2000 kata tentang ${trimmedKeyword} dengan gaya SEO.
                Artikel harus memiliki judul menarik Clickbait. 
                Artikel harus informatif, engaging, dan untuk menarik lebih banyak pembaca Indonesia.
                Ubah kata Slot menjadi Game!!!
                    OUTPUT:
                        <h1>Judul</h1>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>
                        <h2>Judul</h2>
                        <p>Paragraf</p>`;
        console.log(`[${new Date().toISOString()}] Mengirim prompt ke OpenAI...`);
        const response = await openai.chat.completions.create({
            model: "o1-mini",
            messages: [{ role: "user", content: prompt }],
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
