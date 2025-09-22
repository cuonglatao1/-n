import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@canvas-llm.com' },
    update: {},
    create: {
      email: 'admin@canvas-llm.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      settings: {
        create: {
          defaultModel: 'gpt-3.5-turbo',
          maxConcurrentRequests: 5,
          autoSaveInterval: 30000,
          theme: 'system',
        },
      },
    },
  });

  // Create demo user
  const demoPassword = await bcrypt.hash('demo123', 10);
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@canvas-llm.com' },
    update: {},
    create: {
      email: 'demo@canvas-llm.com',
      name: 'Demo User',
      password: demoPassword,
      role: 'USER',
      settings: {
        create: {
          defaultModel: 'gpt-3.5-turbo',
          maxConcurrentRequests: 3,
          autoSaveInterval: 30000,
          theme: 'system',
        },
      },
    },
  });

  // Create sample flow for demo user
  const sampleFlow = await prisma.flow.create({
    data: {
      userId: demoUser.id,
      name: 'Welcome Flow',
      description: 'A sample flow to get you started',
      nodes: [
        {
          id: 'node-1',
          type: 'promptNode',
          position: { x: 100, y: 100 },
          data: {
            id: 'node-1',
            prompt: 'Hello! Welcome to Canvas LLM. What would you like to know about AI?',
            selectedModel: {
              id: 'gpt-3.5-turbo',
              provider: 'OPENAI',
              name: 'gpt-3.5-turbo',
              displayName: 'GPT-3.5 Turbo',
              maxTokens: 16384,
              supportedFeatures: ['streaming', 'tools', 'json_mode'],
            },
            response: '',
            isLoading: false,
            timestamp: new Date(),
          },
        },
      ],
      edges: [],
    },
  });

  console.log('Seeding finished.');
  console.log({ admin, demoUser, sampleFlow });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
