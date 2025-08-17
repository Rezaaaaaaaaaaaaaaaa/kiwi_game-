// Statistics System for tracking and analyzing game performance
import { BaseSystem } from './BaseSystem.js';

export class StatisticsSystem extends BaseSystem {
    constructor(game) {
        super(game);
        this.dailyStats = [];
        this.achievements = new Map();
        this.milestones = new Map();
        this.analytics = {
            production: [],
            financial: [],
            efficiency: [],
            environmental: []
        };
        this.currentDay = 0;
    }

    async init() {
        await super.init();
        this.loadAchievements();
        this.loadMilestones();
        console.log('Statistics System initialized');
    }

    loadAchievements() {
        const achievements = {
            'first_milk': {
                id: 'first_milk',
                name: 'First Drop',
                description: 'Produce your first litre of milk',
                category: 'production',
                condition: (stats) => stats.totalMilkProduced > 0,
                reward: { reputation: 5 },
                unlocked: false
            },
            'hundred_cows': {
                id: 'hundred_cows',
                name: 'Century Herd',
                description: 'Own 100 or more cattle',
                category: 'growth',
                condition: (stats) => stats.currentCattle >= 100,
                reward: { cash: 5000 },
                unlocked: false
            },
            'million_litres': {
                id: 'million_litres',
                name: 'Million Litre Club',
                description: 'Produce 1 million litres of milk',
                category: 'production',
                condition: (stats) => stats.totalMilkProduced >= 1000000,
                reward: { reputation: 25, cash: 50000 },
                unlocked: false
            },
            'environmental_leader': {
                id: 'environmental_leader',
                name: 'Environmental Leader',
                description: 'Achieve maximum environmental compliance for 100 days',
                category: 'environment',
                condition: (stats) => stats.environmentalComplianceDays >= 100,
                reward: { reputation: 20 },
                unlocked: false
            },
            'profit_master': {
                id: 'profit_master',
                name: 'Profit Master',
                description: 'Achieve $500,000 in total profit',
                category: 'financial',
                condition: (stats) => stats.totalProfit >= 500000,
                reward: { reputation: 30 },
                unlocked: false
            },
            'tech_pioneer': {
                id: 'tech_pioneer',
                name: 'Technology Pioneer',
                description: 'Unlock 10 different technologies',
                category: 'technology',
                condition: (stats) => stats.technologiesUnlocked >= 10,
                reward: { researchPoints: 100 },
                unlocked: false
            },
            'weather_survivor': {
                id: 'weather_survivor',
                name: 'Weather Survivor',
                description: 'Survive 5 major weather events',
                category: 'resilience',
                condition: (stats) => stats.weatherEventsSurvived >= 5,
                reward: { reputation: 15 },
                unlocked: false
            },
            'efficiency_expert': {
                id: 'efficiency_expert',
                name: 'Efficiency Expert',
                description: 'Achieve 95% operational efficiency',
                category: 'efficiency',
                condition: (stats) => stats.averageEfficiency >= 95,
                reward: { reputation: 20 },
                unlocked: false
            },
            'master_breeder': {
                id: 'master_breeder',
                name: 'Master Breeder',
                description: 'Achieve 90% conception rate',
                category: 'breeding',
                condition: (stats) => stats.conceptionRate >= 90,
                reward: { reputation: 15 },
                unlocked: false
            },
            'sustainable_farmer': {
                id: 'sustainable_farmer',
                name: 'Sustainable Farmer',
                description: 'Use only renewable energy for 365 days',
                category: 'sustainability',
                condition: (stats) => stats.renewableEnergyDays >= 365,
                reward: { reputation: 40, cash: 25000 },
                unlocked: false
            }
        };

        for (const [id, achievement] of Object.entries(achievements)) {
            this.achievements.set(id, achievement);
        }
    }

    loadMilestones() {
        const milestones = {
            cattle_count: {
                id: 'cattle_count',
                name: 'Herd Size',
                thresholds: [10, 25, 50, 100, 250, 500, 1000],
                getValue: (stats) => stats.currentCattle,
                rewards: [
                    { reputation: 2 },
                    { reputation: 5 },
                    { reputation: 10, cash: 2500 },
                    { reputation: 15, cash: 5000 },
                    { reputation: 25, cash: 15000 },
                    { reputation: 40, cash: 35000 },
                    { reputation: 60, cash: 75000 }
                ]
            },
            daily_production: {
                id: 'daily_production',
                name: 'Daily Milk Production',
                thresholds: [100, 500, 1000, 2500, 5000, 10000, 20000],
                getValue: (stats) => stats.dailyMilkProduction,
                rewards: [
                    { reputation: 1 },
                    { reputation: 3 },
                    { reputation: 6, cash: 1000 },
                    { reputation: 12, cash: 5000 },
                    { reputation: 20, cash: 15000 },
                    { reputation: 35, cash: 40000 },
                    { reputation: 55, cash: 85000 }
                ]
            },
            farm_value: {
                id: 'farm_value',
                name: 'Farm Value',
                thresholds: [100000, 250000, 500000, 1000000, 2500000, 5000000, 10000000],
                getValue: (stats) => stats.farmValue,
                rewards: [
                    { reputation: 5 },
                    { reputation: 10 },
                    { reputation: 20, cash: 10000 },
                    { reputation: 35, cash: 25000 },
                    { reputation: 55, cash: 75000 },
                    { reputation: 80, cash: 150000 },
                    { reputation: 120, cash: 350000 }
                ]
            }
        };

        for (const [id, milestone] of Object.entries(milestones)) {
            milestone.currentLevel = 0;
            this.milestones.set(id, milestone);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update daily if new day
        const gameTime = this.game.gameTime;
        if (gameTime && gameTime.day !== this.currentDay) {
            this.recordDailyStats();
            this.currentDay = gameTime.day;
        }
        
        // Check achievements and milestones
        this.checkAchievements();
        this.checkMilestones();
    }

    recordDailyStats() {
        const game = this.game;
        const gameTime = game.gameTime;
        const resources = game.resources;
        const farm = game.farm;
        
        // Get system states
        const cattleSystem = game.systems.get('cattle');
        const marketSystem = game.systems.get('market');
        const weatherSystem = game.systems.get('weather');
        const farmSystem = game.systems.get('farm');

        const dailyStat = {
            day: gameTime.day,
            season: gameTime.season,
            year: gameTime.year,
            
            // Financial
            cash: resources.cash,
            dailyIncome: this.calculateDailyIncome(),
            dailyExpenses: this.calculateDailyExpenses(),
            netProfit: this.calculateDailyIncome() - this.calculateDailyExpenses(),
            
            // Production
            milkProduced: resources.milk,
            dailyMilkProduction: this.getDailyMilkProduction(),
            milkQuality: this.getMilkQuality(),
            
            // Cattle
            cattleCount: cattleSystem?.cattle?.length || 0,
            averageCattleHealth: this.getAverageCattleHealth(),
            conceptionRate: this.getConceptionRate(),
            
            // Farm
            pastureQuality: this.getAveragePastureQuality(),
            feedConsumption: this.getDailyFeedConsumption(),
            farmEfficiency: this.getFarmEfficiency(),
            
            // Environmental
            environmentalCompliance: this.getEnvironmentalCompliance(),
            carbonFootprint: this.getCarbonFootprint(),
            waterUsage: this.getWaterUsage(),
            
            // Weather
            temperature: weatherSystem?.currentWeather?.temperature || 15,
            rainfall: weatherSystem?.currentWeather?.rainfall || 0,
            weatherEvents: weatherSystem?.dailyEvents || []
        };

        this.dailyStats.push(dailyStat);
        
        // Keep only last 365 days
        if (this.dailyStats.length > 365) {
            this.dailyStats.shift();
        }

        // Update analytics
        this.updateAnalytics(dailyStat);
    }

    updateAnalytics(dailyStat) {
        // Production analytics
        this.analytics.production.push({
            day: dailyStat.day,
            milkProduction: dailyStat.dailyMilkProduction,
            efficiency: dailyStat.farmEfficiency,
            quality: dailyStat.milkQuality
        });

        // Financial analytics
        this.analytics.financial.push({
            day: dailyStat.day,
            income: dailyStat.dailyIncome,
            expenses: dailyStat.dailyExpenses,
            profit: dailyStat.netProfit,
            cash: dailyStat.cash
        });

        // Efficiency analytics
        this.analytics.efficiency.push({
            day: dailyStat.day,
            overall: dailyStat.farmEfficiency,
            cattle: dailyStat.averageCattleHealth,
            pasture: dailyStat.pastureQuality
        });

        // Environmental analytics
        this.analytics.environmental.push({
            day: dailyStat.day,
            compliance: dailyStat.environmentalCompliance,
            carbon: dailyStat.carbonFootprint,
            water: dailyStat.waterUsage
        });

        // Keep last 365 days for each analytics category
        Object.keys(this.analytics).forEach(key => {
            if (this.analytics[key].length > 365) {
                this.analytics[key].shift();
            }
        });
    }

    checkAchievements() {
        const stats = this.getCurrentStats();
        
        for (const achievement of this.achievements.values()) {
            if (!achievement.unlocked && achievement.condition(stats)) {
                this.unlockAchievement(achievement.id);
            }
        }
    }

    checkMilestones() {
        const stats = this.getCurrentStats();
        
        for (const milestone of this.milestones.values()) {
            const currentValue = milestone.getValue(stats);
            const currentLevel = milestone.currentLevel;
            
            // Check if we've reached a new threshold
            for (let i = currentLevel; i < milestone.thresholds.length; i++) {
                if (currentValue >= milestone.thresholds[i]) {
                    this.reachMilestone(milestone.id, i);
                    milestone.currentLevel = i + 1;
                } else {
                    break;
                }
            }
        }
    }

    unlockAchievement(achievementId) {
        const achievement = this.achievements.get(achievementId);
        if (!achievement) return;

        achievement.unlocked = true;
        achievement.unlockedDate = new Date();

        // Apply rewards
        this.applyRewards(achievement.reward);

        console.log(`Achievement unlocked: ${achievement.name}`);
        this.game.uiManager?.showNotification(`🏆 Achievement Unlocked: ${achievement.name}`, 'success');
    }

    reachMilestone(milestoneId, level) {
        const milestone = this.milestones.get(milestoneId);
        if (!milestone || level >= milestone.rewards.length) return;

        const reward = milestone.rewards[level];
        this.applyRewards(reward);

        const threshold = milestone.thresholds[level];
        console.log(`Milestone reached: ${milestone.name} - ${threshold}`);
        this.game.uiManager?.showNotification(`🎯 Milestone: ${milestone.name} - ${threshold.toLocaleString()}`, 'info');
    }

    applyRewards(reward) {
        if (!reward) return;

        if (reward.cash) {
            this.game.resources.cash += reward.cash;
        }
        if (reward.reputation) {
            this.game.resources.reputation += reward.reputation;
        }
        if (reward.researchPoints && this.game.systems.get('technology')) {
            this.game.systems.get('technology').researchPoints += reward.researchPoints;
        }
    }

    getCurrentStats() {
        const game = this.game;
        const cattleSystem = game.systems.get('cattle');
        const techSystem = game.systems.get('technology');
        
        return {
            totalMilkProduced: this.getTotalMilkProduced(),
            currentCattle: cattleSystem?.cattle?.length || 0,
            totalProfit: this.getTotalProfit(),
            technologiesUnlocked: this.getTechnologiesUnlocked(),
            weatherEventsSurvived: this.getWeatherEventsSurvived(),
            averageEfficiency: this.getAverageEfficiency(),
            conceptionRate: this.getConceptionRate(),
            renewableEnergyDays: this.getRenewableEnergyDays(),
            environmentalComplianceDays: this.getEnvironmentalComplianceDays(),
            dailyMilkProduction: this.getDailyMilkProduction(),
            farmValue: this.getFarmValue()
        };
    }

    // Helper methods for calculations
    calculateDailyIncome() {
        // Implementation depends on market system
        return this.game.systems.get('market')?.getTodaysIncome() || 0;
    }

    calculateDailyExpenses() {
        // Implementation depends on farm and cattle systems
        return this.game.systems.get('farm')?.getTodaysExpenses() || 0;
    }

    getDailyMilkProduction() {
        const latest = this.dailyStats[this.dailyStats.length - 1];
        const previous = this.dailyStats[this.dailyStats.length - 2];
        
        if (!latest || !previous) return 0;
        return latest.milkProduced - previous.milkProduced;
    }

    getMilkQuality() {
        // Base quality with bonuses from technology and management
        let quality = 85; // Base quality percentage
        
        const techSystem = this.game.systems.get('technology');
        if (techSystem?.isTechnologyUnlocked('milk_analysis')) {
            quality += 10;
        }
        
        return Math.min(100, quality);
    }

    getAverageCattleHealth() {
        const cattleSystem = this.game.systems.get('cattle');
        if (!cattleSystem?.cattle?.length) return 0;

        const totalHealth = cattleSystem.cattle.reduce((sum, cow) => sum + cow.health, 0);
        return totalHealth / cattleSystem.cattle.length;
    }

    getConceptionRate() {
        // Implementation would depend on breeding system
        return 75 + Math.random() * 20; // Placeholder
    }

    getAveragePastureQuality() {
        const farm = this.game.farm;
        if (!farm?.pastures?.length) return 0;

        const totalQuality = farm.pastures.reduce((sum, pasture) => sum + pasture.quality, 0);
        return totalQuality / farm.pastures.length;
    }

    getDailyFeedConsumption() {
        const cattleSystem = this.game.systems.get('cattle');
        return cattleSystem?.getDailyFeedConsumption() || 0;
    }

    getFarmEfficiency() {
        // Composite efficiency score
        const cattleHealth = this.getAverageCattleHealth();
        const pastureQuality = this.getAveragePastureQuality();
        const milkQuality = this.getMilkQuality();
        
        return (cattleHealth + pastureQuality + milkQuality) / 3;
    }

    getEnvironmentalCompliance() {
        // Implementation depends on environmental regulations and practices
        return 80 + Math.random() * 20; // Placeholder
    }

    getCarbonFootprint() {
        // Implementation would calculate actual carbon footprint
        return 1000 + Math.random() * 500; // Placeholder kg CO2
    }

    getWaterUsage() {
        // Implementation would track actual water usage
        return 5000 + Math.random() * 2000; // Placeholder litres
    }

    // Summary statistics methods
    getTotalMilkProduced() {
        return this.dailyStats.reduce((sum, stat) => sum + stat.milkProduced, 0);
    }

    getTotalProfit() {
        return this.dailyStats.reduce((sum, stat) => sum + stat.netProfit, 0);
    }

    getTechnologiesUnlocked() {
        const techSystem = this.game.systems.get('technology');
        if (!techSystem) return 0;

        let count = 0;
        for (const tech of techSystem.technologies.values()) {
            if (tech.unlocked) count++;
        }
        return count;
    }

    getWeatherEventsSurvived() {
        return this.dailyStats.reduce((sum, stat) => sum + stat.weatherEvents.length, 0);
    }

    getAverageEfficiency() {
        if (this.dailyStats.length === 0) return 0;
        
        const totalEfficiency = this.dailyStats.reduce((sum, stat) => sum + stat.farmEfficiency, 0);
        return totalEfficiency / this.dailyStats.length;
    }

    getRenewableEnergyDays() {
        return this.dailyStats.filter(stat => stat.renewableEnergy).length;
    }

    getEnvironmentalComplianceDays() {
        return this.dailyStats.filter(stat => stat.environmentalCompliance >= 90).length;
    }

    getFarmValue() {
        // Calculate total farm value including land, cattle, infrastructure, and cash
        const resources = this.game.resources;
        const farm = this.game.farm;
        const cattleSystem = this.game.systems.get('cattle');
        
        let value = resources.cash || 0;
        
        // Add cattle value
        if (cattleSystem?.cattle) {
            value += cattleSystem.cattle.length * 1500; // Average cow value
        }
        
        // Add land value (rough estimate)
        if (farm?.size) {
            value += farm.size * 50000; // $50k per hectare (varies by region)
        }
        
        // Add infrastructure value
        const infrastructure = farm?.infrastructure;
        if (infrastructure?.milkingShed === 'herringbone') value += 50000;
        else if (infrastructure?.milkingShed === 'rotary') value += 120000;
        else if (infrastructure?.milkingShed === 'robotic') value += 300000;
        
        if (infrastructure?.storage) value += infrastructure.storage * 2; // $2 per litre capacity
        
        return value;
    }

    getAnalytics(category, days = 30) {
        if (!this.analytics[category]) return [];
        
        return this.analytics[category].slice(-days);
    }

    getAchievementProgress() {
        const stats = this.getCurrentStats();
        const progress = [];
        
        for (const achievement of this.achievements.values()) {
            if (!achievement.unlocked) {
                // This would need more sophisticated progress calculation per achievement
                progress.push({
                    ...achievement,
                    progress: 0 // Placeholder - would need achievement-specific progress logic
                });
            }
        }
        
        return progress;
    }

    exportData() {
        return {
            dailyStats: this.dailyStats,
            analytics: this.analytics,
            achievements: Array.from(this.achievements.entries()),
            milestones: Array.from(this.milestones.entries())
        };
    }

    getState() {
        return {
            dailyStats: this.dailyStats,
            analytics: this.analytics,
            achievements: Array.from(this.achievements.entries()),
            milestones: Array.from(this.milestones.entries()),
            currentDay: this.currentDay
        };
    }

    loadState(state) {
        this.dailyStats = state.dailyStats || [];
        this.analytics = state.analytics || { production: [], financial: [], efficiency: [], environmental: [] };
        this.currentDay = state.currentDay || 0;
        
        if (state.achievements) {
            this.achievements = new Map(state.achievements);
        }
        if (state.milestones) {
            this.milestones = new Map(state.milestones);
        }
    }
}