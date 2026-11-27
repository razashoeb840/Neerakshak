import { NextResponse } from 'next/server';
import { monitoringDb } from '@/lib/db.js';

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const portal = searchParams.get('portal') || searchParams.get('role') || searchParams.get('channel');
    const chats = await monitoringDb.getChats(portal);
    return NextResponse.json({ success: true, data: chats }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const result = await monitoringDb.sendChat(body);
    return NextResponse.json({ success: true, data: result }, { headers: corsHeaders() });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
