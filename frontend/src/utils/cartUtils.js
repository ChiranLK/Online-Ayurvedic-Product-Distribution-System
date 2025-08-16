// Cart utility functions

/**
 * Add a product to the cart
 * @param {string} productId - ID of the product to add
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {object} - Updated cart
 */
export const addToCart = (productId, quantity = 1) => {
  // Get current cart from localStorage or initialize empty array
  const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
  console.log('Cart before update:', cart);
  
  // Check if product already exists in cart
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    // Update quantity if product exists
    cart[existingItemIndex].quantity += quantity;
    console.log('Updated existing item in cart:', cart[existingItemIndex]);
  } else {
    // Add new item if product doesn't exist in cart
    cart.push({ productId, quantity });
    console.log('Added new item to cart:', { productId, quantity });
  }
  
  // Save updated cart to localStorage
  localStorage.setItem('ayurvedicCart', JSON.stringify(cart));
  console.log('Cart saved to localStorage:', JSON.stringify(cart));
  
  // Dispatch custom event to notify other components (like CartIcon) that cart has changed
  window.dispatchEvent(new Event('cartUpdated'));
  console.log('cartUpdated event dispatched');
  
  return cart;
};

/**
 * Update a product's quantity in the cart
 * @param {string} productId - ID of the product to update
 * @param {number} quantity - New quantity
 * @returns {object} - Updated cart
 */
export const updateCartItem = (productId, quantity) => {
  if (quantity < 1) return removeFromCart(productId);
  
  const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
  const existingItemIndex = cart.findIndex(item => item.productId === productId);
  
  if (existingItemIndex >= 0) {
    cart[existingItemIndex].quantity = quantity;
    localStorage.setItem('ayurvedicCart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
  }
  
  return cart;
};

/**
 * Remove a product from the cart
 * @param {string} productId - ID of the product to remove
 * @returns {object} - Updated cart
 */
export const removeFromCart = (productId) => {
  const cart = JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
  const updatedCart = cart.filter(item => item.productId !== productId);
  
  localStorage.setItem('ayurvedicCart', JSON.stringify(updatedCart));
  window.dispatchEvent(new Event('cartUpdated'));
  
  return updatedCart;
};

/**
 * Clear all items from the cart
 */
export const clearCart = () => {
  localStorage.removeItem('ayurvedicCart');
  window.dispatchEvent(new Event('cartUpdated'));
};

/**
 * Get the current cart items
 * @returns {Array} - Cart items
 */
export const getCart = () => {
  return JSON.parse(localStorage.getItem('ayurvedicCart')) || [];
};

/**
 * Get the total number of items in the cart
 * @returns {number} - Total number of items
 */
export const getCartCount = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Check if a product is in the cart
 * @param {string} productId - ID of the product to check
 * @returns {boolean} - True if product is in cart
 */
export const isInCart = (productId) => {
  const cart = getCart();
  return cart.some(item => item.productId === productId);
};
