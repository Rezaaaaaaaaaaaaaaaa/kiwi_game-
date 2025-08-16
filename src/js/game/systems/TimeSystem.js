import { BaseSystem } from './BaseSystem.js';

export class TimeSystem extends BaseSystem {
    constructor(game) {
        super(game);
        this.timeScale = 1; // 1 second = 1 hour in game
        this.accumulator = 0;
        this.schedule = new Map();
        this.events = [];
        this.milestones = new Map();
        this.calendar = {};
    }

    async init() {
        await super.init();
        this.setupCalendar();
        this.setupSchedule();
        this.setupMilestones();
    }

    setupCalendar() {
        const seasons = {
            spring: { start: 80, end: 172 }, // Sep-Nov (Southern Hemisphere)
            summer: { start: 173, end: 264 }, // Dec-Feb
            autumn: { start: 265, end: 356 }, // Mar-May
            winter: { start: 1, end: 79 } // Jun-Aug
        };
        
        this.calendar = {
            seasons,
            daysPerYear: 365,
            monthNames: [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ],
            seasonNames: ['summer', 'autumn', 'winter', 'spring']
        };
    }

    setupSchedule() {
        // Daily schedule for farm activities
        this.schedule.set('dawn', { hour: 5, activities: ['prepare-for-day'] });
        this.schedule.set('morning-milking', { hour: 6, activities: ['milk-cows', 'feed-cattle'] });
        this.schedule.set('morning-work', { hour: 8, activities: ['pasture-management', 'maintenance'] });
        this.schedule.set('midday', { hour: 12, activities: ['lunch-break', 'admin-work'] });
        this.schedule.set('afternoon-work', { hour: 14, activities: ['field-work', 'repairs'] });
        this.schedule.set('evening-milking', { hour: 16, activities: ['milk-cows'] });
        this.schedule.set('evening', { hour: 18, activities: ['evening-feed', 'planning'] });
        this.schedule.set('night', { hour: 20, activities: ['rest'] });
    }

    setupMilestones() {
        // Seasonal milestones
        this.milestones.set('spring-start', {
            day: 80,
            name: 'Spring Begins',
            description: 'Time for calving and new grass growth',
            effects: ['increased-grass-growth', 'calving-season']
        });
        
        this.milestones.set('summer-start', {
            day: 173,
            name: 'Summer Begins',
            description: 'Peak milking season and hay making',
            effects: ['peak-production', 'hay-season']
        });
        
        this.milestones.set('autumn-start', {
            day: 265,
            name: 'Autumn Begins',
            description: 'Drying off cows and preparing for winter',
            effects: ['reduced-production', 'winter-prep']
        });
        
        this.milestones.set('winter-start', {
            day: 1,
            name: 'Winter Begins',
            description: 'Indoor feeding and maintenance season',
            effects: ['indoor-feeding', 'maintenance-season']
        });
        
        // Annual milestones
        this.milestones.set('year-end', {
            day: 365,
            name: 'Year End',
            description: 'Time for annual review and planning',
            effects: ['annual-review']
        });
    }

    update(deltaTime) {
        super.update(deltaTime);
        
        // Accumulate time (deltaTime is in milliseconds)
        this.accumulator += deltaTime * this.timeScale;
        
        // Convert to game hours (1000ms = 1 game hour when timeScale = 1)
        const gameHoursToAdd = Math.floor(this.accumulator / 1000);
        
        if (gameHoursToAdd > 0) {
            this.advanceTime(gameHoursToAdd);
            this.accumulator -= gameHoursToAdd * 1000;
        }
    }

    advanceTime(hours) {
        const gameTime = this.game.gameTime;
        
        for (let i = 0; i < hours; i++) {
            gameTime.hour++;
            
            if (gameTime.hour >= 24) {
                gameTime.hour = 0;
                this.advanceDay();
            }
            
            // Check for scheduled activities
            this.checkSchedule();
        }
    }

    advanceDay() {
        const gameTime = this.game.gameTime;
        gameTime.day++;
        
        // Check for year rollover
        if (gameTime.day > this.calendar.daysPerYear) {
            gameTime.day = 1;
            gameTime.year++;
        }
        
        // Update season
        this.updateSeason();
        
        // Check milestones
        this.checkMilestones();
        
        // Trigger daily events
        this.triggerDailyEvents();
    }

    updateSeason() {
        const day = this.game.gameTime.day;
        const seasons = this.calendar.seasons;
        
        let newSeason = 'winter'; // default
        
        for (const [seasonName, range] of Object.entries(seasons)) {
            if (day >= range.start && day <= range.end) {
                newSeason = seasonName;
                break;
            }
        }
        
        if (this.game.gameTime.season !== newSeason) {
            const oldSeason = this.game.gameTime.season;
            this.game.gameTime.season = newSeason;
            
            this.game.uiManager.showNotification(
                `${newSeason.charAt(0).toUpperCase() + newSeason.slice(1)} has begun!`,
                'info'
            );
            
            // Trigger season change events
            this.triggerSeasonChange(oldSeason, newSeason);
        }
    }

    checkSchedule() {
        const currentHour = this.game.gameTime.hour;
        
        for (const [name, schedule] of this.schedule) {
            if (schedule.hour === currentHour) {
                this.triggerScheduledActivities(name, schedule.activities);
            }
        }
    }

    checkMilestones() {
        const currentDay = this.game.gameTime.day;
        
        for (const [id, milestone] of this.milestones) {
            if (milestone.day === currentDay && !milestone.triggered) {
                this.triggerMilestone(id, milestone);
            }
        }
    }

    triggerScheduledActivities(scheduleName, activities) {
        // This is called automatically, systems can listen for these
        this.events.push({
            type: 'schedule',
            name: scheduleName,
            activities: activities,
            timestamp: Date.now(),
            gameTime: { ...this.game.gameTime }
        });
    }

    triggerSeasonChange(oldSeason, newSeason) {
        this.events.push({
            type: 'season-change',
            oldSeason,
            newSeason,
            timestamp: Date.now(),
            gameTime: { ...this.game.gameTime }
        });
    }

    triggerMilestone(id, milestone) {
        milestone.triggered = true;
        
        this.game.uiManager.showNotification(
            `${milestone.name}: ${milestone.description}`,
            'info'
        );
        
        this.events.push({
            type: 'milestone',
            id,
            milestone,
            timestamp: Date.now(),
            gameTime: { ...this.game.gameTime }
        });
        
        // Reset milestone for next year if it's annual
        if (id === 'year-end') {
            milestone.triggered = false;
        }
    }

    triggerDailyEvents() {
        this.events.push({
            type: 'daily',
            timestamp: Date.now(),
            gameTime: { ...this.game.gameTime }
        });
        
        // Clean up old events (keep last 100)
        if (this.events.length > 100) {
            this.events = this.events.slice(-100);
        }
    }

    setTimeScale(scale) {
        this.timeScale = Math.max(0.1, Math.min(10, scale));
        
        this.game.uiManager.showNotification(
            `Time scale set to ${this.timeScale}x`,
            'info'
        );
    }

    pauseTime() {
        this.timeScale = 0;
    }

    resumeTime(scale = 1) {
        this.timeScale = scale;
    }

    getTimeString() {
        const gameTime = this.game.gameTime;
        const hour = gameTime.hour.toString().padStart(2, '0');
        return `${hour}:00`;
    }

    getDateString() {
        const gameTime = this.game.gameTime;
        const month = this.getMonthFromDay(gameTime.day);
        const dayInMonth = this.getDayInMonth(gameTime.day, month);
        
        return `${dayInMonth} ${this.calendar.monthNames[month]} ${gameTime.year}`;
    }

    getMonthFromDay(dayOfYear) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let totalDays = 0;
        
        for (let month = 0; month < 12; month++) {
            totalDays += daysInMonth[month];
            if (dayOfYear <= totalDays) {
                return month;
            }
        }
        return 11; // December
    }

    getDayInMonth(dayOfYear, month) {
        const daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        let totalDays = 0;
        
        for (let m = 0; m < month; m++) {
            totalDays += daysInMonth[m];
        }
        
        return dayOfYear - totalDays;
    }

    isWorkingHours() {
        const hour = this.game.gameTime.hour;
        return hour >= 6 && hour <= 18;
    }

    isMilkingTime() {
        const hour = this.game.gameTime.hour;
        return hour === 6 || hour === 16; // 6 AM and 4 PM
    }

    getDaylight() {
        const season = this.game.gameTime.season;
        const hour = this.game.gameTime.hour;
        
        // Daylight hours by season (Southern Hemisphere)
        const daylightHours = {
            summer: { start: 5, end: 20 }, // Long days
            autumn: { start: 6, end: 18 }, // Medium days
            winter: { start: 7, end: 17 }, // Short days
            spring: { start: 6, end: 19 }  // Medium-long days
        };
        
        const daylight = daylightHours[season];
        return hour >= daylight.start && hour <= daylight.end;
    }

    getRecentEvents(count = 10) {
        return this.events.slice(-count);
    }

    scheduleEvent(name, hoursFromNow, callback) {
        const triggerTime = {
            day: this.game.gameTime.day,
            hour: this.game.gameTime.hour + hoursFromNow
        };
        
        // Handle day overflow
        while (triggerTime.hour >= 24) {
            triggerTime.hour -= 24;
            triggerTime.day++;
        }
        
        this.events.push({
            type: 'scheduled',
            name,
            triggerTime,
            callback,
            timestamp: Date.now(),
            gameTime: { ...this.game.gameTime }
        });
    }

    getState() {
        return {
            timeScale: this.timeScale,
            accumulator: this.accumulator,
            schedule: Array.from(this.schedule.entries()),
            events: this.events,
            milestones: Array.from(this.milestones.entries()),
            calendar: this.calendar
        };
    }

    loadState(state) {
        this.timeScale = state.timeScale || 1;
        this.accumulator = state.accumulator || 0;
        this.events = state.events || [];
        this.calendar = state.calendar || {};
        
        if (state.schedule) {
            this.schedule = new Map(state.schedule);
        }
        
        if (state.milestones) {
            this.milestones = new Map(state.milestones);
        }
    }
}