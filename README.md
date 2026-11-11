# CarlitoApp — Frontend

## Alcance de esta etapa

Este repositorio contiene únicamente el frontend de CarlitoApp. El objetivo inmediato es terminar la experiencia visual y las interacciones de la aplicación web antes de iniciar el backend.

- Framework: Angular 22 con TypeScript.
- Estilos: Bootstrap 5, Bootstrap Icons y CSS personalizado.
- Formularios: Angular Signal Forms.
- Navegación: Angular Router.
- Gráficos: Chart.js.
- Mensajes y confirmaciones: SweetAlert2.
- Datos: información simulada centralizada en `MockDataService` y consumida mediante servicios de cada módulo.

## Módulos del frontend

- Inicio de sesión (simulado).
- Inicio / Dashboard.
- Alertas.
- Cursos y calificaciones.
- Rendimiento académico.
- Planificación de sesiones de estudio.
- Perfil, objetivos y preferencias.

## Fuera del alcance actual

No implementar todavía FastAPI, endpoints, autenticación real, base de datos, repositorios, modelos Pydantic ni conexión HTTP. La integración con el backend se realizará en una etapa posterior, con OpenCode como herramienta de apoyo.

## Desarrollo local

```bash
npm install
npm start
```

Si el proyecto no tiene el script `start`, ejecutar:

```bash
ng serve
```

La aplicación se sirve normalmente en `http://localhost:4200`.
