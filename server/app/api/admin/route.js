import { NextResponse } from 'next/server';
import { adminService } from '@/admin/adminService';

// Allow CORS for local dev Vite frontend (5173)
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  const state = adminService.getFullState();
  return NextResponse.json({ success: true, data: state }, { headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (body.action === 'reset') {
      // Re-read or reset
      return NextResponse.json({ success: true, message: 'Reset done' }, { headers: corsHeaders() });
    }
    return NextResponse.json({ success: true }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}
