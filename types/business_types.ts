import z from "zod";
import { BusinessRequest, NewUserRequest } from "../schemas/business";

export type NewBusinessType = z.infer<typeof BusinessRequest>

export type NewUserType = z.infer<typeof NewUserRequest>
