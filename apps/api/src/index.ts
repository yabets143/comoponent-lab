import express from "express";
import cors from "cors";
import type { HealthResponse, ApiResponse } from "@component-lab/types";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// Health check endpoint
app.get("/health", (_req, res) => {
  const payload: ApiResponse<HealthResponse> = {
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    },
  };
  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
