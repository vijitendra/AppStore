import { queryClient } from "./queryClient";

/**
 * Interface for Play Store app info returned from the API
 */
export interface PlayStoreAppInfo {
  name: string;
  description: string;
  shortDescription: string;
  developer: string;
  category: string;
  icon: string;
  screenshots: string[];
  rating: number;
  version: string;
  downloadCount: string;
}

/**
 * Fetch app information from Google Play Store
 * 
 * @param packageName The Android package name (e.g., com.example.app)
 * @returns Promise with app information or throws error
 */
export async function fetchPlayStoreInfo(packageName: string): Promise<PlayStoreAppInfo> {
  try {
    console.log('Fetching Play Store info for package:', packageName);
    
    const url = `/api/developer/play-store-info?packageName=${encodeURIComponent(packageName)}`;
    console.log('Sending request to:', url);
    
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    console.log('Response status:', response.status);
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch app info from Play Store';
      
      try {
        const errorData = await response.json();
        console.error('Error response data:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // If response is not JSON, try to get text content
        try {
          const errorText = await response.text();
          console.error('Error response text:', errorText);
          if (errorText && errorText.trim()) {
            errorMessage = errorText;
          }
        } catch (textError) {
          console.error('Failed to read error response as text:', textError);
        }
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('Successfully fetched Play Store data:', data);
    return data.data as PlayStoreAppInfo;
  } catch (error) {
    console.error('Error fetching from Play Store:', error);
    throw error;
  }
}

/**
 * Download an image from a URL and convert it to a File object
 * 
 * @param url Image URL
 * @param filename Desired filename
 * @param type MIME type of the image
 * @returns Promise with File object
 */
export async function downloadImageAsFile(url: string, filename: string, type: string = 'image/jpeg'): Promise<File> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download image: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    return new File([blob], filename, { type });
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}