import { useEffect, useState } from "react";
import type { ApiResponse, Task, CreateTaskInput } from "@component-lab/types";
import { apiUrl } from "@component-lab/utils";
import "./App.css";

export default function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [fetchError, setFetchError] = useState("");

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  async function loadTasks() {
    setFetchError("");
    try {
      const res = await fetch(apiUrl("/tasks"));
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse<Task[]> = await res.json();
      setTasks(json.data);
    } catch (err) {
      setFetchError(err instanceof Error ? err.message : "Failed to load tasks");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    setSubmitting(true);
    setSubmitError("");

    const input: CreateTaskInput = { title, description };

    try {
      const res = await fetch(apiUrl("/tasks"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse<Task> = await res.json();
      setTasks((prev) => [json.data, ...prev]);
      setTitle("");
      setDescription("");
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to create task");
    } finally {
      setSubmitting(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">⬡ Component Lab</div>
        <span className="badge">Monorepo · Day 2</span>
      </header>

      <main className="app-main">
        {/* Create Task Form */}
        <section className="card">
          <h1 className="card-title">Create a Task</h1>
          <p className="card-desc">
            Submit data from the frontend, processed by <code>apps/api</code> using the
            shared <code>CreateTaskInput</code> and <code>Task</code> types.
          </p>

          <form className="task-form" onSubmit={handleSubmit}>
            <div className="field">
              <label className="field-label" htmlFor="title">
                Title <span className="required">*</span>
              </label>
              <input
                id="title"
                className="field-input"
                type="text"
                placeholder="e.g. Set up CI pipeline"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={submitting}
                required
              />
            </div>

            <div className="field">
              <label className="field-label" htmlFor="description">
                Description
              </label>
              <textarea
                id="description"
                className="field-input field-textarea"
                placeholder="Optional details…"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={submitting}
                rows={3}
              />
            </div>

            {submitError && (
              <p className="inline-error">✗ {submitError}</p>
            )}

            <button className="btn" type="submit" disabled={submitting || !title.trim()}>
              {submitting ? "Adding…" : "Add Task"}
            </button>
          </form>
        </section>

        {/* Task List */}
        <section className="card">
          <div className="list-header">
            <h2 className="card-title">Tasks</h2>
            <span className="count-badge">{tasks.length}</span>
          </div>

          {fetchError && <p className="inline-error">✗ {fetchError}</p>}

          {tasks.length === 0 && !fetchError ? (
            <p className="empty-state">No tasks yet — add one above.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="task-meta">
                    <span className={`task-status status-${task.status}`}>
                      {task.status}
                    </span>
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
        </section>
      </main>
    </div>
  );
}
