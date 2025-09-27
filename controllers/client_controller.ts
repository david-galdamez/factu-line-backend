import { Request, Response } from "express"
import { ClientModel } from "../models/client_model"
import { ClientRequest } from "../schemas/client"
import z from "zod"
import { NewClientType } from "../types/client_types"

export class ClientController {

	private clientModel: ClientModel

	constructor(clientModel: ClientModel) {
		this.clientModel = clientModel
	}

	register = async (req: Request, res: Response) => {
		try {
			const result = ClientRequest.safeParse(req.body)

			if (!result.success) {
				const error = z.flattenError(result.error)

				res.status(400).json(error)
				return
			}

			const businessId = req.session.user.id
			const newClient: NewClientType = {
				...result.data
			}

			const clientRows = await this.clientModel.getClientByEmail({
				business_id: businessId,
				clientEmail: result.data.email
			})
			if (clientRows.length !== 0) {
				res.status(409).json({
					success: false,
					data: null,
					error: "Client is already registered"
				})
				return
			}

			const createdClientId = await this.clientModel.create(businessId, newClient)
			if (!createdClientId) {
				res.status(500).json({
					success: false,
					data: null,
					error: "Error creating client"
				})
				return
			}

			res.status(201).json({
				success: true,
				data: { client_id: createdClientId ? Number(createdClientId.valueOf()) : null },
				message: "Client created successfully"
			})
			return
		} catch (error) {
			console.error("Error registering client: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}

	getClients = async (req: Request, res: Response) => {
		try {
			const businessId = req.session.user.id
			const clientsRows = await this.clientModel.getClients({ id: businessId })
			res.status(200).json({
				success: true,
				data: {
					clients: clientsRows
				},
				message: "Found business clients"
			})
			return
		} catch (error) {
			console.error("Error getting clients", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}
}
