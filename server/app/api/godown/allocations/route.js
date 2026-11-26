import { NextResponse } from 'next/server';
import { godownService } from '@/godown/godownService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  try {
    const allocations = godownService.getAllocations();
    return NextResponse.json({ success: true, data: allocations }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
