import { NextResponse } from 'next/server';
import { adminService } from '@/admin/adminService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  const rivers = adminService.getRivers();
  return NextResponse.json({ success: true, data: rivers }, { headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const updated = adminService.updateRiver(body.id || body.name, body);
    return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}
