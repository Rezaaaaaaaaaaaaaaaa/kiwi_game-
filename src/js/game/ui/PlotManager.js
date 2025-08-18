// Plot Manager for time series and performance visualization
export class PlotManager {
    constructor(game) {
        this.game = game;
        this.plots = new Map();
        this.plotConfigs = new Map();
        this.updateInterval = 1000; // Update plots every second
        this.lastUpdate = 0;
        this.isVisible = false;
        this.currentTab = 'production';
    }

    init() {
        this.setupPlotConfigs();
        this.createPlotUI();
        console.log('PlotManager initialized');
    }

    setupPlotConfigs() {
        // Production metrics plots
        this.plotConfigs.set('milkProduction', {
            title: 'Milk Production (L/day)',
            type: 'line',
            color: '#4285f4',
            dataKey: 'milkProduction',
            category: 'production',
            yAxisLabel: 'Litres per Day',
            precision: 1,
            target: 2000 // Target daily production
        });

        this.plotConfigs.set('milkQuality', {
            title: 'Milk Quality (%)',
            type: 'line',
            color: '#ea4335',
            dataKey: 'quality',
            category: 'production',
            yAxisLabel: 'Quality Percentage',
            precision: 1,
            yMax: 100,
            target: 95
        });

        this.plotConfigs.set('farmEfficiency', {
            title: 'Farm Efficiency (%)',
            type: 'line',
            color: '#34a853',
            dataKey: 'overall',
            category: 'production',
            yAxisLabel: 'Efficiency Percentage',
            precision: 1,
            yMax: 100,
            target: 85
        });

        // Financial metrics plots
        this.plotConfigs.set('dailyIncome', {
            title: 'Daily Income ($)',
            type: 'bar',
            color: '#34a853',
            dataKey: 'income',
            category: 'financial',
            yAxisLabel: 'Income ($)',
            precision: 0,
            formatValue: this.formatCurrency
        });

        this.plotConfigs.set('dailyExpenses', {
            title: 'Daily Expenses ($)',
            type: 'bar',
            color: '#ea4335',
            dataKey: 'expenses',
            category: 'financial',
            yAxisLabel: 'Expenses ($)',
            precision: 0,
            formatValue: this.formatCurrency
        });

        this.plotConfigs.set('netProfit', {
            title: 'Daily Net Profit ($)',
            type: 'line',
            color: '#fbbc05',
            dataKey: 'profit',
            category: 'financial',
            yAxisLabel: 'Profit ($)',
            precision: 0,
            formatValue: this.formatCurrency,
            showZeroLine: true
        });

        this.plotConfigs.set('cashFlow', {
            title: 'Cash on Hand ($)',
            type: 'area',
            color: '#4285f4',
            dataKey: 'cash',
            category: 'financial',
            yAxisLabel: 'Cash ($)',
            precision: 0,
            formatValue: this.formatCurrency
        });

        // Cattle metrics plots
        this.plotConfigs.set('cattleCount', {
            title: 'Total Cattle Count',
            type: 'step',
            color: '#8e44ad',
            dataKey: 'cattleCount',
            category: 'cattle',
            yAxisLabel: 'Number of Cattle',
            precision: 0
        });

        this.plotConfigs.set('cattleHealth', {
            title: 'Average Cattle Health (%)',
            type: 'line',
            color: '#e74c3c',
            dataKey: 'cattle',
            category: 'cattle',
            yAxisLabel: 'Health Percentage',
            precision: 1,
            yMax: 100,
            target: 85
        });

        this.plotConfigs.set('feedConsumption', {
            title: 'Daily Feed Consumption (kg)',
            type: 'bar',
            color: '#f39c12',
            dataKey: 'feedConsumption',
            category: 'cattle',
            yAxisLabel: 'Feed (kg)',
            precision: 0
        });

        // Environmental metrics plots
        this.plotConfigs.set('environmentalCompliance', {
            title: 'Environmental Compliance (%)',
            type: 'line',
            color: '#27ae60',
            dataKey: 'compliance',
            category: 'environment',
            yAxisLabel: 'Compliance Percentage',
            precision: 1,
            yMax: 100,
            target: 90
        });

        this.plotConfigs.set('carbonFootprint', {
            title: 'Carbon Footprint (kg CO2/day)',
            type: 'area',
            color: '#95a5a6',
            dataKey: 'carbon',
            category: 'environment',
            yAxisLabel: 'CO2 (kg)',
            precision: 0
        });

        this.plotConfigs.set('waterUsage', {
            title: 'Water Usage (L/day)',
            type: 'bar',
            color: '#3498db',
            dataKey: 'water',
            category: 'environment',
            yAxisLabel: 'Water (Litres)',
            precision: 0
        });

        // Farm operations plots
        this.plotConfigs.set('pastureQuality', {
            title: 'Average Pasture Quality (%)',
            type: 'line',
            color: '#2ecc71',
            dataKey: 'pasture',
            category: 'operations',
            yAxisLabel: 'Quality Percentage',
            precision: 1,
            yMax: 100,
            target: 80
        });

        this.plotConfigs.set('weatherImpact', {
            title: 'Weather Impact Score',
            type: 'line',
            color: '#9b59b6',
            dataKey: 'weatherScore',
            category: 'operations',
            yAxisLabel: 'Impact Score',
            precision: 1
        });
    }

    createPlotUI() {
        // Create plots panel in the UI
        const plotsPanel = document.createElement('div');
        plotsPanel.id = 'plots-panel';
        plotsPanel.className = 'plots-panel hidden';
        plotsPanel.innerHTML = `
            <div class="plots-header">
                <h2>📊 Performance Analytics</h2>
                <div class="plots-controls">
                    <button id="plots-toggle" class="btn-secondary">Show Plots</button>
                    <select id="plots-timerange">
                        <option value="7">Last 7 days</option>
                        <option value="30" selected>Last 30 days</option>
                        <option value="90">Last 90 days</option>
                        <option value="365">Last year</option>
                    </select>
                </div>
            </div>
            <div class="plots-tabs">
                <button class="plot-tab active" data-tab="production">Production</button>
                <button class="plot-tab" data-tab="financial">Financial</button>
                <button class="plot-tab" data-tab="cattle">Cattle</button>
                <button class="plot-tab" data-tab="environment">Environment</button>
                <button class="plot-tab" data-tab="operations">Operations</button>
            </div>
            <div class="plots-content">
                <div class="plots-grid" id="plots-grid"></div>
            </div>
        `;

        // Add to game UI
        const gameScreen = document.getElementById('game-screen');
        if (gameScreen) {
            gameScreen.appendChild(plotsPanel);
        }

        this.setupEventListeners();
        this.createAllPlots();
    }

    setupEventListeners() {
        // Toggle plots visibility
        const toggleBtn = document.getElementById('plots-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.togglePlotsVisibility());
        }

        // Tab switching
        document.querySelectorAll('.plot-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Time range selector
        const timeRangeSelect = document.getElementById('plots-timerange');
        if (timeRangeSelect) {
            timeRangeSelect.addEventListener('change', () => {
                this.updateAllPlots();
            });
        }
    }

    togglePlotsVisibility() {
        const panel = document.getElementById('plots-panel');
        const toggleBtn = document.getElementById('plots-toggle');
        
        if (panel && toggleBtn) {
            this.isVisible = !this.isVisible;
            panel.classList.toggle('hidden', !this.isVisible);
            toggleBtn.textContent = this.isVisible ? 'Hide Plots' : 'Show Plots';
            
            if (this.isVisible) {
                this.updateAllPlots();
            }
        }
    }

    switchTab(tabName) {
        this.currentTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.plot-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Update visible plots
        this.updateVisiblePlots();
    }

    createAllPlots() {
        const plotsGrid = document.getElementById('plots-grid');
        if (!plotsGrid) return;

        plotsGrid.innerHTML = '';

        for (const [plotId, config] of this.plotConfigs) {
            const plotContainer = this.createPlotContainer(plotId, config);
            plotsGrid.appendChild(plotContainer);
            
            // Create the actual plot
            this.createPlot(plotId, config);
        }

        this.updateVisiblePlots();
    }

    createPlotContainer(plotId, config) {
        const container = document.createElement('div');
        container.className = `plot-container plot-${config.category}`;
        container.id = `plot-${plotId}`;
        container.innerHTML = `
            <div class="plot-header">
                <h3>${config.title}</h3>
                <div class="plot-stats">
                    <span class="plot-current" id="current-${plotId}">--</span>
                    ${config.target ? `<span class="plot-target">Target: ${config.target}</span>` : ''}
                </div>
            </div>
            <div class="plot-content">
                <canvas id="canvas-${plotId}" width="400" height="250"></canvas>
            </div>
        `;
        return container;
    }

    createPlot(plotId, config) {
        const canvas = document.getElementById(`canvas-${plotId}`);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const plot = {
            canvas,
            ctx,
            config,
            data: [],
            lastUpdate: 0
        };

        this.plots.set(plotId, plot);
    }

    updateVisiblePlots() {
        document.querySelectorAll('.plot-container').forEach(container => {
            const isVisible = container.classList.contains(`plot-${this.currentTab}`);
            container.style.display = isVisible ? 'block' : 'none';
        });
    }

    update(deltaTime) {
        if (!this.isVisible) return;

        this.lastUpdate += deltaTime;
        if (this.lastUpdate >= this.updateInterval) {
            this.updateAllPlots();
            this.lastUpdate = 0;
        }
    }

    updateAllPlots() {
        if (!this.game.systems.has('statistics')) return;

        const statsSystem = this.game.systems.get('statistics');
        const timeRange = parseInt(document.getElementById('plots-timerange')?.value || '30');

        // Get data for each category
        const productionData = statsSystem.getAnalytics('production', timeRange);
        const financialData = statsSystem.getAnalytics('financial', timeRange);
        const efficiencyData = statsSystem.getAnalytics('efficiency', timeRange);
        const environmentalData = statsSystem.getAnalytics('environmental', timeRange);

        // Update each plot
        for (const [plotId, plot] of this.plots) {
            const config = plot.config;
            let data = [];

            switch (config.category) {
                case 'production':
                    data = productionData;
                    break;
                case 'financial':
                    data = financialData;
                    break;
                case 'cattle':
                case 'operations':
                    data = efficiencyData;
                    break;
                case 'environment':
                    data = environmentalData;
                    break;
            }

            this.updatePlot(plotId, data);
        }
    }

    updatePlot(plotId, data) {
        const plot = this.plots.get(plotId);
        if (!plot || !data.length) return;

        const { canvas, ctx, config } = plot;
        const width = canvas.width;
        const height = canvas.height;
        const padding = 40;

        // Clear canvas
        ctx.clearRect(0, 0, width, height);

        // Extract values for this plot
        const values = data.map(d => d[config.dataKey] || 0);
        const days = data.map(d => d.day);

        if (values.length === 0) return;

        // Calculate scales
        const maxValue = config.yMax || Math.max(...values, config.target || 0);
        const minValue = config.showZeroLine ? Math.min(0, Math.min(...values)) : Math.min(...values);
        const valueRange = maxValue - minValue;
        
        const xScale = (width - 2 * padding) / (values.length - 1 || 1);
        const yScale = (height - 2 * padding) / valueRange;

        // Draw background and grid
        this.drawGrid(ctx, width, height, padding, values.length, valueRange, minValue);

        // Draw target line if specified
        if (config.target) {
            this.drawTargetLine(ctx, config.target, minValue, yScale, padding, width);
        }

        // Draw zero line if specified
        if (config.showZeroLine && minValue < 0) {
            this.drawZeroLine(ctx, minValue, yScale, padding, width);
        }

        // Draw the data
        switch (config.type) {
            case 'line':
                this.drawLine(ctx, values, xScale, yScale, padding, minValue, config.color);
                break;
            case 'bar':
                this.drawBars(ctx, values, xScale, yScale, padding, minValue, config.color, width);
                break;
            case 'area':
                this.drawArea(ctx, values, xScale, yScale, padding, minValue, config.color);
                break;
            case 'step':
                this.drawStep(ctx, values, xScale, yScale, padding, minValue, config.color);
                break;
        }

        // Draw axes labels
        this.drawAxes(ctx, config, width, height, padding);

        // Update current value display
        const currentValue = values[values.length - 1] || 0;
        const formattedValue = config.formatValue ? 
            config.formatValue(currentValue) : 
            currentValue.toFixed(config.precision);
        
        const currentElement = document.getElementById(`current-${plotId}`);
        if (currentElement) {
            currentElement.textContent = formattedValue;
            
            // Color code based on target
            if (config.target) {
                const percentage = (currentValue / config.target) * 100;
                currentElement.className = `plot-current ${
                    percentage >= 95 ? 'excellent' : 
                    percentage >= 80 ? 'good' : 
                    percentage >= 60 ? 'fair' : 'poor'
                }`;
            }
        }
    }

    drawGrid(ctx, width, height, padding, dataPoints, valueRange, minValue) {
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 0.5;

        // Horizontal grid lines
        const gridLines = 5;
        for (let i = 0; i <= gridLines; i++) {
            const y = padding + (i * (height - 2 * padding)) / gridLines;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }

        // Vertical grid lines
        const timeGridLines = Math.min(dataPoints, 10);
        for (let i = 0; i <= timeGridLines; i++) {
            const x = padding + (i * (width - 2 * padding)) / timeGridLines;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
    }

    drawTargetLine(ctx, target, minValue, yScale, padding, width) {
        const y = padding + (target - minValue) * yScale;
        ctx.strokeStyle = '#ff9800';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
        ctx.setLineDash([]);
    }

    drawZeroLine(ctx, minValue, yScale, padding, width) {
        const y = padding + (0 - minValue) * yScale;
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(width - padding, y);
        ctx.stroke();
    }

    drawLine(ctx, values, xScale, yScale, padding, minValue, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = padding + (value - minValue) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // Draw points
        ctx.fillStyle = color;
        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = padding + (value - minValue) * yScale;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }

    drawBars(ctx, values, xScale, yScale, padding, minValue, color, width) {
        const barWidth = Math.max(2, (width - 2 * padding) / values.length * 0.8);
        ctx.fillStyle = color + '80'; // Semi-transparent
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;

        values.forEach((value, index) => {
            const x = padding + index * xScale - barWidth / 2;
            const barHeight = (value - minValue) * yScale;
            const y = padding + barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
            ctx.strokeRect(x, y, barWidth, barHeight);
        });
    }

    drawArea(ctx, values, xScale, yScale, padding, minValue, color) {
        ctx.fillStyle = color + '30'; // Very transparent
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;

        // Fill area
        ctx.beginPath();
        ctx.moveTo(padding, padding + (0 - minValue) * yScale);
        
        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = padding + (value - minValue) * yScale;
            ctx.lineTo(x, y);
        });
        
        ctx.lineTo(padding + (values.length - 1) * xScale, padding + (0 - minValue) * yScale);
        ctx.closePath();
        ctx.fill();

        // Stroke line
        ctx.beginPath();
        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = padding + (value - minValue) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.stroke();
    }

    drawStep(ctx, values, xScale, yScale, padding, minValue, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

        values.forEach((value, index) => {
            const x = padding + index * xScale;
            const y = padding + (value - minValue) * yScale;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                const prevX = padding + (index - 1) * xScale;
                ctx.lineTo(prevX, y);
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();
    }

    drawAxes(ctx, config, width, height, padding) {
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';

        // X-axis label
        ctx.fillText('Time (days)', width / 2, height - 15);

        // Y-axis label
        ctx.save();
        ctx.translate(15, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText(config.yAxisLabel, 0, 0);
        ctx.restore();
    }

    formatCurrency(value) {
        return '$' + value.toLocaleString();
    }

    formatNumber(value, precision = 1) {
        return value.toFixed(precision);
    }

    getState() {
        return {
            isVisible: this.isVisible,
            currentTab: this.currentTab,
            lastUpdate: this.lastUpdate
        };
    }

    loadState(state) {
        this.isVisible = state.isVisible || false;
        this.currentTab = state.currentTab || 'production';
        this.lastUpdate = state.lastUpdate || 0;
        
        // Update UI state
        const panel = document.getElementById('plots-panel');
        const toggleBtn = document.getElementById('plots-toggle');
        
        if (panel && toggleBtn) {
            panel.classList.toggle('hidden', !this.isVisible);
            toggleBtn.textContent = this.isVisible ? 'Hide Plots' : 'Show Plots';
        }
        
        this.switchTab(this.currentTab);
    }
}