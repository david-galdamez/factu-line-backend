import express from "express"
import { userRouter } from "./routes/user.routes"

const app = express()
app.use(express.json()) //json middleware

//user route
app.use("/users", userRouter)

app.use((err, req, res, next) => {
	res.status(400).json({ error: err.message })
})

export default app
