const Order = require('../models/Order');
const Product = require('../models/Product');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private/Customer
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No order items' });
    }

    // Get product details and validate stock
    const productIds = items.map(item => item.productId);
    const products = await Product.find({ _id: { $in: productIds } });

    // Calculate prices and check stock
    let totalPrice = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p._id.toString() === item.productId);
      
      if (!product) {
        return res.status(404).json({ message: `Product not found: ${item.productId}` });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
      }

      const itemPrice = product.price * item.quantity;
      totalPrice += itemPrice;

      orderItems.push({
        productId: product._id,
        name: product.name,
        quantity: item.quantity,
        price: product.price,
        sellerId: product.sellerId
      });

      // Update product stock
      product.stock -= item.quantity;
      await product.save();
    }

    // Create order
    const order = await Order.create({
      customerId: req.user.id,
      items: orderItems,
      deliveryAddress: deliveryAddress,
      paymentMethod,
      totalAmount: totalPrice,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all orders (filtered based on user role)
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res) => {
  try {
    console.log(`Getting orders for user role: ${req.user.role}, user ID: ${req.user.id}`);
    let filter = {};
    
    // Filter orders based on user role
    if (req.user.role === 'customer') {
      // Customers can only see their own orders
      filter.customerId = req.user.id;
      console.log('Filter set for customer role:', filter);
    } else if (req.user.role === 'seller') {
      // Sellers can see orders containing their products
      filter = { 'items.sellerId': req.user.id };
      console.log('Filter set for seller role:', filter);
    } else {
      console.log('No filter set, assuming admin role');
    }
    // Admins can see all orders (no filter)

    console.log('Fetching orders with filter:', filter);
    const orders = await Order.find(filter)
      .populate('customerId', 'name email')
      .populate('items.productId', 'name price imageUrl')
      .populate('items.sellerId', 'name email')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${orders.length} orders`);
    console.log('First order sample:', orders.length > 0 ? orders[0] : 'No orders found');
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customerId', 'name email phone')
      .populate('items.productId', 'name imageUrl');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions based on role
    if (
      req.user.role === 'customer' && 
      order.customerId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (
      req.user.role === 'seller' && 
      !order.items.some(item => item.sellerId.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id
// @access  Private/Seller or Admin
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions for sellers
    if (
      req.user.role === 'seller' && 
      !order.items.some(item => item.sellerId.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    order.status = status;
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update order (by customer)
// @route   PUT /api/orders/:id
// @access  Private/Customer
exports.updateOrder = async (req, res) => {
  try {
    const { shippingAddress, notes, items } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Check permissions - only customer who placed the order can update it
    if (order.customerId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Access denied - you can only update your own orders' });
    }
    
    // Check order status - can only update orders with status Pending or Processing
    if (!['Pending', 'Processing'].includes(order.status)) {
      return res.status(400).json({ 
        message: `Orders with status "${order.status}" cannot be edited` 
      });
    }
    
    // Update allowed fields
    if (shippingAddress) order.shippingAddress = shippingAddress;
    if (notes) order.notes = notes;
    
    // Update items quantities if provided
    if (items && items.length > 0) {
      // Validate all items exist in the original order
      for (const item of items) {
        const orderItem = order.items.find(
          oi => oi.productId.toString() === item.productId
        );
        
        if (!orderItem) {
          return res.status(400).json({ 
            message: `Item with ID ${item.productId} not found in original order` 
          });
        }
        
        // Calculate quantity difference and check stock
        const qtyDiff = item.quantity - orderItem.quantity;
        
        if (qtyDiff > 0) {
          // Customer wants to increase quantity, check product stock
          const product = await Product.findById(item.productId);
          if (!product || product.stock < qtyDiff) {
            return res.status(400).json({ 
              message: `Insufficient stock for product ID: ${item.productId}` 
            });
          }
          
          // Update product stock
          product.stock -= qtyDiff;
          await product.save();
        } else if (qtyDiff < 0) {
          // Customer wants to decrease quantity, return stock
          const product = await Product.findById(item.productId);
          if (product) {
            product.stock += Math.abs(qtyDiff);
            await product.save();
          }
        }
        
        // Update quantity in the order
        orderItem.quantity = item.quantity;
        // Recalculate subtotal
        orderItem.subtotal = orderItem.price * item.quantity;
      }
      
      // Recalculate order total
      order.totalAmount = order.items.reduce(
        (sum, item) => sum + (item.price * item.quantity), 0
      );
    }
    
    // Add history record for this update
    order.history.push({
      date: new Date(),
      status: order.status,
      note: 'Order updated by customer'
    });
    
    await order.save();
    
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    console.error('Update order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete order (admin only)
// @route   DELETE /api/orders/:id
// @access  Private/Admin
exports.deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    await order.remove();
    
    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    console.error('Delete order error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get seller orders
// @route   GET /api/orders/seller
// @access  Private/Seller
exports.getSellerOrders = async (req, res) => {
  try {
    // Find orders where at least one item was sold by this seller
    const orders = await Order.find({ 'items.sellerId': req.user.id })
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Get seller orders error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
