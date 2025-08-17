import { BaseSystem } from './BaseSystem.js';

export class FarmSystem extends BaseSystem {
    applyRegulation(type) {
        if (type === 'nitrogen') {
            this.maintenanceCosts *= 1.2;
            this.game.uiManager.showNotification('Regulation event: Nitrogen cap increases costs!', 'warning');
        }
    }
    constructor(game) {
        super(game);
        this.maintenanceCosts = 0;
        this.lastMaintenanceCheck = 0;
        this.buildings = new Map();
        this.infrastructure = {};
    }

    async init() {
        await super.init();
        // Don't setup buildings during system initialization
        // They will be setup when a game starts
    }

    setupBuildings() {
        const farm = this.game.farm;
        if (!farm) {
            console.log('No farm available yet, skipping building setup');
            return;
        }

        this.buildings.set('milking-shed', {
            type: farm.infrastructure.milkingShed,
            capacity: this.getMilkingCapacity(farm.infrastructure.milkingShed),
            condition: 100,
            efficiency: 100
        });

        this.buildings.set('feed-storage', {
            type: 'silo',
            capacity: farm.infrastructure.storage,
            condition: 100,
            currentStock: this.game.resources?.feed || 0
        });
    }

    start() {
        super.start();
        this.setupBuildings();
        this.calculateMaintenanceCosts();
    }

    getMilkingCapacity(shedType) {
        const capacities = {
            'basic': 100, // cows per milking
            'herringbone': 200,
            'rotary': 500,
            'robotic': 1000
        };
        return capacities[shedType] || 100;
    }

    update(deltaTime) {
        super.update(deltaTime);

        if (this.game.gameTime.hour !== this.lastMaintenanceCheck) {
            this.checkMaintenance();
            this.updateBuildings();
            this.managePastures();
            this.lastMaintenanceCheck = this.game.gameTime.hour;
        }
    }

    updateBuildings() {
        for (const [id, building] of this.buildings) {
            if (building.condition < 100 && Math.random() < 0.1) {
                building.condition = Math.min(100, building.condition + 1);
            }

            if (building.condition < 50 && Math.random() < 0.05) {
                building.condition = Math.max(0, building.condition - 1);
                this.game.uiManager.showNotification(
                    `${id} requires maintenance - condition ${building.condition}%`,
                    'warning'
                );
            }
        }
    }

    managePastures() {
        const farm = this.game.farm;
        const weather = this.game.systems.get('weather')?.getCurrentWeather();

        farm.pastures.forEach(pasture => {
            const grassGrowthRate = this.calculateGrassGrowth(pasture, weather);
            pasture.grassLevel = Math.min(100, pasture.grassLevel + grassGrowthRate);

            if (pasture.currentStock > 0) {
                const consumptionRate = pasture.currentStock * 0.1;
                pasture.grassLevel = Math.max(0, pasture.grassLevel - consumptionRate);
            }
        });
    }

    calculateGrassGrowth(pasture, weather = {}) {
        let growthRate = 0.5;

        if (weather.temperature > 15) growthRate += 0.3;
        if (weather.rainfall > 50) growthRate += 0.2;
        if (pasture.soilFertility > 70) growthRate += 0.2;

        growthRate *= (pasture.quality / 100);

        return growthRate;
    }

    calculateMaintenanceCosts() {
        const farm = this.game.farm;
        if (!farm) {
            this.maintenanceCosts = 0;
            return;
        }
        
        let dailyCost = 0;
        dailyCost += farm.size * 2;

        for (const [id, building] of this.buildings) {
            switch (id) {
                case 'milking-shed':
                    const shedCosts = {
                        'basic': 50,
                        'herringbone': 100,
                        'rotary': 150,
                        'robotic': 300
                    };
                    dailyCost += shedCosts[building.type] || 50;
                    break;
                case 'feed-storage':
                    dailyCost += building.capacity * 0.01;
                    break;
            }

            if (building.condition < 50) {
                dailyCost *= 1.5;
            }
        }

        this.maintenanceCosts = dailyCost;
    }

    checkMaintenance() {
        if (this.game.gameTime.hour === 6) {
            this.game.resources.cash -= this.maintenanceCosts;

            if (this.game.resources.cash < 0) {
                this.game.uiManager.showNotification(
                    'Warning: Insufficient funds for maintenance!',
                    'warning'
                );
            }
        }
    }

    upgradeMilkingShed(newType) {
        const costs = {
            'herringbone': 75000,
            'rotary': 200000,
            'robotic': 500000
        };

        const cost = costs[newType];
        if (!cost) {
            throw new Error(`Unknown milking shed type: ${newType}`);
        }

        if (this.game.resources.cash < cost) {
            throw new Error('Insufficient funds for upgrade');
        }

        this.game.resources.cash -= cost;
        this.game.farm.infrastructure.milkingShed = newType;

        const milkingShed = this.buildings.get('milking-shed');
        milkingShed.type = newType;
        milkingShed.capacity = this.getMilkingCapacity(newType);

        this.calculateMaintenanceCosts();

        this.game.uiManager.showNotification(
            `Upgraded to ${newType} milking system!`,
            'success'
        );
    }

    expandStorage(additionalCapacity) {
        const costPerLiter = 5;
        const cost = additionalCapacity * costPerLiter;

        if (this.game.resources.cash < cost) {
            throw new Error('Insufficient funds for storage expansion');
        }

        this.game.resources.cash -= cost;
        this.game.farm.infrastructure.storage += additionalCapacity;

        const feedStorage = this.buildings.get('feed-storage');
        feedStorage.capacity += additionalCapacity;

        this.calculateMaintenanceCosts();

        this.game.uiManager.showNotification(
            `Added ${additionalCapacity}L storage capacity!`,
            'success'
        );
    }

    getPastureUtilization() {
        const farm = this.game.farm;
        let totalCapacity = 0;
        let currentStock = 0;

        farm.pastures.forEach(pasture => {
            totalCapacity += pasture.maxStock;
            currentStock += pasture.currentStock;
        });

        return currentStock / totalCapacity;
    }

    getBuildingStatus() {
        const status = {};
        for (const [id, building] of this.buildings) {
            status[id] = {
                condition: building.condition,
                capacity: building.capacity,
                efficiency: building.efficiency || 100
            };
        }
        return status;
    }

    getState() {
        return {
            maintenanceCosts: this.maintenanceCosts,
            lastMaintenanceCheck: this.lastMaintenanceCheck,
            buildings: Array.from(this.buildings.entries()),
            infrastructure: this.infrastructure
        };
    }

    loadState(state) {
        this.maintenanceCosts = state.maintenanceCosts || 0;
        this.lastMaintenanceCheck = state.lastMaintenanceCheck || 0;

        if (state.buildings) {
            this.buildings = new Map(state.buildings);
        }

        if (state.infrastructure) {
            this.infrastructure = state.infrastructure;
        }
    }
}