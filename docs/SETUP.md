# Setup Guide

This guide will help you set up the ReactFlow LLM Multi-Provider Platform on your local development environment.

## Prerequisites

- Node.js 18.17.0 or higher
- PostgreSQL database
- npm or yarn
- Git

## Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd canvas-llm-platform
npm install
```

### 2. Start Database

Using Docker (recommended):
```bash
docker-compose up -d postgres
```

Or use your local PostgreSQL installation.

### 3. Environment Setup

#### Frontend (`apps/web/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=http://localhost:3000
```

#### Backend (`apps/api/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canvas_llm?schema=public"
JWT_SECRET="your-jwt-secret-key-here-make-it-long-and-secure"
JWT_REFRESH_SECRET="your-jwt-refresh-secret-key-here-different-from-jwt-secret"
ENCRYPTION_KEY="your-32-character-encryption-key-12"
NODE_ENV="development"
PORT=3001
```

### 4. Database Setup

```bash
cd apps/api
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

### 5. Start Development Servers

```bash
# From project root
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Demo Accounts

After seeding, you can use these accounts:

- **Admin**: admin@canvas-llm.com / admin123
- **Demo User**: demo@canvas-llm.com / demo123

## API Keys Setup

To use LLM models, you'll need to add API keys in the settings:

1. **OpenAI**: Get from https://platform.openai.com/
2. **Anthropic**: Get from https://console.anthropic.com/
3. **Google**: Get from https://makersuite.google.com/

## Development

### Project Structure

```
├── apps/
│   ├── web/          # Next.js frontend
│   └── api/          # NestJS backend
├── packages/
│   └── shared/       # Shared types and utilities
└── docs/             # Documentation
```

### Available Scripts

```bash
# Development
npm run dev

# Build all apps
npm run build

# Lint all code
npm run lint

# Type checking
npm run type-check

# Format code
npm run format
```

### Database Commands

```bash
cd apps/api

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Reset database
npx prisma migrate reset

# Open Prisma Studio
npx prisma studio

# Seed database
npx prisma db seed
```

## Deployment

### Environment Variables

Make sure to set secure values for production:

- Generate strong JWT secrets (64+ characters)
- Use a 32-character encryption key
- Set proper CORS origins
- Use production database URLs

### Build Commands

```bash
# Build all applications
npm run build

# Start production servers
cd apps/api && npm run start:prod
cd apps/web && npm run start
```

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env
   - Verify database exists

2. **API Key Validation Fails**
   - Check if API keys are correct
   - Verify provider endpoints are accessible
   - Check network connectivity

3. **Streaming Not Working**
   - Ensure CORS is properly configured
   - Check if EventSource is supported
   - Verify API key permissions

4. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript version compatibility
   - Verify all dependencies are installed

### Getting Help

- Check the logs in both frontend and backend
- Use browser developer tools for frontend issues
- Check NestJS logs for backend issues
- Verify environment variables are set correctly

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and type checking
6. Submit a pull request

## License

This project is licensed under the MIT License.
