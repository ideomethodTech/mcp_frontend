import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  try {
    const data = await req.json();
    const logPath = path.join(process.cwd(), 'api_errors.log');
    
    fs.appendFileSync(logPath, `\n\n[${new Date().toISOString()}] API Error:\n${JSON.stringify(data, null, 2)}`);
    
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
