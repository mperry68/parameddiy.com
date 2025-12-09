/**
 * Alternative: Web scraper for Pixabay images (NOT RECOMMENDED)
 * 
 * WARNING: This script scrapes Pixabay directly, which may violate their Terms of Service.
 * It's better to use the API version (download-pixabay-images.ts) instead.
 * 
 * This script is provided as an alternative but should only be used if:
 * 1. You cannot get a Pixabay API key
 * 2. You understand the legal implications
 * 3. You respect rate limits and don't overload their servers
 * 
 * Usage:
 *   npx tsx scripts/download-pixabay-scraper.ts
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    writeFileSync(filepath, buffer);
    console.log(`✓ Downloaded: ${filepath}`);
  } catch (error) {
    console.error(`✗ Failed to download ${url}:`, error);
  }
}

async function scrapePixabayPage(url: string): Promise<string[]> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch page: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Pixabay uses JSON data embedded in the page
    // Look for image URLs in the HTML
    const imageUrls: string[] = [];
    
    // Try to find JSON data
    const jsonMatch = html.match(/var\s+imageData\s*=\s*({.*?});/s);
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        if (data.hits && Array.isArray(data.hits)) {
          data.hits.forEach((hit: any) => {
            if (hit.largeImageURL) {
              imageUrls.push(hit.largeImageURL);
            } else if (hit.webformatURL) {
              imageUrls.push(hit.webformatURL);
            }
          });
        }
      } catch (e) {
        console.warn('Could not parse JSON data');
      }
    }

    // Fallback: extract image URLs from img tags
    if (imageUrls.length === 0) {
      const imgRegex = /<img[^>]+src=["']([^"']+\.(jpg|jpeg|png|webp))[^"']*["']/gi;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        const imgUrl = match[1];
        // Filter for actual image URLs (not icons, avatars, etc.)
        if (imgUrl.includes('pixabay.com') && 
            (imgUrl.includes('/photo/') || imgUrl.includes('/__media/'))) {
          // Convert to large format if possible
          const largeUrl = imgUrl.replace(/_\d+\.(jpg|png)/, '_1920.$1');
          imageUrls.push(largeUrl);
        }
      }
    }

    return [...new Set(imageUrls)]; // Remove duplicates
  } catch (error) {
    console.error(`Error scraping page:`, error);
    return [];
  }
}

async function downloadPixabayImagesScraper(
  baseUrl: string = 'https://pixabay.com/images/search/medical/',
  maxImages: number = 1000,
  maxPages: number = 10
): Promise<void> {
  const imagesDir = join(__dirname, '..', 'public', 'images', 'medical');
  
  // Create directory if it doesn't exist
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}`);
  }

  let downloaded = 0;
  let page = 1;

  console.log(`⚠️  WARNING: This scraper may violate Pixabay's Terms of Service.`);
  console.log(`⚠️  Consider using the API version instead (download-pixabay-images.ts)\n`);
  console.log(`Starting download of medical images from Pixabay...`);
  console.log(`Target: ${maxImages} images`);
  console.log(`Saving to: ${imagesDir}\n`);

  while (downloaded < maxImages && page <= maxPages) {
    try {
      const pageUrl = page === 1 
        ? baseUrl 
        : `${baseUrl}?pagi=${page}`;

      console.log(`Scraping page ${page}: ${pageUrl}`);
      
      const imageUrls = await scrapePixabayPage(pageUrl);
      
      if (imageUrls.length === 0) {
        console.log('No images found on this page. Stopping.');
        break;
      }

      console.log(`Found ${imageUrls.length} images on page ${page}\n`);

      // Download each image
      for (const imageUrl of imageUrls) {
        if (downloaded >= maxImages) break;

        const urlParts = imageUrl.split('/');
        const filename = urlParts[urlParts.length - 1].split('?')[0] || `medical-${downloaded + 1}.jpg`;
        const filepath = join(imagesDir, filename);

        // Skip if already downloaded
        if (existsSync(filepath)) {
          console.log(`⊘ Skipped (exists): ${filename}`);
          downloaded++;
          continue;
        }

        await downloadImage(imageUrl, filepath);
        downloaded++;

        // Rate limiting: wait 500ms between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      page++;

      // Rate limiting: wait 2 seconds between pages
      if (downloaded < maxImages && imageUrls.length > 0) {
        console.log(`\nWaiting 2 seconds before next page...\n`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Error on page ${page}:`, error);
      break;
    }
  }

  console.log(`\n✅ Download complete!`);
  console.log(`Total images downloaded: ${downloaded}`);
  console.log(`Images saved to: ${imagesDir}`);
}

async function main() {
  const baseUrl = process.env.PIXABAY_URL || 'https://pixabay.com/images/search/medical/';
  const maxImages = parseInt(process.env.MAX_IMAGES || '1000', 10);
  const maxPages = parseInt(process.env.MAX_PAGES || '10', 10);

  await downloadPixabayImagesScraper(baseUrl, maxImages, maxPages);
}

// Always run main when script is executed
main().catch(console.error);

export { downloadPixabayImagesScraper };

