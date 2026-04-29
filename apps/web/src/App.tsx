import { useState } from "react";
import {
  Card,
  CardTitle,
  CardDescription,
  Button,
  Input,
  Textarea,
  Badge,
  Alert,
  SkeletonTaskItem,
  ConnectionStatus,
} from "@component-lab/ui";
import "@component-lab/ui/src/ui.css";
import type { CreateTaskInput, TaskStatus } from "@component-lab/types";
import { useTasks, useCreateTask, useUpdateTaskStatus } from "./hooks/useTasks";
import { useTaskEvents } from "./hooks/useTaskEvents";
import "./App.css";

const STATUS_CYCLE: Record<TaskStatus, TaskStatus> = {
  "todo": "in-progress",
  "in-progress": "done",
  "done": "todo",
};

const STATUS_LABEL: Record<TaskStatus, string> = {
  "todo": "Mark in-progress →",
  "in-progress": "Mark done →",
  "done": "Reset →",
};

export default function App() {
  const { data: tasks = [], isLoading, isError, error, refetch } = useTasks();
  const createTask = useCreateTask();
  const updateStatus = useUpdateTaskStatus();
  const stream = useTaskEvents();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const input: CreateTaskInput = { title, description };
    try {
      await createTask.mutateAsync(input);
      setTitle("");
      setDescription("");
    } catch {
      // error surfaced via createTask.isError
    }
  }

  function handleStatusCycle(id: string, current: TaskStatus) {
    updateStatus.mutate({ id, status: STATUS_CYCLE[current] });
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⬡ Component Lab</div>
        <span className="badge-header">Monorepo · Day 5</span>
        <div className="header-right">
          <ConnectionStatus
            connected={stream.connected}
            clientCount={stream.clientCount}
          />
        </div>
      </header>

      <main className="app-main">
        {/* ── Create Task ── */}
        <Card>
          <CardTitle>Create a Task</CardTitle>
          <CardDescription>
            Tasks appear instantly via <code>optimistic UI</code> and are
            broadcast in real-time to all connected tabs via{" "}
            <code>Server-Sent Events</code>.
          </CardDescription>

          <form className="task-form" onSubmit={handleSubmit}>
            <Input
              label="Title"
              placeholder="e.g. Set up CI pipeline"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={createTask.isPending}
              required
            />
            <Textarea
              label="Description"
              placeholder="Optional — max 500 chars"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createTask.isPending}
              rows={3}
            />

            {createTask.isError && (
              <Alert variant="error" dismissible>
                {(createTask.error as Error).message}
              </Alert>
            )}

            {createTask.isSuccess && (
              <Alert variant="success" dismissible>
                Task added!
              </Alert>
            )}

            <Button
              type="submit"
              loading={createTask.isPending}
              disabled={!title.trim()}
            >
              Add Task
            </Button>
          </form>
        </Card>

        {/* ── Task List ── */}
        <Card>
          <div className="list-header">
            <CardTitle size="md">Tasks</CardTitle>
            <Badge variant="accent">{tasks.length}</Badge>
          </div>

          {isLoading && (
            <ul className="task-list">
              {[1, 2, 3].map((n) => (
                <li key={n}>
                  <SkeletonTaskItem />
                </li>
              ))}
            </ul>
          )}

          {isError && (
            <Alert variant="error" onRetry={() => refetch()}>
              {(error as Error).message}
            </Alert>
          )}

          {!isLoading && !isError && tasks.length === 0 && (
            <p className="state-msg muted">No tasks yet — add one above.</p>
          )}

          {tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => {
                const isOptimistic = task.id.startsWith("optimistic-");
                return (
                  <li
                    key={task.id}
                    className={`task-item ${isOptimistic ? "task-item--pending" : ""}`}
                  >
                    <div className="task-meta">
                      <Badge
                        variant={
                          task.status === "done"
                            ? "success"
                            : task.status === "in-progress"
                            ? "accent"
                            : "default"
                        }
                      >
                        {task.status}
                      </Badge>
                      <span className="task-date">
                        {new Date(task.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="task-title">{task.title}</p>
                    {task.description && (
                      <p className="task-desc">{task.description}</p>
                    )}

                    {!isOptimistic && (
                      <Button
                        variant="ghost"
                        className="task-cycle-btn"
                        onClick={() => handleStatusCycle(task.id, task.status)}
                        disabled={updateStatus.isPending}
                      >
                        {STATUS_LABEL[task.status]}
                      </Button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
