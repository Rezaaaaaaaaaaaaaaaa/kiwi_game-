export class Cow {
    constructor(id, breed, age = 2) {
        this.id = id;
        this.breed = breed;
        this.age = age;
        this.health = 90 + Math.random() * 10;
        this.weight = 400 + Math.random() * 100;
        this.pregnant = false;
        this.lactating = Math.random() < 0.8;
        this.daysInMilk = Math.floor(Math.random() * 305);
        this.lastCalving = null;
        this.pastureId = null;
        this.feedStatus = 'good';
        this.milkYield = breed.milkYield * (0.8 + Math.random() * 0.4);
        this.gestationDays = 0;
        this.genetics = this.generateGenetics();
        this.behavior = this.generateBehavior();
    }

    generateGenetics() {
        return {
            milkProduction: 0.8 + Math.random() * 0.4,
            fertility: 0.8 + Math.random() * 0.4,
            health: 0.8 + Math.random() * 0.4,
            longevity: 0.8 + Math.random() * 0.4,
            temperament: Math.random()
        };
    }

    generateBehavior() {
        return {
            dominance: Math.random(),
            activity: Math.random(),
            feedingPreference: Math.random(),
            socialability: Math.random()
        };
    }

    updateAge(days) {
        this.age += days / 365;
        
        if (this.age > 8) {
            this.health *= 0.98;
            this.milkYield *= 0.95;
        }
    }

    updateHealth(factors = {}) {
        let healthChange = 0;
        
        if (factors.nutrition) {
            healthChange += factors.nutrition === 'good' ? 1 : -2;
        }
        
        if (factors.pasture) {
            healthChange += factors.pasture > 80 ? 0.5 : (factors.pasture < 20 ? -1 : 0);
        }
        
        if (factors.weather) {
            if (factors.weather.temperature < 0 || factors.weather.temperature > 30) {
                healthChange -= 0.5;
            }
        }
        
        this.health = Math.max(0, Math.min(100, this.health + healthChange));
    }

    canMilk() {
        return this.lactating && this.health > 50 && this.daysInMilk < 305;
    }

    milk() {
        if (!this.canMilk()) return 0;
        
        let yield = this.milkYield;
        
        yield *= (this.health / 100);
        yield *= this.getLactationCurve();
        yield *= this.genetics.milkProduction;
        
        if (this.feedStatus === 'poor') yield *= 0.7;
        if (this.feedStatus === 'excellent') yield *= 1.1;
        
        this.daysInMilk++;
        
        if (this.daysInMilk >= 305) {
            this.lactating = false;
            this.daysInMilk = 0;
        }
        
        return Math.max(0, yield);
    }

    getLactationCurve() {
        const dim = this.daysInMilk;
        
        if (dim < 50) {
            return 0.6 + (dim / 50) * 0.4;
        } else if (dim < 100) {
            return 1.0;
        } else if (dim < 200) {
            return 1.0 - ((dim - 100) / 100) * 0.3;
        } else {
            return 0.7 - ((dim - 200) / 105) * 0.5;
        }
    }

    updatePregnancy() {
        if (this.pregnant) {
            this.gestationDays++;
            
            if (this.gestationDays >= 280) {
                return this.giveBirth();
            }
        }
        return null;
    }

    giveBirth() {
        this.pregnant = false;
        this.lactating = true;
        this.daysInMilk = 0;
        this.gestationDays = 0;
        this.lastCalving = Date.now();
        
        return Math.random() < 0.5 ? 'calf' : null;
    }

    canBreed() {
        return !this.pregnant && !this.lactating && this.age >= 1.5 && this.health > 60;
    }

    breed() {
        if (!this.canBreed()) return false;
        
        const breedingSuccess = this.genetics.fertility * (this.health / 100);
        if (Math.random() < breedingSuccess) {
            this.pregnant = true;
            this.gestationDays = 0;
            return true;
        }
        return false;
    }

    getConditionScore() {
        let score = 5;
        
        if (this.health > 80) score += 1;
        if (this.health < 60) score -= 1;
        
        if (this.feedStatus === 'excellent') score += 0.5;
        if (this.feedStatus === 'poor') score -= 1;
        
        if (this.lactating && this.daysInMilk < 100) score -= 0.5;
        
        return Math.max(1, Math.min(9, score));
    }

    getValue() {
        let baseValue = this.breed.cost;
        
        baseValue *= (this.age < 6 ? 1 : 0.8);
        baseValue *= (this.health / 100);
        baseValue *= this.genetics.milkProduction;
        
        if (this.pregnant) baseValue *= 1.2;
        if (this.lactating && this.daysInMilk < 100) baseValue *= 1.1;
        
        return Math.max(baseValue * 0.5, baseValue);
    }

    getStatus() {
        let status = [];
        
        if (this.pregnant) status.push('Pregnant');
        if (this.lactating) status.push('Lactating');
        if (this.health < 70) status.push('Poor Health');
        if (this.feedStatus === 'poor') status.push('Underfed');
        if (this.age > 7) status.push('Aging');
        
        return status.length ? status : ['Healthy'];
    }

    serialize() {
        return {
            id: this.id,
            breed: this.breed,
            age: this.age,
            health: this.health,
            weight: this.weight,
            pregnant: this.pregnant,
            lactating: this.lactating,
            daysInMilk: this.daysInMilk,
            lastCalving: this.lastCalving,
            pastureId: this.pastureId,
            feedStatus: this.feedStatus,
            milkYield: this.milkYield,
            gestationDays: this.gestationDays,
            genetics: this.genetics,
            behavior: this.behavior
        };
    }

    static deserialize(data) {
        const cow = new Cow(data.id, data.breed, data.age);
        Object.assign(cow, data);
        return cow;
    }
}