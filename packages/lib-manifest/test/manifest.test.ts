import { describe, expect, test } from "vitest"
import { validateManifest, type Manifest } from "../src/manifest"

describe("validateManifest", () => {
  const validManifest: Manifest = {
    $schema: "https://codius.org/schema/manifest/v1",
    routes: {
      /* eslint-disable @typescript-eslint/naming-convention */
      "=/": "static:./index.html",
      "/": "static:./index.html",
      "/assets": "static:./assets/",
      "/a": "static:./builds/client/a.html",
      /* eslint-enable @typescript-eslint/naming-convention */
    },
  }

  test("valid manifest", ({ expect }) => {
    expect(validateManifest(validManifest)).toBe(true)
  })

  test("missing $schema", ({ expect }) => {
    const { $schema, ...manifest } = validManifest
    expect(validateManifest(manifest)).toBe(false)
  })

  test("invalid $schema", ({ expect }) => {
    const manifest = {
      ...validManifest,
      $schema: "https://codius.org/schema/manifest/v2",
    }
    expect(validateManifest(manifest)).toBe(false)
  })

  test("missing routes", ({ expect }) => {
    const { routes, ...manifest } = validManifest
    expect(validateManifest(manifest)).toBe(false)
  })

  test("additional properties", ({ expect }) => {
    const manifest = {
      ...validManifest,
      extra: "property",
    }
    expect(validateManifest(manifest)).toBe(false)
  })

  test.each(["asdf"])("invalid route path %s", path => {
    const manifest = {
      ...validManifest,
      routes: {
        ...validManifest.routes,
        [path]: "static:./index/asdf.html",
      },
    }
    expect(validateManifest(manifest)).toBe(false)
  })

  test.each(["invalid:./index/asdf.html", "./index/asdf"])("invalid route %s", route => {
    const manifest = {
      ...validManifest,
      routes: {
        ...validManifest.routes,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        "/asdf": route,
      },
    }
    expect(validateManifest(manifest)).toBe(false)
  })
})
