import { BaseSystem } from './BaseSystem.js';

export class WeatherSystem extends BaseSystem {
    constructor(game) {
        super(game);
        this.currentWeather = {
            temperature: 18,
            rainfall: 0,
            windSpeed: 5,
            humidity: 65,
            pressure: 1013,
            conditions: 'sunny'
        };
        this.forecast = [];
        this.seasonalPatterns = {};
        this.regionalData = {};
        this.extremeEvents = [];
        this.lastWeatherUpdate = 0;
        this.dailyEvents = [];
    }

    async init() {
        await super.init();
        this.setupRegionalData();
        // Initialize with default weather - no game state dependencies
        this.currentWeather = {
            temperature: 18,
            rainfall: 0,
            windSpeed: 5,
            humidity: 65,
            pressure: 1013,
            conditions: 'sunny'
        };
    }

    start() {
        super.start();
        this.initializeWeather();
        this.generateForecast();
    }

    setupRegionalData() {
        // Default regional data - can be overridden when scenario is selected
        this.regionalData = {
            'canterbury': {
                baseTemp: { spring: 15, summer: 22, autumn: 12, winter: 7 },
                rainfall: { spring: 45, summer: 35, autumn: 50, winter: 65 },
                windSpeed: { spring: 12, summer: 8, autumn: 15, winter: 18 }
            },
            'waikato': {
                baseTemp: { spring: 16, summer: 23, autumn: 13, winter: 8 },
                rainfall: { spring: 95, summer: 85, autumn: 100, winter: 110 },
                windSpeed: { spring: 8, summer: 6, autumn: 10, winter: 12 }
            },
            'taranaki': {
                baseTemp: { spring: 15, summer: 21, autumn: 12, winter: 7 },
                rainfall: { spring: 120, summer: 110, autumn: 130, winter: 140 },
                windSpeed: { spring: 15, summer: 12, autumn: 18, winter: 22 }
            },
            'southland': {
                baseTemp: { spring: 11, summer: 17, autumn: 8, winter: 3 },
                rainfall: { spring: 75, summer: 65, autumn: 80, winter: 90 },
                windSpeed: { spring: 18, summer: 14, autumn: 20, winter: 25 }
            },
            'bay-of-plenty': {
                baseTemp: { spring: 18, summer: 24, autumn: 15, winter: 10 },
                rainfall: { spring: 80, summer: 70, autumn: 85, winter: 95 },
                windSpeed: { spring: 10, summer: 8, autumn: 12, winter: 15 }
            }
        };

        // Set default patterns
        this.seasonalPatterns = this.regionalData['canterbury'];
    }

    initializeWeather() {
        const season = this.game.gameTime?.season || 'spring';
        const region = this.game.currentScenario?.region?.toLowerCase() || 'canterbury';
        
        // Update patterns based on current scenario
        this.seasonalPatterns = this.regionalData[region] || this.regionalData['canterbury'];
        
        const patterns = this.seasonalPatterns;
        
        this.currentWeather = {
            temperature: patterns.baseTemp[season] + (Math.random() - 0.5) * 10,
            rainfall: Math.max(0, patterns.rainfall[season] * (0.5 + Math.random())),
            windSpeed: patterns.windSpeed[season] + (Math.random() - 0.5) * 8,
            humidity: 60 + Math.random() * 30,
            pressure: 1010 + (Math.random() - 0.5) * 40,
            conditions: this.determineConditions()
        };
    }

    determineConditions() {
        const conditions = ['sunny', 'cloudy', 'partly-cloudy', 'overcast'];
        if (this.currentWeather.rainfall > 5) {
            return Math.random() < 0.7 ? 'rain' : 'heavy-rain';
        }
        if (this.currentWeather.windSpeed > 20) {
            return 'windy';
        }
        return conditions[Math.floor(Math.random() * conditions.length)];
    }

    generateForecast() {
        this.forecast = [];
        for (let i = 1; i <= 7; i++) {
            const day = {
                day: i,
                temperature: this.currentWeather.temperature + (Math.random() - 0.5) * 6,
                rainfall: Math.max(0, this.currentWeather.rainfall * (0.7 + Math.random() * 0.6)),
                conditions: this.determineConditions()
            };
            this.forecast.push(day);
        }
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Update weather every game hour
        const now = Date.now();
        if (now - this.lastWeatherUpdate > 5000) { // 5 seconds = 1 game hour
            this.updateWeather();
            this.lastWeatherUpdate = now;
        }
    }

    updateWeather() {
        // Small random changes to current weather
        this.currentWeather.temperature += (Math.random() - 0.5) * 2;
        this.currentWeather.rainfall = Math.max(0, this.currentWeather.rainfall + (Math.random() - 0.5) * 10);
        this.currentWeather.windSpeed = Math.max(0, this.currentWeather.windSpeed + (Math.random() - 0.5) * 4);
        this.currentWeather.conditions = this.determineConditions();

        // Check for extreme events
        this.checkExtremeEvents();
    }

    checkExtremeEvents() {
        // Random chance for extreme weather events
        if (Math.random() < 0.001) { // 0.1% chance per update
            this.triggerExtremeEvent();
        }
    }

    triggerExtremeEvent() {
        const events = ['storm', 'drought', 'flood', 'heatwave', 'frost'];
        const event = events[Math.floor(Math.random() * events.length)];
        
        this.extremeEvents.push({
            type: event,
            severity: Math.random(),
            duration: 1 + Math.random() * 3, // 1-4 days
            startDay: this.game.gameTime?.day || 1
        });

        this.applyExtremeEvent(event);
    }

    applyExtremeEvent(eventType) {
        switch (eventType) {
            case 'storm':
                this.applyStorm();
                break;
            case 'drought':
                this.currentWeather.rainfall = 0;
                this.game.uiManager?.showNotification('Drought warning issued!', 'warning');
                break;
            case 'flood':
                this.currentWeather.rainfall = 50;
                this.game.uiManager?.showNotification('Flood warning! Pastures affected.', 'warning');
                break;
            case 'heatwave':
                this.currentWeather.temperature += 15;
                this.game.uiManager?.showNotification('Heatwave! Cattle stress increased.', 'warning');
                break;
            case 'frost':
                this.currentWeather.temperature = Math.min(this.currentWeather.temperature, 2);
                this.game.uiManager?.showNotification('Frost warning! Grass growth stopped.', 'warning');
                break;
        }
    }

    applyStorm() {
        this.currentWeather.rainfall = 25;
        this.currentWeather.windSpeed = 35;
        this.currentWeather.conditions = 'storm';
        this.game.uiManager?.showNotification('Storm event: Pasture growth reduced!', 'warning');
    }

    getWeatherForDay(day) {
        return this.forecast.find(f => f.day === day) || this.currentWeather;
    }

    getSeasonalMultiplier(season) {
        const multipliers = {
            spring: 1.2,
            summer: 1.0,
            autumn: 0.8,
            winter: 0.4
        };
        return multipliers[season] || 1.0;
    }

    getState() {
        return {
            currentWeather: this.currentWeather,
            forecast: this.forecast,
            extremeEvents: this.extremeEvents,
            lastWeatherUpdate: this.lastWeatherUpdate
        };
    }

    loadState(state) {
        this.currentWeather = state.currentWeather || this.currentWeather;
        this.forecast = state.forecast || [];
        this.extremeEvents = state.extremeEvents || [];
        this.lastWeatherUpdate = state.lastWeatherUpdate || 0;
    }
}