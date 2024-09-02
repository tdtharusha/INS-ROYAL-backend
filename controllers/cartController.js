import asyncHandler from 'express-async-handler';
import Cart from '../models/cartModel.js';

// Helper function to calculate cart totals
const calculateCartTotals = (cart) => {
  const subTotal = cart.items.reduce(
    (acc, item) => acc + item.product.unitPrice * item.quantity,
    0
  );
  const discount = 0;
  const total = subTotal - discount;
  return { subTotal, discount, total };
};

// desc - Get user's cart
// route - GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id }).populate(
      'items.product'
    );
    if (cart) {
      const { subTotal, discount, total } = calculateCartTotals(cart);
      res.status(200).json({
        ...cart.toObject(),
        subTotal,
        discount,
        total,
      });
    } else {
      res.status(404).json({ message: 'cart not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// desc - Add item to cart
// route - POST /api/cart
const addtoCart = asyncHandler(async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    // console.log('Received request:', { productId, quantity });

    if (!productId || typeof quantity !== 'number' || isNaN(quantity)) {
      return res
        .status(400)
        .json({ message: 'Invalid product ID or quantity' });
    }

    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({ product: productId, quantity });
    }

    await cart.save();
    await cart.populate('items.product');

    const { subTotal, discount, total } = calculateCartTotals(cart);

    res.status(201).json({
      ...cart.toObject(),
      subTotal,
      discount,
      total,
    });
  } catch (err) {
    console.error('Error in addtoCart:', err);
    res.status(400).json({ message: err.message });
  }
});

// desc - Update cart item qunatity
// route - PUT /api/cart/:productId
const updateCartItem = asyncHandler(async (req, res) => {
  try {
    const { quantity } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product.toString() === req.params.productId
    );
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      const { subTotal, discount, total } = calculateCartTotals(cart);
      res.json({
        ...cart.toObject(),
        subTotal,
        discount,
        total,
      });
    } else {
      res.status(404).json({ message: 'Item not found in cart' });
    }
  } catch (err) {
    console.log('error: ', err);
    res.status(500).json({ message: err.message });
  }
});

// desc - Remove item from cart
// route - DELETE /api/cart/:productId
const removeFromCart = asyncHandler(async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = cart.items.filter(
      (item) => item.product.toString() !== req.params.productId
    );

    await cart.save();

    const { subTotal, discount, total } = calculateCartTotals(cart);

    res.status(200).json({
      ...cart.toObject(),
      subTotal,
      discount,
      total,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: 'An error occurred while removing item from cart' });
  }
});

// desc - Clear cart
// route - DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      res.status(404).json({ message: 'Cart not found' });
    }

    cart.items = [];
    await cart.save();
    res.status(201).json({ message: 'Cart cleared' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export { getCart, addtoCart, updateCartItem, removeFromCart, clearCart };
