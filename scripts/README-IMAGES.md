# Downloading Medical Images from Pixabay

This directory contains scripts to download medical images from Pixabay for use in your website.

## ⚠️ Important Notes

- **Pixabay images are free to use** under their license, but you should:
  - Credit the photographers when possible
  - Review Pixabay's license terms: https://pixabay.com/service/terms/
  - Ensure images are appropriate for medical/health content

## Method 1: Using Pixabay API (Recommended) ✅

The recommended approach uses Pixabay's official API, which is:
- Legal and compliant with their Terms of Service
- More reliable and faster
- Provides better image quality options
- Free API key available

### Setup

1. **Get a free Pixabay API key:**
   - Visit: https://pixabay.com/api/docs/
   - Sign up for a free account
   - Get your API key from the dashboard

2. **Set the API key as an environment variable:**

   **Windows PowerShell:**
   ```powershell
   $env:PIXABAY_API_KEY="your_api_key_here"
   ```

   **Windows CMD:**
   ```cmd
   set PIXABAY_API_KEY=your_api_key_here
   ```

   **Linux/Mac:**
   ```bash
   export PIXABAY_API_KEY=your_api_key_here
   ```

3. **Run the script:**
   ```bash
   npm run download-images
   ```

   Or directly:
   ```bash
   npx tsx scripts/download-pixabay-images.ts
   ```

### Configuration

You can customize the download with environment variables:

```bash
# Change search query (default: "medical")
PIXABAY_QUERY=healthcare

# Limit number of images (default: 1000)
MAX_IMAGES=500

# Set API key
PIXABAY_API_KEY=your_key_here
```

**Example:**
```powershell
$env:PIXABAY_API_KEY="your_key"
$env:MAX_IMAGES="500"
npm run download-images
```

### Output

Images will be saved to:
```
public/images/medical/
```

Files are named: `medical-{id}.{extension}`

## Method 2: Web Scraper (Not Recommended) ⚠️

A web scraper is provided as an alternative, but **this may violate Pixabay's Terms of Service**. Use at your own risk.

### Usage

```bash
npm run download-images-scraper
```

Or directly:
```bash
npx tsx scripts/download-pixabay-scraper.ts
```

### Configuration

```bash
# Change URL (default: https://pixabay.com/images/search/medical/)
PIXABAY_URL=https://pixabay.com/images/search/healthcare/

# Limit number of images (default: 1000)
MAX_IMAGES=500

# Limit number of pages to scrape (default: 10)
MAX_PAGES=5
```

## Image Usage in Your Site

After downloading, you can use images in your articles:

```markdown
![Medical equipment](/images/medical/medical-12345.jpg)
```

Or in Astro components:

```astro
<img src="/images/medical/medical-12345.jpg" alt="Medical equipment" />
```

## Rate Limiting

Both scripts include rate limiting to be respectful:
- API version: 100ms between downloads, 1 second between API calls
- Scraper version: 500ms between downloads, 2 seconds between pages

## Troubleshooting

### "PIXABAY_API_KEY environment variable is required"

Make sure you've set the API key as an environment variable before running the script.

### "API request failed"

- Check your API key is correct
- Verify you haven't exceeded rate limits
- Check your internet connection

### Images not downloading

- Check your internet connection
- Verify the output directory exists: `public/images/medical/`
- Check file permissions

### Too many images

The script will download up to 1000 images by default. To limit:
```bash
MAX_IMAGES=100 npm run download-images
```

## License and Attribution

Pixabay images are free to use under their license. However, for medical/health content, you should:

1. Verify images are appropriate and accurate
2. Consider adding image credits/attribution
3. Review Pixabay's license terms: https://pixabay.com/service/terms/

## Alternative: Manual Download

If you prefer to manually select images:
1. Visit https://pixabay.com/images/search/medical/
2. Browse and download images individually
3. Save them to `public/images/medical/`
4. Use descriptive filenames

