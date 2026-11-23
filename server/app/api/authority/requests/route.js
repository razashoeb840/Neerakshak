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
  const requests = authorityService.getRequests();
  return NextResponse.json({ success: true, data: requests }, { headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const created = authorityService.addRequest(body);
    return NextResponse.json({ success: true, data: created }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function PATCH(req) {
  try {
    const body = await req.json();
    const { id, index, decision, reason } = body;
    const target = id !== undefined ? id : index;
    const updated = authorityService.updateRequestDecision(target, decision, reason);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Request not found' }, { status: 404, headers: corsHeaders() });
    }
    return NextResponse.json({ success: true, data: updated }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}
