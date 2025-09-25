import z from "zod";
import { BusinessRequest } from "../schemas/business";

export type NewBusinessType = z.infer<typeof BusinessRequest>
