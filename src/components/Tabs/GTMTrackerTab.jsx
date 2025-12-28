import { useState } from 'react';
import {
    Copy,
    Check,
    Tag,
    Target,
    Megaphone,
    BarChart3,
    ExternalLink,
    Info,
    Lightbulb,
    Link as LinkIcon,
    FileText,
    ChevronDown,
    ChevronUp,
    Zap,
    ShoppingCart,
    Users,
    Calendar,
    Gift
} from 'lucide-react';

export default function GTMTrackerTab() {
    const [baseUrl, setBaseUrl] = useState('');
    const [utmParams, setUtmParams] = useState({
        source: 'qrcode',
        medium: 'print',
        campaign: '',
        term: '',
        content: ''
    });
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [copied, setCopied] = useState(false);

    // 生成带有 UTM 参数的完整网址
    const generateTrackedUrl = () => {
        try {
            const urlObj = new URL(baseUrl);

            if (utmParams.source) urlObj.searchParams.set('utm_source', utmParams.source);
            if (utmParams.medium) urlObj.searchParams.set('utm_medium', utmParams.medium);
            if (utmParams.campaign) urlObj.searchParams.set('utm_campaign', utmParams.campaign);
            if (utmParams.term) urlObj.searchParams.set('utm_term', utmParams.term);
            if (utmParams.content) urlObj.searchParams.set('utm_content', utmParams.content);

            return urlObj.toString();
        } catch (e) {
            return baseUrl;
        }
    };

    const finalUrl = generateTrackedUrl();

    const handleCopy = () => {
        navigator.clipboard.writeText(finalUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleCopyMarkdown = () => {
        const markdown = `[${utmParams.campaign || 'Link'}](${finalUrl})`;
        navigator.clipboard.writeText(markdown);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const mediumPresets = ['ad', 'print', 'offline', 'FB', 'IG', 'threads', 'email', 'social'];

    // 常见的流量来源（参考 Lihi 等短网址服务）
    const sourcePresets = [
        'google',
        'facebook',
        'instagram',
        'line',
        'youtube',
        'linkedin',
        'twitter',
        'email',
        'qrcode',
        'ad',
        'edm',
        'blog',
        'website'
    ];

    // 活動模板
    const campaignTemplates = [
        { name: '電商促銷', icon: ShoppingCart, source: 'facebook', medium: 'ad', campaign: 'sale_2025' },
        { name: '線下活動', icon: Calendar, source: 'qrcode', medium: 'offline', campaign: 'event_2025' },
        { name: 'EDM 行銷', icon: Megaphone, source: 'email', medium: 'edm', campaign: 'newsletter_2025' },
        { name: '社群廣告', icon: Users, source: 'instagram', medium: 'social', campaign: 'ig_post' },
        { name: '節日優惠', icon: Gift, source: 'google', medium: 'ad', campaign: 'holiday_promo' },
    ];

    const applyTemplate = (template) => {
        setUtmParams({
            ...utmParams,
            source: template.source,
            medium: template.medium,
            campaign: template.campaign
        });
    };

    return (
        <div className="gtm-tracker-container">
            <div className="gtm-intro-section">
                <div className="gtm-intro-card">
                    <div className="gtm-intro-icon">
                        <BarChart3 size={28} />
                    </div>
                    <div className="gtm-intro-content">
                        <h2>GTM / UTM 追蹤網址產生器</h2>
                        <p>產生帶有追蹤參數的網址，用於 Google Analytics 流量分析</p>
                    </div>
                </div>
            </div>

            <div className="grid-layout">
                {/* Left: Input & Settings */}
                <div className="section-stack">
                    <div className="section-item">
                        <h3 className="section-title">
                            <LinkIcon size={16} />
                            目標網址
                        </h3>
                        <input
                            type="text"
                            value={baseUrl}
                            onChange={(e) => setBaseUrl(e.target.value)}
                            placeholder="https://example.com"
                        />
                        <div className="hint-text">
                            <Info size={12} />
                            請輸入您要追蹤的完整網址（含 https://）
                        </div>
                    </div>

                    <div className="section-item">
                        <h3 className="section-title">
                            <Zap size={16} />
                            快速套用模板
                        </h3>
                        <div className="utm-presets" style={{ flexWrap: 'wrap' }}>
                            {campaignTemplates.map((template) => {
                                const IconComponent = template.icon;
                                return (
                                    <button
                                        key={template.name}
                                        className="utm-preset-btn"
                                        onClick={() => applyTemplate(template)}
                                        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
                                    >
                                        <IconComponent size={14} />
                                        {template.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="section-item">
                        <h3 className="section-title">
                            <Tag size={16} />
                            UTM 追蹤參數
                        </h3>

                        <div className="utm-settings" style={{ padding: '0', background: 'transparent', border: 'none' }}>
                            {/* Source */}
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
                                        placeholder="例如：google, facebook, qrcode"
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

                            {/* Medium */}
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

                            {/* Campaign */}
                            <div className="utm-field">
                                <label className="utm-label">
                                    <Megaphone size={14} />
                                    活動名稱 (utm_campaign) *
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
                                onClick={() => setShowAdvanced(!showAdvanced)}
                            >
                                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                {showAdvanced ? '收起進階選項' : '顯示進階選項'}
                            </button>

                            {showAdvanced && (
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
                        </div>
                    </div>
                </div>

                {/* Right: Result & Guide */}
                <div className="section-stack">
                    <div className="section-item">
                        <h3 className="section-title">
                            <FileText size={16} />
                            追蹤網址結果
                        </h3>

                        <div className="tracked-url-result">
                            <div className="tracked-url-box">
                                <code>{finalUrl}</code>
                            </div>
                            <div className="tracked-url-actions">
                                <button
                                    className="btn-primary"
                                    onClick={handleCopy}
                                    style={{ flex: 2 }}
                                >
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? '已複製！' : '複製網址'}
                                </button>
                                <button
                                    className="btn-secondary"
                                    onClick={handleCopyMarkdown}
                                    style={{ flex: 1 }}
                                >
                                    <FileText size={16} />
                                    Markdown
                                </button>
                                <a
                                    href={finalUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn-secondary"
                                    style={{ flex: 1, textDecoration: 'none' }}
                                >
                                    <ExternalLink size={16} />
                                    測試
                                </a>
                            </div>
                        </div>
                    </div>

                    <div className="section-item">
                        <h3 className="section-title">
                            <Lightbulb size={16} />
                            使用說明
                        </h3>
                        <div className="gtm-guide">
                            <div className="guide-step">
                                <span className="step-number">1</span>
                                <div className="step-content">
                                    <h4>輸入目標網址</h4>
                                    <p>輸入您想追蹤的網站網址</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <span className="step-number">2</span>
                                <div className="step-content">
                                    <h4>設定 UTM 參數</h4>
                                    <p>至少填寫來源、媒介、活動名稱</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <span className="step-number">3</span>
                                <div className="step-content">
                                    <h4>複製追蹤網址</h4>
                                    <p>將產生的網址用於行銷活動或 QR Code</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <span className="step-number">4</span>
                                <div className="step-content">
                                    <h4>查看 Google Analytics</h4>
                                    <p>在 GA4 的「流量獲取」報告中查看成效</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="feature-hint">
                        <Info size={18} className="feature-hint-icon" />
                        <div className="feature-hint-text">
                            <strong>提示：</strong>產生的追蹤網址可以直接貼到「製作 QR Code」分頁產生 QR Code，
                            或用於任何行銷管道（Email、社群媒體等）。確保您的網站已安裝 Google Analytics 或 GTM 來追蹤數據。
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
