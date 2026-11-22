import { NextResponse } from 'next/server';
import { authorityService } from '@/authority/authorityService';

export async function GET() {
  return NextResponse.json({ success: true, data: authorityService.getSummary() });
}
