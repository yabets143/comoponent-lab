// Shared API contract types used by both frontend and backend

export interface HealthResponse {
  status: "ok" | "error";
  timestamp: string;
  uptime: number;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  statusCode: number;
}

// Task feature — shared between frontend and backend
export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
}

export interface CreateTaskInput {
  title: string;
  description: string;
}
