import { NextResponse } from 'next/server';
import { renderToStream } from '@react-pdf/renderer';
import { PayslipPDF } from '@/components/PayslipPDF';
import React from 'react';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { txHash, employeeName, amount, date } = body;

    // We must invoke renderToStream with the JSX component
    const pdfStream = await renderToStream(
      React.createElement(PayslipPDF, {
        txHash,
        employeeName,
        amount: Number(amount),
        date
      }) as any
    );

    // Convert NodeJS Readable stream to a Web Response Blob/Buffer
    const chunks: Buffer[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(Buffer.from(chunk));
    }
    const pdfBuffer = Buffer.concat(chunks);

    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', `attachment; filename="payslip_${employeeName.replace(/\s+/g, '_')}_${date.replace(/\s+/g, '-')}.pdf"`);

    return new NextResponse(pdfBuffer, { headers });
  } catch (error) {
    console.error("PDF Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
