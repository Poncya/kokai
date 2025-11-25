// routes/index.js
const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// 一覧表示 GET /
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" }, // 新しい順
    });

    res.render("index", {
      posts,            
      error: null,      
      message: null,    
      old: { title: "", date: "", body: "" }, // 再表示用データ
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("サーバーエラーが発生しました。");
  }
});

// 新規投稿 POST /
router.post("/", async (req, res) => {
  const title = (req.body.title || "").trim();
  const date  = (req.body.date  || "").trim(); // "YYYY-MM-DD"想定
  const body  = (req.body.body  || "").trim();

  if (!title || !date || !body) {
    // 入力不足 → エラー表示しつつ一覧へ
    try {
      const posts = await prisma.post.findMany({
        orderBy: { id: "desc" },
      });

      return res.status(400).render("index", {
        posts,
        error: "タイトル・投稿日・内容はすべて必須です。",
        message: null,
        old: { title, date, body },
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("サーバーエラーが発生しました。");
    }
  }

  try {
    // DBに保存
    await prisma.post.create({
      data: {
        title,
        date, // Prisma側では String 型
        body,
      },
    });

    // 保存後、再度一覧をDBから取得して表示（
    const posts = await prisma.post.findMany({
      orderBy: { id: "desc" },
    });

    return res.render("index", {
      posts,
      error: null,
      message: "投稿しました。",
      old: { title: "", date: "", body: "" },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("サーバーエラーが発生しました。");
  }
});

// 検索 POST /search
router.post("/search", async (req, res) => {
  const keyword = (req.body.keyword || "").trim();

  if (!keyword) {
    
    return res.render("search", {
      keyword: "",
      results: [],
      notice: "キーワードを入力してください。",
    });
  }

  try {
    const results = await prisma.post.findMany({//プリズマを使って保存する
      where: {
        OR: [
          {
            title: {
              contains: keyword,
            },
          },
          {
            body: {
              contains: keyword,
            },
          },
        ],
      },
      orderBy: { id: "desc" },
    });

    return res.render("search", {
      keyword,
      results,
      notice: results.length === 0 ? "該当する記事はありませんでした。" : null,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("サーバーエラーが発生しました。");
  }
});

module.exports = router;
