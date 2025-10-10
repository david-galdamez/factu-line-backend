import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendInvoice(
    to: string,
    pdfBuffer: Buffer,
    customerName: string,
    invoiceNumber: string,
    total: number,
) {
    await resend.emails.send({
        from: "facturas@empresa.com",
        to,
        subject: `Factura ${invoiceNumber}`,
        html: `
            <p>Hola <strong>${customerName}</strong>,</p>
            <p>Adjunto tu factura ${invoiceNumber}.</p>
            <p>Total: <strong>$${total.toFixed(2)}</strong></p>
            <p>Gracias por tu compra.</p>
        `,
        attachments: [
            {
                filename: `Factura-${invoiceNumber}.pdf`,
                content: pdfBuffer.toString("base64")
            }
        ]
    })
}