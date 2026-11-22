import { NextResponse } from 'next/server';
import { groundOfficerService } from '@/ground-officer/groundOfficerService';

export async function GET() {
  return NextResponse.json({ success: true, data: groundOfficerService.getSummary() });
}
