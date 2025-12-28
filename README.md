# 整合行銷工具盒 | Marketing Toolkit

<p align="center">
  <img src="https://img.shields.io/badge/React-18.x-61DAFB?logo=react" alt="React">
  <img src="https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite" alt="Vite">
  <img src="https://img.shields.io/badge/License-MIT-green" alt="License">
</p>

一站式整合行銷工具平台，專為數位行銷人員、設計師和企業打造。

## ✨ 功能特色

### 🔲 QR Code 產生器
- 支援網址、文字、Email、電話等多種類型
- 可自訂顏色、圓角樣式
- 支援上傳中心 Logo
- 內建 UTM 追蹤參數設定
- 一鍵下載 PNG（L/M/S 三種尺寸）

### 📊 GTM / UTM 追蹤產生器
- 快速產生帶有 UTM 參數的追蹤網址
- 預設活動模板：電商促銷、線下活動、EDM 行銷、社群廣告、節日優惠
- 一鍵複製完整網址或 Markdown 格式

### 🔗 短網址產生器
- 整合多家短網址服務（is.gd、v.gd、da.gd）
- 自動備援機制，確保服務穩定性
- 歷史紀錄保存（最近 10 筆）
- 支援單筆刪除與全部清除

### 🖼️ 圖片壓縮工具
- 批量上傳與壓縮
- 廣告平台預設尺寸（FB、IG、Google Ads、LINE、YouTube）
- 三種縮放模式：Cover、Contain、Stretch
- 圖片旋轉功能
- 目標檔案大小設定
- 浮水印功能（文字/圖片 Logo）
- 支援選擇浮水印位置（左上/右上/左下/右下）
- 批量 ZIP 下載

### 📇 名片掃描 OCR
- 上傳名片圖片自動辨識
- 支援中文與英文辨識
- 自動解析：姓名、職稱、公司、電話、Email、LINE、統編
- 匯出至 Google Sheets（CSV）
- 複製到 Notion 表格格式
- JSON 下載

### 📐 廣告規格速查
- 涵蓋 6 大平台：Facebook、Instagram、Google Ads、LINE、YouTube、Threads
- 完整規格資訊：尺寸、比例、類型
- 一鍵複製尺寸到剪貼簿
- 平台篩選功能

### 😊 符號 & Emoji & 顏文字
- **標點符號**：常用標點、特殊符號、數學符號、貨幣符號
- **Emoji**：表情、手勢、愛心、慶祝、商務、社群、天氣時間、食物
- **顏文字**：開心、可愛、傷心、生氣、愛情、翻桌、打招呼、動作表情
- 點擊即複製到剪貼簿

## 🛠️ 技術棧

- **前端框架**: React 18
- **建構工具**: Vite 7
- **樣式**: Vanilla CSS + CSS Variables
- **圖示**: Lucide React
- **QR Code**: qr-code-styling
- **圖片處理**: browser-image-compression
- **OCR**: Tesseract.js
- **壓縮下載**: JSZip

## 🚀 快速開始

### 安裝依賴
```bash
npm install
```

### 開發模式
```bash
npm run dev
```
開啟瀏覽器訪問 `http://localhost:5173`

### 正式打包
```bash
npm run build
```
打包檔案會產生在 `dist/` 資料夾

## 📦 專案結構

```
src/
├── components/
│   └── Tabs/
│       ├── QRGeneratorTab.jsx    # QR Code 產生器
│       ├── GTMTrackerTab.jsx     # GTM 追蹤產生器
│       ├── ShortLinkTab.jsx      # 短網址產生器
│       ├── ImageResizerTab.jsx   # 圖片壓縮工具
│       ├── OCRScannerTab.jsx     # 名片掃描 OCR
│       └── AdSpecsTab.jsx        # 廣告規格速查
├── App.jsx                       # 主應用程式
├── main.jsx                      # 入口檔案
└── index.css                     # 全局樣式
```

## 🎨 設計特色

- **日式極簡風格**：乾淨俐落的介面設計
- **抹茶綠主題色**：舒適的視覺體驗
- **響應式設計**：支援桌面與行動裝置
- **流暢動畫**：細膩的過場效果

## 📱 瀏覽器支援

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 部署

### Vercel（推薦）
```bash
npm i -g vercel
vercel
```

### Netlify
將 `dist/` 資料夾拖曳至 Netlify 控制台

### GitHub Pages
```bash
npm run build
# 將 dist 資料夾內容推送至 gh-pages 分支
```

## 📄 授權

MIT License © 2025 Yenyen

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

---

<p align="center">
  Made with ❤️ by Yenyen
</p>
