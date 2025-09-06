import express from "express";
import axios from "axios";

const router = express.Router();
const EMOJI_URL = "https://emojihub.yurace.pro/api/all";


let cache = { ts: 0, data: null };
const TTL = 1000 * 60 * 10;

async function fetchAll() {
  if (cache.data && Date.now() - cache.ts < TTL) return cache.data;
  const r = await axios.get(EMOJI_URL, { timeout: 10000 });
  cache = { ts: Date.now(), data: r.data };
  return r.data;
}

// возвращает весь набор
router.get("/emojis", async (req, res) => {
  try {
    let items = await fetchAll();

    const { search, category, sort } = req.query;

    if (search) {
      const q = String(search).toLowerCase();
      items = items.filter(e => String(e.name || "").toLowerCase().includes(q));
    }
    if (category) {
      items = items.filter(e => String(e.category || "").toLowerCase() === String(category).toLowerCase());
    }

    if (sort === "name_asc") {
      items.sort((a,b) => String(a.name).localeCompare(String(b.name)));
    } else if (sort === "name_desc") {
      items.sort((a,b) => String(b.name).localeCompare(String(a.name)));
    } else if (sort === "category") {
      items.sort((a,b) => String(a.category).localeCompare(String(b.category)));
    }

    res.json(items);
  } catch (err) {
    console.error("API /emojis error:", err.message);
    res.status(502).json({ error: "Ошибка при получении эмодзи" });
  }
});

// уникальные категории
router.get("/categories", async (req, res) => {
  try {
    const items = await fetchAll();
    const cats = [...new Set(items.map(e => e.category).filter(Boolean))].sort((a,b) => a.localeCompare(b));
    res.json(cats);
  } catch (err) {
    console.error("API /categories error:", err.message);
    res.status(502).json({ error: "Ошибка при получении категорий" });
  }
});

export default router;
