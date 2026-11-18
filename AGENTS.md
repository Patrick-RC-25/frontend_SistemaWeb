# AGENTS.md — RandomStudy frontend

## Alcance y objetivo

Frontend de RandomStudy, una plataforma de organización y seguimiento académico. Debe ayudar a organizar cursos, evaluaciones, tareas, horarios, sesiones de estudio y objetivos, además de mostrar el rendimiento sin inventar datos que la API no proporciona.

## Stack y convenciones

- Angular 22 con componentes standalone y rutas lazy.
- Bootstrap 5 + Bootstrap Icons + CSS propio basado en variables globales.
- Formularios exclusivamente con Angular Signal Forms (`form`, `FormField`, validadores de `@angular/forms/signals`).
- Peticiones HTTP con `HttpClient` y Observables de RxJS.
- Interfaces de API en español/snake_case; modelos de presentación en camelCase y mappers explícitos.
- Backend FastAPI en `http://localhost:8000`; base de datos SQL Server `RandomStudyDB`.
- No usar Reactive Forms, Template-driven Forms, `ngModel`, `FormGroup`, `FormControl` ni `FormBuilder`.
- No agregar datos simulados para rellenar métricas. Si un dato no existe en la API, mostrarlo como no disponible o dejar explícita la limitación.

## Módulos y rutas

- `/login`, `/registro`: autenticación JWT.
- `/inicio`: resumen real del dashboard y alertas recientes.
- `/cursos`: cursos, metas de nota y evaluaciones.
- `/tareas`: tareas, vencimientos, prioridad y estados.
- `/planificacion`: horarios de clase y sesiones de estudio.
- `/rendimiento`: promedio actual por curso frente a la nota objetivo.
- `/alertas`: alertas no leídas/leídas.
- `/perfil`: perfil y objetivos académicos.

## API real

- Auth: `/auth/register`, `/auth/login`, `/auth/me`, `/auth/logout`.
- Perfil: `GET/PUT /perfil`.
- Periodos: `GET/POST /periodos`.
- Cursos: `GET/POST /cursos`, `GET/PUT/DELETE /cursos/{id}`.
- Evaluaciones: `GET /evaluaciones/curso/{id}`, `POST /evaluaciones`, `PUT/DELETE /evaluaciones/{id}`.
- Horarios: `GET/POST /horarios`, `GET /horarios/curso/{id}`, `PUT/DELETE /horarios/{id}`.
- Tareas: `GET/POST /tareas`, `PUT/DELETE /tareas/{id}`.
- Sesiones: `/sesiones` y acciones `iniciar`, `finalizar`, `cancelar`.
- Objetivos: `GET/POST /objetivos`, `PUT/DELETE /objetivos/{id}`.
- Alertas: `GET/POST /alertas`, `PATCH /alertas/{id}/leida`, `DELETE /alertas/{id}`.
- Dashboard: `GET /dashboard/resumen`.
- Rendimiento: `GET /rendimiento`.

No usar rutas heredadas como `/estudiante`, `/notas` o `/notificaciones`: no existen en el backend actual.

## Datos y reglas importantes

- `Alerta.leida` significa leída, no atendida ni completada. En el frontend usar `read`/`unread`.
- `nota_obtenida: null` significa evaluación todavía sin calificar; no convertirla a cero.
- `promedio_actual: null` significa que todavía no hay calificaciones válidas.
- La API de rendimiento no devuelve historial semanal. No crear gráficos de evolución temporal con valores ficticios; comparar el promedio actual con la nota objetivo.
- `PerfilUsuario.ciclo` es texto (`NVARCHAR(30)`), no necesariamente un número de semestre.
- El backend no persiste preferencias de notificación; no simular un guardado exitoso.
- Cada petición protegida debe enviar `Authorization: Bearer <token>` mediante el interceptor.
- No guardar ni mostrar secretos. El token de acceso se guarda en `localStorage` mediante `AuthService`; mantener esta decisión consciente de sus implicaciones de seguridad.

## SSR y navegador

El `angular.json` actual tiene `ssr: false`. Aun así, mantener el acceso a `localStorage`, `window`, `document`, `confirm` y APIs del navegador limitado a eventos o código protegido por `isPlatformBrowser` cuando sea necesario.

## Comandos

```powershell
npm install
npm start
npm run build
npm test -- --watch=false
```

Angular 22 requiere una versión compatible de Node; con los paquetes fijados en este proyecto, usa Node `22.22.3` o superior dentro de la rama 22.

## Antes de terminar cambios

1. Revisar que DTOs y rutas coincidan con `backend/src/backend/schemas` y `backend/src/backend/apis`.
2. Mantener los mappers y evitar DTOs directamente en templates.
3. Probar `npm run build` y `npm test -- --watch=false`.
4. No afirmar que las pruebas pasan si no se han ejecutado.
