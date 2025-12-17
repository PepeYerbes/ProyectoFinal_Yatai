```
ecommerce-app/
├─ src/
  │─ app/
  │ ├─ core/ # Servicios base (auth, http, theme)
  │ ├─ shared/ # Utils/guards/interceptors/models
  │ ├─ ui/ # Nuestro mini Design System (botón, input, card…)
  │ ├─ features/
  │ │ ├─ auth/ # login/registro
  │ │ ├─ catalog/ # listado/búsqueda productos
  │ │ ├─ cart/ # carrito
  │ │ └─ profile/ # perfil protegido
  │ └─ app.routes.ts
  │─ styles.css # tokens + temas + utilidades
  │─ main.ts
```
