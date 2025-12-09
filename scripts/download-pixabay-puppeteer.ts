/**
 * Download medical images from Pixabay using Puppeteer
 * 
 * This script uses Puppeteer to scrape Pixabay and download high-quality images.
 * Pixabay images are free and royalty-free, so this is legal for personal/educational use.
 * 
 * Usage:
 *   npx tsx scripts/download-pixabay-puppeteer.ts
 * 
 * Or:
 *   npm run download-images-puppeteer
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ImageInfo {
  id: string;
  largeUrl: string;
  fullUrl: string;
  tags: string;
}

async function downloadImageThroughBrowser(
  page: any,
  url: string,
  filepath: string
): Promise<boolean> {
  try {
    // Use the browser context to download, which includes proper cookies and headers
    const response = await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
    
    if (!response || !response.ok()) {
      throw new Error(`Failed to download: ${response?.statusText() || 'Unknown error'} (${response?.status() || 'N/A'})`);
    }
    
    // Get the response body through the browser context
    const buffer = await response.buffer();
    writeFileSync(filepath, buffer);
    return true;
  } catch (error) {
    // Fallback: try direct fetch with proper headers
    try {
      const fetchResponse = await page.evaluate(async (imgUrl: string) => {
        const res = await fetch(imgUrl, {
          headers: {
            'Referer': 'https://pixabay.com/',
          },
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arrayBuffer = await res.arrayBuffer();
        return Array.from(new Uint8Array(arrayBuffer));
      }, url);
      
      const buffer = Buffer.from(fetchResponse);
      writeFileSync(filepath, buffer);
      return true;
    } catch (fallbackError) {
      console.error(`✗ Failed to download ${url}:`, error instanceof Error ? error.message : error);
      return false;
    }
  }
}

async function scrapePixabayPage(
  browser: any,
  url: string,
  pageNum: number = 1
): Promise<ImageInfo[]> {
  const page = await browser.newPage();
  
  try {
    // Set a realistic viewport
    await page.setViewport({ width: 1920, height: 1080 });
    
    // Set user agent
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`Loading page ${pageNum}: ${url}`);
    
    // Navigate to the page
    await page.goto(url, { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    
    // Wait for images to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Scroll to load lazy-loaded images
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Extract image data from the page
    const images = await page.evaluate(() => {
      const imageElements: ImageInfo[] = [];
      
      // Method 1: Try to extract from JSON-LD or script tags with image data
      const scripts = document.querySelectorAll('script[type="application/ld+json"], script');
      scripts.forEach((script) => {
        const text = script.textContent || '';
        // Look for JSON data containing image information
        if (text.includes('"hits"') || text.includes('imageData') || text.includes('photo')) {
          try {
            // Try to find JSON objects
            const jsonMatches = text.match(/\{[^{}]*"hits"[^{}]*\}/g) || 
                               text.match(/\{[^{}]*"id"[^{}]*\}/g);
            
            if (jsonMatches) {
              jsonMatches.forEach((jsonStr) => {
                try {
                  const data = JSON.parse(jsonStr);
                  if (data.hits && Array.isArray(data.hits)) {
                    data.hits.forEach((hit: any) => {
                      if (hit.id && (hit.largeImageURL || hit.webformatURL)) {
                        imageElements.push({
                          id: hit.id.toString(),
                          largeUrl: hit.largeImageURL || hit.webformatURL,
                          fullUrl: hit.fullHDURL || hit.imageURL || hit.largeImageURL || hit.webformatURL,
                          tags: hit.tags || '',
                        });
                      }
                    });
                  }
                } catch (e) {
                  // Try parsing as part of larger object
                }
              });
            }
            
            // Try to find window.__INITIAL_STATE__ or similar
            const stateMatch = text.match(/window\.__[A-Z_]+__\s*=\s*(\{.*?\});/s);
            if (stateMatch) {
              try {
                const state = JSON.parse(stateMatch[1]);
                if (state.hits || state.images) {
                  const hits = state.hits || state.images || [];
                  hits.forEach((hit: any) => {
                    if (hit.id && (hit.largeImageURL || hit.webformatURL)) {
                      imageElements.push({
                        id: hit.id.toString(),
                        largeUrl: hit.largeImageURL || hit.webformatURL,
                        fullUrl: hit.fullHDURL || hit.imageURL || hit.largeImageURL || hit.webformatURL,
                        tags: hit.tags || '',
                      });
                    }
                  });
                }
              } catch (e) {
                // Skip
              }
            }
          } catch (e) {
            // Skip if parsing fails
          }
        }
      });
      
      // Method 2: Extract from image links and data attributes
      const links = document.querySelectorAll('a[href*="/photos/"], a[href*="/photo/"]');
      links.forEach((link: any) => {
        try {
          const href = link.getAttribute('href');
          if (!href) return;
          
          // Extract image ID from URL
          const idMatch = href.match(/\/(\d+)\//) || href.match(/-(\d+)(?:\/|$)/);
          if (!idMatch) return;
          
          const imageId = idMatch[1];
          
          // Find the image element
          const img = link.querySelector('img') || link.querySelector('picture img');
          if (!img) return;
          
          // Get image URL
          let imgUrl = img.getAttribute('src') || 
                      img.getAttribute('data-src') || 
                      img.getAttribute('data-lazy') ||
                      img.getAttribute('data-lazy-src') ||
                      '';
          
          if (!imgUrl) {
            // Try to get from source set
            const srcset = img.getAttribute('srcset');
            if (srcset) {
              const matches = srcset.match(/(https?:\/\/[^\s]+)/);
              if (matches) imgUrl = matches[1];
            }
          }
          
          if (!imgUrl) return;
          
          // Convert to highest quality (1920px or full HD)
          let fullUrl = imgUrl;
          if (imgUrl.includes('_640')) {
            fullUrl = imgUrl.replace('_640', '_1920');
          } else if (imgUrl.includes('_1280')) {
            fullUrl = imgUrl.replace('_1280', '_1920');
          } else if (imgUrl.includes('_340')) {
            fullUrl = imgUrl.replace('_340', '_1920');
          } else if (imgUrl.includes('_180')) {
            fullUrl = imgUrl.replace('_180', '_1920');
          } else if (!imgUrl.includes('_1920') && !imgUrl.includes('full')) {
            // Try to construct full URL
            // Pixabay CDN pattern: https://cdn.pixabay.com/photo/YYYY/MM/DD/XX/XX/ID-XXXXXX_1920.jpg
            fullUrl = `https://cdn.pixabay.com/photo/${imageId}/_1920.jpg`;
          }
          
          const tags = img.getAttribute('alt') || link.getAttribute('title') || '';
          
          imageElements.push({
            id: imageId,
            largeUrl: imgUrl,
            fullUrl: fullUrl,
            tags: tags,
          });
        } catch (e) {
          // Skip this link
        }
      });
      
      // Method 3: Direct image tags with pixabay URLs
      const directImgs = document.querySelectorAll('img[src*="pixabay"], img[src*="cdn.pixabay"]');
      directImgs.forEach((img: any) => {
        try {
          const src = img.getAttribute('src') || img.getAttribute('data-src') || '';
          if (!src || !src.includes('pixabay')) return;
          
          // Extract ID from URL
          const idMatch = src.match(/(\d+)(?:_\d+)?\.(jpg|png|webp)/);
          if (!idMatch) return;
          
          const imageId = idMatch[1];
          
          // Convert to full quality
          let fullUrl = src;
          if (src.includes('_640')) {
            fullUrl = src.replace('_640', '_1920');
          } else if (src.includes('_1280')) {
            fullUrl = src.replace('_1280', '_1920');
          } else if (src.includes('_340')) {
            fullUrl = src.replace('_340', '_1920');
          } else if (!src.includes('_1920')) {
            fullUrl = `https://cdn.pixabay.com/photo/${imageId}/_1920.jpg`;
          }
          
          imageElements.push({
            id: imageId,
            largeUrl: src,
            fullUrl: fullUrl,
            tags: img.getAttribute('alt') || '',
          });
        } catch (e) {
          // Skip
        }
      });
      
      // Remove duplicates based on ID
      const unique: ImageInfo[] = [];
      const seen = new Set<string>();
      imageElements.forEach((img) => {
        if (!seen.has(img.id) && img.fullUrl && img.fullUrl.startsWith('http')) {
          seen.add(img.id);
          unique.push(img);
        }
      });
      
      return unique;
    });
    
    await page.close();
    return images;
  } catch (error) {
    await page.close();
    console.error(`Error scraping page:`, error);
    return [];
  }
}

async function downloadPixabayImagesPuppeteer(
  baseUrl: string = 'https://pixabay.com/images/search/medical/',
  maxImages: number = 1000,
  maxPages: number = 20
): Promise<void> {
  const imagesDir = join(__dirname, '..', 'public', 'images', 'medical');
  
  // Create directory if it doesn't exist
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}`);
  }

  console.log(`Starting download of medical images from Pixabay...`);
  console.log(`Target: ${maxImages} images`);
  console.log(`Saving to: ${imagesDir}\n`);

  // Launch browser
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  let downloaded = 0;
  let page = 1;
  const allImageIds = new Set<string>();

  try {
    while (downloaded < maxImages && page <= maxPages) {
      const pageUrl = page === 1 
        ? baseUrl 
        : `${baseUrl}?pagi=${page}`;

      console.log(`\n=== Page ${page} ===`);
      
      const images = await scrapePixabayPage(browser, pageUrl, page);
      
      if (images.length === 0) {
        console.log('No images found on this page. Stopping.');
        break;
      }

      console.log(`Found ${images.length} unique images on page ${page}`);

      // Download each image using browser context
      const downloadPage = await browser.newPage();
      await downloadPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      
      for (const image of images) {
        if (downloaded >= maxImages) break;
        if (allImageIds.has(image.id)) {
          console.log(`⊘ Skipped (duplicate): medical-${image.id}`);
          continue;
        }

        const extension = image.fullUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const filename = `medical-${image.id}.${extension}`;
        const filepath = join(imagesDir, filename);

        // Skip if already downloaded
        if (existsSync(filepath)) {
          console.log(`⊘ Skipped (exists): ${filename}`);
          downloaded++;
          allImageIds.add(image.id);
          continue;
        }

        console.log(`Downloading: ${filename} (ID: ${image.id})`);
        const success = await downloadImageThroughBrowser(downloadPage, image.fullUrl, filepath);
        
        if (success) {
          downloaded++;
          allImageIds.add(image.id);
          console.log(`✓ Downloaded: ${filename}`);
        }

        // Rate limiting: wait 500ms between downloads
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      await downloadPage.close();

      page++;

      // Rate limiting: wait 2 seconds between pages
      if (downloaded < maxImages && images.length > 0) {
        console.log(`\nWaiting 2 seconds before next page...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\n✅ Download complete!`);
  console.log(`Total images downloaded: ${downloaded}`);
  console.log(`Images saved to: ${imagesDir}`);
}

async function main() {
  const baseUrl = process.env.PIXABAY_URL || 'https://pixabay.com/images/search/medical/';
  const maxImages = parseInt(process.env.MAX_IMAGES || '1000', 10);
  const maxPages = parseInt(process.env.MAX_PAGES || '20', 10);

  await downloadPixabayImagesPuppeteer(baseUrl, maxImages, maxPages);
}

// Always run main when script is executed
main().catch(console.error);

export { downloadPixabayImagesPuppeteer };

