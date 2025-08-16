import { BaseSystem } from './BaseSystem.js';

export class WeatherSystem extends BaseSystem {
    applyStorm() {
        this.currentWeather.rainfall *= 0.5;
        this.currentWeather.conditions = 'storm';
        this.game.uiManager.showNotification('Storm event: Pasture growth reduced!', 'warning');
    }
    constructor(game) {
        super(game);
        this.currentWeather = {};
        this.forecast = [];
        this.seasonalPatterns = {};
        this.regionalData = {};
        this.extremeEvents = [];
        this.lastWeatherUpdate = 0;
    }

    async init() {
        await super.init();
        this.setupRegionalData();
        this.initializeWeather();
        this.generateForecast();
    }

    setupRegionalData() {
        const region = this.game.currentScenario?.region?.toLowerCase() || 'canterbury';

        this.regionalData = {
            'canterbury': {
                baseTemp: { spring: 15, summer: 22, autumn: 12, winter: 7 },
                rainfall: { spring: 45, summer: 35, autumn: 50, winter: 65 },
                windSpeed: { spring: 18, summer: 15, autumn: 20, winter: 22 },
                extremeRisk: { drought: 0.3, flood: 0.1, wind: 0.4, frost: 0.2 }
            },
            'waikato': {
                baseTemp: { spring: 16, summer: 24, autumn: 14, winter: 9 },
                rainfall: { spring: 85, summer: 75, autumn: 90, winter: 95 },
                windSpeed: { spring: 12, summer: 10, autumn: 14, winter: 16 },
                extremeRisk: { drought: 0.1, flood: 0.2, wind: 0.1, frost: 0.15 }
            },
            'taranaki': {
                baseTemp: { spring: 15, summer: 21, autumn: 13, winter: 8 },
                rainfall: { spring: 120, summer: 100, autumn: 130, winter: 140 },
                windSpeed: { spring: 25, summer: 20, autumn: 28, winter: 30 },
                extremeRisk: { drought: 0.05, flood: 0.15, wind: 0.6, frost: 0.1 }
            },
            'southland': {
                baseTemp: { spring: 12, summer: 18, autumn: 9, winter: 4 },
                rainfall: { spring: 55, summer: 40, autumn: 65, winter: 75 },
                windSpeed: { spring: 20, summer: 16, autumn: 22, winter: 25 },
                extremeRisk: { drought: 0.15, flood: 0.1, wind: 0.3, frost: 0.5 }
            },
            'bay-of-plenty': {
                baseTemp: { spring: 17, summer: 25, autumn: 15, winter: 10 },
                rainfall: { spring: 75, summer: 65, autumn: 80, winter: 85 },
                windSpeed: { spring: 14, summer: 12, autumn: 16, winter: 18 },
                extremeRisk: { drought: 0.2, flood: 0.1, wind: 0.15, frost: 0.1 }
            }
        };

        this.seasonalPatterns = this.regionalData[region] || this.regionalData['canterbury'];
    }

    initializeWeather() {
        const season = this.game.gameTime.season;
        const patterns = this.seasonalPatterns;

        this.currentWeather = {
            temperature: patterns.baseTemp[season] + (Math.random() - 0.5) * 10,
            rainfall: Math.max(0, patterns.rainfall[season] * (0.5 + Math.random())),
            windSpeed: patterns.windSpeed[season] + (Math.random() - 0.5) * 8,
            humidity: 60 + Math.random() * 30,
            pressure: 1010 + (Math.random() - 0.5) * 40,
            conditions: this.determineConditions(),
            uv: this.calculateUV(),
            extremeEvents: []
        };
    }

    determineConditions() {
        const rand = Math.random();
        if (this.currentWeather?.rainfall > 80) return 'heavy-rain';
        if (this.currentWeather?.rainfall > 40) return 'rain';
        if (this.currentWeather?.rainfall > 10) return 'light-rain';
        if (rand < 0.1) return 'fog';
        if (rand < 0.3) return 'cloudy';
        if (rand < 0.6) return 'partly-cloudy';
        return 'sunny';
    }

    calculateUV() {
        const season = this.game.gameTime.season;
        const hour = this.game.gameTime.hour;

        let baseUV = 0;
        if (season === 'summer') baseUV = 9;
        else if (season === 'spring' || season === 'autumn') baseUV = 6;
        else baseUV = 3;

        // UV varies by time of day
        if (hour < 8 || hour > 18) baseUV = 0;
        else if (hour >= 10 && hour <= 14) baseUV *= 1.0;
        else baseUV *= 0.6;

        if (this.currentWeather.conditions === 'cloudy') baseUV *= 0.3;
        else if (this.currentWeather.conditions === 'partly-cloudy') baseUV *= 0.7;

        return Math.max(0, Math.round(baseUV));
    }

    generateForecast() {
        this.forecast = [];
        const currentWeather = { ...this.currentWeather };

        for (let i = 1; i <= 7; i++) {
            const nextWeather = {
                day: i,
                temperature: currentWeather.temperature + (Math.random() - 0.5) * 6,
                rainfall: Math.max(0, currentWeather.rainfall * (0.7 + Math.random() * 0.6)),
                windSpeed: currentWeather.windSpeed + (Math.random() - 0.5) * 10,
                conditions: this.predictConditions(currentWeather),
                confidence: Math.max(0.4, 1 - (i * 0.1))
            };

            this.forecast.push(nextWeather);
            currentWeather.temperature = nextWeather.temperature;
            currentWeather.rainfall = nextWeather.rainfall;
        }
    }

    predictConditions(baseWeather) {
        if (baseWeather.rainfall > 60) return 'rain';
        if (baseWeather.rainfall > 20) return 'light-rain';
        if (Math.random() < 0.3) return 'cloudy';
        return 'sunny';
    }

    update(deltaTime) {
        super.update(deltaTime);

        const currentHour = this.game.gameTime.hour;

        if (currentHour !== this.lastWeatherUpdate) {
            if (currentHour % 3 === 0) { // Update weather every 3 hours
                this.updateWeather();
            }

            if (currentHour === 0) { // Daily updates
                this.generateForecast();
                this.checkExtremeEvents();
            }

            this.lastWeatherUpdate = currentHour;
        }
    }

    updateWeather() {
        const season = this.game.gameTime.season;
        const patterns = this.seasonalPatterns;

        // Gradual weather changes
        const tempChange = (Math.random() - 0.5) * 3;
        const rainChange = (Math.random() - 0.5) * patterns.rainfall[season] * 0.3;
        const windChange = (Math.random() - 0.5) * 5;

        this.currentWeather.temperature += tempChange;
        this.currentWeather.rainfall = Math.max(0, this.currentWeather.rainfall + rainChange);
        this.currentWeather.windSpeed = Math.max(0, this.currentWeather.windSpeed + windChange);

        // Keep within seasonal bounds
        const minTemp = patterns.baseTemp[season] - 8;
        const maxTemp = patterns.baseTemp[season] + 8;
        this.currentWeather.temperature = Math.max(minTemp, Math.min(maxTemp, this.currentWeather.temperature));

        this.currentWeather.conditions = this.determineConditions();
        this.currentWeather.uv = this.calculateUV();

        // Update humidity and pressure
        this.currentWeather.humidity = 40 + Math.random() * 50;
        this.currentWeather.pressure += (Math.random() - 0.5) * 10;
    }

    checkExtremeEvents() {
        const risks = this.seasonalPatterns.extremeRisk;
        const season = this.game.gameTime.season;

        // Check for drought
        if (Math.random() < risks.drought * 0.01) {
            this.triggerExtremeEvent('drought');
        }

        // Check for flooding
        if (this.currentWeather.rainfall > 100 && Math.random() < risks.flood * 0.02) {
            this.triggerExtremeEvent('flood');
        }

        // Check for wind storms
        if (this.currentWeather.windSpeed > 40 && Math.random() < risks.wind * 0.02) {
            this.triggerExtremeEvent('windstorm');
        }

        // Check for frost
        if (season === 'winter' && this.currentWeather.temperature < 2 && Math.random() < risks.frost * 0.03) {
            this.triggerExtremeEvent('frost');
        }
    }

    triggerExtremeEvent(eventType) {
        const event = {
            type: eventType,
            startDay: this.game.gameTime.day,
            duration: this.getEventDuration(eventType),
            severity: 0.5 + Math.random() * 0.5,
            active: true
        };

        this.extremeEvents.push(event);
        this.currentWeather.extremeEvents.push(eventType);

        // Apply immediate effects
        switch (eventType) {
            case 'drought':
                this.currentWeather.rainfall *= 0.1;
                this.currentWeather.temperature += 5;
                break;
            case 'flood':
                this.currentWeather.rainfall *= 3;
                break;
            case 'windstorm':
                this.currentWeather.windSpeed += 20;
                break;
            case 'frost':
                this.currentWeather.temperature = Math.min(0, this.currentWeather.temperature - 3);
                break;
        }

        this.game.uiManager.showNotification(
            `${eventType.charAt(0).toUpperCase() + eventType.slice(1)} warning issued!`,
            'warning'
        );
    }

    getEventDuration(eventType) {
        const durations = {
            drought: 14 + Math.floor(Math.random() * 21), // 2-5 weeks
            flood: 2 + Math.floor(Math.random() * 5), // 2-7 days
            windstorm: 1 + Math.floor(Math.random() * 2), // 1-3 days
            frost: 1 // 1 day
        };
        return durations[eventType] || 1;
    }

    updateExtremeEvents() {
        this.extremeEvents = this.extremeEvents.filter(event => {
            event.duration--;
            if (event.duration <= 0) {
                event.active = false;
                return false;
            }
            return true;
        });

        // Update current weather extreme events
        this.currentWeather.extremeEvents = this.extremeEvents
            .filter(e => e.active)
            .map(e => e.type);
    }

    getWeatherEffects() {
        const effects = {
            grassGrowth: 1.0,
            cattleComfort: 1.0,
            milkProduction: 1.0,
            workEfficiency: 1.0,
            buildingWear: 1.0
        };

        // Temperature effects
        if (this.currentWeather.temperature < 5) {
            effects.grassGrowth *= 0.3;
            effects.cattleComfort *= 0.7;
        } else if (this.currentWeather.temperature > 25) {
            effects.cattleComfort *= 0.8;
            effects.milkProduction *= 0.9;
        } else if (this.currentWeather.temperature >= 15 && this.currentWeather.temperature <= 20) {
            effects.grassGrowth *= 1.2;
            effects.cattleComfort *= 1.1;
        }

        // Rainfall effects
        if (this.currentWeather.rainfall > 80) {
            effects.workEfficiency *= 0.6;
            effects.grassGrowth *= 0.8;
        } else if (this.currentWeather.rainfall > 20) {
            effects.grassGrowth *= 1.3;
        } else if (this.currentWeather.rainfall < 5) {
            effects.grassGrowth *= 0.5;
        }

        // Wind effects
        if (this.currentWeather.windSpeed > 30) {
            effects.workEfficiency *= 0.7;
            effects.buildingWear *= 1.5;
        }

        // Extreme event effects
        this.currentWeather.extremeEvents.forEach(event => {
            switch (event) {
                case 'drought':
                    effects.grassGrowth *= 0.2;
                    effects.cattleComfort *= 0.6;
                    break;
                case 'flood':
                    effects.workEfficiency *= 0.3;
                    effects.grassGrowth *= 0.4;
                    break;
                case 'windstorm':
                    effects.workEfficiency *= 0.4;
                    effects.buildingWear *= 2.0;
                    break;
                case 'frost':
                    effects.grassGrowth *= 0.1;
                    effects.cattleComfort *= 0.5;
                    break;
            }
        });

        return effects;
    }

    getCurrentWeather() {
        return { ...this.currentWeather };
    }

    getForecast() {
        return [...this.forecast];
    }

    getWeatherIcon() {
        const icons = {
            'sunny': '☀️',
            'partly-cloudy': '⛅',
            'cloudy': '☁️',
            'rain': '🌧️',
            'light-rain': '🌦️',
            'heavy-rain': '⛈️',
            'fog': '🌫️'
        };
        return icons[this.currentWeather.conditions] || '☀️';
    }

    getState() {
        return {
            currentWeather: this.currentWeather,
            forecast: this.forecast,
            seasonalPatterns: this.seasonalPatterns,
            regionalData: this.regionalData,
            extremeEvents: this.extremeEvents,
            lastWeatherUpdate: this.lastWeatherUpdate
        };
    }

    loadState(state) {
        this.currentWeather = state.currentWeather || {};
        this.forecast = state.forecast || [];
        this.seasonalPatterns = state.seasonalPatterns || {};
        this.regionalData = state.regionalData || {};
        this.extremeEvents = state.extremeEvents || [];
        this.lastWeatherUpdate = state.lastWeatherUpdate || 0;
    }
}