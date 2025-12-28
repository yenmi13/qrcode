import { useState } from 'react';
import {
    Monitor,
    Smartphone,
    Image as ImageIcon,
    Video,
    Copy,
    Check,
    Info
} from 'lucide-react';

const AD_SPECS = {
    'Facebook': {
        color: '#1877F2',
        specs: [
            { name: '動態消息圖片', width: 1200, height: 628, type: '圖片', ratio: '1.91:1' },
            { name: '動態消息正方形', width: 1080, height: 1080, type: '圖片', ratio: '1:1' },
            { name: '限時動態', width: 1080, height: 1920, type: '圖片/影片', ratio: '9:16' },
            { name: 'Messenger 廣告', width: 1200, height: 628, type: '圖片', ratio: '1.91:1' },
            { name: '輪播廣告', width: 1080, height: 1080, type: '圖片', ratio: '1:1' },
            { name: '封面相片', width: 820, height: 312, type: '圖片', ratio: '2.7:1' },
            { name: '大頭貼', width: 180, height: 180, type: '圖片', ratio: '1:1' },
        ]
    },
    'Instagram': {
        color: '#E4405F',
        specs: [
            { name: '貼文正方形', width: 1080, height: 1080, type: '圖片', ratio: '1:1' },
            { name: '貼文直式', width: 1080, height: 1350, type: '圖片', ratio: '4:5' },
            { name: '貼文橫式', width: 1080, height: 566, type: '圖片', ratio: '1.91:1' },
            { name: '限時動態 / Reels', width: 1080, height: 1920, type: '圖片/影片', ratio: '9:16' },
            { name: '輪播廣告', width: 1080, height: 1080, type: '圖片', ratio: '1:1' },
            { name: 'IGTV 封面', width: 420, height: 654, type: '圖片', ratio: '1:1.55' },
        ]
    },
    'Google Ads': {
        color: '#4285F4',
        specs: [
            { name: '橫幅 (Landscape)', width: 1200, height: 628, type: '圖片', ratio: '1.91:1' },
            { name: '方形 (Square)', width: 1200, height: 1200, type: '圖片', ratio: '1:1' },
            { name: '直式 (Portrait)', width: 960, height: 1200, type: '圖片', ratio: '4:5' },
            { name: '全景式', width: 1200, height: 300, type: '圖片', ratio: '4:1' },
            { name: 'Discovery 廣告', width: 1200, height: 628, type: '圖片', ratio: '1.91:1' },
        ]
    },
    'LINE': {
        color: '#00B900',
        specs: [
            { name: '官方帳號封面', width: 1200, height: 800, type: '圖片', ratio: '3:2' },
            { name: '圖文訊息 (方形)', width: 1040, height: 1040, type: '圖片', ratio: '1:1' },
            { name: '圖文訊息 (橫式)', width: 1040, height: 520, type: '圖片', ratio: '2:1' },
            { name: 'LINE VOOM', width: 1080, height: 1080, type: '圖片/影片', ratio: '1:1' },
            { name: '優惠券圖片', width: 690, height: 480, type: '圖片', ratio: '1.44:1' },
        ]
    },
    'YouTube': {
        color: '#FF0000',
        specs: [
            { name: '頻道封面', width: 2560, height: 1440, type: '圖片', ratio: '16:9' },
            { name: '影片縮圖', width: 1280, height: 720, type: '圖片', ratio: '16:9' },
            { name: '影片浮水印', width: 150, height: 150, type: '圖片', ratio: '1:1' },
            { name: 'Shorts', width: 1080, height: 1920, type: '影片', ratio: '9:16' },
        ]
    },
    'Threads': {
        color: '#000000',
        specs: [
            { name: '貼文圖片', width: 1080, height: 1350, type: '圖片', ratio: '4:5' },
            { name: '貼文正方形', width: 1080, height: 1080, type: '圖片', ratio: '1:1' },
        ]
    }
};

export default function AdSpecsTab() {
    const [selectedPlatform, setSelectedPlatform] = useState('all');
    const [copiedSpec, setCopiedSpec] = useState(null);

    const handleCopySize = (spec) => {
        navigator.clipboard.writeText(`${spec.width}x${spec.height}`);
        setCopiedSpec(`${spec.name}-${spec.width}`);
        setTimeout(() => setCopiedSpec(null), 2000);
    };

    const filteredSpecs = Object.entries(AD_SPECS)
        .filter(([platform]) => selectedPlatform === 'all' || platform === selectedPlatform)
        .map(([platform, data]) => ({
            platform,
            ...data
        }));

    return (
        <div className="ad-specs-container">
            <div className="gtm-intro-card" style={{ marginBottom: '24px' }}>
                <div className="gtm-intro-icon">
                    <Monitor size={28} />
                </div>
                <div className="gtm-intro-content">
                    <h2>廣告素材規格速查</h2>
                    <p>各大平台廣告圖片尺寸與比例一覽</p>
                </div>
            </div>

            <div className="section-item" style={{ marginBottom: '24px' }}>
                <select
                    value={selectedPlatform}
                    onChange={(e) => setSelectedPlatform(e.target.value)}
                    style={{ width: '100%', maxWidth: 300 }}
                >
                    <option value="all">全部平台</option>
                    {Object.keys(AD_SPECS).map(platform => (
                        <option key={platform} value={platform}>{platform}</option>
                    ))}
                </select>
            </div>

            <div className="ad-specs-grid">
                {filteredSpecs.map(({ platform, color, specs }) => (
                    <div key={platform} className="platform-card">
                        <div className="platform-header" style={{ borderLeftColor: color }}>
                            <h3 style={{ color }}>{platform}</h3>
                            <span className="spec-count">{specs.length} 項規格</span>
                        </div>
                        <div className="specs-list">
                            {specs.map((spec) => (
                                <div key={spec.name} className="spec-item">
                                    <div className="spec-info">
                                        <div className="spec-name">{spec.name}</div>
                                        <div className="spec-details">
                                            <span className="spec-size">{spec.width} × {spec.height}</span>
                                            <span className="spec-ratio">{spec.ratio}</span>
                                            <span className={`spec-type ${spec.type.includes('影片') ? 'video' : 'image'}`}>
                                                {spec.type.includes('影片') ? <Video size={10} /> : <ImageIcon size={10} />}
                                                {spec.type}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleCopySize(spec)}
                                        title="複製尺寸"
                                    >
                                        {copiedSpec === `${spec.name}-${spec.width}` ? (
                                            <Check size={14} color="var(--success-color)" />
                                        ) : (
                                            <Copy size={14} />
                                        )}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <div className="feature-hint" style={{ marginTop: 24 }}>
                <Info size={18} className="feature-hint-icon" />
                <div className="feature-hint-text">
                    <strong>提示：</strong>
                    點擊複製按鈕可快速複製尺寸（如 1080x1080），方便在圖片編輯軟體中使用。
                    實際規格可能因平台更新而略有調整，請以各平台官方文件為準。
                </div>
            </div>
        </div>
    );
}
