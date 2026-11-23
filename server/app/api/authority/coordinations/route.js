import { NextResponse } from 'next/server';
import { authorityService } from '@/authority/authorityService';

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
  const data = authorityService.getCoordinations();
  return NextResponse.json({ success: true, data }, { headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = authorityService.addCoordination(body);
    return NextResponse.json({ success: true, data: created }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}
