import z from "zod";
import { ClientRequest } from "../schemas/client";

export type NewClientType = z.infer<typeof ClientRequest>


