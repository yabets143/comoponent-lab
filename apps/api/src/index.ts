import express, { type Request, type Response } from "express";
import cors from "cors";
import { randomUUID } from "crypto";
import type {
  HealthResponse,
  ApiResponse,
  ApiError,
  ApiValidationError,
  ValidationError,
  Task,
  TaskStatus,
  TaskEvent,
  CreateTaskInput,
  UpdateTaskInput,
} from "@component-lab/types";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

// ── In-memory store ───────────────────────────────────────
const tasks: Task[] = [];

// ── SSE client registry ───────────────────────────────────
const sseClients = new Set<Response>();

function broadcast(event: TaskEvent) {
  const data = `data: ${JSON.stringify(event)}\n\n`;
  for (const client of sseClients) {
    client.write(data);
  }
}

// ── Validation ────────────────────────────────────────────
const VALID_STATUSES: TaskStatus[] = ["todo", "in-progress", "done"];

function validateCreateTask(body: unknown): ValidationError[] {
  const errors: ValidationError[] = [];
  const b = body as Record<string, unknown>;

  if (!b.title || typeof b.title !== "string" || b.title.trim() === "") {
    errors.push({ field: "title", message: "Title is required" });
  } else if (b.title.trim().length > 120) {
    errors.push({ field: "title", message: "Title must be 120 characters or fewer" });
  }

  if (b.description !== undefined && typeof b.description !== "string") {
    errors.push({ field: "description", message: "Description must be a string" });
  } else if (typeof b.description === "string" && b.description.length > 500) {
    errors.push({ field: "description", message: "Description must be 500 characters or fewer" });
  }

  return errors;
}

function sendValidationError(res: Response, errors: ValidationError[]) {
  const payload: ApiValidationError = {
    success: false,
    error: "Validation failed",
    statusCode: 422,
    details: errors,
  };
  res.status(422).json(payload);
}

function sendNotFound(res: Response, message: string) {
  const payload: ApiError = { success: false, error: message, statusCode: 404 };
  res.status(404).json(payload);
}

// ── Routes ────────────────────────────────────────────────

// GET /health
app.get("/health", (_req: Request, res: Response) => {
  const payload: ApiResponse<HealthResponse> = {
    success: true,
    data: { status: "ok", timestamp: new Date().toISOString(), uptime: process.uptime() },
  };
  res.json(payload);
});

// GET /tasks
app.get("/tasks", (_req: Request, res: Response) => {
  const payload: ApiResponse<Task[]> = { success: true, data: tasks };
  res.json(payload);
});

// GET /events — Server-Sent Events stream
app.get("/events", (req: Request, res: Response) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  sseClients.add(res);

  // Tell this client how many people are currently connected
  const connectedEvent: TaskEvent = {
    type: "connected",
    payload: { clientCount: sseClients.size },
    timestamp: new Date().toISOString(),
  };
  res.write(`data: ${JSON.stringify(connectedEvent)}\n\n`);

  // Broadcast updated count to everyone else
  broadcast({
    type: "connected",
    payload: { clientCount: sseClients.size },
    timestamp: new Date().toISOString(),
  });

  req.on("close", () => {
    sseClients.delete(res);
    broadcast({
      type: "connected",
      payload: { clientCount: sseClients.size },
      timestamp: new Date().toISOString(),
    });
  });
});

// POST /tasks
app.post("/tasks", (req: Request, res: Response) => {
  const errors = validateCreateTask(req.body);
  if (errors.length > 0) {
    sendValidationError(res, errors);
    return;
  }

  const body = req.body as CreateTaskInput;
  const task: Task = {
    id: randomUUID(),
    title: body.title.trim(),
    description: (body.description ?? "").trim(),
    status: "todo",
    createdAt: new Date().toISOString(),
  };

  tasks.push(task);

  broadcast({ type: "task:created", payload: task, timestamp: new Date().toISOString() });

  const payload: ApiResponse<Task> = { success: true, data: task, message: "Task created" };
  res.status(201).json(payload);
});

// PATCH /tasks/:id
app.patch("/tasks/:id", (req: Request, res: Response) => {
  const task = tasks.find((t) => t.id === req.params.id);
  if (!task) {
    sendNotFound(res, `Task ${req.params.id} not found`);
    return;
  }

  const body = req.body as UpdateTaskInput;

  if (!body.status || !VALID_STATUSES.includes(body.status)) {
    sendValidationError(res, [
      { field: "status", message: `status must be one of: ${VALID_STATUSES.join(", ")}` },
    ]);
    return;
  }

  task.status = body.status;

  broadcast({ type: "task:updated", payload: { ...task }, timestamp: new Date().toISOString() });

  const payload: ApiResponse<Task> = { success: true, data: { ...task }, message: "Task updated" };
  res.json(payload);
});

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});
