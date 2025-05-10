import axios from 'axios';
import * as cheerio from 'cheerio';

interface PlayStoreAppInfo {
  name: string;
  description: string;
  shortDescription: string;
  developer: string;
  category: string;
  subCategory?: string | null;
  icon: string;
  screenshots: string[];
  rating: number;
  version: string;
  downloadCount: string;
}

/**
 * Fetches app information from Google Play Store by package name
 * 
 * @param packageName The app's package name (e.g., "com.example.app")
 * @returns App information or null if not found
 */
export async function getPlayStoreAppInfo(packageName: string): Promise<PlayStoreAppInfo | null> {
  try {
    // Construct the Play Store URL
    const url = `https://play.google.com/store/apps/details?id=${packageName}&hl=en`;
    
    console.log(`Fetching Play Store data for: ${packageName}`);
    
    // Fetch the HTML content
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      timeout: 10000
    });
    
    if (response.status !== 200) {
      console.error(`Failed to fetch app data. Status: ${response.status}`);
      return null;
    }
    
    // Parse the HTML
    const $ = cheerio.load(response.data);
    
    // Extract app information
    // Note: Play Store's HTML structure may change, so selectors might need updates
    const name = $('h1[itemprop="name"]').text().trim() || 
                $('h1.AHFaub').text().trim() || 
                $('h1').first().text().trim();
    
    // Log HTML content for debugging when needed
    // console.log('HTML content:', response.data);
    
    // Extract app description - updated selectors
    let description = '';
    description = $('div[itemprop="description"]').text().trim();
    if (!description) {
      description = $('div.DWPxHb').text().trim();
    }
    if (!description) {
      // Try with meta data
      const scriptData = $('script[type="application/ld+json"]').text();
      if (scriptData) {
        try {
          const jsonData = JSON.parse(scriptData);
          if (jsonData.description) {
            description = jsonData.description;
          }
        } catch (e) {
          console.error('Failed to parse JSON data from script tag');
        }
      }
    }
    if (!description) {
      // Try generic description container
      description = $('.bARER').text().trim();
    }
    
    // Try to get the short description
    let shortDescription = $('meta[name="description"]').attr('content') || 
                          $('meta[property="og:description"]').attr('content');
    
    if (!shortDescription && description) {
      shortDescription = description.length > 100 ? 
        description.substring(0, 100) + '...' : description;
    }
    
    // Try to get the developer name
    const developer = $('a[itemprop="author"]').text().trim() || 
                    $('a.hrTbp').text().trim() || 
                    $('div.Vbfug a').first().text().trim() || 
                    $('span:contains("Developer")').next().text().trim() ||
                    '';
    
    // Get the category - updated selectors
    let category = $('a[itemprop="genre"]').text().trim() || 
                  $('span.T32cc').text().trim();
                  
    if (!category) {
      // Look for applicationCategory in JSON-LD
      const scriptData = $('script[type="application/ld+json"]').text();
      if (scriptData) {
        try {
          const jsonData = JSON.parse(scriptData);
          if (jsonData.applicationCategory) {
            category = jsonData.applicationCategory;
          }
        } catch (e) {
          // Already handled above
        }
      }
    }
    
    // Get the icon URL - updated selectors
    const icon = $('img.T75of').attr('src') || 
                $('img.gb_yc').attr('src') || 
                $('img[alt="App icon"]').attr('src') ||
                $('img.ujDFqe').attr('src') ||
                '';
    
    // Get screenshot URLs - updated selectors for current Play Store structure
    const screenshots: string[] = [];
    
    // Try multiple selector patterns
    const screenshotSelectors = [
      'img.T75of.DYfLw', 
      'img[alt="Screenshot"]',
      'img.l6OA0e',
      'div.xSyT2c img',
      'img[src*="play-lh.googleusercontent.com"][src*="screenshot"]'
    ];
    
    // Try each selector pattern
    for (const selector of screenshotSelectors) {
      $(selector).each((i: number, el: any) => {
        const src = $(el).attr('src');
        if (src && src.includes('screenshot') && !screenshots.includes(src)) {
          screenshots.push(src);
        }
      });
      
      // If we found screenshots, don't try other selectors
      if (screenshots.length > 0) {
        break;
      }
    }
    
    // If no screenshots found, also look at all images and filter by size/patterns
    if (screenshots.length === 0) {
      $('img').each((i: number, el: any) => {
        const src = $(el).attr('src') || '';
        // Skip icons, which tend to be square
        if (src && 
            src.includes('play-lh.googleusercontent.com') && 
            !src.includes('=w240-h480') && // Filter out icons
            (src.includes('=w526') || src.includes('screenshot'))) {
          screenshots.push(src);
        }
      });
    }
    
    // Check JSON-LD for screenshot URLs
    if (screenshots.length === 0) {
      const scriptData = $('script[type="application/ld+json"]').text();
      if (scriptData) {
        try {
          const jsonData = JSON.parse(scriptData);
          if (jsonData.screenshot) {
            // Single screenshot
            const screenshotUrl = typeof jsonData.screenshot === 'string' ? 
              jsonData.screenshot : jsonData.screenshot.url;
            
            if (screenshotUrl) {
              screenshots.push(screenshotUrl);
            }
          } else if (jsonData.screenshots) {
            // Multiple screenshots
            jsonData.screenshots.forEach((screenshot: string | {url: string}) => {
              const screenshotUrl = typeof screenshot === 'string' ? 
                screenshot : screenshot.url;
              
              if (screenshotUrl) {
                screenshots.push(screenshotUrl);
              }
            });
          }
        } catch (e) {
          console.error('Failed to parse JSON-LD for screenshots');
        }
      }
    }
    
    // Try to get the rating - updated selectors
    let rating = 0;
    const ratingText = $('div.BHMmbe').text().trim() || 
                      $('div.pf5lIe div').attr('aria-label') ||
                      $('div[aria-label*="stars"]').attr('aria-label') ||
                      $('div[aria-label*="Rated"]').attr('aria-label') ||
                      '';
    
    if (ratingText) {
      const ratingMatch = ratingText.match(/([0-9.]+)/);
      if (ratingMatch && ratingMatch[1]) {
        rating = parseFloat(ratingMatch[1]);
      }
    }
    
    // Try to get the version
    const versionText = $('div.hAyfc:contains("Current Version")').next().text().trim() || 
                        $('div:contains("Current Version")').next().text().trim() || 
                        '';
    const version = versionText || '1.0.0';
    
    // Try to get download count
    const downloadCountText = $('div.hAyfc:contains("Downloads")').next().text().trim() || 
                            $('div:contains("Downloads")').next().text().trim() || 
                            '';
    const downloadCount = downloadCountText || '10,000+';
    
    console.log(`Successfully fetched Play Store data for: ${packageName}`);
    
    // Determine subCategory for Video apps
    let subCategory: string | null = null;
    if (category === 'Video Players & Editors' || category === 'Entertainment' || category === 'Video') {
      // Try to determine video subcategory based on app name or description
      const nameAndDesc = (name + ' ' + description).toLowerCase();
      
      if (nameAndDesc.includes('movie') || nameAndDesc.includes('film') || 
          nameAndDesc.includes('cinema') || nameAndDesc.includes('theater')) {
        subCategory = 'Movies';
      } else if (nameAndDesc.includes('short') || nameAndDesc.includes('clip') || 
                nameAndDesc.includes('tiktok') || nameAndDesc.includes('reels')) {
        subCategory = 'Short Videos';
      } else {
        subCategory = 'Videos'; // Default subcategory for Video apps
      }
    }
    
    return {
      name,
      description,
      shortDescription,
      developer,
      category,
      subCategory,
      icon,
      screenshots,
      rating,
      version,
      downloadCount
    };
  } catch (error) {
    console.error(`Error fetching Play Store app info for ${packageName}:`, error);
    return null;
  }
}