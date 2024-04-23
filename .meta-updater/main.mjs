import { existsSync, readdirSync } from "node:fs"
import { join } from "node:path"

export default (workspaceDir) => {
  return {
    "package.json": (manifest, dir) => {
      const relativePath = dir.dir.replace(`${workspaceDir}/`, '');

      return {
        ...manifest,
        scripts: {
          ...manifest.scripts,
          ...(manifest.name !== "@codius/root"
            // https://github.com/xojs/xo/issues/701#issuecomment-1371075893
            ? { lint: `xo "./${relativePath}" --cwd "../.."` }
            : {}
          )
        }
      }
    },
    "tsconfig.json": (tsConfig, { manifest, dir }) => {
      if (!tsConfig) return tsConfig

      if (manifest.name === "@codius/root") {
        const packages = readdirSync(join(dir, "packages"))

        const packagesWithTsconfig = packages.filter((packageName) => {
          const tsConfigPath = join(
            dir,
            "packages",
            packageName,
            "tsconfig.json",
          )
          return existsSync(tsConfigPath)
        })

        return {
          ...tsConfig,
          references: packagesWithTsconfig.map((packageName) => ({
            path: `./packages/${packageName}/tsconfig.json`,
          })),
        }
      }

      return {
        ...tsConfig,
        compilerOptions: {
          ...tsConfig.compilerOptions,
          outDir: "dist",
        },
      }
    },
  }
}
