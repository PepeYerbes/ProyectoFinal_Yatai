import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { Cart, CartItem, CartResponse, CartService } from './cart.service';
import { Category, Product } from './product.service';

describe('CartService', () => {
  let service: CartService;
  let httpMock: HttpTestingController;

  // Mock de categoría que coincide con la API
  const mockCategory: Category = {
    _id: 'category123',
    name: 'Test Category',
    description: 'Test category description',
    imagesUrl : 'https://placehold.co/800x600.png',
    parentCategory: null,
  };

  // Datos de prueba mock que coinciden con la API
  const mockProduct: Product = {
    _id: 'product123',
    name: 'Test Product',
    price: 100,
    description: 'Test description',
    imagesUrl: 'https://placehold.co/800x600.png',
    category: mockCategory,
    stock: 10,
  };

  const mockCartItem: CartItem = {
    _id: 'item123',
    product: mockProduct,
    quantity: 2,
  };

  const mockCart: Cart = {
    _id: 'cart123',
    user: 'user123',
    products: [mockCartItem],
  };

  // Respuesta cuando SÍ hay carrito (coincide con API)
  const mockCartResponse: CartResponse = {
    message: 'Cart retrieved successfully',
    cart: mockCart,
  };

  // Respuesta cuando NO hay carrito (coincide con API)
  const mockEmptyCartResponse = {
    message: 'No cart found for this user',
    cart: null,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CartService],
    });

    service = TestBed.inject(CartService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('itemCount getter', () => {
    it('should return 0 when cart is empty', () => {
      expect(service.itemCount).toBe(0);
    });

    it('should return 0 when cart is null', () => {
      service['cartSubject'].next(null);
      expect(service.itemCount).toBe(0);
    });

    it('should return total quantity of items in cart', () => {
      // Carrito con múltiples productos
      const cartWithMultipleItems: Cart = {
        _id: 'cart123',
        user: 'user123',
        products: [
          { _id: 'item1', product: mockProduct, quantity: 2 },
          { _id: 'item2', product: mockProduct, quantity: 3 },
        ],
      };
      service['cartSubject'].next(cartWithMultipleItems);
      expect(service.itemCount).toBe(5); // 2 + 3
    });
  });

  describe('getCart', () => {
    it('should get cart successfully and update cart subject', () => {
      const userId = 'user123';

      service.getCart(userId).subscribe(response => {
        expect(response).toEqual(mockCartResponse);
        expect(response.message).toBe('Cart retrieved successfully');
        expect(service['cartSubject'].value).toEqual(mockCart);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockCartResponse);
    });

    it('should handle empty cart response from API', () => {
      const userId = 'user123';

      service.getCart(userId).subscribe(response => {
        expect(response.message).toBe('No cart found for this user');
        expect(response.cart).toBeNull();
        expect(service['cartSubject'].value).toBeNull();
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/user/${userId}`);
      req.flush(mockEmptyCartResponse);
    });

    it('should handle HTTP errors when getting cart', () => {
      const userId = 'user123';
      const errorResponse = { message: 'Server error' };

      service.getCart(userId).subscribe({
        next: () => fail('Should have failed'),
        error: error => {
          expect(error.message).toBe('No se pudo obtener el carrito');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/user/${userId}`);
      req.flush(errorResponse, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('addToCart', () => {
    it('should add product to cart successfully', () => {
      const userId = 'user123';
      const productId = 'product123';
      const quantity = 2;
      const expectedBody = { userId, productId, quantity };

      spyOn(console, 'log'); // Spy en el console.log

      service.addToCart(userId, productId, quantity).subscribe(response => {
        expect(response).toEqual(mockCartResponse);
        expect(service['cartSubject'].value).toEqual(mockCart);
        expect(console.log).toHaveBeenCalledWith('✅ Producto agregado al carrito: 2x');
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/add-product`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(expectedBody);
      req.flush(mockCartResponse);
    });

    it('should use default quantity of 1 when not specified', () => {
      const userId = 'user123';
      const productId = 'product123';
      const expectedBody = { userId, productId, quantity: 1 };

      service.addToCart(userId, productId).subscribe();

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/add-product`);
      expect(req.request.body).toEqual(expectedBody);
      req.flush(mockCartResponse);
    });

    it('should handle errors when adding to cart', () => {
      const userId = 'user123';
      const productId = 'product123';
      const errorResponse = { message: 'Producto sin stock' };

      service.addToCart(userId, productId).subscribe({
        next: () => fail('Should have failed'),
        error: error => {
          expect(error.message).toBe('Producto sin stock');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/add-product`);
      req.flush(errorResponse, { status: 400, statusText: 'Bad Request' });
    });

    it('should handle errors without specific message', () => {
      const userId = 'user123';
      const productId = 'product123';

      service.addToCart(userId, productId).subscribe({
        next: () => fail('Should have failed'),
        error: error => {
          // ✅ Cambio aquí: verificar que el error contiene el mensaje HTTP real
          expect(error.message).toContain('Http failure response');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/add-product`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('updateQuantity', () => {
    beforeEach(() => {
      // Configurar carrito activo para las pruebas de actualización
      service['cartSubject'].next(mockCart);
    });

    it('should update product quantity successfully', () => {
      const cartId = 'cart123';
      const productId = 'product123';
      const newQuantity = 5;

      const expectedBody = {
        user: 'user123',
        products: [
          {
            product: 'product123',
            quantity: 5,
          },
        ],
      };

      const updatedCart: Cart = {
        ...mockCart,
        products: [{ ...mockCartItem, quantity: 5 }],
      };

      service.updateQuantity(cartId, productId, newQuantity).subscribe(response => {
        expect(response).toEqual(updatedCart);
        expect(service['cartSubject'].value).toEqual(updatedCart);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(expectedBody);
      req.flush(updatedCart);
    });

    it('should remove product when quantity is 0', () => {
      const cartId = 'cart123';
      const productId = 'product123';
      const newQuantity = 0;

      const expectedBody = {
        user: 'user123',
        products: [], // Array vacío porque se filtran items con quantity = 0
      };

      const emptyCart: Cart = {
        ...mockCart,
        products: [],
      };

      service.updateQuantity(cartId, productId, newQuantity).subscribe(response => {
        expect(response).toEqual(emptyCart);
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      expect(req.request.body).toEqual(expectedBody);
      req.flush(emptyCart);
    });

    it('should throw error when no active cart', () => {
      service['cartSubject'].next(null); // No hay carrito activo

      expect(() => {
        service.updateQuantity('cart123', 'product123', 5);
      }).toThrowError('No hay carrito activo');
    });

    it('should handle update errors', () => {
      const cartId = 'cart123';
      const productId = 'product123';

      service.updateQuantity(cartId, productId, 5).subscribe({
        next: () => fail('Should have failed'),
        error: error => {
          expect(error.message).toBe('No se pudo actualizar el carrito');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('removeFromCart', () => {
    it('should call updateQuantity with quantity 0', () => {
      service['cartSubject'].next(mockCart);
      spyOn(service, 'updateQuantity').and.callThrough();

      const cartId = 'cart123';
      const productId = 'product123';

      service.removeFromCart(cartId, productId).subscribe();

      expect(service.updateQuantity).toHaveBeenCalledWith(cartId, productId, 0);

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      req.flush({ ...mockCart, products: [] });
    });
  });

  describe('clearCart', () => {
    it('should clear cart successfully', () => {
      const cartId = 'cart123';
      service['cartSubject'].next(mockCart);

      service.clearCart(cartId).subscribe({
        next: () => {
          // no verificar el response porque es void
          expect(service['cartSubject'].value).toBeNull();
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      expect(req.request.method).toBe('DELETE');
      // ✅ Corrección: agregar statusText cuando se usa status personalizado
      req.flush(null, { status: 204, statusText: 'No Content' });
    });

    it('should handle clear cart errors', () => {
      const cartId = 'cart123';

      service.clearCart(cartId).subscribe({
        next: () => fail('Should have failed'),
        error: error => {
          expect(error.message).toBe('No se pudo limpiar el carrito');
        },
      });

      const req = httpMock.expectOne(`${environment.apiUrl}/cart/${cartId}`);
      req.flush({}, { status: 500, statusText: 'Server Error' });
    });
  });

  describe('getTotalPrice', () => {
    it('should return 0 when cart is null', () => {
      service['cartSubject'].next(null);
      expect(service.getTotalPrice()).toBe(0);
    });

    it('should return 0 when cart has no products', () => {
      const emptyCart: Cart = {
        _id: 'cart123',
        user: 'user123',
        products: [],
      };
      service['cartSubject'].next(emptyCart);
      expect(service.getTotalPrice()).toBe(0);
    });

    it('should calculate total price correctly', () => {
      // Producto cuesta 100, cantidad 2 = 200 total
      service['cartSubject'].next(mockCart);
      expect(service.getTotalPrice()).toBe(200); // 100 * 2
    });

    it('should calculate total with multiple products', () => {
      const cartWithMultipleProducts: Cart = {
        _id: 'cart123',
        user: 'user123',
        products: [
          { _id: 'item1', product: { ...mockProduct, price: 100 }, quantity: 2 }, // 200
          { _id: 'item2', product: { ...mockProduct, price: 50 }, quantity: 3 }, // 150
        ],
      };
      service['cartSubject'].next(cartWithMultipleProducts);
      expect(service.getTotalPrice()).toBe(350); // 200 + 150
    });
  });

  describe('cart$ observable', () => {
    it('should emit cart changes', () => {
      const cartValues: (Cart | null)[] = [];

      service.cart$.subscribe(cart => {
        cartValues.push(cart);
      });

      // Estado inicial
      expect(cartValues[0]).toBeNull();

      // Cambio de estado
      service['cartSubject'].next(mockCart);
      expect(cartValues[1]).toEqual(mockCart);

      // Limpiar carrito
      service['cartSubject'].next(null);
      expect(cartValues[2]).toBeNull();
    });
  });

  it('should call getCart and handle response', (done) => {
    const userId = 'user123';

    service.getCart(userId).subscribe((res) => {
      expect(res).toEqual(mockCartResponse);
      // el servicio debe actualizar el estado interno del carrito
      expect(service['cartSubject'].value).toEqual(mockCart);
      done();
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/cart/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCartResponse);
  });
});
