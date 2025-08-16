// Main Game class
export class Game {
    constructor(dataManager, uiManager) {
        this.dataManager = dataManager;
        this.uiManager = uiManager;
        this.isPlaying = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.lastUpdate = 0;
        this.gameSpeed = 1;
        
        // Game state
        this.currentScenario = null;
        this.farm = null;
        this.gameTime = null;
        this.resources = null;
        
        // Systems
        this.systems = new Map();
    }

    async init() {
        console.log('Initializing game systems...');
        
        // Initialize game systems
        const { FarmSystem } = await import('./systems/FarmSystem.js');
        const { CattleSystem } = await import('./systems/CattleSystem.js');
        const { WeatherSystem } = await import('./systems/WeatherSystem.js');
        const { MarketSystem } = await import('./systems/MarketSystem.js');
        const { TimeSystem } = await import('./systems/TimeSystem.js');
        
        this.systems.set('farm', new FarmSystem(this));
        this.systems.set('cattle', new CattleSystem(this));
        this.systems.set('weather', new WeatherSystem(this));
        this.systems.set('market', new MarketSystem(this));
        this.systems.set('time', new TimeSystem(this));
        
        // Initialize all systems
        for (const [name, system] of this.systems) {
            await system.init();
            console.log(`[OK] Initialized ${name} system`);
        }
        
        // Initialize farm renderer
        const canvas = document.getElementById('farm-canvas');
        if (canvas) {
            const { FarmRenderer } = await import('./FarmRenderer.js');
            this.farmRenderer = new FarmRenderer(canvas, this);
        }
        
        // Initialize audio manager
        const { AudioManager } = await import('./AudioManager.js');
        this.audioManager = new AudioManager();
        
        // Initialize tutorial manager
        const { TutorialManager } = await import('./TutorialManager.js');
        this.tutorialManager = new TutorialManager(this, this.uiManager);
        
        // Start menu music
        this.audioManager.playMusic('menu-theme');
    }

    async startNewGame(scenarioId) {
        try {
            console.log(`Starting new game with scenario: ${scenarioId}`);
            
            // Load scenario data
            this.currentScenario = await this.dataManager.getScenario(scenarioId);
            
            // Initialize game state
            this.initializeGameState();
            
            // Start systems
            for (const system of this.systems.values()) {
                system.start();
            }
            
            // Start game loop
            this.startGameLoop();
            this.isPlaying = true;
            
            // Switch to game music
            if (this.audioManager) {
                this.audioManager.playMusic('peaceful-farm');
            }
            
            // Update UI
            this.uiManager.updateGameUI(this.getGameState());
            
            // Check for auto-tutorials
            if (this.tutorialManager) {
                this.tutorialManager.checkAutoTutorials();
            }
            
        } catch (error) {
            console.error('Failed to start new game:', error);
            throw error;
        }
    }

    initializeGameState() {
        // Initialize resources based on scenario
        this.resources = {
            cash: this.currentScenario.startingCash || 50000,
            milk: 0,
            feed: this.currentScenario.startingFeed || 1000,
            energy: 100,
            reputation: 50
        };

        // Initialize farm
        this.farm = {
            name: this.currentScenario.farmName || 'My Dairy Farm',
            region: this.currentScenario.region,
            size: this.currentScenario.farmSize || 100, // hectares
            infrastructure: {
                milkingShed: this.currentScenario.startingInfrastructure?.milkingShed || 'basic',
                storage: this.currentScenario.startingInfrastructure?.storage || 1000,
                roads: this.currentScenario.startingInfrastructure?.roads || 'basic'
            },
            pastures: this.initializePastures()
        };

        // Initialize time
        this.gameTime = {
            day: 1,
            season: 'spring',
            year: 2024,
            hour: 6 // 6 AM start
        };
    }

    initializePastures() {
        const pastures = [];
        const pastureCount = Math.floor(this.farm.size / 10); // 10 hectares per pasture average
        
        for (let i = 0; i < pastureCount; i++) {
            pastures.push({
                id: i,
                size: 8 + Math.random() * 4, // 8-12 hectares
                quality: 70 + Math.random() * 20, // 70-90% quality
                currentStock: 0,
                maxStock: 0,
                grassLevel: 80 + Math.random() * 20,
                soilFertility: 60 + Math.random() * 30
            });
        }
        
        // Calculate max stock for each pasture
        pastures.forEach(pasture => {
            pasture.maxStock = Math.floor(pasture.size * 2.5); // 2.5 cows per hectare
        });
        
        return pastures;
    }

    startGameLoop() {
        this.lastUpdate = performance.now();
        this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
    }

    update(timestamp) {
        if (!this.isPaused) {
            const deltaTime = timestamp - this.lastUpdate;
            
            // Update all systems
            for (const system of this.systems.values()) {
                system.update(deltaTime);
            }
            
            // Update farm renderer
            if (this.farmRenderer) {
                this.farmRenderer.update(deltaTime);
            }
            
            // Update UI
            this.uiManager.updateGameUI(this.getGameState());
            
            this.lastUpdate = timestamp;
        }
        
        if (this.isPlaying) {
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }

    handleAction(actionType) {
        console.log(`Handling action: ${actionType}`);
        
        switch (actionType) {
            case 'feed-cattle':
                this.systems.get('cattle')?.feedCattle();
                break;
            case 'milk-cows':
                this.systems.get('cattle')?.milkCows();
                break;
            case 'manage-pasture':
                this.showPastureManagement();
                break;
            case 'buy-cattle':
                this.showCattlePurchase();
                break;
            case 'sell-milk':
                this.systems.get('market')?.sellMilk();
                break;
            case 'upgrade-farm':
                this.showUpgradeMenu();
                break;
            default:
                console.warn(`Unknown action: ${actionType}`);
        }
    }

    showPastureManagement() {
        // TODO: Implement pasture management UI
        this.uiManager.showNotification('Pasture management coming soon!', 'info');
    }

    showCattlePurchase() {
        // TODO: Implement cattle purchase UI
        this.uiManager.showNotification('Cattle purchase coming soon!', 'info');
    }

    showUpgradeMenu() {
        // TODO: Implement upgrade menu
        this.uiManager.showNotification('Farm upgrades coming soon!', 'info');
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.uiManager.updatePauseState(this.isPaused);
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        
        // Stop all systems
        for (const system of this.systems.values()) {
            system.stop();
        }
    }

    getGameState() {
        return {
            scenario: this.currentScenario,
            farm: this.farm,
            resources: this.resources,
            gameTime: this.gameTime,
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            systems: this.getSystemsState()
        };
    }

    getSystemsState() {
        const state = {};
        for (const [name, system] of this.systems) {
            state[name] = system.getState();
        }
        return state;
    }

    getSaveData() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            scenario: this.currentScenario,
            farm: this.farm,
            resources: this.resources,
            gameTime: this.gameTime,
            systems: this.getSystemsState()
        };
    }

    async loadGame(saveData) {
        try {
            console.log('Loading game from save data...');
            
            this.currentScenario = saveData.scenario;
            this.farm = saveData.farm;
            this.resources = saveData.resources;
            this.gameTime = saveData.gameTime;
            
            // Load system states
            for (const [name, system] of this.systems) {
                if (saveData.systems[name]) {
                    system.loadState(saveData.systems[name]);
                }
            }
            
            // Start systems
            for (const system of this.systems.values()) {
                system.start();
            }
            
            // Start game loop
            this.startGameLoop();
            this.isPlaying = true;
            
            console.log('Game loaded successfully!');
            
        } catch (error) {
            console.error('Failed to load game:', error);
            throw error;
        }
    }

    handleResize() {
        // Handle window resize
        if (this.farmRenderer) {
            this.farmRenderer.resize();
        }
    }
}