import z from "zod";
import { InvoiceRequest } from "../schemas/invoice";

export type NewInvoiceType = z.infer<typeof InvoiceRequest>;

//PDF TYPES
export interface InvoiceItems {
    productNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
}

export interface InvoiceData {
    businessName: string;
    invoiceNumber: string;
    customerName: string;
    customerEmail: string;
    customerAddress: string;
    date: string;
    items: InvoiceItems[];
    subtotal: number;
    tax: number;
    total: number;
}

export interface InvoiceInfo {
    invoiceNumber: string;
    workerName: string;
    customerName: string;
    customerEmail: string;
    issueDate: string;
    items: Items[];
    subtotal: number;
    tax: number;
    total: number;
}

export interface Items {
    productNumber: string;
    description: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
}
