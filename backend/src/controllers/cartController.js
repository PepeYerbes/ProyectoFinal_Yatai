import Cart from '../models/cart.js';
import Product from '../models/product.js';
import errorHandler from '../middlewares/errorHandler.js';

async function getCarts(req, res, next) {
  try {
    const carts = await Cart.find().populate('user').populate('products.product');
    res.json(carts);
  } catch (error) {
    next(error);
  }
}

async function getCartById(req, res, next) {
  try {
    const id = req.params.id;
    const cart = await Cart.findById(id).populate('user').populate('products.product');
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    res.json(cart);
  } catch (error) {
    next(error);
  }
}

async function getCartByUser(req, res, next) {
  try {
    const userId = req.params.id;
    const cart = await Cart.findOne({ user: userId }).populate('user').populate('products.product');
    
    res.json({
      message: 'Carrito obtenido correctamente',
      cart: cart || null
    });
  } catch (error) {
    next(error);
  }
}

async function createCart(req, res, next) {
  try {
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ error: 'User and products array are required' });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ error: 'Each product must have product ID and quantity >= 1' });
      }
    }

    const newCart = await Cart.create({
      user,
      products
    });

    await newCart.populate('user');
    await newCart.populate('products.product');

    res.status(201).json(newCart);
  } catch (error) {
    next(error);
  }
}

async function updateCart(req, res, next) {
  try {
    const { id } = req.params;
    const { user, products } = req.body;
    if (!user || !products || !Array.isArray(products)) {
      return res.status(400).json({ 
        message: 'User and products array are required',
        cart: null 
      });
    }

    // Validar que cada producto tenga los campos requeridos
    for (const item of products) {
      if (!item.product || !item.quantity || item.quantity < 1) {
        return res.status(400).json({ 
          message: 'Each product must have product ID and quantity >= 1',
          cart: null 
        });
      }
    }

    const updatedCart = await Cart.findByIdAndUpdate(id,
      { user, products },
      { new: true }
    ).populate('user').populate('products.product');

    if (updatedCart) {
      return res.status(200).json({
        message: 'Carrito actualizado correctamente',
        cart: updatedCart
      });
    } else {
      return res.status(404).json({ 
        message: 'Cart not found',
        cart: null 
      });
    }
  } catch (error) {
    next(error);
  }
}

async function deleteCart(req, res) {
  try {
    const { id } = req.params;
    const deletedCart = await Cart.findByIdAndDelete(id);

    if (deletedCart) {
      return res.status(200).json({
        message: 'Carrito eliminado correctamente',
        cart: null
      });
    } else {
      return res.status(404).json({ 
        message: 'Cart not found',
        cart: null 
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Error eliminando carrito',
      cart: null,
      error 
    });
  }
}

async function addProductToCart(req, res, next) {
  try {
    const { userId, productId, quantity = 1 } = req.body;

    if (!userId || !productId || quantity < 1) {
      return res.status(400).json({ 
        message: 'User ID, product ID, and valid quantity are required',
        cart: null 
      });
    }

    // Obtener el producto para validar stock
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado',
        cart: null
      });
    }

    // Buscar el carrito del usuario
    let cart = await Cart.findOne({ user: userId });
    
    // Calcular cantidad total que sería después de agregar
    let currentQuantityInCart = 0;
    if (cart) {
      const existingProduct = cart.products.find(
        item => item.product.toString() === productId
      );
      currentQuantityInCart = existingProduct?.quantity || 0;
    }

    const totalQuantity = currentQuantityInCart + quantity;

    // Validar que no exceda el stock disponible
    if (totalQuantity > product.stock) {
      return res.status(400).json({
        message: `Stock insuficiente. Stock disponible: ${product.stock}. Cantidad en carrito: ${currentQuantityInCart}. Máximo a agregar: ${Math.max(0, product.stock - currentQuantityInCart)}`,
        cart: null
      });
    }

    if (!cart) {
      // Si no existe carrito, crear uno nuevo
      cart = new Cart({
        user: userId,
        products: [{ product: productId, quantity }]
      });
    } else {
      // Si existe carrito, verificar si el producto ya está
      const existingProductIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (existingProductIndex >= 0) {
        // Si el producto ya existe, actualizar cantidad
        cart.products[existingProductIndex].quantity += quantity;
      } else {
        // Si el producto no existe, agregarlo
        cart.products.push({ product: productId, quantity });
      }
    }

    await cart.save();
    await cart.populate('user');
    await cart.populate('products.product');

    res.status(200).json({
      message: 'Producto agregado al carrito',
      cart: cart
    });
  } catch (error) {
    next(error);
  }
}

export {
  getCarts,
  getCartById,
  getCartByUser,
  createCart,
  updateCart,
  deleteCart,
  addProductToCart,
};