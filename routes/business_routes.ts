import { Router } from "express"
import { db } from "../config/database"
import { BusinessModel } from "../models/business_model"
import { BusinessController } from "../controllers/business_controller"
import { verifyCookie } from "../middlewares/verify_cookie"

export const businessRouter = Router()

const businessModel = new BusinessModel(db)
const businessController = new BusinessController(businessModel)

businessRouter.post('/register/business', businessController.register)
businessRouter.post('/login', businessController.logIn)
businessRouter.post('/logout', verifyCookie, businessController.logOut)
businessRouter.post('/register/user', businessController.registerUser)
