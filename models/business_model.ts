import { Client, ResultSet } from "@libsql/client"
import { NewBusinessType } from "../types/business_types"

export interface CreatedBusiness {
	user_id: number,
	business_id: number
}

export class BusinessModel {

	private db: Client

	constructor(db: Client) {
		this.db = db
	}

	getUserByEmail = async ({ email }: { email: string }): Promise<ResultSet | null> => {
		try {
			const business = await this.db.execute({
				sql: "SELECT id, business_id, role_id, email, password FROM users WHERE email = ?",
				args: [email]
			})

			return business
		} catch (error) {
			console.error("Error fetching business by email: ", error)
			throw new Error("Database query failed")
		}
	}

	create = async (newBusiness: NewBusinessType): Promise<CreatedBusiness | null> => {
		const transaction = await this.db.transaction('write')
		try {
			const createdBusiness = await transaction.execute({
				sql: `INSERT INTO businesses(name, tax_id, address, phone)
				VALUES (:name, :tax_id, :address, :phone)`,
				args: {
					name: newBusiness.name,
					tax_id: newBusiness.tax_id,
					address: newBusiness.address,
					phone: newBusiness.phone,
				}
			})

			const businessId = Number(createdBusiness.lastInsertRowid.valueOf())

			const createdUser = await transaction.execute({
				sql: `INSERT INTO users(name, email, password, business_id, role_id)
				VALUES (:name, :email, :password, :business_id, :role_id)`,
				args: {
					name: newBusiness.user_name,
					email: newBusiness.email,
					password: newBusiness.password,
					business_id: businessId,
					role_id: 1
				}
			})

			await transaction.commit()

			return { user_id: Number(createdUser.lastInsertRowid.valueOf()), business_id: Number(createdBusiness.lastInsertRowid.valueOf()) }
		} catch (error) {
			if (transaction) await transaction.rollback()
			console.error("Error creating business: ", error)
			throw new Error("Database insert failed")
		} finally {
			transaction.close()
		}
	}
}
