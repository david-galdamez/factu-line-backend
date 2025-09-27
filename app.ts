import express from "express"
import { businessRouter } from "./routes/business_routes.ts"
import cors from "cors"
import cookieParser from "cookie-parser"
import { verifyCookie } from "./middlewares/verify_cookie.ts"
import { clientRouter } from "./routes/client_routes.ts"
import { productRouter } from "./routes/products_routes.ts"

const app = express()

app.use(express.json()) //json middleware
app.use(cookieParser())
app.use(cors())

app.use("/business", businessRouter)

app.use(verifyCookie)

app.use("/clients", clientRouter)
app.use("/products", productRouter)

export default app
