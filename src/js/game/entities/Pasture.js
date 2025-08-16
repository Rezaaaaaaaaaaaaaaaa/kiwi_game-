export class Pasture {
    constructor(id, size, quality = 75) {
        this.id = id;
        this.size = size;
        this.quality = quality;
        this.grassLevel = 80 + Math.random() * 20;
        this.soilFertility = 60 + Math.random() * 30;
        this.currentStock = 0;
        this.maxStock = Math.floor(size * 2.5);
        this.fencing = 'basic';
        this.water = true;
        this.shade = Math.random() < 0.7;
        this.lastGrazed = null;
        this.restDays = 0;
        this.fertilized = false;
        this.irrigated = false;
        this.weeds = Math.random() * 20;
        this.pugging = 0;
    }

    updateGrass(weather, timeElapsed = 1) {
        let growthRate = this.getGrassGrowthRate(weather);
        
        if (this.currentStock > 0) {
            const grazingPressure = this.currentStock / this.maxStock;
            const consumptionRate = grazingPressure * 15;
            this.grassLevel = Math.max(0, this.grassLevel - consumptionRate);
            
            if (grazingPressure > 0.8) {
                this.pugging += 2;
            }
        }
        
        if (this.currentStock === 0 && this.restDays < 21) {
            this.restDays++;
            if (this.restDays >= 21) {
                growthRate *= 1.5;
            }
        }
        
        this.grassLevel = Math.min(100, this.grassLevel + growthRate);
        this.updateSoilFertility();
        this.manageWeeds();
    }

    getGrassGrowthRate(weather = {}) {
        let rate = 2;
        
        if (weather.temperature >= 15 && weather.temperature <= 25) {
            rate *= 1.5;
        } else if (weather.temperature < 5 || weather.temperature > 30) {
            rate *= 0.3;
        }
        
        if (weather.rainfall >= 20 && weather.rainfall <= 60) {
            rate *= 1.3;
        } else if (weather.rainfall < 5) {
            rate *= 0.2;
        } else if (weather.rainfall > 100) {
            rate *= 0.5;
        }
        
        rate *= (this.soilFertility / 100);
        rate *= (this.quality / 100);
        
        if (this.fertilized) {
            rate *= 1.4;
            this.fertilized = false;
        }
        
        if (this.irrigated && weather.rainfall < 20) {
            rate *= 1.2;
        }
        
        if (this.pugging > 50) {
            rate *= 0.7;
        }
        
        return Math.max(0.1, rate);
    }

    updateSoilFertility() {
        if (this.currentStock > 0) {
            const fertilityIncrease = (this.currentStock / this.maxStock) * 0.5;
            this.soilFertility = Math.min(100, this.soilFertility + fertilityIncrease);
        }
        
        if (this.pugging > 70) {
            this.soilFertility = Math.max(20, this.soilFertility - 0.1);
        }
    }

    manageWeeds() {
        if (this.grassLevel < 30) {
            this.weeds = Math.min(80, this.weeds + 2);
        } else if (this.grassLevel > 70) {
            this.weeds = Math.max(0, this.weeds - 1);
        }
        
        if (this.weeds > 50) {
            this.quality = Math.max(20, this.quality - 1);
        }
    }

    canAddCattle(count = 1) {
        return (this.currentStock + count) <= this.maxStock && this.grassLevel > 20;
    }

    addCattle(count = 1) {
        if (this.canAddCattle(count)) {
            this.currentStock += count;
            this.restDays = 0;
            this.lastGrazed = Date.now();
            return true;
        }
        return false;
    }

    removeCattle(count = 1) {
        this.currentStock = Math.max(0, this.currentStock - count);
        if (this.currentStock === 0) {
            this.restDays = 0;
        }
        return this.currentStock;
    }

    getStockingRate() {
        return this.size > 0 ? this.currentStock / this.size : 0;
    }

    getUtilization() {
        return this.maxStock > 0 ? this.currentStock / this.maxStock : 0;
    }

    getGrassQuality() {
        let quality = 'poor';
        
        if (this.grassLevel > 80) quality = 'excellent';
        else if (this.grassLevel > 60) quality = 'good';
        else if (this.grassLevel > 40) quality = 'fair';
        
        if (this.weeds > 40) {
            quality = quality === 'excellent' ? 'good' : 'poor';
        }
        
        return quality;
    }

    fertilize(type = 'standard') {
        const costs = {
            standard: 150,
            organic: 200,
            premium: 300
        };
        
        const effects = {
            standard: { fertility: 15, duration: 90 },
            organic: { fertility: 10, duration: 120 },
            premium: { fertility: 25, duration: 60 }
        };
        
        const effect = effects[type];
        this.soilFertility = Math.min(100, this.soilFertility + effect.fertility);
        this.fertilized = true;
        
        return costs[type];
    }

    reseed(grassType = 'ryegrass') {
        const costs = {
            ryegrass: 400,
            clover: 350,
            mixed: 450
        };
        
        this.grassLevel = 95;
        this.quality = Math.min(100, this.quality + 15);
        this.weeds = Math.max(0, this.weeds - 30);
        
        return costs[grassType];
    }

    upgradeFencing(type = 'electric') {
        const costs = {
            electric: 5000,
            post_and_wire: 7500,
            permanent: 12000
        };
        
        this.fencing = type;
        this.maxStock = Math.floor(this.size * (type === 'permanent' ? 3.0 : 2.5));
        
        return costs[type];
    }

    drainPasture() {
        if (this.pugging > 20) {
            this.pugging = Math.max(0, this.pugging - 50);
            this.soilFertility = Math.min(100, this.soilFertility + 10);
            return 2000;
        }
        return 0;
    }

    getMaintenanceCost() {
        let cost = this.size * 5;
        
        if (this.fencing === 'electric') cost += 50;
        if (this.fencing === 'post_and_wire') cost += 75;
        if (this.fencing === 'permanent') cost += 100;
        
        if (this.irrigated) cost += this.size * 2;
        if (this.weeds > 50) cost += this.size * 3;
        if (this.pugging > 50) cost += this.size * 4;
        
        return cost;
    }

    needsMaintenance() {
        const issues = [];
        
        if (this.weeds > 50) issues.push('weed-control');
        if (this.pugging > 50) issues.push('drainage');
        if (this.soilFertility < 40) issues.push('fertilizer');
        if (this.grassLevel < 20) issues.push('reseeding');
        if (this.quality < 50) issues.push('renovation');
        
        return issues;
    }

    getCondition() {
        let score = 0;
        
        score += this.grassLevel * 0.3;
        score += this.quality * 0.25;
        score += this.soilFertility * 0.25;
        score += Math.max(0, 100 - this.weeds) * 0.1;
        score += Math.max(0, 100 - this.pugging) * 0.1;
        
        if (score > 80) return 'excellent';
        if (score > 60) return 'good';
        if (score > 40) return 'fair';
        return 'poor';
    }

    serialize() {
        return {
            id: this.id,
            size: this.size,
            quality: this.quality,
            grassLevel: this.grassLevel,
            soilFertility: this.soilFertility,
            currentStock: this.currentStock,
            maxStock: this.maxStock,
            fencing: this.fencing,
            water: this.water,
            shade: this.shade,
            lastGrazed: this.lastGrazed,
            restDays: this.restDays,
            fertilized: this.fertilized,
            irrigated: this.irrigated,
            weeds: this.weeds,
            pugging: this.pugging
        };
    }

    static deserialize(data) {
        const pasture = new Pasture(data.id, data.size, data.quality);
        Object.assign(pasture, data);
        return pasture;
    }
}