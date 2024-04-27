import createError from "http-errors"
import express, {
  type Application, type Request, type Response, type NextFunction,
} from "express"
import { appProxy } from "./middlewares/app-proxy"
import indexRouter from "./routes/index"
import appsRouter from "./routes/apps"

const app: Application = express()

app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(appProxy)

app.use("/", indexRouter)
app.use("/apps", appsRouter)

// Catch 404 and forward to error handler
app.use((_request: Request, _response: Response, next) => {
  next(createError(404))
})

// Error handler
app.use((error: { message?: string; status?: number }, request: Request, response: Response, _next: NextFunction) => {
  // Set locals, only providing error in development
  response.locals["message"] = error.status
  response.locals["error"] = request.app.get("env") === "development" ? error : {}

  // Render the error page
  response.status(error.status ?? 500)
})

export default app
