# ReactFlow LLM Multi-Provider Platform

A modern full-stack platform for creating interactive LLM workflows using ReactFlow, built with Next.js 15 and NestJS.

## Features

- 🎨 **Modern UI**: Next.js 15 with App Router, Tailwind CSS, and shadcn/ui
- 🔐 **Authentication**: JWT-based auth with refresh tokens
- 🌙 **Theme System**: Light/dark mode with system preference detection
- 🔄 **ReactFlow Integration**: Custom prompt nodes with real-time streaming
- 🤖 **Multi-Provider LLM**: OpenAI, Anthropic, and Google support
- ⚡ **Real-time Streaming**: WebSocket/SSE for live responses
- 🔑 **API Key Management**: Secure encrypted storage
- 📊 **State Management**: Zustand for client state

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- ReactFlow
- Zustand

### Backend
- NestJS
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- WebSocket/SSE

## Getting Started

### Prerequisites
- Node.js 18.17.0 or higher
- PostgreSQL database
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd canvas-llm-platform
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
# Copy example env files
cp apps/web/.env.example apps/web/.env.local
cp apps/api/.env.example apps/api/.env
```

4. Set up the database
```bash
docker compose up -d
cd apps/api
npx prisma migrate dev
npx prisma generate
```

5. Start development servers
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared types and utilities
└── docs/             # Documentation
```

## Environment Variables

### Frontend (`apps/web/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

### Backend (`apps/api/.env`)
```
DATABASE_URL=postgresql://user:password@localhost:5432/canvas_llm
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-jwt-refresh-secret
ENCRYPTION_KEY=your-encryption-key
```

## API Providers Setup

Add your API keys in the settings dashboard after logging in:

- **OpenAI**: Get your API key from https://platform.openai.com/
- **Anthropic**: Get your API key from https://console.anthropic.com/
- **Google**: Get your API key from https://makersuite.google.com/

## Development

### Running Tests
```bash
npm run test
```

### Linting
```bash
npm run lint
```

### Type Checking
```bash
npm run type-check
```

### Building
```bash
npm run build
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
