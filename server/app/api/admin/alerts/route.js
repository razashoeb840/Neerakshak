import { NextResponse } from 'next/server';
import { adminService } from '@/admin/adminService';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() });
}

export async function GET() {
  const alerts = adminService.getAlerts();
  return NextResponse.json({ success: true, data: alerts }, { headers: corsHeaders() });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const alert = adminService.addAlert(body);
    return NextResponse.json({ success: true, data: alert }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const index = searchParams.get('index');
    const target = index !== null ? Number(index) : id;
    const deleted = adminService.deleteAlert(target);
    return NextResponse.json({ success: deleted }, { headers: corsHeaders() });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500, headers: corsHeaders() });
  }
}
