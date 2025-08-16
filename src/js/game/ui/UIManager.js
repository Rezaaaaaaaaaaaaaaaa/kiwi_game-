// UI Manager for handling all UI interactions
export class UIManager {
    constructor() {
        this.currentScreen = 'menu';
        this.notifications = [];
        this.modals = new Map();
    }

    init() {
        console.log('Initializing UI Manager...');
        this.setupScreens();
        this.setupScenarios();
        this.showScreen('menu');
    }

    setupScreens() {
        // Hide all screens initially
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
    }

    setupScenarios() {
        const scenarioList = document.getElementById('scenario-list');
        if (!scenarioList) return;

        const scenarios = [
            {
                id: 'canterbury',
                title: 'Canterbury Plains - The Irrigated Dream',
                description: 'Start with flat, fertile land and irrigation infrastructure. Perfect for beginners.',
                difficulty: 'easy',
                region: 'Canterbury'
            },
            {
                id: 'waikato',
                title: 'Waikato - Heartland Tradition',
                description: 'Traditional dairy country with reliable rainfall but environmental challenges.',
                difficulty: 'medium',
                region: 'Waikato'
            },
            {
                id: 'taranaki',
                title: 'Taranaki - Volcanic Advantage',
                description: 'Rich volcanic soils but challenging terrain and weather risks.',
                difficulty: 'medium',
                region: 'Taranaki'
            },
            {
                id: 'southland',
                title: 'Southland - The Southern Challenge',
                description: 'Harsh winters and short seasons test your management skills.',
                difficulty: 'hard',
                region: 'Southland'
            },
            {
                id: 'bay-of-plenty',
                title: 'Bay of Plenty - Kiwifruit to Cows',
                description: 'Convert from horticulture to dairy farming with high setup costs.',
                difficulty: 'hard',
                region: 'Bay of Plenty'
            }
        ];

        scenarioList.innerHTML = '';
        scenarios.forEach(scenario => {
            const card = this.createScenarioCard(scenario);
            scenarioList.appendChild(card);
        });
    }

    createScenarioCard(scenario) {
        const card = document.createElement('div');
        card.className = 'scenario-card';
        card.innerHTML = `
            <div class="scenario-title">${scenario.title}</div>
            <div class="scenario-description">${scenario.description}</div>
            <div class="scenario-difficulty difficulty-${scenario.difficulty}">
                ${scenario.difficulty.toUpperCase()}
            </div>
        `;

        card.addEventListener('click', () => {
            this.selectScenario(scenario.id);
        });

        return card;
    }

    selectScenario(scenarioId) {
        if (window.kiwiDairyGame) {
            window.kiwiDairyGame.startNewGame(scenarioId);
        }
    }

    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        // Map logical screen names to actual HTML IDs
        const screenMap = {
            'menu': 'menu-screen',
            'scenario-select': 'scenario-select-screen',
            'game': 'game-screen'
        };
        const htmlId = screenMap[screenId] || screenId;
        const screen = document.getElementById(htmlId);
        if (screen) {
            screen.classList.add('active');
            this.currentScreen = screenId;
        }
    }

    updateGameUI(gameState) {
        if (this.currentScreen !== 'game') return;

        this.updateResourcesDisplay(gameState.resources);
        this.updateDateWeather(gameState.gameTime);
        this.updateFarmStats(gameState.farm);
        this.updateCattleStats(gameState.systems.cattle);
        this.updateProductionStats(gameState.systems);
    }

    updateResourcesDisplay(resources) {
        const resourcesDisplay = document.getElementById('resources-display');
        if (!resourcesDisplay) return;

        resourcesDisplay.innerHTML = `
            <div class="resource-item">
                <span class="resource-icon">💰</span>
                <span>$${this.formatNumber(resources.cash)}</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🥛</span>
                <span>${this.formatNumber(resources.milk)}L</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">🌾</span>
                <span>${this.formatNumber(resources.feed)}kg</span>
            </div>
            <div class="resource-item">
                <span class="resource-icon">⚡</span>
                <span>${resources.energy}%</span>
            </div>
        `;
    }

    updateDateWeather(gameTime) {
        const dateWeather = document.getElementById('date-weather');
        if (!dateWeather) return;

        dateWeather.innerHTML = `
            <div>Day ${gameTime.day}, ${gameTime.season} ${gameTime.year}</div>
            <div>${gameTime.hour}:00 - ☀️ Sunny 18°C</div>
        `;
    }

    updateFarmStats(farm) {
        const farmStats = document.getElementById('farm-stats');
        if (!farmStats) return;

        farmStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Farm Size:</span>
                <span class="stat-value">${farm.size} ha</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Region:</span>
                <span class="stat-value">${farm.region}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Milking System:</span>
                <span class="stat-value">${farm.infrastructure.milkingShed}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Pastures:</span>
                <span class="stat-value">${farm.pastures.length}</span>
            </div>
        `;
    }

    updateCattleStats(cattleSystem) {
        const cattleStats = document.getElementById('cattle-stats');
        if (!cattleStats) return;

        // Default values if system not fully implemented
        const stats = cattleSystem || {};

        cattleStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Total Cows:</span>
                <span class="stat-value">${stats.totalCows || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Milking Cows:</span>
                <span class="stat-value">${stats.milkingCows || 0}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Health:</span>
                <span class="stat-value">${stats.averageHealth || 100}%</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Feed Status:</span>
                <span class="stat-value ${stats.feedStatus === 'Good' ? '' : 'stat-warning'}">
                    ${stats.feedStatus || 'Good'}
                </span>
            </div>
        `;
    }

    updateProductionStats(systems) {
        const productionStats = document.getElementById('production-stats');
        if (!productionStats) return;

        productionStats.innerHTML = `
            <div class="stat-item">
                <span class="stat-label">Daily Milk:</span>
                <span class="stat-value">${this.formatNumber(0)}L</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Milk Price:</span>
                <span class="stat-value">$0.65/L</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Daily Revenue:</span>
                <span class="stat-value">$${this.formatNumber(0)}</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">Efficiency:</span>
                <span class="stat-value">85%</span>
            </div>
        `;
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div>${message}</div>
            <button class="notification-close">×</button>
        `;

        // Add close functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.hideNotification(notification);
        });

        document.body.appendChild(notification);

        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);

        // Auto-hide after 5 seconds
        setTimeout(() => this.hideNotification(notification), 5000);
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }

    showModal(content, title = '') {
        const overlay = document.getElementById('modal-overlay');
        const modalContent = document.getElementById('modal-content');

        modalContent.innerHTML = `
            <div role="dialog" aria-modal="true" aria-label="${title}">
                ${title ? `<h2>${title}</h2>` : ''}
                <button class="modal-close" aria-label="Close dialog">×</button>
                <div class="modal-body">${content}</div>
            </div>
        `;

        // Add close functionality
        modalContent.querySelector('.modal-close').addEventListener('click', () => {
            this.hideModal();
        });

        overlay.classList.add('active');
    }

    hideModal() {
        const overlay = document.getElementById('modal-overlay');
        overlay.classList.remove('active');
    }

    updatePauseState(isPaused) {
        const pauseBtn = document.getElementById('pause-btn');
        if (pauseBtn) {
            pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
        }
    }

    formatNumber(num) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return Math.round(num).toString();
    }
}