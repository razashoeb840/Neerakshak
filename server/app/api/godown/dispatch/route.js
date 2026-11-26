import { NextResponse } from 'next/server';
import { godownService } from '@/godown/godownService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = godownService.dispatchConsignment(body);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
