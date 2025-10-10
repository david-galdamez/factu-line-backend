import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { InvoiceData } from "../types/invoice_types";

export async function generateInvoicePDF(invoice: InvoiceData): Promise<Buffer> {
    const pdfDoc = await PDFDocument.create()
    const page = pdfDoc.addPage([595.28, 841.89])
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica)

    const { width, height } = page.getSize()
    const fontSize = 12
    let y = height - 50

    page.drawText(invoice.businessName, {
        x: 50,
        y,
        size: 20,
        font,
        color: rgb(0,0,0),
    })
    y -= 40

    page.drawText(`Factura No. ${invoice.invoiceNumber}`, {x: 50, y, size: fontSize, font})
    y -= 20
    page.drawText(`Fecha: ${invoice.date}`, {x: 50, y, size: fontSize, font })
    y -= 20
    page.drawText(`Cliente: ${invoice.customerName}`, {x: 50, y, size: fontSize, font })
    y -= 40

    invoice.items.forEach((item) => {
        const text = `${item.description} - Cant: ${item.quantity} - Precio: $${item.unitPrice.toFixed(2)} - Total: $${(item.quantity * item.unitPrice).toFixed(2)}`
        page.drawText(text, {x: 50, y, size: fontSize, font})
        y -= 20
    })

    const total = invoice.items.reduce(
        (sum, i) => sum + i.quantity * i.unitPrice,
        0
    )

    y -= 40
    page.drawText(`Total: $${total.toFixed(2)}`, {
        x:width,
        y,
        size: 14,
        font,
    })

    const pdfBytes = await pdfDoc.save()

    return Buffer.from(pdfBytes)
}