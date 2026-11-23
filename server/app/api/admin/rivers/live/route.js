import { NextResponse } from 'next/server';
import { riverTelemetryService } from '../../../../../admin/riverTelemetryService';

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

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const basin = searchParams.get('basin') || 'bk';
    const liveData = await riverTelemetryService.getLiveBasinRivers(basin);

    return NextResponse.json(liveData, { headers: corsHeaders() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500, headers: corsHeaders() }
    );
  }
}
