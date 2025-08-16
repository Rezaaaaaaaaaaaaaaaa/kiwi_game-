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

            // Trigger random events occasionally
            if (Math.random() < 0.002) {
                this.triggerRandomEvent();
            }

            this.lastUpdate = timestamp;
        }
        if (this.isPlaying) {
            this.gameLoop = requestAnimationFrame((timestamp) => this.update(timestamp));
        }
    }

    triggerRandomEvent() {
        const events = [
            {
                type: 'weather', message: 'A sudden storm hits! Pasture grass growth slows.', effect: () => {
                    this.systems.get('weather')?.applyStorm();
                }
            },
            {
                type: 'market', message: 'Global milk prices drop!', effect: () => {
                    this.systems.get('market')?.applyPriceDrop();
                }
            },
            {
                type: 'disease', message: 'Mastitis outbreak! Some cows lose health.', effect: () => {
                    this.systems.get('cattle')?.applyDisease('mastitis');
                }
            },
            {
                type: 'regulation', message: 'New nitrogen cap regulations increase costs.', effect: () => {
                    this.systems.get('farm')?.applyRegulation('nitrogen');
                }
            }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        this.uiManager.showNotification(event.message, 'warning');
        if (event.effect) event.effect();
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
            case 'tech-tree':
                this.showTechTree();
                break;
            case 'achievements':
                this.showAchievements();
                break;
            case 'leaderboard':
                this.showLeaderboard();
                break;
            case 'multiplayer':
                this.showMultiplayer();
                break;
            default:
                console.warn(`Unknown action: ${actionType}`);
        }
    }

    showAchievements() {
        // Achievements modal content
        const achievements = [
            { name: 'First Milking', unlocked: this.resources.milk > 0 },
            { name: '100 Cows', unlocked: this.systems.get('cattle')?.cattle.length >= 100 },
            { name: 'Environmental Award', unlocked: false },
            { name: 'Survive Winter', unlocked: this.gameTime.season === 'winter' && this.gameTime.day > 90 },
            { name: 'Tech Pioneer', unlocked: this.farm.infrastructure.milkingShed === 'robotic' }
        ];
        let content = `<div class='achievement-list'>`;
        achievements.forEach(a => {
            content += `<div class='achievement-item ${a.unlocked ? 'unlocked' : ''}'>
                <strong>${a.name}</strong>
                <span>${a.unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>`;
        });
        content += `</div>`;
        this.uiManager.showModal(content, 'Achievements');
    }

    showMultiplayer() {
        // Multiplayer modal stub
        let content = `<div class='multiplayer-list'>`;
        content += `<div class='multiplayer-item'><strong>Co-op Mode</strong>: Coming soon</div>`;
        content += `<div class='multiplayer-item'><strong>Competitive Leaderboards</strong>: Coming soon</div>`;
        content += `<div class='multiplayer-item'><strong>Discussion Groups</strong>: Coming soon</div>`;
        content += `</div>`;
        this.uiManager.showModal(content, 'Multiplayer Features');
    }

    showLeaderboard() {
        // Leaderboard modal content (local only for now)
        let content = `<div class='leaderboard-list'>`;
        content += `<div class='leaderboard-item'><strong>Farm Value</strong>: $${this.resources.cash}</div>`;
        content += `<div class='leaderboard-item'><strong>Milk Produced</strong>: ${this.resources.milk}L</div>`;
        content += `<div class='leaderboard-item'><strong>Cows Owned</strong>: ${this.systems.get('cattle')?.cattle.length || 0}</div>`;
        content += `</div>`;
        this.uiManager.showModal(content, 'Leaderboard');
    }
    showTechTree() {
        // Technology tree modal content
        const techs = [
            { name: 'Herringbone Shed', unlocked: this.farm.infrastructure.milkingShed === 'herringbone' },
            { name: 'Rotary Shed', unlocked: this.farm.infrastructure.milkingShed === 'rotary' },
            { name: 'Robotic Shed', unlocked: this.farm.infrastructure.milkingShed === 'robotic' },
            { name: 'Precision Feeding', unlocked: false },
            { name: 'Genomic Selection', unlocked: false },
            { name: 'Activity Monitors', unlocked: false },
            { name: 'Organic Certification', unlocked: false }
        ];
        let content = `<div class='tech-tree-list'>`;
        techs.forEach(tech => {
            content += `<div class='tech-tree-item ${tech.unlocked ? 'unlocked' : ''}'>
                <strong>${tech.name}</strong>
                <span>${tech.unlocked ? 'Unlocked' : 'Locked'}</span>
            </div>`;
        });
        content += `</div>`;
        this.uiManager.showModal(content, 'Technology Tree & Unlockables');
    }

    showPastureManagement() {
        // Pasture management modal content
        const pastures = this.farm?.pastures || [];
        let content = `<div class='pasture-list'>`;
        pastures.forEach(pasture => {
            content += `
                <div class='pasture-card'>
                    <strong>Pasture #${pasture.id + 1}</strong><br>
                    Size: ${pasture.size.toFixed(1)} ha<br>
                    Quality: ${pasture.quality.toFixed(0)}%<br>
                    Grass Level: ${pasture.grassLevel.toFixed(0)}%<br>
                    Stock: ${pasture.currentStock}/${pasture.maxStock}
                </div>
            `;
        });
        content += `</div>`;
        this.uiManager.showModal(content, 'Pasture Management');
    }

    showCattlePurchase() {
        // Cattle purchase modal content
        const breeds = Array.from(this.systems.get('cattle')?.breeds?.values() || []);
        let content = `<form id='cattle-purchase-form'>`;
        content += `<div class='cattle-purchase-group'>
            <label for='breed-select'>Breed:</label>
            <select id='breed-select'>`;
        breeds.forEach(breed => {
            content += `<option value='${breed.id}'>${breed.name} (${breed.milkYield}L/day)</option>`;
        });
        content += `</select></div>`;
        content += `<div class='cattle-purchase-group'>
            <label for='quantity-input'>Quantity:</label>
            <input type='number' id='quantity-input' min='1' max='100' value='1'>
        </div>`;
        content += `<button type='submit' class='cattle-purchase-btn'>Buy</button></form>`;
        this.uiManager.showModal(content, 'Buy Cattle');
        setTimeout(() => {
            const form = document.getElementById('cattle-purchase-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const breedId = document.getElementById('breed-select').value;
                    const quantity = parseInt(document.getElementById('quantity-input').value);
                    this.systems.get('cattle')?.buyCattle(breedId, quantity);
                    this.uiManager.showNotification(`Purchased ${quantity} cattle!`, 'success');
                    this.uiManager.hideModal();
                });
            }
        }, 100);
    }

    showUpgradeMenu() {
        // Farm upgrade modal content
        const shedTypes = ['basic', 'herringbone', 'rotary', 'robotic'];
        let content = `<form id='upgrade-form'>`;
        content += `<div class='upgrade-group'>
            <label for='shed-select'>Milking Shed:</label>
            <select id='shed-select'>`;
        shedTypes.forEach(type => {
            content += `<option value='${type}'>${type.charAt(0).toUpperCase() + type.slice(1)}</option>`;
        });
        content += `</select></div>`;
        content += `<div class='upgrade-group'>
            <label for='storage-input'>Storage Upgrade (L):</label>
            <input type='number' id='storage-input' min='0' max='100000' value='0'>
        </div>`;
        content += `<button type='submit' class='upgrade-btn'>Upgrade</button></form>`;
        this.uiManager.showModal(content, 'Farm Upgrades');
        setTimeout(() => {
            const form = document.getElementById('upgrade-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const shedType = document.getElementById('shed-select').value;
                    const storage = parseInt(document.getElementById('storage-input').value);
                    this.systems.get('farm')?.upgradeMilkingShed(shedType);
                    if (storage > 0) {
                        this.systems.get('farm')?.expandStorage(storage);
                    }
                    this.uiManager.showNotification('Farm upgraded!', 'success');
                    this.uiManager.hideModal();
                });
            }
        }, 100);
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