import asyncHandler from 'express-async-handler';
//import 'core-js/modules/es.string.replace.js';
import { Client } from '@googlemaps/google-maps-services-js';
import Order from '../models/orderModel.js';
import Cart from '../models/cartModel.js';
import User from '../models/userModel.js';
import { sendNotification } from './notificationController.js';
import { updateInHouseInventoryFromOrder } from './InHouseMadeFoodsController.js';
import { updatePreMadeInventoryFromOrder } from './PreMadeFoodsInventoryController.js';

const client = new Client({});

const calculateShippingPrice = asyncHandler(async (req, res) => {
  const { address, city, country } = req.body;

  if (!address || !city || !country) {
    return res.status(400).json({ message: 'All address fields are required' });
  }

  try {
    const fullAddress = `${address}, ${city},${country}`;
    const restaurantAddress = process.env.RESTAURANT_ADDRESS;
    const deliveryRate = parseFloat(process.env.DELIVERY_RATE) || 150; // Default to 150 if not set

    // Get coordinates for restaurant address
    const restaurantGeocode = await client.geocode({
      params: {
        address: restaurantAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (restaurantGeocode.data.results.length === 0) {
      throw new Error('Unable to geocode restaurant address');
    }

    const restaurantCoords =
      restaurantGeocode.data.results[0].geometry.location;

    // Get coordinates for shipping address
    const shippingGeocode = await client.geocode({
      params: {
        address: fullAddress,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (shippingGeocode.data.results.length === 0) {
      throw new Error('Unable to geocode shipping address');
    }

    const shippingCoords = shippingGeocode.data.results[0].geometry.location;

    // Use Distance Matrix API for accurate distance calculation
    const response = await client.distancematrix({
      params: {
        origins: [`${restaurantCoords.lat},${restaurantCoords.lng}`],
        destinations: [`${shippingCoords.lat},${shippingCoords.lng}`],
        mode: 'driving',
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    });

    if (response.data.rows[0].elements[0].status !== 'OK') {
      throw new Error('Unable to calculate distance');
    }

    const distanceInMeters = response.data.rows[0].elements[0].distance.value;
    const distanceInKm = distanceInMeters / 1000;

    // Calculate shipping price
    let shippingPrice = 0;
    if (distanceInKm <= 1) {
      shippingPrice = 0; // Free delivery within 1 km
    } else {
      shippingPrice = Math.ceil(distanceInKm - 1) * deliveryRate;
    }

    return res.status(200).json({
      shippingPrice: Math.round(shippingPrice * 100) / 100, // Round to 2 decimal places
      distance: Math.round(distanceInKm * 100) / 100, // Round to 2 decimal places
      shippingCoordinates: {
        lat: shippingCoords.lat,
        lng: shippingCoords.lng,
      },
      restaurantCoordinates: {
        lat: restaurantCoords.lat,
        lng: restaurantCoords.lng,
      },
    });
  } catch (err) {
    console.error('Shipping price calculation error:', err);
    res.status(500).json({
      message: 'Failed to calculate shipping price',
      error: err.message,
    });
  }
});

// Create new order
// POST /api/orders
const createOrder = asyncHandler(async (req, res) => {
  const {
    shippingMethod,
    pickupDateTime,
    shippingAddress,
    paymentMethod,
    coordinates, // Received from frontend
  } = req.body;

  // Fetch the user's cart
  const cart = await Cart.findOne({ user: req.user._id }).populate(
    'items.product'
  );

  if (!cart || cart.items.length === 0) {
    return res.status(400).json('No items in cart');
  }
  let shippingPrice = 0;
  let distance = 0;
  let shippingCoordinates = null;

  // Create orderItems from cart items
  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.unitPrice,
    image: item.product.image,
  }));

  const subTotal = orderItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  );
  const discount = 0;
  let totalPrice = subTotal - discount;

  if (shippingMethod === 'delivery') {
    try {
      const { address, city, country } = shippingAddress;
      const shippingDetails = await calculateShippingPrice(
        {
          body: { address, city, country },
        },
        {
          json: (data) => data,
          status: () => ({ json: (data) => data }),
        }
      );

      shippingPrice = shippingDetails.shippingPrice;
      distance = shippingDetails.distance;
      shippingCoordinates = shippingDetails.shippingCoordinates;
      totalPrice += shippingPrice;
    } catch (error) {
      console.error('Error calculating shipping:', error);
      return res.status(400).json({
        message: 'Unable to calculate shipping for the given address',
      });
    }
  } else if (shippingMethod === 'pickup') {
    // Validate pickup date and time
    const pickupDate = new Date(pickupDateTime);
    const currentDate = new Date();
    const hourDifference = (pickupDate - currentDate) / (1000 * 60 * 60);

    if (hourDifference < 1) {
      return res
        .status(400)
        .json(
          'Pickup time must be at least 1 hour after the order creation time'
        );
    }
  }

  const order = new Order({
    user: req.user._id,
    orderItems,
    shippingMethod,
    paymentMethod,
    shippingAddress: shippingMethod === 'delivery' ? shippingAddress : null,
    subTotal,
    discount,
    shippingPrice,
    totalPrice,
    totalPrice,
    location:
      shippingMethod === 'delivery'
        ? {
            type: 'Point',
            coordinates: [shippingCoordinates.lng, shippingCoordinates.lat],
          }
        : null,
    distance,
    pickupDateTime: shippingMethod === 'pickup' ? pickupDateTime : null,
    isPaid: paymentMethod === 'card',
    paidAt: paymentMethod === 'card' ? Date.now() : null,
  });

  try {
    const createdOrder = await order.save();

    // Update inventory based on product category
    const inHouseMadeItems = orderItems.filter(
      (item) => item.product.category === 'In-house-made-foods'
    );
    const preMadeItems = orderItems.filter(
      (item) => item.product.category === 'Pre-made-foods'
    );

    if (inHouseMadeItems.length > 0) {
      await updateInHouseInventoryFromOrder(inHouseMadeItems);
    }

    if (preMadeItems.length > 0) {
      await updatePreMadeInventoryFromOrder(preMadeItems);
    }

    // Send notification
    await sendNotification(req.user, 'orderCreation', createdOrder);

    // Clear the cart after creating the order
    await Cart.findOneAndUpdate(
      { user: req.user._id },
      { $set: { items: [] } }
    );

    res.status(201).json(createdOrder);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Failed to create order' });
  }
});

// Get order by ID
// GET /api/orders/:id
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate(
    'user',
    'name email'
  );

  if (order) {
    res.status(200).json(order);
  } else {
    res.status(404).json('Order not found');
  }
});

// Update order status
// PUT /api/orders/:id/status
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.status = req.body.status || order.status;
    const updatedOrder = await order.save();
    console.log('updated order: ', updatedOrder);
    // Send notification for order status change
    const user = await User.findById(order.user);
    console.log('email user: ', user);
    await sendNotification(user, 'orderStatusChange', updatedOrder);

    res.status(201).json(updatedOrder);
  } else {
    res.status(404).json('Order not found');
  }
});

// Update order to paid
// PUT /api/orders/:id/pay
const updateOrderToPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    order.isPaid = true;
    order.paidAt = Date.now();
    order.paymentResult = {
      id: req.body.id,
      status: req.body.status,
      update_time: req.body.update_time,
      email_address: req.body.payer.email_address,
    };

    const updatedOrder = await order.save();
    res.status(201).json(updatedOrder);
  } else {
    res.status(404).json('Order not found');
  }
});

// Delete order
// DELETE /api/orders/:id
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order) {
    if (order.status !== 'New') {
      res.status(400).json('Can only delete orders with "New" status');
    }
    await order.deleteOne();
    res.status(200).json({ message: 'Order removed' });
  } else {
    res.status(404).json('Order not found');
  }
});

// Get logged in user orders
// GET /api/orders/myorders
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.status(200).json(orders);
});

// Get all orders (admin only)
// GET /api/orders
const getOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'id name');
  res.status(200).json(orders);
});

export {
  calculateShippingPrice,
  createOrder,
  getOrderById,
  updateOrderStatus,
  updateOrderToPaid,
  deleteOrder,
  getMyOrders,
  getOrders,
};
