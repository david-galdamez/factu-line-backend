import { Client, ResultSet, Row } from "@libsql/client/.";
import { NewClientType } from "../types/client_types";

export class ClientModel {
    private db: Client;

    constructor(db: Client) {
        this.db = db;
    }

    create = async (
        business_id: number,
        newClient: NewClientType,
    ): Promise<bigint | null> => {
        try {
            const result = await this.db.execute({
                sql: `INSERT INTO clients(business_id, name, dui, address, phone, email)
					VALUES (:business_id, :name, :dui, :address, :phone, :email)`,
                args: {
                    business_id: business_id,
                    name: newClient.name,
                    dui: newClient.dui,
                    address: newClient.address,
                    phone: newClient.phone,
                    email: newClient.email,
                },
            });

            return result.lastInsertRowid;
        } catch (error) {
            console.error("Error creating client: ", error);
            throw new Error("Error inserting into database");
        }
    };

    getClientByEmail = async ({
        business_id,
        clientEmail,
    }: {
        business_id: number;
        clientEmail: string;
    }): Promise<Row[] | null> => {
        try {
            const result = await this.db.execute({
                sql: "SELECT id FROM clients WHERE business_id = :business_id AND email = :email",
                args: { business_id, email: clientEmail },
            });

            return result.rows;
        } catch (error) {
            console.error("Error getting client: ", error);
            throw new Error("Error fetching from database");
        }
    };

    getClients = async ({
        id,
        email,
    }: {
        id: number;
        email: string;
    }): Promise<Row[] | null> => {
        try {
            let result: ResultSet;
            let query =
                "SELECT id, name, email, dui, address FROM clients WHERE business_id = ? ";

            if (email) {
                query += "AND email = ?";

                result = await this.db.execute({
                    sql: query,
                    args: [id, email],
                });
            } else {
                result = await this.db.execute({
                    sql: query,
                    args: [id],
                });
            }

            return result.rows;
        } catch (error) {
            console.log("Error fetching clients: ", error);
            throw new Error("Database query failed");
        }
    };
}
