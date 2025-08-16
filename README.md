# Kiwi Dairy: Farm to Fortune

A comprehensive New Zealand dairy farming simulation game built with vanilla JavaScript.

## Overview

Build and manage your dairy farm empire across New Zealand's diverse regions. Navigate real-world challenges including weather patterns, market fluctuations, environmental regulations, and seasonal cycles.

## Getting Started

### Prerequisites
- Python 3.x (for development server)
- Modern web browser
- Text editor/IDE

### Installation

1. Clone or download this repository
2. Navigate to the project directory
3. Start a local development server:
   ```bash
   python -m http.server 8000
   ```
4. Open your browser to `http://localhost:8000`

### Project Structure

```
kiwi-dairy-farm-game/
├── index.html              # Main game entry point
├── package.json            # Project configuration
├── README.md              # This file
├── src/
│   ├── css/               # Stylesheets
│   │   ├── main.css       # Main styles
│   │   ├── ui.css         # UI component styles
│   │   └── game.css       # Game-specific styles
│   ├── js/
│   │   ├── main.js        # Main entry point
│   │   └── game/          # Game modules
│   │       ├── Game.js    # Core game class
│   │       ├── data/      # Data management
│   │       ├── entities/  # Game entities
│   │       ├── scenarios/ # Scenario definitions
│   │       ├── systems/   # Game systems
│   │       └── ui/        # UI management
│   └── assets/            # Game assets
│       ├── images/        # Images and sprites
│       ├── audio/         # Sound effects and music
│       └── data/          # Game data files
├── tests/                 # Test files
├── docs/                  # Documentation
└── build/                 # Build output
```

## Game Features

### Scenarios
- **Canterbury Plains** - Irrigated farming for beginners
- **Waikato** - Traditional heartland with environmental challenges
- **Taranaki** - Volcanic soils with terrain challenges
- **Southland** - Large scale with harsh winters
- **Bay of Plenty** - Land conversion challenge

### Core Systems
- **Farm Management** - Pasture rotation, infrastructure upgrades
- **Cattle System** - Breeding, health, production management
- **Weather System** - Seasonal patterns, extreme events
- **Market System** - Price volatility, contracts, exports
- **Time System** - Daily cycles, seasonal changes

### Gameplay Elements
- Resource management (cash, milk, feed, energy)
- Technology progression
- Environmental compliance
- Multiplayer capabilities
- Educational content

## Development

### Adding New Features
1. Create new system files in `src/js/game/systems/`
2. Extend BaseSystem class
3. Register system in Game.js
4. Add UI components in `src/js/game/ui/`
5. Update DataManager for persistence

### Code Style
- ES6 modules
- Vanilla JavaScript (no frameworks)
- Responsive CSS Grid/Flexbox
- Mobile-first design

### Testing
```bash
npm test  # Run test suite (when implemented)
```

### Building
```bash
npm run build  # Create production build (when implemented)
```

## Game Data

### Save System
- Local storage for saves
- Auto-save functionality
- Multiple save slots
- Import/export capabilities

### Scenarios Configuration
Scenarios are defined in `DataManager.js` with:
- Starting resources and infrastructure
- Regional characteristics
- Victory conditions
- Unique challenges

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## Future Enhancements

- [ ] Multiplayer functionality
- [ ] Advanced AI competitors
- [ ] Mobile app version
- [ ] Additional regions
- [ ] Seasonal events
- [ ] Achievement system
- [ ] Statistics and analytics
- [ ] Export game data
- [ ] Custom scenario editor

## Educational Value

This game teaches:
- Dairy farming fundamentals
- Business management
- Environmental stewardship
- Economic principles
- Regional geography
- Agricultural technology

## License

MIT License - see LICENSE file for details

## Credits

- Inspired by real New Zealand dairy farming
- Game design based on industry best practices
- Educational content reviewed by agricultural experts

## Support

For questions or issues:
1. Check the documentation in `/docs`
2. Review existing issues
3. Create new issue with detailed description

Happy farming! 🐄🥛
