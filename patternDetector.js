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
class TechnicalIndicators {
    // RSI - مؤشر القوة النسبية
    static calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = [];
        let losses = [];
        
        for (let i = 1; i < prices.length; i++) {
            const change = prices[i] - prices[i - 1];
            gains.push(change > 0 ? change : 0);
            losses.push(change < 0 ? Math.abs(change) : 0);
        }
        
        let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
        let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;
        
        const rsiValues = [];
        
        for (let i = period; i < gains.length; i++) {
            if (avgLoss === 0) {
                rsiValues.push(100);
            } else {
                const rs = avgGain / avgLoss;
                const rsi = 100 - (100 / (1 + rs));
                rsiValues.push(rsi);
            }
            
            // تحديث المتوسطات
            avgGain = (avgGain * (period - 1) + gains[i]) / period;
            avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        }
        
        return rsiValues;
    }

    // MACD - مؤشر تقارب وتباعد المتوسطات
    static calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        const fastEMA = this.calculateEMA(prices, fastPeriod);
        const slowEMA = this.calculateEMA(prices, slowPeriod);
        
        if (!fastEMA || !slowEMA) return null;
        
        const macdLine = [];
        const startIndex = Math.max(fastEMA.startIndex, slowEMA.startIndex);
        
        for (let i = 0; i < Math.min(fastEMA.values.length, slowEMA.values.length); i++) {
            macdLine.push(fastEMA.values[i] - slowEMA.values[i]);
        }
        
        const signalLine = this.calculateEMA(macdLine, signalPeriod);
        const histogram = [];
        
        if (signalLine) {
            for (let i = 0; i < signalLine.values.length; i++) {
                histogram.push(macdLine[i + signalLine.startIndex] - signalLine.values[i]);
            }
        }
        
        return {
            macd: macdLine,
            signal: signalLine ? signalLine.values : [],
            histogram: histogram,
            startIndex: startIndex
        };
    }

    // EMA - المتوسط المتحرك الأسي
    static calculateEMA(prices, period) {
        if (prices.length < period) return null;
        
        const multiplier = 2 / (period + 1);
        const emaValues = [];
        
        // أول قيمة EMA = SMA
        let ema = prices.slice(0, period).reduce((a, b) => a + b) / period;
        emaValues.push(ema);
        
        for (let i = period; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
            emaValues.push(ema);
        }
        
        return {
            values: emaValues,
            startIndex: period - 1
        };
    }

    // SMA - المتوسط المتحرك البسيط
    static calculateSMA(prices, period) {
        if (prices.length < period) return null;
        
        const smaValues = [];
        for (let i = period - 1; i < prices.length; i++) {
            const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
            smaValues.push(sum / period);
        }
        
        return {
            values: smaValues,
            startIndex: period - 1
        };
    }

    // Bollinger Bands - نطاقات بولينجر
    static calculateBollingerBands(prices, period = 20, stdDev = 2) {
        const sma = this.calculateSMA(prices, period);
        if (!sma) return null;
        
        const upperBand = [];
        const lowerBand = [];
        
        for (let i = 0; i < sma.values.length; i++) {
            const dataIndex = i + sma.startIndex;
            const slice = prices.slice(dataIndex - period + 1, dataIndex + 1);
            
            // حساب الانحراف المعياري
            const mean = sma.values[i];
            const variance = slice.reduce((sum, price) => sum + Math.pow(price - mean, 2), 0) / period;
            const standardDeviation = Math.sqrt(variance);
            
            upperBand.push(mean + (standardDeviation * stdDev));
            lowerBand.push(mean - (standardDeviation * stdDev));
        }
        
        return {
            middle: sma.values,
            upper: upperBand,
            lower: lowerBand,
            startIndex: sma.startIndex
        };
    }

    // Stochastic Oscillator - مذبذب ستوكاستيك
    static calculateStochastic(highs, lows, closes, kPeriod = 14, dPeriod = 3) {
        if (highs.length < kPeriod) return null;
        
        const kValues = [];
        
        for (let i = kPeriod - 1; i < closes.length; i++) {
            const highestHigh = Math.max(...highs.slice(i - kPeriod + 1, i + 1));
            const lowestLow = Math.min(...lows.slice(i - kPeriod + 1, i + 1));
            
            const k = ((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100;
            kValues.push(k);
        }
        
        const dValues = this.calculateSMA(kValues, dPeriod);
        
        return {
            k: kValues,
            d: dValues ? dValues.values : [],
            startIndex: kPeriod - 1
        };
    }

    // Volume Analysis - تحليل الأحجام
    static analyzeVolume(volumes, prices, period = 20) {
        const avgVolume = this.calculateSMA(volumes, period);
        if (!avgVolume) return null;
        
        const volumeAnalysis = [];
        
        for (let i = avgVolume.startIndex; i < volumes.length; i++) {
            const currentVolume = volumes[i];
            const avgVol = avgVolume.values[i - avgVolume.startIndex];
            const volumeRatio = currentVolume / avgVol;
            
            let signal = 'normal';
            if (volumeRatio > 2) signal = 'very_high';
            else if (volumeRatio > 1.5) signal = 'high';
            else if (volumeRatio < 0.5) signal = 'low';
            
            volumeAnalysis.push({
                volume: currentVolume,
                avgVolume: avgVol,
                ratio: volumeRatio,
                signal: signal
            });
        }
        
        return volumeAnalysis;
    }

    // OBV - On Balance Volume
    static calculateOBV(closes, volumes) {
        const obv = [volumes[0]];
        
        for (let i = 1; i < closes.length; i++) {
            if (closes[i] > closes[i - 1]) {
                obv.push(obv[i - 1] + volumes[i]);
            } else if (closes[i] < closes[i - 1]) {
                obv.push(obv[i - 1] - volumes[i]);
            } else {
                obv.push(obv[i - 1]);
            }
        }
        
        return obv;
    }
}
class PatternDetector {
    constructor() {
        this.patterns = [
            'doubleTop', 'doubleBottom', 'tripleTop', 'tripleBottom',
            'headAndShoulders', 'invertedHeadAndShoulders',
            'symmetricalTriangle', 'ascendingTriangle', 'descendingTriangle',
            'risingWedge', 'fallingWedge', 'flag', 'pennant',
            'cup', 'rectangle', 'diamond', 'roundingBottom'
        ];
    }

    async detectPatterns(data, timeframe = '1h') {
        if (!data || data.length < 50) return null;

        // حساب المؤشرات الفنية
        const indicators = this.calculateIndicators(data);
        
        // تحليل الأحجام
        const volumeAnalysis = this.analyzeVolumePattern(data);
        
        // اكتشاف الأنماط مع التأكيد
        for (const patternName of this.patterns) {
            const pattern = await this[`detect${this.capitalize(patternName)}`](data);
            
            if (pattern) {
                // إضافة تأكيد المؤشرات
                pattern.confirmation = this.confirmPattern(pattern, indicators, volumeAnalysis);
                pattern.timeframe = timeframe;
                pattern.indicators = indicators;
                pattern.volumeAnalysis = volumeAnalysis;
                
                // تحديث مستوى الثقة بناءً على التأكيد
                pattern.confidence = this.adjustConfidenceWithIndicators(pattern);
                
                return pattern;
            }
        }
        
        return null;
    }

    calculateIndicators(data) {
        const closes = data.map(d => d.close);
        const highs = data.map(d => d.high);
        const lows = data.map(d => d.low);
        const volumes = data.map(d => d.volume);

        return {
            rsi: TechnicalIndicators.calculateRSI(closes),
            macd: TechnicalIndicators.calculateMACD(closes),
            bollinger: TechnicalIndicators.calculateBollingerBands(closes),
            stochastic: TechnicalIndicators.calculateStochastic(highs, lows, closes),
            sma20: TechnicalIndicators.calculateSMA(closes, 20),
            sma50: TechnicalIndicators.calculateSMA(closes, 50),
            ema12: TechnicalIndicators.calculateEMA(closes, 12),
            ema26: TechnicalIndicators.calculateEMA(closes, 26),
            volumeAnalysis: TechnicalIndicators.analyzeVolume(volumes, closes),
            obv: TechnicalIndicators.calculateOBV(closes, volumes)
        };
    }

    confirmPattern(pattern, indicators, volumeAnalysis) {
        const confirmations = [];
        const currentIndex = indicators.rsi ? indicators.rsi.length - 1 : -1;
        
        if (currentIndex < 0) return { score: 0, signals: [] };

        // تأكيد RSI
        if (indicators.rsi) {
            const rsi = indicators.rsi[currentIndex];
            if (pattern.type === 'bullish' && rsi < 30) {
                confirmations.push({ type: 'RSI', signal: 'oversold_bullish', strength: 0.8 });
            } else if (pattern.type === 'bearish' && rsi > 70) {
                confirmations.push({ type: 'RSI', signal: 'overbought_bearish', strength: 0.8 });
            }
        }

        // تأكيد MACD
        if (indicators.macd && indicators.macd.histogram.length > 1) {
            const currentHist = indicators.macd.histogram[indicators.macd.histogram.length - 1];
            const prevHist = indicators.macd.histogram[indicators.macd.histogram.length - 2];
            
            if (pattern.type === 'bullish' && currentHist > prevHist && currentHist > 0) {
                confirmations.push({ type: 'MACD', signal: 'bullish_crossover', strength: 0.7 });
            } else if (pattern.type === 'bearish' && currentHist < prevHist && currentHist < 0) {
                confirmations.push({ type: 'MACD', signal: 'bearish_crossover', strength: 0.7 });
            }
        }

        // تأكيد Bollinger Bands
        if (indicators.bollinger) {
            const currentPrice = pattern.entry;
            const upper = indicators.bollinger.upper[indicators.bollinger.upper.length - 1];
            const lower = indicators.bollinger.lower[indicators.bollinger.lower.length - 1];
            
            if (pattern.type === 'bullish' && currentPrice <= lower) {
                confirmations.push({ type: 'Bollinger', signal: 'oversold_bounce', strength: 0.6 });
            } else if (pattern.type === 'bearish' && currentPrice >= upper) {
                confirmations.push({ type: 'Bollinger', signal: 'overbought_rejection', strength: 0.6 });
            }
        }

        // تأكيد الحجم
        if (volumeAnalysis.breakoutVolume) {
            if (volumeAnalysis.breakoutVolume.signal === 'high' || volumeAnalysis.breakoutVolume.signal === 'very_high') {
                confirmations.push({ type: 'Volume', signal: 'high_volume_breakout', strength: 0.9 });
            }
        }

        const totalStrength = confirmations.reduce((sum, conf) => sum + conf.strength, 0);
        const maxPossibleStrength = 3.0; // RSI + MACD + Volume
        const score = Math.min(totalStrength / maxPossibleStrength, 1.0);

        return {
            score: score,
            signals: confirmations,
            strength: score > 0.7 ? 'strong' : score > 0.4 ? 'moderate' : 'weak'
        };
    }

    analyzeVolumePattern(data) {
        const volumes = data.map(d => d.volume);
        const avgVolume = volumes.slice(-20).reduce((a, b) => a + b) / 20;
        const currentVolume = volumes[volumes.length - 1];
        const volumeRatio = currentVolume / avgVolume;

        // تحليل حجم الاختراق
        const breakoutVolume = {
            current: currentVolume,
            average: avgVolume,
            ratio: volumeRatio,
            signal: volumeRatio > 2 ? 'very_high' : volumeRatio > 1.5 ? 'high' : 'normal'
        };

        // تحليل اتجاه الحجم
        const volumeTrend = this.calculateVolumeTrend(volumes.slice(-10));

        return {
            breakoutVolume,
            volumeTrend,
            obvTrend: this.calculateOBVTrend(data.slice(-20))
        };
    }

    adjustConfidenceWithIndicators(pattern) {
        let adjustedConfidence = pattern.confidence;
        
        if (pattern.confirmation) {
            const confirmationBonus = pattern.confirmation.score * 20; // حتى 20 نقطة إضافية
            adjustedConfidence = Math.min(adjustedConfidence + confirmationBonus, 95);
        }

        return adjustedConfidence;
    }

    // باقي الدوال المساعدة...
    calculateVolumeTrend(volumes) {
        if (volumes.length < 5) return 'neutral';
        
        const firstHalf = volumes.slice(0, Math.floor(volumes.length / 2));
        const secondHalf = volumes.slice(Math.floor(volumes.length / 2));
        
        const firstAvg = firstHalf.reduce((a, b) => a + b) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b) / secondHalf.length;
        
        const change = (secondAvg - firstAvg) / firstAvg;
        
        if (change > 0.2) return 'increasing';
        if (change < -0.2) return 'decreasing';
        return 'neutral';
    }

    calculateOBVTrend(data) {
        const closes = data.map(d => d.close);
        const volumes = data.map(d => d.volume);
        const obv = TechnicalIndicators.calculateOBV(closes, volumes);
        
        if (obv.length < 10) return 'neutral';
        
        const recent = obv.slice(-5);
        const older = obv.slice(-10, -5);
        
        const recentAvg = recent.reduce((a, b) => a + b) / recent.length;
        const olderAvg = older.reduce((a, b) => a + b) / older.length;
        
        return recentAvg > olderAvg ? 'bullish' : 'bearish';
    }

    capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}
class TimeframeManager {
    constructor() {
        this.timeframes = {
            '15m': { interval: '15m', limit: 100, name: '15 دقيقة' },
            '1h': { interval: '1h', limit: 100, name: 'ساعة' },
            '4h': { interval: '4h', limit: 100, name: '4 ساعات' },
            '1d': { interval: '1d', limit: 100, name: 'يوم' },
            '1w': { interval: '1w', limit: 52, name: 'أسبوع' }
        };
        this.currentTimeframe = '1h';
    }

    async getCandleDataMultiTimeframe(symbol) {
        const results = {};
        
        for (const [key, config] of Object.entries(this.timeframes)) {
            try {
                const response = await fetch(
                    `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${config.interval}&limit=${config.limit}`
                );
                const data = await response.json();
                
                results[key] = data.map((candle, index) => ({
                    timestamp: candle[0],
                    open: parseFloat(candle[1]),
                    high: parseFloat(candle[2]),
                    low: parseFloat(candle[3]),
                    close: parseFloat(candle[4]),
                    volume: parseFloat(candle[5]),
                    index: index
                }));
            } catch (error) {
                console.warn(`خطأ في الحصول على بيانات ${key} لـ ${symbol}:`, error);
                results[key] = null;
            }
        }
        
        return results;
    }

    async analyzeMultiTimeframe(symbol) {
        const timeframeData = await this.getCandleDataMultiTimeframe(symbol);
        const patternDetector = new PatternDetector();
        const analysis = {};

        for (const [timeframe, data] of Object.entries(timeframeData)) {
            if (data && data.length > 50) {
                analysis[timeframe] = await patternDetector.detectPatterns(data, timeframe);
            }
        }

        return {
            symbol,
            timeframes: analysis,
            consensus: this.calculateConsensus(analysis),
            strength: this.calculateOverallStrength(analysis)
        };
    }

    calculateConsensus(analysis) {
        const signals = Object.values(analysis).filter(a => a && a.pattern);
        if (signals.length === 0) return 'neutral';

        const bullish = signals.filter(s => s.type === 'bullish').length;
        const bearish = signals.filter(s => s.type === 'bearish').length;

        if (bullish > bearish) return 'bullish';
        if (bearish > bullish) return 'bearish';
        return 'mixed';
    }

    calculateOverallStrength(analysis) {
        const validAnalysis = Object.values(analysis).filter(a => a && a.confidence);
        if (validAnalysis.length === 0) return 0;

        const avgConfidence = validAnalysis.reduce((sum, a) => sum + a.confidence, 0) / validAnalysis.length;
        const confirmationBonus = validAnalysis.filter(a => a.confirmation && a.confirmation.score > 0.5).length * 10;

        return Math.min(avgConfidence + confirmationBonus, 100);
    }
}

class CryptoPatternApp {
    constructor() {
        this.patternDetector = new PatternDetector();
        this.timeframeManager = new TimeframeManager();
        this.cryptoData = new Map();
        this.currentTimeframe = '1h';
        
        this.init();
    }

    async loadCryptoData() {
        try {
            // ... الكود السابق ...

            const promises = usdtPairs.map(async (symbol) => {
                try {
                    const [tickerData, multiTimeframeAnalysis] = await Promise.all([
                        this.getPriceData(symbol, priceData),
                        this.timeframeManager.analyzeMultiTimeframe(symbol)
                    ]);

                    if (tickerData && multiTimeframeAnalysis) {
                        this.cryptoData.set(symbol, {
                            symbol: symbol,
                            name: symbol.replace('USDT', ''),
                            price: parseFloat(tickerData.lastPrice),
                            change: parseFloat(tickerData.priceChangePercent),
                            volume: parseFloat(tickerData.volume),
                            quoteVolume: parseFloat(tickerData.quoteVolume),
                            multiTimeframeAnalysis: multiTimeframeAnal
class CryptoPatternApp {
    constructor() {
        this.patternDetector = new PatternDetector();
        this.timeframeManager = new TimeframeManager();
        this.cryptoData = new Map();
        this.currentTimeframe = '1h';
        this.selectedTimeframes = ['15m', '1h', '4h', '1d']; // الفواصل المختارة
        
        this.init();
    }

    async loadCryptoData() {
        try {
            this.showLoading(true);
            
            // الحصول على بيانات الأسعار
            const [priceResponse, exchangeInfoResponse] = await Promise.all([
                fetch('https://api.binance.com/api/v3/ticker/24hr'),
                fetch('https://api.binance.com/api/v3/exchangeInfo')
            ]);

            const [priceData, exchangeInfo] = await Promise.all([
                priceResponse.json(),
                exchangeInfoResponse.json()
            ]);

            // فلترة العملات
            const usdtPairs = exchangeInfo.symbols
                .filter(symbol => 
                    symbol.symbol.endsWith('USDT') && 
                    symbol.status === 'TRADING' &&
                    !this.isStablecoin(symbol.symbol)
                )
                .map(symbol => symbol.symbol)
                .slice(0, 50); // تقليل العدد لتسريع التحميل

            this.cryptoData.clear();

            // معالجة البيانات بشكل متوازي مع حد أقصى
            const batchSize = 5;
            for (let i = 0; i < usdtPairs.length; i += batchSize) {
                const batch = usdtPairs.slice(i, i + batchSize);
                const promises = batch.map(async (symbol) => {
                    try {
                        const tickerData = this.getPriceData(symbol, priceData);
                        if (!tickerData) return null;

                        // تحليل الإطار الزمني الحالي فقط أولاً
                        const currentTimeframeData = await this.timeframeManager.getCandleData(symbol, this.currentTimeframe);
                        let pattern = null;
                        let indicators = null;

                        if (currentTimeframeData && currentTimeframeData.length > 50) {
                            pattern = await this.patternDetector.detectPatterns(currentTimeframeData, this.currentTimeframe);
                            if (pattern) {
                                indicators = pattern.indicators;
                            }
                        }

                        return {
                            symbol: symbol,
                            name: symbol.replace('USDT', ''),
                            price: parseFloat(tickerData.lastPrice),
                            change: parseFloat(tickerData.priceChangePercent),
                            volume: parseFloat(tickerData.volume),
                            quoteVolume: parseFloat(tickerData.quoteVolume),
                            pattern: pattern,
                            indicators: indicators,
                            lastUpdate: Date.now()
                        };
                    } catch (error) {
                        console.warn(`خطأ في معالجة ${symbol}:`, error);
                        return null;
                    }
                });

                const results = await Promise.all(promises);
                results.forEach(result => {
                    if (result) {
                        this.cryptoData.set(result.symbol, result);
                    }
                });

                // تحديث التقدم
                this.updateProgress(Math.min((i + batchSize) / usdtPairs.length * 100, 100));
            }

            this.isConnected = true;
            this.updateConnectionStatus();
            this.filterData();
            this.startRealTimeUpdates();

        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
            this.isConnected = false;
            this.updateConnectionStatus();
        } finally {
            this.showLoading(false);
        }
    }

    // تحليل متعدد الأطر الزمنية عند الطلب
    async loadMultiTimeframeAnalysis(symbol) {
        try {
            const analysis = await this.timeframeManager.analyzeMultiTimeframe(symbol);
            const crypto = this.cryptoData.get(symbol);
            if (crypto) {
                crypto.multiTimeframeAnalysis = analysis;
                this.cryptoData.set(symbol, crypto);
            }
            return analysis;
        } catch (error) {
            console.error(`خطأ في التحليل متعدد الأطر لـ ${symbol}:`, error);
            return null;
        }
    }

    renderCryptoGrid() {
        const grid = document.getElementById('cryptoGrid');
        const filteredData = Array.from(this.cryptoData.values());

        if (filteredData.length === 0) {
            grid.innerHTML = '<div class="no-results">لا توجد نتائج مطابقة للفلترة</div>';
            return;
        }

        grid.innerHTML = filteredData.map(crypto => `
            <div class="crypto-card ${crypto.pattern ? 'has-pattern' : ''}" 
                 onclick="cryptoApp.showPatternDetails('${crypto.symbol}')">
                
                <div class="card-header">
                    <div class="coin-info">
                        <div class="coin-logo">${crypto.name.substring(0, 3)}</div>
                        <div class="coin-details">
                            <h3>${crypto.name}</h3>
                            <span class="symbol">${crypto.symbol}</span>
                        </div>
                    </div>
                    <div class="timeframe-indicator">
                        <span class="current-tf">${this.timeframeManager.timeframes[this.currentTimeframe].name}</span>
                    </div>
                </div>

                <div class="price-section">
                    <div class="current-price">$${this.formatNumber(crypto.price)}</div>
                    <div class="price-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
                        ${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%
                    </div>
                </div>

                ${crypto.pattern ? `
                    <div class="pattern-section">
                        <div class="pattern-badge ${crypto.pattern.type}">
                            ${this.getPatternIcon(crypto.pattern.type)} ${crypto.pattern.name}
                        </div>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${crypto.pattern.confidence}%"></div>
                            <span class="confidence-text">${crypto.pattern.confidence.toFixed(0)}%</span>
                        </div>
                        ${crypto.pattern.confirmation ? `
                            <div class="confirmation-badges">
                                ${crypto.pattern.confirmation.signals.map(signal => `
                                    <span class="indicator-badge ${signal.type.toLowerCase()}">
                                        ${signal.type}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-pattern">
                        <span>لا يوجد نموذج واضح</span>
                    </div>
                `}

                ${crypto.indicators ? `
                    <div class="indicators-preview">
                        ${crypto.indicators.rsi ? `
                            <div class="indicator-item">
                                <span class="indicator-label">RSI:</span>
                                <span class="indicator-value ${this.getRSIClass(crypto.indicators.rsi[crypto.indicators.rsi.length - 1])}">
                                    ${crypto.indicators.rsi[crypto.indicators.rsi.length - 1].toFixed(1)}
                                </span>
                            </div>
                        ` : ''}
                        
                        ${crypto.indicators.macd ? `
                            <div class="indicator-item">
                                <span class="indicator-label">MACD:</span>
                                <span class="indicator-value ${this.getMACDClass(crypto.indicators.macd)}">
                                    ${crypto.indicators.macd.histogram[crypto.indicators.macd.histogram.length - 1] > 0 ? '📈' : '📉'}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="volume-section">
                    <div class="volume-info">
                        <span class="volume-label">الحجم:</span>
                        <span class="volume-value">${this.formatLargeNumber(crypto.volume)}</span>
                    </div>
                    ${crypto.pattern && crypto.pattern.volumeAnalysis ? `
                        <div class="volume-signal ${crypto.pattern.volumeAnalysis.breakoutVolume.signal}">
                            ${this.getVolumeIcon(crypto.pattern.volumeAnalysis.breakoutVolume.signal)}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    async showPatternDetails(symbol) {
        const crypto = this.cryptoData.get(symbol);
        if (!crypto) return;

        // تحميل التحليل متعدد الأطر إذا لم يكن متوفراً
        if (!crypto.multiTimeframeAnalysis) {
            this.showLoadingModal(true);
            await this.loadMultiTimeframeAnalysis(symbol);
            this.showLoadingModal(false);
        }

        const modal = document.getElementById('patternModal');
        const modalBody = document.querySelector('.modal-body');

        modalBody.innerHTML = `
            <div class="pattern-details">
                <div class="details-header">
                    <h2>${crypto.name} - تحليل شامل</h2>
                    <div class="timeframe-tabs">
                        ${Object.keys(this.timeframeManager.timeframes).map(tf => `
                            <button class="tf-tab ${tf === this.currentTimeframe ? 'active' : ''}" 
                                    onclick="cryptoApp.switchTimeframe('${tf}', '${symbol}')">
                                ${this.timeframeManager.timeframes[tf].name}
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="analysis-content">
                    ${this.renderCurrentTimeframeAnalysis(crypto)}
                    ${crypto.multiTimeframeAnalysis ? this.renderMultiTimeframeAnalysis(crypto.multiTimeframeAnalysis) : ''}
                    ${this.renderIndicatorsAnalysis(crypto.indicators)}
                    ${this.renderVolumeAnalysis(crypto.pattern?.volumeAnalysis)}
                    ${this.renderTradingRecommendations(crypto)}
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    renderCurrentTimeframeAnalysis(crypto) {
        if (!crypto.pattern) {
            return `
                <div class="info-card">
                    <h4>📊 التحليل الحالي - ${this.timeframeManager.timeframes[this.currentTimeframe].name}</h4>
                    <p>لا يوجد نموذج فني واضح في الإطار الزمني الحالي</p>
                </div>
            `;
        }

        return `
            <div class="info-card pattern-analysis">
                <h4>📊 تحليل النموذج - ${this.timeframeManager.timeframes[this.currentTimeframe].name}</h4>
                
                <div class="pattern-overview">
                    <div class="pattern-header">
                        <span class="pattern-name">${crypto.pattern.name}</span>
                        <span class="pattern-type ${crypto.pattern.type}">${this.getPatternTypeText(crypto.pattern.type)}</span>
                    </div>
                    
                    <div class="confidence-section">
                        <div class="confidence-bar-large">
                            <div class="confidence-fill" style="width: ${crypto.pattern.confidence}%"></div>
                        </div>
                        <span class="confidence-percentage">${crypto.pattern.confidence.toFixed(1)}%</span>
                    </div>
                </div>

                <div class="pattern-levels">
                    <div class="level-item">
                        <span class="level-label">نقطة الدخول:</span>
                        <span class="level-value">$${this.formatNumber(crypto.pattern.entry)}</span>
                    </div>
                    <div class="level-item">
                        <span class="level-label">الهدف الأول:</span>
                        <span class="level-value target">$${this.formatNumber(crypto.pattern.target)}</span>
                    </div>
                    ${crypto.pattern.target2 ? `
                        <div class="level-item">
                            <span class="level-label">الهدف الثاني:</span>
                            <span class="level-value target">$${this.formatNumber(crypto.pattern.target2)}</span>
                        </div>
                    ` : ''}
                    <div class="level-item">
                        <span class="level-label">وقف الخسارة:</span>
                        <span class="level-value stop-loss">$${this.formatNumber(crypto.pattern.stopLoss)}</span>
                    </div>
                </div>

                ${crypto.pattern.confirmation ? `
                    <div class="confirmation-section">
                        <h5>🎯 تأكيد المؤشرات (${crypto.pattern.confirmation.strength})</h5>
                        <div class="confirmation-grid">
                            ${crypto.pattern.confirmation.signals.map(signal => `
                                <div class="confirmation-item">
                                    <span class="indicator-name">${signal.type}</span>
                                    <span class="signal-strength" style="width: ${signal.strength * 100}%"></span>
                                    <span class="signal-text">${this.getSignalText(signal.signal)}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
    }

    renderMultiTimeframeAnalysis(analysis) {
        if (!analysis || !analysis.timeframes) return '';

        return `
            <div class="info-card multi-timeframe">
                <h4>⏰ التحليل متعدد الأطر الزمنية</h4>
                
                <div class="consensus-section">
                    <div class="consensus-indicator ${analysis.consensus}">
                        <span class="consensus-label">الإجماع العام:</span>
                        <span class="consensus-value">${this.getConsensusText(analysis.consensus)}</span>
                    </div>
                    <div class="overall-strength">
                        <span class="strength-label">القوة الإجمالية:</span>
                        <div class="strength-bar">
                            <div class="strength-fill" style="width: ${analysis.strength}%"></div>
                        </div>
                        <span class="strength-value">${analysis.strength.toFixed(0)}%</span>
                    </div>
                </div>

                <div class="timeframes-grid">
                    ${Object.entries(analysis.timeframes).map(([tf, tfAnalysis]) => `
                        <div class="timeframe-card ${tfAnalysis ? 'has-pattern' : 'no-pattern'}">
                            <div class="tf-header">
                                <span class="tf-name">${this.timeframeManager.timeframes[tf].name}</span>
                                ${tfAnalysis ? `<span class="tf-type ${tfAnalysis.type}">${this.getPatternTypeText(tfAnalysis.type)}</span>` : ''}
                            </div>
                            ${tfAnalysis ? `
                                <div class="tf-details">
                                    <div class="tf-pattern">${tfAnalysis.name}</div>
                                    <div class="tf-confidence">${tfAnalysis.confidence.toFixed(0)}%</div>
                                </div>
                            ` : '<div class="tf-no-pattern">لا يوجد نموذج</div>'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    renderIndicatorsAnalysis(indicators) {
        if (!indicators) return '';

        const currentIndex = indicators.rsi ? indicators.rsi.length - 1 : -1;
        if (currentIndex < 0) return '';

        return `
            <div class="info-card indicators-analysis">
                <h4>📈 تحليل المؤشرات الفنية</h4>
                
                <div class="indicators-grid">
                    ${indicators.rsi ? `
                        <div class="indicator-card">
                            <div class="indicator-header">
                                <span class="indicator-name">RSI</span>
                                <span class="indicator-value ${this.getRSIClass(indicators.rsi[currentIndex])}">
                                    ${indicators.rsi[currentIndex].toFixed(1)}
                                </span>
                            </div>
                            <div class="indicator-bar">
                                <div class="rsi-zones">
                                    <div class="oversold-zone"></div>
                                    <div class="neutral-zone"></div>
                                    <div class="overbought-zone"></div>
                                </div>
                                <div class="rsi-pointer" style="left: ${indicators.rsi[currentIndex]}%"></div>
                            </div>
                            <div class="indicator-signal">${this.getRSISignal(indicators.rsi[currentIndex])}</div>
                        </div>
                    ` : ''}

                    ${indicators.macd ? `
                        <div class="indicator-card">
                            <div class="indicator-header">
                                <span class="indicator-name">MACD</span>
                                <span class="indicator-value ${this.getMACDClass(indicators.macd)}">
                                    ${indicators.macd.histogram[indicators.macd.histogram.length - 1].toFixed(4)}
                                </span>
                            </div>
                            <div class="macd-chart">
                                ${this.renderMACDMiniChart(indicators.macd)}
                            </div>
                            <div class="indicator-signal">${this.getMACDSignal(indicators.macd)}</div>
                        </div>
                    ` : ''}

                    ${indicators.bollinger ? `
                        <div class="indicator-card">
                            <div class="indicator-header">
                                <span class="indicator-name">Bollinger Bands</span>
                            </div>
                            <div class="bollinger-info">
                                <div class="bb-level">العلوي: $${this.formatNumber(indicators.bollinger.upper[indicators.bollinger.upper.length - 1])}</div>
                                <div class="bb-level">الوسط: $${this.formatNumber(indicators.bollinger.middle[indicators.bollinger.middle.length - 1])}</div>
                                <div class="bb-level">السفلي: $${this.formatNumber(indicators.bollinger.lower[indicators.bollinger.lower.length - 1])}</div>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    renderVolumeAnalysis(volumeAnalysis) {
        if (!volumeAnalysis) return '';

        return `
            <div class="info-card volume-analysis">
                <h4>📊 تحليل الأحجام</h4>
                
                <div class="volume-metrics">
                    <div class="volume-metric">
                        <span class="metric-label">الحجم الحالي:</span>
                        <span class="metric-value">${this.formatLargeNumber(volumeAnalysis.breakoutVolume.current)}</span>
                    </div>
                    <div class="volume-metric">
                        <span class="metric-label">المتوسط:</span>
                        <span class="metric-value">${this.formatLargeNumber(volumeAnalysis.breakoutVolume.average)}</span>
                    </div>
                    <div class="volume-metric">
                        <span class="metric-label">النسبة:</span>
                        <span class="metric-value ${volumeAnalysis.breakoutVolume.signal}">
                            ${volumeAnalysis.breakoutVolume.ratio.toFixed(2)}x
                        </span>
                    </div>
                </div>

                <div class="volume-signals">
                    <div class="volume-signal-item">
                        <span class="signal-label">إشارة الحجم:</span>
                        <span class="signal-badge ${volumeAnalysis.breakoutVolume.signal}">
                            ${this.getVolumeSignalText(volumeAnalysis.breakoutVolume.signal)}
                        </span>
                    </div>
                    <div class="volume-signal-item">
                        <span class="signal-label">اتجاه الحجم:</span>
                        <span class="signal-badge ${volumeAnalysis.volumeTrend}">
                            ${this.getVolumeTrendText(volumeAnalysis.volumeTrend)}
                        </span>
                    </div>
                    <div class="volume-signal-item">
                        <span class="signal-label">OBV:</span>
                        <span class="signal-badge ${volumeAnalysis.obvTrend}">
                            ${this.getOBVTrendText(volumeAnalysis.obvTrend)}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }

    // دوال مساعدة للحصول على النصوص والأيقونات
    getPatternIcon(type) {
        const icons = {
            'bullish': '📈',
            'bearish': '📉',
            'continuation': '➡️'
        };
        return icons[type] || '📊';
    }

    getRSIClass(rsi) {
        if (rsi > 70) return 'overbought';
        if (rsi < 30) return 'oversold';
        return 'neutral';
    }

       getRSISignal(rsi) {
        if (rsi > 80) return 'مُشبع شراء قوي';
        if (rsi > 70) return 'مُشبع شراء';
        if (rsi < 20) return 'مُشبع بيع قوي';
        if (rsi < 30) return 'مُشبع بيع';
        return 'منطقة محايدة';
    }

    getMACDClass(macd) {
        const current = macd.histogram[macd.histogram.length - 1];
        return current > 0 ? 'bullish' : 'bearish';
    }

    getMACDSignal(macd) {
        const current = macd.histogram[macd.histogram.length - 1];
        const previous = macd.histogram[macd.histogram.length - 2];
        
        if (current > previous && current > 0) return 'إشارة صعودية قوية';
        if (current > previous && current < 0) return 'تحسن الزخم';
        if (current < previous && current > 0) return 'ضعف الزخم الصعودي';
        if (current < previous && current < 0) return 'إشارة هبوطية قوية';
        return 'زخم محايد';
    }

    getVolumeIcon(signal) {
        const icons = {
            'very_high': '🔥',
            'high': '📈',
            'normal': '📊',
            'low': '📉'
        };
        return icons[signal] || '📊';
    }

    getVolumeSignalText(signal) {
        const texts = {
            'very_high': 'حجم عالي جداً',
            'high': 'حجم عالي',
            'normal': 'حجم طبيعي',
            'low': 'حجم منخفض'
        };
        return texts[signal] || 'غير محدد';
    }

    getVolumeTrendText(trend) {
        const texts = {
            'increasing': 'متزايد',
            'decreasing': 'متناقص',
            'neutral': 'مستقر'
        };
        return texts[trend] || 'غير محدد';
    }

    getOBVTrendText(trend) {
        const texts = {
            'bullish': 'صعودي',
            'bearish': 'هبوطي',
            'neutral': 'محايد'
        };
        return texts[trend] || 'غير محدد';
    }

    getPatternTypeText(type) {
        const texts = {
            'bullish': 'صعودي',
            'bearish': 'هبوطي',
            'continuation': 'استمراري'
        };
        return texts[type] || type;
    }

    getConsensusText(consensus) {
        const texts = {
            'bullish': 'صعودي',
            'bearish': 'هبوطي',
            'mixed': 'متضارب',
            'neutral': 'محايد'
        };
        return texts[consensus] || consensus;
    }

    getSignalText(signal) {
        const texts = {
            'oversold_bullish': 'مُشبع بيع - فرصة شراء',
            'overbought_bearish': 'مُشبع شراء - فرصة بيع',
            'bullish_crossover': 'تقاطع صعودي',
            'bearish_crossover': 'تقاطع هبوطي',
            'oversold_bounce': 'ارتداد من المنطقة المُشبعة',
            'overbought_rejection': 'رفض من المنطقة المُشبعة',
            'high_volume_breakout': 'اختراق بحجم عالي'
        };
        return texts[signal] || signal;
    }

    renderMACDMiniChart(macd) {
        const lastValues = macd.histogram.slice(-10);
        const max = Math.max(...lastValues.map(Math.abs));
        
        return `
            <div class="macd-mini-chart">
                ${lastValues.map((value, index) => `
                    <div class="macd-bar ${value > 0 ? 'positive' : 'negative'}" 
                         style="height: ${Math.abs(value) / max * 30}px">
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderTradingRecommendations(crypto) {
        if (!crypto.pattern) return '';

        const riskReward = crypto.pattern.target && crypto.pattern.stopLoss ? 
            ((crypto.pattern.target - crypto.pattern.entry) / (crypto.pattern.entry - crypto.pattern.stopLoss)).toFixed(2) : 'غير محدد';

        return `
            <div class="info-card trading-recommendations">
                <h4>💡 التوصيات والمخاطر</h4>
                
                <div class="recommendation-section">
                    <div class="risk-reward">
                        <div class="rr-item">
                            <span class="rr-label">نسبة المخاطرة/العائد:</span>
                            <span class="rr-value ${parseFloat(riskReward) >= 2 ? 'good' : parseFloat(riskReward) >= 1 ? 'fair' : 'poor'}">
                                1:${riskReward}
                            </span>
                        </div>
                        <div class="rr-item">
                            <span class="rr-label">مستوى المخاطرة:</span>
                            <span class="risk-level ${this.getRiskLevel(crypto.pattern.confidence)}">
                                ${this.getRiskLevelText(crypto.pattern.confidence)}
                            </span>
                        </div>
                    </div>

                    <div class="trading-plan">
                        <h5>📋 خطة التداول المقترحة:</h5>
                        <div class="plan-steps">
                            <div class="plan-step">
                                <span class="step-number">1</span>
                                <span class="step-text">انتظار تأكيد النموذج عند ${this.formatNumber(crypto.pattern.entry)}</span>
                            </div>
                            <div class="plan-step">
                                <span class="step-number">2</span>
                                <span class="step-text">وضع وقف الخسارة عند ${this.formatNumber(crypto.pattern.stopLoss)}</span>
                            </div>
                            <div class="plan-step">
                                <span class="step-number">3</span>
                                <span class="step-text">جني الأرباح التدريجي: 50% عند الهدف الأول</span>
                            </div>
                            ${crypto.pattern.target2 ? `
                                <div class="plan-step">
                                    <span class="step-number">4</span>
                                    <span class="step-text">جني الأرباح المتبقي عند الهدف الثاني</span>
                                </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="warnings">
                        <h5>⚠️ تحذيرات مهمة:</h5>
                        <ul class="warning-list">
                            <li>هذا التحليل للأغراض التعليمية فقط</li>
                            <li>تأكد من إدارة المخاطر وعدم المخاطرة بأكثر من 2% من رأس المال</li>
                            <li>راقب الأخبار والأحداث التي قد تؤثر على السوق</li>
                            <li>استخدم وقف الخسارة دائماً</li>
                            ${crypto.pattern.confidence < 70 ? '<li class="high-risk">مستوى الثقة منخفض - تداول بحذر شديد</li>' : ''}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    getRiskLevel(confidence) {
        if (confidence >= 80) return 'low';
        if (confidence >= 60) return 'medium';
        return 'high';
    }

    getRiskLevelText(confidence) {
        if (confidence >= 80) return 'منخفض';
        if (confidence >= 60) return 'متوسط';
        return 'عالي';
    }

    // تبديل الإطار الزمني
    async switchTimeframe(timeframe, symbol) {
        this.currentTimeframe = timeframe;
        
        // تحديث التبويبات
        document.querySelectorAll('.tf-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        event.target.classList.add('active');

        // إعادة تحليل العملة بالإطار الزمني الجديد
        this.showLoadingModal(true);
        
        try {
            const candleData = await this.timeframeManager.getCandleData(symbol, timeframe);
            if (candleData && candleData.length > 50) {
                const pattern = await this.patternDetector.detectPatterns(candleData, timeframe);
                
                const crypto = this.cryptoData.get(symbol);
                if (crypto) {
                    crypto.pattern = pattern;
                    crypto.indicators = pattern ? pattern.indicators : null;
                    this.cryptoData.set(symbol, crypto);
                }
            }
            
            // إعادة عرض التفاصيل
            await this.showPatternDetails(symbol);
            
        } catch (error) {
            console.error('خطأ في تبديل الإطار الزمني:', error);
            this.showError('فشل في تحميل بيانات الإطار الزمني الجديد');
        } finally {
            this.showLoadingModal(false);
        }
    }

    // إضافة دعم للفلترة حسب المؤشرات
    setupAdvancedFilters() {
        const filtersHTML = `
            <div class="advanced-filters">
                <div class="filter-section">
                    <h4>🎯 فلترة المؤشرات</h4>
                    
                    <div class="filter-group">
                        <label>RSI:</label>
                        <select id="rsiFilter">
                            <option value="">الكل</option>
                            <option value="oversold">مُشبع بيع (< 30)</option>
                            <option value="overbought">مُشبع شراء (> 70)</option>
                            <option value="neutral">محايد (30-70)</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>MACD:</label>
                        <select id="macdFilter">
                            <option value="">الكل</option>
                            <option value="bullish">صعودي</option>
                            <option value="bearish">هبوطي</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>حجم التداول:</label>
                        <select id="volumeFilter">
                            <option value="">الكل</option>
                            <option value="high">حجم عالي</option>
                            <option value="very_high">حجم عالي جداً</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>مستوى الثقة:</label>
                        <select id="confidenceFilter">
                            <option value="">الكل</option>
                            <option value="high">عالي (> 70%)</option>
                            <option value="medium">متوسط (50-70%)</option>
                            <option value="low">منخفض (< 50%)</option>
                        </select>
                    </div>
                </div>

                <div class="filter-section">
                    <h4>⏰ الأطر الزمنية</h4>
                    <div class="timeframe-filters">
                        ${Object.entries(this.timeframeManager.timeframes).map(([tf, config]) => `
                            <label class="timeframe-checkbox">
                                <input type="radio" name="timeframe" value="${tf}" ${tf === this.currentTimeframe ? 'checked' : ''}>
                                <span>${config.name}</span>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // إدراج الفلاتر في الصفحة
        const filtersContainer = document.querySelector('.filters-container');
        if (filtersContainer) {
            filtersContainer.innerHTML += filtersHTML;
        }

        // ربط أحداث الفلترة
        this.bindAdvancedFilterEvents();
    }

    bindAdvancedFilterEvents() {
        // فلتر RSI
        document.getElementById('rsiFilter')?.addEventListener('change', () => {
            this.filterData();
        });

        // فلتر MACD
        document.getElementById('macdFilter')?.addEventListener('change', () => {
            this.filterData();
        });

        // فلتر الحجم
        document.getElementById('volumeFilter')?.addEventListener('change', () => {
            this.filterData();
        });

        // فلتر مستوى الثقة
        document.getElementById('confidenceFilter')?.addEventListener('change', () => {
            this.filterData();
        });

        // فلتر الإطار الزمني
        document.querySelectorAll('input[name="timeframe"]').forEach(radio => {
            radio.addEventListener('change', async (e) => {
                if (e.target.checked) {
                    await this.changeGlobalTimeframe(e.target.value);
                }
            });
        });
    }

    async changeGlobalTimeframe(newTimeframe) {
        if (newTimeframe === this.currentTimeframe) return;

        this.currentTimeframe = newTimeframe;
        this.showLoading(true);

        try {
            // إعادة تحليل جميع العملات بالإطار الزمني الجديد
            const symbols = Array.from(this.cryptoData.keys());
            const batchSize = 5;

            for (let i = 0; i < symbols.length; i += batchSize) {
                const batch = symbols.slice(i, i + batchSize);
                const promises = batch.map(async (symbol) => {
                    try {
                        const candleData = await this.timeframeManager.getCandleData(symbol, newTimeframe);
                        if (candleData && candleData.length > 50) {
                            const pattern = await this.patternDetector.detectPatterns(candleData, newTimeframe);
                            
                            const crypto = this.cryptoData.get(symbol);
                            if (crypto) {
                                crypto.pattern = pattern;
                                crypto.indicators = pattern ? pattern.indicators : null;
                                this.cryptoData.set(symbol, crypto);
                            }
                        }
                    } catch (error) {
                        console.warn(`خطأ في تحديث ${symbol}:`, error);
                    }
                });

                await Promise.all(promises);
                this.updateProgress((i + batchSize) / symbols.length * 100);
            }

            this.filterData();
        } catch (error) {
            console.error('خطأ في تغيير الإطار الزمني:', error);
            this.showError('فشل في تحديث الإطار الزمني');
        } finally {
            this.showLoading(false);
        }
    }

    // تحديث دالة الفلترة لتشمل المؤشرات
    filterData() {
        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
        const patternFilter = document.getElementById('patternFilter')?.value || '';
        const typeFilter = document.getElementById('typeFilter')?.value || '';
        const rsiFilter = document.getElementById('rsiFilter')?.value || '';
        const macdFilter = document.getElementById('macdFilter')?.value || '';
        const volumeFilter = document.getElementById('volumeFilter')?.value || '';
        const confidenceFilter = document.getElementById('confidenceFilter')?.value || '';

        const filteredData = Array.from(this.cryptoData.values()).filter(crypto => {
            // فلتر البحث
            if (searchTerm && !crypto.name.toLowerCase().includes(searchTerm) && 
                !crypto.symbol.toLowerCase().includes(searchTerm)) {
                return false;
            }

            // فلتر النموذج
            if (patternFilter && (!crypto.pattern || crypto.pattern.pattern !== patternFilter)) {
                return false;
            }

            // فلتر النوع
            if (typeFilter && (!crypto.pattern || crypto.pattern.type !== typeFilter)) {
                return false;
            }

            // فلتر RSI
            if (rsiFilter && crypto.indicators?.rsi) {
                const rsi = crypto.indicators.rsi[crypto.indicators.rsi.length - 1];
                if (rsiFilter === 'oversold' && rsi >= 30) return false;
                if (rsiFilter === 'overbought' && rsi <= 70) return false;
                if (rsiFilter === 'neutral' && (rsi < 30 || rsi > 70)) return false;
            }

            // فلتر MACD
            if (macdFilter && crypto.indicators?.macd) {
                const macdValue = crypto.indicators.macd.histogram[crypto.indicators.macd.histogram.length - 1];
                if (macdFilter === 'bullish' && macdValue <= 0) return false;
                if (macdFilter === 'bearish' && macdValue >= 0) return false;
            }

            // فلتر الحجم
            if (volumeFilter && crypto.pattern?.volumeAnalysis) {
                const volumeSignal = crypto.pattern.volumeAnalysis.breakoutVolume.signal;
                if (volumeFilter === 'high' && volumeSignal !== 'high' && volumeSignal !== 'very_high') return false;
                if (volumeFilter === 'very_high' && volumeSignal !== 'very_high') return false;
            }

            // فلتر مستوى الثقة
            if (confidenceFilter && crypto.pattern) {
                const confidence = crypto.pattern.confidence;
                if (confidenceFilter === 'high' && confidence <= 70) return false;
                if (confidenceFilter === 'medium' && (confidence < 50 || confidence > 70)) return false;
                if (confidenceFilter === 'low' && confidence >= 50) return false;
            }

            return true;
        });

        // ترتيب النتائج
        filteredData.sort((a, b) => {
            if (a.pattern && !b.pattern) return -1;
            if (!a.pattern && b.pattern) return 1;
            if (a.pattern && b.pattern) {
                return b.pattern.confidence - a.pattern.confidence;
            }
            return b.quoteVolume - a.quoteVolume;
        });

        this.renderFilteredData(filteredData);
        this.updateResultsCount(filteredData.length);
    }

    renderFilteredData(data) {
        const grid = document.getElementById('cryptoGrid');
        
        if (data.length === 0) {
            grid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">🔍</div>
                    <h3>لا توجد نتائج</h3>
                    <p>جرب تعديل معايير البحث أو الفلترة</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = data.map(crypto => this.renderCryptoCard(crypto)).join('');
    }

    renderCryptoCard(crypto) {
        return `
            <div class="crypto-card ${crypto.pattern ? 'has-pattern' : ''}" 
                 onclick="cryptoApp.showPatternDetails('${crypto.symbol}')">
                
                <div class="card-header">
                    <div class="coin-info">
                        <div class="coin-logo">${crypto.name.substring(0, 3)}</div>
                        <div class="coin-details">
                            <h3>${crypto.name}</h3>
                            <span class="symbol">${crypto.symbol}</span>
                        </div>
                    </div>
                    <div class="timeframe-indicator">
                        <span class="current-tf">${this.timeframeManager.timeframes[this.currentTimeframe].name}</span>
                    </div>
                </div>

                <div class="price-section">
                    <div class="current-price">$${this.formatNumber(crypto.price)}</div>
                    <div class="price-change ${crypto.change >= 0 ? 'positive' : 'negative'}">
                        ${crypto.change >= 0 ? '+' : ''}${crypto.change.toFixed(2)}%
                    </div>
                </div>

                ${crypto.pattern ? `
                    <div class="pattern-section">
                        <div class="pattern-badge ${crypto.pattern.type}">
                            ${this.getPatternIcon(crypto.pattern.type)} ${crypto.pattern.name}
                        </div>
                        <div class="confidence-bar">
                            <div class="confidence-fill" style="width: ${crypto.pattern.confidence}%"></div>
                            <span class="confidence-text">${crypto.pattern.confidence.toFixed(0)}%</span>
                        </div>
                        ${crypto.pattern.confirmation ? `
                            <div class="confirmation-badges">
                                ${crypto.pattern.confirmation.signals.slice(0, 3).map(signal => `
                                    <span class="indicator-badge ${signal.type.toLowerCase()}">
                                        ${signal.type}
                                    </span>
                                `).join('')}
                            </div>
                        ` : ''}
                    </div>
                ` : `
                    <div class="no-pattern">
                        <span>لا يوجد نموذج واضح</span>
                    </div>
                `}

                               ${crypto.indicators ? `
                    <div class="indicators-preview">
                        ${crypto.indicators.rsi ? `
                            <div class="indicator-item">
                                <span class="indicator-label">RSI:</span>
                                <span class="indicator-value ${this.getRSIClass(crypto.indicators.rsi[crypto.indicators.rsi.length - 1])}">
                                    ${crypto.indicators.rsi[crypto.indicators.rsi.length - 1].toFixed(1)}
                                </span>
                            </div>
                        ` : ''}
                        
                        ${crypto.indicators.macd ? `
                            <div class="indicator-item">
                                <span class="indicator-label">MACD:</span>
                                <span class="indicator-value ${this.getMACDClass(crypto.indicators.macd)}">
                                    ${crypto.indicators.macd.histogram[crypto.indicators.macd.histogram.length - 1] > 0 ? '📈' : '📉'}
                                </span>
                            </div>
                        ` : ''}

                        ${crypto.indicators.volumeAnalysis ? `
                            <div class="indicator-item">
                                <span class="indicator-label">الحجم:</span>
                                <span class="indicator-value ${crypto.indicators.volumeAnalysis[crypto.indicators.volumeAnalysis.length - 1]?.signal || 'normal'}">
                                    ${this.getVolumeIcon(crypto.indicators.volumeAnalysis[crypto.indicators.volumeAnalysis.length - 1]?.signal || 'normal')}
                                </span>
                            </div>
                        ` : ''}
                    </div>
                ` : ''}

                <div class="volume-section">
                    <div class="volume-info">
                        <span class="volume-label">الحجم:</span>
                        <span class="volume-value">${this.formatLargeNumber(crypto.volume)}</span>
                    </div>
                    ${crypto.pattern && crypto.pattern.volumeAnalysis ? `
                        <div class="volume-signal ${crypto.pattern.volumeAnalysis.breakoutVolume.signal}">
                            ${this.getVolumeIcon(crypto.pattern.volumeAnalysis.breakoutVolume.signal)}
                        </div>
                    ` : ''}
                </div>

                <div class="card-footer">
                    <div class="last-update">
                        آخر تحديث: ${new Date(crypto.lastUpdate).toLocaleTimeString('ar-SA')}
                    </div>
                </div>
            </div>
        `;
    }

    // دوال مساعدة إضافية
    showLoadingModal(show) {
        const modal = document.getElementById('loadingModal');
        if (modal) {
            modal.style.display = show ? 'block' : 'none';
        }
    }

    updateProgress(percentage) {
        const progressBar = document.querySelector('.progress-fill');
        const progressText = document.querySelector('.progress-text');
        
        if (progressBar) {
            progressBar.style.width = `${percentage}%`;
        }
        if (progressText) {
            progressText.textContent = `${Math.round(percentage)}%`;
        }
    }

    updateResultsCount(count) {
        const counter = document.getElementById('resultsCount');
        if (counter) {
            counter.textContent = `${count} نتيجة`;
        }
    }

    // إضافة دعم التحديث التلقائي للمؤشرات
    startRealTimeUpdates() {
        // تحديث الأسعار كل 30 ثانية
        this.priceUpdateInterval = setInterval(() => {
            this.updatePrices();
        }, 30000);

        // تحديث المؤشرات كل 5 دقائق
        this.indicatorsUpdateInterval = setInterval(() => {
            this.updateIndicators();
        }, 300000);
    }

    async updatePrices() {
        try {
            const response = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            const priceData = await response.json();

            for (const [symbol, crypto] of this.cryptoData.entries()) {
                const tickerData = priceData.find(ticker => ticker.symbol === symbol);
                if (tickerData) {
                    crypto.price = parseFloat(tickerData.lastPrice);
                    crypto.change = parseFloat(tickerData.priceChangePercent);
                    crypto.volume = parseFloat(tickerData.volume);
                    crypto.quoteVolume = parseFloat(tickerData.quoteVolume);
                    crypto.lastUpdate = Date.now();
                    
                    this.cryptoData.set(symbol, crypto);
                }
            }

            // تحديث العرض إذا لم تكن هناك فلترة نشطة
            if (!this.hasActiveFilters()) {
                this.renderCryptoGrid();
            }

        } catch (error) {
            console.warn('خطأ في تحديث الأسعار:', error);
        }
    }

    async updateIndicators() {
        const visibleSymbols = this.getVisibleSymbols();
        
        for (const symbol of visibleSymbols.slice(0, 10)) { // تحديث أول 10 عملات مرئية فقط
            try {
                const candleData = await this.timeframeManager.getCandleData(symbol, this.currentTimeframe);
                if (candleData && candleData.length > 50) {
                    const pattern = await this.patternDetector.detectPatterns(candleData, this.currentTimeframe);
                    
                    const crypto = this.cryptoData.get(symbol);
                    if (crypto) {
                        crypto.pattern = pattern;
                        crypto.indicators = pattern ? pattern.indicators : null;
                        this.cryptoData.set(symbol, crypto);
                    }
                }
            } catch (error) {
                console.warn(`خطأ في تحديث مؤشرات ${symbol}:`, error);
            }
        }

        this.filterData();
    }

    hasActiveFilters() {
        const filters = ['searchInput', 'patternFilter', 'typeFilter', 'rsiFilter', 'macdFilter', 'volumeFilter', 'confidenceFilter'];
        return filters.some(filterId => {
            const element = document.getElementById(filterId);
            return element && element.value !== '';
        });
    }

    getVisibleSymbols() {
        const cards = document.querySelectorAll('.crypto-card');
        return Array.from(cards).map(card => {
            const symbolElement = card.querySelector('.symbol');
            return symbolElement ? symbolElement.textContent : null;
        }).filter(Boolean);
    }

    // إضافة دعم التصدير والحفظ
    exportAnalysis() {
        const data = Array.from(this.cryptoData.values())
            .filter(crypto => crypto.pattern)
            .map(crypto => ({
                symbol: crypto.symbol,
                name: crypto.name,
                price: crypto.price,
                change: crypto.change,
                pattern: {
                    name: crypto.pattern.name,
                    type: crypto.pattern.type,
                    confidence: crypto.pattern.confidence,
                    entry: crypto.pattern.entry,
                    target: crypto.pattern.target,
                    stopLoss: crypto.pattern.stopLoss
                },
                indicators: crypto.indicators ? {
                    rsi: crypto.indicators.rsi ? crypto.indicators.rsi[crypto.indicators.rsi.length - 1] : null,
                    macd: crypto.indicators.macd ? crypto.indicators.macd.histogram[crypto.indicators.macd.histogram.length - 1] : null
                } : null,
                timestamp: new Date().toISOString(),
                timeframe: this.currentTimeframe
            }));

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-analysis-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // إضافة دعم الإشعارات
    setupNotifications() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    sendNotification(title, message, crypto) {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notification = new Notification(title, {
                body: message,
                icon: '/favicon.ico',
                tag: crypto.symbol
            });

            notification.onclick = () => {
                window.focus();
                this.showPatternDetails(crypto.symbol);
                notification.close();
            };

            setTimeout(() => notification.close(), 10000);
        }
    }

    // مراقبة الأنماط الجديدة
    monitorNewPatterns() {
        const previousPatterns = new Map();

        setInterval(() => {
            for (const [symbol, crypto] of this.cryptoData.entries()) {
                if (crypto.pattern && crypto.pattern.confidence > 70) {
                    const currentPattern = `${crypto.pattern.name}-${crypto.pattern.type}`;
                    const previousPattern = previousPatterns.get(symbol);

                    if (previousPattern !== currentPattern) {
                        this.sendNotification(
                            `نموذج جديد: ${crypto.name}`,
                            `تم اكتشاف نموذج ${crypto.pattern.name} ${this.getPatternTypeText(crypto.pattern.type)} بثقة ${crypto.pattern.confidence.toFixed(0)}%`,
                            crypto
                        );
                        previousPatterns.set(symbol, currentPattern);
                    }
                }
            }
        }, 60000); // فحص كل دقيقة
    }

    // تنظيف الموارد
    cleanup() {
        if (this.priceUpdateInterval) {
            clearInterval(this.priceUpdateInterval);
        }
        if (this.indicatorsUpdateInterval) {
            clearInterval(this.indicatorsUpdateInterval);
        }
    }

    // تهيئة التطبيق
    async init() {
        this.setupEventListeners();
        this.setupAdvancedFilters();
        this.setupNotifications();
        await this.loadCryptoData();
        this.monitorNewPatterns();
        
        // تنظيف عند إغلاق الصفحة
        window.addEventListener('beforeunload', () => {
            this.cleanup();
        });
    }
}

// إضافة TimeframeManager.getCandleData
class TimeframeManager {
    // ... الكود السابق ...

    async getCandleData(symbol, timeframe) {
        const config = this.timeframes[timeframe];
        if (!config) return null;

        try {
            const response = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${config.interval}&limit=${config.limit}`
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
            console.warn(`خطأ في الحصول على بيانات ${timeframe} لـ ${symbol}:`, error);
            return null;
        }
    }
}

