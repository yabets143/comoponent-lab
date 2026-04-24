import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Task, CreateTaskInput, ApiResponse } from "@component-lab/types";
import { apiUrl } from "@component-lab/utils";

const TASKS_KEY = ["tasks"] as const;

async function fetchTasks(): Promise<Task[]> {
  const res = await fetch(apiUrl("/tasks"));
  if (!res.ok) throw new Error(`Failed to fetch tasks (HTTP ${res.status})`);
  const json: ApiResponse<Task[]> = await res.json();
  return json.data;
}

async function createTask(input: CreateTaskInput): Promise<Task> {
  const res = await fetch(apiUrl("/tasks"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!res.ok) throw new Error(`Failed to create task (HTTP ${res.status})`);
  const json: ApiResponse<Task> = await res.json();
  return json.data;
}

export function useTasks() {
  return useQuery({ queryKey: TASKS_KEY, queryFn: fetchTasks });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Prepend to cached list without a full refetch
      qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) => [newTask, ...prev]);
    },
  });
}
