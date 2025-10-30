import { createClient } from "@libsql/client";
import { configDotenv } from "dotenv";

configDotenv()

const TURSO_DATABASE_URL = process.env.TURSO_DATABASE_URL || ""
const TURSO_AUTH_TOKEN = process.env.TURSO_AUTH_TOKEN || ""

export const db = createClient({
	url: TURSO_DATABASE_URL,
	authToken: TURSO_AUTH_TOKEN
})

