import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'canvas-llm-web',
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '0.0.1',
    };

    return NextResponse.json(
      {
        success: true,
        data: healthStatus,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          service: 'canvas-llm-web',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
      },
      { status: 400 }
    );
  }
}

