import { NextResponse } from 'next/server';
import { godownService } from '@/godown/godownService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  try {
    const state = godownService.getFullState();
    return NextResponse.json({ success: true, data: state.returns || [] }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    if (body.action === 'verify-restock') {
      const { godownDb } = await import('@/lib/db.js');
      const result = await godownDb.verifyWarehouseRestock(body);
      return NextResponse.json({ success: true, data: result }, { headers: corsHeaders() });
    }
    const result = godownService.logReturn(body);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { godownDb } = await import('@/lib/db.js');
    const result = await godownDb.verifyWarehouseRestock(body);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
