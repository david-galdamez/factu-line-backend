import { Router } from "express";
import { InvoiceModel } from "../models/invoice_model";
import { db } from "../config/database";
import { InvoiceController } from "../controllers/invoice_controller";

export const invoiceRouter = Router()

const invoiceModel = new InvoiceModel(db)
const invoiceController = new InvoiceController(invoiceModel)
