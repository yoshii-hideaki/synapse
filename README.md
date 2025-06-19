# メモアプリ（ローカルファイル管理版）

このプロジェクトは、ReactフロントエンドとNode.js/Expressサーバーで構成されたアプリです。ハイライト・メモ情報は`memos.json`ファイルで一括管理されます。メモ内容は自由に変更してください。

---

## 必要な環境
- Node.js（v16以上推奨）
- npm

---

## セットアップ手順

### 1. 依存パッケージのインストール

```sh
npm install
```

### 2. サーバー用依存パッケージのインストール

```sh
npm install express cors
```

---

## 起動方法

### 1. APIサーバーの起動

```sh
node server.js
```
- サーバーはデフォルトで http://localhost:4000 で起動します。
- メモデータは `memos.json` に保存されます。

### 2. Reactアプリの起動

別のターミナルで以下を実行：

```sh
npm start
```
- 通常 http://localhost:3000 でアプリが開きます。

---

## 機能
- メモの追加・削除・リンク
- メモ情報はAPI経由で`memos.json`に保存

---

## 注意事項
- サーバー（`server.js`）は必ず起動しておいてください。
- フロントエンドとAPIサーバーは別ポートで動作します。
- `memos.json`が壊れた場合は手動で修正してください。

---

## ディレクトリ構成例

```
├── memos.json
├── server.js
├── package.json
├── public/
├── src/
│   ├── App.js
│   ├── index.js
│   └── index.css
├── tailwind.config.js
├── postcss.config.js
└── README.md
``` 