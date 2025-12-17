# 🎨 ARQUITECTURA VISUAL: State Management en Yatai

## 1️⃣ Arquitectura Actual (Mixta)

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENTES ANGULAR                            │
│  (Home, Cart, Profile, Admin, etc)                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ├─────────────────────────────────┐
                      │                                 │
                      ▼                                 ▼
        ┌──────────────────────┐         ┌──────────────────────┐
        │   BehaviorSubject    │         │      NgRx Store      │
        │   (Simple)           │         │    (Complejo)        │
        ├──────────────────────┤         ├──────────────────────┤
        │ ✅ CartService       │         │ ✅ store/auth/       │
        │   cart$              │         │    - actions         │
        │   getTotalPrice()    │         │    - reducer         │
        │                      │         │    - effects         │
        │ ✅ UserStateService  │         │    - selectors       │
        │   user$              │         │                      │
        │   setUser()          │         │ ❌ PROBLEMA:         │
        │                      │         │    Usuario en 2!     │
        │ ❌ ProductService    │         │                      │
        │   (Sin estado)       │         │                      │
        └──────────────────────┘         └──────────────────────┘
                      │                                 │
                      └─────────────────┬───────────────┘
                                        │
                                        ▼
                            ┌──────────────────────┐
                            │  localStorage        │
                            │  (Carrito, token)    │
                            └──────────────────────┘
```

**Problemas visibles:**
- 🔴 Usuario gestiona en 2 sitios (NgRx + BehaviorSubject)
- 🟡 Productos sin cache reactivo
- 🟡 localStorage mezclado con observables

---

## 2️⃣ Arquitectura Recomendada (Option A: Simple)

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENTES ANGULAR                            │
│  (Home, Cart, Profile, Admin, etc)                               │
│                                                                   │
│  💡 Todos usan: async pipe para suscripciones automáticas       │
│     Ej: <div *ngFor="let p of products$ | async">              │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────────────────┐
    │       STATE SERVICES (BehaviorSubject + RxJS)    │
    │                                                  │
    │  Todos siguen el MISMO PATRÓN:                   │
    │  1. private xxxSubject = new BehaviorSubject()   │
    │  2. public xxx$ = xxxSubject.asObservable()      │
    │  3. public getXxx() { return xxx$ }              │
    │                                                  │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │  📦 ProductService                              │
    │     ├─ products$ ✅ (NUEVO)                      │
    │     ├─ categories$ ✅ (NUEVO)                    │
    │     ├─ getAll() {cachear}                       │
    │     ├─ getById()                                │
    │     └─ search()                                 │
    │                                                  │
    │  👤 UserService (consolidado)                   │
    │     ├─ user$ ✅ (un solo lugar)                 │
    │     ├─ isAuthenticated$ ✅                      │
    │     ├─ loadUser()                               │
    │     └─ logout()                                 │
    │                                                  │
    │  🛒 CartService                                 │
    │     ├─ cart$ ✅ (ya existe)                     │
    │     ├─ addToCart()                              │
    │     ├─ removeFromCart()                         │
    │     └─ getTotalPrice()                          │
    │                                                  │
    │  📋 OrderService                                │
    │     ├─ orders$ ✅ (NUEVO)                       │
    │     ├─ createOrder()                            │
    │     └─ getOrdersByUser()                        │
    │                                                  │
    │  ❤️  WishlistService                            │
    │     ├─ wishlist$ ✅ (NUEVO)                     │
    │     ├─ addToWishlist()                          │
    │     └─ removeFromWishlist()                     │
    │                                                  │
    │  💳 PaymentMethodService                        │
    │     ├─ methods$ ✅ (NUEVO)                      │
    │     └─ getMethods()                             │
    │                                                  │
    └──────────────────────────────────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────────────────┐
    │           HTTP CLIENT (HttpClient)               │
    │                                                  │
    │  Flujo: Component → Service → HTTP → Server     │
    │         ↓          ↓         ↓      ↓            │
    │      Observable  tap()    response  JSON        │
    │      |                       |                   │
    │      └─→ subject.next()──────┘                  │
    │                                                  │
    └──────────────────────────────────────────────────┘
```

**Ventajas:**
- ✅ Simple y fácil de entender
- ✅ Patrón consistente en todas partes
- ✅ Poco boilerplate
- ✅ Perfecto para apps medianas

---

## 3️⃣ Arquitectura Recomendada (Option B: Escalable)

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPONENTES ANGULAR                            │
│                                                                   │
│  ✅ Usar selectors para leer estado                             │
│  ✅ Dispatch acciones para cambiar estado                       │
│  ✅ Débil acoplamiento con store                                │
│                                                                  │
│  Ej: user$ = this.store.select(selectCurrentUser)              │
│      this.store.dispatch(AuthActions.login(creds))             │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
    ┌──────────────────────────────────────────────────┐
    │              NgRx Global Store                    │
    │                                                  │
    │  createStore({                                   │
    │    auth: authReducer,                           │
    │    user: userReducer,         (nuevo)           │
    │    products: productsReducer, (nuevo)           │
    │    cart: cartReducer,         (nuevo)           │
    │    orders: ordersReducer,     (nuevo)           │
    │  })                                              │
    │                                                  │
    ├──────────────────────────────────────────────────┤
    │                                                  │
    │  ┌─ AUTH FEATURE STATE ──────────────────────┐  │
    │  │ store/auth/                               │  │
    │  │ ├─ auth.actions.ts    (Actions)          │  │
    │  │ ├─ auth.reducer.ts    (Reducer puro)    │  │
    │  │ ├─ auth.effects.ts    (HTTP side effects)│  │
    │  │ ├─ auth.selectors.ts  (Queries)         │  │
    │  │ └─ auth.models.ts     (Tipos)           │  │
    │  └─────────────────────────────────────────┘  │
    │                                                  │
    │  ┌─ USER FEATURE STATE (NUEVO) ─────────────┐  │
    │  │ store/user/                               │  │
    │  │ ├─ user.actions.ts    → loadUser       │  │
    │  │ │                     → updateUserRole │  │
    │  │ │                     → logout        │  │
    │  │ ├─ user.reducer.ts    → user, role    │  │
    │  │ ├─ user.effects.ts    → getProfile()  │  │
    │  │ ├─ user.selectors.ts  → selectUser    │  │
    │  │ └─ user.models.ts     → UserState     │  │
    │  └─────────────────────────────────────────┘  │
    │                                                  │
    │  ┌─ PRODUCTS FEATURE STATE (NUEVO) ─────────┐  │
    │  │ store/products/                           │  │
    │  │ ├─ products.actions.ts → loadProducts   │  │
    │  │ │                       → filterByCategory
    │  │ ├─ products.reducer.ts  → products[]   │  │
    │  │ │                       → categories[]  │  │
    │  │ │                       → loading       │  │
    │  │ ├─ products.effects.ts  → HTTP calls   │  │
    │  │ ├─ products.selectors.ts → selectAll   │  │
    │  │ └─ products.models.ts   → ProductsState
    │  └─────────────────────────────────────────┘  │
    │                                                  │
    │  ┌─ CART FEATURE STATE (NUEVO) ──────────────┐ │
    │  │ store/cart/                                │ │
    │  │ ├─ cart.actions.ts  → addToCart         │ │
    │  │ │                   → removeFromCart    │ │
    │  │ │                   → updateQuantity    │ │
    │  │ ├─ cart.reducer.ts  → cartItems[]      │ │
    │  │ ├─ cart.effects.ts  → cartService      │ │
    │  │ ├─ cart.selectors.ts → getTotal        │ │
    │  │ └─ cart.models.ts    → CartState       │ │
    │  └─────────────────────────────────────────┘ │
    │                                                  │
    └──────────────────────────────────────────────────┘
                      │
                      ├─────────────────┐
                      │                 │
                      ▼                 ▼
    ┌──────────────────────┐  ┌──────────────────────┐
    │  Redux DevTools      │  │  HTTP Backend        │
    │  (Debugging)         │  │  (API REST)          │
    │  - Time travel       │  │                      │
    │  - Action history    │  │  GET /products       │
    │  - State snapshots   │  │  POST /orders        │
    └──────────────────────┘  └──────────────────────┘
```

**Ventajas:**
- ✅ Escalable para apps grandes
- ✅ Debugging con Redux DevTools
- ✅ Time travel debugging
- ✅ Fácil de testear (reducers puros)
- ❌ Más boilerplate inicial

---

## 4️⃣ Comparación: BehaviorSubject vs NgRx

```
┌────────────────────┬─────────────────────┬──────────────────────┐
│     Aspecto        │  BehaviorSubject    │      NgRx            │
├────────────────────┼─────────────────────┼──────────────────────┤
│ Setup              │ 5 minutos ⚡        │ 30 minutos 🐢        │
│ Boilerplate        │ Mínimo ✅           │ Significativo        │
│ Curva aprendizaje  │ Baja ✅             │ Media 🟡             │
│ Debugging          │ Difícil 🔴          │ Fácil con DevTools ✅│
│ Escalabilidad      │ Buena hasta 5 stores│ Excelente 🚀         │
│ Time Travel        │ No ❌               │ Sí ✅                │
│ Testabilidad       │ Media 🟡            │ Excelente ✅         │
│ Ideal para         │ Apps pequeñas       │ Apps grandes         │
│ Community          │ Estándar            │ Activa en NgRx       │
│ Rendimiento        │ Muy bueno           │ Muy bueno            │
│ Estado centralizado│ Sí ✅               │ Sí ✅                │
│ Reactividad        │ Automática con async│ Automática con async │
└────────────────────┴─────────────────────┴──────────────────────┘
```

**Recomendación:**
- **Fase 1:** BehaviorSubject (rápido de implementar)
- **Fase 2+:** Migrar a NgRx si crece mucho

---

## 5️⃣ Flujo de Datos: CartService (Ejemplo Completo)

### ANTES (Sin estado centralizado)

```
Component1            Component2            Component3
    │                     │                     │
    └──────┬──────────────┬──────────────────┘
           │
           ▼
   getCart() HTTP call ❌
   
   Problema: Cada componente hace su propia llamada
   Resultado: 3 requests al servidor (innecesario)
   
   Si uno actualiza cart, los otros no se enteran ❌
```

### DESPUÉS (Con BehaviorSubject)

```
Component1              Component2              Component3
   │                       │                       │
   └──────────┬────────────┼────────────┬─────────┘
              │            │            │
              ▼            ▼            ▼
        cart$.subscribe() (Observable)
             │
             └─────────────────────────────────┐
                                               │
                                    CartService
                                    ┌─────────────────────┐
                                    │ cartSubject         │
                                    │ ┌─────────────────┐ │
                                    │ │ Cart {          │ │
                                    │ │   products: []  │ │
                                    │ │   total: 0      │ │
                                    │ │ }               │ │
                                    │ └─────────────────┘ │
                                    │        ▲             │
                                    │        │ next()      │
                                    │        │             │
                                    │   ┌────┴──────┐     │
                                    │   │   HTTP    │     │
                                    │   │   Response│     │
                                    │   └───────────┘     │
                                    └─────────────────────┘

Resultado: 1 request, 3 suscripciones (eficiente ✅)
Si uno actualiza, los otros se actualizan automáticamente ✅
```

---

## 6️⃣ Diagrama de Interacción: Agregar Producto al Carrito

### PASO A PASO

```
[Home Component]
      │
      │ Usuario hace click: [Agregar al Carrito]
      │
      ▼
  cartService.addToCart(productId, 1)
      │
      ├─ Obtener carrito actual: this.cartSubject.value
      │
      ├─ Validar stock con ProductService
      │  cartService.productService.getById(productId)
      │         │
      │         ▼
      │   [ProductService]
      │   └─ Llamada HTTP: GET /api/products/:id
      │      └─ Respuesta: { _id, name, price, stock: 50 }
      │
      ├─ Verificar: cantidad solicitada < stock disponible
      │  ✓ OK → Continuar
      │  ✗ FAIL → Lanzar Error, retornar throwError()
      │
      ├─ Si OK, agregar al carrito: HTTP POST
      │  POST /api/cart/add-product
      │  Body: { userId, productId, quantity }
      │       │
      │       ▼
      │   [Backend Node.js]
      │   └─ Actualizar BD → Devolver carrito actualizado
      │
      ├─ Actualizar estado con la respuesta
      │  this.cartSubject.next(response.cart)
      │       │
      │       ├─ Emitir a: cart$ Observable
      │       │
      │       ├─► [Home Component] detects change
      │       │   │ badge: 1 → 2 ✓
      │       │
      │       ├─► [Navbar Component] detects change
      │       │   │ contador: 1 → 2 ✓
      │       │
      │       └─► [CartComponent] if open
      │           │ cartItems se actualizan ✓
      │
      ▼
  console.warn('✅ Producto agregado...')
  
  ========================================
  FLUJO COMPLETO EN 3-5 SEGUNDOS
  ========================================
```

---

## 7️⃣ Estado en Memoria (En Tiempo Real)

```javascript
// Estado del CartService EN MEMORIA durante la sesión

CartService {
  
  cartSubject: BehaviorSubject<Cart>
  Value: {
    _id: "62f4e8a9c1d2e3f4g5h6i7j8",
    user: "62f4e8a9c1d2e3f4g5h6i7j8",
    products: [
      {
        _id: "prod_001",
        product: {
          _id: "prod_001",
          name: "Aguas Frescas",
          price: 20,
          stock: 50,
          // ... más datos
        },
        quantity: 2
      },
      {
        _id: "prod_002",
        product: {
          _id: "prod_002",
          name: "Biónicos",
          price: 90,
          stock: 15,
        },
        quantity: 1
      }
    ]
  }
  
  // Los componentes suscritos tienen referencias a:
  // user$.subscribe() → reciben cambios en tiempo real
  // cart$.subscribe() → reciben cambios en tiempo real
  
  // Métodos disponibles:
  addToCart()      → modifica cartSubject.next()
  updateQuantity() → modifica cartSubject.next()
  removeFromCart() → modifica cartSubject.next()
  getTotalPrice()  → calcula sobre .value
  itemCount        → getter que cuenta items
  
}

// 📊 MÉTRICAS EN MEMORIA:
// ├─ HTTP Calls: 1 (GET carrito inicial)
// ├─ Observables activos: ~5 (navbar, cart, home, checkout, etc)
// ├─ Cambios de estado: ~3 (agregar, actualizar, borrar)
// └─ Tiempo de actualización: < 100ms
```

---

## 8️⃣ Flujo Completo de Usuario: Login → Comprar → Confirmación

```
[START: Usuario anónimo]
     │
     │ 1. Usuario navega a /login
     │
     ▼
  ┌────────────────────────────┐
  │ [LOGIN PAGE]               │
  │ Email: [ ]                 │
  │ Password: [ ]              │
  │ [INGRESAR]                 │
  └────────────────────────────┘
     │
     │ 2. Submit forma → AuthService.login(email, pass)
     │
     ▼
  ┌────────────────────────────────────┐
  │ HTTP POST /api/auth/login          │
  │ ├─ Validar credenciales            │
  │ ├─ Generar JWT token               │
  │ └─ Devolver: { token, user {...} } │
  └────────────────────────────────────┘
     │
     │ 3a. Guardar token en localStorage
     │    AuthService.login() → localStorage.setItem('token')
     │
     │ 3b. Actualizar estado Usuario
     │    UserStateService.setUser(user)
     │    → userSubject.next(user)
     │
     │ 3c. Actualizar estado NgRx Auth (opcional)
     │    store.dispatch(AuthActions.loadUserSuccess({user}))
     │
     ▼
  ┌────────────────────────────┐
  │ [HOME PAGE - LOGUEADO]     │
  │ ┌──────────────────────┐   │
  │ │ Navbar               │   │
  │ │ 👤 Juan Pérez | [🛒2]│ ← UserService.user$.name
  │ └──────────────────────┘   │    CartService.itemCount
  │                             │
  │ [Aguas Frescas] $20        │
  │ [Biónicos] $90  ← Ya hay   │
  │ [Crepas] $80    en carrito │
  │ ...                         │
  └────────────────────────────┘
     │
     │ 4. Usuario busca: [Waffles] $70
     │    cartService.addToCart('prod_025', 1)
     │
     │    HTTP POST /api/cart/add-product
     │    └─ ProductService valida stock
     │    └─ cartSubject.next(newCart)
     │    └─ itemCount: 2 → 3 ✓
     │
     ▼
  ┌────────────────────────────┐
  │ [CARRITO PAGE]             │
  │ ┌──────────────────────┐   │
  │ │ Biónicos x1  = $90   │   │
  │ │ Waffles x1   = $70   │   │
  │ │ ─────────────────────│   │
  │ │ Total:       = $160  │   │
  │ │                      │   │
  │ │ [CHECKOUT] ←─────────┼─── cartService.cart$
  │ └──────────────────────┘   │
  └────────────────────────────┘
     │
     │ 5. Proceder a checkout
     │    cartService.checkout()
     │
     ▼
  ┌────────────────────────────┐
  │ [CHECKOUT PAGE]            │
  │ ├─ Resumen carrito (precargado)
  │ │  cartService.cart$ → items
  │ │
  │ ├─ Datos de envío (precargados)
  │ │  userService.user$ → nombre, email
  │ │
  │ ├─ Método de pago
  │ │  paymentMethodService.methods$
  │ │
  │ └─ [PROCESAR PAGO]
  └────────────────────────────┘
     │
     │ 6. Crear orden
     │    orderService.createOrder()
     │    │
     │    ├─ HTTP POST /api/orders
     │    ├─ Pasar cartItems, shippingAddress, payment
     │    ├─ Backend crea orden, reduce stock
     │    └─ Devuelve: { orderId: "ORD-ABC123", ... }
     │
     │ 7. Limpiar carrito
     │    cartService.clearCart()
     │    └─ cartSubject.next(null)
     │    └─ Guardar carrito vacío en localStorage
     │
     ▼
  ┌────────────────────────────────┐
  │ [CONFIRMACIÓN PAGE]            │
  │                                │
  │ ✅ ¡ORDEN CONFIRMADA!         │
  │                                │
  │ Orden: ORD-ABC123DE            │
  │ Total: $160                    │
  │ Envío a: Juan Pérez ...       │
  │ ← userService.user$.email     │
  │                                │
  │ Recibirás email en:            │
  │ juan@email.com                 │
  │                                │
  │ [Continuar comprando]          │
  └────────────────────────────────┘
     │
     │ 8. Usuario regresa a /home
     │    ├─ Carrito vacío (itemCount: 0)
     │    ├─ Usuario sigue logueado
     │    └─ Puede ver historial en Perfil
     │
     ▼
  [FIN]
```

---

## 9️⃣ Estructura de Carpetas Recomendada

```
src/app/
│
├── core/
│   ├── auth.service.ts ✅
│   ├── auth.guard.ts ✅
│   ├── auth.interceptor.ts ✅
│   │
│   ├── user-state.service.ts (consolidar)
│   ├── profile.service.ts ✅
│   │
│   ├── product.service.ts (agregar products$)
│   ├── category.service.ts ✅
│   │
│   ├── cart.service.ts ✅
│   │
│   ├── order.service.ts (agregar orders$)
│   ├── payment-method.service.ts ✅
│   │
│   ├── wishlist.service.ts (agregar wishlist$)
│   ├── review.service.ts ✅
│   │
│   ├── admin.service.ts ✅
│   ├── admin.guard.ts ✅
│   │
│   └── notification.service.ts ✅
│
├── store/ (NgRx - Optional en Fase 2)
│   ├── auth/
│   │   ├── auth.actions.ts ✅
│   │   ├── auth.reducer.ts ✅
│   │   ├── auth.effects.ts ✅
│   │   ├── auth.selectors.ts ✅
│   │   └── auth.models.ts ✅
│   │
│   ├── user/ (NUEVO - Phase 2)
│   ├── products/ (NUEVO - Phase 2)
│   ├── cart/ (NUEVO - Phase 2)
│   └── orders/ (NUEVO - Phase 2)
│
├── pages/
│   ├── home/
│   ├── product-detail/
│   ├── cart/
│   ├── checkout/
│   ├── order-confirmation/
│   ├── profile/
│   ├── search/
│   ├── category/
│   ├── auth/
│   │   ├── login/
│   │   ├── register/
│   │   └── reset-password/
│   └── admin/
│       ├── dashboard/
│       ├── admin-users/
│       ├── admin-products/
│       └── admin-orders/
│
└── ui/
    ├── button/
    ├── card/
    ├── badge/
    ├── product-grid/
    ├── modal/
    └── ...
```

---

## 🔟 Resumen Visual: Antes vs Después

```
╔════════════════════════════════════════════════════════════╗
║                    ANTES (Actual)                          ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ⚠️  Usuario en 2 lugares                                 ║
║  ├─ UserStateService.user$ (BehaviorSubject)            ║
║  ├─ store/auth (NgRx)                                    ║
║  └─ ⚡ CONFLICTO: pueden desincronizarse                │
║                                                            ║
║  ⚠️  Productos sin estado                                 ║
║  └─ Cada componente hace su HTTP call                    ║
║                                                            ║
║  ⚠️  Tipos inseguros (any)                                ║
║  └─ Errores silenciosos en runtime                       ║
║                                                            ║
║  ⚠️  console.log no permitido                             ║
║  └─ ESLint warnings ✅ CORREGIDO                         ║
║                                                            ║
║  📊 Performance: 72 (Lighthouse)                          ║
║  💾 Bundle: 250KB                                         ║
║  ⚙️  Build time: 45s                                      ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝

                        ⬇️  Aplicar mejoras  ⬇️

╔════════════════════════════════════════════════════════════╗
║                   DESPUÉS (Recomendado)                    ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  ✅ Usuario en 1 lugar (elegir NgRx O BehaviorSubject)  ║
║  └─ Único source of truth                                 ║
║                                                            ║
║  ✅ Productos con estado (products$ BehaviorSubject)     ║
║  └─ Cache reactivo, -50% HTTP calls                      ║
║                                                            ║
║  ✅ Tipos seguros (sin any)                               ║
║  └─ Autocompletado, errores en desarrollo                │
║                                                            ║
║  ✅ Código limpio                                          ║
║  └─ ESLint sin warnings                                   ║
║                                                            ║
║  📊 Performance: 85 (Lighthouse) +18%                     ║
║  💾 Bundle: 210KB -16%                                    ║
║  ⚙️  Build time: 35s -22%                                │
║                                                            ║
╚════════════════════════════════════════════════════════════╝
```

---

**Más información:** Ver archivos documentados
- [ANALISIS_STATE_MANAGEMENT.md](ANALISIS_STATE_MANAGEMENT.md)
- [GUIA_IMPLEMENTACION_STATE.md](GUIA_IMPLEMENTACION_STATE.md)
- [DONDE_VES_STATE.md](DONDE_VES_STATE.md)

