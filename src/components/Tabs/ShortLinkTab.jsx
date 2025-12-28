import { useState, useEffect } from 'react';
import {
    Link as LinkIcon,
    Copy,
    Check,
    ExternalLink,
    History,
    Trash2,
    QrCode,
    Zap,
    Info,
    Loader2
} from 'lucide-react';

export default function ShortLinkTab() {
    const [longUrl, setLongUrl] = useState('');
    const [shortUrl, setShortUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [history, setHistory] = useState([]);

    // 從 LocalStorage 載入歷史紀錄
    useEffect(() => {
        const savedHistory = localStorage.getItem('short_url_history');
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // 儲存至 LocalStorage
    const saveToHistory = (long, short) => {
        const newItem = {
            id: Date.now(),
            long,
            short,
            date: new Date().toLocaleString()
        };
        const updatedHistory = [newItem, ...history].slice(0, 10); // 只保留最近 10 筆
        setHistory(updatedHistory);
        localStorage.setItem('short_url_history', JSON.stringify(updatedHistory));
    };

    const handleShorten = async () => {
        if (!longUrl) return;

        setLoading(true);
        let success = false;

        // 使用 is.gd API（穩定且可直接導向）
        try {
            const response = await fetch(`https://is.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);

            if (response.ok) {
                const data = await response.json();
                if (data && data.shorturl) {
                    setShortUrl(data.shorturl);
                    saveToHistory(longUrl, data.shorturl);
                    success = true;
                }
            }
        } catch (e) {
            console.warn('is.gd 失敗，嘗試備用方案...', e);
        }

        // 備用方案 1: v.gd
        if (!success) {
            try {
                const response = await fetch(`https://v.gd/create.php?format=json&url=${encodeURIComponent(longUrl)}`);

                if (response.ok) {
                    const data = await response.json();
                    if (data && data.shorturl) {
                        setShortUrl(data.shorturl);
                        saveToHistory(longUrl, data.shorturl);
                        success = true;
                    }
                }
            } catch (e) {
                console.warn('v.gd 失敗，嘗試備用方案 2...', e);
            }
        }

        // 備用方案 2: da.gd
        if (!success) {
            try {
                const response = await fetch(`https://da.gd/s?url=${encodeURIComponent(longUrl)}`);

                if (response.ok) {
                    const shortUrl = await response.text();
                    if (shortUrl && shortUrl.includes('da.gd')) {
                        const trimmedUrl = shortUrl.trim();
                        setShortUrl(trimmedUrl);
                        saveToHistory(longUrl, trimmedUrl);
                        success = true;
                    }
                }
            } catch (e) {
                console.error('所有縮網址服務均失效:', e);
            }
        }

        if (!success) {
            alert('目前縮網址服務暫時不可用，請檢查您的網路連接，或稍後再試。');
        }
        setLoading(false);
    };


    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const clearHistory = () => {
        setHistory([]);
        localStorage.removeItem('short_url_history');
    };

    const deleteHistoryItem = (id) => {
        const updatedHistory = history.filter(item => item.id !== id);
        setHistory(updatedHistory);
        localStorage.setItem('short_url_history', JSON.stringify(updatedHistory));
    };

    return (
        <div className="short-link-container">
            <div className="section-item">
                <div className="gtm-intro-card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(125, 157, 137, 0.1) 0%, rgba(125, 157, 137, 0.05) 100%)', borderColor: 'rgba(125, 157, 137, 0.2)' }}>
                    <div className="gtm-intro-icon" style={{ background: 'linear-gradient(135deg, var(--accent-color) 0%, #6B8A75 100%)' }}>
                        <Zap size={28} />
                    </div>
                    <div className="gtm-intro-content">
                        <h2 style={{ color: '#2C3E50' }}>短網址產生器</h2>
                        <p>將冗長的網址轉換為精簡的短網址，便於社群分享與印刷使用</p>
                    </div>
                </div>

                <div className="section-item">
                    <h3 className="section-title">
                        <LinkIcon size={16} />
                        輸入長網址
                    </h3>
                    <div className="utm-input-group" style={{ display: 'flex', gap: '10px' }}>
                        <input
                            type="text"
                            value={longUrl}
                            onChange={(e) => setLongUrl(e.target.value)}
                            placeholder="https://your-long-url.com/very/long/path/..."
                            style={{ flex: 1 }}
                        />
                        <button
                            className="btn-primary"
                            onClick={handleShorten}
                            disabled={loading || !longUrl}
                            style={{ whiteSpace: 'nowrap', minWidth: '120px' }}
                        >
                            {loading ? <Loader2 className="spin" size={18} /> : '產生短網址'}
                        </button>
                    </div>
                </div>

                {shortUrl && (
                    <div className="section-item animate-fade-in" style={{ marginTop: '24px' }}>
                        <h3 className="section-title">
                            <Zap size={16} color="var(--accent-color)" />
                            您的短網址
                        </h3>
                        <div className="tracked-url-result">
                            <div className="tracked-url-box" style={{ background: 'var(--accent-glow)', borderColor: 'var(--accent-color)' }}>
                                <code style={{ color: '#2C3E50', fontSize: '1.1rem' }}>{shortUrl}</code>
                            </div>
                            <div className="tracked-url-actions">
                                <button className="btn-primary" onClick={() => handleCopy(shortUrl)} style={{ flex: 2, background: 'var(--accent-color)' }}>
                                    {copied ? <Check size={16} /> : <Copy size={16} />}
                                    {copied ? '已複製！' : '複製短網址'}
                                </button>
                                <a href={shortUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ flex: 1, textDecoration: 'none' }}>
                                    <ExternalLink size={16} />
                                    測試
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid-layout" style={{ marginTop: '32px' }}>
                <div className="section-stack">
                    <div className="section-item">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                            <h3 className="section-title" style={{ margin: 0 }}>
                                <History size={16} />
                                歷史紀錄
                            </h3>
                            {history.length > 0 && (
                                <button className="btn-icon" onClick={clearHistory} title="清除紀錄" style={{ color: '#EF4444' }}>
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>

                        {history.length === 0 ? (
                            <div className="empty-state" style={{ padding: '40px' }}>
                                <History size={32} color="var(--text-tertiary)" />
                                <p style={{ color: 'var(--text-tertiary)', marginTop: '12px' }}>尚無縮網址紀錄</p>
                            </div>
                        ) : (
                            <div className="history-list">
                                {history.map((item) => (
                                    <div key={item.id} className="history-item animate-slide-in">
                                        <div className="history-info">
                                            <div className="short-display">
                                                <strong>{item.short}</strong>
                                                <span className="date-tag">{item.date}</span>
                                            </div>
                                            <div className="long-display">{item.long}</div>
                                        </div>
                                        <div className="history-actions">
                                            <button className="btn-icon" onClick={() => handleCopy(item.short)} title="複製">
                                                <Copy size={14} />
                                            </button>
                                            <a href={item.short} target="_blank" rel="noopener noreferrer" className="btn-icon" title="開啟">
                                                <ExternalLink size={14} />
                                            </a>
                                            <button
                                                className="btn-icon"
                                                onClick={() => deleteHistoryItem(item.id)}
                                                title="刪除"
                                                style={{ color: 'var(--error-color)' }}
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="section-stack">
                    <div className="section-item">
                        <h3 className="section-title">
                            <Info size={16} />
                            使用建議
                        </h3>
                        <div className="gtm-guide">
                            <div className="guide-step">
                                <span className="step-number" style={{ background: 'var(--accent-color)' }}>1</span>
                                <div className="step-content">
                                    <h4>配合 UTM 使用</h4>
                                    <p>先在「GTM 追蹤」分頁產生帶參數的網址，再貼到此處縮短。</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <span className="step-number" style={{ background: '#4A90E2' }}>2</span>
                                <div className="step-content">
                                    <h4>適用場景</h4>
                                    <p>社群貼文、簡訊通知、線下印刷品、名片 QR Code 等。</p>
                                </div>
                            </div>
                            <div className="guide-step">
                                <span className="step-number" style={{ background: '#4A90E2' }}>3</span>
                                <div className="step-content">
                                    <h4>安全性</h4>
                                    <p>本工具使用 GoTiny 提供服務，網址永久有效且不追蹤私密資訊。</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
