import express, { type Router } from "express"
import { validateManifest, type Manifest } from "@codius/lib-manifest"

// eslint-disable-next-line new-cap
const router: Router = express.Router()

const apps: Manifest[] = []

router.get("/", (_request, response, _next) => {
  response.status(200).send(apps)
})

router.post("/", (request, response, _next) => {
  if (!validateManifest(request.body)) {
    response.status(400).send("Invalid manifest")
    return
  }

  apps.push(request.body)
  response.status(201).send(request.body)
})

export default router
