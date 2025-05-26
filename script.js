class CryptoPatternDetector {
    constructor() {
        this.coins = [];
        this.filteredCoins = [];
        this.currentTimeframe = '1d';
        this.patterns = {
            'double-bottom': 'القاع الثنائي',
            'triple-top': 'القمة الثلاثية',
            'triple-bottom': 'القاع الثلاثي',
            'head-shoulders': 'الرأس والكتفين',
            'inverted-head-shoulders': 'الرأس والكتفين المقلوب',
            'symmetrical-triangle': 'المثلث المتماثل',
            'ascending-triangle': 'المثلث الصاعد',
            'descending-triangle': 'المثلث الهابط',
            'broadening-pattern': 'النموذج المتباعد',
            'rectangle': 'المستطيل',
            'flags-pennants': 'الأعلام والأعلام المثلثة',
            'rising-wedge': 'الوتد الصاعد',
            'falling-wedge': 'الوتد الهابط',
            'rounding-tops': 'القمم المستديرة',
            'rounding-bottoms': 'القيعان المستديرة',
            'v-top': 'نموذج القمة V',
            'v-bottom': 'نموذج القاع V'
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCoinData();
        this.renderCoins();
        this.updateStats();
        
        // تحديث البيانات كل 30 ثانية
        setInterval(() => {
            this.loadCoinData();
        }, 30000);
    }

    setupEventListeners() {
        document.getElementById('timeframe-filter').addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.filterCoins();
        });

        document.getElementById('pattern-filter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('breakout-filter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('search-input').addEventListener('input', () => {
            this.filterCoins();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadCoinData();
        });

        // إغلاق النافذة
class CryptoPatternDetector {
    constructor() {
        this.coins = [];
        this.filteredCoins = [];
        this.currentTimeframe = '1d';
        this.patterns = {
            'double-bottom': 'القاع الثنائي',
            'triple-top': 'القمة الثلاثية',
            'triple-bottom': 'القاع الثلاثي',
            'head-shoulders': 'الرأس والكتفين',
            'inverted-head-shoulders': 'الرأس والكتفين المقلوب',
            'symmetrical-triangle': 'المثلث المتماثل',
            'ascending-triangle': 'المثلث الصاعد',
            'descending-triangle': 'المثلث الهابط',
            'broadening-pattern': 'النموذج المتباعد',
            'rectangle': 'المستطيل',
            'flags-pennants': 'الأعلام والأعلام المثلثة',
            'rising-wedge': 'الوتد الصاعد',
            'falling-wedge': 'الوتد الهابط',
            'rounding-tops': 'القمم المستديرة',
            'rounding-bottoms': 'القيعان المستديرة',
            'v-top': 'نموذج القمة V',
            'v-bottom': 'نموذج القاع V'
        };
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadCoinData();
        this.renderCoins();
        this.updateStats();
        
        // تحديث البيانات كل 30 ثانية
        setInterval(() => {
            this.loadCoinData();
        }, 30000);
    }

    setupEventListeners() {
        document.getElementById('timeframe-filter').addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.filterCoins();
        });

        document.getElementById('pattern-filter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('breakout-filter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('search-input').addEventListener('input', () => {
            this.filterCoins();
        });

        document.getElementById('refresh-btn').addEventListener('click', () => {
            this.loadCoinData();
        });

        // إغلاق النافذة
        document.querySelector('.close').addEventListener('click', () => {
            document.getElementById('pattern-modal').style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            const modal = document.getElementById('pattern-modal');
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    async loadCoinData() {
        this.showLoading(true);
        
        try {
            // جلب قائمة العملات من Binance
            const exchangeInfoResponse = await fetch('https://api.binance.com/api/v3/exchangeInfo');
            const exchangeInfo = await exchangeInfoResponse.json();
            
            // فلترة العملات المرتبطة بـ USDT وتجنب العملات المستقرة
            const usdtPairs = exchangeInfo.symbols
                .filter(symbol => 
                    symbol.quoteAsset === 'USDT' && 
                    symbol.status === 'TRADING' &&
                    !this.isStableCoin(symbol.baseAsset)
                )
                .map(symbol => symbol.symbol);

            // جلب بيانات الأسعار
            const tickerResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            const tickerData = await tickerResponse.json();

            // جلب بيانات الحجم
            const volumeResponse = await fetch('https://api.binance.com/api/v3/ticker/bookTicker');
            const volumeData = await volumeResponse.json();

            this.coins = await Promise.all(
                usdtPairs.slice(0, 100).map(async (symbol) => {
                    const ticker = tickerData.find(t => t.symbol === symbol);
                    const volume = volumeData.find(v => v.symbol === symbol);
                    
                    if (!ticker) return null;

                    // محاكاة اكتشاف الأنماط الفنية
                    const pattern = await this.detectPattern(symbol, this.currentTimeframe);
                    
                    return {
                        symbol: symbol,
                        baseAsset: symbol.replace('USDT', ''),
                        price: parseFloat(ticker.lastPrice),
                        priceChange: parseFloat(ticker.priceChangePercent),
                        volume: parseFloat(ticker.volume),
                        quoteVolume: parseFloat(ticker.quoteVolume),
                        bidPrice: volume ? parseFloat(volume.bidPrice) : 0,
                        askPrice: volume ? parseFloat(volume.askPrice) : 0,
                        pattern: pattern,
                        liquidity: this.calculateLiquidity(ticker),
                        lastUpdate: new Date()
                    };
                })
            );

            this.coins = this.coins.filter(coin => coin !== null);
            this.filterCoins();
            this.updateStats();
            
        } catch (error) {
            console.error('خطأ في تحميل البيانات:', error);
            this.showError('فشل في تحميل البيانات. يرجى المحاولة مرة أخرى.');
        } finally {
            this.showLoading(false);
        }
    }

    isStableCoin(asset) {
        const stableCoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'PAX', 'USDN', 'FDUSD'];
        return stableCoins.includes(asset);
    }

    calculateLiquidity(ticker) {
        const volume = parseFloat(ticker.quoteVolume);
        const maxVolume = 1000000000; // 1 مليار كحد أقصى للحساب
        return Math.min((volume / maxVolume) * 100, 100);
    }

    async detectPattern(symbol, timeframe) {
        try {
            // جلب بيانات الشموع للتحليل الفني
            const candleResponse = await fetch(
                `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${timeframe}&limit=100`
            );
            const candleData = await candleResponse.json();
            
            if (!candleData || candleData.length < 50) {
                return {
                    type: 'none',
                    name: 'لا يتوفر نموذج فني حاليا',
                    confidence: 0,
                    breakoutStatus: 'none',
                    targets: [],
                    description: 'لا توجد بيانات كافية للتحليل'
                };
            }

            // تحويل البيانات إلى صيغة قابلة للتحليل
            const prices = candleData.map(candle => ({
                open: parseFloat(candle[1]),
                high: parseFloat(candle[2]),
                low: parseFloat(candle[3]),
                close: parseFloat(candle[4]),
                volume: parseFloat(candle[5]),
                timestamp: candle[0]
            }));

            // تطبيق خوارزميات اكتشاف الأنماط
            return this.analyzePatterns(prices, symbol);
            
        } catch (error) {
            console.error(`خطأ في تحليل النمط لـ ${symbol}:`, error);
            return {
                type: 'none',
                name: 'لا يتوفر نموذج فني حاليا',
                confidence: 0,
                breakoutStatus: 'none',
                targets: [],
                description: 'خطأ في التحليل'
            };
        }
    }

    analyzePatterns(prices, symbol) {
        const patterns = [
            this.detectDoubleBottom(prices),
            this.detectTripleTop(prices),
            this.detectTripleBottom(prices),
            this.detectHeadAndShoulders(prices),
            this.detectInvertedHeadAndShoulders(prices),
            this.detectSymmetricalTriangle(prices),
            this.detectAscendingTriangle(prices),
            this.detectDescendingTriangle(prices),
            this.detectRectangle(prices),
            this.detectRisingWedge(prices),
            this.detectFallingWedge(prices),
            this.detectRoundingTop(prices),
            this.detectRoundingBottom(prices),
            this.detectVTop(prices),
            this.detectVBottom(prices)
        ].filter(pattern => pattern.confidence > 60);

        if (patterns.length === 0) {
            return {
                type: 'none',
                name: 'لا يتوفر نموذج فني حاليا',
                confidence: 0,
                breakoutStatus: 'none',
                targets: [],
                description: 'لم يتم اكتشاف أي نمط فني واضح'
            };
        }

        // اختيار النمط الأكثر ثقة
        const bestPattern = patterns.reduce((prev, current) => 
            current.confidence > prev.confidence ? current : prev
        );

        return bestPattern;
    }

    detectDoubleBottom(prices) {
        const lows = prices.map((p, i) => ({ price: p.low, index: i }))
            .filter((p, i, arr) => {
                if (i === 0 || i === arr.length - 1) return false;
                return p.price <= arr[i-1].price && p.price <= arr[i+1].price;
            });

        if (lows.length >= 2) {
            const lastTwo = lows.slice(-2);
            const priceDiff = Math.abs(lastTwo[0].price - lastTwo[1].price);
            const avgPrice = (lastTwo[0].price + lastTwo[1].price) / 2;
            const tolerance = avgPrice * 0.02; // 2% tolerance

            if (priceDiff <= tolerance) {
                const currentPrice = prices[prices.length - 1].close;
                const resistance = Math.max(...prices.slice(lastTwo[0].index, lastTwo[1].index).map(p => p.high));
                
                return {
                    type: 'double-bottom',
                    name: 'القاع الثنائي',
                    confidence: 85,
                    breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: resistance * 1.05 },
                        { name: 'الهدف الثاني', price: resistance * 1.10 }
                    ],
                    description: 'نمط انعكاسي صاعد يتكون من قاعين متساويين تقريباً',
                    support: avgPrice,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    detectTripleTop(prices) {
        const highs = prices.map((p, i) => ({ price: p.high, index: i }))
            .filter((p, i, arr) => {
                if (i === 0 || i === arr.length - 1) return false;
                return p.price >= arr[i-1].price && p.price >= arr[i+1].price;
            });

        if (highs.length >= 3) {
            const lastThree = highs.slice(-3);
            const avgPrice = lastThree.reduce((sum, h) => sum + h.price, 0) / 3;
            const maxDiff = Math.max(...lastThree.map(h => Math.abs(h.price - avgPrice)));
            const tolerance = avgPrice * 0.02;

            if (maxDiff <= tolerance) {
                const currentPrice = prices[prices.length - 1].close;
                const support = Math.min(...prices.slice(lastThree[0].index, lastThree[2].index).map(p => p.low));
                
                return {
                    type: 'triple-top',
                    name: 'القمة الثلاثية',
                    confidence: 90,
                    breakoutStatus: currentPrice < support ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: support * 0.95 },
                        { name: 'الهدف الثاني', price: support * 0.90 }
                    ],
                    description: 'نمط انعكاسي هابط يتكون من ثلاث قمم متساوية تقريباً',
                    support: support,
                    resistance: avgPrice
                };
            }
        }

        return { confidence: 0 };
    }

    detectTripleBottom(prices) {
        const lows = prices.map((p, i) => ({ price: p.low, index: i }))
            .filter((p, i, arr) => {
                if (i === 0 || i === arr.length - 1) return false;
                return p.price <= arr[i-1].price && p.price <= arr[i+1].price;
            });

        if (lows.length >= 3) {
            const lastThree = lows.slice(-3);
            const avgPrice = lastThree.reduce((sum, l) => sum + l.price, 0) / 3;
            const maxDiff = Math.max(...lastThree.map(l => Math.abs(l.price - avgPrice)));
            const tolerance = avgPrice * 0.02;

            if (maxDiff <= tolerance) {
                const currentPrice = prices[prices.length - 1].close;
                const resistance = Math.max(...prices.slice(lastThree[0].index, lastThree[2].index).map(p => p.high));
                
                return {
                    type: 'triple-bottom',
                    name: 'القاع الثلاثي',
                    confidence: 90,
                    breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: resistance * 1.05 },
                        { name: 'الهدف الثاني', price: resistance * 1.10 }
                    ],
                    description: 'نمط انعكاسي صاعد يتكون من ثلاثة قيعان متساوية تقريباً',
                    support: avgPrice,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    detectHeadAndShoulders(prices) {
        const highs = prices.map((p, i) => ({ price: p.high, index: i }))
            .filter((p, i, arr) => {
                if (i === 0 || i === arr.length - 1) return false;
                return p.price >= arr[i-1].price && p.price >= arr[i+1].price;
            });

        if (highs.length >= 3) {
            const lastThree = highs.slice(-3);
            const [leftShoulder, head, rightShoulder] = lastThree;

            if (head.price > leftShoulder.price && head.price > rightShoulder.price &&
                Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.05) {
                
                const neckline = Math.min(
                    ...prices.slice(leftShoulder.index, head.index).map(p => p.low),
                    ...prices.slice(head.index, rightShoulder.index).map(p => p.low)
                );
                
                const currentPrice = prices[prices.length - 1].close;
                
                return {
                    type: 'head-shoulders',
                    name: 'الرأس والكتفين',
                    confidence: 88,
                    breakoutStatus: currentPrice < neckline ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: neckline * 0.95 },
                        { name: 'الهدف الثاني', price: neckline * 0.90 }
                    ],
                    description: 'نمط انعكاسي هابط يتكون من ثلاث قمم، الوسطى أعلى من الجانبيتين',
                    support: neckline,
                    resistance: head.price
                };
            }
        }

        return { confidence: 0 };
    }

    detectInvertedHeadAndShoulders(prices) {
        const lows = prices.map((p, i) => ({ price: p.low, index: i }))
            .filter((p, i, arr) => {
                if (i === 0 || i === arr.length - 1) return false;
                return p.price <= arr[i-1].price && p.price <= arr[i+1].price;
            });

        if (lows.length >= 3) {
            const lastThree = lows.slice(-3);
            const [leftShoulder, head, rightShoulder] = lastThree;

            if (head.price < leftShoulder.price && head.price < rightShoulder.price &&
                Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price < 0.05) {
                
                const neckline = Math.max(
                    ...prices.slice(leftShoulder.index, head.index).map(p => p.high),
                    ...prices.slice(head.index, rightShoulder.index).map(p => p.high)
                );
                
                const currentPrice = prices[prices.length - 1].close;
                
                return {
                    type: 'inverted-head-shoulders',
                    name: 'الرأس والكتفين المقلوب',
                    confidence: 88,
                    breakoutStatus: currentPrice > neckline ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: neckline * 1.05 },
                        { name: 'الهدف الثاني', price: neckline * 1.10 }
                    ],
                    description: 'نمط انعكاسي صاعد يتكون من ثلاثة قيعان، الأوسط أدنى من الجانبيين',
                    support: head.price,
                    resistance: neckline
                };
            }
        }

        return { confidence: 0 };
    }

    detectSymmetricalTriangle(prices) {
        const recentPrices = prices.slice(-30);
        const highs = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.high >= recentPrices[i-1].high && p.high >= recentPrices[i+1].high;
        });
        
        const lows = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.low <= recentPrices[i-1].low && p.low <= recentPrices[i+1].low;
        });

        if (highs.length >= 2 && lows.length >= 2) {
            const highTrend = this.calculateTrend(highs.map(h => h.high));
            const lowTrend = this.calculateTrend(lows.map(l => l.low));

            if (highTrend < 0 && lowTrend > 0) {
                const currentPrice = prices[prices.length - 1].close;
                const upperBound = highs[highs.length - 1].high;
                const lowerBound = lows[lows.length - 1].low;
                
                return {
                    type: 'symmetrical-triangle',
                    name: 'المثلث المتماثل',
                    confidence: 75,
                    breakoutStatus: currentPrice > upperBound || currentPrice < lowerBound ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الصاعد', price: upperBound * 1.08 },
                        { name: 'الهدف الهابط', price: lowerBound * 0.92 }
                    ],
                    description: 'نمط استمراري يتكون من خطوط دعم ومقاومة متقاربة',
                    support: lowerBound,
                    resistance: upperBound
                };
            }
        }

        return { confidence: 0 };
    }

    detectAscendingTriangle(prices) {
        const recentPrices = prices.slice(-30);
        const highs = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.high >= recentPrices[i-1].high && p.high >= recentPrices[i+1].high;
        });
        
        const lows = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.low <= recentPrices[i-1].low && p.low <= recentPrices[i+1].low;
        });

        if (highs.length >= 2 && lows.length >= 2) {
            const highTrend = this.calculateTrend(highs.map(h => h.high));
            const lowTrend = this.calculateTrend(lows.map(l => l.low));

            if (Math.abs(highTrend) < 0.01 && lowTrend > 0) {
                const currentPrice = prices[prices.length - 1].close;
                const resistance = highs.reduce((sum, h) => sum + h.high, 0) / highs.length;
                const support = lows[lows.length - 1].low;
                
                return {
                    type: 'ascending-triangle',
                    name: 'المثلث الصاعد',
                    confidence: 80,
                    breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: resistance * 1.05 },
                        { name: 'الهدف الثاني', price: resistance * 1.10 }
                    ],
                    description: 'نمط صاعد يتكون من مقاومة أفقية ودعم صاعد',
                    support: support,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    detectDescendingTriangle(prices) {
        const recentPrices = prices.slice(-30);
        const highs = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.high >= recentPrices[i-1].high && p.high >= recentPrices[i+1].high;
        });
        
        const lows = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.low <= recentPrices[i-1].low && p.low <= recentPrices[i+1].low;
        });

        if (highs.length >= 2 && lows.length >= 2) {
            const highTrend = this.calculateTrend(highs.map(h => h.high));
            const lowTrend = this.calculateTrend(lows.map(l => l.low));

            if (highTrend < 0 && Math.abs(lowTrend) < 0.01) {
                const currentPrice = prices[prices.length - 1].close;
                const support = lows.reduce((sum, l) => sum + l.low, 0) / lows.length;
                const resistance = highs[highs.length - 1].high;
                
                return {
                    type: 'descending-triangle',
                    name: 'المثلث الهابط',
                    confidence: 80,
                    breakoutStatus: currentPrice < support ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: support * 0.95 },
                        { name: 'الهدف الثاني', price: support * 0.90 }
                    ],
                    description: 'نمط هابط يتكون من دعم أفقي ومقاومة هابطة',
                    support: support,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    detectRectangle(prices) {
        const recentPrices = prices.slice(-40);
        const highs = recentPrices.map(p => p.high);
        const lows = recentPrices.map(p => p.low);
        
        const maxHigh = Math.max(...highs);
        const minLow = Math.min(...lows);
        const range = maxHigh - minLow;
        
        const upperBound = maxHigh - (range * 0.1);
        const lowerBound = minLow + (range * 0.1);
        
        const touchesUpper = highs.filter(h => h >= upperBound).length;
        const touchesLower = lows.filter(l => l <= lowerBound).length;
        
        if (touchesUpper >= 3 && touchesLower >= 3) {
            const currentPrice = prices[prices.length - 1].close;
            
            return {
                type: 'rectangle',
                name: 'المستطيل',
                confidence: 70,
                breakoutStatus: currentPrice > upperBound || currentPrice < lowerBound ? 'confirmed' : 'pending',
                targets: [
                    { name: 'الهدف الصاعد', price: upperBound * 1.06 },
                    { name: 'الهدف الهابط', price: lowerBound * 0.94 }
                ],
                description: 'نمط استمراري يتحرك السعر بين مستويين أفقيين',
                support: lowerBound,
                resistance: upperBound
            };
        }

        return { confidence: 0 };
    }

    detectRisingWedge(prices) {
        const recentPrices = prices.slice(-25);
        const highs = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.high >= recentPrices[i-1].high && p.high >= recentPrices[i+1].high;
        });
        
        const lows = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.low <= recentPrices[i-1].low && p.low <= recentPrices[i+1].low;
        });

        if (highs.length >= 2 && lows.length >= 2) {
            const highTrend = this.calculateTrend(highs.map(h => h.high));
            const lowTrend = this.calculateTrend(lows.map(l => l.low));

            if (highTrend > 0 && lowTrend > 0 && lowTrend > highTrend) {
                const currentPrice = prices[prices.length - 1].close;
                const support = lows[lows.length - 1].low;
                
                return {
                    type: 'rising-wedge',
                    name: 'الوتد الصاعد',
                    confidence: 78,
                    breakoutStatus: currentPrice < support ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: support * 0.95 },
                        { name: 'الهدف الثاني', price: support * 0.88 }
                    ],
                    description: 'نمط انعكاسي هابط يتكون من خطين صاعدين متقاربين',
                    support: support,
                    resistance: highs[highs.length - 1].high
                };
            }
        }

        return { confidence: 0 };
    }

    detectFallingWedge(prices) {
        const recentPrices = prices.slice(-25);
        const highs = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.high >= recentPrices[i-1].high && p.high >= recentPrices[i+1].high;
        });
        
        const lows = recentPrices.filter((p, i) => {
            if (i === 0 || i === recentPrices.length - 1) return false;
            return p.low <= recentPrices[i-1].low && p.low <= recentPrices[i+1].low;
        });

        if (highs.length >= 2 && lows.length >= 2) {
            const highTrend = this.calculateTrend(highs.map(h => h.high));
            const lowTrend = this.calculateTrend(lows.map(l => l.low));

            if (highTrend < 0 && lowTrend < 0 && Math.abs(lowTrend) > Math.abs(highTrend)) {
                const currentPrice = prices[prices.length - 1].close;
                const resistance = highs[highs.length - 1].high;
                
                return {
                    type: 'falling-wedge',
                    name: 'الوتد الهابط',
                    confidence: 78,
                    breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: resistance * 1.05 },
                        { name: 'الهدف الثاني', price: resistance * 1.12 }
                    ],
                    description: 'نمط انعكاسي صاعد يتكون من خطين هابطين متقاربين',
                    support: lows[lows.length - 1].low,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    detectRoundingTop(prices) {
        const recentPrices = prices.slice(-20);
        if (recentPrices.length < 15) return { confidence: 0 };

        const midPoint = Math.floor(recentPrices.length / 2);
        const leftSide = recentPrices.slice(0, midPoint);
        const rightSide = recentPrices.slice(midPoint);
        
        const leftTrend = this.calculateTrend(leftSide.map(p => p.high));
        const rightTrend = this.calculateTrend(rightSide.map(p => p.high));
        
        if (leftTrend > 0 && rightTrend < 0) {
            const peak = Math.max(...recentPrices.map(p => p.high));
            const currentPrice = prices[prices.length - 1].close;
            const support = Math.min(...rightSide.map(p => p.low));
            
            return {
                type: 'rounding-tops',
                name: 'القمم المستديرة',
                confidence: 72,
                breakoutStatus: currentPrice < support ? 'confirmed' : 'pending',
                targets: [
                    { name: 'الهدف الأول', price: support * 0.95 },
                    { name: 'الهدف الثاني', price: support * 0.88 }
                ],
                description: 'نمط انعكاسي هابط يشبه القبة المقلوبة',
                support: support,
                resistance: peak
            };
        }

        return { confidence: 0 };
    }

    detectRoundingBottom(prices) {
        const recentPrices = prices.slice(-20);
        if (recentPrices.length < 15) return { confidence: 0 };

        const midPoint = Math.floor(recentPrices.length / 2);
        const leftSide = recentPrices.slice(0, midPoint);
        const rightSide = recentPrices.slice(midPoint);
        
        const leftTrend = this.calculateTrend(leftSide.map(p => p.low));
        const rightTrend = this.calculateTrend(rightSide.map(p => p.low));
        
        if (leftTrend < 0 && rightTrend > 0) {
            const bottom = Math.min(...recentPrices.map(p => p.low));
            const currentPrice = prices[prices.length - 1].close;
            const resistance = Math.max(...rightSide.map(p => p.high));
            
            return {
                type: 'rounding-bottoms',
                name: 'القيعان المستديرة',
                confidence: 72,
                breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                targets: [
                    { name: 'الهدف الأول', price: resistance * 1.05 },
                    { name: 'الهدف الثاني', price: resistance * 1.12 }
                ],
                description: 'نمط انعكاسي صاعد يشبه القبة',
                support: bottom,
                resistance: resistance
            };
        }

        return { confidence: 0 };
    }

    detectVTop(prices) {
        const recentPrices = prices.slice(-10);
        if (recentPrices.length < 7) return { confidence: 0 };

        const peak = Math.max(...recentPrices.map(p => p.high));
        const peakIndex = recentPrices.findIndex(p => p.high === peak);
        
        if (peakIndex > 2 && peakIndex < recentPrices.length - 3) {
            const leftSlope = this.calculateTrend(recentPrices.slice(0, peakIndex).map(p => p.high));
            const rightSlope = this.calculateTrend(recentPrices.slice(peakIndex).map(p => p.high));
            
            if (leftSlope > 0.05 && rightSlope < -0.05) {
                const currentPrice = prices[prices.length - 1].close;
                const support = Math.min(...recentPrices.slice(peakIndex).map(p => p.low));
                
                return {
                    type: 'v-top',
                    name: 'نموذج القمة V',
                    confidence: 82,
                    breakoutStatus: currentPrice < support ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: support * 0.92 },
                        { name: 'الهدف الثاني', price: support * 0.85 }
                    ],
                    description: 'نمط انعكاسي هابط حاد يشبه حرف V مقلوب',
                    support: support,
                    resistance: peak
                };
            }
        }

        return { confidence: 0 };
    }

    detectVBottom(prices) {
        const recentPrices = prices.slice(-10);
        if (recentPrices.length < 7) return { confidence: 0 };

        const bottom = Math.min(...recentPrices.map(p => p.low));
        const bottomIndex = recentPrices.findIndex(p => p.low === bottom);
        
        if (bottomIndex > 2 && bottomIndex < recentPrices.length - 3) {
            const leftSlope = this.calculateTrend(recentPrices.slice(0, bottomIndex).map(p => p.low));
            const rightSlope = this.calculateTrend(recentPrices.slice(bottomIndex).map(p => p.low));
            
            if (leftSlope < -0.05 && rightSlope > 0.05) {
                const currentPrice = prices[prices.length - 1].close;
                const resistance = Math.max(...recentPrices.slice(bottomIndex).map(p => p.high));
                
                return {
                    type: 'v-bottom',
                    name: 'نموذج القاع V',
                    confidence: 82,
                    breakoutStatus: currentPrice > resistance ? 'confirmed' : 'pending',
                    targets: [
                        { name: 'الهدف الأول', price: resistance * 1.08 },
                        { name: 'الهدف الثاني', price: resistance * 1.15 }
                    ],
                    description: 'نمط انعكاسي صاعد حاد يشبه حرف V',
                    support: bottom,
                    resistance: resistance
                };
            }
        }

        return { confidence: 0 };
    }

    calculateTrend(values) {
        if (values.length < 2) return 0;
        
        const n = values.length;
        const sumX = (n * (n - 1)) / 2;
        const sumY = values.reduce((sum, val) => sum + val, 0);
        const sumXY = values.reduce((sum, val, i) => sum + (i * val), 0);
        const sumX2 = (n * (n - 1) * (2 * n - 1)) / 6;
        
        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        return slope / (sumY / n); // نسبة الميل
    }

    filterCoins() {
        const patternFilter = document.getElementById('pattern-filter').value;
        const breakoutFilter = document.getElementById('breakout-filter').value;
        const searchTerm = document.getElementById('search-input').value.toLowerCase();

        this.filteredCoins = this.coins.filter(coin => {
            const matchesPattern = patternFilter === 'all' || coin.pattern.type === patternFilter;
            const matchesBreakout = breakoutFilter === 'all' || coin.pattern.breakoutStatus === breakoutFilter;
            const matchesSearch = coin.symbol.toLowerCase().includes(searchTerm) || 
                                coin.baseAsset.toLowerCase().includes(searchTerm);

            return matchesPattern && matchesBreakout && matchesSearch;
        });

        this.renderCoins();
        this.updateStats();
    }

    renderCoins() {
        const grid = document.getElementById('coins-grid');
        grid.innerHTML = '';

        this.filteredCoins.forEach(coin => {
            const card = this.createCoinCard(coin);
            grid.appendChild(card);
        });
    }

    createCoinCard(coin) {
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.onclick = () => this.showPatternDetails(coin);

        const priceChangeClass = coin.priceChange >= 0 ? 'positive' : 'negative';
        const priceChangeIcon = coin.priceChange >= 0 ? '↗' : '↘';
        
        const patternStatusClass = coin.pattern.breakoutStatus === 'confirmed' ? 'confirmed' : 
                                 coin.pattern.breakoutStatus === 'pending' ? 'pending' : 'none';

        card.innerHTML = `
            <div class="coin-header">
                <div class="coin-logo">
                    ${coin.baseAsset.charAt(0)}
                </div>
                <div class="coin-info">
                    <h3>${coin.baseAsset}</h3>
                    <div class="coin-symbol">${coin.symbol}</div>
                </div>
            </div>

            <div class="price-section">
                <div class="current-price">$${coin.price.toFixed(6)}</div>
                <div class="price-change ${priceChangeClass}">
                    <span>${priceChangeIcon}</span>
                    <span>${coin.priceChange.toFixed(2)}%</span>
                </div>
            </div>

            <div class="liquidity-section">
                <div class="liquidity-label">
                    <span>السيولة</span>
                    <span>${coin.liquidity.toFixed(1)}%</span>
                </div>
                <div class="liquidity-bar">
                    <div class="liquidity-fill" style="width: ${coin.liquidity}%"></div>
                </div>
            </div>

            <div class="volume-section">
                <div class="volume-label">حجم التداول (24س)</div>
                <div class="volume-value">$${this.formatNumber(coin.quoteVolume)}</div>
            </div>

            <div class="pattern-section">
                <div class="pattern-name">${coin.pattern.name}</div>
                <div class="pattern-status ${patternStatusClass}">
                    ${this.getStatusText(coin.pattern.breakoutStatus)}
                </div>
            </div>
        `;

        return card;
    }

    getStatusText(status) {
        switch(status) {
            case 'confirmed': return 'تم الاختراق';
            case 'pending': return 'بانتظار تحقق الاختراق';
            default: return 'لا يتوفر نموذج فني حاليا';
        }
    }

    formatNumber(num) {
        if (num >= 1e9) return (num / 1e9).toFixed(2) + 'B';
        if (num >= 1e6) return (num / 1e6).toFixed(2) + 'M';
        if (num >= 1e3) return (num / 1e3).toFixed(2) + 'K';
        return num.toFixed(2);
    }

    showPatternDetails(coin) {
        const modal = document.getElementById('pattern-modal');
        const title = document.getElementById('modal-title');
        const body = document.getElementById('modal-body');

        title.textContent = `${coin.pattern.name} - ${coin.baseAsset}`;
        
        body.innerHTML = `
            <div class="pattern-details">
                <div class="detail-section">
                    <h4>معلومات العملة</h4>
                    <p><strong>الرمز:</strong> ${coin.symbol}</p>
                    <p><strong>السعر الحالي:</strong> $${coin.price.toFixed(6)}</p>
                    <p><strong>التغيير (24س):</strong> ${coin.priceChange.toFixed(2)}%</p>
                    <p><strong>حجم التداول:</strong> $${this.formatNumber(coin.quoteVolume)}</p>
                </div>

                <div class="detail-section">
                    <h4>تفاصيل النمط</h4>
                    <p><strong>النوع:</strong> ${coin.pattern.name}</p>
                    <p><strong>مستوى الثقة:</strong> ${coin.pattern.confidence}%</p>
                    <p><strong>الوصف:</strong> ${coin.pattern.description}</p>
                    <p><strong>حالة الاختراق:</strong> ${this.getStatusText(coin.pattern.breakoutStatus)}</p>
                </div>

                ${coin.pattern.support ? `
                <div class="detail-section">
                    <h4>المستويات الفنية</h4>
                    <p><strong>الدعم:</strong> $${coin.pattern.support.toFixed(6)}</p>
                    <p><strong>المقاومة:</strong> $${coin.pattern.resistance.toFixed(6)}</p>
                </div>
                ` : ''}

                ${coin.pattern.targets && coin.pattern.targets.length > 0 ? `
                <div class="detail-section">
                    <h4>الأهداف المتوقعة</h4>
                    <ul class="targets-list">
                        ${coin.pattern.targets.map(target => `
                            <li>
                                <span class="target-label">${target.name}:</span>
                                <span class="target-value">$${target.price.toFixed(6)}</span>
                            </li>
                        `).join('')}
                    </ul>
                </div>
                ` : ''}

                <div class="detail-section">
                    <h4>إجراءات مقترحة</h4>
                    <div class="action-buttons">
                        <button class="action-btn primary" onclick="window.open('https://www.binance.com/en/trade/${coin.symbol}', '_blank')">
                            تداول على Binance
                        </button>
                        <button class="action-btn secondary" onclick="window.open('https://www.tradingview.com/chart/?symbol=BINANCE:${coin.symbol}', '_blank')">
                            عرض الرسم البياني
                        </button>
                    </div>
                </div>

                <div class="detail-section">
                    <h4>تحذيرات مهمة</h4>
                    <div class="warning-box">
                        <p>⚠️ هذا التحليل للأغراض التعليمية فقط وليس نصيحة استثمارية</p>
                        <p>⚠️ يرجى إجراء بحثك الخاص قبل اتخاذ أي قرار استثماري</p>
                        <p>⚠️ الأسواق المالية تنطوي على مخاطر عالية</p>
                    </div>
                </div>
            </div>
        `;

        modal.style.display = 'block';
    }

    updateStats() {
        const totalCoins = this.coins.length;
        const filteredCoins = this.filteredCoins.length;
        const confirmedBreakouts = this.filteredCoins.filter(coin => 
            coin.pattern.breakoutStatus === 'confirmed').length;
        const pendingBreakouts = this.filteredCoins.filter(coin => 
            coin.pattern.breakoutStatus === 'pending').length;

        document.getElementById('total-coins').textContent = totalCoins;
        document.getElementById('filtered-coins').textContent = filteredCoins;
        document.getElementById('confirmed-breakouts').textContent = confirmedBreakouts;
        document.getElementById('pending-breakouts').textContent = pendingBreakouts;

        // تحديث الرسم البياني للإحصائيات
        this.updateStatsChart();
    }

    updateStatsChart() {
        const patternCounts = {};
        this.filteredCoins.forEach(coin => {
            const patternType = coin.pattern.type;
            patternCounts[patternType] = (patternCounts[patternType] || 0) + 1;
        });

        const chartContainer = document.getElementById('stats-chart');
        chartContainer.innerHTML = '';

        Object.entries(patternCounts).forEach(([pattern, count]) => {
            if (pattern !== 'none') {
                const bar = document.createElement('div');
                bar.className = 'chart-bar';
                
                const percentage = (count / this.filteredCoins.length) * 100;
                
                bar.innerHTML = `
                    <div class="bar-label">${this.patterns[pattern] || pattern}</div>
                    <div class="bar-container">
                        <div class="bar-fill" style="width: ${percentage}%"></div>
                        <span class="bar-value">${count}</span>
                    </div>
                `;
                
                chartContainer.appendChild(bar);
            }
        });
    }

    showLoading(show) {
        const loader = document.getElementById('loading');
        loader.style.display = show ? 'flex' : 'none';
    }

    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        
        document.body.appendChild(errorDiv);
        
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 5000);
    }

    // إضافة وظائف إضافية للتحليل المتقدم
    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return 50;

        let gains = 0;
        let losses = 0;

        for (let i = 1; i <= period; i++) {
            const change = prices[i].close - prices[i - 1].close;
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }

        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        const rsi = 100 - (100 / (1 + rs));

        return rsi;
    }

    calculateMACD(prices, fastPeriod = 12, slowPeriod = 26, signalPeriod = 9) {
        if (prices.length < slowPeriod) return { macd: 0, signal: 0, histogram: 0 };

        const closePrices = prices.map(p => p.close);
        const emaFast = this.calculateEMA(closePrices, fastPeriod);
        const emaSlow = this.calculateEMA(closePrices, slowPeriod);
        
        const macdLine = emaFast[emaFast.length - 1] - emaSlow[emaSlow.length - 1];
        const signalLine = this.calculateEMA([macdLine], signalPeriod)[0];
        const histogram = macdLine - signalLine;

        return {
            macd: macdLine,
            signal: signalLine,
            histogram: histogram
        };
    }

    calculateEMA(prices, period) {
        const multiplier = 2 / (period + 1);
        const ema = [prices[0]];

        for (let i = 1; i < prices.length; i++) {
            ema.push((prices[i] * multiplier) + (ema[i - 1] * (1 - multiplier)));
        }

        return ema;
    }

    calculateBollingerBands(prices, period = 20, stdDev = 2) {
        if (prices.length < period) return null;

        const closePrices = prices.slice(-period).map(p => p.close);
        const sma = closePrices.reduce((sum, price) => sum + price, 0) / period;
        
        const variance = closePrices.reduce((sum, price) => {
            return sum + Math.pow(price - sma, 2);
        }, 0) / period;
        
        const standardDeviation = Math.sqrt(variance);
        
        return {
            upper: sma + (standardDeviation * stdDev),
            middle: sma,
            lower: sma - (standardDeviation * stdDev)
        };
    }

    // وظائف إضافية للتصدير والحفظ
    exportToCSV() {
        const headers = ['Symbol', 'Price', 'Change%', 'Volume', 'Pattern', 'Confidence', 'Breakout Status'];
        const csvContent = [
            headers.join(','),
            ...this.filteredCoins.map(coin => [
                coin.symbol,
                coin.price,
                coin.priceChange,
                coin.quoteVolume,
                coin.pattern.name,
                coin.pattern.confidence,
                coin.pattern.breakoutStatus
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto_patterns_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    saveToLocalStorage() {
        const data = {
            coins: this.filteredCoins,
            timestamp: new Date().toISOString(),
            settings: {
                timeframe: this.currentTimeframe,
                filters: {
                    pattern: document.getElementById('pattern-filter').value,
                    breakout: document.getElementById('breakout-filter').value,
                    search: document.getElementById('search-input').value
                }
            }
        };

        localStorage.setItem('cryptoPatternData', JSON.stringify(data));
    }

    loadFromLocalStorage() {
        const savedData = localStorage.getItem('cryptoPatternData');
        if (savedData) {
            const data = JSON.parse(savedData);
            const savedTime = new Date(data.timestamp);
            const now = new Date();
            const timeDiff = (now - savedTime) / (1000 * 60); // بالدقائق

            // إذا كانت البيانات أقل من 5 دقائق، استخدمها
            if (timeDiff < 5) {
                this.filteredCoins = data.coins;
                this.currentTimeframe = data.settings.timeframe;
                
                // استعادة الفلاتر
                document.getElementById('timeframe-filter').value = this.currentTimeframe;
                document.getElementById('pattern-filter').value = data.settings.filters.pattern;
                document.getElementById('breakout-filter').value = data.settings.filters.breakout;
                document.getElementById('search-input').value = data.settings.filters.search;
                
                this.renderCoins();
                this.updateStats();
                return true;
            }
        }
        return false;
    }

    // إضافة نظام التنبيهات
    setupAlerts() {
        if ('Notification' in window) {
            Notification.requestPermission();
        }
    }

    checkForAlerts() {
        this.filteredCoins.forEach(coin => {
            if (coin.pattern.breakoutStatus === 'confirmed' && 
                coin.pattern.confidence > 80) {
                this.sendNotification(
                    `اختراق مؤكد: ${coin.baseAsset}`,
                    `تم اختراق نمط ${coin.pattern.name} بثقة ${coin.pattern.confidence}%`
                );
            }
        });
    }

    sendNotification(title, body) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico'
            });
        }
    }

    // إضافة وظائف التحليل المتقدم
    performAdvancedAnalysis(coin) {
        // تحليل إضافي للعملة
        const analysis = {
            technicalScore: this.calculateTechnicalScore(coin),
            volumeAnalysis: this.analyzeVolume(coin),
            priceAction: this.analyzePriceAction(coin),
            marketSentiment: this.analyzeMarketSentiment(coin)
        };

        return analysis;
    }

    calculateTechnicalScore(coin) {
        let score = 0;
        
        // نقاط للنمط الفني
        score += coin.pattern.confidence * 0.4;
        
        // نقاط للاختراق
        if (coin.pattern.breakoutStatus === 'confirmed') score += 30;
        else if (coin.pattern.breakoutStatus === 'pending') score += 15;
        
        // نقاط للسيولة
        score += coin.liquidity * 0.3;
        
        return Math.min(score, 100);
    }

    analyzeVolume(coin) {
        // تحليل الحجم مقارنة بالمتوسط
        const avgVolume = coin.volume; // يمكن تحسينه بحساب متوسط تاريخي
        
        if (coin.volume > avgVolume * 1.5) return 'حجم عالي';
        else if (coin.volume > avgVolume * 1.2) return 'حجم متوسط';
        else return 'حجم منخفض';
    }

    analyzePriceAction(coin) {
        if (Math.abs(coin.priceChange) > 10) return 'تحرك قوي';
        else if (Math.abs(coin.priceChange) > 5) return 'تحرك متوسط';
        else return 'تحرك ضعيف';
    }

    analyzeMarketSentiment(coin) {
        // تحليل بسيط للمشاعر بناءً على التغيير السعري والحجم
        if (coin.priceChange > 5 && coin.volume > 1000000) return 'إيجابي قوي';
        else if (coin.priceChange > 0) return 'إيجابي';
        else if (coin.priceChange < -5 && coin.volume > 1000000) return 'سلبي قوي';
        else return 'سلبي';
    }
}

// تشغيل التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // كل الكود الخاص بالتطبيق هنا
    
    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'حفظ البيانات';
    saveBtn.className = 'btn secondary';
    saveBtn.onclick = () => detector.saveToLocalStorage();
    toolbar.appendChild(saveBtn);
    
    // إعداد التنبيهات
    detector.setupAlerts();
    
    // فحص التنبيهات كل دقيقة
    setInterval(() => {
        detector.checkForAlerts();
    }, 60000);
    
}); // ← إغلاق DOMContentLoaded

// Service Worker خارج DOMContentLoaded
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('Service Worker registered successfully');
        })
        .catch(error => {
            console.log('Service Worker registration failed');
        });
}
