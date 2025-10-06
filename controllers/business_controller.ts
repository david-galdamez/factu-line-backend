import z from "zod"
import { BusinessLogin, BusinessRequest, NewUserRequest } from "../schemas/business"
import { BusinessModel } from "../models/business_model"
import { Request, Response } from "express"
import bcrypt from "bcrypt"
import { NewBusinessType, NewUserType } from "../types/business_types"
import jwt from "jsonwebtoken"

const SALT_ROUND = Number(process.env.SALT_ROUND) || 10
const SECRET_JWT_KEY = process.env.SECRET_JWT_KEY

export class BusinessController {

	private businessModel: BusinessModel

	constructor(businessModel: BusinessModel) {
		this.businessModel = businessModel
	}

	register = async (req: Request, res: Response) => {
		try {
			const result = BusinessRequest.safeParse(req.body)

			if (!result.success) {
				const error = z.flattenError(result.error)

				res.status(400).json({
					sucess: false,
					data: null,
					error: error,
				})
				return
			}

			const user = await this.businessModel.getUserByEmail({ email: result.data.email })
			if (user.rows.length > 0) {
				res.status(409).json({
					success: false,
					error: "Email is already being used",
				})
				return
			}

			const hashedPassword = await bcrypt.hash(result.data.password, SALT_ROUND)

			const newBusiness: NewBusinessType = { ...result.data, password: hashedPassword }

			const createdBusiness = await this.businessModel.create(newBusiness)

			res.status(201).json({
				success: true,
				data: {
					id: createdBusiness
				},
				message: "Business registered successfully"
			})
			return
		} catch (error) {
			console.error("Error registering business: ", error)
			res.status(500).json({
				sucess: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}

	logIn = async (req: Request, res: Response) => {
		try {
			const loginResult = BusinessLogin.safeParse(req.body)

			if (!loginResult.success) {
				const error = z.flattenError(loginResult.error)

				res.status(400).json({
					success: false,
					data: null,
					error: error
				})
				return
			}

			const user = await this.businessModel.getUserByEmail({ email: loginResult.data.email })
			if (user.rows.length === 0) {
				res.status(404).json({
					success: false,
					data: null,
					error: "Email not registered"
				})
				return
			}

			const userRow = user.rows[0]

			const hashedPassword = String(userRow.password)
			const isPassword = await bcrypt.compare(loginResult.data.password, hashedPassword)
			if (!isPassword) {
				res.status(401).json({
					success: false,
					data: null,
					error: "Incorrect password"
				})
				return
			}

			const token = jwt.sign(
				{
					id: userRow.id as number,
					business_id: userRow.business_id as number,
					role_id: userRow.role_id as number
				},
				SECRET_JWT_KEY,
				{
					expiresIn: "1h"
				}
			)

			res.cookie('access_token', token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'PRODUCTION',
				maxAge: 1000 * 60 * 60
			}).status(200).json({
				success: true,
				data: null,
				message: "Login successfully"
			})
			return
		} catch (error) {
			console.log("Error login business: ", error)
			res.status(500).json({
				sucess: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}

	logOut = async (req: Request, res: Response) => {
		res.clearCookie('access_token').json({
			success: true,
			data: null,
			message: "Logout successfully"
		})
		return
	}

	registerUser = async (req: Request, res: Response) => {
		try {
			const result = NewUserRequest.safeParse(req.body)

			if (!result.error) {
				const error = z.flattenError(result.error)

				res.status(400).json(error)
			}

			const user = await this.businessModel.getUserByEmail({ email: result.data.email })
			if (user.rows.length > 0) {
				res.status(409).json({
					success: false,
					error: "Email is already being used",
				})
				return
			}

			const hashedPassword = await bcrypt.hash(result.data.password, SALT_ROUND)

			const businessId = req.session.user.business_id
			const newUser: NewUserType = { ...result.data, password: hashedPassword }

			const createdUser = await this.businessModel.registerUser({ businessId, newUser })
			res.status(201).json({
				success: true,
				data: {
					id: createdUser
				},
				message: "User registered successfully"
			})
			return
		} catch (error) {
			console.error("Error creating user: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}
}
