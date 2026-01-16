# Dev Container Setup

This devcontainer configuration provides a complete development environment for the Parallel Poker Roguelike project.

## Features

- Node.js 20 pre-installed
- Git and GitHub CLI included
- VS Code extensions pre-configured:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript

## Usage

1. Open the project in VS Code or Cursor
2. When prompted, click "Reopen in Container"
3. Or use Command Palette: `Dev Containers: Reopen in Container`
4. Wait for the container to build and dependencies to install
5. Run `npm run dev` to start the development server
6. Access the app at `http://localhost:5173`

## Port Forwarding

Port 5173 (Vite dev server) is automatically forwarded and will notify you when it's ready.
