import { Router } from "express";
import { ProductModel } from "../models/product_model";
import { db } from "../config/database";
import { ProductController } from "../controllers/product_controller";

export const productRouter = Router()

const productModel = new ProductModel(db)
const productController = new ProductController(productModel)

productRouter.get("/list", productController.getProducts)
productRouter.post("/register", productController.register)
productRouter.put("/update/:id", productController.update)

