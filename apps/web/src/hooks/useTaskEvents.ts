import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Task, TaskEvent } from "@component-lab/types";
import { apiUrl } from "@component-lab/utils";
import { TASKS_KEY } from "./useTasks";

export interface EventStreamState {
  connected: boolean;
  clientCount: number;
  lastEventType: string | null;
}

export function useTaskEvents(): EventStreamState {
  const qc = useQueryClient();
  const [state, setState] = useState<EventStreamState>({
    connected: false,
    clientCount: 0,
    lastEventType: null,
  });

  useEffect(() => {
    const source = new EventSource(apiUrl("/events"));

    source.onopen = () => {
      setState((s) => ({ ...s, connected: true }));
    };

    source.onerror = () => {
      setState((s) => ({ ...s, connected: false }));
    };

    source.onmessage = (e: MessageEvent<string>) => {
      const event: TaskEvent = JSON.parse(e.data);

      if (event.type === "connected") {
        const p = event.payload as { clientCount: number };
        setState({ connected: true, clientCount: p.clientCount, lastEventType: "connected" });
        return;
      }

      const task = event.payload as Task;
      setState((s) => ({ ...s, lastEventType: event.type }));

      if (event.type === "task:created") {
        // Add to cache only if not already present (avoids duplicate from own optimistic update)
        qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) => {
          if (prev.some((t) => t.id === task.id)) return prev;
          return [task, ...prev];
        });
      }

      if (event.type === "task:updated") {
        qc.setQueryData<Task[]>(TASKS_KEY, (prev = []) =>
          prev.map((t) => (t.id === task.id ? task : t))
        );
      }
    };

    return () => source.close();
  }, [qc]);

  return state;
}
