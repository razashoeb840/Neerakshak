import { NextResponse } from 'next/server';
import { groundOfficerService } from '@/ground-officer/groundOfficerService';

export async function GET() {
  try {
    const state = await groundOfficerService.getFullState();
    return NextResponse.json({ success: true, data: state.fieldReports || [] });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const report = await groundOfficerService.submitReport(body);
    return NextResponse.json({ success: true, data: report });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
