# Nexa CRM (MERN Refactor Seed)

Este repositorio implementa un **MVP sólido** del prompt solicitado: stack **MERN** con mejoras de UX/IA y despliegue sencillo en **Render.com**.

## Quick start (local)
```bash
# 1) Backend
cd server
cp .env.example .env     # edita MONGODB_URI
npm i
npm run dev

# 2) Frontend
cd ../client
npm i
npm run dev
```

- Frontend: http://localhost:5173
- Backend:  http://localhost:4000
- Login: crea un usuario con `POST /api/auth/register` (o usa /seed).

## Despliegue en Render.com
- Sube este repo a GitHub.
- Usa el `render.yaml` (en la raíz) para crear:
  - **nexa-crm-api** (Node)
  - **nexa-crm-web** (Static Site con el build de Vite)
- Variables obligatorias en el servicio **api**:
  - `MONGODB_URI`, `JWT_SECRET`, `CLIENT_ORIGIN`
- Build commands vienen en el YAML. El frontend expondrá la UI y el backend quedará público con CORS controlado.

## Características incluidas
- **React (Vite)** + **Recharts** + **tema oscuro/claro** + **responsive** + **react-icons**.
- **Dashboard** con KPIs y gráficos (línea/embudo/pastel).
- **Pipeline** con **drag & drop** (react-beautiful-dnd) que persiste etapas.
- **Notificaciones en tiempo real** con **Socket.io** (tareas vencidas, nuevas asignaciones).
- **API Express** con paginación, seguridad básica (JWT + roles), validación y manejo de errores uniforme.
- **Mongoose** esquemas optimizados con índices.
- **Lead Scoring** sencillo (actividad/recencia) y endpoints de IA “plug-and-play”.
- **Google Calendar**: endpoints stub e instrucciones para OAuth (comentado).
- Código modular, comentado y listo para extender.

> Este repo está pensado como base para que el equipo avance rápido. No usa TypeScript por simplicidad, pero la estructura está preparada para migrarlo.
