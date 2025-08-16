export class Equipment {
    constructor(type, name, cost, capacity = 0) {
        this.type = type;
        this.name = name;
        this.cost = cost;
        this.capacity = capacity;
        this.condition = 100;
        this.age = 0;
        this.hoursUsed = 0;
        this.efficiency = 100;
        this.fuelType = this.determineFuelType();
        this.maintenanceSchedule = this.createMaintenanceSchedule();
        this.repairs = [];
        this.depreciation = this.calculateDepreciationRate();
    }

    determineFuelType() {
        const fuelTypes = {
            'tractor': 'diesel',
            'milking-system': 'electric',
            'feeder': 'electric',
            'mower': 'petrol',
            'spreader': 'tractor-pto',
            'cultivator': 'tractor-pto'
        };
        return fuelTypes[this.type] || 'none';
    }

    createMaintenanceSchedule() {
        const schedules = {
            'tractor': { hours: 250, cost: 500, type: 'service' },
            'milking-system': { hours: 1000, cost: 800, type: 'clean-service' },
            'feeder': { hours: 500, cost: 200, type: 'calibration' },
            'mower': { hours: 100, cost: 150, type: 'blade-service' },
            'spreader': { hours: 200, cost: 300, type: 'calibration' },
            'cultivator': { hours: 150, cost: 250, type: 'point-replacement' }
        };
        
        return schedules[this.type] || { hours: 500, cost: 200, type: 'general' };
    }

    calculateDepreciationRate() {
        const rates = {
            'tractor': 0.15,
            'milking-system': 0.10,
            'feeder': 0.20,
            'mower': 0.25,
            'spreader': 0.20,
            'cultivator': 0.18
        };
        return rates[this.type] || 0.15;
    }

    use(hours = 1) {
        if (this.condition < 20) {
            return false;
        }

        this.hoursUsed += hours;
        this.age += hours / 8760; // Convert hours to years

        const wearRate = this.getWearRate();
        this.condition = Math.max(0, this.condition - (wearRate * hours));

        this.efficiency = Math.min(100, this.condition * 0.8 + 20);

        if (Math.random() < 0.001 * hours && this.condition < 70) {
            this.breakdown();
        }

        return true;
    }

    getWearRate() {
        let rate = 0.1;
        
        if (this.age > 10) rate *= 2;
        else if (this.age > 5) rate *= 1.5;
        
        if (this.condition < 50) rate *= 1.5;
        
        return rate;
    }

    breakdown() {
        const breakdownTypes = [
            { type: 'mechanical', cost: 200 + Math.random() * 500, downtime: 24 },
            { type: 'electrical', cost: 150 + Math.random() * 300, downtime: 12 },
            { type: 'hydraulic', cost: 300 + Math.random() * 800, downtime: 36 },
            { type: 'wear-part', cost: 100 + Math.random() * 200, downtime: 8 }
        ];

        const breakdown = breakdownTypes[Math.floor(Math.random() * breakdownTypes.length)];
        breakdown.timestamp = Date.now();
        breakdown.resolved = false;

        this.repairs.push(breakdown);
        this.condition = Math.max(10, this.condition - 20);
        
        return breakdown;
    }

    repair(repairIndex) {
        if (repairIndex >= 0 && repairIndex < this.repairs.length) {
            const repair = this.repairs[repairIndex];
            if (!repair.resolved) {
                repair.resolved = true;
                repair.resolvedAt = Date.now();
                
                this.condition = Math.min(100, this.condition + 15);
                
                return repair.cost;
            }
        }
        return 0;
    }

    performMaintenance() {
        if (this.needsMaintenance()) {
            this.condition = Math.min(100, this.condition + 20);
            this.efficiency = Math.min(100, this.condition * 0.8 + 20);
            
            const lastMaintenance = this.hoursUsed;
            this.maintenanceSchedule.lastPerformed = lastMaintenance;
            
            return this.maintenanceSchedule.cost;
        }
        return 0;
    }

    needsMaintenance() {
        const schedule = this.maintenanceSchedule;
        const hoursSinceLast = this.hoursUsed - (schedule.lastPerformed || 0);
        
        return hoursSinceLast >= schedule.hours || this.condition < 60;
    }

    isOperational() {
        const unResolvedBreakdowns = this.repairs.filter(r => !r.resolved);
        return this.condition >= 20 && unResolvedBreakdowns.length === 0;
    }

    getMaintenanceCost() {
        let cost = this.cost * 0.08; // 8% annual maintenance
        
        if (this.age > 5) cost *= 1.5;
        if (this.age > 10) cost *= 2;
        if (this.condition < 50) cost *= 1.3;
        
        return cost / 365; // Daily cost
    }

    getFuelCost(hoursUsed = 1) {
        const fuelCosts = {
            'diesel': 1.45,      // per liter
            'petrol': 2.20,      // per liter
            'electric': 0.28,    // per kWh
            'tractor-pto': 0     // Uses tractor fuel
        };

        const fuelConsumption = {
            'tractor': 8,        // liters per hour
            'milking-system': 12, // kWh per hour
            'feeder': 2,         // kWh per hour
            'mower': 2.5,        // liters per hour
            'spreader': 0,       // Uses tractor PTO
            'cultivator': 0      // Uses tractor PTO
        };

        const fuelCost = fuelCosts[this.fuelType] || 0;
        const consumption = fuelConsumption[this.type] || 0;
        
        return fuelCost * consumption * hoursUsed;
    }

    getCurrentValue() {
        let value = this.cost;
        
        // Age depreciation
        value *= Math.pow(1 - this.depreciation, this.age);
        
        // Condition adjustment
        value *= (this.condition / 100);
        
        // Usage adjustment
        const expectedHours = this.age * 1000; // 1000 hours per year expected
        if (this.hoursUsed > expectedHours) {
            value *= 0.8;
        }
        
        return Math.max(value * 0.1, value);
    }

    getProductivity() {
        let productivity = this.efficiency / 100;
        
        if (!this.isOperational()) {
            productivity = 0;
        }
        
        if (this.condition < 30) {
            productivity *= 0.5;
        }
        
        return productivity;
    }

    getStatus() {
        const status = [];
        
        if (!this.isOperational()) status.push('Broken Down');
        else if (this.condition < 30) status.push('Poor Condition');
        else if (this.condition < 60) status.push('Needs Attention');
        
        if (this.needsMaintenance()) status.push('Due for Service');
        
        if (this.age > 10) status.push('Aging');
        
        return status.length ? status : ['Operational'];
    }

    getMaintenanceHistory() {
        const history = [];
        
        if (this.maintenanceSchedule.lastPerformed) {
            history.push({
                type: 'maintenance',
                hours: this.maintenanceSchedule.lastPerformed,
                cost: this.maintenanceSchedule.cost
            });
        }
        
        this.repairs.forEach(repair => {
            if (repair.resolved) {
                history.push({
                    type: 'repair',
                    description: repair.type,
                    cost: repair.cost,
                    timestamp: repair.resolvedAt
                });
            }
        });
        
        return history.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    }

    serialize() {
        return {
            type: this.type,
            name: this.name,
            cost: this.cost,
            capacity: this.capacity,
            condition: this.condition,
            age: this.age,
            hoursUsed: this.hoursUsed,
            efficiency: this.efficiency,
            fuelType: this.fuelType,
            maintenanceSchedule: this.maintenanceSchedule,
            repairs: this.repairs,
            depreciation: this.depreciation
        };
    }

    static deserialize(data) {
        const equipment = new Equipment(data.type, data.name, data.cost, data.capacity);
        Object.assign(equipment, data);
        return equipment;
    }

    static createStandardEquipment(type) {
        const equipment = {
            'tractor-small': { name: 'Compact Tractor', cost: 85000, capacity: 60 },
            'tractor-medium': { name: 'Medium Tractor', cost: 150000, capacity: 120 },
            'tractor-large': { name: 'Large Tractor', cost: 250000, capacity: 200 },
            'milking-herringbone': { name: 'Herringbone Milking System', cost: 75000, capacity: 200 },
            'milking-rotary': { name: 'Rotary Milking System', cost: 200000, capacity: 500 },
            'milking-robotic': { name: 'Robotic Milking System', cost: 500000, capacity: 60 },
            'feeder-mobile': { name: 'Mobile Feed Wagon', cost: 45000, capacity: 15000 },
            'feeder-stationary': { name: 'Stationary Feeder', cost: 25000, capacity: 20000 },
            'mower': { name: 'Rotary Mower', cost: 15000, capacity: 3.5 },
            'spreader': { name: 'Fertilizer Spreader', cost: 12000, capacity: 1500 },
            'cultivator': { name: 'Disc Cultivator', cost: 18000, capacity: 4.0 }
        };

        const spec = equipment[type];
        if (spec) {
            return new Equipment(type.split('-')[0], spec.name, spec.cost, spec.capacity);
        }
        
        return null;
    }
}