// بيانات الأنماط الفنية مع أوصافها وأهدافها
const patternsData = {
    "double-bottom": {
        name: "نموذج القاع الثنائي",
        description: "نموذج انعكاسي صاعد يتكون من قاعين متساويين تقريبًا مع قمة متوسطة. يعتبر النموذج مكتملاً عند اختراق خط المقاومة المكون من قمة النموذج.",
        targets: {
            target1: "مسافة مساوية لارتفاع النموذج من نقطة الاختراق",
            finalTarget: "1.618 من ارتفاع النموذج"
        }
    },
    "triple-top": {
        name: "نموذج القمة الثلاثية",
        description: "نموذج انعكاسي هبوطي يتكون من ثلاث قمم متساوية تقريبًا مع قيعان متوسطة. يعتبر النموذج مكتملاً عند اختراق خط الدعم المكون من قيعان النموذج.",
        targets: {
            target1: "مسافة مساوية لعمق النموذج من نقطة الاختراق",
            finalTarget: "1.618 من عمق النموذج"
        }
    },
    "triple-bottom": {
        name: "نموذج القاع الثلاثي",
        description: "نموذج انعكاسي صاعد يتكون من ثلاث قيعان متساوية تقريبًا مع قمم متوسطة. يعتبر النموذج مكتملاً عند اختراق خط المقاومة المكون من قمم النموذج.",
        targets: {
            target1: "مسافة مساوية لارتفاع النموذج من نقطة الاختراق",
            finalTarget: "1.618 من ارتفاع النموذج"
        }
    },
    "head-shoulders": {
        name: "نموذج الرأس والكتفين",
        description: "نموذج انعكاسي هبوطي يتكون من قمة (الكتف الأيسر) تليها قمة أعلى (الرأس) ثم قمة أخرى أقل (الكتف الأيمن). يعتبر النموذج مكتملاً عند اختراق خط العنق.",
        targets: {
            target1: "مسافة مساوية لارتفاع الرأس من خط العنق",
            finalTarget: "1.618 من ارتفاع الرأس"
        }
    },
    "inverted-head-shoulders": {
        name: "نموذج الرأس والكتفين المقلوب",
        description: "نموذج انعكاسي صاعد يتكون من قاع (الكتف الأيسر) تليه قاع أدنى (الرأس) ثم قاع آخر أعلى (الكتف الأيمن). يعتبر النموذج مكتملاً عند اختراق خط العنق.",
        targets: {
            target1: "مسافة مساوية لعمق الرأس من خط العنق",
            finalTarget: "1.618 من عمق الرأس"
        }
    },
    "symmetrical-triangle": {
        name: "نموذج المثلث المتماثل",
        description: "نموذج استمراري يتكون من قمم هابطة وقيعان صاعدة تتقارب في نقطة واحدة. يشير إلى فترة تذبذب قبل استمرار الاتجاه السابق.",
        targets: {
            target1: "مسافة مساوية لأعرض جزء من المثلث",
            finalTarget: "1.618 من عرض المثلث"
        }
    },
    "ascending-triangle": {
        name: "المثلث الصاعد",
        description: "نموذج استمراري صاعد يتكون من قمم أفقية وقيعان صاعدة. يشير عادة إلى استمرار الاتجاه الصاعد بعد الاختراق.",
        targets: {
            target1: "مسافة مساوية لارتفاع المثلث",
            finalTarget: "1.618 من ارتفاع المثلث"
        }
    },
    "descending-triangle": {
        name: "المثلث الهابط",
        description: "نموذج استمراري هابط يتكون من قيعان أفقية وقمم هابطة. يشير عادة إلى استمرار الاتجاه الهابط بعد الاختراق.",
        targets: {
            target1: "مسافة مساوية لارتفاع المثلث",
            finalTarget: "1.618 من ارتفاع المثلث"
        }
    },
    "boarding-pattern": {
        name: "النموذج المتباعد",
        description: "نموذج غير شائع يتسم بتوسع في التذبذبات مع تقدم الوقت، يشير عادة إلى زيادة في التقلبات وعدم الاستقرار في السوق.",
        targets: {
            target1: "غير محدد بسبب طبيعة النموذج",
            finalTarget: "غير محدد"
        }
    },
    "rectangle": {
        name: "نموذج المستطيل",
        description: "نموذج استمراري يتكون من قمم وقيعان أفقية متوازية، يشير إلى فترة من التداول في نطاق محدد قبل استمرار الاتجاه السابق.",
        targets: {
            target1: "مسافة مساوية لارتفاع المستطيل",
            finalTarget: "1.618 من ارتفاع المستطيل"
        }
    },
    "flags-pennants": {
        name: "الأعلام والأعلام المثلثة",
        description: "نماذج استمرارية صغيرة تظهر بعد حركات سعرية قوية، تشير عادة إلى استراحة قبل استمرار الاتجاه الأصلي.",
        targets: {
            target1: "مسافة مساوية لطول سارية العلم (الحركة السابقة)",
            finalTarget: "1.618 من طول السارية"
        }
    },
    "rising-wedge": {
        name: "الوتد الصاعد",
        description: "نموذج انعكاسي هبوطي (في اتجاه صاعد) أو استمراري هابط (في اتجاه هابط) يتكون من قمم وقيعان صاعدة تتقارب.",
        targets: {
            target1: "مسافة مساوية لأعرض الوتد",
            finalTarget: "1.618 من عرض الوتد"
        }
    },
    "falling-wedge": {
        name: "الوتد الهابط",
        description: "نموذج انعكاسي صاعد (في اتجاه هابط) أو استمراري صاعد (في اتجاه صاعد) يتكون من قمم وقيعان هابطة تتقارب.",
        targets: {
            target1: "مسافة مساوية لأعرض الوتد",
            finalTarget: "1.618 من عرض الوتد"
        }
    },
    "rounding-tops": {
        name: "نموذج القمم المستديرة",
        description: "نموذج انعكاسي هبوطي يتكون من حركة سعرية مستديرة إلى الأعلى تليها انعكاس تدريجي للأسفل، يشير إلى فقدان الزخم الصاعد.",
        targets: {
            target1: "مسافة مساوية لعمق النموذج",
            finalTarget: "1.618 من العمق"
        }
    },
    "rounding-bottoms": {
        name: "نموذج القيعان المستديرة",
        description: "نموذج انعكاسي صاعد يتكون من حركة سعرية مستديرة إلى الأسفل تليها انعكاس تدريجي للأعلى، يشير إلى بناء زخم صاعد.",
        targets: {
            target1: "مسافة مساوية لارتفاع النموذج",
            finalTarget: "1.618 من الارتفاع"
        }
    },
    "v-top": {
        name: "نموذج القمة V",
        description: "نموذج انعكاسي هبوطي حاد يتكون من حركة صعودية قوية تليها انعكاس مفاجئ وهبوط حاد دون تشكيل قمة واضحة.",
        targets: {
            target1: "مسافة مساوية لارتفاع الحركة الصاعدة",
            finalTarget: "1.618 من الارتفاع"
        }
    },
    "v-bottom": {
        name: "نموذج القاع V",
        description: "نموذج انعكاسي صاعد حاد يتكون من حركة هبوطية قوية تليها انعكاس مفاجئ وصعود حاد دون تشكيل قاع واضح.",
        targets: {
            target1: "مسافة مساوية لعمق الحركة الهبوطية",
            finalTarget: "1.618 من العمق"
        }
    }
};

// متغيرات عامة
let currentTimeframe = '1d';
let currentPatternFilter = 'all';
let cryptoData = [];

// عناصر DOM
const cryptoGrid = document.getElementById('crypto-grid');
const timeframeSelect = document.getElementById('timeframe');
const patternFilter = document.getElementById('pattern-filter');
const refreshBtn = document.getElementById('refresh-btn');
const modal = document.getElementById('pattern-modal');
const closeBtn = document.querySelector('.close-btn');
const totalCoinsElement = document.getElementById('total-coins');
const patternsDetectedElement = document.getElementById('patterns-detected');
const confirmedBreakoutsElement = document.getElementById('confirmed-breakouts');

// استدعاء API بينانس
async function fetchBinanceData() {
    try {
        // في الواقع، سنحتاج إلى استخدام API بينانس الرسمي أو طرف ثالث مثل CoinGecko
        // هذا مثال افتراضي فقط لأغراض العرض
        
        // محاكاة بيانات من بينانس (في التطبيق الحقيقي، استبدل هذا بـ API حقيقي)
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();
        
        // تصفية العملات المستقرة والعملات غير المقترنة بـ USDT
        const filteredData = data.filter(item => 
            item.symbol.endsWith('USDT') && 
            !item.symbol.includes('BUSD') && 
            !item.symbol.includes('USDC') &&
            !item.symbol.includes('TUSD') &&
            !item.symbol.includes('DAI')
        );
        
        cryptoData = filteredData.map(item => {
            // إضافة أنماط فنية عشوائية للتوضيح (في التطبيق الحقيقي، يجب تحليل الرسوم البيانية)
            const patterns = Object.keys(patternsData);
            const hasPattern = Math.random() > 0.7; // 30% فرصة لوجود نمط
            const pattern = hasPattern ? patterns[Math.floor(Math.random() * patterns.length)] : null;
            const isBreakoutConfirmed = pattern ? Math.random() > 0.5 : false;
            
            return {
                symbol: item.symbol,
                name: item.symbol.replace('USDT', ''),
                price: parseFloat(item.lastPrice),
                priceChange: parseFloat(item.priceChangePercent),
                highPrice: parseFloat(item.highPrice),
                lowPrice: parseFloat(item.lowPrice),
                volume: parseFloat(item.quoteVolume),
                liquidity: parseFloat(item.quoteVolume) * parseFloat(item.lastPrice),
                pattern: pattern,
                breakoutConfirmed: isBreakoutConfirmed,
                breakoutPrice: pattern ? parseFloat(item.lastPrice) * (1 + (Math.random() * 0.1 - 0.05)) : null,
                target1: pattern ? parseFloat(item.lastPrice) * (1 + (Math.random() * 0.2)) : null,
                target2: pattern ? parseFloat(item.lastPrice) * (1 + (Math.random() * 0.3)) : null
            };
        });
        
        updateUI();
    } catch (error) {
        console.error('Error fetching data:', error);
        // في حالة الخطأ، عرض رسالة للمستخدم
        cryptoGrid.innerHTML = `<div class="error-message">حدث خطأ في جلب البيانات. يرجى المحاولة لاحقًا.</div>`;
    }
}

// تحديث واجهة المستخدم
function updateUI() {
    cryptoGrid.innerHTML = '';
    
    // تصفية البيانات حسب الإطار الزمني والنمط المحدد
    let filteredData = [...cryptoData];
    
    if (currentPatternFilter !== 'all') {
        filteredData = filteredData.filter(item => item.pattern === currentPatternFilter);
    }
    
    // تحديث إحصائيات الشبكة
    totalCoinsElement.textContent = filteredData.length;
    const patternsCount = filteredData.filter(item => item.pattern).length;
    patternsDetectedElement.textContent = patternsCount;
    const breakoutsCount = filteredData.filter(item => item.breakoutConfirmed).length;
    confirmedBreakoutsElement.textContent = breakoutsCount;
    
    // عرض العملات
    filteredData.forEach(crypto => {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.dataset.symbol = crypto.symbol;
        
        // اسم العملة وشعارها
        const firstLetter = crypto.name.charAt(0).toUpperCase();
        
        // اتجاه السعر
        const priceChangeClass = crypto.priceChange >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = crypto.priceChange >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        // شريط السيولة (نسبة مئوية من أعلى سيولة)
        const maxLiquidity = Math.max(...cryptoData.map(item => item.liquidity));
        const liquidityPercentage = (crypto.liquidity / maxLiquidity) * 100;
        
        // إنشاء بطاقة العملة
        card.innerHTML = `
            <div class="coin-header">
                <div class="coin-logo">${firstLetter}</div>
                <div>
                    <div class="coin-name">${crypto.name}</div>
                    <div class="coin-symbol">${crypto.symbol}</div>
                </div>
            </div>
            
            <div class="price-info">
                <span class="current-price">$${crypto.price.toFixed(4)}</span>
                <span class="price-change ${priceChangeClass}">
                    <i class="fas ${priceChangeIcon}"></i> ${Math.abs(crypto.priceChange).toFixed(2)}%
                </span>
            </div>
            
            <div class="liquidity-bar-container">
                <div class="liquidity-label">
                    <span>حجم السيولة</span>
                    <span>$${(crypto.liquidity / 1000000).toFixed(2)}M</span>
                </div>
                <div class="liquidity-bar">
                    <div class="liquidity-progress" style="width: ${liquidityPercentage}%"></div>
                </div>
            </div>
            
            <div class="volume-info">
                <span>حجم التداول (24h):</span>
                <span>$${(crypto.volume / 1000000).toFixed(2)}M</span>
            </div>
            
            <div class="pattern-info">
                ${crypto.pattern ? `
                    <div class="pattern-name">
                        <i class="fas fa-chart-pie"></i> ${patternsData[crypto.pattern].name}
                    </div>
                    <div class="pattern-level beginner">مبتدئ</div>
                    <div class="pattern-status ${crypto.breakoutConfirmed ? 'status-confirmed' : 'status-pending'}">
                        <i class="fas ${crypto.breakoutConfirmed ? 'fa-check-circle' : 'fa-clock'}"></i>
                        ${crypto.breakoutConfirmed ? 'تم الاختراق' : 'بانتظار تحقق الاختراق'}
                    </div>
                ` : `
                    <div class="no-pattern">لا يتوفر نموذج فني حالياً</div>
                `}
            </div>
        `;
        
        // إضافة حدث النقر لفتح المودال
        if (crypto.pattern) {
            card.addEventListener('click', () => openModal(crypto));
        }
        
        cryptoGrid.appendChild(card);
    });
}

// فتح نافذة التفاصيل
function openModal(crypto) {
    const modalCoinLogo = document.getElementById('modal-coin-logo');
    const modalCoinName = document.getElementById('modal-coin-name');
    const modalCoinSymbol = document.getElementById('modal-coin-symbol');
    const modalCurrentPrice = document.getElementById('modal-current-price');
    const modalPriceChange = document.getElementById('modal-price-change');
    const modalPatternName = document.getElementById('modal-pattern-name');
    const modalPatternStatus = document.getElementById('modal-pattern-status');
    const modalBreakoutPrice = document.getElementById('modal-breakout-price');
    const modalTarget1 = document.getElementById('modal-target-1');
    const modalTarget2 = document.getElementById('modal-target-2');
    const modalLiquidity = document.getElementById('modal-liquidity');
    const modalVolume = document.getElementById('modal-volume');
    const modalTimeframe = document.getElementById('modal-timeframe');
    const modalPatternDescription = document.getElementById('modal-pattern-description');
    
    // تعبئة البيانات
    const firstLetter = crypto.name.charAt(0).toUpperCase();
    const priceChangeClass = crypto.priceChange >= 0 ? 'positive' : 'negative';
    
    modalCoinLogo.textContent = firstLetter;
    modalCoinName.textContent = crypto.name;
    modalCoinSymbol.textContent = crypto.symbol;
    modalCurrentPrice.textContent = `$${crypto.price.toFixed(4)}`;
    modalPriceChange.textContent = `${crypto.priceChange >= 0 ? '+' : ''}${crypto.priceChange.toFixed(2)}%`;
    modalPriceChange.className = `price-change ${priceChangeClass}`;
    
    if (crypto.pattern) {
        const patternInfo = patternsData[crypto.pattern];
        
        modalPatternName.textContent = patternInfo.name;
        modalPatternStatus.textContent = crypto.breakoutConfirmed ? 'تم الاختراق' : 'بانتظار تحقق الاختراق';
        modalBreakoutPrice.textContent = `$${crypto.breakoutPrice.toFixed(4)}`;
        modalTarget1.textContent = `$${crypto.target1.toFixed(4)}`;
        modalTarget2.textContent = `$${crypto.target2.toFixed(4)}`;
        modalPatternDescription.textContent = patternInfo.description;
    }
    
    modalLiquidity.textContent = `$${(crypto.liquidity / 1000000).toFixed(2)}M`;
    modalVolume.textContent = `$${(crypto.volume / 1000000).toFixed(2)}M`;
    
    // تعيين الإطار الزمني
    const timeframeMap = {
        '1h': '1 ساعة',
        '3h': '3 ساعات',
        '4h': '4 ساعات',
        '1d': 'يومي'
    };
    modalTimeframe.textContent = timeframeMap[currentTimeframe];
    
    // فتح المودال
    modal.style.display = 'block';
    
    // إعداد زر التداول
    const tradeBtn = document.getElementById('trade-btn');
    tradeBtn.onclick = () => {
        window.open(`https://www.binance.com/en/trade/${crypto.symbol.replace('USDT', '_USDT')}`, '_blank');
    };
    
    // إعداد زر الرسم البياني
    const chartBtn = document.getElementById('view-chart-btn');
    chartBtn.onclick = () => {
        window.open(`https://www.binance.com/en/trade/${crypto.symbol.replace('USDT', '_USDT')}?type=spot&interval=${currentTimeframe}`, '_blank');
    };
}

// إغلاق المودال
closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// إغلاق المودال عند النقر خارج المحتوى
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// تغيير الإطار الزمني
timeframeSelect.addEventListener('change', (e) => {
    currentTimeframe = e.target.value;
    fetchBinanceData();
});

// تصفية حسب النمط
patternFilter.addEventListener('change', (e) => {
    currentPatternFilter = e.target.value;
    updateUI();
});

// تحديث البيانات
refreshBtn.addEventListener('click', fetchBinanceData);

// التهيئة الأولية
document.addEventListener('DOMContentLoaded', () => {
    fetchBinanceData();
    
    // تحديث البيانات كل دقيقة
    setInterval(fetchBinanceData, 60000);
});
const Binance = require('binance-api-node').default;
const { HeadAndShoulders, DoubleTop, DoubleBottom, Triangle } = require('technicalindicators');
const { SMA, EMA } = require('ta.js');

// تهيئة عميل Binance
const client = Binance();

// خريطة الأنماط الفنية المدعومة
const SUPPORTED_PATTERNS = {
    'HEAD_AND_SHOULDERS': {
        name: 'الرأس والكتفين',
        detector: (values) => HeadAndShoulders.calculate({ values, inverted: false })
    },
    'INVERTED_HEAD_AND_SHOULDERS': {
        name: 'الرأس والكتفين المقلوب',
        detector: (values) => HeadAndShoulders.calculate({ values, inverted: true })
    },
    'DOUBLE_TOP': {
        name: 'القمة الثنائية',
        detector: (values) => DoubleTop.calculate({ values })
    },
    'DOUBLE_BOTTOM': {
        name: 'القاع الثنائي',
        detector: (values) => DoubleBottom.calculate({ values })
    },
    'TRIANGLE': {
        name: 'المثلث المتماثل',
        detector: (values) => Triangle.calculate({ values })
    }
};

// دالة محسنة لاكتشاف الأنماط
async function detectTechnicalPatterns(symbol, timeframe = '1d') {
    try {
        // جلب البيانات التاريخية من Binance
        const candles = await client.candles({
            symbol: symbol,
            interval: timeframe,
            limit: 100
        });

        // تحويل البيانات للتنسيق المطلوب
        const closes = candles.map(c => parseFloat(c.close));
        const highs = candles.map(c => parseFloat(c.high));
        const lows = candles.map(c => parseFloat(c.low));

        // اكتشاف الأنماط
        const detectedPatterns = [];
        
        for (const [patternKey, patternConfig] of Object.entries(SUPPORTED_PATTERNS)) {
            const result = patternConfig.detector(closes);
            
            if (result && result.length > 0 && result[result.length - 1]) {
                detectedPatterns.push({
                    name: patternConfig.name,
                    type: patternKey,
                    reliability: calculateReliability(result, highs, lows),
                    breakoutPrice: calculateBreakoutPrice(patternKey, candles),
                    targets: calculateTargets(patternKey, closes)
                });
            }
        }

        return detectedPatterns.length > 0 ? detectedPatterns : null;
    } catch (error) {
        console.error(`Error detecting patterns for ${symbol}:`, error);
        return null;
    }
}

// دالة مساعدة لحساب موثوقية النمط
function calculateReliability(patternResult, highs, lows) {
    // معايير التقييم:
    const volumeConfirmation = patternResult.volume ? 0.3 : 0;
    const trendConfirmation = patternResult.trend ? 0.2 : 0;
    const timeConfirmation = patternResult.duration ? 0.2 : 0;
    const priceConfirmation = 0.3;
    
    return (volumeConfirmation + trendConfirmation + timeConfirmation + priceConfirmation) * 100;
}

// دالة مساعدة لحساب سعر الاختراق
function calculateBreakoutPrice(patternType, candles) {
    const lastCandle = candles[candles.length - 1];
    switch(patternType) {
        case 'HEAD_AND_SHOULDERS':
            return Math.max(...candles.slice(-10).map(c => c.high));
        case 'DOUBLE_TOP':
            return Math.min(...candles.slice(-5).map(c => c.low));
        default:
            return lastCandle.close;
    }
}

// دالة مساعدة لحساب الأهداف
function calculateTargets(patternType, closes) {
    const recentPrices = closes.slice(-20);
    const avgVolatility = calculateAverageVolatility(recentPrices);
    
    switch(patternType) {
        case 'HEAD_AND_SHOULDERS':
            const head = Math.max(...recentPrices);
            const neckline = Math.min(...recentPrices);
            const height = head - neckline;
            return {
                target1: neckline - height,
                target2: neckline - (height * 1.618)
            };
        case 'DOUBLE_BOTTOM':
            const bottom = Math.min(...recentPrices);
            const resistance = Math.max(...recentPrices);
            const move = resistance - bottom;
            return {
                target1: resistance + move,
                target2: resistance + (move * 1.618)
            };
        default:
            return {
                target1: recentPrices[recentPrices.length - 1] + avgVolatility,
                target2: recentPrices[recentPrices.length - 1] + (avgVolatility * 2)
            };
    }
}

// دالة محسنة لجلب البيانات من Binance
async function fetchRealTimeData() {
    try {
        // جلب جميع أزواج USDT
        const exchangeInfo = await client.exchangeInfo();
        const usdtPairs = exchangeInfo.symbols.filter(s => 
            s.quoteAsset === 'USDT' && 
            !s.symbol.includes('BUSD') &&
            !s.status === 'TRADING'
        );

        // جلب بيانات السعر لكل زوج
        const tickers = await client.prices();
        
        // معالجة البيانات
        const cryptoData = await Promise.all(usdtPairs.map(async pair => {
            const patternData = await detectTechnicalPatterns(pair.symbol, currentTimeframe);
            
            return {
                symbol: pair.symbol,
                name: pair.baseAsset,
                price: parseFloat(tickers[pair.symbol]),
                pattern: patternData ? patternData[0] : null,
                // ...باقي البيانات
            };
        }));

        return cryptoData.filter(item => item.price > 0);
    } catch (error) {
        console.error('Error fetching real-time data:', error);
        return [];
    }
}

// التكامل مع واجهة المستخدم
async function updateRealTimeUI() {
    const realData = await fetchRealTimeData();
    // ...بقية كود الواجهة كما هو
}

// التهيئة
document.addEventListener('DOMContentLoaded', () => {
    updateRealTimeUI();
    setInterval(updateRealTimeUI, 300000); // تحديث كل 5 دقائق
});
