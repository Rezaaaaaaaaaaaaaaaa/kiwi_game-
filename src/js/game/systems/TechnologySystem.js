// Technology System for managing research, upgrades, and progression
import { BaseSystem } from './BaseSystem.js';

export class TechnologySystem extends BaseSystem {
    constructor(game) {
        super(game);
        this.technologies = new Map();
        this.researchQueue = [];
        this.currentResearch = null;
        this.researchPoints = 0;
        this.researchRate = 1; // Points per day
    }

    async init() {
        await super.init();
        this.loadTechnologies();
        console.log('Technology System initialized');
    }

    loadTechnologies() {
        const techs = {
            // Infrastructure Technologies
            'herringbone_shed': {
                id: 'herringbone_shed',
                name: 'Herringbone Milking Shed',
                category: 'infrastructure',
                description: 'Efficient milking shed design for medium-scale operations.',
                cost: 50000,
                researchCost: 100,
                prerequisites: [],
                effects: {
                    milkingEfficiency: 1.3,
                    laborEfficiency: 1.2,
                    cattleCapacity: 300
                },
                unlocked: false
            },
            'rotary_shed': {
                id: 'rotary_shed',
                name: 'Rotary Milking Shed',
                category: 'infrastructure',
                description: 'High-capacity rotary platform for large operations.',
                cost: 120000,
                researchCost: 200,
                prerequisites: ['herringbone_shed'],
                effects: {
                    milkingEfficiency: 1.6,
                    laborEfficiency: 1.5,
                    cattleCapacity: 800
                },
                unlocked: false
            },
            'robotic_shed': {
                id: 'robotic_shed',
                name: 'Robotic Milking System',
                category: 'automation',
                description: 'Fully automated milking with individual cow monitoring.',
                cost: 300000,
                researchCost: 500,
                prerequisites: ['rotary_shed', 'activity_monitors'],
                effects: {
                    milkingEfficiency: 2.0,
                    laborEfficiency: 3.0,
                    cattleCapacity: 600,
                    individualMonitoring: true
                },
                unlocked: false
            },

            // Feeding Technologies
            'precision_feeding': {
                id: 'precision_feeding',
                name: 'Precision Feeding System',
                category: 'feeding',
                description: 'Automated feeding system with individual cow nutrition.',
                cost: 80000,
                researchCost: 150,
                prerequisites: [],
                effects: {
                    feedEfficiency: 1.4,
                    milkQuality: 1.2,
                    healthBonus: 0.1
                },
                unlocked: false
            },
            'supplement_optimization': {
                id: 'supplement_optimization',
                name: 'Supplement Optimization',
                category: 'feeding',
                description: 'Advanced mineral and vitamin supplementation.',
                cost: 25000,
                researchCost: 100,
                prerequisites: ['precision_feeding'],
                effects: {
                    reproductionRate: 1.15,
                    healthBonus: 0.15,
                    milkQuality: 1.1
                },
                unlocked: false
            },

            // Monitoring Technologies
            'activity_monitors': {
                id: 'activity_monitors',
                name: 'Activity Monitoring Collars',
                category: 'monitoring',
                description: 'Real-time monitoring of cow activity and health.',
                cost: 15000,
                researchCost: 120,
                prerequisites: [],
                effects: {
                    healthDetection: 1.5,
                    reproductionDetection: 1.8,
                    efficiencyBonus: 0.1
                },
                unlocked: false
            },
            'milk_analysis': {
                id: 'milk_analysis',
                name: 'Real-time Milk Analysis',
                category: 'monitoring',
                description: 'Instant milk quality and health analysis during milking.',
                cost: 35000,
                researchCost: 180,
                prerequisites: ['activity_monitors'],
                effects: {
                    qualityDetection: 2.0,
                    healthDetection: 1.3,
                    premiumPricing: 0.15
                },
                unlocked: false
            },

            // Genetics Technologies
            'genomic_selection': {
                id: 'genomic_selection',
                name: 'Genomic Selection Program',
                category: 'genetics',
                description: 'DNA-based breeding decisions for superior genetics.',
                cost: 60000,
                researchCost: 300,
                prerequisites: [],
                effects: {
                    breedingAccuracy: 1.8,
                    geneticGain: 1.5,
                    longTermBenefit: true
                },
                unlocked: false
            },
            'embryo_transfer': {
                id: 'embryo_transfer',
                name: 'Embryo Transfer Technology',
                category: 'genetics',
                description: 'Rapid multiplication of superior genetics.',
                cost: 40000,
                researchCost: 250,
                prerequisites: ['genomic_selection'],
                effects: {
                    reproductionRate: 1.6,
                    geneticUniformity: 1.4,
                    eliteOffspring: true
                },
                unlocked: false
            },

            // Environmental Technologies
            'effluent_system': {
                id: 'effluent_system',
                name: 'Advanced Effluent Management',
                category: 'environment',
                description: 'Closed-loop effluent system with nutrient recovery.',
                cost: 45000,
                researchCost: 140,
                prerequisites: [],
                effects: {
                    environmentalCompliance: 1.5,
                    fertilityBonus: 0.2,
                    regulatoryBonus: true
                },
                unlocked: false
            },
            'renewable_energy': {
                id: 'renewable_energy',
                name: 'On-farm Renewable Energy',
                category: 'environment',
                description: 'Solar and biogas systems for energy independence.',
                cost: 70000,
                researchCost: 200,
                prerequisites: ['effluent_system'],
                effects: {
                    energyCost: 0.3,
                    carbonCredits: true,
                    sustainabilityRating: 1.8
                },
                unlocked: false
            },

            // Digital Technologies
            'farm_management_software': {
                id: 'farm_management_software',
                name: 'Integrated Farm Management Software',
                category: 'digital',
                description: 'Comprehensive digital platform for farm operations.',
                cost: 20000,
                researchCost: 80,
                prerequisites: [],
                effects: {
                    decisionAccuracy: 1.3,
                    timeEfficiency: 1.2,
                    dataInsights: true
                },
                unlocked: false
            },
            'predictive_analytics': {
                id: 'predictive_analytics',
                name: 'Predictive Analytics Platform',
                category: 'digital',
                description: 'AI-powered predictions for optimal farm management.',
                cost: 35000,
                researchCost: 180,
                prerequisites: ['farm_management_software', 'activity_monitors'],
                effects: {
                    marketPrediction: 1.4,
                    healthPrediction: 1.6,
                    optimizationBonus: 0.25
                },
                unlocked: false
            }
        };

        // Store technologies
        for (const [id, tech] of Object.entries(techs)) {
            this.technologies.set(id, tech);
        }

        // Unlock basic technologies based on starting infrastructure
        this.checkInitialUnlocks();
    }

    checkInitialUnlocks() {
        const farm = this.game.farm;
        if (!farm) return;

        // Unlock technologies based on starting infrastructure
        const shedType = farm.infrastructure?.milkingShed;
        if (shedType === 'herringbone') {
            this.unlockTechnology('herringbone_shed');
        } else if (shedType === 'rotary') {
            this.unlockTechnology('herringbone_shed');
            this.unlockTechnology('rotary_shed');
        } else if (shedType === 'robotic') {
            this.unlockTechnology('herringbone_shed');
            this.unlockTechnology('rotary_shed');
            this.unlockTechnology('robotic_shed');
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Generate research points
        this.generateResearchPoints(deltaTime);
        
        // Progress current research
        this.progressResearch(deltaTime);
    }

    generateResearchPoints(deltaTime) {
        // Base research generation
        const baseRate = this.researchRate;
        
        // Bonuses from technologies and infrastructure
        let multiplier = 1.0;
        
        if (this.isTechnologyUnlocked('farm_management_software')) {
            multiplier *= 1.3;
        }
        
        if (this.isTechnologyUnlocked('predictive_analytics')) {
            multiplier *= 1.5;
        }

        // Education and training bonuses could be added here
        
        const pointsGained = (deltaTime / 86400000) * baseRate * multiplier; // deltaTime in ms, convert to days
        this.researchPoints += pointsGained;
    }

    progressResearch(deltaTime) {
        if (!this.currentResearch) return;

        const research = this.currentResearch;
        const progressRate = 1; // Progress points per day
        
        research.progress += (deltaTime / 86400000) * progressRate;
        
        if (research.progress >= research.requiredProgress) {
            this.completeResearch();
        }
    }

    startResearch(technologyId) {
        const tech = this.technologies.get(technologyId);
        if (!tech) {
            throw new Error(`Technology not found: ${technologyId}`);
        }

        if (tech.unlocked) {
            throw new Error(`Technology already unlocked: ${technologyId}`);
        }

        if (!this.canResearch(technologyId)) {
            throw new Error(`Prerequisites not met for: ${technologyId}`);
        }

        if (this.researchPoints < tech.researchCost) {
            throw new Error(`Insufficient research points for: ${technologyId}`);
        }

        // Deduct research points
        this.researchPoints -= tech.researchCost;

        // Start research
        this.currentResearch = {
            technologyId: technologyId,
            progress: 0,
            requiredProgress: tech.researchCost,
            startTime: Date.now()
        };

        console.log(`Started research: ${tech.name}`);
        this.game.uiManager?.showNotification(`Research started: ${tech.name}`, 'info');
    }

    completeResearch() {
        if (!this.currentResearch) return;

        const technologyId = this.currentResearch.technologyId;
        const tech = this.technologies.get(technologyId);

        // Unlock the technology
        this.unlockTechnology(technologyId);

        // Clear current research
        this.currentResearch = null;

        console.log(`Research completed: ${tech.name}`);
        this.game.uiManager?.showNotification(`Research completed: ${tech.name}!`, 'success');

        // Auto-start next research if queued
        if (this.researchQueue.length > 0) {
            const nextTech = this.researchQueue.shift();
            try {
                this.startResearch(nextTech);
            } catch (error) {
                console.warn(`Cannot start queued research ${nextTech}: ${error.message}`);
            }
        }
    }

    unlockTechnology(technologyId) {
        const tech = this.technologies.get(technologyId);
        if (!tech) return;

        tech.unlocked = true;
        
        // Apply technology effects
        this.applyTechnologyEffects(tech);
        
        console.log(`Technology unlocked: ${tech.name}`);
    }

    applyTechnologyEffects(tech) {
        const effects = tech.effects;
        const farm = this.game.farm;
        
        if (!farm.technologyEffects) {
            farm.technologyEffects = {};
        }

        // Store cumulative effects
        for (const [effect, value] of Object.entries(effects)) {
            if (typeof value === 'number') {
                farm.technologyEffects[effect] = (farm.technologyEffects[effect] || 1) * value;
            } else {
                farm.technologyEffects[effect] = value;
            }
        }

        // Apply immediate infrastructure changes
        if (tech.category === 'infrastructure') {
            this.applyInfrastructureUpgrade(tech);
        }
    }

    applyInfrastructureUpgrade(tech) {
        const farm = this.game.farm;
        
        switch (tech.id) {
            case 'herringbone_shed':
                farm.infrastructure.milkingShed = 'herringbone';
                break;
            case 'rotary_shed':
                farm.infrastructure.milkingShed = 'rotary';
                break;
            case 'robotic_shed':
                farm.infrastructure.milkingShed = 'robotic';
                break;
        }
    }

    canResearch(technologyId) {
        const tech = this.technologies.get(technologyId);
        if (!tech || tech.unlocked) return false;

        // Check prerequisites
        return tech.prerequisites.every(prereq => 
            this.isTechnologyUnlocked(prereq)
        );
    }

    isTechnologyUnlocked(technologyId) {
        const tech = this.technologies.get(technologyId);
        return tech ? tech.unlocked : false;
    }

    purchaseTechnology(technologyId) {
        const tech = this.technologies.get(technologyId);
        if (!tech) {
            throw new Error(`Technology not found: ${technologyId}`);
        }

        if (!tech.unlocked) {
            throw new Error(`Technology not researched: ${technologyId}`);
        }

        if (this.game.resources.cash < tech.cost) {
            throw new Error(`Insufficient funds for: ${technologyId}`);
        }

        // Deduct cost
        this.game.resources.cash -= tech.cost;

        // Mark as purchased
        if (!this.game.farm.purchasedTechnologies) {
            this.game.farm.purchasedTechnologies = new Set();
        }
        this.game.farm.purchasedTechnologies.add(technologyId);

        console.log(`Technology purchased: ${tech.name}`);
        this.game.uiManager?.showNotification(`Technology purchased: ${tech.name}!`, 'success');

        return true;
    }

    getTechnologyTree() {
        const categories = {};
        
        for (const tech of this.technologies.values()) {
            if (!categories[tech.category]) {
                categories[tech.category] = [];
            }
            categories[tech.category].push({
                ...tech,
                canResearch: this.canResearch(tech.id),
                isPurchased: this.game.farm?.purchasedTechnologies?.has(tech.id) || false
            });
        }

        return categories;
    }

    getResearchProgress() {
        if (!this.currentResearch) return null;

        const tech = this.technologies.get(this.currentResearch.technologyId);
        return {
            technology: tech,
            progress: this.currentResearch.progress,
            total: this.currentResearch.requiredProgress,
            percentage: (this.currentResearch.progress / this.currentResearch.requiredProgress) * 100
        };
    }

    getEffectiveMultiplier(effectName) {
        return this.game.farm?.technologyEffects?.[effectName] || 1;
    }

    getState() {
        return {
            technologies: Array.from(this.technologies.entries()),
            currentResearch: this.currentResearch,
            researchPoints: this.researchPoints,
            researchQueue: [...this.researchQueue]
        };
    }

    loadState(state) {
        if (state.technologies) {
            this.technologies = new Map(state.technologies);
        }
        this.currentResearch = state.currentResearch || null;
        this.researchPoints = state.researchPoints || 0;
        this.researchQueue = state.researchQueue || [];
    }
}