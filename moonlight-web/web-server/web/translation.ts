// translations.ts
//
// Self-contained localization module for the Rigzer Stream UI.
//
// IMPORTANT: This module intentionally does NOT depend on the main Rigzer
// website, its cookies, API responses, user profile, or any "locale" object
// coming from elsewhere. It determines the UI language purely from the
// browser's own language preferences (navigator.languages / navigator.language)
// and works completely offline (no network calls, no external translation
// API). This lets the Stream UI keep working even if the main site/backend
// is unreachable.

// ---------------------------------------------------------------------------
// 1. Types
// ---------------------------------------------------------------------------

/**
 * A translated string can either be a plain string, or (for strings that
 * need runtime data) a small function that takes named params and returns
 * the interpolated string. This keeps interpolation logic out of the main
 * stream file entirely -- callers just do `t.connection.streamTitle({ title })`.
 */
type StreamTitleFn = (params: { title: string }) => string;

export interface StreamTranslations {
    common: {
        ok: string;
        retry: string;
        continueText: string;
        reconnect: string;
    };

    onboarding: {
        title: string;
        message: string;
        escHint: string;
    };

    navbar: {
        fullscreen: string;
        endStream: string;
        ending: string;
    };

    connection: {
        startingGame: string;
        connected: string;
        connectionLostTitle: string;
        clickReconnect: string;
        connectionLostToast: string;
        waitingForConnection: string;
        connectingTitle: string;
        creatingNewStream: string;
        reconnected: string;
        reconnecting: string;
        unableToReconnect: string;
        exitStream: string;
        /** e.g. t.connection.streamTitle({ title: "Elden Ring" }) -> "Stream: Elden Ring" */
        streamTitle: StreamTitleFn;
    };

    network: {
        poorConnection: string;
        gameplayMayStutter: string;
        veryPoorConnection: string;
        connectionMayDisconnect: string;
        connectionRestored: string;
    };

    errors: {
        fullscreenUnsupported: string;
        unsupportedBrowser: string;
        pointerLockUnsupported: string;
        endStreamFailed: string;
        pleaseTryAgain: string;
    };
}

/**
 * Every base language code Rigzer Stream UI ships translations for.
 * Region/script variants (en-US, en-GB, pt-BR, zh-Hant, ...) are resolved
 * down to one of these base codes by the detection logic below -- we do not
 * keep separate dictionaries per region unless the script genuinely differs
 * (e.g. Chinese Simplified vs Traditional).
 */
export const SUPPORTED_LANGUAGES = [
    "en", "hi", "zh", "zh-Hant", "es", "fr", "ar", "bn", "pt", "ru", "ur", "id",
    "de", "mr", "te", "tr", "ta", "ko", "vi", "it", "fa", "pl", "nl", "uk",
    "ms", "th", "ro", "sv", "cs", "el", "hu", "he", "da", "fi", "no", "sk",
    "bg", "hr", "sr", "lt", "sl", "lv", "et", "ca", "is", "ga", "cy", "eu",
    "gl", "af", "sw", "fil", "ml", "kn", "gu", "pa", "ne", "si", "or", "as",
    "km", "lo", "my", "mn", "kk", "uz", "az", "ka", "hy", "sq", "mk", "bs",
    "am", "ha", "yo", "zu",
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const DEFAULT_LANGUAGE: SupportedLanguage = "en";

// ---------------------------------------------------------------------------
// 2. Translation dictionary
// ---------------------------------------------------------------------------
// Every language below implements the *exact same* StreamTranslations shape.
// TypeScript's structural typing (Record<SupportedLanguage, StreamTranslations>)
// means this file will fail to compile if any language is missing a key --
// there is no silent runtime fallback to "maybe English" for an individual
// missing string.

function streamTitle(prefix: string): StreamTitleFn {
    return ({ title }) => `${prefix}: ${title}`;
}

const TRANSLATIONS: Record<SupportedLanguage, StreamTranslations> = {
    en: {
        common: { ok: "OK", retry: "Retry", continueText: "Continue", reconnect: "Reconnect" },
        onboarding: {
            title: "Game Controls & Fullscreen",
            message: "The 3 dots are in the top-right corner. They open the game controls.",
            escHint: "Hold ESC to exit Fullscreen.",
        },
        navbar: { fullscreen: "Fullscreen", endStream: "End Stream", ending: "Ending..." },
        connection: {
            startingGame: "Starting game…",
            connected: "Connected! Click to start...",
            connectionLostTitle: "Connection Lost",
            clickReconnect: "Click Reconnect to continue.",
            connectionLostToast: "Connection lost",
            waitingForConnection: "Waiting for connection...",
            connectingTitle: "Connecting...",
            creatingNewStream: "Creating new stream...",
            reconnected: "Reconnected",
            reconnecting: "Reconnecting…",
            unableToReconnect: "Unable to reconnect.",
            exitStream: "Exit Stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Poor connection",
            gameplayMayStutter: "Gameplay may stutter.",
            veryPoorConnection: "Very poor connection",
            connectionMayDisconnect: "Connection may disconnect.",
            connectionRestored: "Connection restored",
        },
        errors: {
            fullscreenUnsupported: "Fullscreen isn't supported by your browser.",
            unsupportedBrowser: "Unsupported Browser",
            pointerLockUnsupported: "Pointer Lock isn't supported by your browser.",
            endStreamFailed: "Failed to End Stream",
            pleaseTryAgain: "Please try again.",
        },
    },

    hi: {
        common: { ok: "ठीक है", retry: "पुनः प्रयास करें", continueText: "जारी रखें", reconnect: "फिर से कनेक्ट करें" },
        onboarding: {
            title: "गेम नियंत्रण और फ़ुलस्क्रीन",
            message: "3 डॉट्स ऊपर दाईं ओर हैं। वे गेम नियंत्रण खोलते हैं।",
            escHint: "फ़ुलस्क्रीन से बाहर निकलने के लिए ESC दबाए रखें।",
        },
        navbar: { fullscreen: "फ़ुलस्क्रीन", endStream: "स्ट्रीम समाप्त करें", ending: "समाप्त हो रहा है..." },
        connection: {
            startingGame: "गेम शुरू हो रहा है…",
            connected: "कनेक्ट हो गया! शुरू करने के लिए क्लिक करें...",
            connectionLostTitle: "कनेक्शन टूट गया",
            clickReconnect: "जारी रखने के लिए फिर से कनेक्ट करें पर क्लिक करें।",
            connectionLostToast: "कनेक्शन टूट गया",
            waitingForConnection: "कनेक्शन का इंतज़ार हो रहा है...",
            connectingTitle: "कनेक्ट हो रहा है...",
            creatingNewStream: "नई स्ट्रीम बनाई जा रही है...",
            reconnected: "फिर से कनेक्ट हुआ",
            reconnecting: "फिर से कनेक्ट हो रहा है…",
            unableToReconnect: "फिर से कनेक्ट करने में असमर्थ।",
            exitStream: "स्ट्रीम से बाहर निकलें",
            streamTitle: streamTitle("स्ट्रीम"),
        },
        network: {
            poorConnection: "कमज़ोर कनेक्शन",
            gameplayMayStutter: "गेमप्ले में रुकावट आ सकती है।",
            veryPoorConnection: "बहुत कमज़ोर कनेक्शन",
            connectionMayDisconnect: "कनेक्शन टूट सकता है।",
            connectionRestored: "कनेक्शन बहाल हुआ",
        },
        errors: {
            fullscreenUnsupported: "आपका ब्राउज़र फ़ुलस्क्रीन का समर्थन नहीं करता।",
            unsupportedBrowser: "असमर्थित ब्राउज़र",
            pointerLockUnsupported: "आपका ब्राउज़र पॉइंटर लॉक का समर्थन नहीं करता।",
            endStreamFailed: "स्ट्रीम समाप्त करने में विफल",
            pleaseTryAgain: "कृपया पुनः प्रयास करें।",
        },
    },

    zh: {
        common: { ok: "确定", retry: "重试", continueText: "继续", reconnect: "重新连接" },
        onboarding: {
            title: "游戏控制与全屏",
            message: "右上角的三个点可打开游戏控制选项。",
            escHint: "按住 ESC 退出全屏。",
        },
        navbar: { fullscreen: "全屏", endStream: "结束串流", ending: "正在结束..." },
        connection: {
            startingGame: "正在启动游戏…",
            connected: "已连接！点击开始...",
            connectionLostTitle: "连接已断开",
            clickReconnect: "点击“重新连接”以继续。",
            connectionLostToast: "连接已断开",
            waitingForConnection: "正在等待连接...",
            connectingTitle: "正在连接...",
            creatingNewStream: "正在创建新的串流...",
            reconnected: "已重新连接",
            reconnecting: "正在重新连接…",
            unableToReconnect: "无法重新连接。",
            exitStream: "退出串流",
            streamTitle: streamTitle("串流"),
        },
        network: {
            poorConnection: "连接不佳",
            gameplayMayStutter: "游戏画面可能会卡顿。",
            veryPoorConnection: "连接极差",
            connectionMayDisconnect: "连接可能会中断。",
            connectionRestored: "连接已恢复",
        },
        errors: {
            fullscreenUnsupported: "您的浏览器不支持全屏。",
            unsupportedBrowser: "不受支持的浏览器",
            pointerLockUnsupported: "您的浏览器不支持指针锁定。",
            endStreamFailed: "结束串流失败",
            pleaseTryAgain: "请重试。",
        },
    },

    "zh-Hant": {
        common: { ok: "確定", retry: "重試", continueText: "繼續", reconnect: "重新連線" },
        onboarding: {
            title: "遊戲控制與全螢幕",
            message: "右上角的三個點可開啟遊戲控制選項。",
            escHint: "按住 ESC 退出全螢幕。",
        },
        navbar: { fullscreen: "全螢幕", endStream: "結束串流", ending: "正在結束..." },
        connection: {
            startingGame: "正在啟動遊戲…",
            connected: "已連線！點擊開始...",
            connectionLostTitle: "連線已中斷",
            clickReconnect: "點擊「重新連線」以繼續。",
            connectionLostToast: "連線已中斷",
            waitingForConnection: "正在等待連線...",
            connectingTitle: "正在連線...",
            creatingNewStream: "正在建立新的串流...",
            reconnected: "已重新連線",
            reconnecting: "正在重新連線…",
            unableToReconnect: "無法重新連線。",
            exitStream: "退出串流",
            streamTitle: streamTitle("串流"),
        },
        network: {
            poorConnection: "連線不佳",
            gameplayMayStutter: "遊戲畫面可能會卡頓。",
            veryPoorConnection: "連線極差",
            connectionMayDisconnect: "連線可能會中斷。",
            connectionRestored: "連線已恢復",
        },
        errors: {
            fullscreenUnsupported: "您的瀏覽器不支援全螢幕。",
            unsupportedBrowser: "不受支援的瀏覽器",
            pointerLockUnsupported: "您的瀏覽器不支援指標鎖定。",
            endStreamFailed: "結束串流失敗",
            pleaseTryAgain: "請再試一次。",
        },
    },

    es: {
        common: { ok: "Aceptar", retry: "Reintentar", continueText: "Continuar", reconnect: "Reconectar" },
        onboarding: {
            title: "Controles del juego y pantalla completa",
            message: "Los 3 puntos están en la esquina superior derecha. Abren los controles del juego.",
            escHint: "Mantén pulsado ESC para salir de pantalla completa.",
        },
        navbar: { fullscreen: "Pantalla completa", endStream: "Finalizar transmisión", ending: "Finalizando..." },
        connection: {
            startingGame: "Iniciando el juego…",
            connected: "¡Conectado! Haz clic para empezar...",
            connectionLostTitle: "Conexión perdida",
            clickReconnect: "Haz clic en Reconectar para continuar.",
            connectionLostToast: "Conexión perdida",
            waitingForConnection: "Esperando conexión...",
            connectingTitle: "Conectando...",
            creatingNewStream: "Creando nueva transmisión...",
            reconnected: "Reconectado",
            reconnecting: "Reconectando…",
            unableToReconnect: "No se pudo reconectar.",
            exitStream: "Salir de la transmisión",
            streamTitle: streamTitle("Transmisión"),
        },
        network: {
            poorConnection: "Conexión débil",
            gameplayMayStutter: "El juego podría tener tirones.",
            veryPoorConnection: "Conexión muy débil",
            connectionMayDisconnect: "La conexión podría cortarse.",
            connectionRestored: "Conexión restablecida",
        },
        errors: {
            fullscreenUnsupported: "Tu navegador no admite pantalla completa.",
            unsupportedBrowser: "Navegador no compatible",
            pointerLockUnsupported: "Tu navegador no admite el bloqueo del puntero.",
            endStreamFailed: "No se pudo finalizar la transmisión",
            pleaseTryAgain: "Inténtalo de nuevo.",
        },
    },

    fr: {
        common: { ok: "OK", retry: "Réessayer", continueText: "Continuer", reconnect: "Reconnecter" },
        onboarding: {
            title: "Contrôles du jeu et plein écran",
            message: "Les 3 points se trouvent en haut à droite. Ils ouvrent les contrôles du jeu.",
            escHint: "Maintenez ÉCHAP pour quitter le plein écran.",
        },
        navbar: { fullscreen: "Plein écran", endStream: "Terminer le stream", ending: "Fin en cours..." },
        connection: {
            startingGame: "Démarrage du jeu…",
            connected: "Connecté ! Cliquez pour commencer...",
            connectionLostTitle: "Connexion perdue",
            clickReconnect: "Cliquez sur Reconnecter pour continuer.",
            connectionLostToast: "Connexion perdue",
            waitingForConnection: "En attente de connexion...",
            connectingTitle: "Connexion en cours...",
            creatingNewStream: "Création d'un nouveau stream...",
            reconnected: "Reconnecté",
            reconnecting: "Reconnexion…",
            unableToReconnect: "Impossible de se reconnecter.",
            exitStream: "Quitter le stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Connexion faible",
            gameplayMayStutter: "Le jeu peut saccader.",
            veryPoorConnection: "Connexion très faible",
            connectionMayDisconnect: "La connexion peut se couper.",
            connectionRestored: "Connexion rétablie",
        },
        errors: {
            fullscreenUnsupported: "Votre navigateur ne prend pas en charge le plein écran.",
            unsupportedBrowser: "Navigateur non pris en charge",
            pointerLockUnsupported: "Votre navigateur ne prend pas en charge le verrouillage du pointeur.",
            endStreamFailed: "Échec de la fin du stream",
            pleaseTryAgain: "Veuillez réessayer.",
        },
    },

    ar: {
        common: { ok: "موافق", retry: "إعادة المحاولة", continueText: "متابعة", reconnect: "إعادة الاتصال" },
        onboarding: {
            title: "أدوات التحكم بالّلعبة وملء الشاشة",
            message: "توجد النقاط الثلاث في الزاوية العلوية اليمنى. تفتح أدوات التحكم بالّلعبة.",
            escHint: "اضغط مطولاً على ESC للخروج من وضع ملء الشاشة.",
        },
        navbar: { fullscreen: "ملء الشاشة", endStream: "إنهاء البث", ending: "جارٍ الإنهاء..." },
        connection: {
            startingGame: "جارٍ بدء اللعبة…",
            connected: "تم الاتصال! انقر للبدء...",
            connectionLostTitle: "انقطع الاتصال",
            clickReconnect: "انقر على إعادة الاتصال للمتابعة.",
            connectionLostToast: "انقطع الاتصال",
            waitingForConnection: "بانتظار الاتصال...",
            connectingTitle: "جارٍ الاتصال...",
            creatingNewStream: "جارٍ إنشاء بث جديد...",
            reconnected: "تمت إعادة الاتصال",
            reconnecting: "جارٍ إعادة الاتصال…",
            unableToReconnect: "تعذّرت إعادة الاتصال.",
            exitStream: "الخروج من البث",
            streamTitle: streamTitle("البث"),
        },
        network: {
            poorConnection: "اتصال ضعيف",
            gameplayMayStutter: "قد تتقطع اللعبة.",
            veryPoorConnection: "اتصال ضعيف جدًا",
            connectionMayDisconnect: "قد ينقطع الاتصال.",
            connectionRestored: "تمت استعادة الاتصال",
        },
        errors: {
            fullscreenUnsupported: "متصفحك لا يدعم وضع ملء الشاشة.",
            unsupportedBrowser: "متصفح غير مدعوم",
            pointerLockUnsupported: "متصفحك لا يدعم قفل المؤشر.",
            endStreamFailed: "فشل إنهاء البث",
            pleaseTryAgain: "يرجى المحاولة مرة أخرى.",
        },
    },

    bn: {
        common: { ok: "ঠিক আছে", retry: "আবার চেষ্টা করুন", continueText: "চালিয়ে যান", reconnect: "পুনরায় সংযোগ" },
        onboarding: {
            title: "গেম নিয়ন্ত্রণ ও ফুলস্ক্রিন",
            message: "৩টি ডট উপরের ডান কোণে আছে। এগুলো গেম নিয়ন্ত্রণ খোলে।",
            escHint: "ফুলস্ক্রিন থেকে বের হতে ESC চেপে ধরুন।",
        },
        navbar: { fullscreen: "ফুলস্ক্রিন", endStream: "স্ট্রিম শেষ করুন", ending: "শেষ হচ্ছে..." },
        connection: {
            startingGame: "গেম শুরু হচ্ছে…",
            connected: "সংযুক্ত হয়েছে! শুরু করতে ক্লিক করুন...",
            connectionLostTitle: "সংযোগ বিচ্ছিন্ন হয়েছে",
            clickReconnect: "চালিয়ে যেতে পুনরায় সংযোগ-এ ক্লিক করুন।",
            connectionLostToast: "সংযোগ বিচ্ছিন্ন হয়েছে",
            waitingForConnection: "সংযোগের জন্য অপেক্ষা করা হচ্ছে...",
            connectingTitle: "সংযোগ করা হচ্ছে...",
            creatingNewStream: "নতুন স্ট্রিম তৈরি হচ্ছে...",
            reconnected: "পুনরায় সংযুক্ত হয়েছে",
            reconnecting: "পুনরায় সংযোগ করা হচ্ছে…",
            unableToReconnect: "পুনরায় সংযোগ করা যায়নি।",
            exitStream: "স্ট্রিম থেকে বের হন",
            streamTitle: streamTitle("স্ট্রিম"),
        },
        network: {
            poorConnection: "দুর্বল সংযোগ",
            gameplayMayStutter: "গেমপ্লে আটকে যেতে পারে।",
            veryPoorConnection: "অত্যন্ত দুর্বল সংযোগ",
            connectionMayDisconnect: "সংযোগ বিচ্ছিন্ন হতে পারে।",
            connectionRestored: "সংযোগ পুনরুদ্ধার হয়েছে",
        },
        errors: {
            fullscreenUnsupported: "আপনার ব্রাউজার ফুলস্ক্রিন সমর্থন করে না।",
            unsupportedBrowser: "অসমর্থিত ব্রাউজার",
            pointerLockUnsupported: "আপনার ব্রাউজার পয়েন্টার লক সমর্থন করে না।",
            endStreamFailed: "স্ট্রিম শেষ করতে ব্যর্থ",
            pleaseTryAgain: "অনুগ্রহ করে আবার চেষ্টা করুন।",
        },
    },

    pt: {
        common: { ok: "OK", retry: "Tentar novamente", continueText: "Continuar", reconnect: "Reconectar" },
        onboarding: {
            title: "Controles do jogo e tela cheia",
            message: "Os 3 pontos ficam no canto superior direito. Eles abrem os controles do jogo.",
            escHint: "Segure ESC para sair da tela cheia.",
        },
        navbar: { fullscreen: "Tela cheia", endStream: "Encerrar transmissão", ending: "Encerrando..." },
        connection: {
            startingGame: "Iniciando o jogo…",
            connected: "Conectado! Clique para começar...",
            connectionLostTitle: "Conexão perdida",
            clickReconnect: "Clique em Reconectar para continuar.",
            connectionLostToast: "Conexão perdida",
            waitingForConnection: "Aguardando conexão...",
            connectingTitle: "Conectando...",
            creatingNewStream: "Criando nova transmissão...",
            reconnected: "Reconectado",
            reconnecting: "Reconectando…",
            unableToReconnect: "Não foi possível reconectar.",
            exitStream: "Sair da transmissão",
            streamTitle: streamTitle("Transmissão"),
        },
        network: {
            poorConnection: "Conexão fraca",
            gameplayMayStutter: "O jogo pode travar.",
            veryPoorConnection: "Conexão muito fraca",
            connectionMayDisconnect: "A conexão pode cair.",
            connectionRestored: "Conexão restaurada",
        },
        errors: {
            fullscreenUnsupported: "Seu navegador não suporta tela cheia.",
            unsupportedBrowser: "Navegador não suportado",
            pointerLockUnsupported: "Seu navegador não suporta bloqueio de ponteiro.",
            endStreamFailed: "Falha ao encerrar a transmissão",
            pleaseTryAgain: "Tente novamente.",
        },
    },

    ru: {
        common: { ok: "ОК", retry: "Повторить", continueText: "Продолжить", reconnect: "Переподключиться" },
        onboarding: {
            title: "Управление игрой и полноэкранный режим",
            message: "Три точки находятся в правом верхнем углу. Они открывают настройки управления игрой.",
            escHint: "Удерживайте ESC, чтобы выйти из полноэкранного режима.",
        },
        navbar: { fullscreen: "Во весь экран", endStream: "Завершить трансляцию", ending: "Завершение..." },
        connection: {
            startingGame: "Запуск игры…",
            connected: "Подключено! Нажмите, чтобы начать...",
            connectionLostTitle: "Соединение потеряно",
            clickReconnect: "Нажмите «Переподключиться», чтобы продолжить.",
            connectionLostToast: "Соединение потеряно",
            waitingForConnection: "Ожидание соединения...",
            connectingTitle: "Подключение...",
            creatingNewStream: "Создание новой трансляции...",
            reconnected: "Соединение восстановлено",
            reconnecting: "Переподключение…",
            unableToReconnect: "Не удалось переподключиться.",
            exitStream: "Выйти из трансляции",
            streamTitle: streamTitle("Трансляция"),
        },
        network: {
            poorConnection: "Слабое соединение",
            gameplayMayStutter: "Игра может подтормаживать.",
            veryPoorConnection: "Очень слабое соединение",
            connectionMayDisconnect: "Соединение может прерваться.",
            connectionRestored: "Соединение восстановлено",
        },
        errors: {
            fullscreenUnsupported: "Ваш браузер не поддерживает полноэкранный режим.",
            unsupportedBrowser: "Неподдерживаемый браузер",
            pointerLockUnsupported: "Ваш браузер не поддерживает блокировку указателя.",
            endStreamFailed: "Не удалось завершить трансляцию",
            pleaseTryAgain: "Попробуйте ещё раз.",
        },
    },

    ur: {
        common: { ok: "ٹھیک ہے", retry: "دوبارہ کوشش کریں", continueText: "جاری رکھیں", reconnect: "دوبارہ منسلک کریں" },
        onboarding: {
            title: "گیم کنٹرولز اور فل اسکرین",
            message: "3 ڈاٹس اوپر دائیں کونے میں ہیں۔ وہ گیم کنٹرولز کھولتے ہیں۔",
            escHint: "فل اسکرین سے باہر نکلنے کے لیے ESC دبائے رکھیں۔",
        },
        navbar: { fullscreen: "فل اسکرین", endStream: "اسٹریم ختم کریں", ending: "ختم ہو رہا ہے..." },
        connection: {
            startingGame: "گیم شروع ہو رہا ہے…",
            connected: "منسلک ہو گیا! شروع کرنے کے لیے کلک کریں...",
            connectionLostTitle: "کنکشن منقطع ہو گیا",
            clickReconnect: "جاری رکھنے کے لیے دوبارہ منسلک کریں پر کلک کریں۔",
            connectionLostToast: "کنکشن منقطع ہو گیا",
            waitingForConnection: "کنکشن کا انتظار ہے...",
            connectingTitle: "منسلک ہو رہا ہے...",
            creatingNewStream: "نیا اسٹریم بن رہا ہے...",
            reconnected: "دوبارہ منسلک ہو گیا",
            reconnecting: "دوبارہ منسلک ہو رہا ہے…",
            unableToReconnect: "دوبارہ منسلک ہونے میں ناکام۔",
            exitStream: "اسٹریم سے باہر نکلیں",
            streamTitle: streamTitle("اسٹریم"),
        },
        network: {
            poorConnection: "کمزور کنکشن",
            gameplayMayStutter: "گیم پلے میں رکاوٹ آ سکتی ہے۔",
            veryPoorConnection: "بہت کمزور کنکشن",
            connectionMayDisconnect: "کنکشن منقطع ہو سکتا ہے۔",
            connectionRestored: "کنکشن بحال ہو گیا",
        },
        errors: {
            fullscreenUnsupported: "آپ کا براؤزر فل اسکرین سپورٹ نہیں کرتا۔",
            unsupportedBrowser: "غیر معاون براؤزر",
            pointerLockUnsupported: "آپ کا براؤزر پوائنٹر لاک سپورٹ نہیں کرتا۔",
            endStreamFailed: "اسٹریم ختم کرنے میں ناکامی",
            pleaseTryAgain: "براہ کرم دوبارہ کوشش کریں۔",
        },
    },

    id: {
        common: { ok: "OK", retry: "Coba Lagi", continueText: "Lanjutkan", reconnect: "Sambungkan Ulang" },
        onboarding: {
            title: "Kontrol Game & Layar Penuh",
            message: "3 titik ada di pojok kanan atas. Titik ini membuka kontrol game.",
            escHint: "Tahan ESC untuk keluar dari layar penuh.",
        },
        navbar: { fullscreen: "Layar Penuh", endStream: "Akhiri Stream", ending: "Mengakhiri..." },
        connection: {
            startingGame: "Memulai game…",
            connected: "Terhubung! Klik untuk mulai...",
            connectionLostTitle: "Koneksi Terputus",
            clickReconnect: "Klik Sambungkan Ulang untuk melanjutkan.",
            connectionLostToast: "Koneksi terputus",
            waitingForConnection: "Menunggu koneksi...",
            connectingTitle: "Menyambungkan...",
            creatingNewStream: "Membuat stream baru...",
            reconnected: "Tersambung kembali",
            reconnecting: "Menyambungkan ulang…",
            unableToReconnect: "Tidak dapat menyambungkan ulang.",
            exitStream: "Keluar dari Stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Koneksi buruk",
            gameplayMayStutter: "Gameplay bisa tersendat.",
            veryPoorConnection: "Koneksi sangat buruk",
            connectionMayDisconnect: "Koneksi bisa terputus.",
            connectionRestored: "Koneksi pulih",
        },
        errors: {
            fullscreenUnsupported: "Browser Anda tidak mendukung layar penuh.",
            unsupportedBrowser: "Browser Tidak Didukung",
            pointerLockUnsupported: "Browser Anda tidak mendukung penguncian penunjuk.",
            endStreamFailed: "Gagal Mengakhiri Stream",
            pleaseTryAgain: "Silakan coba lagi.",
        },
    },

    de: {
        common: { ok: "OK", retry: "Erneut versuchen", continueText: "Weiter", reconnect: "Erneut verbinden" },
        onboarding: {
            title: "Spielsteuerung & Vollbild",
            message: "Die 3 Punkte befinden sich oben rechts. Sie öffnen die Spielsteuerung.",
            escHint: "Halte ESC gedrückt, um den Vollbildmodus zu verlassen.",
        },
        navbar: { fullscreen: "Vollbild", endStream: "Stream beenden", ending: "Wird beendet..." },
        connection: {
            startingGame: "Spiel wird gestartet…",
            connected: "Verbunden! Klicke, um zu starten...",
            connectionLostTitle: "Verbindung getrennt",
            clickReconnect: "Klicke auf „Erneut verbinden“, um fortzufahren.",
            connectionLostToast: "Verbindung getrennt",
            waitingForConnection: "Warte auf Verbindung...",
            connectingTitle: "Verbindung wird hergestellt...",
            creatingNewStream: "Neuer Stream wird erstellt...",
            reconnected: "Wieder verbunden",
            reconnecting: "Verbindung wird wiederhergestellt…",
            unableToReconnect: "Verbindung konnte nicht wiederhergestellt werden.",
            exitStream: "Stream verlassen",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Schwache Verbindung",
            gameplayMayStutter: "Das Gameplay könnte ruckeln.",
            veryPoorConnection: "Sehr schwache Verbindung",
            connectionMayDisconnect: "Die Verbindung könnte abbrechen.",
            connectionRestored: "Verbindung wiederhergestellt",
        },
        errors: {
            fullscreenUnsupported: "Dein Browser unterstützt kein Vollbild.",
            unsupportedBrowser: "Nicht unterstützter Browser",
            pointerLockUnsupported: "Dein Browser unterstützt keine Zeigersperre.",
            endStreamFailed: "Stream konnte nicht beendet werden",
            pleaseTryAgain: "Bitte versuche es erneut.",
        },
    },

    mr: {
        common: { ok: "ठीक आहे", retry: "पुन्हा प्रयत्न करा", continueText: "सुरू ठेवा", reconnect: "पुन्हा कनेक्ट करा" },
        onboarding: {
            title: "गेम नियंत्रणे आणि फुलस्क्रीन",
            message: "3 ठिपके वरच्या उजव्या कोपऱ्यात आहेत. ते गेम नियंत्रणे उघडतात.",
            escHint: "फुलस्क्रीनमधून बाहेर पडण्यासाठी ESC दाबून ठेवा.",
        },
        navbar: { fullscreen: "फुलस्क्रीन", endStream: "स्ट्रीम संपवा", ending: "संपत आहे..." },
        connection: {
            startingGame: "गेम सुरू होत आहे…",
            connected: "कनेक्ट झाले! सुरू करण्यासाठी क्लिक करा...",
            connectionLostTitle: "कनेक्शन तुटले",
            clickReconnect: "सुरू ठेवण्यासाठी पुन्हा कनेक्ट करा वर क्लिक करा.",
            connectionLostToast: "कनेक्शन तुटले",
            waitingForConnection: "कनेक्शनची वाट पाहत आहे...",
            connectingTitle: "कनेक्ट होत आहे...",
            creatingNewStream: "नवीन स्ट्रीम तयार होत आहे...",
            reconnected: "पुन्हा कनेक्ट झाले",
            reconnecting: "पुन्हा कनेक्ट होत आहे…",
            unableToReconnect: "पुन्हा कनेक्ट करता आले नाही.",
            exitStream: "स्ट्रीममधून बाहेर पडा",
            streamTitle: streamTitle("स्ट्रीम"),
        },
        network: {
            poorConnection: "कमकुवत कनेक्शन",
            gameplayMayStutter: "गेमप्ले अडखळू शकतो.",
            veryPoorConnection: "अत्यंत कमकुवत कनेक्शन",
            connectionMayDisconnect: "कनेक्शन तुटू शकते.",
            connectionRestored: "कनेक्शन पूर्ववत झाले",
        },
        errors: {
            fullscreenUnsupported: "तुमचा ब्राउझर फुलस्क्रीनला समर्थन देत नाही.",
            unsupportedBrowser: "असमर्थित ब्राउझर",
            pointerLockUnsupported: "तुमचा ब्राउझर पॉइंटर लॉकला समर्थन देत नाही.",
            endStreamFailed: "स्ट्रीम संपवण्यात अयशस्वी",
            pleaseTryAgain: "कृपया पुन्हा प्रयत्न करा.",
        },
    },

    te: {
        common: { ok: "సరే", retry: "మళ్లీ ప్రయత్నించండి", continueText: "కొనసాగించు", reconnect: "మళ్లీ కనెక్ట్ చేయి" },
        onboarding: {
            title: "గేమ్ నియంత్రణలు & ఫుల్‌స్క్రీన్",
            message: "3 చుక్కలు పై కుడి మూలలో ఉన్నాయి. అవి గేమ్ నియంత్రణలను తెరుస్తాయి.",
            escHint: "ఫుల్‌స్క్రీన్ నుండి బయటకు రావడానికి ESC నొక్కి పట్టుకోండి.",
        },
        navbar: { fullscreen: "ఫుల్‌స్క్రీన్", endStream: "స్ట్రీమ్‌ను ముగించు", ending: "ముగుస్తోంది..." },
        connection: {
            startingGame: "గేమ్ ప్రారంభమవుతోంది…",
            connected: "కనెక్ట్ అయ్యింది! ప్రారంభించడానికి క్లిక్ చేయండి...",
            connectionLostTitle: "కనెక్షన్ కోల్పోయింది",
            clickReconnect: "కొనసాగించడానికి మళ్లీ కనెక్ట్ చేయి పై క్లిక్ చేయండి.",
            connectionLostToast: "కనెక్షన్ కోల్పోయింది",
            waitingForConnection: "కనెక్షన్ కోసం వేచి ఉంది...",
            connectingTitle: "కనెక్ట్ అవుతోంది...",
            creatingNewStream: "కొత్త స్ట్రీమ్ సృష్టిస్తోంది...",
            reconnected: "మళ్లీ కనెక్ట్ అయ్యింది",
            reconnecting: "మళ్లీ కనెక్ట్ అవుతోంది…",
            unableToReconnect: "మళ్లీ కనెక్ట్ చేయలేకపోయింది.",
            exitStream: "స్ట్రీమ్ నుండి నిష్క్రమించు",
            streamTitle: streamTitle("స్ట్రీమ్"),
        },
        network: {
            poorConnection: "బలహీన కనెక్షన్",
            gameplayMayStutter: "గేమ్‌ప్లే నిలిచిపోవచ్చు.",
            veryPoorConnection: "చాలా బలహీన కనెక్షన్",
            connectionMayDisconnect: "కనెక్షన్ తెగిపోవచ్చు.",
            connectionRestored: "కనెక్షన్ పునరుద్ధరించబడింది",
        },
        errors: {
            fullscreenUnsupported: "మీ బ్రౌజర్ ఫుల్‌స్క్రీన్‌ను సపోర్ట్ చేయదు.",
            unsupportedBrowser: "మద్దతు లేని బ్రౌజర్",
            pointerLockUnsupported: "మీ బ్రౌజర్ పాయింటర్ లాక్‌ను సపోర్ట్ చేయదు.",
            endStreamFailed: "స్ట్రీమ్‌ను ముగించడంలో విఫలమైంది",
            pleaseTryAgain: "దయచేసి మళ్లీ ప్రయత్నించండి.",
        },
    },

    tr: {
        common: { ok: "Tamam", retry: "Yeniden Dene", continueText: "Devam Et", reconnect: "Yeniden Bağlan" },
        onboarding: {
            title: "Oyun Kontrolleri ve Tam Ekran",
            message: "3 nokta sağ üst köşede. Oyun kontrollerini açarlar.",
            escHint: "Tam ekrandan çıkmak için ESC tuşunu basılı tutun.",
        },
        navbar: { fullscreen: "Tam Ekran", endStream: "Yayını Sonlandır", ending: "Sonlandırılıyor..." },
        connection: {
            startingGame: "Oyun başlatılıyor…",
            connected: "Bağlandı! Başlamak için tıklayın...",
            connectionLostTitle: "Bağlantı Kesildi",
            clickReconnect: "Devam etmek için Yeniden Bağlan'a tıklayın.",
            connectionLostToast: "Bağlantı kesildi",
            waitingForConnection: "Bağlantı bekleniyor...",
            connectingTitle: "Bağlanılıyor...",
            creatingNewStream: "Yeni yayın oluşturuluyor...",
            reconnected: "Yeniden bağlanıldı",
            reconnecting: "Yeniden bağlanılıyor…",
            unableToReconnect: "Yeniden bağlanılamadı.",
            exitStream: "Yayından Çık",
            streamTitle: streamTitle("Yayın"),
        },
        network: {
            poorConnection: "Zayıf bağlantı",
            gameplayMayStutter: "Oyun takılabilir.",
            veryPoorConnection: "Çok zayıf bağlantı",
            connectionMayDisconnect: "Bağlantı kesilebilir.",
            connectionRestored: "Bağlantı yeniden kuruldu",
        },
        errors: {
            fullscreenUnsupported: "Tarayıcınız tam ekranı desteklemiyor.",
            unsupportedBrowser: "Desteklenmeyen Tarayıcı",
            pointerLockUnsupported: "Tarayıcınız işaretçi kilidini desteklemiyor.",
            endStreamFailed: "Yayın Sonlandırılamadı",
            pleaseTryAgain: "Lütfen tekrar deneyin.",
        },
    },

    ta: {
        common: { ok: "சரி", retry: "மீண்டும் முயற்சிக்கவும்", continueText: "தொடரவும்", reconnect: "மீண்டும் இணை" },
        onboarding: {
            title: "விளையாட்டு கட்டுப்பாடுகள் & முழுத்திரை",
            message: "3 புள்ளிகள் மேல் வலது மூலையில் உள்ளன. அவை விளையாட்டு கட்டுப்பாடுகளைத் திறக்கும்.",
            escHint: "முழுத்திரையிலிருந்து வெளியேற ESC-ஐ அழுத்திப் பிடிக்கவும்.",
        },
        navbar: { fullscreen: "முழுத்திரை", endStream: "ஸ்ட்ரீமை முடி", ending: "முடிக்கிறது..." },
        connection: {
            startingGame: "விளையாட்டு தொடங்குகிறது…",
            connected: "இணைக்கப்பட்டது! தொடங்க கிளிக் செய்யவும்...",
            connectionLostTitle: "இணைப்பு துண்டிக்கப்பட்டது",
            clickReconnect: "தொடர மீண்டும் இணை-ஐ கிளிக் செய்யவும்.",
            connectionLostToast: "இணைப்பு துண்டிக்கப்பட்டது",
            waitingForConnection: "இணைப்புக்காக காத்திருக்கிறது...",
            connectingTitle: "இணைக்கிறது...",
            creatingNewStream: "புதிய ஸ்ட்ரீம் உருவாக்கப்படுகிறது...",
            reconnected: "மீண்டும் இணைக்கப்பட்டது",
            reconnecting: "மீண்டும் இணைக்கிறது…",
            unableToReconnect: "மீண்டும் இணைக்க முடியவில்லை.",
            exitStream: "ஸ்ட்ரீமிலிருந்து வெளியேறு",
            streamTitle: streamTitle("ஸ்ட்ரீம்"),
        },
        network: {
            poorConnection: "பலவீனமான இணைப்பு",
            gameplayMayStutter: "விளையாட்டு தடைபடலாம்.",
            veryPoorConnection: "மிகவும் பலவீனமான இணைப்பு",
            connectionMayDisconnect: "இணைப்பு துண்டிக்கப்படலாம்.",
            connectionRestored: "இணைப்பு மீட்டமைக்கப்பட்டது",
        },
        errors: {
            fullscreenUnsupported: "உங்கள் உலாவி முழுத்திரையை ஆதரிக்காது.",
            unsupportedBrowser: "ஆதரிக்கப்படாத உலாவி",
            pointerLockUnsupported: "உங்கள் உலாவி பாயிண்டர் லாக்-ஐ ஆதரிக்காது.",
            endStreamFailed: "ஸ்ட்ரீமை முடிக்க முடியவில்லை",
            pleaseTryAgain: "மீண்டும் முயற்சிக்கவும்.",
        },
    },

    ko: {
        common: { ok: "확인", retry: "다시 시도", continueText: "계속", reconnect: "다시 연결" },
        onboarding: {
            title: "게임 컨트롤 및 전체화면",
            message: "오른쪽 상단의 점 3개가 게임 컨트롤을 엽니다.",
            escHint: "전체화면을 종료하려면 ESC를 길게 누르세요.",
        },
        navbar: { fullscreen: "전체화면", endStream: "스트림 종료", ending: "종료 중..." },
        connection: {
            startingGame: "게임 시작 중…",
            connected: "연결됨! 클릭하여 시작...",
            connectionLostTitle: "연결 끊김",
            clickReconnect: "계속하려면 다시 연결을 클릭하세요.",
            connectionLostToast: "연결 끊김",
            waitingForConnection: "연결 대기 중...",
            connectingTitle: "연결 중...",
            creatingNewStream: "새 스트림 생성 중...",
            reconnected: "다시 연결됨",
            reconnecting: "다시 연결 중…",
            unableToReconnect: "다시 연결할 수 없습니다.",
            exitStream: "스트림 나가기",
            streamTitle: streamTitle("스트림"),
        },
        network: {
            poorConnection: "연결 불안정",
            gameplayMayStutter: "게임 플레이가 끊길 수 있습니다.",
            veryPoorConnection: "연결 매우 불안정",
            connectionMayDisconnect: "연결이 끊길 수 있습니다.",
            connectionRestored: "연결 복구됨",
        },
        errors: {
            fullscreenUnsupported: "브라우저가 전체화면을 지원하지 않습니다.",
            unsupportedBrowser: "지원되지 않는 브라우저",
            pointerLockUnsupported: "브라우저가 포인터 잠금을 지원하지 않습니다.",
            endStreamFailed: "스트림 종료 실패",
            pleaseTryAgain: "다시 시도해 주세요.",
        },
    },

    vi: {
        common: { ok: "OK", retry: "Thử lại", continueText: "Tiếp tục", reconnect: "Kết nối lại" },
        onboarding: {
            title: "Điều Khiển Trò Chơi & Toàn Màn Hình",
            message: "3 dấu chấm ở góc trên bên phải. Chúng mở điều khiển trò chơi.",
            escHint: "Giữ ESC để thoát toàn màn hình.",
        },
        navbar: { fullscreen: "Toàn Màn Hình", endStream: "Kết Thúc Stream", ending: "Đang kết thúc..." },
        connection: {
            startingGame: "Đang khởi động trò chơi…",
            connected: "Đã kết nối! Nhấp để bắt đầu...",
            connectionLostTitle: "Mất Kết Nối",
            clickReconnect: "Nhấp Kết nối lại để tiếp tục.",
            connectionLostToast: "Mất kết nối",
            waitingForConnection: "Đang chờ kết nối...",
            connectingTitle: "Đang kết nối...",
            creatingNewStream: "Đang tạo stream mới...",
            reconnected: "Đã kết nối lại",
            reconnecting: "Đang kết nối lại…",
            unableToReconnect: "Không thể kết nối lại.",
            exitStream: "Thoát Stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Kết nối yếu",
            gameplayMayStutter: "Trò chơi có thể bị giật.",
            veryPoorConnection: "Kết nối rất yếu",
            connectionMayDisconnect: "Kết nối có thể bị ngắt.",
            connectionRestored: "Kết nối đã phục hồi",
        },
        errors: {
            fullscreenUnsupported: "Trình duyệt của bạn không hỗ trợ toàn màn hình.",
            unsupportedBrowser: "Trình Duyệt Không Được Hỗ Trợ",
            pointerLockUnsupported: "Trình duyệt của bạn không hỗ trợ khóa con trỏ.",
            endStreamFailed: "Kết Thúc Stream Thất Bại",
            pleaseTryAgain: "Vui lòng thử lại.",
        },
    },

    it: {
        common: { ok: "OK", retry: "Riprova", continueText: "Continua", reconnect: "Riconnetti" },
        onboarding: {
            title: "Controlli di gioco e schermo intero",
            message: "I 3 puntini si trovano in alto a destra. Aprono i controlli di gioco.",
            escHint: "Tieni premuto ESC per uscire dallo schermo intero.",
        },
        navbar: { fullscreen: "Schermo intero", endStream: "Termina stream", ending: "Terminazione..." },
        connection: {
            startingGame: "Avvio del gioco…",
            connected: "Connesso! Clicca per iniziare...",
            connectionLostTitle: "Connessione persa",
            clickReconnect: "Clicca su Riconnetti per continuare.",
            connectionLostToast: "Connessione persa",
            waitingForConnection: "In attesa di connessione...",
            connectingTitle: "Connessione in corso...",
            creatingNewStream: "Creazione di un nuovo stream...",
            reconnected: "Riconnesso",
            reconnecting: "Riconnessione…",
            unableToReconnect: "Impossibile riconnettersi.",
            exitStream: "Esci dallo stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Connessione debole",
            gameplayMayStutter: "Il gameplay potrebbe rallentare.",
            veryPoorConnection: "Connessione molto debole",
            connectionMayDisconnect: "La connessione potrebbe interrompersi.",
            connectionRestored: "Connessione ripristinata",
        },
        errors: {
            fullscreenUnsupported: "Il tuo browser non supporta lo schermo intero.",
            unsupportedBrowser: "Browser non supportato",
            pointerLockUnsupported: "Il tuo browser non supporta il blocco del puntatore.",
            endStreamFailed: "Impossibile terminare lo stream",
            pleaseTryAgain: "Riprova.",
        },
    },

    fa: {
        common: { ok: "تأیید", retry: "تلاش مجدد", continueText: "ادامه", reconnect: "اتصال مجدد" },
        onboarding: {
            title: "کنترل‌های بازی و تمام‌صفحه",
            message: "۳ نقطه در گوشه بالا سمت راست قرار دارند. آن‌ها کنترل‌های بازی را باز می‌کنند.",
            escHint: "برای خروج از حالت تمام‌صفحه، ESC را نگه دارید.",
        },
        navbar: { fullscreen: "تمام‌صفحه", endStream: "پایان استریم", ending: "در حال پایان دادن..." },
        connection: {
            startingGame: "در حال شروع بازی…",
            connected: "متصل شد! برای شروع کلیک کنید...",
            connectionLostTitle: "اتصال قطع شد",
            clickReconnect: "برای ادامه روی اتصال مجدد کلیک کنید.",
            connectionLostToast: "اتصال قطع شد",
            waitingForConnection: "در انتظار اتصال...",
            connectingTitle: "در حال اتصال...",
            creatingNewStream: "در حال ایجاد استریم جدید...",
            reconnected: "اتصال مجدد برقرار شد",
            reconnecting: "در حال اتصال مجدد…",
            unableToReconnect: "اتصال مجدد ممکن نشد.",
            exitStream: "خروج از استریم",
            streamTitle: streamTitle("استریم"),
        },
        network: {
            poorConnection: "اتصال ضعیف",
            gameplayMayStutter: "ممکن است بازی دچار پرش شود.",
            veryPoorConnection: "اتصال بسیار ضعیف",
            connectionMayDisconnect: "ممکن است اتصال قطع شود.",
            connectionRestored: "اتصال بازیابی شد",
        },
        errors: {
            fullscreenUnsupported: "مرورگر شما از حالت تمام‌صفحه پشتیبانی نمی‌کند.",
            unsupportedBrowser: "مرورگر پشتیبانی‌نشده",
            pointerLockUnsupported: "مرورگر شما از قفل نشانگر پشتیبانی نمی‌کند.",
            endStreamFailed: "پایان استریم ناموفق بود",
            pleaseTryAgain: "لطفاً دوباره تلاش کنید.",
        },
    },

    pl: {
        common: { ok: "OK", retry: "Spróbuj ponownie", continueText: "Kontynuuj", reconnect: "Połącz ponownie" },
        onboarding: {
            title: "Sterowanie grą i pełny ekran",
            message: "3 kropki znajdują się w prawym górnym rogu. Otwierają sterowanie grą.",
            escHint: "Przytrzymaj ESC, aby wyjść z pełnego ekranu.",
        },
        navbar: { fullscreen: "Pełny ekran", endStream: "Zakończ transmisję", ending: "Kończenie..." },
        connection: {
            startingGame: "Uruchamianie gry…",
            connected: "Połączono! Kliknij, aby zacząć...",
            connectionLostTitle: "Utracono połączenie",
            clickReconnect: "Kliknij Połącz ponownie, aby kontynuować.",
            connectionLostToast: "Utracono połączenie",
            waitingForConnection: "Oczekiwanie na połączenie...",
            connectingTitle: "Łączenie...",
            creatingNewStream: "Tworzenie nowej transmisji...",
            reconnected: "Połączono ponownie",
            reconnecting: "Ponowne łączenie…",
            unableToReconnect: "Nie udało się połączyć ponownie.",
            exitStream: "Opuść transmisję",
            streamTitle: streamTitle("Transmisja"),
        },
        network: {
            poorConnection: "Słabe połączenie",
            gameplayMayStutter: "Rozgrywka może się zacinać.",
            veryPoorConnection: "Bardzo słabe połączenie",
            connectionMayDisconnect: "Połączenie może zostać przerwane.",
            connectionRestored: "Połączenie przywrócone",
        },
        errors: {
            fullscreenUnsupported: "Twoja przeglądarka nie obsługuje pełnego ekranu.",
            unsupportedBrowser: "Nieobsługiwana przeglądarka",
            pointerLockUnsupported: "Twoja przeglądarka nie obsługuje blokady wskaźnika.",
            endStreamFailed: "Nie udało się zakończyć transmisji",
            pleaseTryAgain: "Spróbuj ponownie.",
        },
    },

    nl: {
        common: { ok: "OK", retry: "Opnieuw proberen", continueText: "Doorgaan", reconnect: "Opnieuw verbinden" },
        onboarding: {
            title: "Spelbediening & Volledig scherm",
            message: "De 3 puntjes staan rechtsboven. Ze openen de spelbediening.",
            escHint: "Houd ESC ingedrukt om volledig scherm te verlaten.",
        },
        navbar: { fullscreen: "Volledig scherm", endStream: "Stream beëindigen", ending: "Bezig met beëindigen..." },
        connection: {
            startingGame: "Spel wordt gestart…",
            connected: "Verbonden! Klik om te starten...",
            connectionLostTitle: "Verbinding verbroken",
            clickReconnect: "Klik op Opnieuw verbinden om door te gaan.",
            connectionLostToast: "Verbinding verbroken",
            waitingForConnection: "Wachten op verbinding...",
            connectingTitle: "Verbinden...",
            creatingNewStream: "Nieuwe stream aanmaken...",
            reconnected: "Opnieuw verbonden",
            reconnecting: "Opnieuw verbinden…",
            unableToReconnect: "Kan niet opnieuw verbinden.",
            exitStream: "Stream verlaten",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Zwakke verbinding",
            gameplayMayStutter: "Gameplay kan haperen.",
            veryPoorConnection: "Zeer zwakke verbinding",
            connectionMayDisconnect: "Verbinding kan wegvallen.",
            connectionRestored: "Verbinding hersteld",
        },
        errors: {
            fullscreenUnsupported: "Je browser ondersteunt geen volledig scherm.",
            unsupportedBrowser: "Niet-ondersteunde browser",
            pointerLockUnsupported: "Je browser ondersteunt geen aanwijzervergrendeling.",
            endStreamFailed: "Stream beëindigen mislukt",
            pleaseTryAgain: "Probeer het opnieuw.",
        },
    },

    uk: {
        common: { ok: "Гаразд", retry: "Повторити", continueText: "Продовжити", reconnect: "Перепідключитися" },
        onboarding: {
            title: "Керування грою та повноекранний режим",
            message: "Три крапки у верхньому правому куті відкривають керування грою.",
            escHint: "Утримуйте ESC, щоб вийти з повноекранного режиму.",
        },
        navbar: { fullscreen: "Повний екран", endStream: "Завершити трансляцію", ending: "Завершення..." },
        connection: {
            startingGame: "Запуск гри…",
            connected: "Підключено! Натисніть, щоб почати...",
            connectionLostTitle: "З'єднання втрачено",
            clickReconnect: "Натисніть «Перепідключитися», щоб продовжити.",
            connectionLostToast: "З'єднання втрачено",
            waitingForConnection: "Очікування з'єднання...",
            connectingTitle: "Підключення...",
            creatingNewStream: "Створення нової трансляції...",
            reconnected: "Перепідключено",
            reconnecting: "Перепідключення…",
            unableToReconnect: "Не вдалося перепідключитися.",
            exitStream: "Вийти з трансляції",
            streamTitle: streamTitle("Трансляція"),
        },
        network: {
            poorConnection: "Слабке з'єднання",
            gameplayMayStutter: "Гра може підвисати.",
            veryPoorConnection: "Дуже слабке з'єднання",
            connectionMayDisconnect: "З'єднання може перерватися.",
            connectionRestored: "З'єднання відновлено",
        },
        errors: {
            fullscreenUnsupported: "Ваш браузер не підтримує повноекранний режим.",
            unsupportedBrowser: "Непідтримуваний браузер",
            pointerLockUnsupported: "Ваш браузер не підтримує блокування вказівника.",
            endStreamFailed: "Не вдалося завершити трансляцію",
            pleaseTryAgain: "Спробуйте ще раз.",
        },
    },

    ms: {
        common: { ok: "OK", retry: "Cuba Lagi", continueText: "Teruskan", reconnect: "Sambung Semula" },
        onboarding: {
            title: "Kawalan Permainan & Skrin Penuh",
            message: "3 titik berada di penjuru kanan atas. Ia membuka kawalan permainan.",
            escHint: "Tahan ESC untuk keluar dari skrin penuh.",
        },
        navbar: { fullscreen: "Skrin Penuh", endStream: "Tamatkan Strim", ending: "Menamatkan..." },
        connection: {
            startingGame: "Memulakan permainan…",
            connected: "Disambungkan! Klik untuk mula...",
            connectionLostTitle: "Sambungan Terputus",
            clickReconnect: "Klik Sambung Semula untuk teruskan.",
            connectionLostToast: "Sambungan terputus",
            waitingForConnection: "Menunggu sambungan...",
            connectingTitle: "Menyambung...",
            creatingNewStream: "Mencipta strim baharu...",
            reconnected: "Disambung semula",
            reconnecting: "Menyambung semula…",
            unableToReconnect: "Tidak dapat menyambung semula.",
            exitStream: "Keluar dari Strim",
            streamTitle: streamTitle("Strim"),
        },
        network: {
            poorConnection: "Sambungan lemah",
            gameplayMayStutter: "Permainan mungkin tersekat-sekat.",
            veryPoorConnection: "Sambungan sangat lemah",
            connectionMayDisconnect: "Sambungan mungkin terputus.",
            connectionRestored: "Sambungan dipulihkan",
        },
        errors: {
            fullscreenUnsupported: "Pelayar anda tidak menyokong skrin penuh.",
            unsupportedBrowser: "Pelayar Tidak Disokong",
            pointerLockUnsupported: "Pelayar anda tidak menyokong kunci penuding.",
            endStreamFailed: "Gagal Menamatkan Strim",
            pleaseTryAgain: "Sila cuba lagi.",
        },
    },

    th: {
        common: { ok: "ตกลง", retry: "ลองอีกครั้ง", continueText: "ดำเนินการต่อ", reconnect: "เชื่อมต่อใหม่" },
        onboarding: {
            title: "การควบคุมเกมและเต็มหน้าจอ",
            message: "จุดสามจุดอยู่ที่มุมขวาบน ใช้เปิดการควบคุมเกม",
            escHint: "กดค้าง ESC เพื่อออกจากโหมดเต็มหน้าจอ",
        },
        navbar: { fullscreen: "เต็มหน้าจอ", endStream: "สิ้นสุดสตรีม", ending: "กำลังสิ้นสุด..." },
        connection: {
            startingGame: "กำลังเริ่มเกม…",
            connected: "เชื่อมต่อแล้ว! คลิกเพื่อเริ่ม...",
            connectionLostTitle: "การเชื่อมต่อขาดหาย",
            clickReconnect: "คลิกเชื่อมต่อใหม่เพื่อดำเนินการต่อ",
            connectionLostToast: "การเชื่อมต่อขาดหาย",
            waitingForConnection: "กำลังรอการเชื่อมต่อ...",
            connectingTitle: "กำลังเชื่อมต่อ...",
            creatingNewStream: "กำลังสร้างสตรีมใหม่...",
            reconnected: "เชื่อมต่อใหม่แล้ว",
            reconnecting: "กำลังเชื่อมต่อใหม่…",
            unableToReconnect: "ไม่สามารถเชื่อมต่อใหม่ได้",
            exitStream: "ออกจากสตรีม",
            streamTitle: streamTitle("สตรีม"),
        },
        network: {
            poorConnection: "การเชื่อมต่อไม่ดี",
            gameplayMayStutter: "เกมอาจกระตุก",
            veryPoorConnection: "การเชื่อมต่อแย่มาก",
            connectionMayDisconnect: "การเชื่อมต่ออาจขาดหาย",
            connectionRestored: "การเชื่อมต่อกลับมาแล้ว",
        },
        errors: {
            fullscreenUnsupported: "เบราว์เซอร์ของคุณไม่รองรับเต็มหน้าจอ",
            unsupportedBrowser: "เบราว์เซอร์ไม่รองรับ",
            pointerLockUnsupported: "เบราว์เซอร์ของคุณไม่รองรับการล็อกตัวชี้",
            endStreamFailed: "สิ้นสุดสตรีมไม่สำเร็จ",
            pleaseTryAgain: "โปรดลองอีกครั้ง",
        },
    },

    ro: {
        common: { ok: "OK", retry: "Reîncearcă", continueText: "Continuă", reconnect: "Reconectare" },
        onboarding: {
            title: "Controale de joc și ecran complet",
            message: "Cele 3 puncte se află în colțul din dreapta sus. Deschid controalele jocului.",
            escHint: "Ține apăsat ESC pentru a ieși din ecran complet.",
        },
        navbar: { fullscreen: "Ecran complet", endStream: "Încheie transmisiunea", ending: "Se încheie..." },
        connection: {
            startingGame: "Se pornește jocul…",
            connected: "Conectat! Apasă pentru a începe...",
            connectionLostTitle: "Conexiune pierdută",
            clickReconnect: "Apasă Reconectare pentru a continua.",
            connectionLostToast: "Conexiune pierdută",
            waitingForConnection: "Se așteaptă conexiunea...",
            connectingTitle: "Se conectează...",
            creatingNewStream: "Se creează o nouă transmisiune...",
            reconnected: "Reconectat",
            reconnecting: "Se reconectează…",
            unableToReconnect: "Nu s-a putut reconecta.",
            exitStream: "Ieși din transmisiune",
            streamTitle: streamTitle("Transmisiune"),
        },
        network: {
            poorConnection: "Conexiune slabă",
            gameplayMayStutter: "Jocul poate avea sacadări.",
            veryPoorConnection: "Conexiune foarte slabă",
            connectionMayDisconnect: "Conexiunea se poate întrerupe.",
            connectionRestored: "Conexiune restabilită",
        },
        errors: {
            fullscreenUnsupported: "Browserul tău nu acceptă ecranul complet.",
            unsupportedBrowser: "Browser neacceptat",
            pointerLockUnsupported: "Browserul tău nu acceptă blocarea cursorului.",
            endStreamFailed: "Încheierea transmisiunii a eșuat",
            pleaseTryAgain: "Te rugăm să încerci din nou.",
        },
    },

    sv: {
        common: { ok: "OK", retry: "Försök igen", continueText: "Fortsätt", reconnect: "Anslut igen" },
        onboarding: {
            title: "Spelkontroller & Helskärm",
            message: "De 3 prickarna finns i övre högra hörnet. De öppnar spelkontrollerna.",
            escHint: "Håll ESC intryckt för att lämna helskärm.",
        },
        navbar: { fullscreen: "Helskärm", endStream: "Avsluta stream", ending: "Avslutar..." },
        connection: {
            startingGame: "Startar spelet…",
            connected: "Ansluten! Klicka för att börja...",
            connectionLostTitle: "Anslutningen förlorad",
            clickReconnect: "Klicka på Anslut igen för att fortsätta.",
            connectionLostToast: "Anslutningen förlorad",
            waitingForConnection: "Väntar på anslutning...",
            connectingTitle: "Ansluter...",
            creatingNewStream: "Skapar ny stream...",
            reconnected: "Återansluten",
            reconnecting: "Ansluter igen…",
            unableToReconnect: "Kunde inte återansluta.",
            exitStream: "Lämna stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Svag anslutning",
            gameplayMayStutter: "Spelet kan hacka.",
            veryPoorConnection: "Mycket svag anslutning",
            connectionMayDisconnect: "Anslutningen kan brytas.",
            connectionRestored: "Anslutningen återställd",
        },
        errors: {
            fullscreenUnsupported: "Din webbläsare stöder inte helskärm.",
            unsupportedBrowser: "Webbläsare stöds ej",
            pointerLockUnsupported: "Din webbläsare stöder inte pekarlåsning.",
            endStreamFailed: "Det gick inte att avsluta streamen",
            pleaseTryAgain: "Försök igen.",
        },
    },

    cs: {
        common: { ok: "OK", retry: "Zkusit znovu", continueText: "Pokračovat", reconnect: "Připojit znovu" },
        onboarding: {
            title: "Ovládání hry a celá obrazovka",
            message: "3 tečky jsou v pravém horním rohu. Otevírají ovládání hry.",
            escHint: "Podržte ESC pro ukončení celé obrazovky.",
        },
        navbar: { fullscreen: "Celá obrazovka", endStream: "Ukončit stream", ending: "Ukončování..." },
        connection: {
            startingGame: "Spouštění hry…",
            connected: "Připojeno! Klikněte pro spuštění...",
            connectionLostTitle: "Připojení ztraceno",
            clickReconnect: "Klikněte na Připojit znovu pro pokračování.",
            connectionLostToast: "Připojení ztraceno",
            waitingForConnection: "Čekání na připojení...",
            connectingTitle: "Připojování...",
            creatingNewStream: "Vytváření nového streamu...",
            reconnected: "Znovu připojeno",
            reconnecting: "Připojování…",
            unableToReconnect: "Nelze se znovu připojit.",
            exitStream: "Ukončit stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Slabé připojení",
            gameplayMayStutter: "Hra se může sekat.",
            veryPoorConnection: "Velmi slabé připojení",
            connectionMayDisconnect: "Připojení se může přerušit.",
            connectionRestored: "Připojení obnoveno",
        },
        errors: {
            fullscreenUnsupported: "Váš prohlížeč nepodporuje celou obrazovku.",
            unsupportedBrowser: "Nepodporovaný prohlížeč",
            pointerLockUnsupported: "Váš prohlížeč nepodporuje uzamčení kurzoru.",
            endStreamFailed: "Ukončení streamu se nezdařilo",
            pleaseTryAgain: "Zkuste to prosím znovu.",
        },
    },

    el: {
        common: { ok: "ΟΚ", retry: "Επανάληψη", continueText: "Συνέχεια", reconnect: "Επανασύνδεση" },
        onboarding: {
            title: "Χειριστήρια Παιχνιδιού & Πλήρης Οθόνη",
            message: "Οι 3 τελείες βρίσκονται πάνω δεξιά. Ανοίγουν τα χειριστήρια του παιχνιδιού.",
            escHint: "Κρατήστε πατημένο το ESC για έξοδο από την πλήρη οθόνη.",
        },
        navbar: { fullscreen: "Πλήρης οθόνη", endStream: "Τερματισμός ροής", ending: "Τερματισμός..." },
        connection: {
            startingGame: "Εκκίνηση παιχνιδιού…",
            connected: "Συνδέθηκε! Κάντε κλικ για έναρξη...",
            connectionLostTitle: "Η σύνδεση χάθηκε",
            clickReconnect: "Κάντε κλικ στο Επανασύνδεση για να συνεχίσετε.",
            connectionLostToast: "Η σύνδεση χάθηκε",
            waitingForConnection: "Αναμονή σύνδεσης...",
            connectingTitle: "Σύνδεση...",
            creatingNewStream: "Δημιουργία νέας ροής...",
            reconnected: "Επανασυνδέθηκε",
            reconnecting: "Επανασύνδεση…",
            unableToReconnect: "Αδύνατη η επανασύνδεση.",
            exitStream: "Έξοδος από τη ροή",
            streamTitle: streamTitle("Ροή"),
        },
        network: {
            poorConnection: "Ασθενής σύνδεση",
            gameplayMayStutter: "Το gameplay μπορεί να καθυστερεί.",
            veryPoorConnection: "Πολύ ασθενής σύνδεση",
            connectionMayDisconnect: "Η σύνδεση ενδέχεται να διακοπεί.",
            connectionRestored: "Η σύνδεση αποκαταστάθηκε",
        },
        errors: {
            fullscreenUnsupported: "Το πρόγραμμα περιήγησής σας δεν υποστηρίζει πλήρη οθόνη.",
            unsupportedBrowser: "Μη υποστηριζόμενο πρόγραμμα περιήγησης",
            pointerLockUnsupported: "Το πρόγραμμα περιήγησής σας δεν υποστηρίζει κλείδωμα δείκτη.",
            endStreamFailed: "Αποτυχία τερματισμού ροής",
            pleaseTryAgain: "Δοκιμάστε ξανά.",
        },
    },

    hu: {
        common: { ok: "OK", retry: "Újra", continueText: "Folytatás", reconnect: "Újracsatlakozás" },
        onboarding: {
            title: "Játékvezérlés és teljes képernyő",
            message: "A 3 pont a jobb felső sarokban van. Ezek nyitják meg a játékvezérlést.",
            escHint: "Tartsd lenyomva az ESC-et a teljes képernyő elhagyásához.",
        },
        navbar: { fullscreen: "Teljes képernyő", endStream: "Stream befejezése", ending: "Befejezés..." },
        connection: {
            startingGame: "Játék indítása…",
            connected: "Csatlakozva! Kattints az indításhoz...",
            connectionLostTitle: "Kapcsolat megszakadt",
            clickReconnect: "Kattints az Újracsatlakozás gombra a folytatáshoz.",
            connectionLostToast: "Kapcsolat megszakadt",
            waitingForConnection: "Kapcsolatra várunk...",
            connectingTitle: "Csatlakozás...",
            creatingNewStream: "Új stream létrehozása...",
            reconnected: "Újracsatlakozva",
            reconnecting: "Újracsatlakozás…",
            unableToReconnect: "Nem sikerült újracsatlakozni.",
            exitStream: "Kilépés a streamből",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Gyenge kapcsolat",
            gameplayMayStutter: "A játékmenet akadozhat.",
            veryPoorConnection: "Nagyon gyenge kapcsolat",
            connectionMayDisconnect: "A kapcsolat megszakadhat.",
            connectionRestored: "Kapcsolat helyreállt",
        },
        errors: {
            fullscreenUnsupported: "A böngésződ nem támogatja a teljes képernyőt.",
            unsupportedBrowser: "Nem támogatott böngésző",
            pointerLockUnsupported: "A böngésződ nem támogatja a mutatózárolást.",
            endStreamFailed: "Nem sikerült befejezni a streamet",
            pleaseTryAgain: "Kérjük, próbáld újra.",
        },
    },

    he: {
        common: { ok: "אישור", retry: "נסה שוב", continueText: "המשך", reconnect: "התחבר מחדש" },
        onboarding: {
            title: "בקרות משחק ומסך מלא",
            message: "3 הנקודות נמצאות בפינה הימנית העליונה. הן פותחות את בקרות המשחק.",
            escHint: "החזק ESC כדי לצאת ממסך מלא.",
        },
        navbar: { fullscreen: "מסך מלא", endStream: "סיים שידור", ending: "מסיים..." },
        connection: {
            startingGame: "מתחיל את המשחק…",
            connected: "מחובר! לחץ כדי להתחיל...",
            connectionLostTitle: "החיבור אבד",
            clickReconnect: "לחץ על התחבר מחדש כדי להמשיך.",
            connectionLostToast: "החיבור אבד",
            waitingForConnection: "ממתין לחיבור...",
            connectingTitle: "מתחבר...",
            creatingNewStream: "יוצר שידור חדש...",
            reconnected: "התחבר מחדש",
            reconnecting: "מתחבר מחדש…",
            unableToReconnect: "לא ניתן להתחבר מחדש.",
            exitStream: "צא מהשידור",
            streamTitle: streamTitle("שידור"),
        },
        network: {
            poorConnection: "חיבור חלש",
            gameplayMayStutter: "המשחק עלול להיתקע.",
            veryPoorConnection: "חיבור חלש מאוד",
            connectionMayDisconnect: "החיבור עלול להתנתק.",
            connectionRestored: "החיבור שוחזר",
        },
        errors: {
            fullscreenUnsupported: "הדפדפן שלך אינו תומך במסך מלא.",
            unsupportedBrowser: "דפדפן לא נתמך",
            pointerLockUnsupported: "הדפדפן שלך אינו תומך בנעילת סמן.",
            endStreamFailed: "סיום השידור נכשל",
            pleaseTryAgain: "אנא נסה שוב.",
        },
    },

    da: {
        common: { ok: "OK", retry: "Prøv igen", continueText: "Fortsæt", reconnect: "Genopret forbindelse" },
        onboarding: {
            title: "Spilstyring & Fuld skærm",
            message: "De 3 prikker er i øverste højre hjørne. De åbner spilstyringen.",
            escHint: "Hold ESC nede for at forlade fuld skærm.",
        },
        navbar: { fullscreen: "Fuld skærm", endStream: "Afslut stream", ending: "Afslutter..." },
        connection: {
            startingGame: "Starter spillet…",
            connected: "Forbundet! Klik for at starte...",
            connectionLostTitle: "Forbindelse tabt",
            clickReconnect: "Klik på Genopret forbindelse for at fortsætte.",
            connectionLostToast: "Forbindelse tabt",
            waitingForConnection: "Venter på forbindelse...",
            connectingTitle: "Forbinder...",
            creatingNewStream: "Opretter ny stream...",
            reconnected: "Forbindelse genoprettet",
            reconnecting: "Genopretter forbindelse…",
            unableToReconnect: "Kunne ikke genoprette forbindelse.",
            exitStream: "Forlad stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Svag forbindelse",
            gameplayMayStutter: "Gameplay kan hakke.",
            veryPoorConnection: "Meget svag forbindelse",
            connectionMayDisconnect: "Forbindelsen kan afbrydes.",
            connectionRestored: "Forbindelse genoprettet",
        },
        errors: {
            fullscreenUnsupported: "Din browser understøtter ikke fuld skærm.",
            unsupportedBrowser: "Browser understøttes ikke",
            pointerLockUnsupported: "Din browser understøtter ikke markørlås.",
            endStreamFailed: "Kunne ikke afslutte stream",
            pleaseTryAgain: "Prøv igen.",
        },
    },

    fi: {
        common: { ok: "OK", retry: "Yritä uudelleen", continueText: "Jatka", reconnect: "Yhdistä uudelleen" },
        onboarding: {
            title: "Pelin hallinta ja koko näyttö",
            message: "3 pistettä sijaitsevat oikeassa yläkulmassa. Ne avaavat pelin hallinnan.",
            escHint: "Pidä ESC pohjassa poistuaksesi koko näytöstä.",
        },
        navbar: { fullscreen: "Koko näyttö", endStream: "Lopeta striimi", ending: "Lopetetaan..." },
        connection: {
            startingGame: "Käynnistetään peliä…",
            connected: "Yhdistetty! Napsauta aloittaaksesi...",
            connectionLostTitle: "Yhteys katkesi",
            clickReconnect: "Napsauta Yhdistä uudelleen jatkaaksesi.",
            connectionLostToast: "Yhteys katkesi",
            waitingForConnection: "Odotetaan yhteyttä...",
            connectingTitle: "Yhdistetään...",
            creatingNewStream: "Luodaan uutta striimiä...",
            reconnected: "Yhdistetty uudelleen",
            reconnecting: "Yhdistetään uudelleen…",
            unableToReconnect: "Uudelleenyhdistäminen epäonnistui.",
            exitStream: "Poistu striimistä",
            streamTitle: streamTitle("Striimi"),
        },
        network: {
            poorConnection: "Heikko yhteys",
            gameplayMayStutter: "Pelaaminen voi nykiä.",
            veryPoorConnection: "Erittäin heikko yhteys",
            connectionMayDisconnect: "Yhteys voi katketa.",
            connectionRestored: "Yhteys palautettu",
        },
        errors: {
            fullscreenUnsupported: "Selaimesi ei tue koko näyttöä.",
            unsupportedBrowser: "Selainta ei tueta",
            pointerLockUnsupported: "Selaimesi ei tue osoittimen lukitusta.",
            endStreamFailed: "Striimin lopettaminen epäonnistui",
            pleaseTryAgain: "Yritä uudelleen.",
        },
    },

    no: {
        common: { ok: "OK", retry: "Prøv igjen", continueText: "Fortsett", reconnect: "Koble til på nytt" },
        onboarding: {
            title: "Spillkontroller og fullskjerm",
            message: "De 3 prikkene er i øvre høyre hjørne. De åpner spillkontrollene.",
            escHint: "Hold inne ESC for å avslutte fullskjerm.",
        },
        navbar: { fullscreen: "Fullskjerm", endStream: "Avslutt stream", ending: "Avslutter..." },
        connection: {
            startingGame: "Starter spillet…",
            connected: "Tilkoblet! Klikk for å starte...",
            connectionLostTitle: "Mistet tilkobling",
            clickReconnect: "Klikk Koble til på nytt for å fortsette.",
            connectionLostToast: "Mistet tilkobling",
            waitingForConnection: "Venter på tilkobling...",
            connectingTitle: "Kobler til...",
            creatingNewStream: "Oppretter ny stream...",
            reconnected: "Koblet til på nytt",
            reconnecting: "Kobler til på nytt…",
            unableToReconnect: "Kunne ikke koble til på nytt.",
            exitStream: "Forlat stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Svak tilkobling",
            gameplayMayStutter: "Spillingen kan hakke.",
            veryPoorConnection: "Svært svak tilkobling",
            connectionMayDisconnect: "Tilkoblingen kan bli brutt.",
            connectionRestored: "Tilkobling gjenopprettet",
        },
        errors: {
            fullscreenUnsupported: "Nettleseren din støtter ikke fullskjerm.",
            unsupportedBrowser: "Nettleser støttes ikke",
            pointerLockUnsupported: "Nettleseren din støtter ikke pekerlås.",
            endStreamFailed: "Kunne ikke avslutte stream",
            pleaseTryAgain: "Prøv igjen.",
        },
    },

    sk: {
        common: { ok: "OK", retry: "Skúsiť znova", continueText: "Pokračovať", reconnect: "Pripojiť znova" },
        onboarding: {
            title: "Ovládanie hry a celá obrazovka",
            message: "3 bodky sú v pravom hornom rohu. Otvárajú ovládanie hry.",
            escHint: "Podržte ESC na ukončenie celej obrazovky.",
        },
        navbar: { fullscreen: "Celá obrazovka", endStream: "Ukončiť stream", ending: "Ukončuje sa..." },
        connection: {
            startingGame: "Spúšťa sa hra…",
            connected: "Pripojené! Kliknutím spustite...",
            connectionLostTitle: "Spojenie stratené",
            clickReconnect: "Kliknite na Pripojiť znova pre pokračovanie.",
            connectionLostToast: "Spojenie stratené",
            waitingForConnection: "Čaká sa na pripojenie...",
            connectingTitle: "Pripája sa...",
            creatingNewStream: "Vytvára sa nový stream...",
            reconnected: "Znova pripojené",
            reconnecting: "Pripája sa znova…",
            unableToReconnect: "Nepodarilo sa znova pripojiť.",
            exitStream: "Opustiť stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Slabé pripojenie",
            gameplayMayStutter: "Hra sa môže sekať.",
            veryPoorConnection: "Veľmi slabé pripojenie",
            connectionMayDisconnect: "Pripojenie sa môže prerušiť.",
            connectionRestored: "Pripojenie obnovené",
        },
        errors: {
            fullscreenUnsupported: "Váš prehliadač nepodporuje celú obrazovku.",
            unsupportedBrowser: "Nepodporovaný prehliadač",
            pointerLockUnsupported: "Váš prehliadač nepodporuje uzamknutie kurzora.",
            endStreamFailed: "Ukončenie streamu zlyhalo",
            pleaseTryAgain: "Skúste to prosím znova.",
        },
    },

    bg: {
        common: { ok: "ОК", retry: "Опитай пак", continueText: "Продължи", reconnect: "Свързване отново" },
        onboarding: {
            title: "Управление на играта и цял екран",
            message: "Трите точки са в горния десен ъгъл. Те отварят управлението на играта.",
            escHint: "Задръжте ESC, за да излезете от цял екран.",
        },
        navbar: { fullscreen: "Цял екран", endStream: "Прекрати излъчването", ending: "Прекратяване..." },
        connection: {
            startingGame: "Стартиране на играта…",
            connected: "Свързан! Кликнете, за да започнете...",
            connectionLostTitle: "Връзката е загубена",
            clickReconnect: "Кликнете на „Свързване отново“, за да продължите.",
            connectionLostToast: "Връзката е загубена",
            waitingForConnection: "Изчакване на връзка...",
            connectingTitle: "Свързване...",
            creatingNewStream: "Създаване на ново излъчване...",
            reconnected: "Свързан отново",
            reconnecting: "Свързване отново…",
            unableToReconnect: "Не може да се свърже отново.",
            exitStream: "Изход от излъчването",
            streamTitle: streamTitle("Излъчване"),
        },
        network: {
            poorConnection: "Слаба връзка",
            gameplayMayStutter: "Играта може да засича.",
            veryPoorConnection: "Много слаба връзка",
            connectionMayDisconnect: "Връзката може да прекъсне.",
            connectionRestored: "Връзката е възстановена",
        },
        errors: {
            fullscreenUnsupported: "Браузърът ви не поддържа цял екран.",
            unsupportedBrowser: "Неподдържан браузър",
            pointerLockUnsupported: "Браузърът ви не поддържа заключване на показалеца.",
            endStreamFailed: "Неуспешно прекратяване на излъчването",
            pleaseTryAgain: "Моля, опитайте отново.",
        },
    },

    hr: {
        common: { ok: "U redu", retry: "Pokušaj ponovno", continueText: "Nastavi", reconnect: "Ponovno poveži" },
        onboarding: {
            title: "Kontrole igre i puni zaslon",
            message: "3 točke nalaze se u gornjem desnom kutu. Otvaraju kontrole igre.",
            escHint: "Držite ESC za izlazak iz punog zaslona.",
        },
        navbar: { fullscreen: "Puni zaslon", endStream: "Završi prijenos", ending: "Završava..." },
        connection: {
            startingGame: "Pokretanje igre…",
            connected: "Povezano! Kliknite za početak...",
            connectionLostTitle: "Veza izgubljena",
            clickReconnect: "Kliknite Ponovno poveži za nastavak.",
            connectionLostToast: "Veza izgubljena",
            waitingForConnection: "Čekanje veze...",
            connectingTitle: "Povezivanje...",
            creatingNewStream: "Izrada novog prijenosa...",
            reconnected: "Ponovno povezano",
            reconnecting: "Ponovno povezivanje…",
            unableToReconnect: "Ponovno povezivanje nije uspjelo.",
            exitStream: "Izađi iz prijenosa",
            streamTitle: streamTitle("Prijenos"),
        },
        network: {
            poorConnection: "Slaba veza",
            gameplayMayStutter: "Igra se može zamrzavati.",
            veryPoorConnection: "Vrlo slaba veza",
            connectionMayDisconnect: "Veza se može prekinuti.",
            connectionRestored: "Veza obnovljena",
        },
        errors: {
            fullscreenUnsupported: "Vaš preglednik ne podržava puni zaslon.",
            unsupportedBrowser: "Nepodržani preglednik",
            pointerLockUnsupported: "Vaš preglednik ne podržava zaključavanje pokazivača.",
            endStreamFailed: "Neuspješno završavanje prijenosa",
            pleaseTryAgain: "Pokušajte ponovno.",
        },
    },

    sr: {
        common: { ok: "У реду", retry: "Покушај поново", continueText: "Настави", reconnect: "Поново повежи" },
        onboarding: {
            title: "Контроле игре и цео екран",
            message: "3 тачке су у горњем десном углу. Оне отварају контроле игре.",
            escHint: "Држите ESC да напустите режим целог екрана.",
        },
        navbar: { fullscreen: "Цео екран", endStream: "Заврши пренос", ending: "Завршавање..." },
        connection: {
            startingGame: "Покретање игре…",
            connected: "Повезано! Кликните за почетак...",
            connectionLostTitle: "Веза изгубљена",
            clickReconnect: "Кликните Поново повежи за наставак.",
            connectionLostToast: "Веза изгубљена",
            waitingForConnection: "Чекање везе...",
            connectingTitle: "Повезивање...",
            creatingNewStream: "Прављење новог преноса...",
            reconnected: "Поново повезано",
            reconnecting: "Поновно повезивање…",
            unableToReconnect: "Није могуће поново се повезати.",
            exitStream: "Изађи из преноса",
            streamTitle: streamTitle("Пренос"),
        },
        network: {
            poorConnection: "Слаба веза",
            gameplayMayStutter: "Игра може да засеца.",
            veryPoorConnection: "Веома слаба веза",
            connectionMayDisconnect: "Веза може да прекине.",
            connectionRestored: "Веза обновљена",
        },
        errors: {
            fullscreenUnsupported: "Ваш прегледач не подржава цео екран.",
            unsupportedBrowser: "Неподржан прегледач",
            pointerLockUnsupported: "Ваш прегледач не подржава закључавање показивача.",
            endStreamFailed: "Завршавање преноса није успело",
            pleaseTryAgain: "Молимо покушајте поново.",
        },
    },

    lt: {
        common: { ok: "Gerai", retry: "Bandyti dar kartą", continueText: "Tęsti", reconnect: "Prisijungti iš naujo" },
        onboarding: {
            title: "Žaidimo valdymas ir visas ekranas",
            message: "3 taškai yra viršutiniame dešiniajame kampe. Jie atveria žaidimo valdymą.",
            escHint: "Laikykite ESC, kad išeitumėte iš viso ekrano režimo.",
        },
        navbar: { fullscreen: "Visas ekranas", endStream: "Baigti srautą", ending: "Baigiama..." },
        connection: {
            startingGame: "Paleidžiamas žaidimas…",
            connected: "Prisijungta! Spustelėkite, kad pradėtumėte...",
            connectionLostTitle: "Ryšys nutrūko",
            clickReconnect: "Spustelėkite Prisijungti iš naujo, kad tęstumėte.",
            connectionLostToast: "Ryšys nutrūko",
            waitingForConnection: "Laukiama ryšio...",
            connectingTitle: "Jungiamasi...",
            creatingNewStream: "Kuriamas naujas srautas...",
            reconnected: "Prisijungta iš naujo",
            reconnecting: "Jungiamasi iš naujo…",
            unableToReconnect: "Nepavyko prisijungti iš naujo.",
            exitStream: "Išeiti iš srauto",
            streamTitle: streamTitle("Srautas"),
        },
        network: {
            poorConnection: "Silpnas ryšys",
            gameplayMayStutter: "Žaidimas gali strigti.",
            veryPoorConnection: "Labai silpnas ryšys",
            connectionMayDisconnect: "Ryšys gali nutrūkti.",
            connectionRestored: "Ryšys atkurtas",
        },
        errors: {
            fullscreenUnsupported: "Jūsų naršyklė nepalaiko viso ekrano.",
            unsupportedBrowser: "Nepalaikoma naršyklė",
            pointerLockUnsupported: "Jūsų naršyklė nepalaiko žymeklio užrakinimo.",
            endStreamFailed: "Nepavyko baigti srauto",
            pleaseTryAgain: "Bandykite dar kartą.",
        },
    },

    sl: {
        common: { ok: "V redu", retry: "Poskusi znova", continueText: "Nadaljuj", reconnect: "Znova poveži" },
        onboarding: {
            title: "Kontrole igre in celozaslonski način",
            message: "3 pike so v zgornjem desnem kotu. Odprejo kontrole igre.",
            escHint: "Držite ESC za izhod iz celozaslonskega načina.",
        },
        navbar: { fullscreen: "Celozaslonsko", endStream: "Končaj pretakanje", ending: "Končevanje..." },
        connection: {
            startingGame: "Zaganjanje igre…",
            connected: "Povezano! Kliknite za začetek...",
            connectionLostTitle: "Povezava izgubljena",
            clickReconnect: "Kliknite Znova poveži za nadaljevanje.",
            connectionLostToast: "Povezava izgubljena",
            waitingForConnection: "Čakanje na povezavo...",
            connectingTitle: "Povezovanje...",
            creatingNewStream: "Ustvarjanje novega pretakanja...",
            reconnected: "Znova povezano",
            reconnecting: "Znova povezovanje…",
            unableToReconnect: "Znova povezovanje ni uspelo.",
            exitStream: "Zapusti pretakanje",
            streamTitle: streamTitle("Pretakanje"),
        },
        network: {
            poorConnection: "Šibka povezava",
            gameplayMayStutter: "Igra se lahko zatika.",
            veryPoorConnection: "Zelo šibka povezava",
            connectionMayDisconnect: "Povezava se lahko prekine.",
            connectionRestored: "Povezava obnovljena",
        },
        errors: {
            fullscreenUnsupported: "Vaš brskalnik ne podpira celozaslonskega načina.",
            unsupportedBrowser: "Nepodprt brskalnik",
            pointerLockUnsupported: "Vaš brskalnik ne podpira zaklepanja kazalca.",
            endStreamFailed: "Končanje pretakanja ni uspelo",
            pleaseTryAgain: "Poskusite znova.",
        },
    },

    lv: {
        common: { ok: "Labi", retry: "Mēģināt vēlreiz", continueText: "Turpināt", reconnect: "Savienoties atkārtoti" },
        onboarding: {
            title: "Spēles vadība un pilnekrāna režīms",
            message: "3 punkti atrodas augšējā labajā stūrī. Tie atver spēles vadību.",
            escHint: "Turiet ESC, lai izietu no pilnekrāna režīma.",
        },
        navbar: { fullscreen: "Pilnekrāns", endStream: "Beigt straumi", ending: "Beidz..." },
        connection: {
            startingGame: "Spēle tiek palaista…",
            connected: "Savienots! Noklikšķiniet, lai sāktu...",
            connectionLostTitle: "Savienojums zaudēts",
            clickReconnect: "Noklikšķiniet Savienoties atkārtoti, lai turpinātu.",
            connectionLostToast: "Savienojums zaudēts",
            waitingForConnection: "Gaida savienojumu...",
            connectingTitle: "Savienojas...",
            creatingNewStream: "Tiek izveidota jauna straume...",
            reconnected: "Atkārtoti savienots",
            reconnecting: "Savienojas atkārtoti…",
            unableToReconnect: "Neizdevās atkārtoti savienoties.",
            exitStream: "Iziet no straumes",
            streamTitle: streamTitle("Straume"),
        },
        network: {
            poorConnection: "Vājš savienojums",
            gameplayMayStutter: "Spēle var raustīties.",
            veryPoorConnection: "Ļoti vājš savienojums",
            connectionMayDisconnect: "Savienojums var pārtrūkt.",
            connectionRestored: "Savienojums atjaunots",
        },
        errors: {
            fullscreenUnsupported: "Jūsu pārlūkprogramma neatbalsta pilnekrāna režīmu.",
            unsupportedBrowser: "Neatbalstīta pārlūkprogramma",
            pointerLockUnsupported: "Jūsu pārlūkprogramma neatbalsta rādītāja bloķēšanu.",
            endStreamFailed: "Neizdevās beigt straumi",
            pleaseTryAgain: "Lūdzu, mēģiniet vēlreiz.",
        },
    },

    et: {
        common: { ok: "OK", retry: "Proovi uuesti", continueText: "Jätka", reconnect: "Ühenda uuesti" },
        onboarding: {
            title: "Mängu juhtnupud ja täisekraan",
            message: "3 punkti asuvad üleval paremas nurgas. Need avavad mängu juhtnupud.",
            escHint: "Hoidke ESC-i, et väljuda täisekraanist.",
        },
        navbar: { fullscreen: "Täisekraan", endStream: "Lõpeta ülekanne", ending: "Lõpetamine..." },
        connection: {
            startingGame: "Mängu käivitamine…",
            connected: "Ühendatud! Alustamiseks klõpsake...",
            connectionLostTitle: "Ühendus katkes",
            clickReconnect: "Jätkamiseks klõpsake Ühenda uuesti.",
            connectionLostToast: "Ühendus katkes",
            waitingForConnection: "Oodatakse ühendust...",
            connectingTitle: "Ühendamine...",
            creatingNewStream: "Uue ülekande loomine...",
            reconnected: "Taasühendatud",
            reconnecting: "Uuesti ühendamine…",
            unableToReconnect: "Uuesti ühendamine ebaõnnestus.",
            exitStream: "Välju ülekandest",
            streamTitle: streamTitle("Ülekanne"),
        },
        network: {
            poorConnection: "Nõrk ühendus",
            gameplayMayStutter: "Mäng võib kiiksuda.",
            veryPoorConnection: "Väga nõrk ühendus",
            connectionMayDisconnect: "Ühendus võib katkeda.",
            connectionRestored: "Ühendus taastatud",
        },
        errors: {
            fullscreenUnsupported: "Teie brauser ei toeta täisekraani.",
            unsupportedBrowser: "Brauser pole toetatud",
            pointerLockUnsupported: "Teie brauser ei toeta kursori lukustust.",
            endStreamFailed: "Ülekande lõpetamine ebaõnnestus",
            pleaseTryAgain: "Palun proovige uuesti.",
        },
    },

    ca: {
        common: { ok: "D'acord", retry: "Torna-ho a provar", continueText: "Continua", reconnect: "Reconnecta" },
        onboarding: {
            title: "Controls del joc i pantalla completa",
            message: "Els 3 punts són a la cantonada superior dreta. Obren els controls del joc.",
            escHint: "Mantén premut ESC per sortir de la pantalla completa.",
        },
        navbar: { fullscreen: "Pantalla completa", endStream: "Finalitza la transmissió", ending: "Finalitzant..." },
        connection: {
            startingGame: "Iniciant el joc…",
            connected: "Connectat! Fes clic per començar...",
            connectionLostTitle: "Connexió perduda",
            clickReconnect: "Fes clic a Reconnecta per continuar.",
            connectionLostToast: "Connexió perduda",
            waitingForConnection: "Esperant connexió...",
            connectingTitle: "Connectant...",
            creatingNewStream: "Creant una nova transmissió...",
            reconnected: "Reconnectat",
            reconnecting: "Reconnectant…",
            unableToReconnect: "No s'ha pogut reconnectar.",
            exitStream: "Surt de la transmissió",
            streamTitle: streamTitle("Transmissió"),
        },
        network: {
            poorConnection: "Connexió feble",
            gameplayMayStutter: "El joc pot anar a batzegades.",
            veryPoorConnection: "Connexió molt feble",
            connectionMayDisconnect: "La connexió es pot tallar.",
            connectionRestored: "Connexió restablerta",
        },
        errors: {
            fullscreenUnsupported: "El teu navegador no admet la pantalla completa.",
            unsupportedBrowser: "Navegador no compatible",
            pointerLockUnsupported: "El teu navegador no admet el bloqueig del punter.",
            endStreamFailed: "No s'ha pogut finalitzar la transmissió",
            pleaseTryAgain: "Torna-ho a provar.",
        },
    },

    is: {
        common: { ok: "Í lagi", retry: "Reyna aftur", continueText: "Halda áfram", reconnect: "Tengjast aftur" },
        onboarding: {
            title: "Leikjastýringar & Skjáfylling",
            message: "Punktarnir 3 eru efst í hægra horninu. Þeir opna leikjastýringarnar.",
            escHint: "Haltu ESC inni til að fara úr skjáfyllingu.",
        },
        navbar: { fullscreen: "Skjáfylling", endStream: "Ljúka streymi", ending: "Að ljúka..." },
        connection: {
            startingGame: "Ræsi leik…",
            connected: "Tengt! Smelltu til að byrja...",
            connectionLostTitle: "Tenging tapaðist",
            clickReconnect: "Smelltu á Tengjast aftur til að halda áfram.",
            connectionLostToast: "Tenging tapaðist",
            waitingForConnection: "Bíð eftir tengingu...",
            connectingTitle: "Tengist...",
            creatingNewStream: "Býr til nýtt streymi...",
            reconnected: "Tengdist aftur",
            reconnecting: "Tengist aftur…",
            unableToReconnect: "Ekki tókst að tengjast aftur.",
            exitStream: "Fara úr streymi",
            streamTitle: streamTitle("Streymi"),
        },
        network: {
            poorConnection: "Léleg tenging",
            gameplayMayStutter: "Leikurinn gæti stamað.",
            veryPoorConnection: "Mjög léleg tenging",
            connectionMayDisconnect: "Tengingin gæti rofnað.",
            connectionRestored: "Tenging endurheimt",
        },
        errors: {
            fullscreenUnsupported: "Vafrinn þinn styður ekki skjáfyllingu.",
            unsupportedBrowser: "Óstuddur vafri",
            pointerLockUnsupported: "Vafrinn þinn styður ekki bendlalás.",
            endStreamFailed: "Ekki tókst að ljúka streymi",
            pleaseTryAgain: "Reyndu aftur.",
        },
    },

    ga: {
        common: { ok: "OK", retry: "Bain triail eile as", continueText: "Lean ar aghaidh", reconnect: "Athcheangail" },
        onboarding: {
            title: "Rialuithe Cluiche agus Lánscáileán",
            message: "Tá na 3 phonc sa chúinne uachtarach ar dheis. Osclaíonn siad rialuithe an chluiche.",
            escHint: "Coinnigh ESC síos chun lánscáileán a fhágáil.",
        },
        navbar: { fullscreen: "Lánscáileán", endStream: "Deireadh a chur leis an sruth", ending: "Ag críochnú..." },
        connection: {
            startingGame: "Ag tosú an chluiche…",
            connected: "Ceangailte! Cliceáil chun tosú...",
            connectionLostTitle: "Cailleadh an Ceangal",
            clickReconnect: "Cliceáil Athcheangail chun leanúint ar aghaidh.",
            connectionLostToast: "Cailleadh an ceangal",
            waitingForConnection: "Ag fanacht le ceangal...",
            connectingTitle: "Ag ceangal...",
            creatingNewStream: "Ag cruthú sruth nua...",
            reconnected: "Athcheangailte",
            reconnecting: "Ag athcheangal…",
            unableToReconnect: "Níorbh fhéidir athcheangal.",
            exitStream: "Fág an sruth",
            streamTitle: streamTitle("Sruth"),
        },
        network: {
            poorConnection: "Drochcheangal",
            gameplayMayStutter: "D'fhéadfadh an cluiche stad.",
            veryPoorConnection: "Ceangal an-lag",
            connectionMayDisconnect: "D'fhéadfadh an ceangal briseadh.",
            connectionRestored: "Ceangal athbhunaithe",
        },
        errors: {
            fullscreenUnsupported: "Ní thacaíonn do bhrabhsálaí le lánscáileán.",
            unsupportedBrowser: "Brabhsálaí gan tacaíocht",
            pointerLockUnsupported: "Ní thacaíonn do bhrabhsálaí le glas an phointeora.",
            endStreamFailed: "Theip ar dheireadh a chur leis an sruth",
            pleaseTryAgain: "Bain triail eile as le do thoil.",
        },
    },

    cy: {
        common: { ok: "Iawn", retry: "Ceisiwch eto", continueText: "Parhau", reconnect: "Ailgysylltu" },
        onboarding: {
            title: "Rheolyddion Gêm a Sgrin Lawn",
            message: "Mae'r 3 dot yn y gornel dde uchaf. Maent yn agor rheolyddion y gêm.",
            escHint: "Daliwch ESC i adael sgrin lawn.",
        },
        navbar: { fullscreen: "Sgrin lawn", endStream: "Gorffen y ffrwd", ending: "Yn gorffen..." },
        connection: {
            startingGame: "Yn cychwyn y gêm…",
            connected: "Wedi cysylltu! Cliciwch i ddechrau...",
            connectionLostTitle: "Cysylltiad wedi'i Golli",
            clickReconnect: "Cliciwch Ailgysylltu i barhau.",
            connectionLostToast: "Cysylltiad wedi'i golli",
            waitingForConnection: "Aros am gysylltiad...",
            connectingTitle: "Yn cysylltu...",
            creatingNewStream: "Yn creu ffrwd newydd...",
            reconnected: "Wedi ailgysylltu",
            reconnecting: "Yn ailgysylltu…",
            unableToReconnect: "Methu ailgysylltu.",
            exitStream: "Gadael y ffrwd",
            streamTitle: streamTitle("Ffrwd"),
        },
        network: {
            poorConnection: "Cysylltiad gwael",
            gameplayMayStutter: "Gall y gameplay atal.",
            veryPoorConnection: "Cysylltiad gwael iawn",
            connectionMayDisconnect: "Gall y cysylltiad ddatgysylltu.",
            connectionRestored: "Cysylltiad wedi'i adfer",
        },
        errors: {
            fullscreenUnsupported: "Nid yw eich porwr yn cefnogi sgrin lawn.",
            unsupportedBrowser: "Porwr Anghefnogol",
            pointerLockUnsupported: "Nid yw eich porwr yn cefnogi clo pwyntydd.",
            endStreamFailed: "Methwyd Gorffen y Ffrwd",
            pleaseTryAgain: "Ceisiwch eto.",
        },
    },

    eu: {
        common: { ok: "Ados", retry: "Saiatu berriro", continueText: "Jarraitu", reconnect: "Birkonektatu" },
        onboarding: {
            title: "Jokoaren kontrolak eta pantaila osoa",
            message: "3 puntuak goiko eskuinaldean daude. Jokoaren kontrolak irekitzen dituzte.",
            escHint: "Eutsi ESC pantaila osotik irteteko.",
        },
        navbar: { fullscreen: "Pantaila osoa", endStream: "Amaitu emanaldia", ending: "Amaitzen..." },
        connection: {
            startingGame: "Jokoa abiarazten…",
            connected: "Konektatuta! Egin klik hasteko...",
            connectionLostTitle: "Konexioa galdu da",
            clickReconnect: "Egin klik Birkonektatu aukeran jarraitzeko.",
            connectionLostToast: "Konexioa galdu da",
            waitingForConnection: "Konexioaren zain...",
            connectingTitle: "Konektatzen...",
            creatingNewStream: "Emanaldi berria sortzen...",
            reconnected: "Birkonektatuta",
            reconnecting: "Birkonektatzen…",
            unableToReconnect: "Ezin izan da birkonektatu.",
            exitStream: "Irten emanalditik",
            streamTitle: streamTitle("Emanaldia"),
        },
        network: {
            poorConnection: "Konexio ahula",
            gameplayMayStutter: "Jokoa trabatu daiteke.",
            veryPoorConnection: "Konexio oso ahula",
            connectionMayDisconnect: "Konexioa eten daiteke.",
            connectionRestored: "Konexioa berreskuratu da",
        },
        errors: {
            fullscreenUnsupported: "Zure nabigatzaileak ez du pantaila osoa onartzen.",
            unsupportedBrowser: "Onartzen ez den nabigatzailea",
            pointerLockUnsupported: "Zure nabigatzaileak ez du kurtsore-blokeoa onartzen.",
            endStreamFailed: "Ezin izan da emanaldia amaitu",
            pleaseTryAgain: "Saiatu berriro.",
        },
    },

    gl: {
        common: { ok: "Aceptar", retry: "Tentar de novo", continueText: "Continuar", reconnect: "Reconectar" },
        onboarding: {
            title: "Controis do xogo e pantalla completa",
            message: "Os 3 puntos están na esquina superior dereita. Abren os controis do xogo.",
            escHint: "Mantén premido ESC para saír da pantalla completa.",
        },
        navbar: { fullscreen: "Pantalla completa", endStream: "Rematar a transmisión", ending: "Rematando..." },
        connection: {
            startingGame: "Iniciando o xogo…",
            connected: "Conectado! Fai clic para comezar...",
            connectionLostTitle: "Conexión perdida",
            clickReconnect: "Fai clic en Reconectar para continuar.",
            connectionLostToast: "Conexión perdida",
            waitingForConnection: "Agardando pola conexión...",
            connectingTitle: "Conectando...",
            creatingNewStream: "Creando unha nova transmisión...",
            reconnected: "Reconectado",
            reconnecting: "Reconectando…",
            unableToReconnect: "Non se puido reconectar.",
            exitStream: "Saír da transmisión",
            streamTitle: streamTitle("Transmisión"),
        },
        network: {
            poorConnection: "Conexión feble",
            gameplayMayStutter: "O xogo pode ir a trompicóns.",
            veryPoorConnection: "Conexión moi feble",
            connectionMayDisconnect: "A conexión pode cortarse.",
            connectionRestored: "Conexión restaurada",
        },
        errors: {
            fullscreenUnsupported: "O teu navegador non admite a pantalla completa.",
            unsupportedBrowser: "Navegador non compatible",
            pointerLockUnsupported: "O teu navegador non admite o bloqueo do punteiro.",
            endStreamFailed: "Non se puido rematar a transmisión",
            pleaseTryAgain: "Téntao de novo.",
        },
    },

    af: {
        common: { ok: "OK", retry: "Probeer weer", continueText: "Gaan voort", reconnect: "Herkoppel" },
        onboarding: {
            title: "Speletjiebeheer & Volskerm",
            message: "Die 3 kolletjies is in die boonste regterhoek. Dit maak die speletjiebeheer oop.",
            escHint: "Hou ESC in om volskerm te verlaat.",
        },
        navbar: { fullscreen: "Volskerm", endStream: "Beëindig stroom", ending: "Beëindig tans..." },
        connection: {
            startingGame: "Speletjie begin…",
            connected: "Gekoppel! Klik om te begin...",
            connectionLostTitle: "Verbinding verloor",
            clickReconnect: "Klik Herkoppel om voort te gaan.",
            connectionLostToast: "Verbinding verloor",
            waitingForConnection: "Wag vir verbinding...",
            connectingTitle: "Koppel tans...",
            creatingNewStream: "Skep nuwe stroom...",
            reconnected: "Herkoppel",
            reconnecting: "Herkoppel tans…",
            unableToReconnect: "Kon nie herkoppel nie.",
            exitStream: "Verlaat stroom",
            streamTitle: streamTitle("Stroom"),
        },
        network: {
            poorConnection: "Swak verbinding",
            gameplayMayStutter: "Speletjie mag hakkel.",
            veryPoorConnection: "Baie swak verbinding",
            connectionMayDisconnect: "Verbinding mag ontkoppel.",
            connectionRestored: "Verbinding herstel",
        },
        errors: {
            fullscreenUnsupported: "Jou blaaier ondersteun nie volskerm nie.",
            unsupportedBrowser: "Blaaier nie ondersteun nie",
            pointerLockUnsupported: "Jou blaaier ondersteun nie wysersluiting nie.",
            endStreamFailed: "Kon nie stroom beëindig nie",
            pleaseTryAgain: "Probeer asseblief weer.",
        },
    },

    sw: {
        common: { ok: "Sawa", retry: "Jaribu tena", continueText: "Endelea", reconnect: "Unganisha tena" },
        onboarding: {
            title: "Vidhibiti vya Mchezo na Skrini Nzima",
            message: "Nukta 3 ziko kwenye kona ya juu kulia. Zinafungua vidhibiti vya mchezo.",
            escHint: "Shikilia ESC ili kutoka kwenye skrini nzima.",
        },
        navbar: { fullscreen: "Skrini Nzima", endStream: "Maliza Utiririshaji", ending: "Inamaliza..." },
        connection: {
            startingGame: "Inaanzisha mchezo…",
            connected: "Imeunganishwa! Bofya kuanza...",
            connectionLostTitle: "Muunganisho Umepotea",
            clickReconnect: "Bofya Unganisha Tena ili kuendelea.",
            connectionLostToast: "Muunganisho umepotea",
            waitingForConnection: "Inasubiri muunganisho...",
            connectingTitle: "Inaunganisha...",
            creatingNewStream: "Inaunda utiririshaji mpya...",
            reconnected: "Imeunganishwa tena",
            reconnecting: "Inaunganisha tena…",
            unableToReconnect: "Imeshindwa kuunganisha tena.",
            exitStream: "Toka kwenye utiririshaji",
            streamTitle: streamTitle("Utiririshaji"),
        },
        network: {
            poorConnection: "Muunganisho hafifu",
            gameplayMayStutter: "Mchezo unaweza kukwama.",
            veryPoorConnection: "Muunganisho hafifu sana",
            connectionMayDisconnect: "Muunganisho unaweza kukatika.",
            connectionRestored: "Muunganisho umerejeshwa",
        },
        errors: {
            fullscreenUnsupported: "Kivinjari chako hakitumii skrini nzima.",
            unsupportedBrowser: "Kivinjari Kisichotumika",
            pointerLockUnsupported: "Kivinjari chako hakitumii ufungaji wa kishale.",
            endStreamFailed: "Imeshindwa Kumaliza Utiririshaji",
            pleaseTryAgain: "Tafadhali jaribu tena.",
        },
    },

    fil: {
        common: { ok: "OK", retry: "Subukang Muli", continueText: "Magpatuloy", reconnect: "Kumonekta Muli" },
        onboarding: {
            title: "Mga Kontrol ng Laro at Fullscreen",
            message: "Ang 3 tuldok ay nasa kanang itaas na sulok. Binubuksan nila ang mga kontrol ng laro.",
            escHint: "Pindutin nang matagal ang ESC para lumabas sa fullscreen.",
        },
        navbar: { fullscreen: "Fullscreen", endStream: "Tapusin ang Stream", ending: "Tinatapos..." },
        connection: {
            startingGame: "Sinisimulan ang laro…",
            connected: "Nakakonekta! I-click para magsimula...",
            connectionLostTitle: "Nawalan ng Koneksyon",
            clickReconnect: "I-click ang Kumonekta Muli para magpatuloy.",
            connectionLostToast: "Nawalan ng koneksyon",
            waitingForConnection: "Naghihintay ng koneksyon...",
            connectingTitle: "Kumokonekta...",
            creatingNewStream: "Gumagawa ng bagong stream...",
            reconnected: "Nakakonekta muli",
            reconnecting: "Kumokonekta muli…",
            unableToReconnect: "Hindi makakonekta muli.",
            exitStream: "Lumabas sa Stream",
            streamTitle: streamTitle("Stream"),
        },
        network: {
            poorConnection: "Mahinang koneksyon",
            gameplayMayStutter: "Maaaring mag-stutter ang laro.",
            veryPoorConnection: "Napakahinang koneksyon",
            connectionMayDisconnect: "Maaaring maputol ang koneksyon.",
            connectionRestored: "Naibalik ang koneksyon",
        },
        errors: {
            fullscreenUnsupported: "Hindi suportado ng iyong browser ang fullscreen.",
            unsupportedBrowser: "Hindi Suportadong Browser",
            pointerLockUnsupported: "Hindi suportado ng iyong browser ang pointer lock.",
            endStreamFailed: "Nabigong Tapusin ang Stream",
            pleaseTryAgain: "Pakisubukang muli.",
        },
    },

    ml: {
        common: { ok: "ശരി", retry: "വീണ്ടും ശ്രമിക്കുക", continueText: "തുടരുക", reconnect: "വീണ്ടും ബന്ധിപ്പിക്കുക" },
        onboarding: {
            title: "ഗെയിം നിയന്ത്രണങ്ങളും ഫുൾസ്ക്രീനും",
            message: "3 ഡോട്ടുകൾ മുകളിൽ വലത് കോണിലാണ്. അവ ഗെയിം നിയന്ത്രണങ്ങൾ തുറക്കുന്നു.",
            escHint: "ഫുൾസ്ക്രീനിൽ നിന്ന് പുറത്തുകടക്കാൻ ESC അമർത്തിപ്പിടിക്കുക.",
        },
        navbar: { fullscreen: "ഫുൾസ്ക്രീൻ", endStream: "സ്ട്രീം അവസാനിപ്പിക്കുക", ending: "അവസാനിപ്പിക്കുന്നു..." },
        connection: {
            startingGame: "ഗെയിം ആരംഭിക്കുന്നു…",
            connected: "ബന്ധിപ്പിച്ചു! ആരംഭിക്കാൻ ക്ലിക്ക് ചെയ്യുക...",
            connectionLostTitle: "കണക്ഷൻ നഷ്ടപ്പെട്ടു",
            clickReconnect: "തുടരാൻ വീണ്ടും ബന്ധിപ്പിക്കുക ക്ലിക്ക് ചെയ്യുക.",
            connectionLostToast: "കണക്ഷൻ നഷ്ടപ്പെട്ടു",
            waitingForConnection: "കണക്ഷനായി കാത്തിരിക്കുന്നു...",
            connectingTitle: "ബന്ധിപ്പിക്കുന്നു...",
            creatingNewStream: "പുതിയ സ്ട്രീം സൃഷ്ടിക്കുന്നു...",
            reconnected: "വീണ്ടും ബന്ധിപ്പിച്ചു",
            reconnecting: "വീണ്ടും ബന്ധിപ്പിക്കുന്നു…",
            unableToReconnect: "വീണ്ടും ബന്ധിപ്പിക്കാൻ കഴിഞ്ഞില്ല.",
            exitStream: "സ്ട്രീമിൽ നിന്ന് പുറത്തുകടക്കുക",
            streamTitle: streamTitle("സ്ട്രീം"),
        },
        network: {
            poorConnection: "ദുർബലമായ കണക്ഷൻ",
            gameplayMayStutter: "ഗെയിംപ്ലേ തടസ്സപ്പെടാം.",
            veryPoorConnection: "വളരെ ദുർബലമായ കണക്ഷൻ",
            connectionMayDisconnect: "കണക്ഷൻ വിച്ഛേദിക്കപ്പെടാം.",
            connectionRestored: "കണക്ഷൻ പുനഃസ്ഥാപിച്ചു",
        },
        errors: {
            fullscreenUnsupported: "നിങ്ങളുടെ ബ്രൗസർ ഫുൾസ്ക്രീൻ പിന്തുണയ്ക്കുന്നില്ല.",
            unsupportedBrowser: "പിന്തുണയില്ലാത്ത ബ്രൗസർ",
            pointerLockUnsupported: "നിങ്ങളുടെ ബ്രൗസർ പോയിന്റർ ലോക്ക് പിന്തുണയ്ക്കുന്നില്ല.",
            endStreamFailed: "സ്ട്രീം അവസാനിപ്പിക്കുന്നതിൽ പരാജയപ്പെട്ടു",
            pleaseTryAgain: "ദയവായി വീണ്ടും ശ്രമിക്കുക.",
        },
    },

    kn: {
        common: { ok: "ಸರಿ", retry: "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ", continueText: "ಮುಂದುವರಿಸಿ", reconnect: "ಮರುಸಂಪರ್ಕಿಸಿ" },
        onboarding: {
            title: "ಆಟದ ನಿಯಂತ್ರಣಗಳು ಮತ್ತು ಪೂರ್ಣಪರದೆ",
            message: "3 ಚುಕ್ಕೆಗಳು ಮೇಲಿನ ಬಲ ಮೂಲೆಯಲ್ಲಿವೆ. ಅವು ಆಟದ ನಿಯಂತ್ರಣಗಳನ್ನು ತೆರೆಯುತ್ತವೆ.",
            escHint: "ಪೂರ್ಣಪರದೆಯಿಂದ ಹೊರಬರಲು ESC ಒತ್ತಿ ಹಿಡಿಯಿರಿ.",
        },
        navbar: { fullscreen: "ಪೂರ್ಣಪರದೆ", endStream: "ಸ್ಟ್ರೀಮ್ ಅಂತ್ಯಗೊಳಿಸಿ", ending: "ಅಂತ್ಯಗೊಳಿಸಲಾಗುತ್ತಿದೆ..." },
        connection: {
            startingGame: "ಆಟ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ…",
            connected: "ಸಂಪರ್ಕಗೊಂಡಿದೆ! ಪ್ರಾರಂಭಿಸಲು ಕ್ಲಿಕ್ ಮಾಡಿ...",
            connectionLostTitle: "ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ",
            clickReconnect: "ಮುಂದುವರಿಸಲು ಮರುಸಂಪರ್ಕಿಸಿ ಕ್ಲಿಕ್ ಮಾಡಿ.",
            connectionLostToast: "ಸಂಪರ್ಕ ಕಡಿತಗೊಂಡಿದೆ",
            waitingForConnection: "ಸಂಪರ್ಕಕ್ಕಾಗಿ ಕಾಯಲಾಗುತ್ತಿದೆ...",
            connectingTitle: "ಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ...",
            creatingNewStream: "ಹೊಸ ಸ್ಟ್ರೀಮ್ ರಚಿಸಲಾಗುತ್ತಿದೆ...",
            reconnected: "ಮರುಸಂಪರ್ಕಗೊಂಡಿದೆ",
            reconnecting: "ಮರುಸಂಪರ್ಕಿಸಲಾಗುತ್ತಿದೆ…",
            unableToReconnect: "ಮರುಸಂಪರ್ಕಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ.",
            exitStream: "ಸ್ಟ್ರೀಮ್‌ನಿಂದ ನಿರ್ಗಮಿಸಿ",
            streamTitle: streamTitle("ಸ್ಟ್ರೀಮ್"),
        },
        network: {
            poorConnection: "ದುರ್ಬಲ ಸಂಪರ್ಕ",
            gameplayMayStutter: "ಆಟ ತೊಡಕಬಹುದು.",
            veryPoorConnection: "ಅತ್ಯಂತ ದುರ್ಬಲ ಸಂಪರ್ಕ",
            connectionMayDisconnect: "ಸಂಪರ್ಕ ಕಡಿತಗೊಳ್ಳಬಹುದು.",
            connectionRestored: "ಸಂಪರ್ಕ ಪುನಃಸ್ಥಾಪಿಸಲಾಗಿದೆ",
        },
        errors: {
            fullscreenUnsupported: "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಪೂರ್ಣಪರದೆಯನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
            unsupportedBrowser: "ಬೆಂಬಲಿಸದ ಬ್ರೌಸರ್",
            pointerLockUnsupported: "ನಿಮ್ಮ ಬ್ರೌಸರ್ ಪಾಯಿಂಟರ್ ಲಾಕ್ ಅನ್ನು ಬೆಂಬಲಿಸುವುದಿಲ್ಲ.",
            endStreamFailed: "ಸ್ಟ್ರೀಮ್ ಅಂತ್ಯಗೊಳಿಸಲು ವಿಫಲವಾಗಿದೆ",
            pleaseTryAgain: "ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
        },
    },

    gu: {
        common: { ok: "બરાબર", retry: "ફરી પ્રયાસ કરો", continueText: "ચાલુ રાખો", reconnect: "ફરીથી કનેક્ટ કરો" },
        onboarding: {
            title: "ગેમ નિયંત્રણો અને ફુલસ્ક્રીન",
            message: "3 ટપકાં ઉપર જમણા ખૂણે છે. તેઓ ગેમ નિયંત્રણો ખોલે છે.",
            escHint: "ફુલસ્ક્રીનમાંથી બહાર નીકળવા ESC દબાવી રાખો.",
        },
        navbar: { fullscreen: "ફુલસ્ક્રીન", endStream: "સ્ટ્રીમ સમાપ્ત કરો", ending: "સમાપ્ત થઈ રહ્યું છે..." },
        connection: {
            startingGame: "ગેમ શરૂ થઈ રહી છે…",
            connected: "કનેક્ટ થયું! શરૂ કરવા ક્લિક કરો...",
            connectionLostTitle: "કનેક્શન તૂટી ગયું",
            clickReconnect: "ચાલુ રાખવા ફરીથી કનેક્ટ કરો પર ક્લિક કરો.",
            connectionLostToast: "કનેક્શન તૂટી ગયું",
            waitingForConnection: "કનેક્શનની રાહ જોવાઈ રહી છે...",
            connectingTitle: "કનેક્ટ થઈ રહ્યું છે...",
            creatingNewStream: "નવો સ્ટ્રીમ બનાવાઈ રહ્યો છે...",
            reconnected: "ફરીથી કનેક્ટ થયું",
            reconnecting: "ફરીથી કનેક્ટ થઈ રહ્યું છે…",
            unableToReconnect: "ફરીથી કનેક્ટ કરી શકાયું નહીં.",
            exitStream: "સ્ટ્રીમમાંથી બહાર નીકળો",
            streamTitle: streamTitle("સ્ટ્રીમ"),
        },
        network: {
            poorConnection: "નબળું કનેક્શન",
            gameplayMayStutter: "ગેમપ્લે અટકી શકે છે.",
            veryPoorConnection: "ખૂબ નબળું કનેક્શન",
            connectionMayDisconnect: "કનેક્શન તૂટી શકે છે.",
            connectionRestored: "કનેક્શન પુનઃસ્થાપિત થયું",
        },
        errors: {
            fullscreenUnsupported: "તમારું બ્રાઉઝર ફુલસ્ક્રીનને સપોર્ટ કરતું નથી.",
            unsupportedBrowser: "અસમર્થિત બ્રાઉઝર",
            pointerLockUnsupported: "તમારું બ્રાઉઝર પોઇન્ટર લોકને સપોર્ટ કરતું નથી.",
            endStreamFailed: "સ્ટ્રીમ સમાપ્ત કરવામાં નિષ્ફળ",
            pleaseTryAgain: "કૃપા કરી ફરી પ્રયાસ કરો.",
        },
    },

    pa: {
        common: { ok: "ਠੀਕ ਹੈ", retry: "ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ", continueText: "ਜਾਰੀ ਰੱਖੋ", reconnect: "ਮੁੜ ਕਨੈਕਟ ਕਰੋ" },
        onboarding: {
            title: "ਗੇਮ ਕੰਟਰੋਲ ਅਤੇ ਫੁੱਲਸਕ੍ਰੀਨ",
            message: "3 ਬਿੰਦੀਆਂ ਉੱਪਰ ਸੱਜੇ ਕੋਨੇ ਵਿੱਚ ਹਨ। ਇਹ ਗੇਮ ਕੰਟਰੋਲ ਖੋਲ੍ਹਦੀਆਂ ਹਨ।",
            escHint: "ਫੁੱਲਸਕ੍ਰੀਨ ਤੋਂ ਬਾਹਰ ਆਉਣ ਲਈ ESC ਦਬਾਈ ਰੱਖੋ।",
        },
        navbar: { fullscreen: "ਫੁੱਲਸਕ੍ਰੀਨ", endStream: "ਸਟ੍ਰੀਮ ਖਤਮ ਕਰੋ", ending: "ਖਤਮ ਹੋ ਰਿਹਾ ਹੈ..." },
        connection: {
            startingGame: "ਗੇਮ ਸ਼ੁਰੂ ਹੋ ਰਹੀ ਹੈ…",
            connected: "ਕਨੈਕਟ ਹੋ ਗਿਆ! ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਕਲਿੱਕ ਕਰੋ...",
            connectionLostTitle: "ਕਨੈਕਸ਼ਨ ਟੁੱਟ ਗਿਆ",
            clickReconnect: "ਜਾਰੀ ਰੱਖਣ ਲਈ ਮੁੜ ਕਨੈਕਟ ਕਰੋ 'ਤੇ ਕਲਿੱਕ ਕਰੋ।",
            connectionLostToast: "ਕਨੈਕਸ਼ਨ ਟੁੱਟ ਗਿਆ",
            waitingForConnection: "ਕਨੈਕਸ਼ਨ ਦੀ ਉਡੀਕ ਹੋ ਰਹੀ ਹੈ...",
            connectingTitle: "ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ...",
            creatingNewStream: "ਨਵੀਂ ਸਟ੍ਰੀਮ ਬਣਾਈ ਜਾ ਰਹੀ ਹੈ...",
            reconnected: "ਮੁੜ ਕਨੈਕਟ ਹੋ ਗਿਆ",
            reconnecting: "ਮੁੜ ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ…",
            unableToReconnect: "ਮੁੜ ਕਨੈਕਟ ਕਰਨ ਵਿੱਚ ਅਸਮਰੱਥ।",
            exitStream: "ਸਟ੍ਰੀਮ ਤੋਂ ਬਾਹਰ ਜਾਓ",
            streamTitle: streamTitle("ਸਟ੍ਰੀਮ"),
        },
        network: {
            poorConnection: "ਕਮਜ਼ੋਰ ਕਨੈਕਸ਼ਨ",
            gameplayMayStutter: "ਗੇਮਪਲੇ ਅਟਕ ਸਕਦਾ ਹੈ।",
            veryPoorConnection: "ਬਹੁਤ ਕਮਜ਼ੋਰ ਕਨੈਕਸ਼ਨ",
            connectionMayDisconnect: "ਕਨੈਕਸ਼ਨ ਟੁੱਟ ਸਕਦਾ ਹੈ।",
            connectionRestored: "ਕਨੈਕਸ਼ਨ ਬਹਾਲ ਹੋ ਗਿਆ",
        },
        errors: {
            fullscreenUnsupported: "ਤੁਹਾਡਾ ਬ੍ਰਾਊਜ਼ਰ ਫੁੱਲਸਕ੍ਰੀਨ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ।",
            unsupportedBrowser: "ਅਸਮਰਥਿਤ ਬ੍ਰਾਊਜ਼ਰ",
            pointerLockUnsupported: "ਤੁਹਾਡਾ ਬ੍ਰਾਊਜ਼ਰ ਪੁਆਇੰਟਰ ਲਾਕ ਦਾ ਸਮਰਥਨ ਨਹੀਂ ਕਰਦਾ।",
            endStreamFailed: "ਸਟ੍ਰੀਮ ਖਤਮ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
            pleaseTryAgain: "ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।",
        },
    },

    ne: {
        common: { ok: "ठिक छ", retry: "फेरि प्रयास गर्नुहोस्", continueText: "जारी राख्नुहोस्", reconnect: "पुनः जडान गर्नुहोस्" },
        onboarding: {
            title: "गेम नियन्त्रण र पूर्णस्क्रिन",
            message: "3 थोप्लाहरू माथि दायाँ कुनामा छन्। तिनीहरूले गेम नियन्त्रण खोल्छन्।",
            escHint: "पूर्णस्क्रिनबाट बाहिर निस्कन ESC थिचिराख्नुहोस्।",
        },
        navbar: { fullscreen: "पूर्णस्क्रिन", endStream: "स्ट्रिम अन्त्य गर्नुहोस्", ending: "अन्त्य हुँदै..." },
        connection: {
            startingGame: "गेम सुरु हुँदैछ…",
            connected: "जडान भयो! सुरु गर्न क्लिक गर्नुहोस्...",
            connectionLostTitle: "जडान गुम्यो",
            clickReconnect: "जारी राख्न पुनः जडान गर्नुहोस् क्लिक गर्नुहोस्।",
            connectionLostToast: "जडान गुम्यो",
            waitingForConnection: "जडानको प्रतीक्षामा...",
            connectingTitle: "जडान हुँदैछ...",
            creatingNewStream: "नयाँ स्ट्रिम बनाइँदै...",
            reconnected: "पुनः जडान भयो",
            reconnecting: "पुनः जडान हुँदैछ…",
            unableToReconnect: "पुनः जडान गर्न असमर्थ।",
            exitStream: "स्ट्रिमबाट बाहिर निस्कनुहोस्",
            streamTitle: streamTitle("स्ट्रिम"),
        },
        network: {
            poorConnection: "कमजोर जडान",
            gameplayMayStutter: "गेमप्ले अड्किन सक्छ।",
            veryPoorConnection: "धेरै कमजोर जडान",
            connectionMayDisconnect: "जडान टुट्न सक्छ।",
            connectionRestored: "जडान पुनर्स्थापित भयो",
        },
        errors: {
            fullscreenUnsupported: "तपाईंको ब्राउजरले पूर्णस्क्रिन समर्थन गर्दैन।",
            unsupportedBrowser: "असमर्थित ब्राउजर",
            pointerLockUnsupported: "तपाईंको ब्राउजरले पोइन्टर लक समर्थन गर्दैन।",
            endStreamFailed: "स्ट्रिम अन्त्य गर्न असफल",
            pleaseTryAgain: "कृपया फेरि प्रयास गर्नुहोस्।",
        },
    },

    si: {
        common: { ok: "හරි", retry: "නැවත උත්සාහ කරන්න", continueText: "ඉදිරියට යන්න", reconnect: "යළි සම්බන්ධ වන්න" },
        onboarding: {
            title: "ක්‍රීඩා පාලන සහ පූර්ණ තිරය",
            message: "තිත් 3 ඉහළ දකුණු කෙළවරේ ඇත. ඒවා ක්‍රීඩා පාලන විවෘත කරයි.",
            escHint: "පූර්ණ තිරයෙන් පිටවීමට ESC රඳවා ගන්න.",
        },
        navbar: { fullscreen: "පූර්ණ තිරය", endStream: "ප්‍රවාහය අවසන් කරන්න", ending: "අවසන් වෙමින්..." },
        connection: {
            startingGame: "ක්‍රීඩාව ආරම්භ වෙමින්…",
            connected: "සම්බන්ධ විය! ආරම්භ කිරීමට ක්ලික් කරන්න...",
            connectionLostTitle: "සම්බන්ධතාවය නැති විය",
            clickReconnect: "ඉදිරියට යාමට යළි සම්බන්ධ වන්න ක්ලික් කරන්න.",
            connectionLostToast: "සම්බන්ධතාවය නැති විය",
            waitingForConnection: "සම්බන්ධතාවය සඳහා රැඳී සිටී...",
            connectingTitle: "සම්බන්ධ වෙමින්...",
            creatingNewStream: "නව ප්‍රවාහයක් සාදමින්...",
            reconnected: "යළි සම්බන්ධ විය",
            reconnecting: "යළි සම්බන්ධ වෙමින්…",
            unableToReconnect: "යළි සම්බන්ධ විය නොහැක.",
            exitStream: "ප්‍රවාහයෙන් ඉවත් වන්න",
            streamTitle: streamTitle("ප්‍රවාහය"),
        },
        network: {
            poorConnection: "දුර්වල සම්බන්ධතාවය",
            gameplayMayStutter: "ක්‍රීඩාව අවහිර විය හැක.",
            veryPoorConnection: "ඉතා දුර්වල සම්බන්ධතාවය",
            connectionMayDisconnect: "සම්බන්ධතාවය විසන්ධි විය හැක.",
            connectionRestored: "සම්බන්ධතාවය යථා තත්ත්වයට පත් විය",
        },
        errors: {
            fullscreenUnsupported: "ඔබගේ බ්‍රවුසරය පූර්ණ තිරය සඳහා සහාය නොදක්වයි.",
            unsupportedBrowser: "සහාය නොදක්වන බ්‍රවුසරය",
            pointerLockUnsupported: "ඔබගේ බ්‍රවුසරය දර්ශක අගුලු දැමීම සඳහා සහාය නොදක්වයි.",
            endStreamFailed: "ප්‍රවාහය අවසන් කිරීම අසාර්ථක විය",
            pleaseTryAgain: "කරුණාකර නැවත උත්සාහ කරන්න.",
        },
    },

    or: {
        common: { ok: "ଠିକ୍ ଅଛି", retry: "ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ", continueText: "ଜାରି ରଖନ୍ତୁ", reconnect: "ପୁଣି ସଂଯୋଗ କରନ୍ତୁ" },
        onboarding: {
            title: "ଗେମ୍ ନିୟନ୍ତ୍ରଣ ଓ ଫୁଲସ୍କ୍ରିନ୍",
            message: "3ଟି ବିନ୍ଦୁ ଉପର ଡାହାଣ କୋଣରେ ଅଛି। ସେଗୁଡ଼ିକ ଗେମ୍ ନିୟନ୍ତ୍ରଣ ଖୋଲନ୍ତି।",
            escHint: "ଫୁଲସ୍କ୍ରିନ୍ ବାହାରକୁ ଯିବାକୁ ESC ଦବାଇ ରଖନ୍ତୁ।",
        },
        navbar: { fullscreen: "ଫୁଲସ୍କ୍ରିନ୍", endStream: "ଷ୍ଟ୍ରିମ୍ ସମାପ୍ତ କରନ୍ତୁ", ending: "ସମାପ୍ତ ହେଉଛି..." },
        connection: {
            startingGame: "ଗେମ୍ ଆରମ୍ଭ ହେଉଛି…",
            connected: "ସଂଯୁକ୍ତ! ଆରମ୍ଭ କରିବାକୁ କ୍ଲିକ୍ କରନ୍ତୁ...",
            connectionLostTitle: "ସଂଯୋଗ ହଜିଗଲା",
            clickReconnect: "ଜାରି ରଖିବାକୁ ପୁଣି ସଂଯୋଗ କରନ୍ତୁ କ୍ଲିକ୍ କରନ୍ତୁ।",
            connectionLostToast: "ସଂଯୋଗ ହଜିଗଲା",
            waitingForConnection: "ସଂଯୋଗ ପାଇଁ ଅପେକ୍ଷା ହେଉଛି...",
            connectingTitle: "ସଂଯୋଗ ହେଉଛି...",
            creatingNewStream: "ନୂଆ ଷ୍ଟ୍ରିମ୍ ତିଆରି ହେଉଛି...",
            reconnected: "ପୁଣି ସଂଯୁକ୍ତ",
            reconnecting: "ପୁଣି ସଂଯୋଗ ହେଉଛି…",
            unableToReconnect: "ପୁଣି ସଂଯୋଗ ହୋଇପାରିଲା ନାହିଁ।",
            exitStream: "ଷ୍ଟ୍ରିମ୍‌ରୁ ବାହାରକୁ ଯାଆନ୍ତୁ",
            streamTitle: streamTitle("ଷ୍ଟ୍ରିମ୍"),
        },
        network: {
            poorConnection: "ଦୁର୍ବଳ ସଂଯୋଗ",
            gameplayMayStutter: "ଗେମପ୍ଲେ ଅଟକିପାରେ।",
            veryPoorConnection: "ଅତ୍ୟନ୍ତ ଦୁର୍ବଳ ସଂଯୋଗ",
            connectionMayDisconnect: "ସଂଯୋଗ ବିଚ୍ଛିନ୍ନ ହୋଇପାରେ।",
            connectionRestored: "ସଂଯୋଗ ପୁନଃସ୍ଥାପିତ ହେଲା",
        },
        errors: {
            fullscreenUnsupported: "ଆପଣଙ୍କ ବ୍ରାଉଜର୍ ଫୁଲସ୍କ୍ରିନ୍ ସମର୍ଥନ କରେ ନାହିଁ।",
            unsupportedBrowser: "ଅସମର୍ଥିତ ବ୍ରାଉଜର୍",
            pointerLockUnsupported: "ଆପଣଙ୍କ ବ୍ରାଉଜର୍ ପଏଣ୍ଟର୍ ଲକ୍ ସମର୍ଥନ କରେ ନାହିଁ।",
            endStreamFailed: "ଷ୍ଟ୍ରିମ୍ ସମାପ୍ତ କରିବାରେ ବିଫଳ",
            pleaseTryAgain: "ଦୟାକରି ପୁଣି ଚେଷ୍ଟା କରନ୍ତୁ।",
        },
    },

    as: {
        common: { ok: "ঠিক আছে", retry: "পুনৰ চেষ্টা কৰক", continueText: "অব্যাহত ৰাখক", reconnect: "পুনৰ সংযোগ কৰক" },
        onboarding: {
            title: "গেম নিয়ন্ত্ৰণ আৰু ফুলস্ক্ৰীন",
            message: "3টা বিন্দু ওপৰৰ সোঁ কোণত আছে। সিহঁতে গেম নিয়ন্ত্ৰণ খোলে।",
            escHint: "ফুলস্ক্ৰীনৰ পৰা ওলাবলৈ ESC টিপি ৰাখক।",
        },
        navbar: { fullscreen: "ফুলস্ক্ৰীন", endStream: "ষ্ট্ৰীম সমাপ্ত কৰক", ending: "সমাপ্ত হৈ আছে..." },
        connection: {
            startingGame: "গেম আৰম্ভ হৈ আছে…",
            connected: "সংযুক্ত হ'ল! আৰম্ভ কৰিবলৈ ক্লিক কৰক...",
            connectionLostTitle: "সংযোগ বিচ্ছিন্ন হ'ল",
            clickReconnect: "অব্যাহত ৰাখিবলৈ পুনৰ সংযোগ কৰক ক্লিক কৰক।",
            connectionLostToast: "সংযোগ বিচ্ছিন্ন হ'ল",
            waitingForConnection: "সংযোগৰ বাবে অপেক্ষা কৰি আছে...",
            connectingTitle: "সংযোগ হৈ আছে...",
            creatingNewStream: "নতুন ষ্ট্ৰীম সৃষ্টি হৈ আছে...",
            reconnected: "পুনৰ সংযুক্ত হ'ল",
            reconnecting: "পুনৰ সংযোগ হৈ আছে…",
            unableToReconnect: "পুনৰ সংযোগ কৰিব পৰা নগ'ল।",
            exitStream: "ষ্ট্ৰীমৰ পৰা বাহিৰ ওলাওক",
            streamTitle: streamTitle("ষ্ট্ৰীম"),
        },
        network: {
            poorConnection: "দুৰ্বল সংযোগ",
            gameplayMayStutter: "গেমপ্লে বাধাগ্ৰস্ত হ'ব পাৰে।",
            veryPoorConnection: "অতি দুৰ্বল সংযোগ",
            connectionMayDisconnect: "সংযোগ বিচ্ছিন্ন হ'ব পাৰে।",
            connectionRestored: "সংযোগ পুনৰুদ্ধাৰ হ'ল",
        },
        errors: {
            fullscreenUnsupported: "আপোনাৰ ব্ৰাউজাৰে ফুলস্ক্ৰীন সমৰ্থন নকৰে।",
            unsupportedBrowser: "অসমৰ্থিত ব্ৰাউজাৰ",
            pointerLockUnsupported: "আপোনাৰ ব্ৰাউজাৰে পইণ্টাৰ লক সমৰ্থন নকৰে।",
            endStreamFailed: "ষ্ট্ৰীম সমাপ্ত কৰাত విఫల হ'ল",
            pleaseTryAgain: "অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।",
        },
    },

    km: {
        common: { ok: "យល់ព្រម", retry: "ព្យាយាមម្ដងទៀត", continueText: "បន្ត", reconnect: "ភ្ជាប់ឡើងវិញ" },
        onboarding: {
            title: "ការគ្រប់គ្រងហ្គេម និងអេក្រង់ពេញ",
            message: "ចំណុចទាំង 3 នៅជ្រុងខាងលើស្ដាំ។ វាបើកការគ្រប់គ្រងហ្គេម។",
            escHint: "ចុច ESC ឱ្យជាប់ដើម្បីចេញពីអេក្រង់ពេញ។",
        },
        navbar: { fullscreen: "អេក្រង់ពេញ", endStream: "បញ្ចប់ស្ទ្រីម", ending: "កំពុងបញ្ចប់..." },
        connection: {
            startingGame: "កំពុងចាប់ផ្ដើមហ្គេម…",
            connected: "បានភ្ជាប់! ចុចដើម្បីចាប់ផ្ដើម...",
            connectionLostTitle: "ការតភ្ជាប់បាត់បង់",
            clickReconnect: "ចុចភ្ជាប់ឡើងវិញដើម្បីបន្ត។",
            connectionLostToast: "ការតភ្ជាប់បាត់បង់",
            waitingForConnection: "កំពុងរង់ចាំការតភ្ជាប់...",
            connectingTitle: "កំពុងតភ្ជាប់...",
            creatingNewStream: "កំពុងបង្កើតស្ទ្រីមថ្មី...",
            reconnected: "បានភ្ជាប់ឡើងវិញ",
            reconnecting: "កំពុងភ្ជាប់ឡើងវិញ…",
            unableToReconnect: "មិនអាចភ្ជាប់ឡើងវិញបានទេ។",
            exitStream: "ចាកចេញពីស្ទ្រីម",
            streamTitle: streamTitle("ស្ទ្រីម"),
        },
        network: {
            poorConnection: "ការតភ្ជាប់ខ្សោយ",
            gameplayMayStutter: "ហ្គេមអាចនឹងគាំង។",
            veryPoorConnection: "ការតភ្ជាប់ខ្សោយខ្លាំង",
            connectionMayDisconnect: "ការតភ្ជាប់អាចនឹងផ្ដាច់។",
            connectionRestored: "ការតភ្ជាប់ត្រូវបានស្ដារឡើងវិញ",
        },
        errors: {
            fullscreenUnsupported: "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រអេក្រង់ពេញទេ។",
            unsupportedBrowser: "កម្មវិធីរុករកមិនគាំទ្រ",
            pointerLockUnsupported: "កម្មវិធីរុករករបស់អ្នកមិនគាំទ្រការចាក់សោព្រួញទេ។",
            endStreamFailed: "បរាជ័យក្នុងការបញ្ចប់ស្ទ្រីម",
            pleaseTryAgain: "សូមព្យាយាមម្ដងទៀត។",
        },
    },

    lo: {
        common: { ok: "ຕົກລົງ", retry: "ລອງໃໝ່", continueText: "ສືບຕໍ່", reconnect: "ເຊື່ອມຕໍ່ໃໝ່" },
        onboarding: {
            title: "ການຄວບຄຸມເກມ & ເຕັມຈໍ",
            message: "3 ຈຸດຢູ່ມຸມຂວາເທິງ. ມັນເປີດການຄວບຄຸມເກມ.",
            escHint: "ກົດ ESC ຄ້າງໄວ້ເພື່ອອອກຈາກເຕັມຈໍ.",
        },
        navbar: { fullscreen: "ເຕັມຈໍ", endStream: "ຢຸດການສະຕຣີມ", ending: "ກຳລັງຢຸດ..." },
        connection: {
            startingGame: "ກຳລັງເລີ່ມເກມ…",
            connected: "ເຊື່ອມຕໍ່ແລ້ວ! ຄລິກເພື່ອເລີ່ມ...",
            connectionLostTitle: "ການເຊື່ອມຕໍ່ຂາດ",
            clickReconnect: "ຄລິກ ເຊື່ອມຕໍ່ໃໝ່ ເພື່ອສືບຕໍ່.",
            connectionLostToast: "ການເຊື່ອມຕໍ່ຂາດ",
            waitingForConnection: "ກຳລັງລໍຖ້າການເຊື່ອມຕໍ່...",
            connectingTitle: "ກຳລັງເຊື່ອມຕໍ່...",
            creatingNewStream: "ກຳລັງສ້າງສະຕຣີມໃໝ່...",
            reconnected: "ເຊື່ອມຕໍ່ໃໝ່ແລ້ວ",
            reconnecting: "ກຳລັງເຊື່ອມຕໍ່ໃໝ່…",
            unableToReconnect: "ບໍ່ສາມາດເຊື່ອມຕໍ່ໃໝ່ໄດ້.",
            exitStream: "ອອກຈາກສະຕຣີມ",
            streamTitle: streamTitle("ສະຕຣີມ"),
        },
        network: {
            poorConnection: "ການເຊື່ອມຕໍ່ອ່ອນ",
            gameplayMayStutter: "ເກມອາດຈະກະຕຸກ.",
            veryPoorConnection: "ການເຊື່ອມຕໍ່ອ່ອນຫຼາຍ",
            connectionMayDisconnect: "ການເຊື່ອມຕໍ່ອາດຈະຂາດ.",
            connectionRestored: "ການເຊື່ອມຕໍ່ຄືນມາແລ້ວ",
        },
        errors: {
            fullscreenUnsupported: "ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບເຕັມຈໍ.",
            unsupportedBrowser: "ບຣາວເຊີບໍ່ຮອງຮັບ",
            pointerLockUnsupported: "ບຣາວເຊີຂອງທ່ານບໍ່ຮອງຮັບການລັອກຕົວຊີ້.",
            endStreamFailed: "ຢຸດການສະຕຣີມລົ້ມເຫລວ",
            pleaseTryAgain: "ກະລຸນາລອງໃໝ່.",
        },
    },

    my: {
        common: { ok: "OK", retry: "ထပ်စမ်းကြည့်ပါ", continueText: "ဆက်လုပ်ပါ", reconnect: "ပြန်ချိတ်ဆက်ပါ" },
        onboarding: {
            title: "ဂိမ်းထိန်းချုပ်မှုနှင့် ဖန်သားပြင်အပြည့်",
            message: "အစက် ၃ လုံးသည် ညာဘက်အပေါ်ထောင့်တွင်ရှိသည်။ ၎င်းတို့သည် ဂိမ်းထိန်းချုပ်မှုများကို ဖွင့်ပေးသည်။",
            escHint: "ဖန်သားပြင်အပြည့်မှ ထွက်ရန် ESC ကို ဖိထားပါ။",
        },
        navbar: { fullscreen: "ဖန်သားပြင်အပြည့်", endStream: "ဖြန့်ချိမှု ရပ်ပါ", ending: "ရပ်နေသည်..." },
        connection: {
            startingGame: "ဂိမ်းစတင်နေသည်…",
            connected: "ချိတ်ဆက်ပြီးပါပြီ! စတင်ရန် နှိပ်ပါ...",
            connectionLostTitle: "ချိတ်ဆက်မှု ပြတ်တောက်သွားပါပြီ",
            clickReconnect: "ဆက်လုပ်ရန် ပြန်ချိတ်ဆက်ပါ ကို နှိပ်ပါ။",
            connectionLostToast: "ချိတ်ဆက်မှု ပြတ်တောက်သွားပါပြီ",
            waitingForConnection: "ချိတ်ဆက်မှုကို စောင့်နေသည်...",
            connectingTitle: "ချိတ်ဆက်နေသည်...",
            creatingNewStream: "ဖြန့်ချိမှုအသစ် ဖန်တီးနေသည်...",
            reconnected: "ပြန်ချိတ်ဆက်ပြီးပါပြီ",
            reconnecting: "ပြန်ချိတ်ဆက်နေသည်…",
            unableToReconnect: "ပြန်ချိတ်ဆက်၍ မရပါ။",
            exitStream: "ဖြန့်ချိမှုမှ ထွက်ပါ",
            streamTitle: streamTitle("ဖြန့်ချိမှု"),
        },
        network: {
            poorConnection: "အားနည်းသော ချိတ်ဆက်မှု",
            gameplayMayStutter: "ဂိမ်းကစားမှု ချောက်ခြင်းဖြစ်နိုင်သည်။",
            veryPoorConnection: "အလွန်အားနည်းသော ချိတ်ဆက်မှု",
            connectionMayDisconnect: "ချိတ်ဆက်မှု ပြတ်တောက်နိုင်သည်။",
            connectionRestored: "ချိတ်ဆက်မှု ပြန်လည်ရရှိပါပြီ",
        },
        errors: {
            fullscreenUnsupported: "သင့်ဘရောက်ဇာသည် ဖန်သားပြင်အပြည့်ကို ပံ့ပိုးမပေးပါ။",
            unsupportedBrowser: "ပံ့ပိုးမပေးသော ဘရောက်ဇာ",
            pointerLockUnsupported: "သင့်ဘရောက်ဇာသည် pointer lock ကို ပံ့ပိုးမပေးပါ။",
            endStreamFailed: "ဖြန့်ချိမှု ရပ်ရန် မအောင်မြင်ပါ",
            pleaseTryAgain: "ကျေးဇူးပြု၍ ထပ်စမ်းကြည့်ပါ။",
        },
    },

    mn: {
        common: { ok: "ОК", retry: "Дахин оролдох", continueText: "Үргэлжлүүлэх", reconnect: "Дахин холбогдох" },
        onboarding: {
            title: "Тоглоомын удирдлага ба Бүтэн дэлгэц",
            message: "3 цэг баруун дээд буланд байна. Тэдгээр нь тоглоомын удирдлагыг нээдэг.",
            escHint: "Бүтэн дэлгэцээс гарахын тулд ESC товчийг дараад байлга.",
        },
        navbar: { fullscreen: "Бүтэн дэлгэц", endStream: "Дамжуулалтыг дуусгах", ending: "Дуусгаж байна..." },
        connection: {
            startingGame: "Тоглоом эхэлж байна…",
            connected: "Холбогдлоо! Эхлэхийн тулд дараарай...",
            connectionLostTitle: "Холболт тасарлаа",
            clickReconnect: "Үргэлжлүүлэхийн тулд Дахин холбогдох дээр дарна уу.",
            connectionLostToast: "Холболт тасарлаа",
            waitingForConnection: "Холболтыг хүлээж байна...",
            connectingTitle: "Холбогдож байна...",
            creatingNewStream: "Шинэ дамжуулалт үүсгэж байна...",
            reconnected: "Дахин холбогдлоо",
            reconnecting: "Дахин холбогдож байна…",
            unableToReconnect: "Дахин холбогдож чадсангүй.",
            exitStream: "Дамжуулалтаас гарах",
            streamTitle: streamTitle("Дамжуулалт"),
        },
        network: {
            poorConnection: "Сул холболт",
            gameplayMayStutter: "Тоглолт зогсонги байж болзошгүй.",
            veryPoorConnection: "Маш сул холболт",
            connectionMayDisconnect: "Холболт тасарч болзошгүй.",
            connectionRestored: "Холболт сэргэлээ",
        },
        errors: {
            fullscreenUnsupported: "Таны хөтөч бүтэн дэлгэцийг дэмждэггүй.",
            unsupportedBrowser: "Дэмжигдээгүй хөтөч",
            pointerLockUnsupported: "Таны хөтөч заагч түгжээг дэмждэггүй.",
            endStreamFailed: "Дамжуулалтыг дуусгаж чадсангүй",
            pleaseTryAgain: "Дахин оролдоно уу.",
        },
    },

    kk: {
        common: { ok: "Жарайды", retry: "Қайталау", continueText: "Жалғастыру", reconnect: "Қайта қосылу" },
        onboarding: {
            title: "Ойын басқару элементтері және Толық экран",
            message: "3 нүкте жоғарғы оң жақ бұрышта. Олар ойын басқару элементтерін ашады.",
            escHint: "Толық экраннан шығу үшін ESC пернесін басып тұрыңыз.",
        },
        navbar: { fullscreen: "Толық экран", endStream: "Ағынды аяқтау", ending: "Аяқталуда..." },
        connection: {
            startingGame: "Ойын іске қосылуда…",
            connected: "Қосылды! Бастау үшін басыңыз...",
            connectionLostTitle: "Байланыс үзілді",
            clickReconnect: "Жалғастыру үшін «Қайта қосылу» түймесін басыңыз.",
            connectionLostToast: "Байланыс үзілді",
            waitingForConnection: "Байланысты күту...",
            connectingTitle: "Қосылуда...",
            creatingNewStream: "Жаңа ағын жасалуда...",
            reconnected: "Қайта қосылды",
            reconnecting: "Қайта қосылуда…",
            unableToReconnect: "Қайта қосылу мүмкін болмады.",
            exitStream: "Ағыннан шығу",
            streamTitle: streamTitle("Ағын"),
        },
        network: {
            poorConnection: "Әлсіз байланыс",
            gameplayMayStutter: "Ойын кідіруі мүмкін.",
            veryPoorConnection: "Өте әлсіз байланыс",
            connectionMayDisconnect: "Байланыс үзілуі мүмкін.",
            connectionRestored: "Байланыс қалпына келтірілді",
        },
        errors: {
            fullscreenUnsupported: "Браузеріңіз толық экранды қолдамайды.",
            unsupportedBrowser: "Қолдау көрсетілмейтін браузер",
            pointerLockUnsupported: "Браузеріңіз курсорды құлыптауды қолдамайды.",
            endStreamFailed: "Ағынды аяқтау сәтсіз аяқталды",
            pleaseTryAgain: "Қайталап көріңіз.",
        },
    },

    uz: {
        common: { ok: "OK", retry: "Qayta urinish", continueText: "Davom etish", reconnect: "Qayta ulanish" },
        onboarding: {
            title: "O'yin boshqaruvi va To'liq ekran",
            message: "3 ta nuqta yuqori o'ng burchakda. Ular o'yin boshqaruvini ochadi.",
            escHint: "To'liq ekrandan chiqish uchun ESC tugmasini bosib turing.",
        },
        navbar: { fullscreen: "To'liq ekran", endStream: "Striming tugatish", ending: "Tugatilmoqda..." },
        connection: {
            startingGame: "O'yin ishga tushirilmoqda…",
            connected: "Ulandi! Boshlash uchun bosing...",
            connectionLostTitle: "Ulanish uzildi",
            clickReconnect: "Davom etish uchun Qayta ulanish tugmasini bosing.",
            connectionLostToast: "Ulanish uzildi",
            waitingForConnection: "Ulanish kutilmoqda...",
            connectingTitle: "Ulanmoqda...",
            creatingNewStream: "Yangi striming yaratilmoqda...",
            reconnected: "Qayta ulandi",
            reconnecting: "Qayta ulanmoqda…",
            unableToReconnect: "Qayta ulanib bo'lmadi.",
            exitStream: "Stримингдан chiqish",
            streamTitle: streamTitle("Striming"),
        },
        network: {
            poorConnection: "Zaif ulanish",
            gameplayMayStutter: "O'yin sekinlashishi mumkin.",
            veryPoorConnection: "Juda zaif ulanish",
            connectionMayDisconnect: "Ulanish uzilishi mumkin.",
            connectionRestored: "Ulanish tiklandi",
        },
        errors: {
            fullscreenUnsupported: "Brauzeringiz to'liq ekranni qo'llab-quvvatlamaydi.",
            unsupportedBrowser: "Qo'llab-quvvatlanmaydigan brauzer",
            pointerLockUnsupported: "Brauzeringiz kursorni qulflashni qo'llab-quvvatlamaydi.",
            endStreamFailed: "Stримингни tugatib bo'lmadi",
            pleaseTryAgain: "Qaytadan urinib ko'ring.",
        },
    },

    az: {
        common: { ok: "OK", retry: "Yenidən cəhd et", continueText: "Davam et", reconnect: "Yenidən qoşul" },
        onboarding: {
            title: "Oyun İdarəetməsi və Tam Ekran",
            message: "3 nöqtə sağ üst küncdədir. Onlar oyun idarəetməsini açır.",
            escHint: "Tam ekrandan çıxmaq üçün ESC-ni basılı saxlayın.",
        },
        navbar: { fullscreen: "Tam ekran", endStream: "Yayımı bitir", ending: "Bitirilir..." },
        connection: {
            startingGame: "Oyun başladılır…",
            connected: "Qoşuldu! Başlamaq üçün klikləyin...",
            connectionLostTitle: "Bağlantı itirildi",
            clickReconnect: "Davam etmək üçün Yenidən qoşul üzərinə klikləyin.",
            connectionLostToast: "Bağlantı itirildi",
            waitingForConnection: "Bağlantı gözlənilir...",
            connectingTitle: "Qoşulur...",
            creatingNewStream: "Yeni yayım yaradılır...",
            reconnected: "Yenidən qoşuldu",
            reconnecting: "Yenidən qoşulur…",
            unableToReconnect: "Yenidən qoşulmaq mümkün olmadı.",
            exitStream: "Yayımdan çıx",
            streamTitle: streamTitle("Yayım"),
        },
        network: {
            poorConnection: "Zəif bağlantı",
            gameplayMayStutter: "Oyun ləngiyə bilər.",
            veryPoorConnection: "Çox zəif bağlantı",
            connectionMayDisconnect: "Bağlantı kəsilə bilər.",
            connectionRestored: "Bağlantı bərpa olundu",
        },
        errors: {
            fullscreenUnsupported: "Brauzeriniz tam ekranı dəstəkləmir.",
            unsupportedBrowser: "Dəstəklənməyən brauzer",
            pointerLockUnsupported: "Brauzeriniz kursor kilidini dəstəkləmir.",
            endStreamFailed: "Yayımı bitirmək alınmadı",
            pleaseTryAgain: "Yenidən cəhd edin.",
        },
    },

    ka: {
        common: { ok: "კარგი", retry: "ხელახლა ცდა", continueText: "გაგრძელება", reconnect: "ხელახლა დაკავშირება" },
        onboarding: {
            title: "თამაშის მართვა და სრული ეკრანი",
            message: "3 წერტილი მდებარეობს ზედა მარჯვენა კუთხეში. ისინი ხსნიან თამაშის მართვას.",
            escHint: "დაიჭირეთ ESC სრული ეკრანიდან გამოსასვლელად.",
        },
        navbar: { fullscreen: "სრული ეკრანი", endStream: "სტრიმის დასრულება", ending: "სრულდება..." },
        connection: {
            startingGame: "თამაში იწყება…",
            connected: "დაკავშირებულია! დააჭირეთ დასაწყებად...",
            connectionLostTitle: "კავშირი დაიკარგა",
            clickReconnect: "დააჭირეთ ხელახლა დაკავშირებას გასაგრძელებლად.",
            connectionLostToast: "კავშირი დაიკარგა",
            waitingForConnection: "კავშირის მოლოდინში...",
            connectingTitle: "დაკავშირება...",
            creatingNewStream: "იქმნება ახალი სტრიმი...",
            reconnected: "ხელახლა დაკავშირებულია",
            reconnecting: "ხელახლა დაკავშირება…",
            unableToReconnect: "ხელახლა დაკავშირება ვერ მოხერხდა.",
            exitStream: "სტრიმიდან გასვლა",
            streamTitle: streamTitle("სტრიმი"),
        },
        network: {
            poorConnection: "სუსტი კავშირი",
            gameplayMayStutter: "თამაში შეიძლება შეფერხდეს.",
            veryPoorConnection: "ძალიან სუსტი კავშირი",
            connectionMayDisconnect: "კავშირი შეიძლება გაწყდეს.",
            connectionRestored: "კავშირი აღდგა",
        },
        errors: {
            fullscreenUnsupported: "თქვენი ბრაუზერი არ უჭერს მხარს სრულ ეკრანს.",
            unsupportedBrowser: "მხარდაუჭერელი ბრაუზერი",
            pointerLockUnsupported: "თქვენი ბრაუზერი არ უჭერს მხარს კურსორის დაბლოკვას.",
            endStreamFailed: "სტრიმის დასრულება ვერ მოხერხდა",
            pleaseTryAgain: "გთხოვთ სცადოთ ხელახლა.",
        },
    },

    hy: {
        common: { ok: "Լավ", retry: "Կրկին փորձել", continueText: "Շարունակել", reconnect: "Վերակապակցվել" },
        onboarding: {
            title: "Խաղի կառավարում և լիաէկրան",
            message: "3 կետերը գտնվում են վերևի աջ անկյունում։ Դրանք բացում են խաղի կառավարումը։",
            escHint: "Սեղմեք և պահեք ESC-ը՝ լիաէկրանից դուրս գալու համար։",
        },
        navbar: { fullscreen: "Լիաէկրան", endStream: "Ավարտել հեռարձակումը", ending: "Ավարտվում է..." },
        connection: {
            startingGame: "Խաղը մեկնարկում է…",
            connected: "Կապակցված է! Սեղմեք սկսելու համար...",
            connectionLostTitle: "Կապն ընդհատվեց",
            clickReconnect: "Շարունակելու համար սեղմեք Վերակապակցվել։",
            connectionLostToast: "Կապն ընդհատվեց",
            waitingForConnection: "Սպասվում է կապ...",
            connectingTitle: "Կապակցվում է...",
            creatingNewStream: "Ստեղծվում է նոր հեռարձակում...",
            reconnected: "Վերակապակցվեց",
            reconnecting: "Վերակապակցվում է…",
            unableToReconnect: "Հնարավոր չէ վերակապակցվել։",
            exitStream: "Դուրս գալ հեռարձակումից",
            streamTitle: streamTitle("Հեռարձակում"),
        },
        network: {
            poorConnection: "Թույլ կապ",
            gameplayMayStutter: "Խաղը կարող է կախվել։",
            veryPoorConnection: "Շատ թույլ կապ",
            connectionMayDisconnect: "Կապն ընդհատվել կարող է։",
            connectionRestored: "Կապը վերականգնվեց",
        },
        errors: {
            fullscreenUnsupported: "Ձեր դիտարկիչը չի աջակցում լիաէկրան ռեժիմը։",
            unsupportedBrowser: "Չաջակցվող դիտարկիչ",
            pointerLockUnsupported: "Ձեր դիտարկիչը չի աջակցում կուրսորի կողպումը։",
            endStreamFailed: "Հեռարձակումն ավարտել չհաջողվեց",
            pleaseTryAgain: "Խնդրում ենք կրկին փորձել։",
        },
    },

    sq: {
        common: { ok: "Në rregull", retry: "Provo përsëri", continueText: "Vazhdo", reconnect: "Rilidhu" },
        onboarding: {
            title: "Kontrollet e Lojës dhe Ekrani i Plotë",
            message: "3 pikat ndodhen në cepin e sipërm djathtas. Ato hapin kontrollet e lojës.",
            escHint: "Mbaj shtypur ESC për të dalë nga ekrani i plotë.",
        },
        navbar: { fullscreen: "Ekran i plotë", endStream: "Përfundo transmetimin", ending: "Duke përfunduar..." },
        connection: {
            startingGame: "Duke filluar lojën…",
            connected: "U lidh! Kliko për të filluar...",
            connectionLostTitle: "Lidhja Humbi",
            clickReconnect: "Kliko Rilidhu për të vazhduar.",
            connectionLostToast: "Lidhja humbi",
            waitingForConnection: "Duke pritur lidhjen...",
            connectingTitle: "Duke u lidhur...",
            creatingNewStream: "Duke krijuar transmetim të ri...",
            reconnected: "U rilidh",
            reconnecting: "Duke u rilidhur…",
            unableToReconnect: "Rilidhja dështoi.",
            exitStream: "Dil nga transmetimi",
            streamTitle: streamTitle("Transmetim"),
        },
        network: {
            poorConnection: "Lidhje e dobët",
            gameplayMayStutter: "Loja mund të ngecë.",
            veryPoorConnection: "Lidhje shumë e dobët",
            connectionMayDisconnect: "Lidhja mund të ndërpritet.",
            connectionRestored: "Lidhja u rikthye",
        },
        errors: {
            fullscreenUnsupported: "Shfletuesi juaj nuk e mbështet ekranin e plotë.",
            unsupportedBrowser: "Shfletues i pambështetur",
            pointerLockUnsupported: "Shfletuesi juaj nuk e mbështet kyçjen e kursorit.",
            endStreamFailed: "Përfundimi i transmetimit dështoi",
            pleaseTryAgain: "Provo përsëri.",
        },
    },

    mk: {
        common: { ok: "Во ред", retry: "Обиди се повторно", continueText: "Продолжи", reconnect: "Поврзи се повторно" },
        onboarding: {
            title: "Контроли на играта и цел екран",
            message: "3-те точки се во горниот десен агол. Тие ги отвораат контролите на играта.",
            escHint: "Држете ESC за да излезете од цел екран.",
        },
        navbar: { fullscreen: "Цел екран", endStream: "Заврши пренос", ending: "Завршува..." },
        connection: {
            startingGame: "Играта се стартува…",
            connected: "Поврзано! Кликнете за да започнете...",
            connectionLostTitle: "Врската е изгубена",
            clickReconnect: "Кликнете Поврзи се повторно за да продолжите.",
            connectionLostToast: "Врската е изгубена",
            waitingForConnection: "Се чека врска...",
            connectingTitle: "Се поврзува...",
            creatingNewStream: "Се создава нов пренос...",
            reconnected: "Повторно поврзано",
            reconnecting: "Се поврзува повторно…",
            unableToReconnect: "Не успеа повторно поврзување.",
            exitStream: "Излези од преносот",
            streamTitle: streamTitle("Пренос"),
        },
        network: {
            poorConnection: "Слаба врска",
            gameplayMayStutter: "Играта може да засекнува.",
            veryPoorConnection: "Многу слаба врска",
            connectionMayDisconnect: "Врската може да прекине.",
            connectionRestored: "Врската е обновена",
        },
        errors: {
            fullscreenUnsupported: "Вашиот прелистувач не поддржува цел екран.",
            unsupportedBrowser: "Неподдржан прелистувач",
            pointerLockUnsupported: "Вашиот прелистувач не поддржува заклучување на покажувачот.",
            endStreamFailed: "Не успеа завршување на преносот",
            pleaseTryAgain: "Ве молиме обидете се повторно.",
        },
    },

    bs: {
        common: { ok: "U redu", retry: "Pokušaj ponovo", continueText: "Nastavi", reconnect: "Ponovo poveži" },
        onboarding: {
            title: "Kontrole igre i puni ekran",
            message: "3 tačke se nalaze u gornjem desnom uglu. One otvaraju kontrole igre.",
            escHint: "Držite ESC da izađete iz punog ekrana.",
        },
        navbar: { fullscreen: "Puni ekran", endStream: "Završi prijenos", ending: "Završava se..." },
        connection: {
            startingGame: "Pokretanje igre…",
            connected: "Povezano! Kliknite za početak...",
            connectionLostTitle: "Veza izgubljena",
            clickReconnect: "Kliknite Ponovo poveži za nastavak.",
            connectionLostToast: "Veza izgubljena",
            waitingForConnection: "Čekanje veze...",
            connectingTitle: "Povezivanje...",
            creatingNewStream: "Kreiranje novog prijenosa...",
            reconnected: "Ponovo povezano",
            reconnecting: "Ponovno povezivanje…",
            unableToReconnect: "Nije moguće ponovo se povezati.",
            exitStream: "Izađi iz prijenosa",
            streamTitle: streamTitle("Prijenos"),
        },
        network: {
            poorConnection: "Slaba veza",
            gameplayMayStutter: "Igra se može zamrzavati.",
            veryPoorConnection: "Vrlo slaba veza",
            connectionMayDisconnect: "Veza se može prekinuti.",
            connectionRestored: "Veza obnovljena",
        },
        errors: {
            fullscreenUnsupported: "Vaš preglednik ne podržava puni ekran.",
            unsupportedBrowser: "Nepodržani preglednik",
            pointerLockUnsupported: "Vaš preglednik ne podržava zaključavanje pokazivača.",
            endStreamFailed: "Neuspješno završavanje prijenosa",
            pleaseTryAgain: "Pokušajte ponovo.",
        },
    },

    am: {
        common: { ok: "እሺ", retry: "እንደገና ሞክር", continueText: "ቀጥል", reconnect: "እንደገና ተገናኝ" },
        onboarding: {
            title: "የጨዋታ መቆጣጠሪያዎች እና ሙሉ ስክሪን",
            message: "3ቱ ነጥቦች በላይኛው ቀኝ ጥግ ላይ ናቸው። የጨዋታ መቆጣጠሪያዎችን ይከፍታሉ።",
            escHint: "ከሙሉ ስክሪን ለመውጣት ESC ን ተጭነው ይያዙ።",
        },
        navbar: { fullscreen: "ሙሉ ስክሪን", endStream: "ዥረቱን አቁም", ending: "በማቆም ላይ..." },
        connection: {
            startingGame: "ጨዋታ በመጀመር ላይ…",
            connected: "ተገናኝቷል! ለመጀመር ይጫኑ...",
            connectionLostTitle: "ግንኙነት ጠፍቷል",
            clickReconnect: "ለመቀጠል እንደገና ተገናኝ የሚለውን ይጫኑ።",
            connectionLostToast: "ግንኙነት ጠፍቷል",
            waitingForConnection: "ግንኙነትን በመጠባበቅ ላይ...",
            connectingTitle: "በመገናኘት ላይ...",
            creatingNewStream: "አዲስ ዥረት በመፍጠር ላይ...",
            reconnected: "እንደገና ተገናኝቷል",
            reconnecting: "እንደገና በመገናኘት ላይ…",
            unableToReconnect: "እንደገና መገናኘት አልተቻለም።",
            exitStream: "ከዥረቱ ውጣ",
            streamTitle: streamTitle("ዥረት"),
        },
        network: {
            poorConnection: "ደካማ ግንኙነት",
            gameplayMayStutter: "ጨዋታው ሊስተጓጎል ይችላል።",
            veryPoorConnection: "በጣም ደካማ ግንኙነት",
            connectionMayDisconnect: "ግንኙነት ሊቋረጥ ይችላል።",
            connectionRestored: "ግንኙነት ተመልሷል",
        },
        errors: {
            fullscreenUnsupported: "የእርስዎ አሳሽ ሙሉ ስክሪን አይደግፍም።",
            unsupportedBrowser: "ያልተደገፈ አሳሽ",
            pointerLockUnsupported: "የእርስዎ አሳሽ የጠቋሚ መቆለፊያ አይደግፍም።",
            endStreamFailed: "ዥረቱን ማቆም አልተሳካም",
            pleaseTryAgain: "እባክዎ እንደገና ይሞክሩ።",
        },
    },

    ha: {
        common: { ok: "To", retry: "Sake gwadawa", continueText: "Ci gaba", reconnect: "Sake haɗawa" },
        onboarding: {
            title: "Sarrafa Wasa da Cikakken Allo",
            message: "Digo 3 suna kusurwar dama ta sama. Suna buɗe sarrafa wasan.",
            escHint: "Riƙe ESC don fita daga cikakken allo.",
        },
        navbar: { fullscreen: "Cikakken Allo", endStream: "Kare Watsawa", ending: "Ana kare..." },
        connection: {
            startingGame: "Ana fara wasan…",
            connected: "An haɗa! Danna don farawa...",
            connectionLostTitle: "An Rasa Haɗi",
            clickReconnect: "Danna Sake haɗawa don ci gaba.",
            connectionLostToast: "An rasa haɗi",
            waitingForConnection: "Ana jiran haɗi...",
            connectingTitle: "Ana haɗawa...",
            creatingNewStream: "Ana ƙirƙirar sabon watsawa...",
            reconnected: "An sake haɗawa",
            reconnecting: "Ana sake haɗawa…",
            unableToReconnect: "Ba a iya sake haɗawa ba.",
            exitStream: "Fita daga watsawa",
            streamTitle: streamTitle("Watsawa"),
        },
        network: {
            poorConnection: "Rashin ƙarfin haɗi",
            gameplayMayStutter: "Wasan na iya tsayawa.",
            veryPoorConnection: "Rashin ƙarfin haɗi sosai",
            connectionMayDisconnect: "Haɗi na iya yankewa.",
            connectionRestored: "An dawo da haɗi",
        },
        errors: {
            fullscreenUnsupported: "Burauzarka baya goyon bayan cikakken allo.",
            unsupportedBrowser: "Burauza wanda ba a Goyi Bayansa",
            pointerLockUnsupported: "Burauzarka baya goyon bayan kulle mai nuni.",
            endStreamFailed: "Kare Watsawa ya Kasa",
            pleaseTryAgain: "Da fatan za a sake gwadawa.",
        },
    },

    yo: {
        common: { ok: "O DÁ", retry: "Gbìyànjú Lẹ́ẹ̀kansí", continueText: "Tẹ̀síwájú", reconnect: "Tún Sopọ̀" },
        onboarding: {
            title: "Ìdarí Eré àti Ojú Ìboju Kíkún",
            message: "Àwọn àmì 3 wà ní igun apá ọ̀tún òkè. Wọ́n ń ṣí ìdarí eré.",
            escHint: "Tẹ ESC mọ́lẹ̀ láti jáde kúrò nínú ojú ìboju kíkún.",
        },
        navbar: { fullscreen: "Ojú Ìboju Kíkún", endStream: "Parí Ìṣàn", ending: "Ń parí..." },
        connection: {
            startingGame: "Ń bẹ̀rẹ̀ eré…",
            connected: "Ti sopọ̀! Tẹ̀ láti bẹ̀rẹ̀...",
            connectionLostTitle: "Ìsopọ̀ Ti Sọnù",
            clickReconnect: "Tẹ Tún Sopọ̀ láti tẹ̀síwájú.",
            connectionLostToast: "Ìsopọ̀ ti sọnù",
            waitingForConnection: "Ń dúró de ìsopọ̀...",
            connectingTitle: "Ń sopọ̀...",
            creatingNewStream: "Ń dá ìṣàn tuntun...",
            reconnected: "Ti tún sopọ̀",
            reconnecting: "Ń tún sopọ̀…",
            unableToReconnect: "Kò lè tún sopọ̀.",
            exitStream: "Jáde kúrò nínú ìṣàn",
            streamTitle: streamTitle("Ìṣàn"),
        },
        network: {
            poorConnection: "Ìsopọ̀ Aláìlágbára",
            gameplayMayStutter: "Eré lè dúró síbí síbí.",
            veryPoorConnection: "Ìsopọ̀ Aláìlágbára Gidigidi",
            connectionMayDisconnect: "Ìsopọ̀ lè já.",
            connectionRestored: "Ìsopọ̀ Ti Padà",
        },
        errors: {
            fullscreenUnsupported: "Aṣàwákiri rẹ kò ṣe àtìlẹyìn ojú ìboju kíkún.",
            unsupportedBrowser: "Aṣàwákiri Tí A Kò Ṣe Àtìlẹ́yìn",
            pointerLockUnsupported: "Aṣàwákiri rẹ kò ṣe àtìlẹyìn títí ìtọ́ka.",
            endStreamFailed: "Kíkì Ìṣàn Kùnà",
            pleaseTryAgain: "Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansí.",
        },
    },

    zu: {
        common: { ok: "Kulungile", retry: "Zama futhi", continueText: "Qhubeka", reconnect: "Xhuma futhi" },
        onboarding: {
            title: "Ukulawula Umdlalo & Isikrini Esigcwele",
            message: "Amachaphaza angu-3 asekhoneni elingaphezulu kwesokudla. Avula ukulawula komdlalo.",
            escHint: "Bamba i-ESC ukuze uphume esikrinini esigcwele.",
        },
        navbar: { fullscreen: "Isikrini Esigcwele", endStream: "Qeda Ukusakaza", ending: "Iyaqedwa..." },
        connection: {
            startingGame: "Iqalisa umdlalo…",
            connected: "Ixhunyiwe! Chofoza ukuze uqale...",
            connectionLostTitle: "Ukuxhumana Kulahlekile",
            clickReconnect: "Chofoza Xhuma Futhi ukuze uqhubeke.",
            connectionLostToast: "Ukuxhumana kulahlekile",
            waitingForConnection: "Ilinde ukuxhumana...",
            connectingTitle: "Iyaxhuma...",
            creatingNewStream: "Idala ukusakaza okusha...",
            reconnected: "Ixhunywe futhi",
            reconnecting: "Ixhuma futhi…",
            unableToReconnect: "Ayikwazanga ukuxhuma futhi.",
            exitStream: "Phuma ekusakazeni",
            streamTitle: streamTitle("Ukusakaza"),
        },
        network: {
            poorConnection: "Ukuxhumana Okubuthakathaka",
            gameplayMayStutter: "Umdlalo ungase ume ngesikhathi.",
            veryPoorConnection: "Ukuxhumana Okubuthakathaka Kakhulu",
            connectionMayDisconnect: "Ukuxhumana kungase kunqamuke.",
            connectionRestored: "Ukuxhumana Kubuyisiwe",
        },
        errors: {
            fullscreenUnsupported: "Isiphequluli sakho asisekeli isikrini esigcwele.",
            unsupportedBrowser: "Isiphequluli Esingasekelwe",
            pointerLockUnsupported: "Isiphequluli sakho asisekeli ukukhiya isikhombi.",
            endStreamFailed: "Ukuqeda Ukusakaza Kwehlulekile",
            pleaseTryAgain: "Sicela uzame futhi.",
        },
    },
};

// ---------------------------------------------------------------------------
// 3. Browser language detection
// ---------------------------------------------------------------------------

/**
 * Returns the browser's ordered list of preferred languages (e.g.
 * ["cs-CZ", "cs", "en-US", "en"]), defensively handling browsers where
 * navigator.languages is missing/empty by falling back to navigator.language,
 * and finally to an empty array if neither is available.
 */
function getBrowserLanguages(): string[] {
    try {
        const nav = typeof navigator !== "undefined" ? navigator : undefined;
        if (!nav) return [];

        if (Array.isArray(nav.languages) && nav.languages.length > 0) {
            return nav.languages.filter((tag): tag is string => typeof tag === "string" && tag.length > 0);
        }

        if (typeof nav.language === "string" && nav.language.length > 0) {
            return [nav.language];
        }
    } catch {
        // navigator can theoretically throw in some restrictive/embedded
        // environments -- treat that the same as "no preference available".
    }

    return [];
}

/**
 * Normalizes a BCP-47-ish language tag ("en-US", "zh-Hans-CN", "EN_us", ...)
 * down to a lowercase base subtag ("en", "zh"), tolerating malformed input.
 */
function toBaseLanguage(tag: string): string {
    const cleaned = tag.trim().replace(/_/g, "-");
    const [base] = cleaned.split("-");
    return base.toLowerCase();
}

function isSupportedLanguage(tag: string): tag is SupportedLanguage {
    return (SUPPORTED_LANGUAGES as readonly string[]).includes(tag);
}

/**
 * Resolves the single best supported language for this browser session.
 *
 * Fallback order (per preferred language, in order):
 *   1. Exact tag as reported by the browser (rare to match directly, but
 *      handles cases like a supported tag with an unusual casing/script).
 *   2. That tag's base language (e.g. "fr-CA" -> "fr").
 * Then moves on to the next preferred language and repeats, finally
 * falling back to English if nothing in the list is supported.
 */
export function detectLanguage(): SupportedLanguage {
    const browserLanguages = getBrowserLanguages();

    for (const rawTag of browserLanguages) {
        if (typeof rawTag !== "string" || rawTag.length === 0) continue;

        const cleaned = rawTag.trim().replace(/_/g, "-");

        // Special-case Chinese script variants before falling back to the
        // generic base-language logic, since "zh" alone is ambiguous.
        const lower = cleaned.toLowerCase();
        if (lower.startsWith("zh")) {
            if (lower.includes("hant") || lower.endsWith("-tw") || lower.endsWith("-hk") || lower.endsWith("-mo")) {
                return "zh-Hant";
            }
            return "zh";
        }

        if (isSupportedLanguage(cleaned)) {
            return cleaned;
        }

        const base = toBaseLanguage(cleaned);
        if (isSupportedLanguage(base)) {
            return base;
        }
    }

    return DEFAULT_LANGUAGE;
}

// ---------------------------------------------------------------------------
// 4. Public entry point
// ---------------------------------------------------------------------------

let cachedTranslations: StreamTranslations | null = null;
let cachedLanguage: SupportedLanguage | null = null;

/**
 * Returns the translation object to use for this session. Language is
 * detected once (from the browser only) and cached for the lifetime of the
 * page -- callers should grab this once at startup and reuse the returned
 * object rather than calling this repeatedly.
 */
export function getTranslations(): StreamTranslations {
    if (cachedTranslations) {
        return cachedTranslations;
    }

    cachedLanguage = detectLanguage();
    cachedTranslations = TRANSLATIONS[cachedLanguage];
    return cachedTranslations;
}

/** Returns the language that was resolved by getTranslations(), if it has been called yet. */
export function getCurrentLanguage(): SupportedLanguage | null {
    return cachedLanguage;
}