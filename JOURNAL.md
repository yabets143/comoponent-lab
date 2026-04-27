# Monorepo Project Journal

---

## Day 1 — Thursday, April 17 (Monorepo Foundation)

### What I Built

Today, I set up the foundation of the monorepo. I chose Turborepo to quickly organize multiple apps and shared packages in a single repository.

I structured the project into:

* `apps/web` for the React frontend
* `apps/api` for the Express backend
* `packages/types`, `packages/utils`, and `packages/ui` for shared logic

I implemented a simple `/health` endpoint in the backend and tested connectivity by making a request from the frontend. I also introduced shared types to ensure both layers used the same contract.

### What I Tried

I started by manually wiring together two separate projects before realizing a monorepo structure would make sharing code much easier.

I also tried a flat file structure before settling on the `apps/` and `packages/` separation that Turborepo recommends.

### What Didn't Work

Sharing code between the frontend and backend without a proper package structure caused import errors and duplicated type definitions.

### Problems I Faced

* Deciding how to structure the monorepo workspace
* Making TypeScript resolve internal packages correctly
* Getting the frontend to communicate with the backend during development

### How I Solved Them

I used npm workspaces alongside Turborepo so each package could reference others using `@component-lab/*` imports.

I configured a shared `tsconfig.base.json` that all apps and packages extend, keeping TypeScript settings consistent across the whole repo.

### Key Insight

Starting with a shared type package from day one prevents the frontend and backend from drifting out of sync. A single source of truth for types makes the entire system more predictable.

### Next Step

Build a real interaction between the frontend and backend using a shared data model.

---

## Day 2 — Sunday, April 20 (Core Interaction Flow)

### What I Built

Today, I focused on building a real interaction between the frontend and backend.

I created a task feature where:

* The frontend submits a new task via a form
* The backend processes the request and returns the created task
* The UI updates dynamically to show the new entry

I enforced the shared `Task` and `CreateTaskInput` types across both layers to keep the data contract consistent.

### What I Tried

I initially sent raw JSON from the frontend without using any shared types, relying on the backend to figure out the shape.

### What Didn't Work

Sending untyped JSON caused subtle mismatches between what the frontend sent and what the backend expected, resulting in silent failures and missing data.

### Problems I Faced

* Keeping the request and response shapes consistent between frontend and backend
* Handling the case where the backend returned an error without crashing the UI
* Deciding what the shared type contract should look like

### How I Solved Them

I defined `Task`, `CreateTaskInput`, and `ApiResponse<T>` in `packages/types` and imported them in both `apps/api` and `apps/web`.

This meant any change to the data shape would immediately surface as a TypeScript error on both sides, rather than a runtime bug.

### Key Insight

Shared TypeScript types are not just a convenience — they are a compile-time contract between two systems. Enforcing them from the start eliminates an entire category of integration bugs.

### Next Step

Extract reusable UI components into a shared package and introduce a proper data-fetching layer.

---

## Day 3 — Thursday, April 24 (Component Architecture)

### What I Built

Today, I moved toward building a reusable and scalable system.

I extracted UI components into the shared `packages/ui` package, including:

* `Button` with `primary`, `ghost`, and `danger` variants
* `Card`, `CardTitle`, and `CardDescription` for layout
* `Input` and `Textarea` form elements with built-in labels
* `Badge` for status indicators

I then replaced all inline markup in `apps/web` with these shared components.

I also introduced React Query to manage server state, replacing raw `useState` + `fetch` logic with `useTasks` and `useCreateTask` hooks.

### What I Tried

I initially kept all components inline in the app and managed data fetching with `useEffect` and local state.

### What Didn't Work

Inline components made it hard to maintain consistency across the app. Managing loading and error states manually with `useEffect` was verbose and error-prone.

### Problems I Faced

* Deciding where the boundary between app logic and shared UI components should be
* Setting up React Query without overcomplicating the data layer
* Making shared components flexible enough to reuse without building a full design system

### How I Solved Them

I kept the shared UI components stateless and prop-driven, with CSS variables for theming so they work in any context without importing app-specific styles.

React Query's `useQuery` and `useMutation` hooks replaced all manual fetch logic, giving loading, error, and success states for free.

### Key Insight

Decoupling UI components from application logic makes both easier to change independently. Once components live in a shared package, consistency across the app becomes automatic rather than manual.

### Next Step

Improve system behavior under real-world conditions by adding proper error handling, loading states, and optimistic UI updates.

---

## Day 4 — Monday, April 27 (Advanced Interaction)

### What I Built

Today, I focused on improving how the system behaves under real-world conditions.

I implemented:

* Loading skeleton states for all API interactions
* Structured error handling on both frontend and backend
* Optimistic UI updates to improve responsiveness
* A `PATCH /tasks/:id` endpoint to update task status

On the backend, I added a validation layer and consistent error responses to ensure predictable behavior when requests fail.

I also added two new shared components to `packages/ui`:

* `SkeletonTaskItem` — shimmer placeholder shown while the list loads
* `Alert` — dismissable message with `error`, `warning`, `success`, and `info` variants, plus an optional retry callback

### What I Tried

I initially handled API calls without proper loading or error states, which made the UI feel unresponsive and unclear during failures.

I also experimented with basic error handling, but it was inconsistent across different endpoints.

### What Didn't Work

Without structured error handling, the frontend could not properly interpret failures, which led to poor user feedback.

Optimistic updates initially caused UI inconsistencies when requests failed, because there was no rollback mechanism.

### Problems I Faced

* Managing UI state during asynchronous operations
* Handling failed requests gracefully
* Keeping the UI consistent when optimistic updates fail
* Standardizing error responses across all backend endpoints

### How I Solved Them

I introduced a consistent `ApiError` and `ApiValidationError` response format on the backend and ensured all endpoints follow it.

On the frontend, I added skeleton loading states and `Alert` components for all request outcomes.

For optimistic updates, I implemented `onMutate` to snapshot previous state and `onError` rollback logic to restore it if the request fails.

### Key Insight

Handling failure states properly is just as important as handling success. A system that behaves predictably under failure is significantly more reliable than one that only handles the happy path.

### Next Step

Implement real-time updates to move beyond request-response interaction and improve system responsiveness.
