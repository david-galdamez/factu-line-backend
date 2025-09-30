import { Request, Response } from "express";
import { InvoiceModel } from "../models/invoice_model";
import { InvoiceRequest } from "../schemas/invoice";
import z from "zod";
import { NewInvoiceType } from "../types/invoice_types";

export class InvoiceController {

	private invoiceModel: InvoiceModel

	constructor(invoiceModel: InvoiceModel) {
		this.invoiceModel = invoiceModel
	}

	create = async (req: Request, res: Response) => {
		try {
			const result = InvoiceRequest.safeParse(req.body)
			if (!result.success) {
				const error = z.flattenError(result.error)

				res.status(400).json(error)
				return
			}

			const businessId = req.session.user.business_id
			const userId = req.session.user.id
			const newInvoice: NewInvoiceType = {
				...result.data
			}

			const createdInvoice = await this.invoiceModel.create({ businessId, userId, newInvoice })

			res.status(201).json({
				success: true,
				data: createdInvoice,
				message: "Invoice created succesfully"
			})
		} catch (error) {
			console.error("Error creating invoice: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal error server"
			})
		}
	}

}
