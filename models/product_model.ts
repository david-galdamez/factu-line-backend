import { Client, Row } from "@libsql/client/.";
import { NewProductType } from "../types/product_types";

export class ProductModel {

	private db: Client

	constructor(db: Client) {
		this.db = db
	}

	create = async ({ businessId, newProduct }: { businessId: number, newProduct: NewProductType }): Promise<bigint | null> => {
		try {
			const result = await this.db.execute({
				sql: `INSERT INTO products (business_id, name, description, unit_price)
					VALUES(:business_id, :name, :description, :unit_price)`,
				args: {
					business_id: businessId,
					...newProduct
				}
			})

			return result.lastInsertRowid ?? null
		} catch (error) {
			console.error("Error inserting into database: ", error)
			throw new Error("Database insert failed")
		}
	}

	update = async ({ productId, newProduct }: { productId: number, newProduct: NewProductType }): Promise<number | null> => {
		try {
			const result = await this.db.execute({
				sql: `UPDATE products SET name = :name, description = :description, unit_price = :unit_price, stock= :stock WHERE id = :product_id`,
				args: {
					...newProduct,
					product_id: productId
				}
			})

			return result.rowsAffected
		} catch (error) {
			console.error("Error updating into database: ", error)
			throw new Error("Database update failed")
		}
	}

	getProduct = async ({ productId }: { productId: number }): Promise<number | null> => {
		try {
			const result = await this.db.execute({
				sql: "SELECT id FROM products WHERE id = ?",
				args: [productId]
			})

			return result.rows[0].id as number ?? null
		} catch (error) {
			console.error("Error fetching database: ", error)
			throw new Error("Database query failed")
		}
	}

	getProducts = async ({ businessId }: { businessId: number }): Promise<Row[] | null> => {
		try {
			const result = await this.db.execute({
				sql: "SELECT id, name, description, unit_price, stock FROM products WHERE business_id = :business_id",
				args: { business_id: businessId }
			})

			return result.rows
		} catch (error) {
			console.error("Error fetching database: ", error)
			throw new Error("Database query failed")
		}
	}

}
