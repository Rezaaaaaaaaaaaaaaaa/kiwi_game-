// Scenario Manager for handling scenario-specific logic and events
export class ScenarioManager {
    constructor(game) {
        this.game = game;
        this.currentScenario = null;
        this.scenarioEvents = new Map();
        this.eventTimers = new Map();
    }

    init() {
        console.log('Initializing Scenario Manager...');
        this.loadScenarioEvents();
    }

    loadScenarioEvents() {
        // Canterbury-specific events
        this.scenarioEvents.set('canterbury', [
            {
                id: 'drought_warning',
                day: 45,
                season: 'summer',
                type: 'weather',
                title: 'Drought Warning Issued',
                description: 'Weather forecasters predict extended dry period. Consider water conservation.',
                effects: { waterCost: 1.5 },
                choices: [
                    { text: 'Implement water restrictions', cost: 5000, effect: 'reduce_water_usage' },
                    { text: 'Continue normal operations', effect: 'drought_risk' }
                ]
            },
            {
                id: 'irrigation_upgrade',
                day: 120,
                type: 'technology',
                title: 'Precision Irrigation Available',
                description: 'New precision irrigation technology can reduce water usage by 30%.',
                effects: { efficiency: 1.3 },
                choices: [
                    { text: 'Upgrade system', cost: 25000, effect: 'precision_irrigation' },
                    { text: 'Keep current system', effect: 'none' }
                ]
            }
        ]);

        // Waikato-specific events
        this.scenarioEvents.set('waikato', [
            {
                id: 'nitrogen_regulation',
                day: 30,
                type: 'regulation',
                title: 'New Nitrogen Limits',
                description: 'Regional council implements stricter nitrogen leaching limits.',
                effects: { nitrogenCap: 0.8 },
                choices: [
                    { text: 'Invest in low-nitrogen feed', cost: 15000, effect: 'compliant_feed' },
                    { text: 'Risk non-compliance', effect: 'compliance_risk' }
                ]
            },
            {
                id: 'cooperative_opportunity',
                day: 90,
                type: 'market',
                title: 'Cooperative Membership Offer',
                description: 'Local dairy cooperative offers membership with guaranteed milk price.',
                effects: { priceStability: true },
                choices: [
                    { text: 'Join cooperative', cost: 10000, effect: 'stable_prices' },
                    { text: 'Remain independent', effect: 'price_volatility' }
                ]
            }
        ]);

        // Add events for other scenarios...
        this.scenarioEvents.set('taranaki', [
            {
                id: 'facial_eczema_risk',
                day: 60,
                season: 'autumn',
                type: 'health',
                title: 'Facial Eczema Warning',
                description: 'High spore counts detected. Cattle health at risk.',
                effects: { cattleHealth: 0.7 },
                choices: [
                    { text: 'Apply zinc preventative', cost: 8000, effect: 'prevent_eczema' },
                    { text: 'Monitor closely', effect: 'health_risk' }
                ]
            }
        ]);

        this.scenarioEvents.set('southland', [
            {
                id: 'winter_feeding',
                day: 150,
                season: 'winter',
                type: 'feeding',
                title: 'Extended Winter',
                description: 'Harsh winter extending feeding period. Additional feed costs mounting.',
                effects: { feedCost: 1.8 },
                choices: [
                    { text: 'Buy premium feed', cost: 20000, effect: 'maintain_production' },
                    { text: 'Reduce feed quality', effect: 'production_drop' }
                ]
            }
        ]);

        this.scenarioEvents.set('bay-of-plenty', [
            {
                id: 'labor_shortage',
                day: 75,
                type: 'labor',
                title: 'Skilled Labor Shortage',
                description: 'Competition from kiwifruit industry creating labor shortage.',
                effects: { laborCost: 1.4 },
                choices: [
                    { text: 'Increase wages', cost: 12000, effect: 'attract_workers' },
                    { text: 'Automate more tasks', cost: 30000, effect: 'automation' }
                ]
            }
        ]);
    }

    setScenario(scenario) {
        this.currentScenario = scenario;
        this.scheduleScenarioEvents();
    }

    scheduleScenarioEvents() {
        if (!this.currentScenario) return;

        const events = this.scenarioEvents.get(this.currentScenario.id) || [];
        
        events.forEach(event => {
            const eventKey = `${this.currentScenario.id}_${event.id}`;
            this.eventTimers.set(eventKey, {
                ...event,
                triggered: false,
                scheduledDay: event.day
            });
        });

        console.log(`Scheduled ${events.length} events for ${this.currentScenario.name}`);
    }

    update(gameTime) {
        if (!this.currentScenario) return;

        // Check for triggered events
        for (const [eventKey, event] of this.eventTimers.entries()) {
            if (!event.triggered && this.shouldTriggerEvent(event, gameTime)) {
                this.triggerEvent(event);
                event.triggered = true;
            }
        }
    }

    shouldTriggerEvent(event, gameTime) {
        // Check day
        if (gameTime.day < event.scheduledDay) return false;

        // Check season if specified
        if (event.season && gameTime.season !== event.season) return false;

        return true;
    }

    triggerEvent(event) {
        console.log(`Triggering scenario event: ${event.title}`);
        
        // Apply immediate effects
        if (event.effects) {
            this.applyEventEffects(event.effects);
        }

        // Show event modal with choices
        this.showEventModal(event);
    }

    applyEventEffects(effects) {
        const game = this.game;
        
        if (effects.waterCost) {
            // Increase water-related costs
            console.log(`Water costs increased by ${effects.waterCost}x`);
        }
        
        if (effects.nitrogenCap) {
            // Reduce nitrogen application limits
            console.log(`Nitrogen cap reduced to ${effects.nitrogenCap}x`);
        }
        
        if (effects.cattleHealth) {
            // Affect cattle health
            const cattleSystem = game.systems.get('cattle');
            if (cattleSystem) {
                cattleSystem.adjustHealthMultiplier(effects.cattleHealth);
            }
        }
        
        if (effects.feedCost) {
            // Increase feed costs
            const marketSystem = game.systems.get('market');
            if (marketSystem) {
                marketSystem.adjustFeedCost(effects.feedCost);
            }
        }
    }

    showEventModal(event) {
        let modalContent = `
            <div class="scenario-event">
                <h3>${event.title}</h3>
                <p>${event.description}</p>
                <div class="event-choices">
        `;

        event.choices.forEach((choice, index) => {
            modalContent += `
                <button class="choice-btn" data-choice="${index}">
                    ${choice.text}
                    ${choice.cost ? `($${choice.cost.toLocaleString()})` : ''}
                </button>
            `;
        });

        modalContent += `
                </div>
            </div>
        `;

        this.game.uiManager.showModal(modalContent, 'Scenario Event');

        // Add event listeners for choices
        setTimeout(() => {
            const choiceBtns = document.querySelectorAll('.choice-btn');
            choiceBtns.forEach((btn, index) => {
                btn.addEventListener('click', () => {
                    this.handleEventChoice(event, index);
                    this.game.uiManager.hideModal();
                });
            });
        }, 100);
    }

    handleEventChoice(event, choiceIndex) {
        const choice = event.choices[choiceIndex];
        
        // Deduct cost if applicable
        if (choice.cost && this.game.resources.cash >= choice.cost) {
            this.game.resources.cash -= choice.cost;
        } else if (choice.cost) {
            this.game.uiManager.showNotification('Insufficient funds!', 'error');
            return;
        }

        // Apply choice effects
        this.applyChoiceEffect(choice.effect);
        
        // Show confirmation
        this.game.uiManager.showNotification(`Choice made: ${choice.text}`, 'info');
    }

    applyChoiceEffect(effect) {
        switch (effect) {
            case 'reduce_water_usage':
                // Implement water conservation
                this.game.farm.waterEfficiency = (this.game.farm.waterEfficiency || 1) * 1.2;
                break;
            case 'precision_irrigation':
                this.game.farm.infrastructure.irrigation = 'precision';
                this.game.farm.waterEfficiency = (this.game.farm.waterEfficiency || 1) * 1.3;
                break;
            case 'compliant_feed':
                this.game.farm.lowNitrogenFeed = true;
                break;
            case 'stable_prices':
                this.game.farm.cooperativeMember = true;
                break;
            case 'prevent_eczema':
                this.game.farm.zincTreatment = true;
                break;
            case 'maintain_production':
                this.game.farm.premiumFeed = true;
                break;
            case 'attract_workers':
                this.game.farm.laborEfficiency = (this.game.farm.laborEfficiency || 1) * 1.2;
                break;
            case 'automation':
                this.game.farm.automation = (this.game.farm.automation || 0) + 1;
                break;
            default:
                console.log(`Effect not implemented: ${effect}`);
        }
    }

    getScenarioProgress() {
        if (!this.currentScenario) return null;

        const events = this.scenarioEvents.get(this.currentScenario.id) || [];
        const triggeredEvents = Array.from(this.eventTimers.values()).filter(e => e.triggered).length;
        
        return {
            totalEvents: events.length,
            triggeredEvents: triggeredEvents,
            progress: events.length > 0 ? (triggeredEvents / events.length) * 100 : 100
        };
    }
}