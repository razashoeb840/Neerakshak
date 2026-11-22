import { NextResponse } from 'next/server';
import { godownService } from '@/godown/godownService';

export async function GET() {
  return NextResponse.json({ success: true, data: godownService.getSummary() });
}
