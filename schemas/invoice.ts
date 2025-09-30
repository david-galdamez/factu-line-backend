import z from "zod";

export const InvoiceRequest = z.object({
	client_id: z.number().positive().min(1, "Client id can't be zero"),
	products: z.array(z.object({
		product_id: z.number().positive().min(1, "Product id can't be zero"),
		quantity: z.number().positive().min(1, "Quantity products can't ve zero")
	}))
})
