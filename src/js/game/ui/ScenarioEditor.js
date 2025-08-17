// Scenario Editor for creating custom scenarios
export class ScenarioEditor {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
        this.currentScenario = null;
        this.isEditing = false;
    }

    init() {
        console.log('Scenario Editor initialized');
    }

    showEditor(existingScenario = null) {
        this.currentScenario = existingScenario || this.getDefaultScenario();
        this.isEditing = !!existingScenario;

        const content = this.generateEditorHTML();
        this.uiManager.showModal(content, `${this.isEditing ? 'Edit' : 'Create'} Scenario`);
        
        // Add event listeners after modal is shown
        setTimeout(() => {
            this.attachEventListeners();
        }, 100);
    }

    getDefaultScenario() {
        return {
            id: '',
            name: 'Custom Scenario',
            region: 'Custom',
            difficulty: 'medium',
            description: 'A custom scenario created by the player.',
            farmName: 'Custom Farm',
            farmSize: 100,
            startingCash: 50000,
            startingFeed: 1000,
            startingCattle: 150,
            startingInfrastructure: {
                milkingShed: 'basic',
                storage: 5000,
                roads: 'basic',
                irrigation: false
            },
            climate: {
                rainfall: 'moderate',
                temperature: 'mild',
                windRisk: 'low',
                droughtRisk: 'moderate'
            },
            advantages: [],
            challenges: [],
            goals: {
                primary: 'Build a successful dairy operation',
                secondary: 'Maintain profitability',
                financial: 'Achieve $50,000 annual profit'
            }
        };
    }

    generateEditorHTML() {
        const scenario = this.currentScenario;
        
        return `
            <div class="scenario-editor">
                <form id="scenario-form">
                    <div class="editor-section">
                        <h4>Basic Information</h4>
                        <div class="form-group">
                            <label for="scenario-id">Scenario ID:</label>
                            <input type="text" id="scenario-id" value="${scenario.id}" ${this.isEditing ? 'readonly' : ''} required>
                        </div>
                        <div class="form-group">
                            <label for="scenario-name">Name:</label>
                            <input type="text" id="scenario-name" value="${scenario.name}" required>
                        </div>
                        <div class="form-group">
                            <label for="scenario-region">Region:</label>
                            <input type="text" id="scenario-region" value="${scenario.region}" required>
                        </div>
                        <div class="form-group">
                            <label for="scenario-difficulty">Difficulty:</label>
                            <select id="scenario-difficulty">
                                <option value="easy" ${scenario.difficulty === 'easy' ? 'selected' : ''}>Easy</option>
                                <option value="medium" ${scenario.difficulty === 'medium' ? 'selected' : ''}>Medium</option>
                                <option value="hard" ${scenario.difficulty === 'hard' ? 'selected' : ''}>Hard</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="scenario-description">Description:</label>
                            <textarea id="scenario-description" rows="3">${scenario.description}</textarea>
                        </div>
                    </div>

                    <div class="editor-section">
                        <h4>Farm Setup</h4>
                        <div class="form-group">
                            <label for="farm-name">Farm Name:</label>
                            <input type="text" id="farm-name" value="${scenario.farmName}">
                        </div>
                        <div class="form-group">
                            <label for="farm-size">Farm Size (hectares):</label>
                            <input type="number" id="farm-size" value="${scenario.farmSize}" min="10" max="1000">
                        </div>
                        <div class="form-group">
                            <label for="starting-cash">Starting Cash ($):</label>
                            <input type="number" id="starting-cash" value="${scenario.startingCash}" min="0" step="1000">
                        </div>
                        <div class="form-group">
                            <label for="starting-feed">Starting Feed (kg):</label>
                            <input type="number" id="starting-feed" value="${scenario.startingFeed}" min="0">
                        </div>
                        <div class="form-group">
                            <label for="starting-cattle">Starting Cattle:</label>
                            <input type="number" id="starting-cattle" value="${scenario.startingCattle}" min="0">
                        </div>
                    </div>

                    <div class="editor-section">
                        <h4>Infrastructure</h4>
                        <div class="form-group">
                            <label for="milking-shed">Milking Shed:</label>
                            <select id="milking-shed">
                                <option value="none" ${scenario.startingInfrastructure.milkingShed === 'none' ? 'selected' : ''}>None</option>
                                <option value="basic" ${scenario.startingInfrastructure.milkingShed === 'basic' ? 'selected' : ''}>Basic</option>
                                <option value="herringbone" ${scenario.startingInfrastructure.milkingShed === 'herringbone' ? 'selected' : ''}>Herringbone</option>
                                <option value="rotary" ${scenario.startingInfrastructure.milkingShed === 'rotary' ? 'selected' : ''}>Rotary</option>
                                <option value="robotic" ${scenario.startingInfrastructure.milkingShed === 'robotic' ? 'selected' : ''}>Robotic</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="storage-capacity">Storage Capacity (L):</label>
                            <input type="number" id="storage-capacity" value="${scenario.startingInfrastructure.storage}" min="0" step="1000">
                        </div>
                        <div class="form-group">
                            <label for="road-quality">Road Quality:</label>
                            <select id="road-quality">
                                <option value="basic" ${scenario.startingInfrastructure.roads === 'basic' ? 'selected' : ''}>Basic</option>
                                <option value="metal" ${scenario.startingInfrastructure.roads === 'metal' ? 'selected' : ''}>Metal</option>
                                <option value="sealed" ${scenario.startingInfrastructure.roads === 'sealed' ? 'selected' : ''}>Sealed</option>
                                <option value="excellent" ${scenario.startingInfrastructure.roads === 'excellent' ? 'selected' : ''}>Excellent</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>
                                <input type="checkbox" id="has-irrigation" ${scenario.startingInfrastructure.irrigation ? 'checked' : ''}>
                                Has Irrigation System
                            </label>
                        </div>
                    </div>

                    <div class="editor-section">
                        <h4>Climate</h4>
                        <div class="form-group">
                            <label for="rainfall">Rainfall:</label>
                            <select id="rainfall">
                                <option value="low" ${scenario.climate.rainfall === 'low' ? 'selected' : ''}>Low</option>
                                <option value="moderate" ${scenario.climate.rainfall === 'moderate' ? 'selected' : ''}>Moderate</option>
                                <option value="high" ${scenario.climate.rainfall === 'high' ? 'selected' : ''}>High</option>
                                <option value="very-high" ${scenario.climate.rainfall === 'very-high' ? 'selected' : ''}>Very High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="temperature">Temperature:</label>
                            <select id="temperature">
                                <option value="cold" ${scenario.climate.temperature === 'cold' ? 'selected' : ''}>Cold</option>
                                <option value="mild" ${scenario.climate.temperature === 'mild' ? 'selected' : ''}>Mild</option>
                                <option value="moderate" ${scenario.climate.temperature === 'moderate' ? 'selected' : ''}>Moderate</option>
                                <option value="warm" ${scenario.climate.temperature === 'warm' ? 'selected' : ''}>Warm</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="wind-risk">Wind Risk:</label>
                            <select id="wind-risk">
                                <option value="low" ${scenario.climate.windRisk === 'low' ? 'selected' : ''}>Low</option>
                                <option value="moderate" ${scenario.climate.windRisk === 'moderate' ? 'selected' : ''}>Moderate</option>
                                <option value="high" ${scenario.climate.windRisk === 'high' ? 'selected' : ''}>High</option>
                                <option value="very-high" ${scenario.climate.windRisk === 'very-high' ? 'selected' : ''}>Very High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="drought-risk">Drought Risk:</label>
                            <select id="drought-risk">
                                <option value="very-low" ${scenario.climate.droughtRisk === 'very-low' ? 'selected' : ''}>Very Low</option>
                                <option value="low" ${scenario.climate.droughtRisk === 'low' ? 'selected' : ''}>Low</option>
                                <option value="moderate" ${scenario.climate.droughtRisk === 'moderate' ? 'selected' : ''}>Moderate</option>
                                <option value="high" ${scenario.climate.droughtRisk === 'high' ? 'selected' : ''}>High</option>
                            </select>
                        </div>
                    </div>

                    <div class="editor-section">
                        <h4>Goals</h4>
                        <div class="form-group">
                            <label for="primary-goal">Primary Goal:</label>
                            <input type="text" id="primary-goal" value="${scenario.goals.primary}">
                        </div>
                        <div class="form-group">
                            <label for="secondary-goal">Secondary Goal:</label>
                            <input type="text" id="secondary-goal" value="${scenario.goals.secondary}">
                        </div>
                        <div class="form-group">
                            <label for="financial-goal">Financial Goal:</label>
                            <input type="text" id="financial-goal" value="${scenario.goals.financial}">
                        </div>
                    </div>

                    <div class="editor-section">
                        <h4>Scenario Features</h4>
                        <div class="form-group">
                            <label for="advantages">Advantages (one per line):</label>
                            <textarea id="advantages" rows="4">${scenario.advantages.join('\\n')}</textarea>
                        </div>
                        <div class="form-group">
                            <label for="challenges">Challenges (one per line):</label>
                            <textarea id="challenges" rows="4">${scenario.challenges.join('\\n')}</textarea>
                        </div>
                    </div>

                    <div class="editor-actions">
                        <button type="button" id="preview-scenario" class="preview-btn">Preview</button>
                        <button type="button" id="test-scenario" class="test-btn">Test Play</button>
                        <button type="submit" class="save-btn">Save Scenario</button>
                        <button type="button" id="cancel-editor" class="cancel-btn">Cancel</button>
                    </div>
                </form>
            </div>
        `;
    }

    attachEventListeners() {
        const form = document.getElementById('scenario-form');
        const previewBtn = document.getElementById('preview-scenario');
        const testBtn = document.getElementById('test-scenario');
        const cancelBtn = document.getElementById('cancel-editor');

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveScenario();
            });
        }

        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.previewScenario();
            });
        }

        if (testBtn) {
            testBtn.addEventListener('click', () => {
                this.testScenario();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.uiManager.hideModal();
            });
        }
    }

    previewScenario() {
        const scenario = this.collectFormData();
        const preview = this.generatePreviewHTML(scenario);
        this.uiManager.showModal(preview, 'Scenario Preview');
    }

    generatePreviewHTML(scenario) {
        return `
            <div class="scenario-preview">
                <div class="scenario-header">
                    <h3>${scenario.name}</h3>
                    <span class="difficulty-badge difficulty-${scenario.difficulty}">${scenario.difficulty.toUpperCase()}</span>
                </div>
                
                <div class="scenario-description">
                    <p>${scenario.description}</p>
                </div>

                <div class="scenario-details">
                    <div class="detail-section">
                        <h4>Starting Resources</h4>
                        <ul>
                            <li>Cash: $${scenario.startingCash.toLocaleString()}</li>
                            <li>Farm Size: ${scenario.farmSize} hectares</li>
                            <li>Cattle: ${scenario.startingCattle}</li>
                            <li>Feed: ${scenario.startingFeed} kg</li>
                        </ul>
                    </div>

                    <div class="detail-section">
                        <h4>Infrastructure</h4>
                        <ul>
                            <li>Milking Shed: ${scenario.startingInfrastructure.milkingShed}</li>
                            <li>Storage: ${scenario.startingInfrastructure.storage}L</li>
                            <li>Roads: ${scenario.startingInfrastructure.roads}</li>
                            <li>Irrigation: ${scenario.startingInfrastructure.irrigation ? 'Yes' : 'No'}</li>
                        </ul>
                    </div>

                    <div class="detail-section">
                        <h4>Climate</h4>
                        <ul>
                            <li>Rainfall: ${scenario.climate.rainfall}</li>
                            <li>Temperature: ${scenario.climate.temperature}</li>
                            <li>Wind Risk: ${scenario.climate.windRisk}</li>
                            <li>Drought Risk: ${scenario.climate.droughtRisk}</li>
                        </ul>
                    </div>

                    ${scenario.advantages.length > 0 ? `
                    <div class="detail-section">
                        <h4>Advantages</h4>
                        <ul>
                            ${scenario.advantages.map(adv => `<li>${adv}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    ${scenario.challenges.length > 0 ? `
                    <div class="detail-section">
                        <h4>Challenges</h4>
                        <ul>
                            ${scenario.challenges.map(chal => `<li>${chal}</li>`).join('')}
                        </ul>
                    </div>
                    ` : ''}

                    <div class="detail-section">
                        <h4>Goals</h4>
                        <ul>
                            <li>Primary: ${scenario.goals.primary}</li>
                            <li>Secondary: ${scenario.goals.secondary}</li>
                            <li>Financial: ${scenario.goals.financial}</li>
                        </ul>
                    </div>
                </div>

                <div class="preview-actions">
                    <button onclick="history.back()" class="back-btn">Back to Editor</button>
                </div>
            </div>
        `;
    }

    testScenario() {
        const scenario = this.collectFormData();
        
        // Validate scenario
        if (!this.validateScenario(scenario)) {
            return;
        }

        // Save temporarily and start test
        this.game.dataManager.scenarios.set(scenario.id + '_test', scenario);
        this.uiManager.hideModal();
        
        // Start game with test scenario
        this.game.startNewGame(scenario.id + '_test');
        this.uiManager.showNotification('Test scenario started!', 'info');
    }

    saveScenario() {
        const scenario = this.collectFormData();
        
        // Validate scenario
        if (!this.validateScenario(scenario)) {
            return;
        }

        // Save to data manager
        this.game.dataManager.scenarios.set(scenario.id, scenario);
        
        // Save to local storage for persistence
        const customScenarios = JSON.parse(localStorage.getItem('kiwiDairy_customScenarios') || '{}');
        customScenarios[scenario.id] = scenario;
        localStorage.setItem('kiwiDairy_customScenarios', JSON.stringify(customScenarios));

        this.uiManager.hideModal();
        this.uiManager.showNotification(`Scenario "${scenario.name}" saved successfully!`, 'success');
        
        console.log('Scenario saved:', scenario);
    }

    collectFormData() {
        return {
            id: document.getElementById('scenario-id').value.trim(),
            name: document.getElementById('scenario-name').value.trim(),
            region: document.getElementById('scenario-region').value.trim(),
            difficulty: document.getElementById('scenario-difficulty').value,
            description: document.getElementById('scenario-description').value.trim(),
            farmName: document.getElementById('farm-name').value.trim(),
            farmSize: parseInt(document.getElementById('farm-size').value),
            startingCash: parseInt(document.getElementById('starting-cash').value),
            startingFeed: parseInt(document.getElementById('starting-feed').value),
            startingCattle: parseInt(document.getElementById('starting-cattle').value),
            startingInfrastructure: {
                milkingShed: document.getElementById('milking-shed').value,
                storage: parseInt(document.getElementById('storage-capacity').value),
                roads: document.getElementById('road-quality').value,
                irrigation: document.getElementById('has-irrigation').checked
            },
            climate: {
                rainfall: document.getElementById('rainfall').value,
                temperature: document.getElementById('temperature').value,
                windRisk: document.getElementById('wind-risk').value,
                droughtRisk: document.getElementById('drought-risk').value
            },
            advantages: document.getElementById('advantages').value.split('\n').filter(line => line.trim()),
            challenges: document.getElementById('challenges').value.split('\n').filter(line => line.trim()),
            goals: {
                primary: document.getElementById('primary-goal').value.trim(),
                secondary: document.getElementById('secondary-goal').value.trim(),
                financial: document.getElementById('financial-goal').value.trim()
            }
        };
    }

    validateScenario(scenario) {
        const errors = [];

        // Required fields
        if (!scenario.id) errors.push('Scenario ID is required');
        if (!scenario.name) errors.push('Scenario name is required');
        if (!scenario.region) errors.push('Region is required');
        if (!scenario.description) errors.push('Description is required');
        
        // Numeric validations
        if (scenario.farmSize < 10 || scenario.farmSize > 1000) {
            errors.push('Farm size must be between 10 and 1000 hectares');
        }
        if (scenario.startingCash < 0) errors.push('Starting cash cannot be negative');
        if (scenario.startingFeed < 0) errors.push('Starting feed cannot be negative');
        if (scenario.startingCattle < 0) errors.push('Starting cattle cannot be negative');
        
        // ID uniqueness check (if not editing)
        if (!this.isEditing && this.game.dataManager.scenarios.has(scenario.id)) {
            errors.push('Scenario ID already exists');
        }

        // Display errors
        if (errors.length > 0) {
            const errorMessage = 'Please fix the following errors:\n' + errors.join('\n');
            this.uiManager.showNotification(errorMessage, 'error');
            return false;
        }

        return true;
    }

    loadCustomScenarios() {
        try {
            const customScenarios = JSON.parse(localStorage.getItem('kiwiDairy_customScenarios') || '{}');
            
            // Add custom scenarios to data manager
            Object.values(customScenarios).forEach(scenario => {
                this.game.dataManager.scenarios.set(scenario.id, scenario);
            });
            
            console.log(`Loaded ${Object.keys(customScenarios).length} custom scenarios`);
        } catch (error) {
            console.error('Failed to load custom scenarios:', error);
        }
    }

    getCustomScenarios() {
        try {
            return JSON.parse(localStorage.getItem('kiwiDairy_customScenarios') || '{}');
        } catch (error) {
            console.error('Failed to get custom scenarios:', error);
            return {};
        }
    }

    deleteCustomScenario(scenarioId) {
        try {
            const customScenarios = this.getCustomScenarios();
            delete customScenarios[scenarioId];
            localStorage.setItem('kiwiDairy_customScenarios', JSON.stringify(customScenarios));
            
            // Remove from data manager
            this.game.dataManager.scenarios.delete(scenarioId);
            
            this.uiManager.showNotification('Scenario deleted successfully!', 'success');
            return true;
        } catch (error) {
            console.error('Failed to delete scenario:', error);
            this.uiManager.showNotification('Failed to delete scenario', 'error');
            return false;
        }
    }
}