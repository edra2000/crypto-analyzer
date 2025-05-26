// patternDetector.js
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
            // ... (أضف باقي الأنماط بنفس الطريقة)
        };
    }

    async detectPatterns(priceData) {
        if (!priceData || priceData.length < 20) return null;
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
            } catch (error) {}
        }
        detectedPatterns.sort((a, b) => b.confidence - a.confidence);
        return detectedPatterns.length > 0 ? detectedPatterns[0] : null;
    }

    // مثال: دالة واحدة فقط، والبقية انسخها من كودك الأصلي
    detectDoubleBottom(data) {
        const lows = this.findLocalExtremes(data, 'low');
        if (lows.length < 2) return null;
        for (let i = 0; i < lows.length - 1; i++) {
            const bottom1 = lows[i], bottom2 = lows[i + 1];
            const priceDiff = Math.abs(bottom1.price - bottom2.price) / bottom1.price;
            const timeDiff = bottom2.index - bottom1.index;
            if (priceDiff < 0.03 && timeDiff > 10 && timeDiff < 50) {
                const neckline = Math.max(...data.slice(bottom1.index, bottom2.index).map(d => d.high));
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

    // --- بقية الدوال (انسخها من كودك القديم) ---

    // دوال مساعدة
    findLocalExtremes(data, type) {
        const extremes = [], lookback = 5;
        for (let i = lookback; i < data.length - lookback; i++) {
            let isExtreme = true, currentValue = data[i][type];
            for (let j = i - lookback; j <= i + lookback; j++) {
                if (j === i) continue;
                if (type === 'high' && data[j].high >= currentValue) { isExtreme = false; break;}
                if (type === 'low' && data[j].low <= currentValue) { isExtreme = false; break;}
            }
            if (isExtreme) {
                extremes.push({ index: i, price: currentValue, timestamp: data[i].timestamp });
            }
        }
        return extremes;
    }
    // ... أي دوال مساعدة أخرى
}

// إذا كنت تستخدم ES Modules
export default PatternDetector;

// إذا كنت تستعمله مباشرة في HTML، لا تضف سطر التصدير السابق
