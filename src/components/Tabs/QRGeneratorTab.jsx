import { useState, useEffect, useRef } from 'react';
import QRCodeStyling from 'qr-code-styling';
import {
    Download,
    Link as LinkIcon,
    Type,
    Upload,
    Palette,
    X,
    Grid,
    Copy,
    Check,
    Smartphone,
    Monitor,
    FileText,
    Sparkles,
    BarChart3,
    Tag,
    Target,
    Megaphone,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

const qrCode = new QRCodeStyling({
    width: 280,
    height: 280,
    image: "",
    dotsOptions: {
        color: "#2C3E50",
        type: "rounded"
    },
    backgroundOptions: {
        color: "#ffffff",
    },
    imageOptions: {
        crossOrigin: "anonymous",
        margin: 10
    }
});

export default function QRGeneratorTab() {
    const [mode, setMode] = useState('url');
    const [url, setUrl] = useState('');
    const [text, setText] = useState('');

    // UTM Tracking State
    const [enableTracking, setEnableTracking] = useState(false);
    const [showUtmDetails, setShowUtmDetails] = useState(false);
    const [utmParams, setUtmParams] = useState({
        source: 'qrcode',
        medium: 'print',
        campaign: '',
        term: '',
        content: ''
    });

    // Style State
    const [color, setColor] = useState('#2C3E50');
    const [bgColor, setBgColor] = useState('#FFFFFF');
    const [dotType, setDotType] = useState('rounded');
    const [cornerType, setCornerType] = useState('extra-rounded');
    const [density, setDensity] = useState('Q');
    const [logo, setLogo] = useState(null);
    const [copied, setCopied] = useState(false);

    const ref = useRef(null);

    // 產生帶有 UTM 參數的完整網址
    const generateTrackedUrl = () => {
        if (mode !== 'url' || !enableTracking) return url;

        try {
            const urlObj = new URL(url);

            if (utmParams.source) urlObj.searchParams.set('utm_source', utmParams.source);
            if (utmParams.medium) urlObj.searchParams.set('utm_medium', utmParams.medium);
            if (utmParams.campaign) urlObj.searchParams.set('utm_campaign', utmParams.campaign);
            if (utmParams.term) urlObj.searchParams.set('utm_term', utmParams.term);
            if (utmParams.content) urlObj.searchParams.set('utm_content', utmParams.content);

            return urlObj.toString();
        } catch (e) {
            return url;
        }
    };

    const finalUrl = generateTrackedUrl();

    useEffect(() => {
        qrCode.append(ref.current);
    }, []);

    useEffect(() => {
        let data = '';
        if (mode === 'url') {
            data = finalUrl;
        } else {
            data = text || ' ';
        }

        qrCode.update({
            data: data,
            qrOptions: {
                errorCorrectionLevel: density
            },
            dotsOptions: {
                color: color,
                type: dotType
            },
            backgroundOptions: {
                color: bgColor
            },
            cornersSquareOptions: {
                type: cornerType,
                color: color
            },
            cornersDotOptions: {
                type: cornerType,
                color: color
            },
            image: logo
        });
    }, [finalUrl, text, mode, color, bgColor, dotType, cornerType, density, logo]);

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setLogo(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDownload = (size, label) => {
        qrCode.update({ width: size, height: size });
        qrCode.download({ extension: "png", name: `qrcode_${label}` });
        setTimeout(() => {
            qrCode.update({ width: 280, height: 280 });
        }, 100);
    };

    const handleDownloadAll = () => {
        const sizes = [
            { size: 150, label: 'S' },
            { size: 300, label: 'M' },
            { size: 500, label: 'L' }
        ];

        sizes.forEach((item, index) => {
            setTimeout(() => {
                handleDownload(item.size, item.label);
            }, index * 300);
        });
    };

    const handleCopyUrl = () => {
        const textToCopy = mode === 'url' ? finalUrl : text;
        navigator.clipboard.writeText(textToCopy);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const presetColors = [
        '#2C3E50', // 深藍黑
        '#1E3A5F', // 深藍
        '#2D5016', // 深綠 
        '#8B4513', // 棕色
        '#4A154B', // 紫色
        '#0D1117', // 純黑
    ];

    // 預設的 UTM 來源選項（專門給 QR Code 使用）
    const sourcePresets = ['qrcode', 'ad'];
    const mediumPresets = ['ad', 'print', 'offline', 'FB', 'IG', 'threads'];

    return (
        <div className="grid-layout">
            {/* Left Column: Controls */}
            <div className="section-stack">
                <div className="section-item">
                    <h3 className="section-title">
                        <Sparkles size={16} />
                        選擇類型
                    </h3>
                    <div className="toggle-group">
                        <button
                            className={`toggle-option ${mode === 'url' ? 'active' : ''}`}
                            onClick={() => setMode('url')}
                        >
                            <LinkIcon size={16} /> 網址
                        </button>
                        <button
                            className={`toggle-option ${mode === 'text' ? 'active' : ''}`}
                            onClick={() => setMode('text')}
                        >
                            <Type size={16} /> 文字
                        </button>
                    </div>
                </div>

                <div className="section-item">
                    <h3 className="section-title">
                        <FileText size={16} />
                        輸入內容
                    </h3>
                    <div style={{ position: 'relative' }}>
                        {mode === 'url' ? (
                            <input
                                type="text"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                style={{ paddingRight: '48px' }}
                            />
                        ) : (
                            <textarea
                                placeholder="請輸入文字、聯絡人資訊或其他內容..."
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows={4}
                            />
                        )}
                        <button
                            className={`btn-icon ${copied ? 'copied' : ''}`}
                            onClick={handleCopyUrl}
                            style={{
                                position: 'absolute',
                                right: '8px',
                                top: mode === 'url' ? '50%' : '12px',
                                transform: mode === 'url' ? 'translateY(-50%)' : 'none',
                                width: '32px',
                                height: '32px',
                                background: copied ? 'var(--success-color)' : 'var(--surface-hover)',
                                color: copied ? '#fff' : 'var(--text-secondary)'
                            }}
                            title="複製內容"
                        >
                            {copied ? <Check size={14} /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>

                {/* GTM / UTM 追蹤設定 */}
                {mode === 'url' && (
                    <div className="section-item">
                        <h3 className="section-title">
                            <BarChart3 size={16} />
                            GTM 追蹤設定
                        </h3>

                        <div className="tracking-toggle">
                            <label className="toggle-switch">
                                <input
                                    type="checkbox"
                                    checked={enableTracking}
                                    onChange={(e) => setEnableTracking(e.target.checked)}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <span style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
                                啟用 UTM 追蹤參數
                            </span>
                        </div>

                        {enableTracking && (
                            <div className="utm-settings">
                                <div className="utm-field">
                                    <label className="utm-label">
                                        <Tag size={14} />
                                        來源 (utm_source) *
                                    </label>
                                    <div className="utm-input-group">
                                        <input
                                            type="text"
                                            value={utmParams.source}
                                            onChange={(e) => setUtmParams({ ...utmParams, source: e.target.value })}
                                            placeholder="qrcode"
                                        />
                                        <div className="utm-presets">
                                            {sourcePresets.map(preset => (
                                                <button
                                                    key={preset}
                                                    className={`utm-preset-btn ${utmParams.source === preset ? 'active' : ''}`}
                                                    onClick={() => setUtmParams({ ...utmParams, source: preset })}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="utm-field">
                                    <label className="utm-label">
                                        <Target size={14} />
                                        媒介 (utm_medium) *
                                    </label>
                                    <div className="utm-input-group">
                                        <input
                                            type="text"
                                            value={utmParams.medium}
                                            onChange={(e) => setUtmParams({ ...utmParams, medium: e.target.value })}
                                            placeholder="print"
                                        />
                                        <div className="utm-presets">
                                            {mediumPresets.map(preset => (
                                                <button
                                                    key={preset}
                                                    className={`utm-preset-btn ${utmParams.medium === preset ? 'active' : ''}`}
                                                    onClick={() => setUtmParams({ ...utmParams, medium: preset })}
                                                >
                                                    {preset}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="utm-field">
                                    <label className="utm-label">
                                        <Megaphone size={14} />
                                        活動名稱 (utm_campaign)
                                    </label>
                                    <input
                                        type="text"
                                        value={utmParams.campaign}
                                        onChange={(e) => setUtmParams({ ...utmParams, campaign: e.target.value })}
                                        placeholder="例如：2024_spring_sale"
                                    />
                                </div>

                                <button
                                    className="utm-expand-btn"
                                    onClick={() => setShowUtmDetails(!showUtmDetails)}
                                >
                                    {showUtmDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                    {showUtmDetails ? '收起進階選項' : '顯示進階選項'}
                                </button>

                                {showUtmDetails && (
                                    <>
                                        <div className="utm-field">
                                            <label className="utm-label">關鍵字 (utm_term)</label>
                                            <input
                                                type="text"
                                                value={utmParams.term}
                                                onChange={(e) => setUtmParams({ ...utmParams, term: e.target.value })}
                                                placeholder="選填"
                                            />
                                        </div>
                                        <div className="utm-field">
                                            <label className="utm-label">內容 (utm_content)</label>
                                            <input
                                                type="text"
                                                value={utmParams.content}
                                                onChange={(e) => setUtmParams({ ...utmParams, content: e.target.value })}
                                                placeholder="例如：header_banner"
                                            />
                                        </div>
                                    </>
                                )}

                                {/* 顯示最終追蹤網址 */}
                                <div className="final-url-box">
                                    <label className="utm-label" style={{ marginBottom: 8 }}>
                                        <LinkIcon size={14} />
                                        最終追蹤網址
                                    </label>
                                    <div className="final-url-content">
                                        <code>{finalUrl}</code>
                                        <button
                                            className="btn-icon"
                                            onClick={handleCopyUrl}
                                            style={{
                                                width: '28px',
                                                height: '28px',
                                                flexShrink: 0,
                                                background: copied ? 'var(--success-color)' : 'var(--surface-color)',
                                                color: copied ? '#fff' : 'var(--text-secondary)'
                                            }}
                                            title="複製網址"
                                        >
                                            {copied ? <Check size={12} /> : <Copy size={12} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="section-item">
                    <h3 className="section-title">
                        <Palette size={16} />
                        自訂樣式
                    </h3>

                    <div className="control-row">
                        <label className="control-label"><Grid size={16} /> 密度</label>
                        <select value={density} onChange={(e) => setDensity(e.target.value)} style={{ width: 140 }}>
                            <option value="L">低 (Sparse)</option>
                            <option value="M">中 (Medium)</option>
                            <option value="Q">高 (High)</option>
                            <option value="H">極高 (Dense)</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <label className="control-label"><Palette size={16} /> 顏色</label>
                        <div className="color-picker-wrapper">
                            <div style={{ display: 'flex', gap: '6px' }}>
                                {presetColors.map((presetColor) => (
                                    <button
                                        key={presetColor}
                                        onClick={() => setColor(presetColor)}
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: presetColor,
                                            border: color === presetColor ? '2px solid var(--accent-color)' : '2px solid transparent',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        title={presetColor}
                                    />
                                ))}
                            </div>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                className="color-picker"
                                style={{ width: '36px', height: '36px' }}
                            />
                        </div>
                    </div>

                    <div className="control-row">
                        <label className="control-label">樣式</label>
                        <select value={dotType} onChange={(e) => setDotType(e.target.value)} style={{ width: 140 }}>
                            <option value="square">方塊</option>
                            <option value="rounded">圓角</option>
                            <option value="dots">圓點</option>
                            <option value="classy">典雅</option>
                            <option value="classy-rounded">典雅圓角</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <label className="control-label">邊角</label>
                        <select value={cornerType} onChange={(e) => setCornerType(e.target.value)} style={{ width: 140 }}>
                            <option value="square">直角</option>
                            <option value="extra-rounded">圓角</option>
                            <option value="dot">圓點</option>
                        </select>
                    </div>

                    <div className="control-row">
                        <label className="control-label"><Upload size={16} /> Logo</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <label className="btn-secondary" style={{ cursor: 'pointer', padding: '8px 14px', fontSize: 13 }}>
                                <Upload size={14} />
                                選擇圖片
                                <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                            </label>
                            {logo && (
                                <button
                                    onClick={() => setLogo(null)}
                                    className="btn-icon"
                                    style={{
                                        width: '32px',
                                        height: '32px',
                                        color: 'var(--error-color)',
                                        borderColor: 'var(--error-color)'
                                    }}
                                    title="移除 Logo"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Preview */}
            <div className="preview-column">
                <div className="qr-preview-box">
                    <div ref={ref} />
                </div>

                <div className="download-section">
                    <h4 className="download-title">下載 QR Code</h4>
                    <div className="download-actions">
                        <button
                            className="btn-primary download-btn"
                            onClick={() => handleDownload(150, 'S')}
                            title="150x150 像素"
                        >
                            <Smartphone size={16} />
                            S
                            <span className="size-badge">150px</span>
                        </button>
                        <button
                            className="btn-primary download-btn"
                            onClick={() => handleDownload(300, 'M')}
                            title="300x300 像素"
                        >
                            <Monitor size={16} />
                            M
                            <span className="size-badge">300px</span>
                        </button>
                        <button
                            className="btn-primary download-btn"
                            onClick={() => handleDownload(500, 'L')}
                            title="500x500 像素"
                        >
                            <Monitor size={16} />
                            L
                            <span className="size-badge">500px</span>
                        </button>
                    </div>
                    <button
                        className="btn-secondary"
                        style={{ marginTop: '16px', width: '100%' }}
                        onClick={handleDownloadAll}
                    >
                        <Download size={16} />
                        一次下載全部尺寸
                    </button>
                </div>

                {enableTracking && (
                    <div className="feature-hint" style={{ marginTop: 20 }}>
                        <BarChart3 size={18} className="feature-hint-icon" />
                        <span className="feature-hint-text">
                            已啟用追蹤！掃描此 QR Code 的訪客將被記錄在 Google Analytics 的「流量獲取」報告中。
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
