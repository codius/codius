import { type Manifest } from "@codius/lib-manifest"

export type App = {
  githubUrl: string;
  manifest: Manifest;
}

export type Database = {
  apps: Record<string, App>;
}

export const database: Database = {
  apps: {},
}
