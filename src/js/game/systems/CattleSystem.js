import { BaseSystem } from './BaseSystem.js';

export class CattleSystem extends BaseSystem {
    applyDisease(type) {
        if (type === 'mastitis') {
            this.cattle.forEach(cow => {
                if (cow.lactating && Math.random() < 0.2) {
                    cow.health = Math.max(0, cow.health - 20);
                }
            });
            this.game.uiManager.showNotification('Disease event: Mastitis outbreak!', 'warning');
        }
    }
    constructor(game) {
        super(game);
        this.cattle = [];
        this.breeds = new Map();
        this.milkProduction = 0;
        this.feedConsumption = 0;
        this.lastMilking = 0;
        this.lastFeeding = 0;
        this.averageHealth = 100;
        this.diseaseRisk = 0;
    }

    async init() {
        await super.init();
        this.setupBreeds();
        // Don't initialize cattle during system init - do it when game starts
    }

    start() {
        super.start();
        this.initializeCattle();
    }

    setupBreeds() {
        this.breeds.set('friesian', {
            name: 'Holstein-Friesian',
            milkYield: 25, // liters per day
            feedRequirement: 18, // kg per day
            cost: 1500,
            temperament: 'docile',
            adaptability: 'high',
            longevity: 6, // productive years
            calfingInterval: 365 // days
        });

        this.breeds.set('jersey', {
            name: 'Jersey',
            milkYield: 18,
            feedRequirement: 14,
            cost: 1300,
            temperament: 'gentle',
            adaptability: 'very-high',
            longevity: 7,
            calfingInterval: 350
        });

        this.breeds.set('crossbred', {
            name: 'Crossbred',
            milkYield: 22,
            feedRequirement: 16,
            cost: 1400,
            temperament: 'mixed',
            adaptability: 'high',
            longevity: 6,
            calfingInterval: 355
        });
    }

    initializeCattle() {
        const scenario = this.game.currentScenario;
        if (!scenario || scenario.startingCattle === 0) {
            console.log('No scenario or starting cattle, skipping cattle initialization');
            return;
        }

        const defaultBreed = this.breeds.get('friesian');

        for (let i = 0; i < scenario.startingCattle; i++) {
            this.cattle.push(this.createCow(defaultBreed, 'friesian'));
        }

        this.distributeCattleToPastures();
    }

    createCow(breed, breedId) {
        return {
            id: Date.now() + Math.random(),
            breedId: breedId,
            breed: breed.name,
            age: 24 + Math.random() * 36, // 2-5 years old
            health: 85 + Math.random() * 15,
            lactating: Math.random() < 0.8,
            pregnant: Math.random() < 0.3,
            milkYield: breed.milkYield * (0.8 + Math.random() * 0.4),
            feedRequirement: breed.feedRequirement,
            lastMilking: 0,
            daysInMilk: Math.floor(Math.random() * 300),
            pastureId: null,
            temperament: breed.temperament,
            weight: 450 + Math.random() * 150
        };
    }

    distributeCattleToPastures() {
        const farm = this.game.farm;
        if (!farm || !farm.pastures) return;

        const availablePastures = farm.pastures.filter(p => p.currentStock < p.maxStock);
        
        this.cattle.forEach(cow => {
            if (availablePastures.length > 0) {
                const pasture = availablePastures[Math.floor(Math.random() * availablePastures.length)];
                if (pasture.currentStock < pasture.maxStock) {
                    cow.pastureId = pasture.id;
                    pasture.currentStock++;
                }
            }
        });
    }

    feedCattle() {
        const feedRequired = this.cattle.length * 15; // 15kg per cow average
        
        if (this.game.resources.feed >= feedRequired) {
            this.game.resources.feed -= feedRequired;
            this.cattle.forEach(cow => {
                cow.health = Math.min(100, cow.health + 2);
                cow.lastFeeding = Date.now();
            });
            this.game.uiManager?.showNotification(`Fed ${this.cattle.length} cattle`, 'success');
        } else {
            this.game.uiManager?.showNotification('Not enough feed!', 'error');
        }
    }

    milkCows() {
        let totalMilk = 0;
        const lactatingCows = this.cattle.filter(cow => cow.lactating && cow.health > 50);
        
        lactatingCows.forEach(cow => {
            const milk = cow.milkYield * (cow.health / 100) * (0.8 + Math.random() * 0.4);
            totalMilk += milk;
            cow.lastMilking = Date.now();
        });

        this.game.resources.milk += totalMilk;
        this.milkProduction = totalMilk;
        
        this.game.uiManager?.showNotification(`Milked ${lactatingCows.length} cows: ${totalMilk.toFixed(1)}L`, 'success');
    }

    buyCattle(breedId, quantity) {
        const breed = this.breeds.get(breedId);
        if (!breed) return false;

        const totalCost = breed.cost * quantity;
        if (this.game.resources.cash < totalCost) {
            this.game.uiManager?.showNotification('Not enough cash!', 'error');
            return false;
        }

        this.game.resources.cash -= totalCost;
        
        for (let i = 0; i < quantity; i++) {
            this.cattle.push(this.createCow(breed, breedId));
        }

        this.distributeCattleToPastures();
        return true;
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update cattle health and production
        if (this.cattle.length > 0) {
            this.updateCattleHealth();
            this.calculateProduction();
        }
    }

    updateCattleHealth() {
        let totalHealth = 0;
        
        this.cattle.forEach(cow => {
            // Slowly regenerate health if well fed
            if (cow.health < 100) {
                cow.health = Math.min(100, cow.health + 0.1);
            }
            totalHealth += cow.health;
        });
        
        this.averageHealth = this.cattle.length > 0 ? totalHealth / this.cattle.length : 100;
    }

    calculateProduction() {
        this.milkProduction = this.cattle.reduce((total, cow) => {
            return total + (cow.lactating ? cow.milkYield * (cow.health / 100) : 0);
        }, 0);
    }

    getDailyFeedConsumption() {
        return this.cattle.reduce((total, cow) => total + cow.feedRequirement, 0);
    }

    adjustHealthMultiplier(multiplier) {
        this.cattle.forEach(cow => {
            cow.health = Math.max(0, Math.min(100, cow.health * multiplier));
        });
    }

    getState() {
        return {
            cattle: this.cattle,
            milkProduction: this.milkProduction,
            feedConsumption: this.feedConsumption,
            lastMilking: this.lastMilking,
            lastFeeding: this.lastFeeding,
            averageHealth: this.averageHealth,
            diseaseRisk: this.diseaseRisk,
            totalCows: this.cattle.length,
            milkingCows: this.cattle.filter(c => c.lactating).length,
            feedStatus: this.getFeedStatus()
        };
    }

    getFeedStatus() {
        if (this.cattle.length === 0) return 'Good';
        return this.averageHealth > 80 ? 'Good' : this.averageHealth > 60 ? 'Fair' : 'Poor';
    }

    loadState(state) {
        this.cattle = state.cattle || [];
        this.milkProduction = state.milkProduction || 0;
        this.feedConsumption = state.feedConsumption || 0;
        this.lastMilking = state.lastMilking || 0;
        this.lastFeeding = state.lastFeeding || 0;
        this.averageHealth = state.averageHealth || 100;
        this.diseaseRisk = state.diseaseRisk || 0;
    }
}