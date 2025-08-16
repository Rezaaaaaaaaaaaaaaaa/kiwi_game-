import { BaseSystem } from './BaseSystem.js';

export class MarketSystem extends BaseSystem {
    applyPriceDrop() {
        this.prices.milk *= 0.7;
        this.game.uiManager.showNotification('Market event: Milk prices dropped!', 'warning');
    }
    constructor(game) {
        super(game);
        this.prices = {};
        this.priceHistory = [];
        this.marketTrends = {};
        this.lastPriceUpdate = 0;
        this.contracts = new Map();
        this.demandFactors = {};
        this.seasonalAdjustments = {};
    }

    async init() {
        await super.init();
        this.initializePrices();
        this.setupMarketTrends();
        this.initializeContracts();
    }

    initializePrices() {
        const baseData = this.game.dataManager.getMarketData();

        this.prices = {
            milk: baseData.milkBase,
            feed: baseData.feedCost,
            cattle: baseData.cattlePrice,
            land: 25000, // per hectare
            equipment: {
                tractor: 85000,
                feeder: 15000,
                fencing: 2500 // per km
            }
        };

        this.priceHistory.push({
            timestamp: Date.now(),
            ...JSON.parse(JSON.stringify(this.prices))
        });
    }

    setupMarketTrends() {
        this.marketTrends = {
            milk: {
                volatility: 0.15,
                seasonalPeak: 'spring',
                globalDemand: 1.0,
                localSupply: 1.0
            },
            feed: {
                volatility: 0.25,
                seasonalPeak: 'summer',
                droughtSensitive: true,
                importDependency: 0.6
            },
            cattle: {
                volatility: 0.10,
                breedDemand: {
                    'friesian': 1.0,
                    'jersey': 1.1,
                    'crossbred': 0.95
                }
            }
        };
    }

    initializeContracts() {
        this.contracts.set('fonterra', {
            name: 'Fonterra Co-operative',
            type: 'milk',
            basePrice: 0.68,
            premium: 0.03,
            qualityBonus: true,
            volumeDiscount: true,
            paymentTerms: 'monthly',
            active: false
        });

        this.contracts.set('openCountry', {
            name: 'Open Country Dairy',
            type: 'milk',
            basePrice: 0.66,
            premium: 0.02,
            qualityBonus: false,
            volumeDiscount: false,
            paymentTerms: 'weekly',
            active: false
        });

        this.contracts.set('feedSupplier', {
            name: 'Rural Feed Supplies',
            type: 'feed',
            basePrice: 0.23,
            bulkDiscount: 0.15,
            deliveryIncluded: true,
            minimumOrder: 1000,
            active: false
        });
    }

    update(deltaTime) {
        super.update(deltaTime);

        const currentHour = this.game.gameTime.hour;

        if (currentHour !== this.lastPriceUpdate) {
            if (currentHour % 6 === 0) { // Update prices every 6 hours
                this.updateMarketPrices();
            }
            this.lastPriceUpdate = currentHour;
        }
    }

    updateMarketPrices() {
        const season = this.game.gameTime.season;
        const weather = this.game.systems.get('weather')?.getCurrentWeather();

        // Update milk prices
        this.updateMilkPrices(season, weather);

        // Update feed prices
        this.updateFeedPrices(season, weather);

        // Update cattle prices
        this.updateCattlePrices();

        // Record price history
        this.priceHistory.push({
            timestamp: Date.now(),
            ...JSON.parse(JSON.stringify(this.prices))
        });

        // Limit history to last 365 entries (roughly 1 year)
        if (this.priceHistory.length > 365) {
            this.priceHistory.shift();
        }
    }

    updateMilkPrices(season, weather) {
        const trend = this.marketTrends.milk;
        let priceChange = (Math.random() - 0.5) * trend.volatility * 0.1;

        // Seasonal adjustments
        if (season === 'spring') priceChange += 0.02;
        if (season === 'winter') priceChange -= 0.01;

        // Weather effects
        if (weather?.drought) priceChange += 0.03;
        if (weather?.flooding) priceChange -= 0.02;

        // Global market simulation
        const globalFactor = (Math.random() - 0.5) * 0.05;
        priceChange += globalFactor;

        this.prices.milk = Math.max(0.3, this.prices.milk + priceChange);
    }

    updateFeedPrices(season, weather) {
        const trend = this.marketTrends.feed;
        let priceChange = (Math.random() - 0.5) * trend.volatility * 0.1;

        // Seasonal adjustments
        if (season === 'summer') priceChange -= 0.03; // Harvest season
        if (season === 'winter') priceChange += 0.04; // Storage costs

        // Weather sensitivity
        if (weather?.drought) priceChange += 0.08;
        if (weather?.flooding) priceChange += 0.05;

        this.prices.feed = Math.max(0.1, this.prices.feed + priceChange);
    }

    updateCattlePrices() {
        const trend = this.marketTrends.cattle;
        const baseChange = (Math.random() - 0.5) * trend.volatility * 0.05;

        // General market movement
        this.prices.cattle *= (1 + baseChange);

        // Breed-specific adjustments
        Object.keys(trend.breedDemand).forEach(breed => {
            const breedMultiplier = trend.breedDemand[breed];
            if (Math.random() < 0.1) { // 10% chance of breed-specific price change
                const breedChange = (Math.random() - 0.5) * 0.1;
                trend.breedDemand[breed] = Math.max(0.8, Math.min(1.3, breedMultiplier + breedChange));
            }
        });

        this.prices.cattle = Math.max(800, this.prices.cattle);
    }

    sellMilk(quantity = null) {
        const availableMilk = this.game.resources.milk;
        const sellQuantity = quantity || availableMilk;

        if (sellQuantity > availableMilk) {
            throw new Error('Not enough milk to sell');
        }

        let pricePerLiter = this.prices.milk;
        let totalRevenue = sellQuantity * pricePerLiter;

        // Apply contract bonuses if active
        const activeContract = this.getActiveContract('milk');
        if (activeContract) {
            pricePerLiter = activeContract.basePrice + activeContract.premium;

            if (activeContract.qualityBonus && this.game.farm.infrastructure.milkingShed === 'robotic') {
                pricePerLiter += 0.05;
            }

            if (activeContract.volumeDiscount && sellQuantity > 10000) {
                pricePerLiter += 0.02;
            }

            totalRevenue = sellQuantity * pricePerLiter;
        }

        // Quality adjustments
        const farmSystem = this.game.systems.get('farm');
        const buildingCondition = farmSystem?.getBuildingStatus()?.['milking-shed']?.condition || 100;

        if (buildingCondition < 70) {
            totalRevenue *= 0.9; // 10% penalty for poor conditions
        }

        this.game.resources.milk -= sellQuantity;
        this.game.resources.cash += totalRevenue;

        this.game.uiManager.showNotification(
            `Sold ${Math.round(sellQuantity)}L milk for $${Math.round(totalRevenue)} ($${pricePerLiter.toFixed(3)}/L)`,
            'success'
        );

        return totalRevenue;
    }

    buyFeed(quantity) {
        let pricePerKg = this.prices.feed;

        // Apply contract discounts if active
        const activeContract = this.getActiveContract('feed');
        if (activeContract && quantity >= activeContract.minimumOrder) {
            pricePerKg = activeContract.basePrice;
            if (quantity > 5000) {
                pricePerKg *= (1 - activeContract.bulkDiscount);
            }
        }

        const totalCost = quantity * pricePerKg;

        if (this.game.resources.cash < totalCost) {
            throw new Error('Insufficient funds to purchase feed');
        }

        // Check storage capacity
        const farmSystem = this.game.systems.get('farm');
        const storageCapacity = farmSystem?.buildings?.get('feed-storage')?.capacity || 1000;

        if (this.game.resources.feed + quantity > storageCapacity) {
            throw new Error('Not enough storage capacity');
        }

        this.game.resources.cash -= totalCost;
        this.game.resources.feed += quantity;

        this.game.uiManager.showNotification(
            `Purchased ${quantity}kg feed for $${Math.round(totalCost)} ($${pricePerKg.toFixed(3)}/kg)`,
            'success'
        );

        return totalCost;
    }

    buyCattle(breed, quantity = 1) {
        const cattleSystem = this.game.systems.get('cattle');
        if (!cattleSystem) {
            throw new Error('Cattle system not available');
        }

        try {
            cattleSystem.buyCattle(breed, quantity);
        } catch (error) {
            throw error;
        }
    }

    activateContract(contractId) {
        const contract = this.contracts.get(contractId);
        if (!contract) {
            throw new Error(`Contract not found: ${contractId}`);
        }

        // Deactivate other contracts of same type
        for (const [id, otherContract] of this.contracts) {
            if (otherContract.type === contract.type) {
                otherContract.active = false;
            }
        }

        contract.active = true;

        this.game.uiManager.showNotification(
            `Activated contract with ${contract.name}`,
            'success'
        );
    }

    getActiveContract(type) {
        for (const contract of this.contracts.values()) {
            if (contract.type === type && contract.active) {
                return contract;
            }
        }
        return null;
    }

    getMarketReport() {
        const report = {
            currentPrices: { ...this.prices },
            trends: {},
            contracts: Array.from(this.contracts.values()),
            priceHistory: this.priceHistory.slice(-30) // Last 30 entries
        };

        // Calculate trends
        if (this.priceHistory.length >= 2) {
            const current = this.priceHistory[this.priceHistory.length - 1];
            const previous = this.priceHistory[this.priceHistory.length - 2];

            report.trends.milk = current.milk - previous.milk;
            report.trends.feed = current.feed - previous.feed;
            report.trends.cattle = current.cattle - previous.cattle;
        }

        return report;
    }

    getState() {
        return {
            prices: this.prices,
            priceHistory: this.priceHistory,
            marketTrends: this.marketTrends,
            lastPriceUpdate: this.lastPriceUpdate,
            contracts: Array.from(this.contracts.entries()),
            demandFactors: this.demandFactors,
            seasonalAdjustments: this.seasonalAdjustments
        };
    }

    loadState(state) {
        this.prices = state.prices || {};
        this.priceHistory = state.priceHistory || [];
        this.marketTrends = state.marketTrends || {};
        this.lastPriceUpdate = state.lastPriceUpdate || 0;
        this.demandFactors = state.demandFactors || {};
        this.seasonalAdjustments = state.seasonalAdjustments || {};

        if (state.contracts) {
            this.contracts = new Map(state.contracts);
        }
    }
}