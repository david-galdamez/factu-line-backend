import { Client, Transaction } from "@libsql/client/.";
import { NewInvoiceType } from "../types/invoice_types";

export class InvoiceModel {

	private db: Client

	constructor(db: Client) {
		this.db = db
	}

	create = async ({ businessId, userId, newInvoice }: { businessId: number, userId: number, newInvoice: NewInvoiceType }) => {
		const transaction = await this.db.transaction("write")
		try {
			const invoiceNumber = await this.generateInvoiceNumber(transaction, businessId)

			const createdInvoice = await transaction.execute({
				sql: `INSERT INTO invoice (business_id, client_id, user_id, invoice_number, issue_date, due_date, total)
					VALUES(:business_id, :client_id, :user_id, :invoice_number, DATE('now'), DATE('now', '+30 day'), 0.0)`,
				args: {
					business_id: businessId,
					client_id: newInvoice.client_id,
					user_id: userId,
					invoice_number: invoiceNumber,
				}
			})
			const invoiceId = Number(createdInvoice.lastInsertRowid.valueOf())
			let total = 0

			for (const product of newInvoice.products) {

				const productPrice = await this.getPrice(transaction, product.product_id)
				const subtotal = productPrice * product.quantity
				total += subtotal

				await transaction.execute({
					sql: `INSERT INTO invoice_items (invoice_id, product_id, quantity, subtotal)
						VALUES(:invoice_id, :product_id, :quantity, :subtotal)`,
					args: { invoice_id: invoiceId, product_id: product.product_id, quantity: product.quantity, subtotal: subtotal }
				})
			}


			await transaction.execute({
				sql: "UPDATE invoice SET total = :total WHERE id = :invoice_id",
				args: { total, invoice_id: invoiceId }
			})

			await transaction.commit()

			return { id: invoiceId, invoice_number: invoiceNumber, total }
		} catch (error) {
			if (transaction) await transaction.rollback()
			console.error("Error inserting product: ", error)
			throw new Error("Error inserting into")
		} finally {
			transaction.close()
		}
	}

	getPrice = async (transaction: Transaction, productId: number) => {
		const price = await transaction.execute({
			sql: "SELECT price FROM products WHERE id = ?",
			args: [productId]
		})

		if (price.rows.length === 0) {
			throw new Error(`Product ${productId}, not found`)
		}

		return price.rows[0].price as number
	}

	generateInvoiceNumber = async (transaction: Transaction, businessId: number): Promise<string | null> => {
		const result = await transaction.execute({
			sql: `SELECT invoice_number FROM invoice WHERE business_id = :business_id ORDER BY id DESC LIMIT 1`,
			args: { business_id: businessId }
		})

		if (result.rows.length === 0) {
			return "INV-0001"
		}

		const lastNumber = result.rows[0].invoice_number as string
		const lastNumeric = parseInt(lastNumber.split("-")[1])
		const next = (lastNumeric + 1).toString().padStart(4, "0")

		return `INV-${next}`
	}
}
