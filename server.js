const express = require("express");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const app = express();
const PORT = process.env.PORT || 3000;

// كلمة مرور لوحة التحكم
const ADMIN_PASSWORD = "Alihlal166.";

// عنوان محفظتك الرئيسية (إيداع المستخدمين)
const MAIN_WALLET = "TPNoGerv1EMBSdrs9Yca93eCQUVsoNiRvq";

// تفعيل JSON
app.use(express.json());

// ملفات الواجهة
app.use(express.static(path.join(__dirname, "public")));

// قاعدة البيانات SQLite
const db = new sqlite3.Database("./db.sqlite");

// إنشاء الجداول إذا لم تكن موجودة
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      username TEXT PRIMARY KEY,
      balance REAL DEFAULT 0,
      locked REAL DEFAULT 0
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS deposits (
      id TEXT PRIMARY KEY,
      username TEXT,
      amount REAL,
      days INTEGER,
      profitRate REAL,
      createdAt INTEGER,
      unlockAt INTEGER,
      status TEXT,
      txid TEXT
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS withdrawals (
      id TEXT PRIMARY KEY,
      username TEXT,
      amount REAL,
      wallet TEXT,
      status TEXT,
      createdAt INTEGER
    )
  `);
});

// وظائف مساعدة
function createId(prefix) {
  return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 9999);
}

// إنشاء مستخدم إذا غير موجود
function getUser(username, callback) {
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
    if (row) callback(row);
    else {
      db.run(
        "INSERT INTO users(username,balance,locked) VALUES(?,?,?)",
        [username, 0, 0],
        () => callback({ username, balance: 0, locked: 0 })
      );
    }
  });
}

// API — بدء استثمار
app.post("/api/invest", (req, res) => {
  const { username, amount, days } = req.body;

  if (!username || !amount || !days)
    return res.json({ ok: false, msg: "بيانات ناقصة" });

  const rates = { 20: 0.8, 30: 0.9, 60: 1.2, 90: 1.5 };
  const rate = rates[days];

  if (!rate) return res.json({ ok: false, msg: "خطة غير صحيحة" });

  const id = createId("dep");
  const createdAt = Date.now();
  const unlockAt = createdAt + days * 24 * 60 * 60 * 1000;

  getUser(username, () => {
    db.run(
      `INSERT INTO deposits(id, username, amount, days, profitRate, createdAt, unlockAt, status)
       VALUES(?,?,?,?,?,?,?,?)`,
      [id, username, amount, days, rate, createdAt, unlockAt, "pending"],
      () => res.json({ ok: true, id, wallet: MAIN_WALLET })
    );
  });
});

// API — إرسال رقم العملية (TxID)
app.post("/api/txid", (req, res) => {
  const { id, txid } = req.body;

  if (!id || !txid)
    return res.json({ ok: false, msg: "بيانات ناقصة" });

  db.run(
    "UPDATE deposits SET txid=?, status=? WHERE id=?",
    [txid, "waiting", id],
    () => res.json({ ok: true })
  );
});

// API — طلب سحب
app.post("/api/withdraw", (req, res) => {
  const { username, amount, wallet } = req.body;

  if (!username || !amount || !wallet)
    return res.json({ ok: false, msg: "بيانات ناقصة" });

  const id = createId("wd");
  const createdAt = Date.now();

  db.run(
    `
    INSERT INTO withdrawals(id, username, amount, wallet, status, createdAt)
    VALUES(?,?,?,?,?,?)
  `,
    [id, username, amount, wallet, "pending", createdAt],
    () => res.json({ ok: true })
  );
});

// API — ملخص المستخدم
app.get("/api/user", (req, res) => {
  const username = req.query.username;

  if (!username) return res.json({ ok: false });

  getUser(username, (user) => {
    db.all(
      "SELECT * FROM deposits WHERE username=?",
      [username],
      (err, deps) => {
        db.all(
          "SELECT * FROM withdrawals WHERE username=?",
          [username],
          (err2, wds) => {
            res.json({ ok: true, user, deposits: deps, withdrawals: wds });
          }
        );
      }
    );
  });
});

// API — دخول المدير
app.post("/api/admin/login", (req, res) => {
  const { password } = req.body;

  if (password === ADMIN_PASSWORD)
    return res.json({ ok: true });

  res.json({ ok: false, msg: "كلمة المرور خاطئة" });
});

// تشغيل السيرفر
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.listen(PORT, () => {
  console.log("SERVER RUNNING ON PORT " + PORT);
});
