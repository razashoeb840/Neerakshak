import { NextResponse } from 'next/server';
import { monitoringDb } from '@/server/lib/db.js';

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await monitoringDb.closeReturnCase(body);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API /api/monitoring/cases/close error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to close return audit case' },
      { status: 500 }
    );
  }
}
