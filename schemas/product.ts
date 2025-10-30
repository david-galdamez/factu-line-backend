import z from "zod";

export const ProductRequest = z.object({
	name: z.string()
		.min(2, "Name must have at least 2 characters")
		.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
	description: z.string(),
	unit_price: z.number().min(1, "Price can't be zero"),
})
