const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 4000;
const MEMOS_FILE = path.join(__dirname, 'memos.json');

app.use(cors());
app.use(express.json());

// メモ一覧取得
app.get('/api/memos', (req, res) => {
  fs.readFile(MEMOS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'ファイル読み込みエラー' });
    try {
      const memos = JSON.parse(data);
      res.json(memos);
    } catch (e) {
      res.status(500).json({ error: 'JSONパースエラー' });
    }
  });
});

// メモ追加
app.post('/api/memos', (req, res) => {
  const newMemo = req.body;
  fs.readFile(MEMOS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'ファイル読み込みエラー' });
    let memos = [];
    try {
      memos = JSON.parse(data);
    } catch (e) {}
    memos.push(newMemo);
    fs.writeFile(MEMOS_FILE, JSON.stringify(memos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'ファイル書き込みエラー' });
      res.json(newMemo);
    });
  });
});

// メモ削除
app.delete('/api/memos/:id', (req, res) => {
  const id = Number(req.params.id);
  fs.readFile(MEMOS_FILE, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'ファイル読み込みエラー' });
    let memos = [];
    try {
      memos = JSON.parse(data);
    } catch (e) {}
    const newMemos = memos.filter(memo => memo.id !== id);
    fs.writeFile(MEMOS_FILE, JSON.stringify(newMemos, null, 2), (err) => {
      if (err) return res.status(500).json({ error: 'ファイル書き込みエラー' });
      res.json({ success: true });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 