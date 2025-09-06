import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import apiRoutes from "./routes/api.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 4000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));


app.use("/api", apiRoutes);


app.get("/", (req, res) => {
  res.render("index");
});



app.get("/emojis", async (req, res) => {
  try {
    const { search, sort, category } = req.query;

    const response = await axios.get("http://localhost:4000/api/emojis", {
      params: { search, sort, category }
    });

    res.render("emojis", { emojis: response.data });
  } catch (error) {
    res.status(500).send("Ошибка при загрузке эмодзи");
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
