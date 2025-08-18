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
        const { TechnologySystem } = await import('./systems/TechnologySystem.js');
        const { StatisticsSystem } = await import('./systems/StatisticsSystem.js');

        this.systems.set('farm', new FarmSystem(this));
        this.systems.set('cattle', new CattleSystem(this));
        this.systems.set('weather', new WeatherSystem(this));
        this.systems.set('market', new MarketSystem(this));
        this.systems.set('time', new TimeSystem(this));
        this.systems.set('technology', new TechnologySystem(this));
        this.systems.set('statistics', new StatisticsSystem(this));

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

        // Initialize scenario manager
        const { ScenarioManager } = await import('./scenarios/ScenarioManager.js');
        this.scenarioManager = new ScenarioManager(this);
        this.scenarioManager.init();

        // Initialize enhanced graphics systems
        const { PerformanceMonitor } = await import('./ui/PerformanceMonitor.js');
        const { BackgroundGraphics } = await import('./ui/BackgroundGraphics.js');
        const { PlotManager } = await import('./ui/PlotManager.js');
        
        this.backgroundGraphics = new BackgroundGraphics(document.body);
        
        const monitorContainer = document.createElement('div');
        monitorContainer.id = 'monitor-container';
        document.body.appendChild(monitorContainer);
        this.performanceMonitor = new PerformanceMonitor(this, monitorContainer);
        
        // Initialize plot manager
        this.plotManager = new PlotManager(this);
        this.plotManager.init();

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

            // Set scenario in scenario manager
            if (this.scenarioManager) {
                this.scenarioManager.setScenario(this.currentScenario);
            }

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

            // Update background graphics for game time
            if (this.backgroundGraphics) {
                this.backgroundGraphics.setTimeOfDay(0.5); // Daytime start
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

            // Update plot manager
            if (this.plotManager) {
                this.plotManager.update(deltaTime);
            }

            // Update background graphics with time of day
            if (this.backgroundGraphics && this.gameTime) {
                const timeOfDay = (this.gameTime.hour / 24.0);
                this.backgroundGraphics.setTimeOfDay(timeOfDay);
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
            case 'research':
                this.showResearch();
                break;
            case 'achievements':
                this.showAchievements();
                break;
            case 'statistics':
                this.showStatistics();
                break;
            case 'leaderboard':
                this.showLeaderboard();
                break;
            case 'multiplayer':
                this.showMultiplayer();
                break;
            case 'show-plots':
            case 'toggle-plots':
                this.plotManager?.togglePlotsVisibility();
                break;
            case 'export-analytics':
                this.exportAnalytics();
                break;
            default:
                console.warn(`Unknown action: ${actionType}`);
        }
    }

    showAchievements() {
        const statsSystem = this.systems.get('statistics');
        if (!statsSystem) return;

        const achievements = Array.from(statsSystem.achievements.values());
        const milestones = Array.from(statsSystem.milestones.values());
        
        let content = `<div class='achievements-container'>
            <div class='achievements-section'>
                <h4>Achievements</h4>
                <div class='achievement-list'>`;
        
        achievements.forEach(achievement => {
            content += `<div class='achievement-item ${achievement.unlocked ? 'unlocked' : 'locked'}'>
                <div class='achievement-icon'>${achievement.unlocked ? '🏆' : '🔒'}</div>
                <div class='achievement-info'>
                    <strong>${achievement.name}</strong>
                    <p>${achievement.description}</p>
                    ${achievement.unlocked ? `<span class='unlock-date'>Unlocked: ${achievement.unlockedDate?.toDateString()}</span>` : ''}
                </div>
            </div>`;
        });
        
        content += `</div></div>
            <div class='milestones-section'>
                <h4>Milestones</h4>
                <div class='milestone-list'>`;
        
        milestones.forEach(milestone => {
            const currentLevel = milestone.currentLevel;
            const nextThreshold = milestone.thresholds[currentLevel];
            const stats = statsSystem.getCurrentStats();
            const currentValue = milestone.getValue(stats);
            
            content += `<div class='milestone-item'>
                <strong>${milestone.name}</strong>
                <div class='milestone-progress'>
                    <span>Current: ${currentValue.toLocaleString()}</span>
                    ${nextThreshold ? `<span>Next: ${nextThreshold.toLocaleString()}</span>` : '<span>Completed!</span>'}
                </div>
                <div class='milestone-level'>Level ${currentLevel}/${milestone.thresholds.length}</div>
            </div>`;
        });
        
        content += `</div></div></div>`;
        this.uiManager.showModal(content, 'Achievements & Milestones');
    }

    showStatistics() {
        const statsSystem = this.systems.get('statistics');
        if (!statsSystem) return;

        const currentStats = statsSystem.getCurrentStats();
        const analytics = {
            production: statsSystem.getAnalytics('production', 30),
            financial: statsSystem.getAnalytics('financial', 30),
            efficiency: statsSystem.getAnalytics('efficiency', 30)
        };
        
        let content = `<div class='statistics-container'>
            <div class='stats-overview'>
                <h4>Farm Overview</h4>
                <div class='stat-grid'>
                    <div class='stat-item'>
                        <span class='stat-label'>Total Milk Produced</span>
                        <span class='stat-value'>${currentStats.totalMilkProduced.toLocaleString()}L</span>
                    </div>
                    <div class='stat-item'>
                        <span class='stat-label'>Current Cattle</span>
                        <span class='stat-value'>${currentStats.currentCattle}</span>
                    </div>
                    <div class='stat-item'>
                        <span class='stat-label'>Total Profit</span>
                        <span class='stat-value'>$${currentStats.totalProfit.toLocaleString()}</span>
                    </div>
                    <div class='stat-item'>
                        <span class='stat-label'>Farm Value</span>
                        <span class='stat-value'>$${currentStats.farmValue.toLocaleString()}</span>
                    </div>
                    <div class='stat-item'>
                        <span class='stat-label'>Average Efficiency</span>
                        <span class='stat-value'>${currentStats.averageEfficiency.toFixed(1)}%</span>
                    </div>
                    <div class='stat-item'>
                        <span class='stat-label'>Technologies Unlocked</span>
                        <span class='stat-value'>${currentStats.technologiesUnlocked}</span>
                    </div>
                </div>
            </div>
            
            <div class='stats-charts'>
                <h4>Performance Trends (Last 30 Days)</h4>
                <div class='chart-placeholder'>
                    <p>Production: ${analytics.production.length} data points</p>
                    <p>Financial: ${analytics.financial.length} data points</p>
                    <p>Efficiency: ${analytics.efficiency.length} data points</p>
                    <small>Chart visualization would go here</small>
                </div>
            </div>
        </div>`;
        
        this.uiManager.showModal(content, 'Farm Statistics');
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
        const techSystem = this.systems.get('technology');
        if (!techSystem) return;

        const technologyTree = techSystem.getTechnologyTree();
        let content = `<div class='tech-tree-container'>`;
        
        Object.entries(technologyTree).forEach(([category, techs]) => {
            content += `<div class='tech-category'>
                <h4>${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                <div class='tech-list'>`;
            
            techs.forEach(tech => {
                const statusClass = tech.unlocked ? 'unlocked' : tech.canResearch ? 'available' : 'locked';
                const costDisplay = tech.unlocked ? `$${tech.cost.toLocaleString()}` : `${tech.researchCost} RP`;
                
                content += `<div class='tech-item ${statusClass}' data-tech='${tech.id}'>
                    <strong>${tech.name}</strong>
                    <p>${tech.description}</p>
                    <span class='tech-cost'>${costDisplay}</span>
                    <button class='tech-btn' ${!tech.canResearch || tech.unlocked ? 'disabled' : ''}>
                        ${tech.unlocked ? (tech.isPurchased ? 'Purchased' : 'Purchase') : 'Research'}
                    </button>
                </div>`;
            });
            
            content += `</div></div>`;
        });
        
        content += `</div>`;
        this.uiManager.showModal(content, 'Technology Tree');
    }

    showResearch() {
        const techSystem = this.systems.get('technology');
        if (!techSystem) return;

        const currentResearch = techSystem.getResearchProgress();
        const researchPoints = techSystem.researchPoints;
        
        let content = `<div class='research-container'>
            <div class='research-points'>
                <h4>Research Points: ${researchPoints.toFixed(1)}</h4>
            </div>`;
        
        if (currentResearch) {
            content += `<div class='current-research'>
                <h4>Current Research</h4>
                <div class='research-item'>
                    <strong>${currentResearch.technology.name}</strong>
                    <div class='progress-bar'>
                        <div class='progress-fill' style='width: ${currentResearch.percentage}%'></div>
                    </div>
                    <span>${currentResearch.percentage.toFixed(1)}% Complete</span>
                </div>
            </div>`;
        }
        
        // Available research options
        const availableTechs = Array.from(techSystem.technologies.values())
            .filter(tech => !tech.unlocked && techSystem.canResearch(tech.id));
        
        if (availableTechs.length > 0) {
            content += `<div class='available-research'>
                <h4>Available Research</h4>`;
            
            availableTechs.forEach(tech => {
                content += `<div class='research-option' data-tech='${tech.id}'>
                    <strong>${tech.name}</strong>
                    <p>${tech.description}</p>
                    <span>Cost: ${tech.researchCost} RP</span>
                    <button class='research-btn' ${researchPoints < tech.researchCost ? 'disabled' : ''}>
                        Start Research
                    </button>
                </div>`;
            });
            
            content += `</div>`;
        }
        
        content += `</div>`;
        this.uiManager.showModal(content, 'Research Laboratory');
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

        // Clean up graphics systems
        if (this.performanceMonitor) {
            this.performanceMonitor.destroy();
            this.performanceMonitor = null;
        }
        
        if (this.backgroundGraphics) {
            this.backgroundGraphics.destroy();
            this.backgroundGraphics = null;
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

    exportAnalytics() {
        const statisticsSystem = this.systems.get('statistics');
        if (statisticsSystem) {
            const data = statisticsSystem.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `kiwi_farm_analytics_${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.uiManager?.showNotification('Analytics exported!', 'success');
        }
    }

    getSaveData() {
        return {
            version: '1.0.0',
            timestamp: Date.now(),
            scenario: this.currentScenario,
            farm: this.farm,
            resources: this.resources,
            gameTime: this.gameTime,
            systems: this.getSystemsState(),
            plotManager: this.plotManager?.getState()
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

            // Load plot manager state
            if (saveData.plotManager && this.plotManager) {
                this.plotManager.loadState(saveData.plotManager);
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