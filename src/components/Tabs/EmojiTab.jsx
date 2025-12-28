import { useState } from 'react';
import {
    Copy,
    Check,
    Smile,
    Type,
    Star,
    Heart,
    Zap,
    MessageCircle,
    ThumbsUp,
    Clock,
    Calendar,
    MapPin,
    Phone,
    Mail,
    Search,
    Sparkles
} from 'lucide-react';

const PUNCTUATION_CATEGORIES = {
    '常用標點': [
        '、', '。', '，', '；', '：', '！', '？',
        '「」', '『』', '（）', '【】', '《》', '〈〉',
        '——', '……', '·', '～', '／', '＼',
        '＆', '＠', '＃', '％', '＊', '＋', '－', '＝'
    ],
    '特殊符號': [
        '→', '←', '↑', '↓', '↔', '↕', '⇒', '⇐',
        '★', '☆', '○', '●', '◎', '◇', '◆', '□', '■',
        '△', '▲', '▽', '▼', '♦', '♥', '♠', '♣',
        '✓', '✗', '✔', '✘', '©', '®', '™', '℃', '℉'
    ],
    '數學符號': [
        '±', '×', '÷', '≠', '≈', '≤', '≥', '∞',
        '∑', '∏', '√', '∝', '∈', '∉', '∩', '∪',
        '⊂', '⊃', '⊆', '⊇', '∀', '∃', '∧', '∨',
        '¹', '²', '³', '⁴', '⁵', '½', '¼', '¾'
    ],
    '貨幣符號': [
        '$', '¥', '€', '£', '₩', '฿', '₹', '₽'
    ]
};

const EMOJI_CATEGORIES = {
    '表情': [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂',
        '🙂', '😉', '😊', '😇', '🥰', '😍', '🤩', '😘',
        '😋', '😜', '🤪', '😝', '🤗', '🤔', '🤫', '🤭',
        '😏', '😌', '😴', '🥳', '😎', '🤓', '🧐', '😤'
    ],
    '手勢': [
        '👍', '👎', '👌', '✌️', '🤞', '🤟', '🤘', '🤙',
        '👈', '👉', '👆', '👇', '☝️', '✋', '🤚', '🖐️',
        '👋', '🤝', '🙏', '✍️', '💪', '👏', '🙌', '👐'
    ],
    '愛心': [
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍',
        '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘',
        '💝', '💟', '♥️', '🫶', '😻', '💑', '💏', '💌'
    ],
    '慶祝': [
        '🎉', '🎊', '🎁', '🎈', '🎂', '🎄', '🎃', '🎆',
        '🎇', '🧨', '✨', '🎐', '🎏', '🎎', '🏮', '🎗️',
        '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '💫', '🔥'
    ],
    '商務': [
        '📌', '📍', '📎', '📝', '📋', '📊', '📈', '📉',
        '💼', '📁', '📂', '🗂️', '📅', '📆', '🗓️', '📇',
        '💰', '💵', '💴', '💶', '💷', '💳', '🧾', '📧'
    ],
    '社群': [
        '👀', '💬', '💭', '🗯️', '📣', '📢', '🔔', '🔕',
        '▶️', '⏸️', '⏹️', '⏺️', '⏭️', '⏮️', '🔁', '🔂',
        '🔗', '📲', '📱', '💻', '🖥️', '⌨️', '🖱️', '📷'
    ],
    '天氣時間': [
        '☀️', '🌤️', '⛅', '🌥️', '☁️', '🌦️', '🌧️', '⛈️',
        '🌩️', '🌨️', '❄️', '🌬️', '💨', '🌪️', '🌈', '🌙',
        '⏰', '⏱️', '⏲️', '🕐', '🕑', '🕒', '🕓', '🕔'
    ],
    '食物': [
        '🍕', '🍔', '🍟', '🌭', '🍿', '🧂', '🥓', '🍳',
        '🍜', '🍝', '🍣', '🍱', '🍙', '🍚', '🍛', '🍲',
        '☕', '🍵', '🧃', '🥤', '🍺', '🍻', '🥂', '🍷'
    ]
};

const KAOMOJI_CATEGORIES = {
    '開心': [
        '(◕‿◕)', '(｡◕‿◕｡)', '(≧◡≦)', '(≧▽≦)', '٩(˘◡˘)۶',
        '(´▽`)', '(`・ω・´)', '((◔ω◔))', '(⌐■_■)', 'o(　∴′ ▽′∴　)੦',
        '(￣▽￣)/', '\\(◎○◎)/', '(⁀@^_^@⁀)', '(ˆᴗˆ)♡'
    ],
    '可愛': [
        '(・ω<)☆', '(=´∀`=)', '(⁀‿‿⁀)', '(o´∀`o)', '(^▽^)/',
        '(♡ω♡)', '(´・ω・`)', '(⁀ﾟーﾟ⁀)', '(੦´ω`੦)', '(⊃･ω･)⊃',
        '(∩>ᗜ<∩)', '☉‿☉', 'OwO', 'UwU'
    ],
    '傷心': [
        '(੦•́_•̀੦)', '(╯°□°)╯︵ ┻━┻', '(ಠ_ಠ)', '(￣へ￣)', '(;-;)',
        '(●´ω`●)', '(╥﹏╥)', '(っ˘ɛ˘ς)', '(T_T)', '(⊙o⊙)',
        '(ʒ_ʒ)', 'ಥ_ಥ', '(;_;)', '(´;ω;`)ﾉ'
    ],
    '生氣': [
        '(╯°□°）╯︵ ┻━┻', '(੦•̀ω•́)', '(>＜)', '(⁀◔‿◔⁀)',
        '੦(`△´)੦', '(¬_¬")', '( ͡° ͜ʖ ͡°)', '(☞ﾟヮﾟ)☞',
        'ď(´_`´)đ', '(•̀ω•́)', '(ʔ̌Ǫلـ̜Ǫ̆ʔ̌)', '(#`ー´)'
    ],
    '愛情': [
        '(♥ω♥ )', '(*≧▽≦)ゞ', '(^.^)', '❤(´･ᴗ･`)❤',
        '(੦੦ˆ ᴗ ˆ੦੦)', '(つ̄‿̄)つ', '(▀̿Ĺ̯▀̿ ̿)/', '✩*･ﾟ☆｡✩',
        '(o´∀`o)♥', '♡☀(´♡`)メ☀♡', '(︵‿︵ )੩', '( ´•̥̥̥ω•̥̥̥`)'
    ],
    '翻桌': [
        '┬─┬ノ( º _ ºノ)', '( ▀̿Ĺ̯▀̿)', '(╯°□°)╯︵▀▀▀▀▀▀▀▀▀▀',
        '┬─┬/̵̵̿̿̅̅\\ (º _ º̵̵ / )', '┐(◀ε▀ )┌', '┬─┬/̵̵̿̿̅̅(̵̵̿̿̅̅◇̿͜◇̿)/̵̵̿̿̅̅',
        '(⌐■_■)', '٩( ʒ )۶', 'ಥ_ಥ', '(▀▀ Ĺ̯▀ )و▀▀ ︵┬─┬'
    ],
    '打招呼': [
        '(੦´ー`)੦', '(=ﾟωﾟ)ノ', '(´｡•ω•｡`)', 'ヽ(·∀·)ﾉ',
        '(▀̿Ĺ̯▀̿)', 'o(ああ ・_・ああ)੦', '੦(ﾟ▽ﾟ*)੦', '(∗´∇`∗)',
        '\\(・ω・\\)', '(\\￣▽\\￣)/', '(*▀乷▀)', '(っ˘ω˘ς )'
    ],
    '動作表情': [
        '─=≡Σ((੦(　ಥ益ಥ)੦))', '(ﾉ◔益◔)ﾉ', '(۶´•ʚ•`۶)੦',
        '(\\/°-°\\/)', '☝(´▽`)☝', '(ノಠ益ಠ)ノ', '\\(　´◡`　)/',
        'ヽ(･∀･)ﾉ♪♪', '《(´ω`)》゜。*', '(o・ω・)ﾉ))', 'ヾ(´∀`)ﾉ☆*。'
    ]
};

export default function EmojiTab() {
    const [copiedItem, setCopiedItem] = useState(null);
    const [activeCategory, setActiveCategory] = useState('punctuation');

    const handleCopy = (item) => {
        navigator.clipboard.writeText(item);
        setCopiedItem(item);
        setTimeout(() => setCopiedItem(null), 1500);
    };

    return (
        <div className="emoji-container">
            <div className="gtm-intro-card" style={{ marginBottom: '24px' }}>
                <div className="gtm-intro-icon">
                    <Smile size={28} />
                </div>
                <div className="gtm-intro-content">
                    <h2>常用標點符號 & Emoji & 顏文字</h2>
                    <p>點擊即可複製到剪貼簿，方便快速使用</p>
                </div>
            </div>

            {/* 類別切換 */}
            <div className="section-item" style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                    <button
                        className={`btn-${activeCategory === 'punctuation' ? 'primary' : 'secondary'}`}
                        onClick={() => setActiveCategory('punctuation')}
                        style={{ flex: 1 }}
                    >
                        <Type size={16} />
                        標點符號
                    </button>
                    <button
                        className={`btn-${activeCategory === 'emoji' ? 'primary' : 'secondary'}`}
                        onClick={() => setActiveCategory('emoji')}
                        style={{ flex: 1 }}
                    >
                        <Smile size={16} />
                        Emoji
                    </button>
                    <button
                        className={`btn-${activeCategory === 'kaomoji' ? 'primary' : 'secondary'}`}
                        onClick={() => setActiveCategory('kaomoji')}
                        style={{ flex: 1 }}
                    >
                        <Sparkles size={16} />
                        顏文字
                    </button>
                </div>
            </div>

            {/* 標點符號 */}
            {activeCategory === 'punctuation' && (
                <div className="emoji-grid-container">
                    {Object.entries(PUNCTUATION_CATEGORIES).map(([category, items]) => (
                        <div key={category} className="emoji-category-card">
                            <h3 className="emoji-category-title">{category}</h3>
                            <div className="emoji-grid">
                                {items.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`emoji-btn ${copiedItem === item ? 'copied' : ''}`}
                                        onClick={() => handleCopy(item)}
                                        title="點擊複製"
                                    >
                                        {copiedItem === item ? <Check size={14} /> : item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Emoji */}
            {activeCategory === 'emoji' && (
                <div className="emoji-grid-container">
                    {Object.entries(EMOJI_CATEGORIES).map(([category, items]) => (
                        <div key={category} className="emoji-category-card">
                            <h3 className="emoji-category-title">{category}</h3>
                            <div className="emoji-grid emoji-large">
                                {items.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`emoji-btn ${copiedItem === item ? 'copied' : ''}`}
                                        onClick={() => handleCopy(item)}
                                        title="點擊複製"
                                    >
                                        {copiedItem === item ? '✓' : item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 顏文字 */}
            {activeCategory === 'kaomoji' && (
                <div className="emoji-grid-container">
                    {Object.entries(KAOMOJI_CATEGORIES).map(([category, items]) => (
                        <div key={category} className="emoji-category-card">
                            <h3 className="emoji-category-title">{category}</h3>
                            <div className="kaomoji-grid">
                                {items.map((item, index) => (
                                    <button
                                        key={index}
                                        className={`kaomoji-btn ${copiedItem === item ? 'copied' : ''}`}
                                        onClick={() => handleCopy(item)}
                                        title="點擊複製"
                                    >
                                        {copiedItem === item ? '✓ 已複製' : item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* 提示 */}
            <div className="feature-hint" style={{ marginTop: 24 }}>
                <Zap size={18} className="feature-hint-icon" />
                <div className="feature-hint-text">
                    <strong>小技巧：</strong>
                    點擊符號、Emoji 或顏文字即可自動複製到剪貼簿，然後在任何地方使用 Ctrl+V (或 Cmd+V) 貼上。
                </div>
            </div>
        </div>
    );
}
