import { Router } from "express";
import { ClientModel } from "../models/client_model";
import { db } from "../config/database";
import { ClientController } from "../controllers/client_controller";

export const clientRouter = Router()

const clientModel = new ClientModel(db)
const clientController = new ClientController(clientModel)

clientRouter.post("/register", clientController.register)
clientRouter.get("/list", clientController.getClients)
