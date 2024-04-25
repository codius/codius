#!/usr/bin/env vite-node --script

import http from "node:http"
import debug from "debug"
import app from "./app"

const normalizePort = (value: string | number): number | string | boolean => {
  const port = Number.parseInt(value.toString(), 10)

  if (Number.isNaN(port)) {
    return value
  }

  if (port >= 0) {
    return port
  }

  return false
}

const onError = (error: NodeJS.ErrnoException): void => {
  if (error.syscall !== "listen") {
    throw error
  }

  const bind = typeof port === "string"
    ? "Pipe " + port
    : "Port " + port

  switch (error.code) {
    case "EACCES": {
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      // Fallthrough
    }

    case "EADDRINUSE": {
      console.error(`${bind} is already in use`)
      process.exit(1)
      // Fallthrough
    }

    default: {
      throw error
    }
  }
}

const onListening = (): void => {
  const addr = server.address()
  if (addr === null) {
    console.error("Server address is null")
    return
  }

  const bind = typeof addr === "string"
    ? "pipe " + addr
    : "port " + addr.port
  debug("Listening on " + bind)
}

const port = normalizePort(process.env["PORT"] ?? "3000")
app.set("port", port)

const server = http.createServer(app)

server.listen(port)
server.on("error", onError)
server.on("listening", onListening)
