// Enhanced Dairy Farm Game Main Entry Point
import { Game } from './game/Game.js';
import { UIManager } from './game/ui/UIManager.js';
import { DataManager } from './game/data/DataManager.js';

// Main game application
class KiwiDairyGame {
    constructor() {
        this.dataManager = null;
        this.uiManager = null;
        this.game = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            console.log('Initializing Kiwi Dairy Farm Game...');

            // Initialize data manager
            this.dataManager = new DataManager();
            await this.dataManager.init();

            // Initialize UI manager
            this.uiManager = new UIManager();
            this.uiManager.init();

            // Initialize main game
            this.game = new Game(this.dataManager, this.uiManager);
            await this.game.init();

            // Setup event handlers
            this.setupEventHandlers();

            this.isInitialized = true;
            console.log('Game initialized successfully!');

            // Make game globally available
            window.kiwiDairyGame = this;

        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to initialize game. Please refresh and try again.');
        }
    }

    setupEventHandlers() {
        // Setup action button handlers
        document.addEventListener('click', (e) => {
            if (e.target.matches('.action-btn[data-action]')) {
                const action = e.target.dataset.action;
                this.handleAction(action);
            }
        });

        // Setup menu navigation
        const newGameBtn = document.getElementById('new-game-btn');
        const scenariosBtn = document.getElementById('scenarios-btn');
        const backBtn = document.getElementById('back-to-menu');

        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => this.uiManager.showScreen('scenario-select'));
        }
        
        if (scenariosBtn) {
            scenariosBtn.addEventListener('click', () => this.uiManager.showScreen('scenario-select'));
        }
        
        if (backBtn) {
            backBtn.addEventListener('click', () => this.uiManager.showScreen('menu'));
        }

        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (this.game && this.game.isPlaying) {
                switch (e.key) {
                    case ' ': // Spacebar to pause
                        e.preventDefault();
                        this.game.handleAction('pause');
                        break;
                    case 'p': // P to show plots
                        this.game.handleAction('show-plots');
                        break;
                    case 's': // S to show statistics
                        this.game.handleAction('statistics');
                        break;
                }
            }
        });

        // Setup window resize handler
        window.addEventListener('resize', () => {
            if (this.game && this.game.handleResize) {
                this.game.handleResize();
            }
        });
    }

    handleAction(action) {
        if (!this.game) {
            console.warn('Game not initialized');
            return;
        }

        this.game.handleAction(action);
    }

    async startNewGame(scenarioId) {
        if (!this.game) {
            console.error('Game not initialized');
            return;
        }

        try {
            await this.game.startNewGame(scenarioId);
            this.uiManager.showScreen('game');
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.showError('Failed to start new game. Please try again.');
        }
    }

    saveGame() {
        if (!this.game) return;
        
        try {
            const saveData = this.game.getSaveData();
            localStorage.setItem('kiwiDairyGame_save', JSON.stringify(saveData));
            this.uiManager.showNotification('Game saved!', 'success');
        } catch (error) {
            console.error('Failed to save game:', error);
            this.uiManager.showNotification('Failed to save game!', 'error');
        }
    }

    async loadGame() {
        if (!this.game) return;

        try {
            const saveData = localStorage.getItem('kiwiDairyGame_save');
            if (!saveData) {
                this.uiManager.showNotification('No save game found!', 'warning');
                return;
            }

            const data = JSON.parse(saveData);
            await this.game.loadGame(data);
            this.uiManager.showScreen('game');
            this.uiManager.showNotification('Game loaded!', 'success');
        } catch (error) {
            console.error('Failed to load game:', error);
            this.uiManager.showNotification('Failed to load game!', 'error');
        }
    }

    showError(message) {
        // Show error message to user
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #f44336;
            color: white;
            padding: 20px;
            border-radius: 8px;
            z-index: 10000;
            text-align: center;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        errorDiv.innerHTML = `
            <h3>Error</h3>
            <p>${message}</p>
            <button onclick="this.parentNode.remove()" style="background: white; color: #f44336; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-top: 10px;">OK</button>
        `;
        document.body.appendChild(errorDiv);
    }

    // Debug methods
    getDebugInfo() {
        return {
            isInitialized: this.isInitialized,
            gameState: this.game?.debugInfo(),
            version: '1.0.0'
        };
    }

    // Cheat methods for development
    cheat_addCash(amount = 10000) {
        if (this.game?.resources) {
            this.game.resources.cash += amount;
            this.uiManager?.showNotification(`Added $${amount}`, 'info');
        }
    }

    cheat_addMilk(amount = 1000) {
        if (this.game?.resources) {
            this.game.resources.milk += amount;
            this.uiManager?.showNotification(`Added ${amount}L milk`, 'info');
        }
    }

    cheat_skipTime(hours = 24) {
        const timeSystem = this.game?.systems?.get('time');
        if (timeSystem) {
            timeSystem.advanceTime(hours);
            this.uiManager?.showNotification(`Skipped ${hours} hours`, 'info');
        }
    }
}

// Initialize game when page loads
let game;
document.addEventListener('DOMContentLoaded', async () => {
    game = new KiwiDairyGame();
    await game.init();
    
    // Make game available globally for debugging
    window.game = game;
    
    // Setup global functions for HTML onclick handlers
    window.startScenario = (scenarioId) => game.startNewGame(scenarioId);
    window.saveGame = () => game.saveGame();
    window.loadGame = () => game.loadGame();
    
    console.log('Kiwi Dairy Farm Game is ready! 🐄🥛');
    console.log('Debug: Use window.game to access game instance');
    console.log('Cheats: game.cheat_addCash(), game.cheat_addMilk(), game.cheat_skipTime()');
});