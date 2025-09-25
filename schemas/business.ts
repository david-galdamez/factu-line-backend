import z from "zod";

export const BusinessRequest = z.object({
	name: z.string()
		.min(2, "Name must have at least 2 characters")
		.regex(/^[a-zA-Z\s]+$/, "Name can only contain letters and spaces"),
	tax_id: z.string()
		.regex(/^[0-9A-Za-z-]+$/, "Tax ID can only contain letters, numbers and dashes"),
	address: z.string()
		.min(5, "Address must be at least 5 characters long")
		.regex(/^[\w\s.,-]+$/, "Address contains invalid characters"),
	phone: z.string()
		.regex(/^\d{8,15}$/, "Phone must contain 8 to 15 digits"),
	email: z.email("Invalid email format"),
	password: z.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
			"Password must contain uppercase, lowercase, number and special character"),
});

export const BusinessLogin = z.object({
	email: z.email("Invalid email format"),
	password: z.string()
		.min(8, "Password must be at least 8 characters long")
		.regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/,
			"Password must contain uppercase, lowercase, number and special character"),
})
