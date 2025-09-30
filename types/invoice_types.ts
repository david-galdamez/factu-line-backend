import z from "zod";
import { InvoiceRequest } from "../schemas/invoice";

export type NewInvoiceType = z.infer<typeof InvoiceRequest>
