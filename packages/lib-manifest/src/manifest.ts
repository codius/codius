import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Ajv, { type JSONSchemaType, type ValidateFunction } from "ajv"

export type Manifest = {
  $schema: string;
  routes: Record<string, string>;
}

const ajv = new Ajv()
const dirname = path.dirname(fileURLToPath(import.meta.url))

const schema = JSON.parse(
  fs.readFileSync(path.resolve(dirname, "manifest.schema.json"), "utf8"),
) as JSONSchemaType<Manifest>

export const validateManifest: ValidateFunction<Manifest> = ajv.compile(schema)

export const getRoute = (manifest: Manifest, urlPath: string): string | undefined => {
  let matchedPath: string | undefined
  let maxMatchLength = 0

  // Iterate through the routes to find the best match
  for (const [route, target] of Object.entries(manifest.routes)) {
    const exactMatchPrefix = "=/"
    const isExactMatchRoute = route.startsWith(exactMatchPrefix)
    const normalizedRoute = isExactMatchRoute ? route.slice(2) : route

    if (isExactMatchRoute) {
      // Check for exact matches when the route specifies it
      if (urlPath === normalizedRoute && normalizedRoute.length > maxMatchLength) {
        matchedPath = target.replace("static:", "").trim()
        maxMatchLength = normalizedRoute.length
      }
      // Handle non-exact (prefix) matches
    } else if (urlPath === route || (urlPath.startsWith(route + "/") && route.length > maxMatchLength)) {
      const relativePath = urlPath.slice(route.length)
      matchedPath = target.replace("static:", "").trim() + relativePath
      maxMatchLength = route.length
    }
  }

  // Fallback to the root "/" if no specific match is found
  if (!matchedPath && manifest.routes["/"]) {
    matchedPath = manifest.routes["/"].replace("static:", "").trim()
  }

  return matchedPath
}
