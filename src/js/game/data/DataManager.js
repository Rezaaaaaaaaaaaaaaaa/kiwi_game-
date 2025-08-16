// Data Manager for handling game data, saves, and scenarios
export class DataManager {
    constructor() {
        this.scenarios = new Map();
        this.gameData = {};
    }

    async init() {
        console.log('Initializing Data Manager...');
        await this.loadScenarios();
        await this.loadGameData();
    }

    async loadScenarios() {
        // Define scenario data
        const scenarios = {
            canterbury: {
                id: 'canterbury',
                name: 'Canterbury Plains - The Irrigated Dream',
                region: 'Canterbury',
                difficulty: 'easy',
                description: 'Start your dairy farming journey on the flat, fertile Canterbury Plains with established irrigation infrastructure.',
                farmName: 'Plains View Farm',
                farmSize: 150, // hectares
                startingCash: 75000,
                startingFeed: 2000,
                startingCattle: 200,
                startingInfrastructure: {
                    milkingShed: 'herringbone',
                    storage: 15000,
                    roads: 'sealed',
                    irrigation: true
                },
                climate: {
                    rainfall: 'low',
                    temperature: 'moderate',
                    windRisk: 'high',
                    droughtRisk: 'high'
                },
                advantages: [
                    'Reliable irrigation system',
                    'Flat terrain for mechanization',
                    'Good infrastructure access',
                    'High stocking rate potential'
                ],
                challenges: [
                    'High land costs',
                    'Water allocation limits',
                    'Wind and dust issues',
                    'Drought vulnerability'
                ],
                goals: {
                    primary: 'Achieve 500kg milk solids per hectare',
                    secondary: 'Maintain environmental compliance',
                    financial: 'Reach $100,000 annual profit'
                }
            },
            waikato: {
                id: 'waikato',
                name: 'Waikato - Heartland Tradition',
                region: 'Waikato',
                difficulty: 'medium',
                description: 'Traditional dairy country with rolling hills, reliable rainfall, and established dairy support services.',
                farmName: 'Rolling Green Farm',
                farmSize: 120,
                startingCash: 60000,
                startingFeed: 1500,
                startingCattle: 300,
                startingInfrastructure: {
                    milkingShed: 'rotary',
                    storage: 12000,
                    roads: 'metal',
                    irrigation: false
                },
                climate: {
                    rainfall: 'high',
                    temperature: 'mild',
                    windRisk: 'low',
                    droughtRisk: 'low'
                },
                advantages: [
                    'Reliable rainfall',
                    'Excellent soil fertility',
                    'Established support services',
                    'Good grass growth'
                ],
                challenges: [
                    'Pugging in wet conditions',
                    'Nitrogen leaching regulations',
                    'Effluent management requirements',
                    'Higher compliance costs'
                ],
                goals: {
                    primary: 'Build 1000-cow operation',
                    secondary: 'Achieve environmental awards',
                    financial: 'Reach $150,000 annual profit'
                }
            },
            taranaki: {
                id: 'taranaki',
                name: 'Taranaki - Volcanic Advantage',
                region: 'Taranaki',
                difficulty: 'medium',
                description: 'Rich volcanic soils provide excellent grass growth, but steep terrain and weather create unique challenges.',
                farmName: 'Volcanic Vista Farm',
                farmSize: 90,
                startingCash: 55000,
                startingFeed: 1200,
                startingCattle: 220,
                startingInfrastructure: {
                    milkingShed: 'herringbone',
                    storage: 10000,
                    roads: 'basic',
                    irrigation: false
                },
                climate: {
                    rainfall: 'very-high',
                    temperature: 'mild',
                    windRisk: 'very-high',
                    droughtRisk: 'very-low'
                },
                advantages: [
                    'Rich volcanic soils',
                    'Excellent grass growth',
                    'Long grazing season',
                    'High per-hectare productivity'
                ],
                challenges: [
                    'Steep terrain limits mechanization',
                    'Erosion risks',
                    'Facial eczema threat',
                    'Wind damage to infrastructure'
                ],
                goals: {
                    primary: 'Maximize per-hectare profitability',
                    secondary: 'Prevent erosion on steep slopes',
                    financial: 'Achieve highest profit per hectare'
                }
            },
            southland: {
                id: 'southland',
                name: 'Southland - The Southern Challenge',
                region: 'Southland',
                difficulty: 'hard',
                description: 'Large flat paddocks and cheap land, but harsh winters and short growing seasons test your skills.',
                farmName: 'Southern Star Farm',
                farmSize: 200,
                startingCash: 80000,
                startingFeed: 3000,
                startingCattle: 400,
                startingInfrastructure: {
                    milkingShed: 'rotary',
                    storage: 20000,
                    roads: 'sealed',
                    irrigation: false
                },
                climate: {
                    rainfall: 'moderate',
                    temperature: 'cold',
                    windRisk: 'high',
                    droughtRisk: 'moderate'
                },
                advantages: [
                    'Large scale potential',
                    'Lower land costs',
                    'Less regulatory pressure',
                    'Flat terrain'
                ],
                challenges: [
                    'Harsh winter conditions',
                    'Short lactation season',
                    'High winter feeding costs',
                    'Frost and snow risks'
                ],
                goals: {
                    primary: 'Create low-cost, high-efficiency operation',
                    secondary: 'Survive three consecutive winters',
                    financial: 'Achieve 20% profit margin'
                }
            },
            'bay-of-plenty': {
                id: 'bay-of-plenty',
                name: 'Bay of Plenty - Kiwifruit to Cows',
                region: 'Bay of Plenty',
                difficulty: 'hard',
                description: 'Convert expensive horticultural land to dairy farming while competing with kiwifruit for prime real estate.',
                farmName: 'Golden Bay Farm',
                farmSize: 80,
                startingCash: 40000,
                startingFeed: 800,
                startingCattle: 0, // Start with land conversion
                startingInfrastructure: {
                    milkingShed: null, // Must build
                    storage: 0,
                    roads: 'excellent',
                    irrigation: true
                },
                climate: {
                    rainfall: 'moderate',
                    temperature: 'warm',
                    windRisk: 'low',
                    droughtRisk: 'moderate'
                },
                advantages: [
                    'Excellent climate',
                    'Existing irrigation',
                    'Good infrastructure',
                    'Diversification options'
                ],
                challenges: [
                    'Very high land costs',
                    'Complete infrastructure setup needed',
                    'Competition from horticulture',
                    'Skilled labor shortage'
                ],
                goals: {
                    primary: 'Successfully convert to profitable dairy operation',
                    secondary: 'Compete with kiwifruit returns',
                    financial: 'Break even within 3 years'
                }
            }
        };

        // Store scenarios
        for (const [id, scenario] of Object.entries(scenarios)) {
            this.scenarios.set(id, scenario);
        }

        console.log(`Loaded ${this.scenarios.size} scenarios`);
    }

    async loadGameData() {
        // Load additional game data (market prices, weather patterns, etc.)
        this.gameData = {
            marketPrices: {
                milkBase: 0.65, // Base milk price per litre
                feedCost: 0.25, // Cost per kg of feed
                cattlePrice: 1500, // Average price per cow
            },
            weatherPatterns: {
                canterbury: { droughtFrequency: 0.3, floodRisk: 0.1 },
                waikato: { droughtFrequency: 0.1, floodRisk: 0.2 },
                taranaki: { droughtFrequency: 0.05, floodRisk: 0.15 },
                southland: { droughtFrequency: 0.15, floodRisk: 0.1 },
                'bay-of-plenty': { droughtFrequency: 0.2, floodRisk: 0.1 }
            },
            regulations: {
                nitrogenLimits: true,
                stockExclusion: true,
                emissionsTrading: true
            }
        };
    }

    getScenario(scenarioId) {
        const scenario = this.scenarios.get(scenarioId);
        if (!scenario) {
            throw new Error(`Scenario not found: ${scenarioId}`);
        }
        return { ...scenario }; // Return a copy
    }

    getAllScenarios() {
        return Array.from(this.scenarios.values());
    }

    getMarketData() {
        return { ...this.gameData.marketPrices };
    }

    getWeatherData(region) {
        return this.gameData.weatherPatterns[region] || {};
    }

    // Save/Load functionality
    async saveGame(saveData) {
        try {
            const saveKey = `kiwiDairy_save_${Date.now()}`;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
            localStorage.setItem('kiwiDairy_lastSave', saveKey);
            console.log('Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            throw error;
        }
    }

    async loadGame() {
        try {
            const lastSaveKey = localStorage.getItem('kiwiDairy_lastSave');
            if (!lastSaveKey) {
                return null;
            }

            const saveData = localStorage.getItem(lastSaveKey);
            if (!saveData) {
                return null;
            }

            return JSON.parse(saveData);
        } catch (error) {
            console.error('Failed to load game:', error);
            throw error;
        }
    }

    async autoSave(saveData) {
        try {
            localStorage.setItem('kiwiDairy_autoSave', JSON.stringify(saveData));
            console.log('Auto-save completed');
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    }

    async loadAutoSave() {
        try {
            const autoSaveData = localStorage.getItem('kiwiDairy_autoSave');
            return autoSaveData ? JSON.parse(autoSaveData) : null;
        } catch (error) {
            console.error('Failed to load auto-save:', error);
            return null;
        }
    }

    getSaveList() {
        const saves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('kiwiDairy_save_')) {
                try {
                    const saveData = JSON.parse(localStorage.getItem(key));
                    saves.push({
                        key: key,
                        timestamp: saveData.timestamp,
                        scenario: saveData.scenario.name,
                        day: saveData.gameTime.day,
                        year: saveData.gameTime.year
                    });
                } catch (error) {
                    console.warn(`Invalid save data: ${key}`);
                }
            }
        }
        return saves.sort((a, b) => b.timestamp - a.timestamp);
    }

    deleteSave(saveKey) {
        localStorage.removeItem(saveKey);
        if (localStorage.getItem('kiwiDairy_lastSave') === saveKey) {
            localStorage.removeItem('kiwiDairy_lastSave');
        }
    }
}