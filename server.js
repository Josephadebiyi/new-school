const express = require("express");
const path = require("path");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
const PORT = process.env.PORT || 3000;
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8001";

// Proxy /api/* requests to the backend
app.use(
  "/api",
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
  })
);

// Serve React build (static files)
app.use(express.static(path.join(__dirname, "static")));

// Serve new school React app
app.use("/school", express.static(path.join(__dirname, "school")));

app.get("/school/*", (req, res) => {
  res.sendFile(path.join(__dirname, "school", "index.html"));
});

// SPA fallback — send all non-API routes to index.html
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "static", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Frontend server running on port ${PORT}`);
  console.log(`Proxying /api/* → ${BACKEND_URL}`);
});
