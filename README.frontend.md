## Frontend (React + Vite + TypeScript)

### Requisitos
- Node.js 18+

### Instalación
```bash
cd Frontend
npm install
cp .env.example .env 2>NUL || copy .env.example .env
npm run dev   # Vite http://localhost:3000 (o 3001)
```

### Scripts
| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Dev server (Vite) |
| `npm run build` | Build producción (`build/`) |
| `npm run preview` | Servir build local |
| `npm test` | Vitest tests |
| `npm run lint` | ESLint + TS |

### PWA
Service Worker en `public/sw.js` (solo producción). Lógica en `src/utils/pwa.ts` gestiona registro/desregistro.

### Rutas Clave
`/login`, `/dashboard`, `/products`, `/customers`, `/sales`, `/finances`, `/pricing-analysis`, `/marketing-analytics`, `/business-intelligence`.

### Estado / Data
- AuthContext (`src/contexts/AuthContext.tsx`)
- API Axios (`src/utils/api.ts`, `src/utils/salesApi.ts`)

### Accesibilidad
Sistema de alto contraste (`btn-high-contrast-*`) y salvaguarda automática para texto blanco (`--contrasted-white`).

### Variables .env ejemplo
```
VITE_API_URL=http://localhost:8000
VITE_API_BASE_URL=http://localhost:8000/api
```

### Build Producción
```bash
npm run build
npm run preview
```

### Mejoras Futuras
- Storybook + pruebas visuales
- Bundle analyzer (rollup-plugin-visualizer)
- Internationalización (i18n)
