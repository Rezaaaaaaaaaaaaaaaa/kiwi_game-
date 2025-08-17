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
            console.log('UI Manager:', this.uiManager);
            console.log('Game instance:', this.game);

        } catch (error) {
            console.error('Failed to initialize game:', error);
            console.error('Error details:', error.stack);
            this.showError('Failed to load game. Please refresh the page.');
        }
    }

    setupEventListeners() {
        // Menu button event listeners
        const newGameBtn = document.getElementById('new-game-btn');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                console.log('New Game button clicked');
                this.uiManager.showScreen('scenario-select');
            });
        } else {
            console.error('New Game button not found');
        }

        const loadGameBtn = document.getElementById('load-game-btn');
        if (loadGameBtn) {
            loadGameBtn.addEventListener('click', () => {
                console.log('Load Game button clicked');
                this.loadGame();
            });
        }

        const scenariosBtn = document.getElementById('scenarios-btn');
        if (scenariosBtn) {
            scenariosBtn.addEventListener('click', () => {
                console.log('Scenarios button clicked');
                this.uiManager.showScreen('scenario-select');
            });
        }

        const tutorialBtn = document.getElementById('tutorial-btn');
        if (tutorialBtn) {
            tutorialBtn.addEventListener('click', () => {
                console.log('Tutorial button clicked');
                this.showTutorialMenu();
            });
        }

        const settingsBtn = document.getElementById('settings-btn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('Settings button clicked');
                this.showSettings();
            });
        }

        const backToMenuBtn = document.getElementById('back-to-menu');
        if (backToMenuBtn) {
            backToMenuBtn.addEventListener('click', () => {
                console.log('Back to menu clicked');
                this.uiManager.showScreen('menu');
            });
        }

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
        // Settings modal content
        const content = `
            <form id="settings-form" class="settings-form">
                <div class="settings-group">
                    <label for="sound-toggle">Sound:</label>
                    <input type="checkbox" id="sound-toggle" checked>
                </div>
                <div class="settings-group">
                    <label for="music-toggle">Music:</label>
                    <input type="checkbox" id="music-toggle" checked>
                </div>
                <div class="settings-group">
                    <label for="difficulty-select">Difficulty:</label>
                    <select id="difficulty-select">
                        <option value="easy">Easy</option>
                        <option value="medium">Medium</option>
                        <option value="hard">Hard</option>
                    </select>
                </div>
                <div class="settings-group">
                    <label for="accessibility-toggle">Accessibility Mode:</label>
                    <input type="checkbox" id="accessibility-toggle">
                </div>
                <button type="submit" class="settings-save-btn">Save</button>
            </form>
        `;
        this.uiManager.showModal(content, 'Settings');
        // Save settings handler
        setTimeout(() => {
            const form = document.getElementById('settings-form');
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    // Here you would save settings to localStorage or game state
                    this.uiManager.showNotification('Settings saved!', 'success');
                    this.uiManager.hideModal();
                });
            }
        }, 100);
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