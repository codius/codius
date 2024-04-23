import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import Ajv, { type JSONSchemaType } from "ajv"

export type Manifest = {
  $schema: string;
  routes: Record<string, string>;
}

const ajv = new Ajv()
const dirname = path.dirname(fileURLToPath(import.meta.url))

const schema = JSON.parse(
  fs.readFileSync(path.resolve(dirname, "manifest.schema.json"), "utf8"),
) as JSONSchemaType<Manifest>

export const validateManifest = ajv.compile(schema)
