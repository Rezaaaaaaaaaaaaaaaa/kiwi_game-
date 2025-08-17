// Simple, working dairy farm game
class SimpleDairyGame {
    constructor() {
        this.gameState = {
            // Resources
            cash: 50000,
            milk: 0,
            feed: 1000,
            energy: 100,
            
            // Farm
            farmName: "My Farm",
            region: "Canterbury",
            farmSize: 100,
            
            // Cattle
            cattle: [],
            
            // Time
            day: 1,
            season: "spring",
            year: 2024,
            hour: 6,
            
            // Game state
            isPlaying: false,
            isPaused: false
        };
        
        this.scenarios = this.loadScenarios();
        this.currentScenario = null;
        this.gameLoop = null;
        this.lastUpdate = 0;
    }

    loadScenarios() {
        return {
            canterbury: {
                id: 'canterbury',
                name: 'Canterbury Plains',
                description: 'Flat, fertile land with irrigation. Perfect for beginners.',
                difficulty: 'Easy',
                startingCash: 75000,
                startingCattle: 150,
                startingFeed: 2000
            },
            waikato: {
                id: 'waikato',
                name: 'Waikato Heartland',
                description: 'Traditional dairy country with reliable rainfall.',
                difficulty: 'Medium',
                startingCash: 60000,
                startingCattle: 200,
                startingFeed: 1500
            },
            southland: {
                id: 'southland',
                name: 'Southland Challenge',
                description: 'Large scale farming with harsh winters.',
                difficulty: 'Hard',
                startingCash: 80000,
                startingCattle: 300,
                startingFeed: 3000
            }
        };
    }

    init() {
        console.log('Initializing Simple Dairy Game...');
        this.setupUI();
        this.showMainMenu();
        console.log('Game initialized successfully!');
    }

    setupUI() {
        // Setup menu buttons
        const newGameBtn = document.getElementById('new-game-btn');
        const loadGameBtn = document.getElementById('load-game-btn');
        const scenariosBtn = document.getElementById('scenarios-btn');
        
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.showScenarioSelect());
        }
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => this.loadGame());
        }
        if (scenariosBtn) {
            scenariosBtn.addEventListener('click', () => this.showScenarioSelect());
        }

        // Setup game buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleAction(action);
            });
        });

        // Setup back button
        const backBtn = document.getElementById('back-to-menu');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showMainMenu());
        }
    }

    showMainMenu() {
        this.showScreen('menu-screen');
    }

    showScenarioSelect() {
        this.showScreen('scenario-select-screen');
        this.populateScenarios();
    }

    populateScenarios() {
        const scenarioList = document.getElementById('scenario-list');
        if (!scenarioList) return;

        scenarioList.innerHTML = '';
        
        Object.values(this.scenarios).forEach(scenario => {
            const card = document.createElement('div');
            card.className = 'scenario-card';
            card.innerHTML = `
                <h3>${scenario.name}</h3>
                <p>${scenario.description}</p>
                <div class="difficulty">${scenario.difficulty}</div>
                <button onclick="game.startScenario('${scenario.id}')">Start Game</button>
            `;
            scenarioList.appendChild(card);
        });
    }

    startScenario(scenarioId) {
        console.log(`Starting scenario: ${scenarioId}`);
        
        const scenario = this.scenarios[scenarioId];
        if (!scenario) {
            console.error('Scenario not found:', scenarioId);
            return;
        }

        this.currentScenario = scenario;
        
        // Initialize game state
        this.gameState.cash = scenario.startingCash;
        this.gameState.feed = scenario.startingFeed;
        this.gameState.cattle = this.createInitialCattle(scenario.startingCattle);
        this.gameState.region = scenario.name;
        
        // Start the game
        this.startGame();
    }

    createInitialCattle(count) {
        const cattle = [];
        for (let i = 0; i < count; i++) {
            cattle.push({
                id: i + 1,
                breed: 'Holstein-Friesian',
                age: 3 + Math.random() * 4,
                health: 85 + Math.random() * 15,
                lactating: Math.random() < 0.8,
                milkYield: 20 + Math.random() * 10
            });
        }
        return cattle;
    }

    startGame() {
        console.log('Starting game...');
        this.gameState.isPlaying = true;
        this.showScreen('game-screen');
        this.updateUI();
        this.startGameLoop();
    }

    startGameLoop() {
        this.lastUpdate = Date.now();
        this.gameLoop = setInterval(() => {
            if (!this.gameState.isPaused) {
                this.update();
            }
        }, 1000); // Update every second
    }

    update() {
        // Advance time
        this.gameState.hour++;
        if (this.gameState.hour >= 24) {
            this.gameState.hour = 0;
            this.gameState.day++;
            this.dailyUpdate();
        }

        // Update UI
        this.updateUI();
    }

    dailyUpdate() {
        // Daily milk production
        let dailyMilk = 0;
        this.gameState.cattle.forEach(cow => {
            if (cow.lactating && cow.health > 50) {
                dailyMilk += cow.milkYield * (cow.health / 100);
            }
        });
        
        this.gameState.milk += dailyMilk;
        
        // Daily feed consumption
        const feedConsumed = this.gameState.cattle.length * 15; // 15kg per cow
        this.gameState.feed = Math.max(0, this.gameState.feed - feedConsumed);
        
        // Check if cattle are underfed
        if (this.gameState.feed < feedConsumed) {
            this.gameState.cattle.forEach(cow => {
                cow.health = Math.max(0, cow.health - 5);
            });
            this.showNotification('Cattle are underfed! Health declining.', 'warning');
        }

        console.log(`Day ${this.gameState.day}: Produced ${dailyMilk.toFixed(1)}L milk`);
    }

    handleAction(action) {
        console.log('Action:', action);
        
        switch (action) {
            case 'feed-cattle':
                this.feedCattle();
                break;
            case 'milk-cows':
                this.milkCows();
                break;
            case 'buy-cattle':
                this.buyCattle();
                break;
            case 'sell-milk':
                this.sellMilk();
                break;
            case 'manage-pasture':
                this.showNotification('Pasture management coming soon!', 'info');
                break;
            case 'upgrade-farm':
                this.showNotification('Farm upgrades coming soon!', 'info');
                break;
            default:
                console.log('Unknown action:', action);
        }
        
        this.updateUI();
    }

    feedCattle() {
        const feedNeeded = this.gameState.cattle.length * 20; // 20kg per cow for extra feeding
        const feedCost = feedNeeded * 0.25; // $0.25 per kg
        
        if (this.gameState.cash >= feedCost) {
            this.gameState.cash -= feedCost;
            this.gameState.cattle.forEach(cow => {
                cow.health = Math.min(100, cow.health + 5);
            });
            this.showNotification(`Fed ${this.gameState.cattle.length} cattle for $${feedCost}`, 'success');
        } else {
            this.showNotification('Not enough cash to buy feed!', 'error');
        }
    }

    milkCows() {
        let totalMilk = 0;
        const lactatingCows = this.gameState.cattle.filter(cow => cow.lactating && cow.health > 50);
        
        lactatingCows.forEach(cow => {
            const milk = cow.milkYield * (cow.health / 100) * 0.5; // Half daily yield per milking
            totalMilk += milk;
        });
        
        this.gameState.milk += totalMilk;
        this.showNotification(`Milked ${lactatingCows.length} cows: +${totalMilk.toFixed(1)}L`, 'success');
    }

    buyCattle() {
        const cowCost = 1500;
        if (this.gameState.cash >= cowCost) {
            this.gameState.cash -= cowCost;
            const newCow = {
                id: this.gameState.cattle.length + 1,
                breed: 'Holstein-Friesian',
                age: 2 + Math.random() * 2,
                health: 90 + Math.random() * 10,
                lactating: Math.random() < 0.7,
                milkYield: 20 + Math.random() * 10
            };
            this.gameState.cattle.push(newCow);
            this.showNotification(`Bought 1 cow for $${cowCost}`, 'success');
        } else {
            this.showNotification('Not enough cash to buy cattle!', 'error');
        }
    }

    sellMilk() {
        if (this.gameState.milk > 0) {
            const pricePerLitre = 0.65;
            const revenue = this.gameState.milk * pricePerLitre;
            this.gameState.cash += revenue;
            this.showNotification(`Sold ${this.gameState.milk.toFixed(1)}L milk for $${revenue.toFixed(2)}`, 'success');
            this.gameState.milk = 0;
        } else {
            this.showNotification('No milk to sell!', 'error');
        }
    }

    updateUI() {
        // Update resources
        const resourcesDisplay = document.getElementById('resources-display');
        if (resourcesDisplay) {
            resourcesDisplay.innerHTML = `
                <div class="resource-item">💰 $${this.gameState.cash.toLocaleString()}</div>
                <div class="resource-item">🥛 ${this.gameState.milk.toFixed(1)}L</div>
                <div class="resource-item">🌾 ${this.gameState.feed.toFixed(0)}kg</div>
                <div class="resource-item">⚡ ${this.gameState.energy}%</div>
            `;
        }

        // Update date/time
        const dateWeather = document.getElementById('date-weather');
        if (dateWeather) {
            dateWeather.innerHTML = `
                <div>Day ${this.gameState.day}, ${this.gameState.season} ${this.gameState.year}</div>
                <div>${this.gameState.hour}:00 - ☀️ Sunny</div>
            `;
        }

        // Update farm stats
        const farmStats = document.getElementById('farm-stats');
        if (farmStats) {
            farmStats.innerHTML = `
                <div>Farm: ${this.gameState.farmName}</div>
                <div>Region: ${this.gameState.region}</div>
                <div>Size: ${this.gameState.farmSize} ha</div>
            `;
        }

        // Update cattle stats
        const cattleStats = document.getElementById('cattle-stats');
        if (cattleStats) {
            const lactatingCows = this.gameState.cattle.filter(c => c.lactating).length;
            const avgHealth = this.gameState.cattle.length > 0 
                ? this.gameState.cattle.reduce((sum, c) => sum + c.health, 0) / this.gameState.cattle.length
                : 100;
            
            cattleStats.innerHTML = `
                <div>Total Cows: ${this.gameState.cattle.length}</div>
                <div>Lactating: ${lactatingCows}</div>
                <div>Avg Health: ${avgHealth.toFixed(1)}%</div>
            `;
        }

        // Update production stats
        const productionStats = document.getElementById('production-stats');
        if (productionStats) {
            const dailyProduction = this.gameState.cattle
                .filter(c => c.lactating)
                .reduce((sum, c) => sum + c.milkYield * (c.health / 100), 0);
            
            productionStats.innerHTML = `
                <div>Daily Milk: ${dailyProduction.toFixed(1)}L</div>
                <div>Milk Price: $0.65/L</div>
                <div>Daily Value: $${(dailyProduction * 0.65).toFixed(2)}</div>
            `;
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        const targetScreen = document.getElementById(screenId);
        if (targetScreen) {
            targetScreen.classList.add('active');
        }
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 10px 20px;
            border-radius: 4px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : type === 'warning' ? '#ff9800' : '#2196F3'};
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 3 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }

    loadGame() {
        this.showNotification('Load game feature coming soon!', 'info');
    }

    stop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        this.gameState.isPlaying = false;
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new SimpleDairyGame();
    game.init();
    
    // Make game available globally for debugging
    window.game = game;
});