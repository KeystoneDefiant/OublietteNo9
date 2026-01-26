# Parallel Poker Roguelike

A proof-of-concept web-first poker game featuring parallel hand mechanics and roguelike progression elements.

## Features

- **Parallel Hand Mechanics**: Hold cards and draw multiple parallel hands from fresh decks
- **Immutable State Management**: Pure functions with zero side effects for easy testing
- **Poker Evaluator**: Complete hand ranking system (Royal Flush to High Card)
- **Shop System**: Upgrade hand count and reward multipliers
- **Modern UI**: Built with React, TypeScript, and Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **State Management**: Custom hooks with immutable patterns
- **CI/CD**: GitHub Actions for deployment and packaging

## Development

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Docker Development

```bash
# Development mode with hot reload
docker-compose up dev

# Production build
docker-compose up prod

# Build production image
docker build -t pokerthing:latest .

# Run production container
docker run -p 8080:80 pokerthing:latest
```

### Dev Container (VS Code/Cursor)

1. Open the project in VS Code or Cursor
2. When prompted, click "Reopen in Container" or use Command Palette: `Dev Containers: Reopen in Container`
3. The container will automatically install dependencies and start the dev server
4. Access the app at `http://localhost:5173`

## Project Structure

```
src/
├── components/     # React UI components
├── hooks/          # Custom React hooks (game state)
├── types/          # TypeScript interfaces
└── utils/          # Pure functions (evaluator, deck, parallel hands)
```

## Core Mechanics

### Parallel Hand Generation

The `generateParallelHands` function creates N parallel hands where:
- Each hand draws from a fresh 52-card deck
- The original 5 dealt cards are removed from each deck
- Held cards are preserved across all parallel hands
- Non-held cards are replaced with random draws

### Poker Evaluator

The `PokerEvaluator` class evaluates 5-card hands and returns:
- Hand rank (Royal Flush, Straight Flush, etc.)
- Score for tie-breaking
- Winning cards for highlighting

## CI/CD

### Develop Branch
- Automatically builds and deploys to GitHub Pages on push to `develop`

### Master Branch
- Builds native binaries using Tauri
- Creates GitHub Release with artifacts for macOS, Windows, and Linux

## License

MIT
