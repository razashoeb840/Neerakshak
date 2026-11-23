import { NextResponse } from 'next/server';
import { authorityService } from '@/authority/authorityService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  const state = authorityService.getFullState();
  return NextResponse.json({ success: true, data: state }, { headers: corsHeaders() });
}
