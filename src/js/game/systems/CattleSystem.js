import { BaseSystem } from './BaseSystem.js';

export class CattleSystem extends BaseSystem {
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
        if (!scenario || scenario.startingCattle === 0) return;

        const defaultBreed = this.breeds.get('friesian');
        
        for (let i = 0; i < scenario.startingCattle; i++) {
            this.cattle.push(this.createCow(defaultBreed, 'friesian'));
        }

        this.distributeCattleToPastures();
    }

    createCow(breed, breedId) {
        return {
            id: this.cattle.length + 1,
            breed: breedId,
            breedData: breed,
            age: 2 + Math.random() * 6, // 2-8 years
            health: 90 + Math.random() * 10,
            weight: 400 + Math.random() * 100,
            pregnant: Math.random() < 0.6,
            lactating: Math.random() < 0.8,
            milkYield: breed.milkYield * (0.8 + Math.random() * 0.4),
            daysInMilk: Math.floor(Math.random() * 300),
            lastCalving: Date.now() - (Math.random() * 365 * 24 * 60 * 60 * 1000),
            pastureId: null,
            feedStatus: 'good',
            temperament: breed.temperament
        };
    }

    distributeCattleToPastures() {
        const pastures = this.game.farm.pastures;
        if (!pastures.length) return;

        let pastureIndex = 0;
        
        this.cattle.forEach(cow => {
            const pasture = pastures[pastureIndex];
            if (pasture.currentStock < pasture.maxStock) {
                pasture.currentStock++;
                cow.pastureId = pasture.id;
            } else {
                pastureIndex = (pastureIndex + 1) % pastures.length;
                const nextPasture = pastures[pastureIndex];
                if (nextPasture.currentStock < nextPasture.maxStock) {
                    nextPasture.currentStock++;
                    cow.pastureId = nextPasture.id;
                }
            }
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        const currentHour = this.game.gameTime.hour;
        
        if (currentHour !== this.lastMilking && (currentHour === 6 || currentHour === 16)) {
            this.milkCows();
            this.lastMilking = currentHour;
        }
        
        if (currentHour !== this.lastFeeding && currentHour === 7) {
            this.feedCattle();
            this.lastFeeding = currentHour;
        }
        
        this.updateCattleHealth();
        this.calculateProduction();
        this.manageBreedingl();
    }

    milkCows() {
        let totalMilk = 0;
        const milkingShed = this.game.systems.get('farm')?.buildings?.get('milking-shed');
        const maxCapacity = milkingShed?.capacity || 100;
        
        const milkingCows = this.cattle
            .filter(cow => cow.lactating && cow.health > 50)
            .slice(0, maxCapacity);

        milkingCows.forEach(cow => {
            if (cow.lactating && cow.daysInMilk < 305) {
                let milkYield = cow.milkYield;
                
                milkYield *= (cow.health / 100);
                milkYield *= this.getLactationCurve(cow.daysInMilk);
                
                if (cow.feedStatus === 'poor') milkYield *= 0.7;
                if (cow.feedStatus === 'excellent') milkYield *= 1.1;
                
                totalMilk += milkYield;
                cow.daysInMilk++;
                
                if (cow.daysInMilk >= 305) {
                    cow.lactating = false;
                    cow.daysInMilk = 0;
                }
            }
        });
        
        this.game.resources.milk += totalMilk;
        this.milkProduction = totalMilk;
        
        if (milkingCows.length > 0) {
            this.game.uiManager.showNotification(
                `Milked ${milkingCows.length} cows, produced ${Math.round(totalMilk)}L`,
                'success'
            );
        }
    }

    getLactationCurve(daysInMilk) {
        if (daysInMilk < 50) {
            return 0.6 + (daysInMilk / 50) * 0.4;
        } else if (daysInMilk < 100) {
            return 1.0;
        } else if (daysInMilk < 200) {
            return 1.0 - ((daysInMilk - 100) / 100) * 0.3;
        } else {
            return 0.7 - ((daysInMilk - 200) / 105) * 0.5;
        }
    }

    feedCattle() {
        const totalFeedRequired = this.cattle.reduce((total, cow) => {
            return total + cow.breedData.feedRequirement;
        }, 0);
        
        if (this.game.resources.feed >= totalFeedRequired) {
            this.game.resources.feed -= totalFeedRequired;
            this.feedConsumption = totalFeedRequired;
            
            this.cattle.forEach(cow => {
                cow.feedStatus = 'good';
                cow.health = Math.min(100, cow.health + 2);
            });
            
            this.game.uiManager.showNotification(
                `Fed ${this.cattle.length} cattle (${Math.round(totalFeedRequired)}kg feed)`,
                'success'
            );
        } else {
            this.cattle.forEach(cow => {
                cow.feedStatus = 'poor';
                cow.health = Math.max(0, cow.health - 5);
            });
            
            this.game.uiManager.showNotification(
                'Insufficient feed! Cattle health declining.',
                'warning'
            );
        }
    }

    updateCattleHealth() {
        let totalHealth = 0;
        
        this.cattle.forEach(cow => {
            const pasture = this.game.farm.pastures.find(p => p.id === cow.pastureId);
            
            if (pasture) {
                if (pasture.grassLevel < 20) {
                    cow.health = Math.max(0, cow.health - 1);
                } else if (pasture.grassLevel > 80) {
                    cow.health = Math.min(100, cow.health + 0.5);
                }
            }
            
            const weather = this.game.systems.get('weather')?.getCurrentWeather();
            if (weather) {
                if (weather.temperature < 0 || weather.temperature > 30) {
                    cow.health = Math.max(0, cow.health - 0.5);
                }
            }
            
            if (Math.random() < 0.001) {
                cow.health = Math.max(0, cow.health - 20);
                this.game.uiManager.showNotification(
                    `Cow #${cow.id} has fallen ill!`,
                    'warning'
                );
            }
            
            totalHealth += cow.health;
        });
        
        this.averageHealth = this.cattle.length > 0 ? totalHealth / this.cattle.length : 100;
    }

    manageBreedingl() {
        this.cattle.forEach(cow => {
            if (!cow.pregnant && !cow.lactating && Math.random() < 0.002) {
                cow.pregnant = true;
                cow.gestationDays = 0;
            }
            
            if (cow.pregnant) {
                cow.gestationDays = (cow.gestationDays || 0) + 1;
                
                if (cow.gestationDays >= 280) {
                    cow.pregnant = false;
                    cow.lactating = true;
                    cow.daysInMilk = 0;
                    cow.gestationDays = 0;
                    cow.lastCalving = Date.now();
                    
                    if (Math.random() < 0.5) {
                        const calf = this.createCow(cow.breedData, cow.breed);
                        calf.age = 0;
                        calf.lactating = false;
                        this.cattle.push(calf);
                        
                        this.game.uiManager.showNotification(
                            `Cow #${cow.id} has given birth to a calf!`,
                            'success'
                        );
                    }
                }
            }
        });
    }

    calculateProduction() {
        this.milkProduction = this.cattle.reduce((total, cow) => {
            return total + (cow.lactating ? cow.milkYield : 0);
        }, 0);
    }

    buyCattle(breedId, quantity = 1) {
        const breed = this.breeds.get(breedId);
        if (!breed) {
            throw new Error(`Unknown breed: ${breedId}`);
        }
        
        const totalCost = breed.cost * quantity;
        if (this.game.resources.cash < totalCost) {
            throw new Error('Insufficient funds to purchase cattle');
        }
        
        this.game.resources.cash -= totalCost;
        
        for (let i = 0; i < quantity; i++) {
            const cow = this.createCow(breed, breedId);
            this.cattle.push(cow);
        }
        
        this.distributeCattleToPastures();
        
        this.game.uiManager.showNotification(
            `Purchased ${quantity} ${breed.name} cattle for $${totalCost}`,
            'success'
        );
    }

    sellCattle(cowId) {
        const cowIndex = this.cattle.findIndex(cow => cow.id === cowId);
        if (cowIndex === -1) {
            throw new Error('Cow not found');
        }
        
        const cow = this.cattle[cowIndex];
        const salePrice = cow.breedData.cost * 0.7; // 70% of purchase price
        
        this.game.resources.cash += salePrice;
        
        const pasture = this.game.farm.pastures.find(p => p.id === cow.pastureId);
        if (pasture) {
            pasture.currentStock--;
        }
        
        this.cattle.splice(cowIndex, 1);
        
        this.game.uiManager.showNotification(
            `Sold cow #${cowId} for $${salePrice}`,
            'success'
        );
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
            feedStatus: this.calculateFeedStatus()
        };
    }

    calculateFeedStatus() {
        if (this.cattle.length === 0) return 'Good';
        
        const poorFeedCount = this.cattle.filter(c => c.feedStatus === 'poor').length;
        const ratio = poorFeedCount / this.cattle.length;
        
        if (ratio > 0.5) return 'Poor';
        if (ratio > 0.2) return 'Fair';
        return 'Good';
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