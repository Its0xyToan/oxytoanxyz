import { NextRequest, NextResponse } from 'next/server';

export async function GET(_request: NextRequest, context: { params: Promise<{ page: string }> }) {
  const params = await (context.params);
  const page = params.page

  return NextResponse.redirect(`https://github.com/Its0xyToan/${page}`)
}
