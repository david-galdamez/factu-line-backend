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
        color: rgb(0, 0, 0),
    })
    y -= 40

    page.drawText(`Factura No. ${invoice.invoiceNumber}`, { x: 50, y, size: fontSize, font })
    y -= 20
    page.drawText(`Fecha: ${invoice.date}`, { x: 50, y, size: fontSize, font })
    y -= 20
    page.drawText(`Cliente: ${invoice.customerName}`, { x: 50, y, size: fontSize, font })
    y -= 40

    page.drawText("Descripción", { x: 50, y, size: fontSize, font });
    page.drawText("Cant.", { x: 250, y, size: fontSize, font });
    page.drawText("Precio", { x: 320, y, size: fontSize, font });
    page.drawText("Total", { x: 420, y, size: fontSize, font });
    y -= 15;

    page.drawLine({
        start: { x: 50, y },
        end: { x: 500, y },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
    });

    y -= 20;

    // Items
    for (const item of invoice.items) {
        const totalItem = item.quantity * item.unitPrice;

        page.drawText(item.description, { x: 50, y, size: fontSize, font });
        page.drawText(item.quantity.toString(), { x: 260, y, size: fontSize, font });
        page.drawText(`$${item.unitPrice.toFixed(2)}`, { x: 330, y, size: fontSize, font });
        page.drawText(`$${totalItem.toFixed(2)}`, { x: 430, y, size: fontSize, font });
        y -= 20;
    }

    y -= 30;

    // Subtotales y totales
    page.drawText(`Subtotal:`, { x: 350, y, size: fontSize, font });
    page.drawText(`$${invoice.subtotal.toFixed(2)}`, { x: 450, y, size: fontSize, font });
    y -= 20;

    page.drawText(`Impuesto:`, { x: 350, y, size: fontSize, font });
    page.drawText(`$${invoice.tax.toFixed(2)}`, { x: 450, y, size: fontSize, font });
    y -= 20;

    page.drawText(`Total:`, { x: 350, y, size: fontSize + 2, font });
    page.drawText(`$${invoice.total.toFixed(2)}`, {
        x: 450,
        y,
        size: fontSize + 2,
        font,
    });

    // Guardar PDF en memoria
    const pdfBytes = await pdfDoc.save();
    return Buffer.from(pdfBytes);
}