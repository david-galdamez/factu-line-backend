import z from "zod";
import { ProductRequest } from "../schemas/product";

export type NewProductType = z.infer<typeof ProductRequest>
