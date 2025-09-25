import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken"
import { UserSession } from "../types/express";

const SECRET_JWT_KEY = String(process.env.SECRET_JWT_KEY)

export const verifyCookie = (req: Request, res: Response, next: NextFunction) => {
	const token = req.cookies.access_token

	if (!token) {
		return res.status(401).json({
			success: false,
			data: null,
			error: "No token provided, unauthorized"
		})
	}

	try {
		const decoded = jwt.verify(token, SECRET_JWT_KEY) as UserSession
		req.session = { user: decoded }
		next()
	} catch (error) {
		return res.status(401).json({
			success: false,
			data: null,
			error: "Invalid or expired token"
		})
	}
}
