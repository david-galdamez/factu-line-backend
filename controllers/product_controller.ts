import { Request, Response } from "express";
import { ProductModel } from "../models/product_model";
import { ProductRequest } from "../schemas/product";
import z from "zod";
import { NewProductType } from "../types/product_types";

export class ProductController {

	private productModel: ProductModel

	constructor(productModel: ProductModel) {
		this.productModel = productModel
	}

	register = async (req: Request, res: Response) => {
		try {
			const result = ProductRequest.safeParse(req.body)

			if (!result.success) {
				const error = z.flattenError(result.error)

				res.status(400).json(error)
				return
			}

			const businessId = req.session.user.business_id
			const newProduct: NewProductType = {
				...result.data
			}

			const createdProduct = await this.productModel.create({ businessId, newProduct })
			if (!createdProduct) {
				res.status(500).json({
					success: false,
					data: null,
					error: "Error inserting product"
				})
				return
			}

			res.status(201).json({
				success: true,
				data: { product_id: createdProduct ? Number(createdProduct.valueOf()) : null },
				message: "Product created successfully"
			})
			return
		} catch (error) {
			console.error("Error registering product: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}

	update = async (req: Request, res: Response) => {
		try {
			const result = ProductRequest.safeParse(req.body)

			if (!result.success) {
				const error = z.flattenError(result.error)

				res.status(400).json(error)
				return
			}

			const productId = Number(req.params.id)
			const product = await this.productModel.getProduct({ productId })
			if (!product) {
				res.status(404).json({
					success: false,
					data: null,
					error: "Product is not registered"
				})
				return
			}

			const newProduct: NewProductType = {
				...result.data
			}
			const rowsAffected = await this.productModel.update({ productId, newProduct })
			if (rowsAffected === 0) {
				res.status(500).json({
					success: false,
					data: null,
					error: "Error updating product"
				})
				return
			}

			res.status(200).json({
				success: true,
				data: null,
				message: "Product updated correctly"
			})
			return
		} catch (error) {
			console.error("Error updating product: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}

	getProducts = async (req: Request, res: Response) => {
		try {
			const businessId = req.session.user.business_id

			const productsRows = await this.productModel.getProducts({ businessId })

			res.status(200).json({
				success: true,
				data: {
					products: productsRows
				},
				message: "Products fetched correctly"
			})
		} catch (error) {
			console.error("Error registering product: ", error)
			res.status(500).json({
				success: false,
				data: null,
				error: "Internal server error"
			})
			return
		}
	}
}
