/**
 * Utility functions for handling images in the application
 */

// Base URL for the API server
// Use environment variable if available, otherwise fallback to localhost:5000
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
console.log('Image utils using API base URL:', API_BASE_URL);

/**
 * Gets the full URL for an image from its relative path
 * @param {string} imageUrl - The image URL stored in the database
 * @returns {string} - The full URL that can be used in an img src attribute
 */
export const getFullImageUrl = (imageUrl) => {
  if (!imageUrl) {
    console.log('No image URL provided, using placeholder');
    return 'https://via.placeholder.com/300x200?text=No+Image';
  }
  
  // Log the incoming URL
  console.log('Processing image URL:', imageUrl);
  
  // If the image URL is already absolute, return it as is
  if (imageUrl.startsWith('http') || imageUrl.startsWith('data:')) {
    console.log('Image URL is absolute, returning as is');
    return imageUrl;
  }
  
  try {
    // Make sure the image URL starts with a slash if it doesn't
    const formattedUrl = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`;
    
    // Check if the URL contains "uploads" directory, if not, add it
    const uploadsPath = formattedUrl.includes('/uploads/') ? formattedUrl : 
      formattedUrl.startsWith('/uploads') ? formattedUrl : `/uploads${formattedUrl}`;
    
    // Otherwise, prepend the API base URL
    const fullUrl = `${API_BASE_URL}${uploadsPath}`;
    console.log('Constructed full image URL:', fullUrl);
    return fullUrl;
  } catch (error) {
    console.error('Error constructing image URL:', error);
    return 'https://via.placeholder.com/300x200?text=Image+Error';
  }
};

/**
 * Handles image loading errors by setting a placeholder image
 * @param {Event} event - The error event from the image
 */
export const handleImageError = (event) => {
  console.error('Image loading error for:', event.target.src);
  event.target.onerror = null; // Prevent infinite loop
  
  // Try to determine the type of product from the element's context
  const elementWidth = event.target.width;
  const elementHeight = event.target.height;
  
  // Choose a placeholder that matches the element's dimensions better
  let placeholder = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
  
  // If it's a small image (like a thumbnail), use a smaller placeholder
  if (elementWidth < 100 || elementHeight < 100) {
    placeholder = 'https://via.placeholder.com/100x100?text=No+Image';
  }
  
  event.target.src = placeholder;
  
  // Add a class to indicate it's a placeholder (for potential styling)
  event.target.classList.add('image-placeholder');
};
