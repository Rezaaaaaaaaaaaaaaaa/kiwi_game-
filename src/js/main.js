// Main entry point for Kiwi Dairy Game
import { Game } from './game/Game.js';
import { UIManager } from './game/ui/UIManager.js';
import { DataManager } from './game/data/DataManager.js';

class KiwiDairyGame {
    constructor() {
        this.game = null;
        this.uiManager = null;
        this.dataManager = null;
        this.initialized = false;
    }

    async init() {
        try {
            console.log('Initializing Kiwi Dairy Game...');
            
            // Initialize data manager first
            this.dataManager = new DataManager();
            await this.dataManager.init();
            
            // Initialize UI manager
            this.uiManager = new UIManager();
            this.uiManager.init();
            
            // Initialize game instance
            this.game = new Game(this.dataManager, this.uiManager);
            await this.game.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.initialized = true;
            console.log('Game initialized successfully!');
            
        } catch (error) {
            console.error('Failed to initialize game:', error);
            this.showError('Failed to load game. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Menu button event listeners
        document.getElementById('new-game-btn').addEventListener('click', () => {
            this.uiManager.showScreen('scenario-select');
        });

        document.getElementById('load-game-btn').addEventListener('click', () => {
            this.loadGame();
        });

        document.getElementById('scenarios-btn').addEventListener('click', () => {
            this.uiManager.showScreen('scenario-select');
        });

        document.getElementById('tutorial-btn').addEventListener('click', () => {
            this.showTutorialMenu();
        });

        document.getElementById('settings-btn').addEventListener('click', () => {
            this.showSettings();
        });

        document.getElementById('back-to-menu').addEventListener('click', () => {
            this.uiManager.showScreen('menu');
        });

        // Game controls
        document.getElementById('pause-btn')?.addEventListener('click', () => {
            this.game?.togglePause();
        });

        document.getElementById('save-btn')?.addEventListener('click', () => {
            this.saveGame();
        });

        document.getElementById('menu-btn')?.addEventListener('click', () => {
            this.showMainMenu();
        });

        // Action buttons
        document.querySelectorAll('.action-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.game?.handleAction(action);
            });
        });

        // Window events
        window.addEventListener('beforeunload', () => {
            this.autoSave();
        });

        window.addEventListener('resize', () => {
            this.game?.handleResize();
        });
    }

    async startNewGame(scenarioId) {
        try {
            await this.game.startNewGame(scenarioId);
            this.uiManager.showScreen('game');
        } catch (error) {
            console.error('Failed to start new game:', error);
            this.showError('Failed to start new game.');
        }
    }

    async loadGame() {
        try {
            const saveData = await this.dataManager.loadGame();
            if (saveData) {
                await this.game.loadGame(saveData);
                this.uiManager.showScreen('game');
            } else {
                this.showError('No saved game found.');
            }
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showError('Failed to load game.');
        }
    }

    async saveGame() {
        try {
            if (this.game && this.game.isPlaying) {
                const saveData = this.game.getSaveData();
                await this.dataManager.saveGame(saveData);
                this.uiManager.showNotification('Game saved successfully!', 'success');
            }
        } catch (error) {
            console.error('Failed to save game:', error);
            this.showError('Failed to save game.');
        }
    }

    async autoSave() {
        if (this.game && this.game.isPlaying) {
            try {
                const saveData = this.game.getSaveData();
                await this.dataManager.autoSave(saveData);
            } catch (error) {
                console.error('Auto-save failed:', error);
            }
        }
    }

    showTutorialMenu() {
        if (!this.game.tutorialManager) {
            this.uiManager.showNotification('Tutorial system not available', 'error');
            return;
        }
        
        const tutorials = this.game.tutorialManager.getAvailableTutorials();
        let content = '<div class="tutorial-menu">';
        content += '<p>Choose a tutorial to learn different aspects of dairy farming:</p>';
        
        tutorials.forEach(tutorial => {
            const status = tutorial.completed ? '✓' : '○';
            content += `
                <div class="tutorial-option ${tutorial.completed ? 'completed' : ''}" data-tutorial="${tutorial.id}">
                    <span class="tutorial-status">${status}</span>
                    <div class="tutorial-info">
                        <h4>${tutorial.name}</h4>
                        <p>${tutorial.description}</p>
                    </div>
                </div>
            `;
        });
        
        content += '</div>';
        
        this.uiManager.showModal(content, 'Tutorials');
        
        // Add click handlers for tutorial options
        setTimeout(() => {
            document.querySelectorAll('.tutorial-option').forEach(option => {
                option.addEventListener('click', () => {
                    const tutorialId = option.dataset.tutorial;
                    this.uiManager.hideModal();
                    this.game.tutorialManager.startTutorial(tutorialId);
                });
            });
        }, 100);
    }

    showSettings() {
        // TODO: Implement settings
        this.uiManager.showNotification('Settings coming soon!', 'info');
    }

    showMainMenu() {
        if (confirm('Return to main menu? Any unsaved progress will be lost.')) {
            this.game?.stop();
            this.uiManager.showScreen('menu');
        }
    }

    showError(message) {
        this.uiManager.showNotification(message, 'error');
    }
}

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const gameInstance = new KiwiDairyGame();
    await gameInstance.init();
    
    // Make game instance globally available for debugging
    window.kiwiDairyGame = gameInstance;
});