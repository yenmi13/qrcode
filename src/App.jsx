import { useState } from 'react';
import { QrCode, ScanLine, Heart, BarChart3, Image, Zap, Monitor, Smile } from 'lucide-react';
import QRGeneratorTab from './components/Tabs/QRGeneratorTab';
import OCRScannerTab from './components/Tabs/OCRScannerTab';
import GTMTrackerTab from './components/Tabs/GTMTrackerTab';
import ImageResizerTab from './components/Tabs/ImageResizerTab';
import ShortLinkTab from './components/Tabs/ShortLinkTab';
import AdSpecsTab from './components/Tabs/AdSpecsTab';
import EmojiTab from './components/Tabs/EmojiTab';

function App() {
  const [activeTab, setActiveTab] = useState('qr');

  return (
    <div className="app-container">
      <header className="header">
        <div className="logo">
          <span>整合行銷工具盒</span>
        </div>
      </header>

      <main className="main-content">
        <div className="tab-container">
          <button
            className={`tab-btn ${activeTab === 'qr' ? 'active' : ''}`}
            onClick={() => setActiveTab('qr')}
          >
            <QrCode size={18} />
            製作 QR Code
          </button>
          <button
            className={`tab-btn ${activeTab === 'gtm' ? 'active' : ''}`}
            onClick={() => setActiveTab('gtm')}
          >
            <BarChart3 size={18} />
            GTM 追蹤
          </button>
          <button
            className={`tab-btn ${activeTab === 'short' ? 'active' : ''}`}
            onClick={() => setActiveTab('short')}
          >
            <Zap size={18} />
            短網址產生
          </button>
          <button
            className={`tab-btn ${activeTab === 'resize' ? 'active' : ''}`}
            onClick={() => setActiveTab('resize')}
          >
            <Image size={18} />
            圖片壓縮
          </button>
          <button
            className={`tab-btn ${activeTab === 'ocr' ? 'active' : ''}`}
            onClick={() => setActiveTab('ocr')}
          >
            <ScanLine size={18} />
            名片掃描 OCR
          </button>
          <button
            className={`tab-btn ${activeTab === 'specs' ? 'active' : ''}`}
            onClick={() => setActiveTab('specs')}
          >
            <Monitor size={18} />
            廣告規格
          </button>
          <button
            className={`tab-btn ${activeTab === 'emoji' ? 'active' : ''}`}
            onClick={() => setActiveTab('emoji')}
          >
            <Smile size={18} />
            符號 & Emoji
          </button>
        </div>

        <div className="content-card">
          {activeTab === 'qr' && <QRGeneratorTab />}
          {activeTab === 'gtm' && <GTMTrackerTab />}
          {activeTab === 'short' && <ShortLinkTab />}
          {activeTab === 'resize' && <ImageResizerTab />}
          {activeTab === 'ocr' && <OCRScannerTab />}
          {activeTab === 'specs' && <AdSpecsTab />}
          {activeTab === 'emoji' && <EmojiTab />}
        </div>
      </main>

      <footer className="footer">
        <span>Made with</span>
        <Heart size={14} color="#EF4444" fill="#EF4444" />
        <span>Yenyen</span>
        <span>© 2025 整合行銷工具盒</span>
      </footer>
    </div>
  );
}

export default App;
