export class TutorialManager {
    constructor(game, uiManager) {
        this.game = game;
        this.uiManager = uiManager;
        
        this.currentTutorial = null;
        this.currentStep = 0;
        this.isActive = false;
        this.tutorials = new Map();
        
        this.overlay = null;
        this.tutorialPanel = null;
        
        this.initializeTutorials();
        this.createTutorialUI();
    }

    initializeTutorials() {
        // Basic Tutorial - First time player
        this.tutorials.set('basic', {
            id: 'basic',
            name: 'Welcome to Kiwi Dairy',
            description: 'Learn the basics of dairy farming',
            steps: [
                {
                    title: 'Welcome to Your Farm!',
                    content: 'Welcome to Kiwi Dairy! You are now the proud owner of a dairy farm in beautiful New Zealand. Let\'s start with the basics.',
                    highlight: null,
                    action: null
                },
                {
                    title: 'Understanding Resources',
                    content: 'Look at the top bar - these are your key resources: Cash (💰), Milk (🥛), Feed (🌾), and Energy (⚡). Managing these is crucial for success.',
                    highlight: '#resources-display',
                    action: null
                },
                {
                    title: 'Your Farm View',
                    content: 'This is your farm! Each green area is a pasture where your cows graze. You can click on pastures to get more information about them.',
                    highlight: '#farm-canvas',
                    action: 'click-pasture'
                },
                {
                    title: 'Managing Your Cattle',
                    content: 'Your cows are the heart of your operation. Check the cattle panel to see information about your herd - their health, milk production, and feeding status.',
                    highlight: '#cattle-info',
                    action: null
                },
                {
                    title: 'Feeding Your Cows',
                    content: 'Happy, well-fed cows produce more milk! Click the "Feed Cattle" button to feed your cows. This will cost feed but increase milk production.',
                    highlight: '[data-action="feed-cattle"]',
                    action: 'click-button'
                },
                {
                    title: 'Milking Time',
                    content: 'Now let\'s milk your cows! Click "Milk Cows" to collect milk. This happens automatically twice a day, but you can also do it manually.',
                    highlight: '[data-action="milk-cows"]',
                    action: 'click-button'
                },
                {
                    title: 'Selling Your Milk',
                    content: 'Milk doesn\'t store forever! Click "Sell Milk" to convert your milk into cash. Watch the market prices for the best deals.',
                    highlight: '[data-action="sell-milk"]',
                    action: 'click-button'
                },
                {
                    title: 'Time and Seasons',
                    content: 'Notice the date and weather display. Seasons affect grass growth, milk production, and cattle health. Plan accordingly!',
                    highlight: '#date-weather',
                    action: null
                },
                {
                    title: 'Farm Management',
                    content: 'Use the other buttons to manage pastures, buy more cattle, and upgrade your farm. Each decision affects your profitability!',
                    highlight: '#action-buttons',
                    action: null
                },
                {
                    title: 'You\'re Ready!',
                    content: 'You now know the basics of dairy farming! Remember: keep your cows fed and healthy, manage your resources wisely, and adapt to the seasons. Good luck!',
                    highlight: null,
                    action: null
                }
            ]
        });

        // Pasture Management Tutorial
        this.tutorials.set('pastures', {
            id: 'pastures',
            name: 'Managing Pastures',
            description: 'Learn advanced pasture management techniques',
            steps: [
                {
                    title: 'Pasture Basics',
                    content: 'Pastures are where your cows graze. Each pasture has grass levels, soil fertility, and carrying capacity.',
                    highlight: '#farm-canvas',
                    action: null
                },
                {
                    title: 'Grass Levels',
                    content: 'Green bars show grass levels. High grass = happy cows. Low grass = poor nutrition and lower milk production.',
                    highlight: '#farm-canvas',
                    action: 'click-pasture'
                },
                {
                    title: 'Rotation is Key',
                    content: 'Don\'t overgraze! Move cattle between pastures to let grass recover. This maintains soil health and maximizes production.',
                    highlight: '[data-action="manage-pasture"]',
                    action: null
                },
                {
                    title: 'Soil Fertility',
                    content: 'Fertile soil grows better grass. Consider fertilizing pastures with poor soil fertility for better yields.',
                    highlight: '#farm-info',
                    action: null
                }
            ]
        });

        // Market Tutorial
        this.tutorials.set('market', {
            id: 'market',
            name: 'Understanding Markets',
            description: 'Learn to maximize profits through smart trading',
            steps: [
                {
                    title: 'Market Dynamics',
                    content: 'Milk prices fluctuate based on supply, demand, seasons, and global factors. Buy low, sell high!',
                    highlight: '#production-info',
                    action: null
                },
                {
                    title: 'Seasonal Patterns',
                    content: 'Summer typically has higher prices due to peak production season. Winter may see premium prices due to lower supply.',
                    highlight: '#date-weather',
                    action: null
                },
                {
                    title: 'Storage Strategy',
                    content: 'Sometimes it pays to hold milk for better prices. But remember - milk spoils, so don\'t wait too long!',
                    highlight: '#resources-display',
                    action: null
                }
            ]
        });
    }

    createTutorialUI() {
        // Create overlay
        this.overlay = document.createElement('div');
        this.overlay.className = 'tutorial-overlay';
        this.overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0, 0, 0, 0.7);
            z-index: 9999;
            display: none;
        `;

        // Create tutorial panel
        this.tutorialPanel = document.createElement('div');
        this.tutorialPanel.className = 'tutorial-panel';
        this.tutorialPanel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 24px;
            border-radius: 12px;
            max-width: 500px;
            width: 90vw;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            z-index: 10000;
        `;

        this.tutorialPanel.innerHTML = `
            <div class="tutorial-header">
                <h3 class="tutorial-title"></h3>
                <div class="tutorial-progress">
                    <span class="tutorial-step">1</span>
                    <span class="tutorial-separator"> of </span>
                    <span class="tutorial-total">10</span>
                </div>
            </div>
            <div class="tutorial-content"></div>
            <div class="tutorial-actions">
                <button class="tutorial-btn tutorial-skip">Skip Tutorial</button>
                <div class="tutorial-nav">
                    <button class="tutorial-btn tutorial-prev">Previous</button>
                    <button class="tutorial-btn tutorial-next">Next</button>
                </div>
            </div>
        `;

        this.overlay.appendChild(this.tutorialPanel);
        document.body.appendChild(this.overlay);

        // Add event listeners
        this.setupEventListeners();
    }

    setupEventListeners() {
        const skipBtn = this.tutorialPanel.querySelector('.tutorial-skip');
        const prevBtn = this.tutorialPanel.querySelector('.tutorial-prev');
        const nextBtn = this.tutorialPanel.querySelector('.tutorial-next');

        skipBtn.addEventListener('click', () => this.skipTutorial());
        prevBtn.addEventListener('click', () => this.previousStep());
        nextBtn.addEventListener('click', () => this.nextStep());

        // Close on overlay click (but not panel click)
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) {
                this.skipTutorial();
            }
        });

        // Handle keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.isActive) return;

            switch (e.key) {
                case 'Escape':
                    this.skipTutorial();
                    break;
                case 'ArrowRight':
                case 'Enter':
                    this.nextStep();
                    break;
                case 'ArrowLeft':
                    this.previousStep();
                    break;
            }
        });
    }

    startTutorial(tutorialId) {
        const tutorial = this.tutorials.get(tutorialId);
        if (!tutorial) {
            console.error(`Tutorial not found: ${tutorialId}`);
            return;
        }

        this.currentTutorial = tutorial;
        this.currentStep = 0;
        this.isActive = true;

        // Show overlay
        this.overlay.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Prevent scrolling

        // Show first step
        this.showCurrentStep();

        // Play tutorial start sound
        if (this.game.audioManager) {
            this.game.audioManager.playUISound('success');
        }

        console.log(`Started tutorial: ${tutorial.name}`);
    }

    showCurrentStep() {
        if (!this.currentTutorial) return;

        const step = this.currentTutorial.steps[this.currentStep];
        if (!step) return;

        // Update panel content
        const titleElement = this.tutorialPanel.querySelector('.tutorial-title');
        const contentElement = this.tutorialPanel.querySelector('.tutorial-content');
        const stepElement = this.tutorialPanel.querySelector('.tutorial-step');
        const totalElement = this.tutorialPanel.querySelector('.tutorial-total');
        const prevBtn = this.tutorialPanel.querySelector('.tutorial-prev');
        const nextBtn = this.tutorialPanel.querySelector('.tutorial-next');

        titleElement.textContent = step.title;
        contentElement.innerHTML = step.content;
        stepElement.textContent = this.currentStep + 1;
        totalElement.textContent = this.currentTutorial.steps.length;

        // Update button states
        prevBtn.disabled = this.currentStep === 0;
        nextBtn.textContent = this.currentStep === this.currentTutorial.steps.length - 1 ? 'Finish' : 'Next';

        // Clear previous highlights
        this.clearHighlights();

        // Add highlight if specified
        if (step.highlight) {
            this.highlightElement(step.highlight);
        }

        // Handle step actions
        if (step.action) {
            this.setupStepAction(step.action);
        }
    }

    highlightElement(selector) {
        const element = document.querySelector(selector);
        if (!element) {
            console.warn(`Tutorial highlight element not found: ${selector}`);
            return;
        }

        // Add highlight class
        element.classList.add('tutorial-highlight');

        // Create a spotlight effect
        const spotlight = document.createElement('div');
        spotlight.className = 'tutorial-spotlight';
        
        const rect = element.getBoundingClientRect();
        const padding = 8;
        
        spotlight.style.cssText = `
            position: fixed;
            top: ${rect.top - padding}px;
            left: ${rect.left - padding}px;
            width: ${rect.width + padding * 2}px;
            height: ${rect.height + padding * 2}px;
            border: 2px solid #4CAF50;
            border-radius: 8px;
            background: rgba(76, 175, 80, 0.1);
            pointer-events: none;
            z-index: 9998;
            animation: pulse 2s infinite;
        `;

        document.body.appendChild(spotlight);
        spotlight.dataset.tutorialSpotlight = 'true';
    }

    clearHighlights() {
        // Remove highlight classes
        document.querySelectorAll('.tutorial-highlight').forEach(el => {
            el.classList.remove('tutorial-highlight');
        });

        // Remove spotlight elements
        document.querySelectorAll('[data-tutorial-spotlight]').forEach(el => {
            el.remove();
        });
    }

    setupStepAction(action) {
        switch (action) {
            case 'click-pasture':
                this.waitForPastureClick();
                break;
            case 'click-button':
                this.waitForButtonClick();
                break;
            default:
                console.warn(`Unknown tutorial action: ${action}`);
        }
    }

    waitForPastureClick() {
        const canvas = document.getElementById('farm-canvas');
        if (!canvas) return;

        const clickHandler = () => {
            canvas.removeEventListener('click', clickHandler);
            setTimeout(() => this.nextStep(), 1000); // Delay to show result
        };

        canvas.addEventListener('click', clickHandler);
    }

    waitForButtonClick() {
        const step = this.currentTutorial.steps[this.currentStep];
        if (!step.highlight) return;

        const button = document.querySelector(step.highlight);
        if (!button) return;

        const clickHandler = (e) => {
            e.preventDefault(); // Prevent normal action
            button.removeEventListener('click', clickHandler);
            
            // Show feedback
            this.uiManager.showNotification('Great! You\'re learning fast!', 'success');
            
            setTimeout(() => this.nextStep(), 1500);
        };

        button.addEventListener('click', clickHandler);
    }

    nextStep() {
        if (!this.currentTutorial) return;

        if (this.currentStep < this.currentTutorial.steps.length - 1) {
            this.currentStep++;
            this.showCurrentStep();
            
            // Play step sound
            if (this.game.audioManager) {
                this.game.audioManager.playUISound('click');
            }
        } else {
            this.completeTutorial();
        }
    }

    previousStep() {
        if (!this.currentTutorial || this.currentStep <= 0) return;

        this.currentStep--;
        this.showCurrentStep();

        // Play step sound
        if (this.game.audioManager) {
            this.game.audioManager.playUISound('click');
        }
    }

    skipTutorial() {
        if (!this.isActive) return;

        this.endTutorial();
        
        // Play skip sound
        if (this.game.audioManager) {
            this.game.audioManager.playUISound('warning');
        }

        console.log('Tutorial skipped');
    }

    completeTutorial() {
        if (!this.currentTutorial) return;

        const tutorialName = this.currentTutorial.name;
        this.endTutorial();

        // Show completion message
        this.uiManager.showNotification(
            `Tutorial "${tutorialName}" completed! Great job!`, 
            'success'
        );

        // Play completion sound
        if (this.game.audioManager) {
            this.game.audioManager.playAchievementSound('achievement');
        }

        console.log(`Tutorial completed: ${tutorialName}`);

        // Save tutorial completion (you might want to persist this)
        this.markTutorialCompleted(this.currentTutorial.id);
    }

    endTutorial() {
        this.clearHighlights();
        
        this.overlay.style.display = 'none';
        document.body.style.overflow = ''; // Restore scrolling

        this.currentTutorial = null;
        this.currentStep = 0;
        this.isActive = false;
    }

    markTutorialCompleted(tutorialId) {
        // In a full implementation, you'd save this to localStorage or server
        const completed = JSON.parse(localStorage.getItem('tutorialProgress') || '[]');
        if (!completed.includes(tutorialId)) {
            completed.push(tutorialId);
            localStorage.setItem('tutorialProgress', JSON.stringify(completed));
        }
    }

    isTutorialCompleted(tutorialId) {
        const completed = JSON.parse(localStorage.getItem('tutorialProgress') || '[]');
        return completed.includes(tutorialId);
    }

    // Auto-start tutorials based on game state
    checkAutoTutorials() {
        // Start basic tutorial for new players
        if (!this.isTutorialCompleted('basic') && !this.isActive) {
            // Small delay to let game initialize
            setTimeout(() => {
                this.startTutorial('basic');
            }, 2000);
        }
    }

    // Get available tutorials for manual selection
    getAvailableTutorials() {
        return Array.from(this.tutorials.values()).map(tutorial => ({
            id: tutorial.id,
            name: tutorial.name,
            description: tutorial.description,
            completed: this.isTutorialCompleted(tutorial.id)
        }));
    }

    // Cleanup
    destroy() {
        this.endTutorial();
        
        if (this.overlay) {
            document.body.removeChild(this.overlay);
        }
    }
}