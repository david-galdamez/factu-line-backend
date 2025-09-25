import z from "zod";

export const ClientRequest = z.object({
	name: z.string()
		.min(2, "Name must have at least 2 characters")
		.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
	dui: z.string()
		.regex(/^[0-9A-Za-z-]+$/, "Tax ID can only contain letters, numbers and dashes"),
	address: z.string()
		.min(5, "Address must be at least 5 characters long")
		.regex(/^[\w\s.,-]+$/, "Address contains invalid characters"),
	phone: z.string()
		.regex(/^\d{8,15}$/, "Phone must contain 8 to 15 digits"),
	email: z.email("Invalid email format"),
})
