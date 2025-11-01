# Getting Started Guide

Welcome to the Deck of Cards Game Collection! This guide will help you get your card game application up and running.

## 🎯 Quick Start

### 1. **Add Your Card Images**
The most important step is adding card images to make the games playable:

```
assets/cards/suits/
├── spades/     # Add: A.png, 2.png, 3.png, ..., K.png
├── hearts/     # Add: A.png, 2.png, 3.png, ..., K.png  
├── diamonds/   # Add: A.png, 2.png, 3.png, ..., K.png
└── clubs/      # Add: A.png, 2.png, 3.png, ..., K.png

assets/cards/back/
└── default.png # Add a card back image
```

**Image Requirements:**
- **Format:** PNG or JPG
- **Size:** 140x200px recommended (2:3 aspect ratio)
- **Naming:** Use rank as filename (A.png, 2.png, 3.png, 4.png, 5.png, 6.png, 7.png, 8.png, 9.png, 10.png, J.png, Q.png, K.png)

### 2. **Test Your Setup**
1. Open `index.html` in a web browser
2. You should see the game selection screen
3. Click on any game to test (games will show placeholder cards if images aren't loaded)

### 3. **Serve Locally (Recommended)**
For full functionality, serve the files through a web server:

```bash
# Using Python (if installed)
python -m http.server 8000

# Using Node.js (if installed)  
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit: `http://localhost:8000`

## 🎮 Current Game Status

### ✅ **Implemented & Ready**
- **Core Engine:** Card and Deck classes with full functionality
- **Main Application:** Navigation, settings, statistics tracking
- **UI Framework:** Responsive design, animations, sound management
- **Base Game Engine:** Common game functionality and structure

### 🚧 **In Development** 
- **Go Fish Game:** Game logic needs implementation
- **War Game:** Game logic needs implementation  
- **Memory Game:** Game logic needs implementation

### 🎨 **Optional Enhancements**
- Sound effects (add MP3 files to `assets/sounds/`)
- Custom card back designs
- Additional themes and animations

## 🛠️ Development Workflow

### Adding New Games
1. Create game class in `src/games/` extending `GameEngine`
2. Implement required methods: `init()`, `start()`, game logic
3. Add game selection in `main.js`
4. Test and refine

### Customizing Styles
- **Main styles:** `css/main.css` 
- **Components:** `css/components.css`
- **Game-specific:** `css/games.css`
- **Animations:** `css/animations.css`

### Adding Sound Effects
Place sound files in `assets/sounds/` with these names:
- `card-flip.mp3` - Card flipping sound
- `card-deal.mp3` - Dealing cards  
- `shuffle.mp3` - Deck shuffling
- `button-click.mp3` - Button interactions
- `victory.mp3` - Game won
- `defeat.mp3` - Game lost

## 🎨 Where to Get Card Images

### Free Resources:
- **Pixabay:** High-quality playing card images
- **Unsplash:** Professional card photography
- **OpenGameArt:** Game-ready card assets
- **Wikimedia Commons:** Public domain playing cards

### Design Your Own:
- Use vector graphics software (Illustrator, Inkscape)
- Follow standard playing card conventions
- Maintain consistent sizing and style
- Consider accessibility (high contrast, clear fonts)

## 🔧 Configuration Options

The application automatically saves user preferences:

### **Audio Settings**
- Sound effects volume (0-100%)
- Background music volume (0-100%)
- Auto-mute when tab loses focus

### **Visual Settings**  
- Animation speed (slow, normal, fast, instant)
- Card back design selection
- Theme preferences (auto-detects dark mode)

### **Gameplay Settings**
- Auto-play obvious moves
- Confirm important actions
- Auto-pause when window loses focus

## 📱 Browser Compatibility

**Fully Supported:**
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

**Features Used:**
- ES6 Modules, CSS Grid/Flexbox, Web Audio API (optional)
- LocalStorage for save data
- CSS Custom Properties for theming

## 🐛 Troubleshooting

### **Cards Don't Show Up**
- Check that image files are in correct folders
- Verify image filenames match exactly (A.png, not ace.png)
- Check browser console for 404 errors
- Serve files through web server (not file://)

### **Games Don't Start**  
- Check browser console for JavaScript errors
- Ensure all files are properly uploaded
- Try refreshing the page
- Check that ES6 modules are supported

### **Sounds Don't Play**
- Add sound files to `assets/sounds/`
- Check audio file formats (MP3 widely supported)
- Browser may require user interaction before playing audio
- Check volume settings in the game

### **Responsive Issues**
- Test on different screen sizes
- Check CSS media queries
- Verify viewport meta tag is present

## 🚀 Next Steps

1. **Add your card images** to get visual feedback
2. **Test the basic application** in a web browser
3. **Implement game logic** for your preferred games
4. **Customize styling** to match your preferences  
5. **Add sound effects** for better user experience
6. **Deploy online** (GitHub Pages, Netlify, etc.)

## 📚 Code Structure

```
src/
├── core/           # Core game engine (Card, Deck, GameEngine)
├── games/          # Individual game implementations  
├── ui/             # User interface components
├── utils/          # Utility classes (EventManager, etc.)
└── main.js         # Application entry point

css/
├── main.css        # Base styles and variables
├── components.css  # Reusable UI components
├── games.css       # Game-specific styling
└── animations.css  # Animation definitions

assets/
├── cards/          # Playing card images
├── sounds/         # Audio files
└── ui/            # Interface graphics
```

Happy gaming! 🎴