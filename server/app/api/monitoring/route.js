import { NextResponse } from 'next/server';
import { monitoringService } from '@/monitoring/monitoringService';

export async function GET() {
  return NextResponse.json({ success: true, data: monitoringService.getSummary() });
}
