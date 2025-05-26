class CryptoPatternDetector {
    constructor() {
        this.coins = [];
        this.filteredCoins = [];
        this.patterns = this.initializePatterns();
        this.currentTimeframe = '1d';
        this.isLoading = false;
        this.updateInterval = null;
        
        this.init();
    }

    initializePatterns() {
        return {
            'double-bottom': {
                name: 'القاع الثنائي',
                nameEn: 'Double Bottom',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            },
            'triple-top': {
                name: 'القمة الثلاثية',
                nameEn: 'Triple Top',
                difficulty: 'مبتدئ',
                type: 'انعكاسي هابط'
            },
            'triple-bottom': {
                name: 'القاع الثلاثي',
                nameEn: 'Triple Bottom',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            },
            'head-shoulders': {
                name: 'الرأس والكتفين',
                nameEn: 'Head & Shoulders',
                difficulty: 'مبتدئ',
                type: 'انعكاسي هابط'
            },
            'inverted-head-shoulders': {
                name: 'الرأس والكتفين المقلوب',
                nameEn: 'Inverted Head & Shoulders',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            },
            'symmetrical-triangle': {
                name: 'المثلث المتماثل',
                nameEn: 'Symmetrical Triangle',
                difficulty: 'مبتدئ',
                type: 'استمراري'
            },
            'ascending-triangle': {
                name: 'المثلث الصاعد',
                nameEn: 'Ascending Triangle',
                difficulty: 'مبتدئ',
                type: 'استمراري صاعد'
            },
            'descending-triangle': {
                name: 'المثلث الهابط',
                nameEn: 'Descending Triangle',
                difficulty: 'مبتدئ',
                type: 'استمراري هابط'
            },
            'broadening-pattern': {
                name: 'النموذج المتباعد',
                nameEn: 'Broadening Pattern',
                difficulty: 'مبتدئ',
                type: 'انعكاسي'
            },
            'rectangle': {
                name: 'المستطيل',
                nameEn: 'Rectangle',
                difficulty: 'مبتدئ',
                type: 'استمراري'
            },
            'flags-pennants': {
                name: 'الأعلام والأعلام المثلثة',
                nameEn: 'Flags & Pennants',
                difficulty: 'مبتدئ',
                type: 'استمراري'
            },
            'rising-wedge': {
                name: 'الوتد الصاعد',
                nameEn: 'Rising Wedge',
                difficulty: 'مبتدئ',
                type: 'انعكاسي هابط'
            },
            'falling-wedge': {
                name: 'الوتد الهابط',
                nameEn: 'Falling Wedge',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            },
            'rounding-tops': {
                name: 'القمم المستديرة',
                nameEn: 'Rounding Tops',
                difficulty: 'مبتدئ',
                type: 'انعكاسي هابط'
            },
            'rounding-bottoms': {
                name: 'القيعان المستديرة',
                nameEn: 'Rounding Bottoms',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            },
            'v-top': {
                name: 'نموذج القمة V',
                nameEn: 'V Top Pattern',
                difficulty: 'مبتدئ',
                type: 'انعكاسي هابط'
            },
            'v-bottom': {
                name: 'نموذج القاع V',
                nameEn: 'V Bottom Pattern',
                difficulty: 'مبتدئ',
                type: 'انعكاسي صاعد'
            }
        };
    }

    async init() {
        this.setupEventListeners();
        await this.loadCryptoData();
        this.startAutoUpdate();
    }

    setupEventListeners() {
        // Filter event listeners
        document.getElementById('timeframe').addEventListener('change', (e) => {
            this.currentTimeframe = e.target.value;
            this.filterCoins();
        });

        document.getElementById('patternFilter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('breakoutFilter').addEventListener('change', () => {
            this.filterCoins();
        });

        document.getElementById('searchInput').addEventListener('input', () => {
            this.filterCoins();
        });

        document.getElementById('refreshBtn').addEventListener('click', () => {
            this.loadCryptoData();
        });

        // Modal event listeners
        const modal = document.getElementById('patternModal');
        const closeBtn = document.querySelector('.close');
        
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
            }
            if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
                e.preventDefault();
                this.loadCryptoData();
            }
        });
    }

    async loadCryptoData() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading(true);
        
        try {
            // Get all USDT pairs from Binance
            const tickerResponse = await fetch('https://api.binance.com/api/v3/ticker/24hr');
            const tickerData = await tickerResponse.json();
            
            // Filter USDT pairs and exclude stablecoins
            const usdtPairs = tickerData.filter(ticker => 
                ticker.symbol.endsWith('USDT') && 
                !this.isStableCoin(ticker.symbol) &&
                parseFloat(ticker.volume) > 1000000 // Minimum volume filter
            );

            // Get additional market data
            const priceResponse = await fetch('https://api.binance.com/api/v3/ticker/price');
            const priceData = await priceResponse.json();
            
            this.coins = await Promise.all(
                usdtPairs.slice(0, 100).map(async (ticker) => {
                    const coin = await this.processCoinData(ticker, priceData);
                    return coin;
                })
            );

            this.filterCoins();
            this.updateStats();
            this.showNotification('تم تحديث البيانات بنجاح', 'success');
            
        } catch (error) {
            console.error('Error loading crypto data:', error);
            this.showNotification('خطأ في تحميل البيانات', 'error');
        } finally {
            this.isLoading = false;
            this.showLoading(false);
        }
    }

    async processCoinData(ticker, priceData) {
        const symbol = ticker.symbol;
        const baseCoin = symbol.replace('USDT', '');
        
        // Simulate pattern detection (in real implementation, this would analyze price data)
        const detectedPattern = this.detectPattern(ticker);
        
        return {
            symbol: symbol,
            name: baseCoin,
            price: parseFloat(ticker.lastPrice),
            change24h: parseFloat(ticker.priceChangePercent),
            volume24h: parseFloat(ticker.volume),
            quoteVolume: parseFloat(ticker.quoteVolume),
            liquidity: this.calculateLiquidity(ticker),
            pattern: detectedPattern,
            targets: this.calculateTargets(parseFloat(ticker.lastPrice), detectedPattern),
            strength: this.calculatePatternStrength(detectedPattern),
            lastUpdate: new Date().toISOString()
        };
    }

    detectPattern(ticker) {
        // Simulate pattern detection based on price action
        const patterns = Object.keys(this.patterns);
        const price = parseFloat(ticker.lastPrice);
        const change = parseFloat(ticker.priceChangePercent);
        const volume = parseFloat(ticker.volume);
        
        // Simple pattern detection simulation
        if (Math.random() < 0.3) { // 30% chance of having a pattern
            const randomPattern = patterns[Math.floor(Math.random() * patterns.length)];
            const breakoutStatus = this.determineBreakoutStatus(change, volume);
            
            return {
                type: randomPattern,
                status: breakoutStatus,
                confidence: Math.random() * 100,
                timeframe: this.currentTimeframe
            };
        }
        
        return null;
    }

    determineBreakoutStatus(change, volume) {
        if (Math.abs(change) > 5 && volume > 5000000) {
            return 'confirmed';
        } else if (Math.abs(change) > 2) {
            return 'pending';
        }
        return 'none';
    }

    calculateLiquidity(ticker) {
        const volume = parseFloat(ticker.quoteVolume);
        const maxVolume = 1000000000; // 1B USDT as max reference
        return Math.min((volume / maxVolume) * 100, 100);
    }

    calculateTargets(currentPrice, pattern) {
        if (!pattern) return { target1: 0, target2: 0 };
        
        const isUpward = pattern.type.includes('صاعد') || pattern.type.includes('bottom') || pattern.type.includes('inverted');
        const multiplier = isUpward ? 1 : -1;
        
        return {
            target1: currentPrice * (1 + (0.05 * multiplier)),
            target2: currentPrice * (1 + (0.08 * multiplier))
        };
    }

    calculatePatternStrength(pattern) {
        if (!pattern) return 0;
        
        let strength = pattern.confidence || 0;
        
        // Adjust based on pattern type and status
        if (pattern.status === 'confirmed') strength += 20;
        if (pattern.status === 'pending') strength += 10;
        
        return Math.min(strength, 100);
    }

    isStableCoin(symbol) {
        const stableCoins = ['USDT', 'USDC', 'BUSD', 'DAI', 'TUSD', 'USDP', 'USDD'];
        const baseCoin = symbol.replace('USDT', '');
        return stableCoins.includes(baseCoin);
    }

    filterCoins() {
        const patternFilter = document.getElementById('patternFilter').value;
        const breakoutFilter = document.getElementById('breakoutFilter').value;
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();

        this.filteredCoins = this.coins.filter(coin => {
            // Pattern filter
            if (patternFilter !== 'all') {
                if (!coin.pattern || coin.pattern.type !== patternFilter) {
                    return false;
                }
            }

            // Breakout filter
            if (breakoutFilter !== 'all') {
                if (breakoutFilter === 'none' && coin.pattern) {
                    return false;
                }
                if (breakoutFilter !== 'none' && (!coin.pattern || coin.pattern.status !== breakoutFilter)) {
                    return false;
                }
            }

            // Search filter
            if (searchTerm && !coin.name.toLowerCase().includes(searchTerm) && 
                !coin.symbol.toLowerCase().includes(searchTerm)) {
                return false;
            }

            return true;
        });

        this.renderCoins();
        this.updateStats();
    }

    renderCoins() {
        const grid = document.getElementById('cardsGrid');
        grid.innerHTML = '';

        if (this.filteredCoins.length === 0) {
            grid.innerHTML = `
                <div class="error-message">
                    <i class="fas fa-search"></i>
                    <p>لا توجد عملات تطابق معايير البحث المحددة</p>
                </div>
            `;
            return;
        }

        this.filteredCoins.forEach((coin, index) => {
            const card = this.createCoinCard(coin, index);
            grid.appendChild(card);
        });
    }

    createCoinCard(coin, index) {
        const card = document.createElement('div');
        card.className = 'coin-card';
        card.style.animationDelay = `${index * 0.1}s`;

        const changeClass = coin.change24h >= 0 ? 'positive' : 'negative';
        const changeIcon = coin.change24h >= 0 ? 'fa-arrow-up' : 'fa-arrow-down';
        
        const patternInfo = coin.pattern ? 
            this.renderPatternInfo(coin.pattern) : 
            '<div class="no-pattern">لا يتوفر نموذج فني حالياً</div>';

        card.innerHTML = `
            <div class="coin-header">
                <div class="coin-logo">${coin.name.charAt(0)}</div>
                <div class="coin-info">
                    <h3>${coin.name}</h3>
                    <span class="symbol">${coin.symbol}</span>
                </div>
            </div>
            
            <div class="price-info">
                <div class="current-price">$${this.formatNumber(coin.price)}</div>
                <div class="price-change ${changeClass}">
                    <i class="fas ${changeIcon}"></i>
                    ${Math.abs(coin.change24h).toFixed(2)}%
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
            
            <div class="volume-info">
                <div class="label">حجم التداول 24س</div>
                <div class="value">$${this.formatNumber(coin.quoteVolume)}</div>
            </div>
            
            ${patternInfo}
            
            ${coin.pattern ? this.renderPatternStrength(coin.strength) : ''}
        `;

        card.addEventListener('click', () => this.showPatternModal(coin));
        
        return card;
    }

    renderPatternInfo(pattern) {
        const patternData = this.patterns[pattern.type];
        const statusClass = pattern.status || 'none';
        const statusText = this.getStatusText(pattern.status);

        return `
            <div class="pattern-info">
                <div class="pattern-name">${patternData.name}</div>
                <div class="pattern-status ${statusClass}">${statusText}</div>
            </div>
        `;
    }

    renderPatternStrength(strength) {
        const bars = 5;
        const filledBars = Math.ceil((strength / 100) * bars);
        
        let barsHtml = '';
        for (let i = 0; i < bars; i++) {
            let barClass = 'strength-bar';
            if (i < filledBars) {
                if (strength >= 70) barClass += ' active';
                else if (strength >= 40) barClass += ' medium';
                else barClass += ' weak';
            }
            barsHtml += `<div class="${barClass}"></div>`;
        }

        return `
            <div class="pattern-strength">
                <span style="font-size: 0.8rem; color: #ccc;">قوة النموذج:</span>
                <div class="strength-bars">${barsHtml}</div>
                <span style="font-size: 0.8rem; color: #ccc;">${strength.toFixed(0)}%</span>
            </div>
        `;
    }

    getStatusText(status) {
        const statusMap = {
            'confirmed': 'تم الاختراق',
            'pending': 'بانتظار تحقق الاختراق',
            'none': 'لا يوجد اختراق'
        };
        return statusMap[status] || 'غير محدد';
    }

    showPatternModal(coin) {
        const modal = document.getElementById('patternModal');
        
        // Update modal header
        document.getElementById('modalCoinLogo').textContent = coin.name.charAt(0);
        document.getElementById('modalCoinName').textContent = `${coin.name} (${coin.symbol})`;
        document.getElementById('modalCoinPrice').textContent = `$${this.formatNumber(coin.price)}`;

        if (coin.pattern) {
            const patternData = this.patterns[coin.pattern.type];
            
            // Update pattern details
            document.getElementById('modalPatternType').textContent = patternData.name;
            document.getElementById('modalDifficulty').textContent = patternData.difficulty;
            document.getElementById('modalBreakoutStatus').textContent = this.getStatusText(coin.pattern.status);
            document.getElementById('modalTimeframe').textContent = this.getTimeframeText(coin.pattern.timeframe);
            
            // Update targets
            document.getElementById('target1').textContent = `$${this.formatNumber(coin.targets.target1)}`;
            document.getElementById('target2').textContent = `$${this.formatNumber(coin.targets.target2)}`;
            
            // Update technical info
            document.getElementById('modalVolume').textContent = `$${this.formatNumber(coin.quoteVolume)}`;
            document.getElementById('modalLiquidity').textContent = `${coin.liquidity.toFixed(1)}%`;
            document.getElementById('modalStrength').textContent = `${coin.strength.toFixed(0)}%`;
        } else {
            // No pattern detected
            document.getElementById('modalPatternType').textContent = 'لا يتوفر نموذج فني حالياً';
            document.getElementById('modalDifficulty').textContent = '-';
            document.getElementById('modalBreakoutStatus').textContent = '-';
            document.getElementById('modalTimeframe').textContent = this.getTimeframeText(this.currentTimeframe);
            document.getElementById('target1').textContent = '-';
            document.getElementById('target2').textContent = '-';
            document.getElementById('modalVolume').textContent = `$${this.formatNumber(coin.quoteVolume)}`;
            document.getElementById('modalLiquidity').textContent = `${coin.liquidity.toFixed(1)}%`;
            document.getElementById('modalStrength').textContent = '-';
        }

        modal.style.display = 'block';
    }

    getTimeframeText(timeframe) {
        const timeframeMap = {
            '1d': 'يومي',
            '4h': '4 ساعات',
            '1h': 'ساعة واحدة',
            '3h': '3 ساعات'
        };
        return timeframeMap[timeframe] || timeframe;
    }

    updateStats() {
        const totalCoins = this.filteredCoins.length;
        const patternsFound = this.filteredCoins.filter(coin => coin.pattern).length;
        const confirmedBreakouts = this.filteredCoins.filter(coin => 
            coin.pattern && coin.pattern.status === 'confirmed'
        ).length;
        const pendingBreakouts = this.filteredCoins.filter(coin => 
            coin.pattern && coin.pattern.status === 'pending'
        ).length;

        document.getElementById('totalCoins').textContent = totalCoins;
        document.getElementById('patternsFound').textContent = patternsFound;
        document.getElementById('confirmedBreakouts').textContent = confirmedBreakouts;
        document.getElementById('pendingBreakouts').textContent = pendingBreakouts;
    }

    formatNumber(num) {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(2) + 'B';
        } else if (num >= 1e6) {
            return (num / 1e6).toFixed(2) + 'M';
        } else if (num >= 1e3) {
            return (num / 1e3).toFixed(2) + 'K';
        } else if (num >= 1) {
            return num.toFixed(2);
        } else {
            return num.toFixed(6);
        }
    }

    showLoading(show) {
        const loading = document.getElementById('loading');
        const grid = document.getElementById('cardsGrid');
        
        if (show) {
            loading.style.display = 'block';
            grid.style.display = 'none';
        } else {
            loading.style.display = 'none';
            grid.style.display = 'grid';
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Hide notification after 3 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    startAutoUpdate() {
        // Update data every 5 minutes
        this.updateInterval = setInterval(() => {
            if (!this.isLoading) {
                this.loadCryptoData();
            }
        }, 5 * 60 * 1000);
    }

    stopAutoUpdate() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // Advanced pattern detection methods (simplified for demo)
    detectDoubleBottom(priceData) {
        // Implement double bottom detection logic
        return Math.random() < 0.1; // 10% chance for demo
    }

    detectTripleTop(priceData) {
        // Implement triple top detection logic
        return Math.random() < 0.08; // 8% chance for demo
    }

    detectHeadAndShoulders(priceData) {
        // Implement head and shoulders detection logic
        return Math.random() < 0.06; // 6% chance for demo
    }

    detectTriangles(priceData) {
        // Implement triangle patterns detection logic
        return Math.random() < 0.15; // 15% chance for demo
    }

    detectWedges(priceData) {
        // Implement wedge patterns detection logic
        return Math.random() < 0.12; // 12% chance for demo
    }

    // Utility methods for technical analysis
    calculateSMA(prices, period) {
        if (prices.length < period) return null;
        const sum = prices.slice(-period).reduce((a, b) => a + b, 0);
        return sum / period;
    }

    calculateEMA(prices, period) {
        if (prices.length < period) return null;
        const multiplier = 2 / (period + 1);
        let ema = prices[0];
        
        for (let i = 1; i < prices.length; i++) {
            ema = (prices[i] * multiplier) + (ema * (1 - multiplier));
        }
        
        return ema;
    }

    calculateRSI(prices, period = 14) {
        if (prices.length < period + 1) return null;
        
        let gains = 0;
        let losses = 0;
        
        for (let i = 1; i <= period; i++) {
            const change = prices[i] - prices[i - 1];
            if (change > 0) {
                gains += change;
            } else {
                losses -= change;
            }
        }
        
        const avgGain = gains / period;
        const avgLoss = losses / period;
        const rs = avgGain / avgLoss;
        
        return 100 - (100 / (1 + rs));
    }

    // Error handling and recovery
    handleApiError(error) {
        console.error('API Error:', error);
        this.showNotification('خطأ في الاتصال بالخادم، جاري المحاولة مرة أخرى...', 'error');
        
        // Retry after 30 seconds
        setTimeout(() => {
            if (!this.isLoading) {
                this.loadCryptoData();
            }
        }, 30000);
    }

    // Performance optimization
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Data validation
    validateCoinData(coin) {
        return coin && 
               typeof coin.symbol === 'string' && 
               typeof coin.price === 'number' && 
               !isNaN(coin.price) &&
               coin.price > 0;
    }

    // Export functionality
    exportData() {
        const data = {
            timestamp: new Date().toISOString(),
            timeframe: this.currentTimeframe,
            totalCoins: this.filteredCoins.length,
            coins: this.filteredCoins.map(coin => ({
                symbol: coin.symbol,
                name: coin.name,
                price: coin.price,
                change24h: coin.change24h,
                pattern: coin.pattern,
                targets: coin.targets
            }))
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `crypto-patterns-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('تم تصدير البيانات بنجاح', 'success');
    }

    // Cleanup on page unload
    cleanup() {
        this.stopAutoUpdate();
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const detector = new CryptoPatternDetector();
    
    // Add floating action button for export
    const fab = document.createElement('button');
    fab.className = 'fab';
    fab.innerHTML = '<i class="fas fa-download"></i>';
    fab.title = 'تصدير البيانات';
    fab.addEventListener('click', () => detector.exportData());
    document.body.appendChild(fab);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        detector.cleanup();
    });
    
    // Handle online/offline status
    window.addEventListener('online', () => {
        detector.showNotification('تم استعادة الاتصال بالإنترنت', 'success');
        detector.loadCryptoData();
    });
    
    window.addEventListener('offline', () => {
        detector.showNotification('تم فقدان الاتصال بالإنترنت', 'warning');
    });
});

// Service Worker registration for PWA functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// Global error handler
window.addEventListener('error', (event) => {
    console.error('Global error:', event.error);
    // You can add error reporting here
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});
