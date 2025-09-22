import { Router } from "express"
import { UserController } from "../controllers/user.controller"

export const userRouter = () => {

	const router = Router()

	const userController = new UserController()

	return router
}
