import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
    },
});

export async function sendInvoice(
    to: string,
    pdfBuffer: Buffer,
    customerName: string,
    invoiceNumber: string,
    total: number,
) {
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
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
                content: pdfBuffer,
            },
        ],
    });
}
