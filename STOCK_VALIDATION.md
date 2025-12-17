# Stock Validation Implementation

## Problema
Los usuarios podían agregar productos al carrito superando el stock disponible, incluso cuando la validación en la interfaz indicaba lo contrario.

## Solución Implementada

### Frontend - CartService Mejorado
**Archivo**: `ecommerce-app/src/app/core/cart.service.ts`

1. **Inyección de ProductService**: Agregado para consultar datos de stock del producto
2. **Validación de Stock en `addToCart()`**:
   - Consulta el stock actual del producto vía `ProductService`
   - Calcula la cantidad existente en carrito del producto específico
   - Valida que `currentQuantityInCart + newQuantity <= product.stock`
   - Rechaza la operación con mensaje detallado si excede stock

**Flujo**:
```
addToCart()
  ↓ (validar cantidad > 0)
  ↓ (obtener carrito actual)
  ↓ getProductById() → tap() → validar stock
  ↓ Si OK: switchMap() → POST /cart/add-product
  ↓ Si error: throwError() con mensaje descriptivo
```

**Mensaje de Error** (cuando excede stock):
```
Stock insuficiente. Stock disponible: 10. 
Cantidad en carrito: 8. 
Máximo a agregar: 2
```

### Frontend - Componentes Actualizados
Se removieron validaciones manuales duplicadas:

1. **ProductDetailComponent** - `addToCart()`
   - Removido: `if (product.stock === 0)` check
   - Ahora: CartService maneja toda la validación

2. **HomeComponent** - `onAddToCart()`
   - Removido: `if (product.stock === 0)` check
   - El servicio valida automáticamente

3. **CategoryComponent** - `onAddToCart()`
   - Removido: `if (product.stock === 0)` check
   - Simplificado: solo autenticación + llamada al servicio

**Beneficio**: Lógica centralizada, evita duplicación de validaciones

### Backend - CartController Mejorado
**Archivo**: `backend/src/controllers/cartController.js`

1. **Importación de Product Model**
   ```javascript
   import Product from '../models/product.js';
   ```

2. **Validación en `addProductToCart()`**:
   - Obtiene el producto de la base de datos
   - Valida existencia del producto
   - Calcula cantidad actual en carrito para ese producto
   - Valida `totalQuantity <= product.stock`
   - Rechaza con HTTP 400 si excede stock

**Validaciones en orden**:
```javascript
1. userId y productId válidos
2. Producto existe en BD
3. Cantidad total no excede stock disponible
4. Procede a guardar en carrito
```

**Respuesta en caso de error** (HTTP 400):
```json
{
  "message": "Stock insuficiente. Stock disponible: 10. Cantidad en carrito: 8. Máximo a agregar: 2",
  "cart": null
}
```

## Flujo Completo de Validación

### 1. Usuario intenta agregar producto
```
ProductDetailComponent.addToCart()
  ↓ (autenticación OK)
  ↓ cartService.addToCart(userId, productId, 1)
```

### 2. CartService valida (Frontend)
```
CartService.addToCart()
  ↓ getProductById(productId)
  ↓ TAP: Validar stock vs carrito actual
  ↓ SWITCH_MAP: POST /cart/add-product
```

### 3. Backend valida (Doble capa de seguridad)
```
cartController.addProductToCart()
  ↓ Obtener producto de BD
  ↓ Validar: totalQuantity <= product.stock
  ↓ Si OK: Guardar en carrito
  ↓ Si NO: Rechazar con HTTP 400
```

### 4. Respuesta al usuario
- **Éxito**: Carrito actualizado, alert de confirmación
- **Error**: Alert con mensaje detallado de por qué falló

## Testing Manual

### Caso 1: Producto con stock suficiente
```
1. Producto: stock = 10
2. Carrito: vacío (cantidad = 0)
3. Usuario intenta: agregar 1
4. Resultado: ✅ Agregado OK (total = 1)
5. Usuario intenta: agregar 5 más
6. Resultado: ✅ Agregado OK (total = 6)
7. Usuario intenta: agregar 5 más (total sería 11)
8. Resultado: ❌ Error - Stock insuficiente
```

### Caso 2: Producto sin stock
```
1. Producto: stock = 0
2. Usuario intenta: agregar 1
3. Resultado: ❌ Error - Stock insuficiente
```

### Caso 3: Stock límite exacto
```
1. Producto: stock = 5
2. Carrito: 4 unidades
3. Usuario intenta: agregar 1
4. Resultado: ✅ Agregado OK (total = 5)
5. Usuario intenta: agregar 1 más
6. Resultado: ❌ Error - Stock insuficiente
```

## Cambios Resumidos

### Frontend
- ✅ `CartService.addToCart()` - Validación completa de stock
- ✅ `ProductDetailComponent` - Removida validación manual
- ✅ `HomeComponent` - Removida validación manual
- ✅ `CategoryComponent` - Removida validación manual

### Backend
- ✅ `cartController.addProductToCart()` - Validación de stock
- ✅ Import de `Product` model para consultar stock

## Seguridad

### Doble validación (Defensa en Profundidad)
1. **Frontend**: Rápida, mejor UX (previene requests innecesarios)
2. **Backend**: Definitiva (previene manipulación directa de API)

### Ejemplos de manipulación prevenida
- ❌ Cliente intenta: `POST /cart/add-product` con cantidad 100 (stock = 10)
- ✅ Backend rechaza: HTTP 400 con mensaje

- ❌ Cliente manipula: CartService deshabilitado (dev tools)
- ✅ Backend sigue validando

## Próximos Pasos Recomendados

1. **Checkout Validation**: Validar stock nuevamente antes de procesar pago
2. **Reserva de Stock**: Considerar reservar stock mientras checkout está en progreso
3. **Notificaciones**: Alertar al usuario cuando stock es bajo (< 5 unidades)
4. **Admin Panel**: Mostrar alertas cuando stock es bajo
5. **Analytics**: Registrar intentos de compra con stock insuficiente

