// 2app.js
const express = require("express");//bin/wwwで立ち上がったhttpサーバーがExpressアプリにリクエストを渡す
const path = require("path");
const logger = require("morgan");

const indexRouter = require("./routes/index");

const app = express();


app.set("views", path.join(__dirname, "views"));//EJS使用の設定。ejs側に%%を書いて、サーバ側のデータを埋め込んでHTMLを作る。
app.set("view engine", "ejs");//ejsを基準にwebデザインする。

// ミドルウェア
app.use(logger("dev"));
app.use(express.urlencoded({ extended: false })); // ← フォームの本文を req.body に
app.use(express.static(path.join(__dirname, "public")));

// ルーター
app.use("/", indexRouter);//routes/index.jsが担当になる

// 404
app.use((req, res) => res.status(404).send("Not Found"));

module.exports = app;


