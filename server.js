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
            Buatlah postingan blog dengan menggunakan Tag HTML yang telah dioptimalkan untuk SEO ${trimmedKeyword}.
            Tulislah dengan gaya SEO. Gunakan kata transisi. Gunakan kalimat aktif. Tulis lebih dari 2000 kata.
            Gunakan judul yang sangat kreatif dan unik untuk postingan blog.
            contoh judul:
            
            Judul Clickbait & Menarik Perhatian
            "Rahasia [Topik] yang Belum Banyak Diketahui, Wajib Coba!"
            "Inilah 7 Fakta Mengejutkan tentang [Topik] yang Jarang Diketahui!"
            "Banyak yang Salah! Ini Cara yang Benar untuk [Topik]"
            "STOP Melakukan Ini Jika Ingin [Manfaat dari Topik]!"
            
            Judul Berbasis Angka
            "10 Cara Efektif untuk [Topik] yang Terbukti Berhasil"
            "5 Kesalahan Umum dalam [Topik] dan Cara Menghindarinya"
            "7 Tips Terbaik untuk [Topik] Agar Hasilnya Maksimal"
            "15 Rekomendasi [Produk/Strategi] untuk [Topik] yang Harus Dicoba"
            
            Judul Berbasis Panduan & Cara
            "Panduan Lengkap untuk [Topik] dari Pemula hingga Mahir"
            "Bagaimana Cara [Topik] dalam 5 Langkah Mudah"
            "Langkah Demi Langkah: Cara [Topik] yang Paling Efektif"
            "Tutorial [Topik] yang Mudah Dipahami, Cocok untuk Pemula!"
            
            Judul Berbasis Perbandingan
            "Mana yang Lebih Baik? [Opsi A] vs [Opsi B] dalam [Topik]"
            "Kelebihan & Kekurangan [Topik]: Harus Dicoba atau Tidak?"
            "Kenapa [Produk/Metode A] Lebih Baik daripada [Produk/Metode B]?"
            "Perbandingan Lengkap: [Topik A] vs [Topik B], Mana yang Lebih Worth It?"
            
            Judul yang Menggunakan Sensasi atau FOMO (Fear of Missing Out)
            "Wajib Tahu! Tren [Topik] yang Sedang Viral di 2024!"
            "Jangan Sampai Ketinggalan! [Topik] yang Bisa Mengubah Hidupmu"
            "Rahasia Sukses dalam [Topik] yang Hanya Diketahui Segelintir Orang"
            "Hanya Sedikit Orang yang Tahu! Ini Trik [Topik] yang Jarang Diungkap"
            
            Judul Berbasis Studi Kasus atau Pengalaman Pribadi
            "Saya Mencoba [Topik] Selama 30 Hari, Ini Hasilnya!"
            "Dari Nol hingga Sukses: Kisah Nyata tentang [Topik]"
            "Bagaimana [Orang Sukses] Berhasil dalam [Topik]? Ini Rahasianya!"
            "Pelajaran Berharga dari Pengalaman Gagal dalam [Topik]"
            
            Buat teks mudah dipahami dan dibaca. Pastikan minimal 8 bagian. Setiap bagian harus memiliki minimal dua paragraf.
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
            temperature: 0.8,
            max_completion_tokens: 3000,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0
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
