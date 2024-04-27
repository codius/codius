import express, { type Router } from "express"
import { customAlphabet } from "nanoid"
import { z } from "zod"
import { validateManifest } from "@codius/lib-manifest"
import { database } from "../database"

// eslint-disable-next-line new-cap
const router: Router = express.Router()

router.get("/", (_request, response, _next) => {
  response.status(200).send(database.apps)
})

// eslint-disable-next-line @typescript-eslint/naming-convention
const JSDELIVR_URL = "https://cdn.jsdelivr.net/gh/"

const nanoid: () => string = customAlphabet(
  "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz", 16,
)

const postBodySchema = z.object({
  githubUrl: z.string().refine(url => url.startsWith("https://github.com/"), {
    message: "Invalid github url",
  }).transform(url => url.replace("https://github.com/", "")),
})

router.post("/", async (request, response, _next) => {
  try {
    const { githubUrl } = postBodySchema.parse(request.body)

    const manifestUrl = `${JSDELIVR_URL}${githubUrl}/codius.json`
    const manifestResponse = await fetch(manifestUrl)
    const manifest = (await manifestResponse.json()) as unknown

    if (!validateManifest(manifest)) {
      response.status(400).send("Invalid manifest")
      return
    }

    const id = nanoid()
    database.apps[id] = { githubUrl, manifest }

    response.location(`http://${id}.localhost:3000/`)
    response.status(201).send(manifest)
  } catch (error) {
    if (error instanceof z.ZodError) {
      response.status(400).send("Invalid request body")
      return
    }

    throw error
  }
})

export default router
