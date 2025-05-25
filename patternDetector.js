class PatternDetector {
    constructor() {
        this.patterns = {
            'double-bottom': {
                name: 'القاع الثنائي',
                nameEn: 'Double Bottom',
                type: 'bullish',
                description: 'نموذج انعكاسي صاعد يتكون من قاعين متساويين تقريباً',
                reliability: 85,
                minBars: 20,
                detect: this.detectDoubleBottom.bind(this)
            },
            'triple-top': {
                name: 'القمة الثلاثية',
                nameEn: 'Triple Top',
                type: 'bearish',
                description: 'نموذج انعكاسي هابط يتكون من ثلاث قمم متساوية تقريباً',
                reliability: 80,
                minBars: 25,
                detect: this.detectTripleTop.bind(this)
            },
            'triple-bottom': {
                name: 'القاع الثلاثي',
                nameEn: 'Triple Bottom',
                type: 'bullish',
                description: 'نموذج انعكاسي صاعد يتكون من ثلاثة قيعان متساوية تقريباً',
                reliability: 80,
                minBars: 25,
                detect: this.detectTripleBottom.bind(this)
            },
            'head-shoulders': {
                name: 'الرأس والكتفين',
                nameEn: 'Head & Shoulders',
                type: 'bearish',
                description: 'نموذج انعكاسي هابط يتكون من قمة عالية بين قمتين أقل',
                reliability: 90,
                minBars: 30,
                detect: this.detectHeadAndShoulders.bind(this)
            },
            'inverted-head-shoulders': {
                name: 'الرأس والكتفين المقلوب',
                nameEn: 'Inverted Head & Shoulders',
                type: 'bullish',
                description: 'نموذج انعكاسي صاعد يتكون من قاع منخفض بين قاعين أعلى',
                reliability: 90,
                minBars: 30,
                detect: this.detectInvertedHeadAndShoulders.bind(this)
            },
            'symmetrical-triangle': {
                name: 'المثلث المتماثل',
                nameEn: 'Symmetrical Triangle',
                type: 'continuation',
                description: 'نموذج استمراري يتكون من قمم منخفضة وقيعان مرتفعة',
                reliability: 75,
                minBars: 20,
                detect: this.detectSymmetricalTriangle.bind(this)
            },
            'ascending-triangle': {
                name: 'المثلث الصاعد',
                nameEn: 'Ascending Triangle',
                type: 'bullish',
                description: 'نموذج صاعد يتكون من مقاومة أفقية وقيعان مرتفعة',
                reliability: 80,
                minBars: 15,
                detect: this.detectAscendingTriangle.bind(this)
            },
            'descending-triangle': {
                name: 'المثلث الهابط',
                nameEn: 'Descending Triangle',
                type: 'bearish',
                description: 'نموذج هابط يتكون من دعم أفقي وقمم منخفضة',
                reliability: 80,
                minBars: 15,
                detect: this.detectDescendingTriangle.bind(this)
            },
            'rising-wedge': {
                name: 'الوتد الصاعد',
                nameEn: 'Rising Wedge',
                type: 'bearish',
                description: 'نموذج هابط يتكون من قمم وقيعان مرتفعة مع تضييق المدى',
                reliability: 75,
                minBars: 20,
                detect: this.detectRisingWedge.bind(this)
            },
            'falling-wedge': {
                name: 'الوتد الهابط',
                nameEn: 'Falling Wedge',
                type: 'bullish',
                description: 'نموذج صاعد يتكون من قمم وقيعان منخفضة مع تضييق المدى',
                reliability: 75,
                minBars: 20,
                detect: this.detectFallingWedge.bind(this)
            }
        };
    }

    async detectPatterns(priceData) {
        if (!priceData || priceData.length < 20) {
            return null;
        }

        const detectedPatterns = [];

        for (const [key, pattern] of Object.entries(this.patterns)) {
            try {
                const result = await pattern.detect(priceData);
                if (result && result.confidence > 60) {
                    detectedPatterns.push({
                        type: key,
                        ...pattern,
                        ...result
                    });
                }
            } catch (error) {
                console.warn(`خطأ في اكتشاف النموذج ${pattern.name}:`, error);
            }
        }

        // ترتيب حسب الثقة
        detectedPatterns.sort((a, b) => b.confidence - a.confidence);
        
        return detectedPatterns.length > 0 ? detectedPatterns[0] : null;
    }

    detectDoubleBottom(data) {
        const lows = this.findLocalExtremes(data, 'low');
        if (lows.length < 2) return null;

        for (let i = 0; i < lows.length - 1; i++) {
            const bottom1 = lows[i];
            const bottom2 = lows[i + 1];
            
            const priceDiff = Math.abs(bottom1.price - bottom2.price) / bottom1.price;
            const timeDiff = bottom2.index - bottom1.index;
            
            if (priceDiff < 0.03 && timeDiff > 10 && timeDiff < 50) {
                const neckline = Math.max(
                    ...data.slice(bottom1.index, bottom2.index).map(d => d.high)
                );
                
                const target = neckline + (neckline - Math.min(bottom1.price, bottom2.price));
                
                return {
                    confidence: 85 - (priceDiff * 1000),
                    entry: neckline,
                    target: target,
                    stopLoss: Math.min(bottom1.price, bottom2.price) * 0.98,
                    points: [bottom1, bottom2],
                    neckline: neckline
                };
            }
        }
        return null;
    }

    detectTripleTop(data) {
        const highs = this.findLocalExtremes(data, 'high');
        if (highs.length < 3) return null;

        for (let i = 0; i < highs.length - 2; i++) {
            const top1 = highs[i];
            const top2 = highs[i + 1];
            const top3 = highs[i + 2];
            
            const avgPrice = (top1.price + top2.price + top3.price) / 3;
            const maxDiff = Math.max(
                Math.abs(top1.price - avgPrice),
                Math.abs(top2.price - avgPrice),
                Math.abs(top3.price - avgPrice)
            ) / avgPrice;
            
            if (maxDiff < 0.02) {
                const neckline = Math.min(
                    ...data.slice(top1.index, top3.index).map(d => d.low)
                );
                
                const target = neckline - (avgPrice - neckline);
                
                return {
                    confidence: 80 - (maxDiff * 2000),
                    entry: neckline,
                    target: target,
                    stopLoss: avgPrice * 1.02,
                                      points: [top1, top2, top3],
                    neckline: neckline
                };
            }
        }
        return null;
    }

    detectTripleBottom(data) {
        const lows = this.findLocalExtremes(data, 'low');
        if (lows.length < 3) return null;

        for (let i = 0; i < lows.length - 2; i++) {
            const bottom1 = lows[i];
            const bottom2 = lows[i + 1];
            const bottom3 = lows[i + 2];
            
            const avgPrice = (bottom1.price + bottom2.price + bottom3.price) / 3;
            const maxDiff = Math.max(
                Math.abs(bottom1.price - avgPrice),
                Math.abs(bottom2.price - avgPrice),
                Math.abs(bottom3.price - avgPrice)
            ) / avgPrice;
            
            if (maxDiff < 0.02) {
                const neckline = Math.max(
                    ...data.slice(bottom1.index, bottom3.index).map(d => d.high)
                );
                
                const target = neckline + (neckline - avgPrice);
                
                return {
                    confidence: 80 - (maxDiff * 2000),
                    entry: neckline,
                    target: target,
                    stopLoss: avgPrice * 0.98,
                    points: [bottom1, bottom2, bottom3],
                    neckline: neckline
                };
            }
        }
        return null;
    }

    detectHeadAndShoulders(data) {
        const highs = this.findLocalExtremes(data, 'high');
        if (highs.length < 3) return null;

        for (let i = 0; i < highs.length - 2; i++) {
            const leftShoulder = highs[i];
            const head = highs[i + 1];
            const rightShoulder = highs[i + 2];
            
            // التحقق من أن الرأس أعلى من الكتفين
            if (head.price > leftShoulder.price && head.price > rightShoulder.price) {
                const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
                
                if (shoulderDiff < 0.05) {
                    const neckline = Math.min(
                        ...data.slice(leftShoulder.index, rightShoulder.index).map(d => d.low)
                    );
                    
                    const target = neckline - (head.price - neckline);
                    
                    return {
                        confidence: 90 - (shoulderDiff * 1000),
                        entry: neckline,
                        target: target,
                        stopLoss: head.price * 1.02,
                        points: [leftShoulder, head, rightShoulder],
                        neckline: neckline
                    };
                }
            }
        }
        return null;
    }

    detectInvertedHeadAndShoulders(data) {
        const lows = this.findLocalExtremes(data, 'low');
        if (lows.length < 3) return null;

        for (let i = 0; i < lows.length - 2; i++) {
            const leftShoulder = lows[i];
            const head = lows[i + 1];
            const rightShoulder = lows[i + 2];
            
            // التحقق من أن الرأس أقل من الكتفين
            if (head.price < leftShoulder.price && head.price < rightShoulder.price) {
                const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price;
                
                if (shoulderDiff < 0.05) {
                    const neckline = Math.max(
                        ...data.slice(leftShoulder.index, rightShoulder.index).map(d => d.high)
                    );
                    
                    const target = neckline + (neckline - head.price);
                    
                    return {
                        confidence: 90 - (shoulderDiff * 1000),
                        entry: neckline,
                        target: target,
                        stopLoss: head.price * 0.98,
                        points: [leftShoulder, head, rightShoulder],
                        neckline: neckline
                    };
                }
            }
        }
        return null;
    }

    detectSymmetricalTriangle(data) {
        const highs = this.findLocalExtremes(data, 'high');
        const lows = this.findLocalExtremes(data, 'low');
        
        if (highs.length < 2 || lows.length < 2) return null;

        // خط المقاومة المنحدر
        const resistanceLine = this.calculateTrendLine(highs.slice(-3));
        // خط الدعم الصاعد
        const supportLine = this.calculateTrendLine(lows.slice(-3));
        
        if (resistanceLine.slope < 0 && supportLine.slope > 0) {
            const convergencePoint = this.findLineIntersection(resistanceLine, supportLine);
            
            if (convergencePoint && convergencePoint.x > data.length) {
                const currentPrice = data[data.length - 1].close;
                const upperBound = this.getLineValue(resistanceLine, data.length - 1);
                const lowerBound = this.getLineValue(supportLine, data.length - 1);
                
                const triangleHeight = upperBound - lowerBound;
                const target1 = currentPrice + triangleHeight;
                const target2 = currentPrice - triangleHeight;
                
                return {
                    confidence: 75,
                    entry: currentPrice,
                    target: target1,
                    target2: target2,
                    stopLoss: lowerBound * 0.98,
                    upperBound: upperBound,
                    lowerBound: lowerBound
                };
            }
        }
        return null;
    }

    detectAscendingTriangle(data) {
        const highs = this.findLocalExtremes(data, 'high');
        const lows = this.findLocalExtremes(data, 'low');
        
        if (highs.length < 2 || lows.length < 2) return null;

        // مستوى مقاومة أفقي
        const resistance = highs.slice(-3).reduce((sum, h) => sum + h.price, 0) / Math.min(3, highs.length);
        const resistanceVariation = Math.max(...highs.slice(-3).map(h => Math.abs(h.price - resistance))) / resistance;
        
        // خط دعم صاعد
        const supportLine = this.calculateTrendLine(lows.slice(-3));
        
        if (resistanceVariation < 0.02 && supportLine.slope > 0) {
            const currentPrice = data[data.length - 1].close;
            const supportLevel = this.getLineValue(supportLine, data.length - 1);
            
            const triangleHeight = resistance - supportLevel;
            const target = resistance + triangleHeight;
            
            return {
                confidence: 80,
                entry: resistance,
                target: target,
                stopLoss: supportLevel * 0.98,
                resistance: resistance,
                supportLine: supportLine
            };
        }
        return null;
    }

    detectDescendingTriangle(data) {
        const highs = this.findLocalExtremes(data, 'high');
        const lows = this.findLocalExtremes(data, 'low');
        
        if (highs.length < 2 || lows.length < 2) return null;

        // مستوى دعم أفقي
        const support = lows.slice(-3).reduce((sum, l) => sum + l.price, 0) / Math.min(3, lows.length);
        const supportVariation = Math.max(...lows.slice(-3).map(l => Math.abs(l.price - support))) / support;
        
        // خط مقاومة هابط
        const resistanceLine = this.calculateTrendLine(highs.slice(-3));
        
        if (supportVariation < 0.02 && resistanceLine.slope < 0) {
            const currentPrice = data[data.length - 1].close;
            const resistanceLevel = this.getLineValue(resistanceLine, data.length - 1);
            
            const triangleHeight = resistanceLevel - support;
            const target = support - triangleHeight;
            
            return {
                confidence: 80,
                entry: support,
                target: target,
                stopLoss: resistanceLevel * 1.02,
                support: support,
                resistanceLine: resistanceLine
            };
        }
        return null;
    }

    detectRisingWedge(data) {
        const highs = this.findLocalExtremes(data, 'high');
        const lows = this.findLocalExtremes(data, 'low');
        
        if (highs.length < 2 || lows.length < 2) return null;

        const resistanceLine = this.calculateTrendLine(highs.slice(-3));
        const supportLine = this.calculateTrendLine(lows.slice(-3));
        
        // كلا الخطين صاعدين والمقاومة أكثر انحداراً
        if (resistanceLine.slope > 0 && supportLine.slope > 0 && 
            resistanceLine.slope > supportLine.slope) {
            
            const convergencePoint = this.findLineIntersection(resistanceLine, supportLine);
            
            if (convergencePoint && convergencePoint.x > data.length) {
                const currentPrice = data[data.length - 1].close;
                const supportLevel = this.getLineValue(supportLine, data.length - 1);
                
                const wedgeHeight = currentPrice - supportLevel;
                const target = supportLevel - wedgeHeight;
                
                return {
                    confidence: 75,
                    entry: supportLevel,
                    target: target,
                    stopLoss: currentPrice * 1.02,
                    resistanceLine: resistanceLine,
                    supportLine: supportLine
                };
            }
        }
        return null;
    }

    detectFallingWedge(data) {
        const highs = this.findLocalExtremes(data, 'high');
        const lows = this.findLocalExtremes(data, 'low');
        
        if (highs.length < 2 || lows.length < 2) return null;

        const resistanceLine = this.calculateTrendLine(highs.slice(-3));
        const supportLine = this.calculateTrendLine(lows.slice(-3));
        
        // كلا الخطين هابطين والدعم أكثر انحداراً
        if (resistanceLine.slope < 0 && supportLine.slope < 0 && 
            supportLine.slope < resistanceLine.slope) {
            
            const convergencePoint = this.findLineIntersection(resistanceLine, supportLine);
            
            if (convergencePoint && convergencePoint.x > data.length) {
                const currentPrice = data[data.length - 1].close;
                const resistanceLevel = this.getLineValue(resistanceLine, data.length - 1);
                
                const wedgeHeight = resistanceLevel - currentPrice;
                const target = resistanceLevel + wedgeHeight;
                
                return {
                    confidence: 75,
                    entry: resistanceLevel,
                    target: target,
                    stopLoss: currentPrice * 0.98,
                    resistanceLine: resistanceLine,
                    supportLine: supportLine
                };
            }
        }
        return null;
    }

    // دوال مساعدة
    findLocalExtremes(data, type) {
        const extremes = [];
        const lookback = 5;
        
        for (let i = lookback; i < data.length - lookback; i++) {
            let isExtreme = true;
            const currentValue = data[i][type];
            
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                
                if (type === 'high' && data[j].high >= currentValue) {
                    isExtreme = false;
                    break;
                }
                if (type === 'low' && data[j].low <= currentValue) {
                    isExtreme = false;
                    break;
                }
            }
            
            if (isExtreme) {
                extremes.push({
                    index: i,
                    price: currentValue,
                    timestamp: data[i].timestamp
                });
            }
        }
        
        return extremes;
    }

    calculateTrendLine(points) {
        if (points.length < 2) return null;
        
        const n = points.length;
        const sumX = points.reduce((sum, p) => sum + p.index, 0);
        const sumY = points.reduce((sum, p) => sum + p.price, 0);
        const sumXY = points.reduce((sum, p) => sum + (p.index * p.price), 0);
        const sumXX = points.reduce((sum, p) => sum + (p.index * p.index), 0);
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;
        
        return { slope, intercept };
    }

    getLineValue(line, x) {
        return line.slope * x + line.intercept;
    }

    findLineIntersection(line1, line2) {
        const x = (line2.intercept - line1.intercept) / (line1.slope - line2.slope);
        const y = line1.slope * x + line1.intercept;
        return { x, y };
    }
}
class CryptoPatternApp {
    constructor() {
        this.patternDetector = new PatternDetector();
        this.cryptoData = new Map();
        this.filteredData = [];
        this.isConnected = false;
        this.updateInterval = null;
        this.stableCoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'USDD'];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.showLoading(true);
        await this.loadCryptoData();
        this.startRealTimeUpdates();
    }

    setupEventListeners() {
        // فلتر الأنماط
        document.getElementById('patternFilter').addEventListener('change', (e) => {
            this.filterData();
        });

        // البحث
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.filterData();
        });

        // إغلاق النافذة المنبثقة
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
        });

        // إغلاق النافذة عند النقر خارجها
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('patternModal');
            if (e.target === modal) {
                this.closeModal();
            }
        });
    }

    async loadCryptoData() {
        try {
            // الحصول على قائمة العملات من Binance
            const symbolsResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo');
            const symbolsData = await symbolsResponse.json();
            
            // فلترة العملات (USDT pairs فقط، استبعاد العملات المستقرة)
            const usdtPairs = symbolsData.symbols
                .filter(symbol => 
                    symbol.status === 'TRADING' && 
                    symbol.symbol.endsWith('USDT') &&
                    !this.stableCoins.some(stable => symbol.symbol.startsWith(stable))
                )
                .map(symbol => symbol.symbol)
                .slice(0, 100); // أول 100 عملة

            // الحصول على بيانات الأسعار
            const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            const priceData = await priceResponse.json();

            // الحصول على بيانات الشموع لكل عملة
            const promises = usdtPairs.map(async (symbol) => {
                try {
                    const [tickerData, candleData] = await Promise.all([
                        this.getPriceData(symbol, priceData),
                        this.getCandleData(symbol)
                    ]);

                    if (tickerData && candleData) {
                        const pattern = await this.patternDetector.detectPatterns(candleData);
                        
                        this.cryptoData.set(symbol, {
                            symbol: symbol,
                            name: symbol.replace('USDT', ''),
                            price: parseFloat(tickerData.lastPrice),
                            change: parseFloat(tickerData.priceChangePercent),
                            volume: parseFloat(tickerData.volume),
                            quoteVolume: parseFloat(tickerData.quoteVolume),
                            pattern: pattern,
                            lastUpdate: Date.now()
                        });
                    }
                } catch (error) {
                    console.warn(`خطأ في تحميل بيانات ${symbol}:`, error);
                }
            });

            await Promise.all(promises);
            
            this.isConnected = true;
            this.updateConnectionStatus();
            this.filterData();
            this.showLoading(false);

        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
            this.showLoading(false);
        }
    }

    getPriceData(symbol, allPriceData) {
        return allPriceData.find(item => item.symbol === symbol);
    }

    async getCandleData(symbol) {
        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1h&limit=100`
            );
            const data = await response.json();
            
            return data.map((candle, index) => ({
                timestamp: candle[0],
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                index: index
            }));
        } catch (error) {
            console.warn(`خطأ في الحصول على بيانات الشموع لـ ${symbol}:`, error);
            return null;
        }
    }

    filterData() {
        const patternFilter = document.getElementById('patternFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredData = Array.from(this.cryptoData.values()).filter(crypto => {
            const matchesSearch = crypto.name.toLowerCase().includes(searchTerm) || 
                                crypto.symbol.toLowerCase().includes(searchTerm);
            
            const matchesPattern = !patternFilter || 
                                 (crypto.pattern && crypto.pattern.type === patternFilter);

            return matchesSearch && matchesPattern;
        });

        // ترتيب حسب حجم التداول
        this.filteredData.sort((a, b) => b.quoteVolume - a.quoteVolume);

        this.renderCryptoGrid();
    }

    renderCryptoGrid() {
        const grid = document.getElementById('cryptoGrid');
        grid.innerHTML = '';

        this.filteredData.forEach(crypto => {
            const card = this.createCryptoCard(crypto);
            grid.appendChild(card);
        });

        if (this.filteredData.length === 0) {
            grid.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة للبحث</div>';
        }
    }

    createCryptoCard(crypto) {
        const card = document.createElement('div');
        card.className = 'crypto-card';
        card.addEventListener('click', () => this.showPatternDetails(crypto));

        const changeClass = crypto.change >= 0 ? 'positive' : 'negative';
        const arrow = crypto.change >= 0 ? '↗' : '↘';

        card.innerHTML = `
            <div class="card-header">
                <div class="coin-logo">
                    ${crypto.name.charAt(0).toUpperCase()}
                </div>
                <div class="coin-info">
                    <h3>${crypto.name}</h3>
                    <span class="symbol">${crypto.symbol}</span>
                </div>
            </div>

            <div class="price-section">
                <div class="current-price">$${this.formatNumber(crypto.price)}</div>
                <div class="price-change ${changeClass}">
                    <span class="arrow">${arrow}</span>
                    ${crypto.change.toFixed(2)}%
                </div>
            </div>

            <div class="stats">
                <div class="stat-item">
                    <div class="stat-label">حجم السيولة</div>
                    <div class="stat-value">$${this.formatLargeNumber(crypto.quoteVolume)}</div>
                </div>
                <div class="stat-item">
                    <div class="stat-label">حجم التداول</div>
                    <div class="stat-value">${this.formatLargeNumber(crypto.volume)} ${crypto.name}</div>
                </div>
            </div>

            <div class="pattern-section ${crypto.pattern ? '' : 'no-pattern'}">
                <div class="pattern-name">
                    ${crypto.pattern ? crypto.pattern.name : 'لا يتوفر نموذج فني'}
                </div>
                ${crypto.pattern ? `
                    <div class="pattern-confidence">
                        دقة: ${crypto.pattern.confidence.toFixed(1)}%
                    </div>
                ` : ''}
            </div>
        `;

        return card;
    }

    showPatternDetails(crypto) {
        const modal = document.getElementById('patternModal');
        const modalBody = document.getElementById('modalBody');

        if (crypto.pattern) {
                        modalBody.innerHTML = `
                <div class="pattern-details">
                    <h2>${crypto.pattern.name} - ${crypto.name}</h2>
                    
                    <div class="pattern-info">
                        <div class="info-card">
                            <h4>معلومات النموذج</h4>
                            <p><strong>النوع:</strong> ${this.getPatternTypeText(crypto.pattern.type)}</p>
                            <p><strong>الوصف:</strong> ${crypto.pattern.description}</p>
                            <p><strong>مستوى الثقة:</strong> ${crypto.pattern.confidence.toFixed(1)}%</p>
                            <p><strong>الموثوقية:</strong> ${crypto.pattern.reliability}%</p>
                        </div>

                        <div class="info-card targets">
                            <h4>🎯 الأهداف والدخول</h4>
                            <p><strong>نقطة الدخول:</strong> $${this.formatNumber(crypto.pattern.entry)}</p>
                            <p><strong>الهدف الأول:</strong> $${this.formatNumber(crypto.pattern.target)}</p>
                            ${crypto.pattern.target2 ? `<p><strong>الهدف الثاني:</strong> $${this.formatNumber(crypto.pattern.target2)}</p>` : ''}
                            <p><strong>المسافة للهدف:</strong> ${this.calculateTargetDistance(crypto.price, crypto.pattern.target)}%</p>
                        </div>

                        <div class="info-card risks">
                            <h4>⚠️ إدارة المخاطر</h4>
                            <p><strong>وقف الخسارة:</strong> $${this.formatNumber(crypto.pattern.stopLoss)}</p>
                            <p><strong>نسبة المخاطرة:</strong> ${this.calculateRiskRatio(crypto.price, crypto.pattern.target, crypto.pattern.stopLoss)}</p>
                            <p><strong>المسافة لوقف الخسارة:</strong> ${this.calculateStopLossDistance(crypto.price, crypto.pattern.stopLoss)}%</p>
                        </div>

                        <div class="info-card">
                            <h4>📊 تفاصيل إضافية</h4>
                            <p><strong>السعر الحالي:</strong> $${this.formatNumber(crypto.price)}</p>
                            <p><strong>التغيير اليومي:</strong> ${crypto.change.toFixed(2)}%</p>
                            ${crypto.pattern.neckline ? `<p><strong>خط العنق:</strong> $${this.formatNumber(crypto.pattern.neckline)}</p>` : ''}
                            ${crypto.pattern.resistance ? `<p><strong>مستوى المقاومة:</strong> $${this.formatNumber(crypto.pattern.resistance)}</p>` : ''}
                            ${crypto.pattern.support ? `<p><strong>مستوى الدعم:</strong> $${this.formatNumber(crypto.pattern.support)}</p>` : ''}
                        </div>

                        <div class="info-card">
                            <h4>📈 حالة الاختراق</h4>
                            ${this.getBreakoutStatus(crypto)}
                        </div>

                        <div class="info-card">
                            <h4>💡 توصيات التداول</h4>
                            ${this.getTradingRecommendations(crypto)}
                        </div>
                    </div>
                </div>
            `;
        } else {
            modalBody.innerHTML = `
                <div class="pattern-details">
                    <h2>تفاصيل ${crypto.name}</h2>
                    
                    <div class="pattern-info">
                        <div class="info-card">
                            <h4>معلومات العملة</h4>
                            <p><strong>الرمز:</strong> ${crypto.symbol}</p>
                            <p><strong>السعر الحالي:</strong> $${this.formatNumber(crypto.price)}</p>
                            <p><strong>التغيير اليومي:</strong> ${crypto.change.toFixed(2)}%</p>
                            <p><strong>حجم التداول:</strong> ${this.formatLargeNumber(crypto.volume)} ${crypto.name}</p>
                            <p><strong>حجم السيولة:</strong> $${this.formatLargeNumber(crypto.quoteVolume)}</p>
                        </div>

                        <div class="info-card no-pattern">
                            <h4>🔍 حالة الأنماط الفنية</h4>
                            <p>لا يتوفر نموذج فني واضح في الوقت الحالي</p>
                            <p>يُنصح بمراقبة العملة لظهور أنماط جديدة</p>
                        </div>
                    </div>
                </div>
            `;
        }

        modal.style.display = 'block';
    }

    getPatternTypeText(type) {
        const types = {
            'bullish': 'صاعد 📈',
            'bearish': 'هابط 📉',
            'continuation': 'استمراري ➡️'
        };
        return types[type] || type;
    }

    calculateTargetDistance(currentPrice, target) {
        return (((target - currentPrice) / currentPrice) * 100).toFixed(2);
    }

    calculateStopLossDistance(currentPrice, stopLoss) {
        return (((stopLoss - currentPrice) / currentPrice) * 100).toFixed(2);
    }

    calculateRiskRatio(currentPrice, target, stopLoss) {
        const profit = Math.abs(target - currentPrice);
        const risk = Math.abs(currentPrice - stopLoss);
        const ratio = profit / risk;
        return `1:${ratio.toFixed(2)}`;
    }

    getBreakoutStatus(crypto) {
        if (!crypto.pattern) return '<p>لا يوجد نموذج للتحليل</p>';

        const currentPrice = crypto.price;
        const entry = crypto.pattern.entry;
        const tolerance = 0.005; // 0.5% tolerance

        let status = '';
        let statusClass = '';

        if (Math.abs(currentPrice - entry) / entry < tolerance) {
            status = '⏳ السعر قريب من نقطة الاختراق';
            statusClass = 'warning';
        } else if (
            (crypto.pattern.type === 'bullish' && currentPrice > entry * (1 + tolerance)) ||
            (crypto.pattern.type === 'bearish' && currentPrice < entry * (1 - tolerance))
        ) {
            status = '✅ تم تأكيد الاختراق';
            statusClass = 'success';
        } else {
            status = '❌ لم يتم الاختراق بعد';
            statusClass = 'pending';
        }

        return `<p class="${statusClass}">${status}</p>`;
    }

    getTradingRecommendations(crypto) {
        if (!crypto.pattern) return '<p>لا توجد توصيات متاحة</p>';

        const recommendations = [];
        
        if (crypto.pattern.confidence > 80) {
            recommendations.push('🟢 نموذج عالي الثقة - مناسب للتداول');
        } else if (crypto.pattern.confidence > 65) {
            recommendations.push('🟡 نموذج متوسط الثقة - يتطلب حذر');
        } else {
            recommendations.push('🔴 نموذج منخفض الثقة - تجنب التداول');
        }

        if (crypto.pattern.type === 'bullish') {
            recommendations.push('📈 توقع اتجاه صاعد');
            recommendations.push('💡 انتظر اختراق نقطة الدخول للشراء');
        } else if (crypto.pattern.type === 'bearish') {
            recommendations.push('📉 توقع اتجاه هابط');
            recommendations.push('💡 انتظر اختراق نقطة الدخول للبيع');
        }

        recommendations.push('⚠️ استخدم وقف الخسارة دائماً');
        recommendations.push('📊 راقب حجم التداول عند الاختراق');

        return recommendations.map(rec => `<p>${rec}</p>`).join('');
    }

    closeModal() {
        document.getElementById('patternModal').style.display = 'none';
    }

    startRealTimeUpdates() {
        // تحديث البيانات كل 30 ثانية
        this.updateInterval = setInterval(async () => {
            await this.updatePrices();
        }, 30000);
    }

    async updatePrices() {
        try {
            const symbols = Array.from(this.cryptoData.keys());
            const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            const priceData = await priceResponse.json();

            symbols.forEach(symbol => {
                const tickerData = this.getPriceData(symbol, priceData);
                if (tickerData && this.cryptoData.has(symbol)) {
                    const crypto = this.cryptoData.get(symbol);
                    crypto.price = parseFloat(tickerData.lastPrice);
                    crypto.change = parseFloat(tickerData.priceChangePercent);
                    crypto.volume = parseFloat(tickerData.volume);
                    crypto.quoteVolume = parseFloat(tickerData.quoteVolume);
                    crypto.lastUpdate = Date.now();
                }
            });

            this.updateLastUpdateTime();
            this.filterData(); // إعادة رسم الشبكة

        } catch (error) {
            console.error('خطأ في تحديث الأسعار:', error);
            this.isConnected = false;
            this.updateConnectionStatus();
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (this.isConnected) {
            statusElement.textContent = '🟢 متصل';
            statusElement.style.color = '#27ae60';
        } else {
            statusElement.textContent = '🔴 غير متصل';
            statusElement.style.color = '#e74c3c';
        }
    }

    updateLastUpdateTime() {
        const lastUpdateElement = document.getElementById('lastUpdate');
        const now = new Date();
        lastUpdateElement.textContent = `آخر تحديث: ${now.toLocaleTimeString('ar-SA')}`;
    }

    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        const grid = document.getElementById('cryptoGrid');
        
        if (show) {
            spinner.style.display = 'block';
            grid.style.display = 'none';
        } else {
            spinner.style.display = 'none';
            grid.style.display = 'grid';
        }
    }

    showError(message) {
        const grid = document.getElementById('cryptoGrid');
        grid.innerHTML = `
            <div class="error-message">
                <h3>⚠️ خطأ</h3>
                <p>${message}</p>
                <button onclick="location.reload()">إعادة المحاولة</button>
            </div>
        `;
    }

    formatNumber(num) {
        if (num >= 1) {
            return num.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 6
            });
        } else {
            return num.toFixed(8);
        }
    }

    formatLargeNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        } else {
            return num.toFixed(2);
        }
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }
}

// تشغيل التطبيق
document.addEventListener('DOMContentLoaded', () => {
    window.cryptoApp = new CryptoPatternApp();
});

// تنظيف الموارد عند إغلاق الصفحة
window.addEventListener('beforeunload', () => {
    if (window.cryptoApp) {
        window.cryptoApp.destroy();
    }
});


