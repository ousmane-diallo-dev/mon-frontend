import { API_CONFIG } from '../config/api';

/**
 * Converts a backend image path to a full URL
 * @param imagePath - The image path from the backend (e.g., "/uploads/image.jpg")
 * @returns Full URL to the image
 */
export const getImageUrl = (imagePath: string | undefined): string => {
  const defaultImage = "/assets/placeholder.jpg";
  
  if (!imagePath) return defaultImage;
  
  // If it's already a full URL, return as is
  if (imagePath.startsWith('http')) return imagePath;
  
  // If it starts with /uploads/, prepend the backend URL
  if (imagePath.startsWith('/uploads/')) {
    return `${API_CONFIG.baseURL}${imagePath}`;
  }
  
  // If it starts with /, assume it's a backend path
  if (imagePath.startsWith('/')) {
    return `${API_CONFIG.baseURL}${imagePath}`;
  }
  
  // Otherwise, assume it's just a filename and add the uploads path
  return `${API_CONFIG.baseURL}/uploads/${imagePath}`;
};

/**
 * Get the first image URL from a product's images array
 * @param images - Array of image paths
 * @returns Full URL to the first image or placeholder
 */
export const getProductImageUrl = (images: string[] | undefined): string => {
  return images && images.length > 0 ? getImageUrl(images[0]) : getImageUrl(undefined);
};
