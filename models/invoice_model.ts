import { Client, Transaction } from "@libsql/client/.";
import { InvoiceData, InvoiceItems, NewInvoiceType } from "../types/invoice_types";

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

				//taxes
				total *= 1.1

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
			sql: "SELECT unit_price FROM products WHERE id = ?",
			args: [productId]
		})

		if (price.rows.length === 0) {
			throw new Error(`Product ${productId}, not found`)
		}

		return price.rows[0].unit_price as number
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

	getInvoiceInfo = async ({ invoiceId }: { invoiceId: number }): Promise<InvoiceData> => {
		try {
			const invoice = await this.db.execute({
				sql: `SELECT
  						b.name AS businessName,
  						i.invoice_number AS invoiceNumber,
  						c.name AS customerName,
  						c.email AS customerEmail,
  						c.address AS customerAddress,
  						i.issue_date AS date,
  						i.total AS total
					FROM 
					invoice i
					JOIN businesses b ON b.id = i.business_id
					JOIN clients c ON c.id = i.client_id
					WHERE i.id = :invoiceId`,
				args: { invoiceId }
			})

			const items = await this.db.execute({
				sql: `SELECT
  						p.description,
  						p.unit_price AS unitPrice,
  						ii.quantity
					FROM
					invoice_items ii
					JOIN products p ON p.id = ii.product_id
					WHERE
					ii.invoice_id = :invoiceId`,
				args: { invoiceId }
			})

			let subTotal = 0
			const invoiceItems = items.rows.map((row) => {
				const item: InvoiceItems = {
					description: row.description as string,
					unitPrice: row.unitPrice as number,
					quantity: row.quantity as number,
				}

				subTotal += (item.unitPrice * item.quantity)

				return item
			})

			const invoiceRow = invoice.rows[0]
			const invoiceData: InvoiceData = {
				businessName: invoiceRow.businessName as string,
				invoiceNumber: invoiceRow.invoiceNumber as string,
				customerName: invoiceRow.customerName as string,
				customerEmail: invoiceRow.customerEmail as string,
				customerAddress: invoiceRow.customerAddress as string,
				date: invoiceRow.date as string,
				items: invoiceItems,
				subtotal: subTotal,
				tax: subTotal * 0.1,
				total: invoiceRow.total as number,
			}

			return invoiceData
		} catch (error) {
			console.error("Error getting invoice info: ", error)
			throw new Error("Error querying into database")
		}
	}
}
