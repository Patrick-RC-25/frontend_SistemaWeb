# RandomStudy — Frontend

Frontend de RandomStudy desarrollado con Angular 22, Bootstrap 5, Signal Forms y `HttpClient` + Observables. Consume el backend FastAPI del directorio `../backend` y la base SQL Server `RandomStudyDB`.

## Requisitos

Node.js `22.22.3` o superior dentro de la rama 22, npm y el backend configurado.

## Desarrollo

```powershell
npm install
npm start
```

Frontend: http://localhost:4200

Backend: http://localhost:8000/docs

La URL del backend se configura en `src/environments/environment.development.ts` y `environment.ts`.

## Módulos

- Autenticación y perfil.
- Periodos académicos y cursos.
- Evaluaciones y calificaciones.
- Tareas.
- Horarios y sesiones de estudio.
- Objetivos académicos.
- Alertas.
- Dashboard y rendimiento.

Los formularios deben usar Angular Signal Forms. Las peticiones deben realizarse mediante `HttpClient` y Observables. No introducir datos ficticios para completar gráficos o indicadores.
