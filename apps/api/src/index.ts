import express from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import type {
  HealthResponse,
  ApiResponse,
  Task,
  CreateTaskInput,
} from "@component-lab/types";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// In-memory task store
const tasks: Task[] = [];

// Health check
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

// GET /tasks — list all tasks
app.get("/tasks", (_req, res) => {
  const payload: ApiResponse<Task[]> = {
    success: true,
    data: tasks,
  };
  res.json(payload);
});

// POST /tasks — create a task
app.post("/tasks", (req, res) => {
  const body = req.body as CreateTaskInput;

  if (!body.title || typeof body.title !== "string" || body.title.trim() === "") {
    res.status(400).json({ success: false, error: "title is required", statusCode: 400 });
    return;
  }

  const task: Task = {
    id: randomUUID(),
    title: body.title.trim(),
    description: (body.description ?? "").trim(),
    status: "todo",
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);

  const payload: ApiResponse<Task> = {
    success: true,
    data: task,
    message: "Task created",
  };
  res.status(201).json(payload);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
