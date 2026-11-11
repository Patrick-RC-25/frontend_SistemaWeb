# AGENTS.md — CarlitoApp Frontend

## 1. Project purpose

CarlitoApp is a free web platform intended to help university students in Huancayo organize their academic activities, monitor their performance, prioritize pending work, and reduce the risk of academic overload.

The frontend should provide a clear and usable experience for:
- Reviewing an academic overview and priorities.
- Consulting courses and grades.
- Monitoring academic performance and goals.
- Organizing study sessions.
- Reviewing alerts.
- Managing profile information and notification preferences.

The application is a planning and organization aid. Do not describe it as a replacement for academic advising or mental-health support.

## 2. Current development scope

**Current phase: frontend only.**

The immediate goal is to finish the visual interface and client-side interactions using local mock data.

Do not implement any of the following until the user explicitly starts the backend/integration phase:
- FastAPI application or Python backend.
- REST endpoints or HTTP requests.
- Pydantic schemas, repositories, or backend services.
- Database models, migrations, or database connections.
- Real authentication, authorization, or token management.

OpenCode will be used later to help connect the Angular frontend with the backend and assist with integration. Do not start that integration on your own.

## 3. Technology stack

- Angular 22, standalone components, and TypeScript.
- Angular Router for navigation.
- Angular Signals for reactive client-side state.
- Angular Signal Forms (`@angular/forms/signals`) for forms and validation.
- Bootstrap 5 for layout and common UI elements.
- Bootstrap Icons for icons.
- Custom CSS for the CarlitoApp visual identity and components.
- Chart.js for academic performance charts.
- SweetAlert2 for toast messages and confirmations.
- Angular SSR/hydration is enabled; preserve the existing SSR setup.

Bootstrap and Bootstrap Icons are imported from `src/styles.css`. Do not add Tailwind or a second icon library unless the user requests a deliberate stack change.

## 4. Application architecture

The frontend is organized by feature:

- `src/app/core/`: application-wide services and guards. `MockDataService` is the current local data source.
- `src/app/shared/`: reusable UI components and shared interfaces.
- `src/app/layout/`: authenticated application shell and global navigation.
- `src/app/features/`: pages, interfaces, and services grouped by feature.
- `src/styles/`: global variables, reusable component styles, and utilities.

Each feature should keep its own:
- `pages/`: route-level screens.
- `components/`: feature-specific reusable components, when needed.
- `interfaces/`: TypeScript data contracts.
- `services/`: feature logic and access to the mock data source.

Do not put business/data logic directly in page templates. Pages should coordinate presentation and user interaction; feature services should provide data and operations.

### Current routes

- `/login`
- `/inicio`
- `/alertas`
- `/cursos`
- `/rendimiento`
- `/planificacion`
- `/perfil`

The authenticated routes are grouped under `MainLayout`. Route guards currently use simulated in-memory authentication.

## 5. Mock data and future integration

`src/app/core/services/mock-data.service.ts` is the single local source of mock student, course, grade, alert, study-session, goal, and notification data.

Feature services consume that source:
- `features/auth/services/auth.service.ts`
- `features/alerts/services/alerts.service.ts`
- `features/courses/services/courses.service.ts`
- `features/dashboard/services/dashboard.service.ts`
- `features/performance/services/performance.service.ts`
- `features/planner/services/planner.service.ts`
- `features/profile/services/profile.service.ts`

Keep mock data realistic and internally consistent. Reuse the TypeScript interfaces in each feature rather than duplicating object shapes.

When backend integration is authorized later, replace the mock data access inside services with HTTP calls. Keep components focused on the UI so they do not need to be rewritten.

The login is only a demonstration flow. It is not secure authentication and must not be presented as production-ready. Current demo credentials:
- Email: `demo@carlito.app`
- Password: `demo`

The demo session is in-memory and is not persisted, which avoids browser-storage access during SSR/hydration. Real session persistence belongs to the future authentication integration phase.

## 6. Coding conventions

- Use standalone Angular components.
- Use lazy `loadComponent` routes where appropriate.
- Use Angular Signals (`signal`, `computed`, `effect`) for local reactive state.
- Use Signal Forms for all new forms.
- Do not use `FormsModule`, `ReactiveFormsModule`, `ngModel`, `FormGroup`, `FormControl`, or `FormBuilder`.
- Keep templates declarative; put calculations and event handling in the component or feature service.
- Use typed interfaces for component inputs, outputs, and mock data.
- Prefer clear names and small methods.
- Keep shared components generic; feature-specific behavior belongs in the feature.
- Maintain responsive behavior for desktop, tablet, and mobile.
- Use accessible labels, button types, and meaningful status text.
- Avoid introducing dependencies when existing Angular, Bootstrap, Chart.js, or SweetAlert2 functionality is sufficient.

## 7. SSR and browser-only APIs

SSR and hydration are enabled. Do not access `window`, `document`, `localStorage`, `sessionStorage`, or browser-only APIs during server-side initialization.

When a browser-only API is genuinely required, guard it with Angular's platform utilities such as `isPlatformBrowser`, and ensure the server and initial client render remain compatible.

Chart.js rendering must occur only in the browser after the view is available. Keep chart instances destroyed when components are destroyed.

## 8. Visual implementation workflow

When implementing or revising a screen:
1. Inspect the existing page and shared components first.
2. Preserve the current visual language and responsive layout.
3. Reuse existing shared components such as `PageHeader`, `StatCard`, `ProgressBar`, `AlertCard`, and `EmptyState`.
4. Keep all page data in typed mock objects/services.
5. Implement interactions with Signals and feature services.
6. Check empty, loading, validation, and success states where relevant.
7. Verify navigation and mobile layout.
8. Do not add backend assumptions or HTTP dependencies.

## 9. Current modules

- **Login:** demo sign-in and client-side validation.
- **Inicio:** academic summary, recommendation, goal progress, priority alerts.
- **Alertas:** alert list, filters, and mark-as-attended interaction.
- **Cursos:** course list, selected course details, grades, and averages.
- **Rendimiento:** academic summary, course performance, and weekly Chart.js graph.
- **Planificación:** create, filter, complete, and cancel study sessions.
- **Perfil:** edit profile data, academic goals, notification preferences, and sign out.

Some data and interactions are still demonstrative. Do not assume that a displayed sample is a verified real university record.

## 10. Running the frontend

From the project root:

```bash
npm install
npm start
```

The Angular development server normally runs at `http://localhost:4200`.

Useful scripts:
- `npm start`: run the development server.
- `npm run build`: production build.
- `npm run watch`: development build in watch mode.
- `npm test`: run tests.

The repository archive may not include `node_modules` or `package-lock.json`; run `npm install` to install dependencies and generate the lockfile if needed.

## 11. Instructions for future AI coding agents

Before changing code:
- Read this file and inspect the relevant feature files.
- Confirm the task is within the frontend-only phase.
- Do not create backend files or connect to an API unless explicitly instructed.
- Do not replace the existing architecture or visual design wholesale.
- Prefer small, coherent changes and explain which files were changed.
- After changes, check imports, types, templates, responsive behavior, and build/test results when dependencies are available.
- Never claim that a build or test passed unless it was actually executed successfully.
