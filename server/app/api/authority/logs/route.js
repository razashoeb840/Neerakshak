import { NextResponse } from 'next/server';
import { authorityService } from '@/authority/authorityService';

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
  const data = authorityService.getLogs();
  return NextResponse.json({ success: true, data }, { headers: corsHeaders() });
}
