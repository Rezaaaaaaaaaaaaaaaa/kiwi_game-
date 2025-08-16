export class FarmRenderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        this.viewOffset = { x: 0, y: 0 };
        this.zoom = 1;
        this.minZoom = 0.5;
        this.maxZoom = 3;
        
        this.gridSize = 32;
        this.tileSize = 32;
        
        this.mousePos = { x: 0, y: 0 };
        this.isDragging = false;
        this.dragStart = { x: 0, y: 0 };
        
        this.selectedPasture = null;
        this.hoveredPasture = null;
        
        this.colors = {
            grass: '#4CAF50',
            soil: '#8D6E63',
            water: '#2196F3',
            road: '#616161',
            building: '#795548',
            fence: '#5D4037',
            cattle: '#3E2723'
        };
        
        this.setupEventListeners();
        this.resize();
    }

    setupEventListeners() {
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('wheel', (e) => this.handleWheel(e));
        this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());
        
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container.getBoundingClientRect();
        
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        
        this.centerView();
    }

    centerView() {
        if (this.game.farm && this.game.farm.pastures.length > 0) {
            this.viewOffset.x = this.canvas.width / 2 - 200;
            this.viewOffset.y = this.canvas.height / 2 - 150;
        }
    }

    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
        
        if (e.button === 0) { // Left click
            const worldPos = this.screenToWorld(this.mousePos.x, this.mousePos.y);
            const pasture = this.getPastureAt(worldPos.x, worldPos.y);
            
            if (pasture) {
                this.selectedPasture = pasture;
                this.showPastureInfo(pasture);
            } else {
                this.selectedPasture = null;
            }
        } else if (e.button === 2) { // Right click - start panning
            this.isDragging = true;
            this.dragStart.x = this.mousePos.x;
            this.dragStart.y = this.mousePos.y;
            this.canvas.style.cursor = 'grabbing';
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mousePos.x = e.clientX - rect.left;
        this.mousePos.y = e.clientY - rect.top;
        
        if (this.isDragging) {
            const dx = this.mousePos.x - this.dragStart.x;
            const dy = this.mousePos.y - this.dragStart.y;
            
            this.viewOffset.x += dx;
            this.viewOffset.y += dy;
            
            this.dragStart.x = this.mousePos.x;
            this.dragStart.y = this.mousePos.y;
        } else {
            // Check for hover effects
            const worldPos = this.screenToWorld(this.mousePos.x, this.mousePos.y);
            this.hoveredPasture = this.getPastureAt(worldPos.x, worldPos.y);
            
            this.canvas.style.cursor = this.hoveredPasture ? 'pointer' : 'default';
        }
    }

    handleMouseUp(e) {
        if (e.button === 2) {
            this.isDragging = false;
            this.canvas.style.cursor = 'default';
        }
    }

    handleWheel(e) {
        e.preventDefault();
        
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const worldBefore = this.screenToWorld(mouseX, mouseY);
        
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        this.zoom = Math.max(this.minZoom, Math.min(this.maxZoom, this.zoom * zoomFactor));
        
        const worldAfter = this.screenToWorld(mouseX, mouseY);
        
        this.viewOffset.x += (worldAfter.x - worldBefore.x) * this.zoom;
        this.viewOffset.y += (worldAfter.y - worldBefore.y) * this.zoom;
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX - this.viewOffset.x) / this.zoom,
            y: (screenY - this.viewOffset.y) / this.zoom
        };
    }

    worldToScreen(worldX, worldY) {
        return {
            x: worldX * this.zoom + this.viewOffset.x,
            y: worldY * this.zoom + this.viewOffset.y
        };
    }

    getPastureAt(worldX, worldY) {
        if (!this.game.farm || !this.game.farm.pastures) return null;
        
        return this.game.farm.pastures.find(pasture => {
            const bounds = this.getPastureBounds(pasture);
            return worldX >= bounds.x && worldX <= bounds.x + bounds.width &&
                   worldY >= bounds.y && worldY <= bounds.y + bounds.height;
        });
    }

    getPastureBounds(pasture) {
        const cols = Math.ceil(Math.sqrt(this.game.farm.pastures.length));
        const index = this.game.farm.pastures.indexOf(pasture);
        const row = Math.floor(index / cols);
        const col = index % cols;
        
        const baseSize = 120;
        const sizeMultiplier = Math.sqrt(pasture.size) / 10;
        
        return {
            x: col * (baseSize + 20),
            y: row * (baseSize + 20),
            width: baseSize * sizeMultiplier,
            height: baseSize * sizeMultiplier
        };
    }

    render() {
        this.clearCanvas();
        
        if (!this.game.farm) return;
        
        this.ctx.save();
        
        // Apply zoom and offset
        this.ctx.translate(this.viewOffset.x, this.viewOffset.y);
        this.ctx.scale(this.zoom, this.zoom);
        
        // Draw background grid
        this.drawGrid();
        
        // Draw farm elements
        this.drawPastures();
        this.drawBuildings();
        this.drawRoads();
        this.drawCattle();
        
        this.ctx.restore();
        
        // Draw UI elements (always on screen)
        this.drawUI();
    }

    clearCanvas() {
        this.ctx.fillStyle = '#E8F5E8';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 1 / this.zoom;
        
        const startX = Math.floor(-this.viewOffset.x / this.zoom / this.gridSize) * this.gridSize;
        const startY = Math.floor(-this.viewOffset.y / this.zoom / this.gridSize) * this.gridSize;
        const endX = startX + (this.canvas.width / this.zoom) + this.gridSize;
        const endY = startY + (this.canvas.height / this.zoom) + this.gridSize;
        
        this.ctx.beginPath();
        for (let x = startX; x < endX; x += this.gridSize) {
            this.ctx.moveTo(x, startY);
            this.ctx.lineTo(x, endY);
        }
        for (let y = startY; y < endY; y += this.gridSize) {
            this.ctx.moveTo(startX, y);
            this.ctx.lineTo(endX, y);
        }
        this.ctx.stroke();
    }

    drawPastures() {
        if (!this.game.farm.pastures) return;
        
        this.game.farm.pastures.forEach(pasture => {
            this.drawPasture(pasture);
        });
    }

    drawPasture(pasture) {
        const bounds = this.getPastureBounds(pasture);
        
        // Determine pasture color based on grass level
        let grassColor = this.getGrassColor(pasture.grassLevel);
        
        // Highlight effects
        if (pasture === this.selectedPasture) {
            grassColor = this.adjustColor(grassColor, 1.2);
        } else if (pasture === this.hoveredPasture) {
            grassColor = this.adjustColor(grassColor, 1.1);
        }
        
        // Draw pasture background
        this.ctx.fillStyle = grassColor;\n        this.ctx.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Draw fence border
        this.ctx.strokeStyle = this.colors.fence;
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Draw pasture ID
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${12 / this.zoom}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(
            `P${pasture.id}`,
            bounds.x + bounds.width / 2,
            bounds.y + 15 / this.zoom
        );
        
        // Draw grass level indicator
        const barWidth = bounds.width * 0.8;
        const barHeight = 6 / this.zoom;
        const barX = bounds.x + (bounds.width - barWidth) / 2;
        const barY = bounds.y + bounds.height - 20 / this.zoom;
        
        // Background bar
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
        this.ctx.fillRect(barX, barY, barWidth, barHeight);
        
        // Grass level bar
        this.ctx.fillStyle = this.getGrassColor(pasture.grassLevel);
        this.ctx.fillRect(barX, barY, barWidth * (pasture.grassLevel / 100), barHeight);
        
        // Draw cattle if present
        if (pasture.currentStock > 0) {
            this.drawCattleInPasture(pasture, bounds);
        }
        
        // Draw status indicators
        this.drawPastureStatus(pasture, bounds);
    }

    drawCattleInPasture(pasture, bounds) {
        const cattleCount = Math.min(pasture.currentStock, 20); // Limit visual cattle
        const cattleSize = 3 / this.zoom;
        
        for (let i = 0; i < cattleCount; i++) {
            const x = bounds.x + 10 + (i % 5) * (bounds.width / 6);
            const y = bounds.y + 30 + Math.floor(i / 5) * (bounds.height / 8);
            
            this.ctx.fillStyle = this.colors.cattle;
            this.ctx.fillRect(x, y, cattleSize, cattleSize);
        }
        
        // Draw cattle count
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${10 / this.zoom}px Arial`;
        this.ctx.textAlign = 'right';
        this.ctx.fillText(
            `${pasture.currentStock}🐄`,
            bounds.x + bounds.width - 5 / this.zoom,
            bounds.y + bounds.height - 5 / this.zoom
        );
    }

    drawPastureStatus(pasture, bounds) {
        const issues = [];
        
        if (pasture.grassLevel < 20) issues.push('⚠️');
        if (pasture.currentStock > pasture.maxStock * 0.9) issues.push('📈');
        if (pasture.soilFertility < 40) issues.push('🌱');
        if (pasture.weeds > 50) issues.push('🌿');
        
        if (issues.length > 0) {
            this.ctx.font = `${12 / this.zoom}px Arial`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText(
                issues.join(''),
                bounds.x + 5 / this.zoom,
                bounds.y + bounds.height - 25 / this.zoom
            );
        }
    }

    drawBuildings() {
        if (!this.game.systems.get('farm')?.buildings) return;
        
        // Draw milking shed
        this.drawBuilding('Milking Shed', 50, 50, 80, 60);
        
        // Draw feed storage
        this.drawBuilding('Feed Storage', 150, 50, 60, 40);
        
        // Draw farmhouse
        this.drawBuilding('Farmhouse', 250, 30, 70, 80);
    }

    drawBuilding(name, x, y, width, height) {
        this.ctx.fillStyle = this.colors.building;
        this.ctx.fillRect(x, y, width, height);
        
        this.ctx.strokeStyle = '#4E342E';
        this.ctx.lineWidth = 2 / this.zoom;
        this.ctx.strokeRect(x, y, width, height);
        
        // Draw roof
        this.ctx.fillStyle = '#5D4037';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 5, y);
        this.ctx.lineTo(x + width / 2, y - 15);
        this.ctx.lineTo(x + width + 5, y);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Label
        this.ctx.fillStyle = '#000';
        this.ctx.font = `${10 / this.zoom}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.fillText(name, x + width / 2, y + height + 15 / this.zoom);
    }

    drawRoads() {
        this.ctx.strokeStyle = this.colors.road;
        this.ctx.lineWidth = 8 / this.zoom;
        
        // Main road
        this.ctx.beginPath();
        this.ctx.moveTo(0, 200);
        this.ctx.lineTo(400, 200);
        this.ctx.stroke();
        
        // Farm access road
        this.ctx.beginPath();
        this.ctx.moveTo(100, 200);
        this.ctx.lineTo(100, 120);
        this.ctx.stroke();
    }

    drawCattle() {
        // Individual cattle are drawn within pastures
        // This could be expanded for cattle outside pastures
    }

    drawUI() {
        // Draw zoom level
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(10, 10, 120, 30);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Zoom: ${(this.zoom * 100).toFixed(0)}%`, 15, 30);
        
        // Draw selected pasture info
        if (this.selectedPasture) {
            this.drawPastureInfoPanel();
        }
    }

    drawPastureInfoPanel() {
        const pasture = this.selectedPasture;
        const panelWidth = 200;
        const panelHeight = 150;
        const x = this.canvas.width - panelWidth - 10;
        const y = 10;
        
        // Background
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
        this.ctx.fillRect(x, y, panelWidth, panelHeight);
        
        this.ctx.strokeStyle = '#ccc';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(x, y, panelWidth, panelHeight);
        
        // Title
        this.ctx.fillStyle = '#2e7d32';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Pasture ${pasture.id}`, x + 10, y + 25);
        
        // Stats
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        
        const stats = [
            `Size: ${pasture.size.toFixed(1)} ha`,
            `Grass: ${pasture.grassLevel.toFixed(0)}%`,
            `Cattle: ${pasture.currentStock}/${pasture.maxStock}`,
            `Fertility: ${pasture.soilFertility.toFixed(0)}%`,
            `Quality: ${pasture.quality.toFixed(0)}%`,
            `Condition: ${this.getPastureCondition(pasture)}`
        ];
        
        stats.forEach((stat, index) => {
            this.ctx.fillText(stat, x + 10, y + 45 + index * 15);
        });
    }

    getPastureCondition(pasture) {
        let score = 0;
        score += pasture.grassLevel * 0.3;
        score += pasture.quality * 0.25;
        score += pasture.soilFertility * 0.25;
        score += Math.max(0, 100 - pasture.weeds) * 0.1;
        score += Math.max(0, 100 - (pasture.pugging || 0)) * 0.1;
        
        if (score > 80) return 'Excellent';
        if (score > 60) return 'Good';
        if (score > 40) return 'Fair';
        return 'Poor';
    }

    getGrassColor(grassLevel) {
        if (grassLevel > 80) return '#4CAF50';
        if (grassLevel > 60) return '#8BC34A';
        if (grassLevel > 40) return '#CDDC39';
        if (grassLevel > 20) return '#FFEB3B';
        return '#FF9800';
    }

    adjustColor(color, factor) {
        const rgb = this.hexToRgb(color);
        if (!rgb) return color;
        
        return `rgb(${Math.min(255, rgb.r * factor)}, ${Math.min(255, rgb.g * factor)}, ${Math.min(255, rgb.b * factor)})`;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }

    showPastureInfo(pasture) {
        // This could trigger UI updates in the sidebar
        if (this.game.uiManager) {
            // Custom event for pasture selection
            const event = new CustomEvent('pastureSelected', { detail: pasture });
            document.dispatchEvent(event);
        }
    }

    update(deltaTime) {
        // Smooth camera movement or animations could go here
        this.render();
    }

    reset() {
        this.selectedPasture = null;
        this.hoveredPasture = null;
        this.centerView();
    }
}