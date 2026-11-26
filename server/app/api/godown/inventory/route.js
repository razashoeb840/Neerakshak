import { NextResponse } from 'next/server';
import { godownService } from '@/godown/godownService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouse = searchParams.get('warehouse') || 'ALL';
    const category = searchParams.get('category') || 'ALL';
    const items = godownService.getInventory(warehouse, category);
    return NextResponse.json({ success: true, data: items }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = godownService.addStockItem(body);
    return NextResponse.json({ success: true, data: created }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const idOrIndex = body.index !== undefined ? body.index : (body.id || body.name);
    const updated = godownService.updateStockItem(idOrIndex, body);
    return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
