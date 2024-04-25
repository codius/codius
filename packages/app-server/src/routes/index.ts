import express, { type Router } from "express"

// eslint-disable-next-line new-cap
const router: Router = express.Router()

router.get("/", (_request, response, _next) => {
  response.status(200).send("codius")
})

export default router
