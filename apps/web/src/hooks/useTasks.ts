import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type {
  Task,
  TaskStatus,
  CreateTaskInput,
  UpdateTaskInput,
  ApiResponse,
  ApiValidationError,
} from "@component-lab/types";
import { apiUrl } from "@component-lab/utils";

export const TASKS_KEY = ["tasks"] as const;

// ── API functions ─────────────────────────────────────────

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(apiUrl("/tasks"));
  if (!res.ok) throw new Error(`Failed to load tasks (HTTP ${res.status})`);
  const json: ApiResponse<Task[]> = await res.json();
  return json.data;
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(apiUrl("/tasks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const err: ApiValidationError = await res.json();
    const detail = err.details?.[0];
    throw new Error(detail ? `${detail.field}: ${detail.message}` : err.error);
  }

  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

async function updateTaskStatus(id: string, status: TaskStatus): Promise<Task> {
  const body: UpdateTaskInput = { status };
  const res = await fetch(apiUrl(`/tasks/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err: ApiValidationError = await res.json();
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }

  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

// ── Hooks ─────────────────────────────────────────────────

export function useTasks() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: fetchTasks });
}

export function useCreateTask() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: createTask,

    // Optimistic: add a temporary task immediately
    onMutate: async (input: CreateTaskInput) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);

      const optimistic: Task = {
        id: `optimistic-${Date.now()}`,
        title: input.title,
        description: input.description ?? "",
        status: "todo",
        createdAt: new Date().toISOString(),
      };

      qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) => [optimistic, ...prev]);
      return { previous, optimisticId: optimistic.id };
    },

    // Replace optimistic task with real server response
    onSuccess: (serverTask, _input, context) => {
      qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) =>
        prev.map((t) => (t.id === context?.optimisticId ? serverTask : t))
      );
    },

    // Roll back on failure
    onError: (_err, _input, context) => {
      if (context?.previous) {
        qc.setQueryData(TASKS_KEY, context.previous);
      }
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      updateTaskStatus(id, status),

    // Optimistic: flip the status immediately
    onMutate: async ({ id, status }) => {
      await qc.cancelQueries({ queryKey: TASKS_KEY });
      const previous = qc.getQueryData<Task[]>(TASKS_KEY);

      qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) =>
        prev.map((t) => (t.id === id ? { ...t, status } : t))
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      if (context?.previous) {
        qc.setQueryData(TASKS_KEY, context.previous);
      }
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: TASKS_KEY });
    },
  });
}
