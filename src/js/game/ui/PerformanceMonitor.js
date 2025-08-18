// Performance monitoring system with real-time charts
export class PerformanceMonitor {
    constructor(game, container) {
        this.game = game;
        this.container = container;
        this.isVisible = false;
        this.updateInterval = null;
        this.charts = new Map();
        this.data = {
            fps: [],
            memory: [],
            production: [],
            profit: [],
            efficiency: [],
            cattle: [],
            milk: []
        };
        this.maxDataPoints = 50;
        
        this.init();
    }

    init() {
        this.createMonitorPanel();
        this.setupCharts();
        this.startMonitoring();
    }

    createMonitorPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'performance-monitor';
        this.panel.innerHTML = `
            <div class="monitor-header">
                <h3>📊 Real-Time Performance</h3>
                <div class="monitor-controls">
                    <button id="toggle-monitor" class="monitor-btn">🔽 Hide</button>
                    <button id="reset-charts" class="monitor-btn">🔄 Reset</button>
                </div>
            </div>
            <div class="monitor-content">
                <div class="charts-grid">
                    <div class="chart-container">
                        <h4>🎯 FPS & Performance</h4>
                        <canvas id="fps-chart" width="200" height="120"></canvas>
                        <div class="chart-stats">
                            <span id="fps-current">FPS: 0</span>
                            <span id="memory-current">Memory: 0MB</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4>🥛 Production Rate</h4>
                        <canvas id="production-chart" width="200" height="120"></canvas>
                        <div class="chart-stats">
                            <span id="production-current">0 L/day</span>
                            <span id="efficiency-current">0% efficiency</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4>💰 Financial Performance</h4>
                        <canvas id="financial-chart" width="200" height="120"></canvas>
                        <div class="chart-stats">
                            <span id="profit-current">$0/day</span>
                            <span id="revenue-current">$0 total</span>
                        </div>
                    </div>
                    <div class="chart-container">
                        <h4>🐄 Farm Status</h4>
                        <canvas id="farm-chart" width="200" height="120"></canvas>
                        <div class="chart-stats">
                            <span id="cattle-current">0 cattle</span>
                            <span id="milk-current">0L stored</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        this.container.appendChild(this.panel);
        this.setupEventListeners();
    }

    setupEventListeners() {
        const toggleBtn = document.getElementById('toggle-monitor');
        const resetBtn = document.getElementById('reset-charts');
        
        toggleBtn?.addEventListener('click', () => this.toggleVisibility());
        resetBtn?.addEventListener('click', () => this.resetCharts());
    }

    setupCharts() {
        this.charts.set('fps', this.createChart('fps-chart', '#4CAF50', '#81C784'));
        this.charts.set('production', this.createChart('production-chart', '#2196F3', '#64B5F6'));
        this.charts.set('financial', this.createChart('financial-chart', '#FF9800', '#FFB74D'));
        this.charts.set('farm', this.createChart('farm-chart', '#9C27B0', '#BA68C8'));
    }

    createChart(canvasId, primaryColor, secondaryColor) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        return {
            canvas,
            ctx,
            primaryColor,
            secondaryColor,
            data: [],
            secondaryData: []
        };
    }

    startMonitoring() {
        this.lastTime = performance.now();
        this.frameCount = 0;
        
        this.updateInterval = setInterval(() => {
            this.collectData();
            this.updateCharts();
            this.updateStats();
        }, 1000);
        
        // FPS tracking
        this.fpsInterval = setInterval(() => {
            this.calculateFPS();
        }, 100);
    }

    collectData() {
        const gameState = this.game.getGameState();
        const currentTime = performance.now();
        
        // Memory usage (rough estimate)
        const memoryUsage = performance.memory ? 
            Math.round(performance.memory.usedJSHeapSize / 1024 / 1024) : 0;
        
        // Game metrics
        const production = this.calculateDailyProduction();
        const profit = this.calculateDailyProfit();
        const efficiency = this.calculateEfficiency();
        
        // Store data points
        this.addDataPoint('memory', memoryUsage);
        this.addDataPoint('production', production);
        this.addDataPoint('profit', profit);
        this.addDataPoint('efficiency', efficiency);
        this.addDataPoint('cattle', gameState.systems?.cattle?.cattle?.length || 0);
        this.addDataPoint('milk', gameState.resources?.milk || 0);
    }

    calculateFPS() {
        const currentTime = performance.now();
        this.frameCount++;
        
        if (currentTime - this.lastTime >= 1000) {
            const fps = Math.round(this.frameCount * 1000 / (currentTime - this.lastTime));
            this.addDataPoint('fps', fps);
            this.frameCount = 0;
            this.lastTime = currentTime;
        }
    }

    calculateDailyProduction() {
        const gameState = this.game.getGameState();
        const cattle = gameState.systems?.cattle?.cattle || [];
        
        return cattle.reduce((total, cow) => {
            if (cow.lactating && cow.health > 50) {
                return total + (cow.milkYield * (cow.health / 100));
            }
            return total;
        }, 0);
    }

    calculateDailyProfit() {
        const production = this.calculateDailyProduction();
        const pricePerLitre = 0.65;
        const dailyFeedCost = (this.game.getGameState().systems?.cattle?.cattle?.length || 0) * 15 * 0.25;
        
        return (production * pricePerLitre) - dailyFeedCost;
    }

    calculateEfficiency() {
        const gameState = this.game.getGameState();
        const cattle = gameState.systems?.cattle?.cattle || [];
        
        if (cattle.length === 0) return 0;
        
        const avgHealth = cattle.reduce((sum, cow) => sum + cow.health, 0) / cattle.length;
        const lactatingRatio = cattle.filter(cow => cow.lactating).length / cattle.length;
        
        return (avgHealth * 0.7 + lactatingRatio * 100 * 0.3);
    }

    addDataPoint(metric, value) {
        this.data[metric].push(value);
        if (this.data[metric].length > this.maxDataPoints) {
            this.data[metric].shift();
        }
    }

    updateCharts() {
        this.drawChart('fps', this.data.fps, this.data.memory, 'FPS', 'Memory');
        this.drawChart('production', this.data.production, this.data.efficiency, 'Production', 'Efficiency');
        this.drawChart('financial', this.data.profit, [], 'Profit/Day');
        this.drawChart('farm', this.data.cattle, this.data.milk, 'Cattle', 'Milk');
    }

    drawChart(chartName, primaryData, secondaryData = [], primaryLabel = '', secondaryLabel = '') {
        const chart = this.charts.get(chartName);
        if (!chart || !primaryData.length) return;
        
        const { ctx, canvas, primaryColor, secondaryColor } = chart;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Draw grid
        this.drawGrid(ctx, width, height);
        
        // Draw primary data line
        if (primaryData.length > 1) {
            this.drawLine(ctx, primaryData, width, height, primaryColor, 2);
        }
        
        // Draw secondary data line
        if (secondaryData.length > 1) {
            this.drawLine(ctx, secondaryData, width, height, secondaryColor, 1, true);
        }
        
        // Draw current value indicators
        if (primaryData.length > 0) {
            this.drawCurrentValue(ctx, primaryData[primaryData.length - 1], width, height, primaryColor);
        }
    }

    drawGrid(ctx, width, height) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;
        
        // Horizontal lines
        for (let i = 0; i <= 4; i++) {
            const y = (height / 4) * i;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
        
        // Vertical lines
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
    }

    drawLine(ctx, data, width, height, color, lineWidth = 2, dashed = false) {
        if (data.length < 2) return;
        
        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min || 1;
        
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
        
        if (dashed) {
            ctx.setLineDash([5, 5]);
        } else {
            ctx.setLineDash([]);
        }
        
        ctx.beginPath();
        
        data.forEach((value, index) => {
            const x = (index / (data.length - 1)) * width;
            const y = height - ((value - min) / range) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Add glow effect
        ctx.shadowColor = color;
        ctx.shadowBlur = 3;
        ctx.stroke();
        ctx.shadowBlur = 0;
    }

    drawCurrentValue(ctx, value, width, height, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(width - 5, height / 2, 3, 0, 2 * Math.PI);
        ctx.fill();
        
        // Add pulse animation
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(width - 5, height / 2, 8, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    updateStats() {
        const elements = {
            'fps-current': `FPS: ${this.data.fps[this.data.fps.length - 1] || 0}`,
            'memory-current': `Memory: ${this.data.memory[this.data.memory.length - 1] || 0}MB`,
            'production-current': `${(this.data.production[this.data.production.length - 1] || 0).toFixed(1)} L/day`,
            'efficiency-current': `${(this.data.efficiency[this.data.efficiency.length - 1] || 0).toFixed(1)}% efficiency`,
            'profit-current': `$${(this.data.profit[this.data.profit.length - 1] || 0).toFixed(2)}/day`,
            'revenue-current': `$${this.game.getGameState().resources?.cash || 0} total`,
            'cattle-current': `${this.data.cattle[this.data.cattle.length - 1] || 0} cattle`,
            'milk-current': `${(this.data.milk[this.data.milk.length - 1] || 0).toFixed(1)}L stored`
        };
        
        Object.entries(elements).forEach(([id, text]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = text;
        });
    }

    toggleVisibility() {
        this.isVisible = !this.isVisible;
        const content = this.panel.querySelector('.monitor-content');
        const toggleBtn = document.getElementById('toggle-monitor');
        
        if (this.isVisible) {
            content.style.display = 'block';
            toggleBtn.textContent = '🔽 Hide';
        } else {
            content.style.display = 'none';
            toggleBtn.textContent = '🔼 Show';
        }
    }

    resetCharts() {
        Object.keys(this.data).forEach(key => {
            this.data[key] = [];
        });
        this.updateCharts();
    }

    destroy() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this.fpsInterval) {
            clearInterval(this.fpsInterval);
        }
        if (this.panel && this.panel.parentNode) {
            this.panel.parentNode.removeChild(this.panel);
        }
    }
}