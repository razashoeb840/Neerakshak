import { NextResponse } from 'next/server';
import { groundOfficerService } from '@/ground-officer/groundOfficerService';

export async function GET() {
  try {
    const data = await groundOfficerService.getFullState();
    return NextResponse.json({ success: true, data });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
