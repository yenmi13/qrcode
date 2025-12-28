import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import {
    Upload,
    Save,
    Download,
    Loader2,
    RefreshCw,
    Copy,
    Check,
    User,
    Briefcase,
    Building2,
    Phone,
    Mail,
    FileJson,
    Sparkles,
    Image as ImageIcon,
    FileText,
    FileSpreadsheet,
    ExternalLink,
    MessageCircle,
    Hash
} from 'lucide-react';

export default function OCRScannerTab() {
    const [file, setFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [copiedField, setCopiedField] = useState(null);

    // Data State
    const [rawText, setRawText] = useState('');
    const [parsedData, setParsedData] = useState({
        name: '',
        title: '',
        company: '',
        email: '',
        phone: '',
        line: '',
        taxId: ''
    });

    const onDrop = useCallback((acceptedFiles) => {
        const selectedFile = acceptedFiles[0];
        if (selectedFile) {
            setFile(selectedFile);
            setImagePreview(URL.createObjectURL(selectedFile));
            setRawText('');
            setParsedData({ name: '', title: '', company: '', email: '', phone: '', line: '', taxId: '' });
            processImage(selectedFile);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: false
    });

    const processImage = async (imageFile) => {
        setIsProcessing(true);
        setProgress(0);

        try {
            const result = await Tesseract.recognize(
                imageFile,
                'eng+chi_tra',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(Math.round(m.progress * 100));
                        }
                    }
                }
            );

            const text = result.data.text;
            setRawText(text);
            parseTextToFields(text);
        } catch (err) {
            console.error(err);
            alert('辨識失敗，請重試 (Error recognizing text)');
        } finally {
            setIsProcessing(false);
        }
    };

    const parseTextToFields = (text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(l => l);

        const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi;
        const phoneRegex = /(?:\+?\d{1,4}[ -]?)?(?:(?:\(\d{1,4}\))|\d{1,4})[ -]?\d{3,4}[ -]?\d{3,4}/g;
        // LINE ID: 通常在 "Line" 或 "LINE" 後面
        const lineRegex = /(?:line|LINE)[:\/\s]*([a-zA-Z0-9._-]+)/gi;
        // 統編: 8 位數字
        const taxIdRegex = /(?:統編|統一編號)[:：\s]*([0-9]{8})/gi;

        let email = '';
        let phone = '';
        let line = '';
        let taxId = '';

        const emailMatch = text.match(emailRegex);
        if (emailMatch) email = emailMatch[0];
        const phoneMatch = text.match(phoneRegex);
        if (phoneMatch) phone = phoneMatch[0];
        const lineMatch = text.match(lineRegex);
        if (lineMatch) {
            // 擷取 LINE ID 部分
            const lineIdMatch = lineMatch[0].match(/(?:line|LINE)[:\/\s]*([a-zA-Z0-9._-]+)/i);
            if (lineIdMatch) line = lineIdMatch[1];
        }
        const taxIdMatch = text.match(taxIdRegex);
        if (taxIdMatch) {
            const idMatch = taxIdMatch[0].match(/([0-9]{8})/);
            if (idMatch) taxId = idMatch[1];
        }

        let name = '';
        let title = '';
        let company = '';

        // 嘗試從文字中找到姓名（通常是第一行或第二行的中文/英文名字）
        for (const line of lines) {
            // 跳過包含 email、電話、網址的行
            if (line.includes('@') || line.match(/\d{4,}/) || line.includes('http') || line.includes('www')) {
                continue;
            }
            // 英文名字（大寫開頭）
            if (line.match(/^[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*$/) && line.length < 30) {
                name = line;
                break;
            }
            // 中文名字（2-4 字）
            if (line.match(/^[\u4e00-\u9fa5]{2,4}$/) && !name) {
                name = line;
                break;
            }
        }

        // 如果沒找到名字，用第一行
        if (!name && lines.length > 0) {
            name = lines[0];
        }

        lines.forEach(l => {
            if (l.match(/(Manager|Director|Engineer|Develop|Leader|CTO|CEO|長|理|員|師|總監|經理|協理|專員|主任|副總)/i) && l !== name) {
                title = l;
            }
            if (l.match(/(Co\.|Ltd|Inc|Corp|Company|公司|企業|股份|有限)/i)) {
                company = l;
            }
        });

        setParsedData(prev => ({
            ...prev,
            email,
            phone,
            line,
            taxId,
            name,
            title,
            company
        }));
    };

    const handleCopyField = (field, value) => {
        navigator.clipboard.writeText(value);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleCopyAll = () => {
        const allText = Object.entries(parsedData)
            .filter(([, value]) => value)
            .map(([key, value]) => `${key}: ${value}`)
            .join('\n');
        navigator.clipboard.writeText(allText);
        setCopiedField('all');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleSaveMock = () => {
        // 此功能暫時模擬儲存
        alert(`資料已複製到剪貼簿！\n\n姓名: ${parsedData.name}\nEmail: ${parsedData.email}`);
    };

    const handleDownloadJSON = () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parsedData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "business_card_data.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    };

    const handleDownloadCSV = () => {
        const headers = ['姓名', '職稱', '公司', '電話', 'Email'];
        const values = [parsedData.name, parsedData.title, parsedData.company, parsedData.phone, parsedData.email];
        const csvContent = headers.join(',') + '\n' + values.map(v => `"${v}"`).join(',');
        const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'business_card_data.csv';
        link.click();
    };

    const handleCopyForNotion = () => {
        // Notion 表格格式：用 Tab 分隔
        const notionFormat = `${parsedData.name}\t${parsedData.title}\t${parsedData.company}\t${parsedData.phone}\t${parsedData.email}`;
        navigator.clipboard.writeText(notionFormat);
        setCopiedField('notion');
        setTimeout(() => setCopiedField(null), 2000);
    };

    const formFields = [
        { key: 'name', label: '姓名', icon: User, placeholder: '請輸入姓名' },
        { key: 'title', label: '職稱', icon: Briefcase, placeholder: '請輸入職稱' },
        { key: 'company', label: '公司', icon: Building2, placeholder: '請輸入公司名稱' },
        { key: 'phone', label: '電話', icon: Phone, placeholder: '請輸入電話號碼' },
        { key: 'email', label: 'Email', icon: Mail, placeholder: '請輸入 Email' },
        { key: 'line', label: 'LINE', icon: MessageCircle, placeholder: '請輸入 LINE ID' },
        { key: 'taxId', label: '統編', icon: Hash, placeholder: '請輸入統一編號' },
    ];

    return (
        <div className="grid-layout">
            {/* Left: Upload & Preview */}
            <div className="section-stack">
                <div
                    {...getRootProps()}
                    className={`dropzone ${isDragActive ? 'active' : ''}`}
                    style={{ minHeight: imagePreview ? '280px' : '250px' }}
                >
                    <input {...getInputProps()} />
                    {imagePreview ? (
                        <img
                            src={imagePreview}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                maxHeight: '280px'
                            }}
                        />
                    ) : (
                        <div className="dropzone-content">
                            <div className="dropzone-icon">
                                <ImageIcon size={28} />
                            </div>
                            <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
                                {isDragActive ? '放開以上傳圖片' : '拖放名片或點擊上傳'}
                            </p>
                            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                支援 JPG, PNG, HEIC
                            </span>
                        </div>
                    )}

                    {isProcessing && (
                        <div className="processing-overlay">
                            <Loader2 className="spin" size={36} />
                            <p style={{ marginTop: 16, fontWeight: 500 }}>辨識中...</p>
                            <div className="progress-bar">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <span style={{ marginTop: 8, fontSize: 13 }}>{progress}%</span>
                        </div>
                    )}
                </div>

                {/* 辨識出來的原始文字 - 直接顯示在圖片下方 */}
                {rawText && (
                    <div className="ocr-result-box">
                        <div className="ocr-result-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <FileText size={16} color="var(--accent-color)" />
                                <span style={{ fontWeight: 600, color: 'var(--primary-color)' }}>辨識結果</span>
                            </div>
                            <button
                                className="btn-icon"
                                onClick={() => handleCopyField('raw', rawText)}
                                style={{ width: '28px', height: '28px' }}
                                title="複製全部文字"
                            >
                                {copiedField === 'raw' ? <Check size={12} color="var(--success-color)" /> : <Copy size={12} />}
                            </button>
                        </div>
                        <div className="ocr-result-content">
                            {rawText}
                        </div>
                    </div>
                )}

                <div className="feature-hint">
                    <Sparkles size={18} className="feature-hint-icon" />
                    <span className="feature-hint-text">
                        提示：請確保名片圖片清晰、光線充足，以獲得最佳辨識效果。支援中文及英文辨識。
                    </span>
                </div>
            </div>

            {/* Right: Results Form */}
            <div className="section-stack">
                <div className="control-row" style={{ borderBottom: '2px solid var(--accent-color)', paddingBottom: 12 }}>
                    <h3 className="section-title" style={{ border: 'none', padding: 0 }}>
                        整理後資料
                    </h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                        <button
                            className="btn-icon"
                            onClick={handleCopyAll}
                            title="複製全部"
                            style={{ width: '32px', height: '32px' }}
                        >
                            {copiedField === 'all' ? <Check size={14} color="var(--success-color)" /> : <Copy size={14} />}
                        </button>
                        <button
                            className="btn-icon"
                            onClick={() => file && processImage(file)}
                            title="重新辨識"
                            style={{ width: '32px', height: '32px' }}
                        >
                            <RefreshCw size={14} />
                        </button>
                    </div>
                </div>

                <div className="result-form">
                    {formFields.map(({ key, label, icon: Icon, placeholder }) => (
                        <div className="form-field" key={key}>
                            <label className="form-label">
                                <Icon size={14} />
                                {label}
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={key === 'email' ? 'email' : 'text'}
                                    value={parsedData[key]}
                                    onChange={e => setParsedData({ ...parsedData, [key]: e.target.value })}
                                    placeholder={placeholder}
                                    style={{ paddingRight: '40px' }}
                                />
                                {parsedData[key] && (
                                    <button
                                        className="btn-icon"
                                        onClick={() => handleCopyField(key, parsedData[key])}
                                        style={{
                                            position: 'absolute',
                                            right: '8px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: '28px',
                                            height: '28px',
                                            background: copiedField === key ? 'var(--success-color)' : 'transparent',
                                            color: copiedField === key ? '#fff' : 'var(--text-tertiary)',
                                            border: 'none'
                                        }}
                                        title="複製"
                                    >
                                        {copiedField === key ? <Check size={12} /> : <Copy size={12} />}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="action-row" style={{ marginTop: 16 }}>
                    <button
                        className="btn-primary"
                        style={{ flex: 1 }}
                        onClick={handleDownloadCSV}
                        title="可匯入 Google Sheets / Excel"
                    >
                        <FileSpreadsheet size={16} />
                        Google Sheets
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ flex: 1 }}
                        onClick={handleCopyForNotion}
                    >
                        {copiedField === 'notion' ? <Check size={16} /> : <ExternalLink size={16} />}
                        {copiedField === 'notion' ? '已複製！' : 'Notion'}
                    </button>
                    <button
                        className="btn-secondary"
                        style={{ flex: 1 }}
                        onClick={handleDownloadJSON}
                    >
                        <FileJson size={16} />
                        JSON
                    </button>
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 8 }}>
                    * Google Sheets: 下載 CSV 後匯入 | Notion: 複製後貼上表格
                </p>
            </div>
        </div>
    );
}
