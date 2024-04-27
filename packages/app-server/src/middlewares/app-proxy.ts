import { Readable } from "node:stream"
import createError from "http-errors"
import {
  type Request, type Response, type NextFunction,
} from "express"
import { getRoute } from "@codius/lib-manifest"
import { database } from "../database"

// eslint-disable-next-line @typescript-eslint/naming-convention
const JSDELIVR_URL = "https://cdn.jsdelivr.net/gh/"

export const appProxy = async (request: Request, response: Response, next: NextFunction) => {
  if (request.subdomains.length === 1 && request.subdomains[0]) {
    const appId = request.subdomains[0]
    const app = database.apps[appId]
    if (!app) {
      next(createError(404))
      return
    }

    const route = getRoute(app.manifest, request.path)
    if (!route) {
      next(createError(404))
      return
    }

    const fileUrl = `${JSDELIVR_URL}${app.githubUrl}${route}`
    const fileResponse = await fetch(fileUrl)
    if (fileResponse.ok && fileResponse.body) {
      // Set headers or content type if necessary
      const contentType = fileResponse.headers.get("Content-Type")
      if (contentType) {
        response.setHeader("Content-Type", contentType)
      }

      response.setHeader("Cache-Control", "public, max-age=31557600")

      // Stream the response back to the client
      // fileResponse.body.pipe(response);
      // Readable.fromWeb(fileResponse.body).pipe(response)
      const nodeStream = Readable.fromWeb(fileResponse.body)
      nodeStream.pipe(response)
    } else {
      next(createError(404))
    }
  } else {
    next()
  }
}
