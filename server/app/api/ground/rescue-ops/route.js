import { NextResponse } from 'next/server';
import { groundOfficerService } from '@/ground-officer/groundOfficerService';

export async function GET() {
  try {
    const state = await groundOfficerService.getFullState();
    return NextResponse.json({ success: true, data: state.operations || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const op = await groundOfficerService.updateRescueProgress(body);
    return NextResponse.json({ success: true, data: op });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
