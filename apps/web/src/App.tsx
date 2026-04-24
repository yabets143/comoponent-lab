import { useState } from "react";
import { Card, CardTitle, CardDescription, Button, Input, Textarea, Badge } from "@component-lab/ui";
import "@component-lab/ui/src/ui.css";
import type { CreateTaskInput } from "@component-lab/types";
import { useTasks, useCreateTask } from "./hooks/useTasks";
import "./App.css";

export default function App() {
  const { data: tasks = [], isLoading, isError, error } = useTasks();
  const createTask = useCreateTask();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const input: CreateTaskInput = { title, description };
    await createTask.mutateAsync(input);
    setTitle("");
    setDescription("");
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⬡ Component Lab</div>
        <span className="badge-header">Monorepo · Day 3</span>
      </header>

      <main className="app-main">
        {/* Create Task — uses shared Card, Input, Textarea, Button */}
        <Card>
          <CardTitle>Create a Task</CardTitle>
          <CardDescription>
            Form built from <code>@component-lab/ui</code>. Data fetching via{" "}
            <code>React Query</code>.
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
              placeholder="Optional details…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={createTask.isPending}
              rows={3}
            />

            {createTask.isError && (
              <p className="inline-error">
                ✗ {(createTask.error as Error).message}
              </p>
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

        {/* Task List */}
        <Card>
          <div className="list-header">
            <CardTitle size="md">Tasks</CardTitle>
            <Badge variant="accent">{tasks.length}</Badge>
          </div>

          {isLoading && <p className="state-msg">Loading…</p>}
          {isError && (
            <p className="inline-error">✗ {(error as Error).message}</p>
          )}
          {!isLoading && tasks.length === 0 && (
            <p className="state-msg muted">No tasks yet — add one above.</p>
          )}

          {tasks.length > 0 && (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
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
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
    </div>
  );
}
