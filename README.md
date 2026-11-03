# WorldRadio 🌍📻

Radio global interactiva, gratuita y sin cuentas: explora emisoras de todo el mundo desde un globo 3D o un mapa, con un modo navideño espectacular.

> **Estado:** Fase 1 de 7 (estructura, configuración base, sistema de diseño e iconos). El README completo con capturas, demo y arquitectura llega en la Fase 7.

## Ejecutar en local

### Con Docker
```bash
cp .env.example .env
docker compose up --build
# Frontend: http://localhost:5173   ·   API: http://localhost:8000/docs
```

### Sin Docker
```bash
# Backend (Python 3.12)
cd backend
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
uvicorn app.main:app --reload
pytest -q

# Frontend (Node 20+)
cd frontend
npm install
npm run dev
npm test
```

## Estructura
```
backend/    FastAPI (app/api, models, schemas, services, core) · data · alembic · tests
frontend/   React + TS + Vite + Tailwind (src/components/{ui,icons}, features, hooks, store, lib, styles)
.github/    workflows (ci.yml; sync.yml llega en la Fase 2)
```

## Licencia
MIT. Datos de emisoras: [Radio Browser](https://www.radio-browser.info). Mapas: © OpenStreetMap contributors.
