import { Client, ResultSet } from "@libsql/client"
import { NewBusinessType } from "../types/business_types"

export class BusinessModel {

	private db: Client

	constructor(db: Client) {
		this.db = db
	}

	async getBusinessByEmail({ email }: { email: string }): Promise<ResultSet | null> {
		try {
			const business = await this.db.execute({
				sql: "SELECT id, email, password FROM businesses WHERE email = ?",
				args: [email]
			})

			return business
		} catch (error) {
			console.error("Error fetching business by email: ", error)
			throw new Error("Database query failed")
		}
	}

	async create(newBusiness: NewBusinessType): Promise<ResultSet | null> {
		try {
			const createdBusiness = await this.db.execute({
				sql: `INSERT INTO businesses(name, tax_id, address, phone, email, password)
				VALUES (:name, :tax_id, :address, :phone, :email, :password)`,
				args: {
					...newBusiness
				}
			})

			return createdBusiness
		} catch (error) {
			console.error("Error creating business: ", error)
			throw new Error("Database insert failed")
		}
	}
}
