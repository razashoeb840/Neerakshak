import { NextResponse } from 'next/server';
import { groundDb } from '@/server/lib/db.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await groundDb.markReadyForDistribution(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API /api/ground/ready-distribution error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to mark ready for distribution' },
      { status: 500 }
    );
  }
}
