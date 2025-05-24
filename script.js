// متغيرات عامة
let allCoins = [];
let filteredCoins = [];
let currentPage = 1;
const coinsPerPage = 20;

// عناصر DOM
const elements = {
    coinsContainer: null,
    loadingState: null,
    errorState: null,
    totalCoins: null,
    highProbability: null,
    bullishTrend: null,
    avgProbability: null,
    minProbabilitySlider: null,
    probabilityValue: null,
    sortBy: null,
    trendFilter: null,
    refreshBtn: null,
    pagination: null,
    prevPage: null,
    nextPage: null,
    pageInfo: null,
    modal: null,
    closeModal: null
};

// تهيئة عناصر DOM
function initializeElements() {
    elements.coinsContainer = document.getElementById('coins-container');
    elements.loadingState = document.getElementById('loading-state');
    elements.errorState = document.getElementById('error-state');
    elements.totalCoins = document.getElementById('total-coins');
    elements.highProbability = document.getElementById('high-probability');
    elements.bullishTrend = document.getElementById('bullish-trend');
    elements.avgProbability = document.getElementById('avg-probability');
    elements.minProbabilitySlider = document.getElementById('min-probability');
    elements.probabilityValue = document.getElementById('probability-value');
    elements.sortBy = document.getElementById('sort-by');
    elements.trendFilter = document.getElementById('trend-filter');
    elements.refreshBtn = document.getElementById('refresh-btn');
    elements.pagination = document.getElementById('pagination');
    elements.prevPage = document.getElementById('prev-page');
    elements.nextPage = document.getElementById('next-page');
    elements.pageInfo = document.getElementById('page-info');
    elements.modal = document.getElementById('coin-modal');
    elements.closeModal = document.querySelector('.close-modal');
}

// دالة جلب معلومات العملات
async function fetchCoinInfo() {
    try {
        const response = await fetch('https://api.binance.com/api/v3/exchangeInfo');
        const data = await response.json();
        
        const symbolMap = {};
        data.symbols.forEach(symbolInfo => {
            if (symbolInfo.symbol.endsWith('USDT') && symbolInfo.status === 'TRADING') {
                symbolMap[symbolInfo.symbol] = {
                    baseAsset: symbolInfo.baseAsset,
                    quoteAsset: symbolInfo.quoteAsset
                };
            }
        });
        
        return symbolMap;
    } catch (error) {
        console.error('خطأ في جلب معلومات العملات:', error);
        return {};
    }
}

// دالة جلب البيانات
async function fetchCoinsData() {
    try {
        console.log('جاري جلب معلومات العملات...');
        const symbolMap = await fetchCoinInfo();
        
        console.log('جاري جلب بيانات الأسعار...');
        const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
        const data = await response.json();

        // تصفية العملات USDT وترتيبها حسب الحجم
        const usdtPairs = data
            .filter(coin => {
                const symbol = coin.symbol;
                return symbol.endsWith('USDT') && 
                       !symbol.includes('UP') && 
                       !symbol.includes('DOWN') &&
                       !symbol.includes('BULL') &&
                       !symbol.includes('BEAR') &&
                       symbolMap[symbol];
            })
            .sort((a, b) => parseFloat(b.quoteVolume) - parseFloat(a.quoteVolume))
            .slice(0, 100); // أخذ أفضل 100 عملة

        console.log(`معالجة ${usdtPairs.length} عملة...`);

        // معالجة البيانات
        allCoins = [];
        for (let i = 0; i < usdtPairs.length; i++) {
            const coin = usdtPairs[i];
            const symbol = coin.symbol;
            
            try {
                // جلب البيانات التاريخية
                const historicalResponse = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=4h&limit=60`
                );
                const historicalData = await historicalResponse.json();

                if (historicalData && Array.isArray(historicalData) && historicalData.length > 0) {
                    const prices = historicalData.map(candle => parseFloat(candle[4]));
                    const volumes = historicalData.map(candle => parseFloat(candle[5]));

                    const coinData = {
                        symbol,
                        name: symbolMap[symbol].baseAsset,
                        price: parseFloat(coin.lastPrice),
                        priceChange: parseFloat(coin.priceChangePercent),
                        volume: parseFloat(coin.quoteVolume),
                        prices,
                        volumes
                    };

                    allCoins.push(coinData);
                }
            } catch (error) {
                console.warn(`خطأ في معالجة ${symbol}:`, error);
            }

            // تحديث شريط التقدم
            if (i % 10 === 0) {
                console.log(`تمت معالجة ${i + 1}/${usdtPairs.length} عملة`);
            }
        }

        console.log(`تم جلب بيانات ${allCoins.length} عملة بنجاح`);
    } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        throw error;
    }
}

// حساب RSI
function calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) return 50;

    let gains = 0;
    let losses = 0;

    for (let i = 1; i <= period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
    }

    const avgGain = gains / period;
    const avgLoss = losses / period;

    if (avgLoss === 0) return 100;

    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
}

// حساب MACD
function calculateMACD(prices) {
    if (prices.length < 26) return { macd: 0, signal: 0, histogram: 0 };

    const ema12 = calculateEMA(prices, 12);
    const ema26 = calculateEMA(prices, 26);
    const macd = ema12 - ema26;

    return {
        macd,
        signal: 0,
        histogram: macd
    };
}

// حساب EMA
function calculateEMA(prices, period) {
    if (prices.length === 0) return 0;
    
    const multiplier = 2 / (period + 1);
    let ema = prices[0];

    for (let i = 1; i < prices.length; i++) {
        ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
    }

    return ema;
}

// حساب Bollinger Bands
function calculateBollingerBands(prices, period = 20) {
    if (prices.length < period) return { upper: 0, middle: 0, lower: 0, position: 'middle' };

    const recentPrices = prices.slice(-period);
    const sma = recentPrices.reduce((sum, price) => sum + price, 0) / period;
    
    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
    const stdDev = Math.sqrt(variance);
    
    const upper = sma + (2 * stdDev);
    const lower = sma - (2 * stdDev);
    const currentPrice = prices[prices.length - 1];
    
    let position = 'middle';
    if (currentPrice > upper) position = 'above';
    else if (currentPrice < lower) position = 'below';
    
    return { upper, middle: sma, lower, position };
}

// تحليل الحجم
function analyzeVolume(volumes) {
    if (volumes.length < 10) return { signal: 'Normal', strength: 50 };

    const recentVolume = volumes.slice(-5).reduce((sum, vol) => sum + vol, 0) / 5;
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    
    const ratio = recentVolume / avgVolume;
    
    let signal = 'Normal';
    let strength = 50;
    
    if (ratio > 2) {
        signal = 'Very High';
        strength = 90;
    } else if (ratio > 1.5) {
        signal = 'High';
        strength = 75;
    } else if (ratio < 0.5) {
        signal = 'Low';
        strength = 25;
    }
    
    return { signal, strength };
}

// اكتشاف الأنماط
function detectPatterns(prices) {
    const patterns = [];
    
    if (prices.length < 10) return patterns;
    
    const recent = prices.slice(-10);
    const trend = recent[recent.length - 1] - recent[0];
    
    // نمط الارتفاع المستمر
    let consecutiveUps = 0;
    for (let i = 1; i < recent.length; i++) {
        if (recent[i] > recent[i - 1]) {
            consecutiveUps++;
        } else {
            break;
        }
    }
    
    if (consecutiveUps >= 3) {
        patterns.push('ارتفاع مستمر');
    }
    
    // نمط الانعكاس
    const lastThree = recent.slice(-3);
    if (lastThree[0] > lastThree[1] && lastThree[1] < lastThree[2]) {
        patterns.push('انعكاس صعودي');
    }
    
    return patterns;
}

// تحليل العملات
async function analyzeCoins() {
    console.log('جاري تحليل العملات...');
    
    allCoins.forEach(coin => {
        // التحليل الفني
        const rsi = calculateRSI(coin.prices);
        const macd = calculateMACD(coin.prices);
        const bollingerBands = calculateBollingerBands(coin.prices);
        const volumeAnalysis = analyzeVolume(coin.volumes);
        const patterns = detectPatterns(coin.prices);
        
        // تحديد الاتجاه
        const recentPrices = coin.prices.slice(-10);
        const trend = recentPrices[recentPrices.length - 1] - recentPrices[0];
        const trendDirection = trend > 0 ? 'Bullish' : 'Bearish';
        
        // حساب احتمالية الارتفاع
        let pumpProbability = 50; // نقطة البداية
        
        // عوامل RSI
        if (rsi < 30) pumpProbability += 20; // بيع مفرط
        else if (rsi > 70) pumpProbability -= 15; // شراء مفرط
        else if (rsi >= 40 && rsi <= 60) pumpProbability += 10; // منطقة متوازنة
        
        // عوامل MACD
        if (macd.histogram > 0) pumpProbability += 15;
        else pumpProbability -= 10;
        
        // عوامل Bollinger Bands
        if (bollingerBands.position === 'below') pumpProbability += 15;
        else if (bollingerBands.position === 'above') pumpProbability -= 10;
        
        // عوامل الحجم
        if (volumeAnalysis.signal === 'Very High') pumpProbability += 20;
        else if (volumeAnalysis.signal === 'High') pumpProbability += 15;
        else if (volumeAnalysis.signal === 'Low') pumpProbability -= 10;
        
        // عوامل الاتجاه
        if (trendDirection === 'Bullish') pumpProbability += 10;
        else pumpProbability -= 5;
        
        // عوامل الأنماط
        pumpProbability += patterns.length * 5;
        
        // عوامل تغير السعر
        if (coin.priceChange > 5) pumpProbability += 10;
        else if (coin.priceChange < -5) pumpProbability += 15; // فرصة انتعاش
        
        // تحديد النطاق
        pumpProbability = Math.max(0, Math.min(100, pumpProbability));
        
        // إضافة النتائج للعملة
        coin.technicalAnalysis = {
            rsi: {
                value: rsi,
                signal: rsi < 30 ? 'Oversold' : rsi > 70 ? 'Overbought' : 'Neutral'
            },
            macd,
            bollingerBands,
            trend: {
                direction: trendDirection,
                strength: Math.abs(trend)
            }
        };
        
        coin.volumeAnalysis = volumeAnalysis;
        coin.patterns = patterns;
        coin.pumpProbability = Math.round(pumpProbability);
    });
    
    console.log('تم تحليل العملات بنجاح');
}

// تطبيق المرشحات
function applyFilters() {
    const minProbability = parseInt(elements.minProbabilitySlider.value);
    const sortBy = elements.sortBy.value;
    const trendFilter = elements.trendFilter.value;
    
    // تصفية العملات
    filteredCoins = allCoins.filter(coin => {
        if (coin.pumpProbability < minProbability) return false;
        
        if (trendFilter === 'bullish' && coin.technicalAnalysis.trend.direction !== 'Bullish') return false;
        if (trendFilter === 'bearish' && coin.technicalAnalysis.trend.direction !== 'Bearish') return false;
        
        return true;
    });
    // ترتيب العملات
    filteredCoins.sort((a, b) => {
        switch (sortBy) {
            case 'probability':
                return b.pumpProbability - a.pumpProbability;
            case 'volume':
                return b.volume - a.volume;
            case 'price-change':
                return b.priceChange - a.priceChange;
            default:
                return b.pumpProbability - a.pumpProbability;
        }
    });
    
    // إعادة تعيين الصفحة الحالية
    currentPage = 1;
    
    // تحديث واجهة المستخدم
    updateUI();
    updateStats();
    updatePagination();
}

// تحديث الإحصائيات
function updateStats() {
    if (!elements.totalCoins) return;
    
    const totalCoins = filteredCoins.length;
    const highProbability = filteredCoins.filter(coin => coin.pumpProbability >= 70).length;
    const bullishTrend = filteredCoins.filter(coin => coin.technicalAnalysis.trend.direction === 'Bullish').length;
    const avgProbability = totalCoins > 0 ? 
        Math.round(filteredCoins.reduce((sum, coin) => sum + coin.pumpProbability, 0) / totalCoins) : 0;
    
    elements.totalCoins.textContent = totalCoins;
    elements.highProbability.textContent = highProbability;
    elements.bullishTrend.textContent = bullishTrend;
    elements.avgProbability.textContent = avgProbability + '%';
}

// تحديث واجهة المستخدم
function updateUI() {
    if (!elements.coinsContainer) return;
    
    // حساب العملات للصفحة الحالية
    const startIndex = (currentPage - 1) * coinsPerPage;
    const endIndex = startIndex + coinsPerPage;
    const coinsToShow = filteredCoins.slice(startIndex, endIndex);
    
    if (coinsToShow.length === 0) {
        elements.coinsContainer.innerHTML = `
            <div class="no-results">
                <div class="no-results-icon">🔍</div>
                <h3>لا توجد عملات تطابق المعايير المحددة</h3>
                <p>جرب تقليل الحد الأدنى لاحتمالية الارتفاع أو تغيير المرشحات</p>
            </div>
        `;
        return;
    }
    
    let coinsHTML = '';
    
    coinsToShow.forEach(coin => {
        const cleanName = coin.name.replace(/[^A-Z0-9]/g, '').toUpperCase();
        const displaySymbol = cleanName + '/USDT';
        const firstLetter = cleanName.charAt(0) || 'C';
        const formattedPrice = formatPrice(coin.price);
        const priceChangeClass = coin.priceChange >= 0 ? 'positive' : 'negative';
        const priceChangeSign = coin.priceChange >= 0 ? '+' : '';
        const priceChangeFormatted = coin.priceChange.toFixed(2);
        
        // تحديد لون شريط الاحتمالية
        let probabilityClass = 'low';
        if (coin.pumpProbability >= 70) probabilityClass = 'high';
        else if (coin.pumpProbability >= 50) probabilityClass = 'medium';
        
        // تحديد العلامات
        let tagsHTML = '';
        if (coin.technicalAnalysis.trend.direction === 'Bullish') {
            tagsHTML += '<span class="tag bullish">اتجاه صعودي</span>';
        }
        if (coin.volumeAnalysis.signal === 'High' || coin.volumeAnalysis.signal === 'Very High') {
            tagsHTML += '<span class="tag volume">حجم مرتفع</span>';
        }
        if (coin.technicalAnalysis.rsi.signal === 'Oversold') {
            tagsHTML += '<span class="tag oversold">بيع مفرط</span>';
        }
        if (coin.patterns.length > 0) {
            tagsHTML += '<span class="tag pattern">نمط مكتشف</span>';
        }
        
        // سبب التحليل
        const analysisReason = coin.patterns.length > 0 ? 
            'تم اكتشاف نمط: ' + coin.patterns.join('، ') : 
            'تطابق مؤشرات فنية متعددة';

        coinsHTML += `
            <div class="coin-card" data-symbol="${coin.symbol}" onclick="showCoinDetails('${coin.symbol}')">
                <div class="coin-header">
                    <div class="coin-symbol-circle">${firstLetter}</div>
                    <div class="coin-info">
                        <h3 class="coin-name">${cleanName}</h3>
                        <span class="coin-symbol">${displaySymbol}</span>
                    </div>
                    <div class="coin-price-section">
                        <div class="coin-price">$${formattedPrice}</div>
                        <div class="price-change ${priceChangeClass}">
                            ${priceChangeSign}${priceChangeFormatted}%
                        </div>
                    </div>
                </div>
                
                <div class="pump-probability">
                    <div class="probability-header">
                        <span class="probability-label">احتمالية الارتفاع</span>
                        <span class="probability-value">${coin.pumpProbability}%</span>
                    </div>
                    <div class="probability-bar">
                        <div class="probability-fill ${probabilityClass}" style="width: ${coin.pumpProbability}%"></div>
                    </div>
                </div>
                
                <div class="analysis-reason">${analysisReason}</div>
                
                <div class="coin-tags">${tagsHTML}</div>
                
                <div class="coin-footer">
                    <div class="volume-info">
                        <span class="volume-label">حجم التداول:</span>
                        <span class="volume-value">$${formatNumber(coin.volume)}</span>
                    </div>
                </div>
            </div>
        `;
    });
    
    elements.coinsContainer.innerHTML = coinsHTML;
}

// تحديث التصفح
function updatePagination() {
    if (!elements.pagination) return;
    
    const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
    
    if (totalPages <= 1) {
        elements.pagination.style.display = 'none';
        return;
    }
    
    elements.pagination.style.display = 'flex';
    elements.pageInfo.textContent = `صفحة ${currentPage} من ${totalPages}`;
    elements.prevPage.disabled = currentPage === 1;
    elements.nextPage.disabled = currentPage === totalPages;
}

// عرض تفاصيل العملة
function showCoinDetails(symbol) {
    const coin = allCoins.find(c => c.symbol === symbol);
    if (!coin) return;
    
    const cleanName = coin.name.replace(/[^A-Z0-9]/g, '').toUpperCase();
    const displaySymbol = cleanName + '/USDT';
    
    // تحديث محتوى النافذة المنبثقة
    document.getElementById('modal-coin-name').textContent = cleanName;
    document.getElementById('modal-coin-symbol').textContent = displaySymbol;
    document.getElementById('modal-coin-price').textContent = '$' + formatPrice(coin.price);
    
    const priceChangeElement = document.getElementById('modal-price-change');
    priceChangeElement.textContent = (coin.priceChange >= 0 ? '+' : '') + coin.priceChange.toFixed(2) + '%';
    priceChangeElement.className = 'price-change ' + (coin.priceChange >= 0 ? 'positive' : 'negative');
    
    document.getElementById('modal-pump-probability').textContent = coin.pumpProbability + '%';
    document.getElementById('modal-volume').textContent = '$' + formatNumber(coin.volume);
    
    // المؤشرات الفنية
    document.getElementById('modal-rsi').textContent = coin.technicalAnalysis.rsi.value.toFixed(2);
    document.getElementById('modal-macd').textContent = coin.technicalAnalysis.macd.histogram.toFixed(4);
    document.getElementById('modal-bb-position').textContent = coin.technicalAnalysis.bollingerBands.position;
    document.getElementById('modal-trend').textContent = coin.technicalAnalysis.trend.direction;
    document.getElementById('modal-volume-signal').textContent = coin.volumeAnalysis.signal;
    
    // الأنماط
    const patternsContainer = document.getElementById('modal-patterns');
    if (coin.patterns.length > 0) {
        patternsContainer.innerHTML = coin.patterns.map(pattern => 
            `<span class="pattern-tag">${pattern}</span>`
        ).join('');
    } else {
        patternsContainer.innerHTML = '<span class="no-patterns">لا توجد أنماط محددة</span>';
    }
    
    // عرض النافذة المنبثقة
    elements.modal.style.display = 'block';
}

// دوال التنسيق
function formatPrice(price) {
    if (price >= 1) {
        return price.toFixed(2);
    } else if (price >= 0.01) {
        return price.toFixed(4);
    } else {
        return price.toFixed(8);
    }
}

function formatNumber(num) {
    if (num >= 1e9) {
        return (num / 1e9).toFixed(1) + 'B';
    } else if (num >= 1e6) {
        return (num / 1e6).toFixed(1) + 'M';
    } else if (num >= 1e3) {
        return (num / 1e3).toFixed(1) + 'K';
    }
    return num.toFixed(0);
}

// إظهار حالة التحميل
function showLoading() {
    if (elements.loadingState) elements.loadingState.style.display = 'block';
    if (elements.errorState) elements.errorState.style.display = 'none';
    if (elements.coinsContainer) elements.coinsContainer.style.display = 'none';
}

// إخفاء حالة التحميل
function hideLoading() {
    if (elements.loadingState) elements.loadingState.style.display = 'none';
    if (elements.coinsContainer) elements.coinsContainer.style.display = 'grid';
}

// إظهار حالة الخطأ
function showError() {
    if (elements.errorState) elements.errorState.style.display = 'block';
    if (elements.loadingState) elements.loadingState.style.display = 'none';
    if (elements.coinsContainer) elements.coinsContainer.style.display = 'none';
}

// تهيئة أحداث المستمعين
function initializeEventListeners() {
    // مرشح الاحتمالية
    if (elements.minProbabilitySlider) {
        elements.minProbabilitySlider.addEventListener('input', (e) => {
            elements.probabilityValue.textContent = e.target.value + '%';
            applyFilters();
        });
    }
    
    // مرشح الترتيب
    if (elements.sortBy) {
        elements.sortBy.addEventListener('change', applyFilters);
    }
    
    // مرشح الاتجاه
    if (elements.trendFilter) {
        elements.trendFilter.addEventListener('change', applyFilters);
    }
    
    // زر التحديث
    if (elements.refreshBtn) {
        elements.refreshBtn.addEventListener('click', async () => {
            elements.refreshBtn.disabled = true;
            elements.refreshBtn.innerHTML = '<span class="btn-icon">⏳</span> جاري التحديث...';
            
            try {
                await initApp();
            } catch (error) {
                console.error('خطأ في التحديث:', error);
            }
            
            elements.refreshBtn.disabled = false;
            elements.refreshBtn.innerHTML = '<span class="btn-icon">🔄</span> تحديث البيانات';
        });
    }
    
    // التصفح
    if (elements.prevPage) {
        elements.prevPage.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                updateUI();
                updatePagination();
                window.scrollTo(0, 0);
            }
        });
    }
    
    if (elements.nextPage) {
        elements.nextPage.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredCoins.length / coinsPerPage);
            if (currentPage < totalPages) {
                currentPage++;
                updateUI();
                updatePagination();
                window.scrollTo(0, 0);
            }
        });
    }
    
    // إغلاق النافذة المنبثقة
    if (elements.closeModal) {
        elements.closeModal.addEventListener('click', () => {
            elements.modal.style.display = 'none';
        });
    }
    
    // إغلاق النافذة المنبثقة عند النقر خارجها
    if (elements.modal) {
        elements.modal.addEventListener('click', (e) => {
            if (e.target === elements.modal) {
                elements.modal.style.display = 'none';
            }
        });
    }
    
    // إغلاق النافذة المنبثقة بمفتاح Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.modal.style.display === 'block') {
            elements.modal.style.display = 'none';
        }
    });
}

// الدالة الرئيسية لتهيئة التطبيق
async function initApp() {
    try {
        console.log('بدء تهيئة التطبيق...');
        
        // إظهار حالة التحميل
        showLoading();
        
        // جلب وتحليل البيانات
        await fetchCoinsData();
        await analyzeCoins();
        
        // تطبيق المرشحات وتحديث واجهة المستخدم
        applyFilters();
        
        // إخفاء حالة التحميل
        hideLoading();
        
        console.log('تم تهيئة التطبيق بنجاح');
    } catch (error) {
        console.error('خطأ في تهيئة التطبيق:', error);
        showError();
    }
}

// تهيئة التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    console.log('تم تحميل DOM');
    
    // تهيئة عناصر DOM
    initializeElements();
    
    // تهيئة أحداث المستمعين
    initializeEventListeners();
    
    // بدء التطبيق
    initApp();
});

// تصدير الدوال للاستخدام العام
window.showCoinDetails = showCoinDetails;
