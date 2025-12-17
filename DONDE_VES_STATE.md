# 📍 DÓNDE VES CADA ESTADO EN TU APLICACIÓN

## 🏠 Home Page

```
┌──────────────────────────────────────────────────────────┐
│                      NAVBAR                               │
│  Logo  [🔍 Buscar]  [❤️]  [👤 Usuario]  [🛒 3 items]    │
│                                           ↑                │
│                                    CartService.cart$       │
│                                    (contador reactivo)     │
└──────────────────────────────────────────────────────────┘
│
│  [Destacados]                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │  Imagen      │  │  Imagen      │  │  Imagen      │    │
│  │ Producto 1   │  │ Producto 2   │  │ Producto 3   │    │
│  │ $50          │  │ $75          │  │ $100         │    │
│  │ ⭐⭐⭐ (3) │  │ ⭐⭐⭐⭐(4) │  │ ⭐⭐⭐ (2) │    │
│  │ [Agregar]    │  │ [Agregar]    │  │ [Agregar]    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│         ↓                 ↓                 ↓              │
│   ProductService.       ProductService.   ProductService.  │
│   products$             products$         products$        │
│   (Cache reactivo)                                        │
│
│  [Categorías]                                              │
│  [Bebidas] [Postres] [Almuerzos] [Snacks]               │
│      ↓                                                     │
│  ProductService.categories$                              │
│
│  [Carrito Modal]                                           │
│  ├─ Producto 1 x2 = $100                                 │
│  ├─ Producto 2 x1 = $75                                  │
│  └─ Total: $175                                           │
│     ↓                                                      │
│  CartService.getTotalPrice()                             │
│  CartService.cart$ observable                            │
│
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `ProductService.products$` - Todos los productos
- ✅ `ProductService.categories$` - Categorías
- ✅ `CartService.cart$` - Items actuales
- ✅ `UserStateService.user$` - Nombre si está logueado

---

## 🔐 Login/Register Page

```
┌──────────────────────────────────────────────────────────┐
│                    LOGIN FORM                              │
│                                                            │
│   Email:    [__________________]                          │
│   Password: [__________________]                          │
│                                                            │
│   [INGRESAR]                                              │
│        ↓                                                   │
│   AuthService.login()                                     │
│        ↓                                                   │
│   Store.dispatch(AuthActions.login)  (NgRx)             │
│        ↓                                                   │
│   authReducer → {token, user}                            │
│        ↓                                                   │
│   UserStateService.setUser()                             │
│        ↓                                                   │
│   Redirect a /home                                        │
│
│   Indicador de estado:                                    │
│   [Loading] → [✅ Logueado] O [❌ Error]                 │
│       ↓                            ↓                       │
│   auth$ loading              auth$ error                  │
│   (Observable)               (Observable)                 │
│
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `AuthService.login()` - Credenciales
- ✅ `Store` (NgRx auth) - Estado login
- ✅ `UserStateService.user$` - Usuario después de login

---

## 🛒 Carrito Page

```
┌──────────────────────────────────────────────────────────┐
│                    TU CARRITO                              │
│                                                            │
│  [ ✓ ] | Producto 1         | Cantidad: [2]  | $100     │
│        | Imagen thumbnail                                 │
│        └─ [❌ Eliminar]                                   │
│                                                            │
│  [ ✓ ] | Producto 2         | Cantidad: [1]  | $75      │
│        | Imagen thumbnail                                 │
│        └─ [❌ Eliminar]                                   │
│                                                            │
│  [ ✓ ] | Producto 3         | Cantidad: [3]  | $300     │
│        | Imagen thumbnail                                 │
│        └─ [❌ Eliminar]                                   │
│                                                            │
├──────────────────────────────────────────────────────────┤
│                                                            │
│  Subtotal: $475                                            │
│  Envío: $25                                                │
│  Descuento: -$47.50                                        │
│  ─────────────────────                                     │
│  TOTAL: $452.50                                            │
│                                                            │
│  [Continuar Comprando]  [Proceder a Checkout]            │
│         ↓                       ↓                          │
│    router.navigate        CartService.checkout()         │
│    ['/home']              (validar stock)                 │
│
│  Estado Reactivo:
│  CartService.cart$ → productos actuales                  │
│  CartService.getTotalPrice() → total                     │
│  ProductService.products$ → validar stock                │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `CartService.cart$` - Items del carrito
- ✅ `CartService.getTotalPrice()` - Total reactivo
- ✅ `ProductService.products$` - Para validar stock
- ✅ `OrderService.createOrder()` - Crear orden

---

## 💳 Checkout Page

```
┌──────────────────────────────────────────────────────────┐
│                    CHECKOUT                                │
│                                                            │
│  ┌─ RESUMEN DE ORDEN ─────────────────────────────────┐  │
│  │ Productos: 6 items                    Total: $452.50 │  │
│  │                                                     │  │
│  │  ┌─ Producto 1 x2      $100                      │  │  │
│  │  ┌─ Producto 2 x1      $75                       │  │  │
│  │  ┌─ Producto 3 x3      $300                      │  │  │
│  │                                                     │  │
│  │  Estado:                                           │  │
│  │  CartService.cart$ → items                        │  │
│  │  CartService.getTotalPrice() → total              │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ INFORMACIÓN DE ENVÍO ─────────────────────────────┐  │
│  │ Nombre: [__________________]                       │  │
│  │ Email: [___________________]                       │  │
│  │ Dirección: [_______________]                       │  │
│  │ Ciudad: [__________________]                       │  │
│  │ Teléfono: [________________]                       │  │
│  │ Usuario logueado:                                  │  │
│  │ UserStateService.user$ → datos pre-cargados      │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  ┌─ MÉTODO DE PAGO ───────────────────────────────────┐  │
│  │ ○ Tarjeta de Crédito                             │  │
│  │ ○ PayPal                                          │  │
│  │ ○ Transferencia Bancaria                         │  │
│  │                                                     │  │
│  │ Número: [__________________]                      │  │
│  │ Nombre: [___________________]                     │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                            │
│  [VOLVER]  [PROCESAR PAGO]                               │
│                ↓                                           │
│         OrderService.createOrder()                        │
│         CartService.clearCart()                           │
│         router.navigate(['/confirmacion', orderId])      │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `CartService.cart$` - Items para procesar
- ✅ `UserStateService.user$` - Datos pre-cargados
- ✅ `OrderService` - Crear orden
- ✅ `PaymentMethodService` - Métodos de pago

---

## ✅ Confirmación Page

```
┌──────────────────────────────────────────────────────────┐
│                 ¡ORDEN CONFIRMADA!                         │
│                    🎉                                      │
│                                                            │
│  Tu orden #ORD-ABC123DE ha sido procesada                │
│                                                            │
│  Número de orden: ORD-ABC123DE                            │
│  Fecha: 16 de Diciembre de 2025                           │
│  Total: $452.50                                            │
│                                                            │
│  ┌─ DETALLES ──────────────────────────────────────────┐  │
│  │ Envío a: Juan Pérez                                │  │
│  │          Calle Principal 123                        │  │
│  │          Ciudad, CP 12345                           │  │
│  │                                                      │  │
│  │ Estimado de entrega: 3-5 días hábiles             │  │
│  │                                                      │  │
│  │ Estado de pago: Confirmado ✓                       │  │
│  │ Estado de orden: Procesando 📦                      │  │
│  │                                                      │  │
│  │ Recibirás un email de confirmación en:             │  │
│  │ juan@email.com                                      │  │
│  │                    ↓                                │  │
│  │              UserStateService.user.email            │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                            │
│  [Ver mis órdenes]  [Continuar comprando]                │
│         ↓                    ↓                             │
│   /profile/orders       /home                            │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `OrderService` - Mostrar detalles orden
- ✅ `UserStateService.user$` - Email de confirmación
- ✅ `CartService` - Confirmación limpieza

---

## 👤 Perfil/Mi Cuenta Page

```
┌──────────────────────────────────────────────────────────┐
│                    MI PERFIL                               │
│                                                            │
│  ┌─ INFORMACIÓN PERSONAL ────────────────────────────────┐│
│  │ Avatar: [👤 Imagen]                                 ││
│  │                                                       ││
│  │ Nombre: Juan Pérez                                  ││
│  │ Email: juan@email.com                               ││
│  │ Teléfono: +52 1234567890                            ││
│  │ Rol: customer                                        ││
│  │                                                       ││
│  │ Estado:                                              ││
│  │ UserStateService.user$ → todos los datos            ││
│  │                                                       ││
│  │ [Editar Perfil]                                     ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ┌─ MIS ÓRDENES ─────────────────────────────────────────┐│
│  │ Orden #ORD-ABC123DE  | $452.50 | ✅ Entregado       ││
│  │ Orden #ORD-XYZ789AB  | $175.00 | 📦 En tránsito     ││
│  │ Orden #ORD-DEF456GH  | $225.00 | ⏳ Procesando      ││
│  │                                                       ││
│  │ Estado:                                              ││
│  │ OrderService.getOrdersByUser() → observable         ││
│  │                                                       ││
│  │ [Ver detalles]  [Ver detalles]  [Ver detalles]      ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ┌─ MÉTODOS DE PAGO ─────────────────────────────────────┐│
│  │ 💳 Visa ****1234                  [Editar] [Eliminar] ││
│  │ 💳 Mastercard ****5678            [Editar] [Eliminar] ││
│  │ 📧 PayPal (juan@email.com)        [Editar] [Eliminar] ││
│  │                                                       ││
│  │ [Agregar nuevo método]                              ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  ┌─ LISTA DE DESEOS ─────────────────────────────────────┐│
│  │ ❤️ Producto A            | $50   | [Agregar a carro]  ││
│  │ ❤️ Producto B            | $75   | [Agregar a carro]  ││
│  │ ❤️ Producto C            | $100  | [Agregar a carro]  ││
│  │                                                       ││
│  │ Estado:                                              ││
│  │ WishlistService.wishlist$ → observables             ││
│  └───────────────────────────────────────────────────────┘│
│                                                            │
│  [Cerrar Sesión]                                          │
│        ↓                                                   │
│   AuthService.logout()                                   │
│   UserStateService.clearUser()                           │
│   router.navigate(['/'])                                 │
│                                                            │
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `UserStateService.user$` - Datos personales
- ✅ `OrderService` - Historial de órdenes
- ✅ `PaymentMethodService` - Métodos de pago
- ✅ `WishlistService.wishlist$` - Lista de deseos
- ✅ `AuthService.logout()` - Cerrar sesión

---

## 👨‍💼 Panel Admin

```
┌──────────────────────────────────────────────────────────┐
│                    ADMIN PANEL                             │
│                                                            │
│  [📊 Dashboard] [👥 Usuarios] [📦 Productos] [📋 Órdenes]│
│
│  ┌─ GESTIÓN DE USUARIOS ──────────────────────────────────┐
│  │ ID | Nombre | Email | Rol | Activo | Acciones       │
│  │────────────────────────────────────────────────────── │
│  │ 1  | Juan   | j@... | adm | ✓      | [Edit] [Delete]│
│  │    │        │       │     │        │                │
│  │    │        │       │     │        │ Estado:        │
│  │    │        │       │     │        │ AdminService   │
│  │    │        │       │     │        │ .getUsers()    │
│  │ 2  | María  | m@... | cus | ✓      | [Edit] [Delete]│
│  │ 3  | Pedro  | p@... | cus | ✗      | [Edit] [Delete]│
│  │                                                       │
│  │ [+ Nuevo Usuario]                                    │
│  └───────────────────────────────────────────────────────┘
│
│  ┌─ EDITAR USUARIO ──────────────────────────────────────┐
│  │ Nombre: [Juan Pérez]                                │
│  │ Email: [juan@email.com]                             │
│  │ Rol: [admin ▼]                                      │
│  │       - guest                                        │
│  │       - customer                                     │
│  │       - admin                                        │
│  │ Activo: [✓ Sí] [ No]                               │
│  │                                                       │
│  │ UserFormModel (tipado):                             │
│  │ interface UserFormModel extends User {              │
│  │   ... sin 'any' ...                                 │
│  │ }                                                    │
│  │                                                       │
│  │ [Guardar]  [Cancelar]                               │
│  │     ↓                                                 │
│  │ AdminService.updateUser()                           │
│  └───────────────────────────────────────────────────────┘
│
│  ┌─ GESTIÓN DE PRODUCTOS ────────────────────────────────┐
│  │ Nombre | Categoría | Stock | Precio | Acciones      │
│  │──────────────────────────────────────────────────── │
│  │ Aguas  | Bebidas   | 50    | $20    | [Edit][Delete]│
│  │ Frescas│           │       │        │               │
│  │                                                       │
│  │ Estado:                                              │
│  │ ProductService.products$ (con cache)                │
│  │                                                       │
│  │ [+ Nuevo Producto]                                  │
│  └───────────────────────────────────────────────────────┘
│
└──────────────────────────────────────────────────────────┘
```

**Servicios activos:**
- ✅ `AdminService.getUsers()` - Lista usuarios
- ✅ `AdminService.updateUser()` - Editar usuario
- ✅ `ProductService.products$` - Productos
- ✅ `UserStateService.user$` - Permisos admin

---

## 📊 Mapa de Servicios y Sus Observables

```
┌─────────────────────────────────────────────────────────────┐
│                    STATE MANAGEMENT MAP                       │
└─────────────────────────────────────────────────────────────┘

NIVEL 1: AUTENTICACIÓN
├─ AuthService.login() → envía credenciales
├─ AuthService.logout() → limpia token
└─ AuthService.isLoggedIn() → verifica token

         ↓

NIVEL 2: USUARIO AUTENTICADO (BehaviorSubject)
├─ UserStateService.user$ → OBSERVABLE
│  └─ {_id, displayName, email, role, avatar, createdAt}
├─ UserStateService.setUser()
└─ UserStateService.clearUser()

         ↓

NIVEL 3: CATÁLOGO DE PRODUCTOS (BehaviorSubject)
├─ ProductService.products$ → OBSERVABLE
│  └─ Product[] con caché reactivo
├─ ProductService.categories$ → OBSERVABLE
│  └─ Category[]
├─ ProductService.getAll()
├─ ProductService.getById()
├─ ProductService.getByCategory()
└─ ProductService.search()

         ↓

NIVEL 4: CARRITO (BehaviorSubject)
├─ CartService.cart$ → OBSERVABLE
│  └─ {_id, user, products: CartItem[]}
├─ CartService.addToCart() → valida stock
├─ CartService.updateQuantity()
├─ CartService.removeFromCart()
├─ CartService.clearCart()
├─ CartService.getTotalPrice()
└─ CartService.itemCount → getter reactivo

         ↓

NIVEL 5: ÓRDENES
├─ OrderService.createOrder()
├─ OrderService.getOrders()
├─ OrderService.getOrdersByUser()
└─ OrderService.updateOrderStatus()

         ↓

NIVEL 6: MÉTODOS DE PAGO
├─ PaymentMethodService.getMethods()
├─ PaymentMethodService.addMethod()
└─ PaymentMethodService.deleteMethod()

         ↓

NIVEL 7: LISTA DE DESEOS (BehaviorSubject)
├─ WishlistService.wishlist$ → OBSERVABLE
├─ WishlistService.addToWishlist()
├─ WishlistService.removeFromWishlist()
└─ WishlistService.isInWishlist()

         ↓

NIVEL 8: NOTIFICACIONES
├─ NotificationService.notify()
├─ NotificationService.getNotifications()
└─ NotificationService.markAsRead()
```

---

## 🎯 Checklist: Dónde Usar Cada Observable

- [ ] **UserStateService.user$** → Navbar (nombre), perfil, órdenes
- [ ] **CartService.cart$** → Badge carrito, página carrito, checkout
- [ ] **CartService.itemCount** → Badge numérico en navbar
- [ ] **ProductService.products$** → Home, búsqueda, categorías, admin
- [ ] **ProductService.categories$** → Filtros, navegación
- [ ] **WishlistService.wishlist$** → Corazón en productos, página wishlist
- [ ] **OrderService** → Perfil (historial), admin (todas las órdenes)

