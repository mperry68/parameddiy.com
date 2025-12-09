/**
 * Download medical images from Pixabay
 * 
 * This script uses the Pixabay API to download medical images.
 * 
 * IMPORTANT: You need a Pixabay API key to use this script.
 * Get your free API key at: https://pixabay.com/api/docs/
 * 
 * Usage:
 *   npx tsx scripts/download-pixabay-images.ts
 * 
 * Or set environment variable:
 *   PIXABAY_API_KEY=your_key_here npx tsx scripts/download-pixabay-images.ts
 * 
 * Or add to package.json:
 *   "download-images": "tsx scripts/download-pixabay-images.ts"
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface PixabayImage {
  id: number;
  pageURL: string;
  type: string;
  tags: string;
  previewURL: string;
  previewWidth: number;
  previewHeight: number;
  webformatURL: string;
  webformatWidth: number;
  webformatHeight: number;
  largeImageURL: string;
  imageWidth: number;
  imageHeight: number;
  imageSize: number;
  views: number;
  downloads: number;
  collections: number;
  likes: number;
  comments: number;
  user_id: number;
  user: string;
  userImageURL: string;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayImage[];
}

async function downloadImage(url: string, filepath: string): Promise<void> {
  try {
    const response = await fetch(url);
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

async function downloadPixabayImages(
  apiKey: string,
  query: string = 'medical',
  perPage: number = 200,
  maxImages: number = 1000
): Promise<void> {
  const imagesDir = join(__dirname, '..', 'public', 'images', 'medical');
  
  // Create directory if it doesn't exist
  if (!existsSync(imagesDir)) {
    mkdirSync(imagesDir, { recursive: true });
    console.log(`Created directory: ${imagesDir}`);
  }

  let downloaded = 0;
  let page = 1;
  const maxPages = Math.ceil(maxImages / perPage);

  console.log(`Starting download of medical images from Pixabay...`);
  console.log(`Target: ${maxImages} images`);
  console.log(`Saving to: ${imagesDir}\n`);

  while (downloaded < maxImages && page <= maxPages) {
    try {
      const url = new URL('https://pixabay.com/api/');
      url.searchParams.set('key', apiKey);
      url.searchParams.set('q', query);
      url.searchParams.set('image_type', 'photo');
      url.searchParams.set('orientation', 'horizontal');
      url.searchParams.set('category', 'health');
      url.searchParams.set('safesearch', 'true');
      url.searchParams.set('per_page', perPage.toString());
      url.searchParams.set('page', page.toString());

      console.log(`Fetching page ${page}...`);
      const response = await fetch(url.toString());
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data: PixabayResponse = await response.json();

      if (data.hits.length === 0) {
        console.log('No more images found.');
        break;
      }

      console.log(`Found ${data.hits.length} images on page ${page}`);
      console.log(`Total available: ${data.totalHits} images\n`);

      // Download each image
      for (const image of data.hits) {
        if (downloaded >= maxImages) break;

        // Use largeImageURL for best quality
        const imageUrl = image.largeImageURL;
        const extension = imageUrl.split('.').pop()?.split('?')[0] || 'jpg';
        const filename = `medical-${image.id}.${extension}`;
        const filepath = join(imagesDir, filename);

        // Skip if already downloaded
        if (existsSync(filepath)) {
          console.log(`⊘ Skipped (exists): ${filename}`);
          downloaded++;
          continue;
        }

        await downloadImage(imageUrl, filepath);
        downloaded++;

        // Rate limiting: wait 100ms between downloads
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      page++;

      // Rate limiting: wait 1 second between API requests
      if (downloaded < maxImages && data.hits.length > 0) {
        console.log(`\nWaiting 1 second before next page...\n`);
        await new Promise(resolve => setTimeout(resolve, 1000));
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
  // Get API key from environment variable or prompt
  const apiKey = process.env.PIXABAY_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: PIXABAY_API_KEY environment variable is required');
    console.error('\nTo get a free API key:');
    console.error('1. Visit https://pixabay.com/api/docs/');
    console.error('2. Sign up for a free account');
    console.error('3. Get your API key');
    console.error('\nThen run:');
    console.error('  PIXABAY_API_KEY=your_key_here npx tsx scripts/download-pixabay-images.ts');
    console.error('\nOr on Windows PowerShell:');
    console.error('  $env:PIXABAY_API_KEY="your_key_here"; npx tsx scripts/download-pixabay-images.ts');
    process.exit(1);
  }

  // Configuration
  const query = process.env.PIXABAY_QUERY || 'medical';
  const maxImages = parseInt(process.env.MAX_IMAGES || '1000', 10);
  const perPage = 200; // Max allowed by Pixabay API

  await downloadPixabayImages(apiKey, query, perPage, maxImages);
}

// Always run main when script is executed
main().catch(console.error);

export { downloadPixabayImages };

