import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import imageCompression from 'browser-image-compression';
import JSZip from 'jszip';
import {
    Upload,
    Image as ImageIcon,
    Download,
    X,
    Info,
    Sparkles,
    Monitor,
    Smartphone,
    Grid,
    Loader2,
    Check,
    FileImage,
    Archive,
    Type,
    ImagePlus
} from 'lucide-react';

const PLATFORM_PRESETS = {
    'Facebook': [
        { name: '動態消息', width: 1200, height: 628 },
        { name: '動態消息 (方形)', width: 1080, height: 1080 },
        { name: '限時動態', width: 1080, height: 1920 },
        { name: '大頭貼', width: 180, height: 180 },
        { name: '封面相片', width: 820, height: 312 },
    ],
    'Instagram': [
        { name: '貼文 (方形)', width: 1080, height: 1080 },
        { name: '貼文 (直式)', width: 1080, height: 1350 },
        { name: '限時動態 / Reels', width: 1080, height: 1920 },
        { name: 'IGTV 封面', width: 420, height: 654 },
    ],
    'Google Ads': [
        { name: '橫幅廣告', width: 1200, height: 628 },
        { name: '方形廣告', width: 1200, height: 1200 },
        { name: '直式廣告', width: 960, height: 1200 },
    ],
    'LINE': [
        { name: '官方帳號封面', width: 1200, height: 800 },
        { name: '圖文訊息 (方形)', width: 1040, height: 1040 },
        { name: '圖文訊息 (橫式)', width: 1040, height: 520 },
    ],
    'YouTube': [
        { name: '頻道封面', width: 2560, height: 1440 },
        { name: '影片縮圖', width: 1280, height: 720 },
        { name: 'Shorts', width: 1080, height: 1920 },
    ],
};

export default function ImageResizerTab() {
    const [images, setImages] = useState([]);
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customSize, setCustomSize] = useState({ width: '', height: '' });
    const [outputFormat, setOutputFormat] = useState('original');
    const [resizeMode, setResizeMode] = useState('cover'); // 'cover' | 'contain' | 'stretch'
    const [enableTargetSize, setEnableTargetSize] = useState(false);
    const [targetSize, setTargetSize] = useState('');
    const [targetSizeUnit, setTargetSizeUnit] = useState('KB'); // 'KB' | 'MB'
    const [enableWatermark, setEnableWatermark] = useState(false);
    const [watermarkType, setWatermarkType] = useState('text'); // 'text' | 'image'
    const [watermarkText, setWatermarkText] = useState('');
    const [watermarkImage, setWatermarkImage] = useState(null);
    const [watermarkPosition, setWatermarkPosition] = useState('bottom-right'); // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
    const [processing, setProcessing] = useState(false);

    const onDrop = useCallback((acceptedFiles) => {
        const newImages = acceptedFiles.map(file => ({
            id: Math.random().toString(36),
            file,
            preview: URL.createObjectURL(file),
            originalSize: file.size,
            originalName: file.name,
            processed: null,
            processedSize: null,
            processing: false
        }));
        setImages(prev => [...prev, ...newImages]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
        multiple: true
    });

    const removeImage = (id) => {
        setImages(prev => prev.filter(img => img.id !== id));
    };

    const rotateImage = (imageId, degrees) => {
        setImages(prev => prev.map(img => {
            if (img.id === imageId) {
                const currentRotation = img.rotation || 0;
                return { ...img, rotation: (currentRotation + degrees) % 360 };
            }
            return img;
        }));
    };

    const processImage = async (image) => {
        setImages(prev => prev.map(img =>
            img.id === image.id ? { ...img, processing: true } : img
        ));

        try {
            let targetWidth, targetHeight;

            if (selectedPreset) {
                targetWidth = selectedPreset.width;
                targetHeight = selectedPreset.height;
            } else if (customSize.width && customSize.height) {
                targetWidth = parseInt(customSize.width);
                targetHeight = parseInt(customSize.height);
            }

            // 創建 canvas 來處理旋轉和裁切
            const img = new Image();
            img.src = image.preview;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            let canvas = document.createElement('canvas');
            let ctx = canvas.getContext('2d');

            // 應用旋轉
            const rotation = image.rotation || 0;
            let sourceWidth = img.width;
            let sourceHeight = img.height;

            if (rotation === 90 || rotation === 270) {
                canvas.width = sourceHeight;
                canvas.height = sourceWidth;
            } else {
                canvas.width = sourceWidth;
                canvas.height = sourceHeight;
            }

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate(rotation * Math.PI / 180);
            ctx.drawImage(img, -sourceWidth / 2, -sourceHeight / 2);

            // 取得旋轉後的圖片
            const rotatedBlob = await new Promise(resolve => canvas.toBlob(resolve));
            const rotatedFile = new File([rotatedBlob], image.file.name, { type: image.file.type });

            // 準備壓縮選項
            let options = {
                useWebWorker: true,
                fileType: outputFormat === 'original' ? image.file.type : `image/${outputFormat}`,
                initialQuality: 0.8,
            };

            // 如果啟用目標檔案大小，添加目標大小
            if (enableTargetSize && targetSize) {
                const targetBytes = targetSizeUnit === 'MB'
                    ? parseFloat(targetSize) * 1024 * 1024
                    : parseFloat(targetSize) * 1024;
                options.maxSizeMB = targetBytes / (1024 * 1024);
            }

            if (targetWidth && targetHeight) {
                // 根據調整模式設定
                if (resizeMode === 'cover') {
                    // 填滿模式：圖片會填滿整個區域，多餘部分裁切
                    options.maxWidthOrHeight = Math.max(targetWidth, targetHeight);
                } else if (resizeMode === 'contain') {
                    // 適應模式：圖片完整顯示，可能有留白
                    options.maxWidthOrHeight = Math.min(targetWidth, targetHeight);
                } else {
                    // 拉伸模式
                    options.maxWidthOrHeight = Math.max(targetWidth, targetHeight);
                }
            }

            let compressedFile = await imageCompression(rotatedFile, options);

            // 如果需要精確尺寸且使用 cover 或 stretch 模式，使用 canvas 調整
            if (targetWidth && targetHeight && (resizeMode === 'cover' || resizeMode === 'stretch')) {
                const compressedImg = new Image();
                compressedImg.src = URL.createObjectURL(compressedFile);

                await new Promise((resolve) => {
                    compressedImg.onload = resolve;
                });

                canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx = canvas.getContext('2d');

                if (resizeMode === 'cover') {
                    // 計算裁切位置（居中裁切）
                    const scale = Math.max(targetWidth / compressedImg.width, targetHeight / compressedImg.height);
                    const scaledWidth = compressedImg.width * scale;
                    const scaledHeight = compressedImg.height * scale;
                    const x = (targetWidth - scaledWidth) / 2;
                    const y = (targetHeight - scaledHeight) / 2;

                    ctx.drawImage(compressedImg, x, y, scaledWidth, scaledHeight);
                } else {
                    // stretch 模式：直接拉伸
                    ctx.drawImage(compressedImg, 0, 0, targetWidth, targetHeight);
                }

                const finalBlob = await new Promise(resolve =>
                    canvas.toBlob(resolve, `image/${outputFormat === 'original' ? 'jpeg' : outputFormat}`, 0.8)
                );
                compressedFile = new File([finalBlob], image.file.name, { type: finalBlob.type });
            }

            // 添加浮水印
            if (enableWatermark && (watermarkText || watermarkImage)) {
                const watermarkImg = new Image();
                watermarkImg.src = URL.createObjectURL(compressedFile);

                await new Promise((resolve) => {
                    watermarkImg.onload = resolve;
                });

                canvas = document.createElement('canvas');
                canvas.width = watermarkImg.width;
                canvas.height = watermarkImg.height;
                ctx = canvas.getContext('2d');

                ctx.drawImage(watermarkImg, 0, 0);

                const padding = 20;

                if (watermarkType === 'text' && watermarkText) {
                    // 文字浮水印
                    const fontSize = Math.max(12, Math.min(canvas.width, canvas.height) * 0.04);
                    ctx.font = `${fontSize}px Arial`;
                    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
                    ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
                    ctx.lineWidth = 1;

                    let x, y;
                    switch (watermarkPosition) {
                        case 'top-left':
                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'top';
                            x = padding;
                            y = padding;
                            break;
                        case 'top-right':
                            ctx.textAlign = 'right';
                            ctx.textBaseline = 'top';
                            x = canvas.width - padding;
                            y = padding;
                            break;
                        case 'bottom-left':
                            ctx.textAlign = 'left';
                            ctx.textBaseline = 'bottom';
                            x = padding;
                            y = canvas.height - padding;
                            break;
                        default: // bottom-right
                            ctx.textAlign = 'right';
                            ctx.textBaseline = 'bottom';
                            x = canvas.width - padding;
                            y = canvas.height - padding;
                    }

                    ctx.strokeText(watermarkText, x, y);
                    ctx.fillText(watermarkText, x, y);
                } else if (watermarkType === 'image' && watermarkImage) {
                    // 圖片浮水印
                    const logoImg = new Image();
                    logoImg.src = watermarkImage;

                    await new Promise((resolve) => {
                        logoImg.onload = resolve;
                    });

                    // 計算 logo 尺寸（最大為圖片的 15%）
                    const maxLogoSize = Math.min(canvas.width, canvas.height) * 0.15;
                    const logoScale = Math.min(maxLogoSize / logoImg.width, maxLogoSize / logoImg.height);
                    const logoWidth = logoImg.width * logoScale;
                    const logoHeight = logoImg.height * logoScale;

                    let x, y;
                    switch (watermarkPosition) {
                        case 'top-left':
                            x = padding;
                            y = padding;
                            break;
                        case 'top-right':
                            x = canvas.width - logoWidth - padding;
                            y = padding;
                            break;
                        case 'bottom-left':
                            x = padding;
                            y = canvas.height - logoHeight - padding;
                            break;
                        default: // bottom-right
                            x = canvas.width - logoWidth - padding;
                            y = canvas.height - logoHeight - padding;
                    }

                    ctx.drawImage(logoImg, x, y, logoWidth, logoHeight);
                }

                const watermarkedBlob = await new Promise(resolve =>
                    canvas.toBlob(resolve, `image/${outputFormat === 'original' ? 'jpeg' : outputFormat}`, 0.8)
                );
                compressedFile = new File([watermarkedBlob], image.file.name, { type: watermarkedBlob.type });
            }

            const compressedUrl = URL.createObjectURL(compressedFile);

            setImages(prev => prev.map(img =>
                img.id === image.id ? {
                    ...img,
                    processed: compressedUrl,
                    processedSize: compressedFile.size,
                    processedFile: compressedFile,
                    processing: false
                } : img
            ));
        } catch (error) {
            console.error('壓縮失敗:', error);
            setImages(prev => prev.map(img =>
                img.id === image.id ? { ...img, processing: false } : img
            ));
        }
    };

    const processAllImages = async () => {
        setProcessing(true);
        for (const image of images) {
            if (!image.processed) {
                await processImage(image);
            }
        }
        setProcessing(false);
    };

    const downloadImage = (image) => {
        if (!image.processed) return;

        const link = document.createElement('a');
        link.href = image.processed;
        const extension = outputFormat === 'original'
            ? image.originalName.split('.').pop()
            : outputFormat;
        link.download = `compressed_${image.originalName.replace(/\.[^/.]+$/, '')}.${extension}`;
        link.click();
    };

    const downloadAllAsZip = async () => {
        const processedImages = images.filter(img => img.processedFile);
        if (processedImages.length === 0) {
            alert('請先壓縮圖片後再下載');
            return;
        }

        const zip = new JSZip();
        const folder = zip.folder('compressed_images');

        for (const image of processedImages) {
            const extension = outputFormat === 'original'
                ? image.originalName.split('.').pop()
                : outputFormat;
            const fileName = `compressed_${image.originalName.replace(/\.[^/.]+$/, '')}.${extension}`;

            // 將 blob 轉換為 ArrayBuffer
            const arrayBuffer = await image.processedFile.arrayBuffer();
            folder.file(fileName, arrayBuffer);
        }

        const blob = await zip.generateAsync({ type: 'blob' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `compressed_images_${Date.now()}.zip`;
        link.click();
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const calculateSavings = (original, compressed) => {
        if (!original || !compressed) return 0;
        return Math.round((1 - compressed / original) * 100);
    };

    return (
        <div className="image-resizer-container">
            <div className="image-resizer-intro">
                <div className="image-resizer-intro-card">
                    <div className="image-resizer-intro-icon">
                        <ImageIcon size={28} />
                    </div>
                    <div className="image-resizer-intro-content">
                        <h2>專業圖片壓縮工具</h2>
                        <p>支援批量處理、廣告平台預設尺寸、格式轉換</p>
                    </div>
                </div>
            </div>

            <div className="grid-layout">
                {/* Left: Upload & Settings */}
                <div className="section-stack">
                    {/* Upload Area */}
                    <div className="section-item">
                        <h3 className="section-title">
                            <Upload size={16} />
                            上傳圖片
                        </h3>
                        <div
                            {...getRootProps()}
                            className={`dropzone ${isDragActive ? 'active' : ''}`}
                            style={{ minHeight: '200px' }}
                        >
                            <input {...getInputProps()} />
                            <div className="dropzone-content">
                                <div className="dropzone-icon">
                                    <FileImage size={28} />
                                </div>
                                <p style={{ margin: '0 0 8px', fontWeight: 500 }}>
                                    {isDragActive ? '放開以上傳圖片' : '拖放圖片或點擊上傳'}
                                </p>
                                <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                    支援 JPEG、PNG、WebP、GIF（可批量上傳）
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Platform Presets */}
                    <div className="section-item">
                        <h3 className="section-title">
                            <Grid size={16} />
                            廣告平台預設尺寸
                        </h3>
                        <select
                            value={selectedPreset ? `${selectedPreset.platform}|${selectedPreset.name}` : ''}
                            onChange={(e) => {
                                if (e.target.value) {
                                    const [platform, name] = e.target.value.split('|');
                                    const preset = PLATFORM_PRESETS[platform].find(p => p.name === name);
                                    if (preset) {
                                        setSelectedPreset({ ...preset, platform });
                                        setCustomSize({ width: '', height: '' });
                                    }
                                } else {
                                    setSelectedPreset(null);
                                }
                            }}
                            style={{ width: '100%' }}
                        >
                            <option value="">請選擇平台與尺寸...</option>
                            {Object.entries(PLATFORM_PRESETS).map(([platform, presets]) => (
                                <optgroup key={platform} label={platform}>
                                    {presets.map((preset) => (
                                        <option key={`${platform}-${preset.name}`} value={`${platform}|${preset.name}`}>
                                            {preset.name} ({preset.width}x{preset.height})
                                        </option>
                                    ))}
                                </optgroup>
                            ))}
                        </select>
                        {selectedPreset && (
                            <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--accent-glow)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 500, color: 'var(--primary-color)' }}>
                                    {selectedPreset.platform} - {selectedPreset.name}
                                </span>
                                <span style={{ fontFamily: 'monospace', color: 'var(--accent-color)' }}>
                                    {selectedPreset.width} × {selectedPreset.height}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Custom Size */}
                    <div className="section-item">
                        <h3 className="section-title">
                            <Sparkles size={16} />
                            自訂尺寸
                        </h3>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                            <input
                                type="number"
                                placeholder="寬度 (px)"
                                value={customSize.width}
                                onChange={(e) => {
                                    setCustomSize({ ...customSize, width: e.target.value });
                                    setSelectedPreset(null);
                                }}
                                style={{ flex: 1 }}
                            />
                            <span>×</span>
                            <input
                                type="number"
                                placeholder="高度 (px)"
                                value={customSize.height}
                                onChange={(e) => {
                                    setCustomSize({ ...customSize, height: e.target.value });
                                    setSelectedPreset(null);
                                }}
                                style={{ flex: 1 }}
                            />
                        </div>
                    </div>

                    {/* Compression Settings */}
                    <div className="section-item">
                        <h3 className="section-title">
                            <Monitor size={16} />
                            壓縮設定
                        </h3>



                        <div className="control-row" style={{ marginTop: 16 }}>
                            <label className="control-label">調整模式</label>
                            <select
                                value={resizeMode}
                                onChange={(e) => setResizeMode(e.target.value)}
                                style={{ width: 140 }}
                            >
                                <option value="cover">填滿裁切</option>
                                <option value="contain">等比縮放</option>
                                <option value="stretch">拉伸</option>
                            </select>
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                            {resizeMode === 'cover' && '填滿整個尺寸，多餘部分裁切（推薦）'}
                            {resizeMode === 'contain' && '等比例縮放，可能有留白'}
                            {resizeMode === 'stretch' && '強制拉伸，可能變形'}
                        </div>

                        <div className="control-row" style={{ marginTop: 16 }}>
                            <label className="control-label">輸出格式</label>
                            <select
                                value={outputFormat}
                                onChange={(e) => setOutputFormat(e.target.value)}
                                style={{ width: 140 }}
                            >
                                <option value="original">保持原格式</option>
                                <option value="jpeg">JPEG</option>
                                <option value="png">PNG</option>
                                <option value="webp">WebP</option>
                            </select>
                        </div>

                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                            <div className="control-row" style={{ marginBottom: 12 }}>
                                <label className="control-label">目標檔案大小</label>
                                <label className="toggle-switch" style={{ width: 48, height: 24 }}>
                                    <input
                                        type="checkbox"
                                        checked={enableTargetSize}
                                        onChange={(e) => setEnableTargetSize(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {enableTargetSize && (
                                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        placeholder="例如：500"
                                        value={targetSize}
                                        onChange={(e) => setTargetSize(e.target.value)}
                                        style={{ flex: 1 }}
                                        min="1"
                                        step="0.1"
                                    />
                                    <select
                                        value={targetSizeUnit}
                                        onChange={(e) => setTargetSizeUnit(e.target.value)}
                                        style={{ width: 80 }}
                                    >
                                        <option value="KB">KB</option>
                                        <option value="MB">MB</option>
                                    </select>
                                </div>
                            )}
                            {enableTargetSize && (
                                <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}>
                                    自動調整壓縮品質以達到目標檔案大小
                                </div>
                            )}
                        </div>

                        <div style={{ marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-color)' }}>
                            <div className="control-row" style={{ marginBottom: 12 }}>
                                <label className="control-label">
                                    <Type size={14} style={{ marginRight: 6 }} />
                                    浮水印
                                </label>
                                <label className="toggle-switch" style={{ width: 48, height: 24 }}>
                                    <input
                                        type="checkbox"
                                        checked={enableWatermark}
                                        onChange={(e) => setEnableWatermark(e.target.checked)}
                                    />
                                    <span className="toggle-slider"></span>
                                </label>
                            </div>

                            {enableWatermark && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    {/* 浮水印類型選擇 */}
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button
                                            className={`utm-preset-btn ${watermarkType === 'text' ? 'active' : ''}`}
                                            onClick={() => setWatermarkType('text')}
                                            style={{ flex: 1 }}
                                        >
                                            <Type size={14} />
                                            文字
                                        </button>
                                        <button
                                            className={`utm-preset-btn ${watermarkType === 'image' ? 'active' : ''}`}
                                            onClick={() => setWatermarkType('image')}
                                            style={{ flex: 1 }}
                                        >
                                            <ImagePlus size={14} />
                                            圖片/Logo
                                        </button>
                                    </div>

                                    {/* 文字浮水印輸入 */}
                                    {watermarkType === 'text' && (
                                        <input
                                            type="text"
                                            placeholder="輸入浮水印文字（例如：© 公司名稱）"
                                            value={watermarkText}
                                            onChange={(e) => setWatermarkText(e.target.value)}
                                            style={{ width: '100%' }}
                                        />
                                    )}

                                    {/* 圖片浮水印上傳 */}
                                    {watermarkType === 'image' && (
                                        <div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                id="watermark-upload"
                                                style={{ display: 'none' }}
                                                onChange={(e) => {
                                                    const file = e.target.files[0];
                                                    if (file) {
                                                        setWatermarkImage(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor="watermark-upload"
                                                className="btn-secondary"
                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', width: '100%' }}
                                            >
                                                <ImagePlus size={16} />
                                                {watermarkImage ? '更換 Logo' : '上傳 Logo 圖片'}
                                            </label>
                                            {watermarkImage && (
                                                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <img src={watermarkImage} alt="Logo" style={{ height: 40, borderRadius: 4 }} />
                                                    <button
                                                        className="btn-icon"
                                                        onClick={() => setWatermarkImage(null)}
                                                        style={{ color: 'var(--error-color)' }}
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* 位置選擇 */}
                                    <div>
                                        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>放置位置</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                                            <button
                                                className={`utm-preset-btn ${watermarkPosition === 'top-left' ? 'active' : ''}`}
                                                onClick={() => setWatermarkPosition('top-left')}
                                            >左上</button>
                                            <button
                                                className={`utm-preset-btn ${watermarkPosition === 'top-right' ? 'active' : ''}`}
                                                onClick={() => setWatermarkPosition('top-right')}
                                            >右上</button>
                                            <button
                                                className={`utm-preset-btn ${watermarkPosition === 'bottom-left' ? 'active' : ''}`}
                                                onClick={() => setWatermarkPosition('bottom-left')}
                                            >左下</button>
                                            <button
                                                className={`utm-preset-btn ${watermarkPosition === 'bottom-right' ? 'active' : ''}`}
                                                onClick={() => setWatermarkPosition('bottom-right')}
                                            >右下</button>
                                        </div>
                                    </div>

                                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                                        浮水印將距離邊緣 20px
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {images.length > 0 && (
                        <div style={{ display: 'flex', gap: 12, flexDirection: 'column' }}>
                            <button
                                className="btn-primary"
                                style={{ width: '100%' }}
                                onClick={processAllImages}
                                disabled={processing}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 className="spin" size={16} />
                                        處理中...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={16} />
                                        批量壓縮全部圖片
                                    </>
                                )}
                            </button>
                            <button
                                className="btn-secondary"
                                style={{ width: '100%' }}
                                onClick={downloadAllAsZip}
                                disabled={images.filter(img => img.processedFile).length === 0}
                            >
                                <Archive size={16} />
                                打包下載 ZIP
                            </button>
                        </div>
                    )}
                </div>

                {/* Right: Preview & Results */}
                <div className="section-stack">
                    {images.length === 0 ? (
                        <div className="empty-state">
                            <ImageIcon size={48} color="var(--text-tertiary)" />
                            <p style={{ color: 'var(--text-secondary)', marginTop: 16 }}>
                                尚未上傳圖片
                            </p>
                            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
                                請從左側上傳圖片開始使用
                            </p>
                        </div>
                    ) : (
                        <>
                            <h3 className="section-title">
                                <FileImage size={16} />
                                圖片列表 ({images.length})
                            </h3>
                            <div className="image-list">
                                {images.map((image) => (
                                    <div key={image.id} className="image-item">
                                        <div className="image-preview-wrapper">
                                            <img
                                                src={image.preview}
                                                alt={image.originalName}
                                                className="image-preview"
                                            />
                                            <button
                                                className="remove-btn"
                                                onClick={() => removeImage(image.id)}
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>

                                        <div className="image-info">
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                <div className="image-name" title={image.originalName}>
                                                    {image.originalName.length > 15
                                                        ? image.originalName.slice(0, 15) + '...'
                                                        : image.originalName
                                                    }
                                                </div>
                                                <button
                                                    className="rotate-btn"
                                                    onClick={() => rotateImage(image.id, 90)}
                                                    title="旋轉 90 度"
                                                >
                                                    ↻ {image.rotation ? `${image.rotation}°` : ''}
                                                </button>
                                            </div>

                                            {image.processed ? (
                                                <div className="size-comparison">
                                                    <div className="size-original">
                                                        {formatFileSize(image.originalSize)}
                                                    </div>
                                                    <div className="size-arrow">→</div>
                                                    <div className="size-compressed">
                                                        {formatFileSize(image.processedSize)}
                                                        <span className="savings">
                                                            (-{calculateSavings(image.originalSize, image.processedSize)}%)
                                                        </span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="size-info">
                                                    {formatFileSize(image.originalSize)}
                                                </div>
                                            )}

                                            <div className="image-actions">
                                                {image.processing ? (
                                                    <button className="btn-secondary" disabled>
                                                        <Loader2 className="spin" size={14} />
                                                        處理中...
                                                    </button>
                                                ) : image.processed ? (
                                                    <>
                                                        <button
                                                            className="btn-primary"
                                                            style={{ flex: 1 }}
                                                            onClick={() => downloadImage(image)}
                                                        >
                                                            <Download size={14} />
                                                            下載
                                                        </button>
                                                        <button
                                                            className="btn-secondary"
                                                            onClick={() => processImage(image)}
                                                        >
                                                            重新壓縮
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        className="btn-primary"
                                                        style={{ width: '100%' }}
                                                        onClick={() => processImage(image)}
                                                    >
                                                        <Sparkles size={14} />
                                                        開始壓縮
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <div className="feature-hint" style={{ marginTop: 24 }}>
                <Info size={18} className="feature-hint-icon" />
                <div className="feature-hint-text">
                    <strong>使用提示：</strong>
                    圖片壓縮完全在您的瀏覽器中處理，不會上傳到伺服器，保護您的隱私安全。
                    支援批量處理多張圖片，並可選擇廣告平台預設尺寸快速調整。
                </div>
            </div>
        </div>
    );
}
