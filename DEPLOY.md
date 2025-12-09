# Deployment Guide: Cloudflare Pages

This guide will walk you through deploying the Paramedical Knowledge Hub to Cloudflare Pages.

## Prerequisites

- A Cloudflare account (free tier works)
- Your code in a Git repository (GitHub, GitLab, or Bitbucket)
- Node.js 18+ installed locally (for testing builds)

## Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Push to a Git Provider**:
   - Create a repository on GitHub, GitLab, or Bitbucket
   - Push your code:
     ```bash
     git remote add origin <your-repo-url>
     git push -u origin main
     ```

## Step 2: Connect to Cloudflare Pages

1. **Log in to Cloudflare Dashboard**:
   - Go to [dash.cloudflare.com](https://dash.cloudflare.com)
   - Navigate to **Pages** in the sidebar

2. **Create a New Project**:
   - Click **Create a project**
   - Click **Connect to Git**
   - Authorize Cloudflare to access your Git provider
   - Select your repository

## Step 3: Configure Build Settings

In the build configuration:

### Build Command
```
npm run build
```

### Build Output Directory
```
dist
```

### Root Directory
```
/ (leave empty or set to root)
```

### Environment Variables
No environment variables are required for basic deployment. If you need to set the site URL:

- **Variable Name**: `PUBLIC_SITE_URL`
- **Value**: `https://your-domain.com` (optional, defaults to Cloudflare Pages URL)

### Node.js Version
Cloudflare Pages will automatically detect Node.js 18+. You can specify in `package.json`:

```json
{
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## Step 4: Deploy

1. Click **Save and Deploy**
2. Cloudflare will:
   - Install dependencies (`npm install`)
   - Run the build command (`npm run build`)
   - Deploy the output to Cloudflare's CDN

3. **Wait for Build**: The first build may take 3-5 minutes

## Step 5: Verify Deployment

1. **Check Build Logs**:
   - View the build output in the Cloudflare dashboard
   - Ensure the build completed successfully

2. **Visit Your Site**:
   - Cloudflare provides a preview URL: `https://<project-name>.pages.dev`
   - Test all pages and functionality

3. **Test Production Build Locally** (optional):
   ```bash
   npm run build
   npm run preview
   ```

## Step 6: Custom Domain (Optional)

1. **Add Custom Domain**:
   - In your Cloudflare Pages project, go to **Custom domains**
   - Click **Set up a custom domain**
   - Enter your domain name

2. **DNS Configuration**:
   - If your domain is on Cloudflare: DNS is automatically configured
   - If your domain is elsewhere: Add a CNAME record pointing to your Pages URL

3. **SSL/TLS**:
   - Cloudflare automatically provisions SSL certificates
   - Wait a few minutes for SSL to activate

## Step 7: Continuous Deployment

Cloudflare Pages automatically:

- **Deploys on Push**: Every push to your main branch triggers a new deployment
- **Preview Deployments**: Pull requests get preview URLs
- **Rollback**: You can rollback to previous deployments from the dashboard

### Branch Configuration

- **Production Branch**: Usually `main` or `master`
- **Preview Branches**: All other branches get preview deployments

## Build Configuration Details

### Build Command Breakdown

```bash
npm run build
```

This runs:
1. `astro check` - Type checks the codebase
2. `astro build` - Builds the site with Cloudflare adapter

### Output Structure

The build outputs to `dist/` with:
- Static HTML pages
- Server-side rendered pages (for dynamic routes)
- Assets (CSS, JS, images)
- `_worker.js` - Cloudflare Worker for SSR

## Environment Variables

### Setting in Cloudflare

1. Go to your Pages project
2. Navigate to **Settings** → **Environment variables**
3. Add variables as needed

### Common Variables

- `PUBLIC_SITE_URL`: Your site's public URL (for sitemap, canonical URLs)
- `NODE_VERSION`: Node.js version (if needed)

## Troubleshooting

### Build Fails

1. **Check Build Logs**:
   - Look for error messages in the Cloudflare dashboard
   - Common issues: missing dependencies, TypeScript errors

2. **Test Locally**:
   ```bash
   npm install
   npm run build
   ```

3. **Common Issues**:
   - **Missing dependencies**: Ensure all dependencies are in `package.json`
   - **TypeScript errors**: Fix type errors before deploying
   - **Content errors**: Ensure all articles have valid frontmatter

### Site Not Loading

1. **Check Deployment Status**: Ensure deployment succeeded
2. **Verify Build Output**: Check that `dist/` contains files
3. **Clear Cache**: Cloudflare may cache old versions

### Environment Variables Not Working

- Only variables prefixed with `PUBLIC_` are available in the browser
- Restart the build after adding environment variables
- Use `import.meta.env.PUBLIC_VARIABLE_NAME` in your code

## Performance Optimization

Cloudflare Pages automatically provides:

- **Global CDN**: Content served from edge locations worldwide
- **Automatic Compression**: Gzip/Brotli compression
- **HTTP/2 and HTTP/3**: Modern protocols enabled
- **Image Optimization**: Via Cloudflare Images (if configured)

### Additional Optimizations

1. **Image Optimization**:
   - Use Astro's `<Image>` component
   - Optimize images before uploading
   - Consider Cloudflare Images integration

2. **Code Splitting**:
   - Astro automatically code-splits
   - Minimal JavaScript by default

3. **Caching**:
   - Cloudflare automatically caches static assets
   - Configure cache headers if needed

## Monitoring and Analytics

### Cloudflare Analytics

- Built-in analytics in Cloudflare dashboard
- Page views, bandwidth, requests

### Custom Analytics

- Add Google Analytics if needed
- Consider Cloudflare Web Analytics (free)

## Updating the Site

1. **Make Changes Locally**:
   ```bash
   # Edit files
   npm run dev  # Test locally
   ```

2. **Commit and Push**:
   ```bash
   git add .
   git commit -m "Update content"
   git push
   ```

3. **Automatic Deployment**:
   - Cloudflare detects the push
   - Builds and deploys automatically
   - Usually completes in 2-5 minutes

## Rollback

If you need to rollback:

1. Go to **Deployments** in Cloudflare Pages
2. Find the previous working deployment
3. Click **...** → **Retry deployment** or **Promote to production**

## Support

- **Cloudflare Pages Docs**: [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages)
- **Astro Deployment Guide**: [docs.astro.build/en/guides/deploy/cloudflare](https://docs.astro.build/en/guides/deploy/cloudflare)
- **Cloudflare Community**: [community.cloudflare.com](https://community.cloudflare.com)

## Quick Reference

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Build Output | `dist` |
| Node Version | 18+ |
| Framework Preset | Astro |
| Environment | Production |

---

**Note**: This deployment guide assumes you're using the default Cloudflare Pages setup. For advanced configurations (custom workers, redirects, etc.), refer to the [Cloudflare Pages documentation](https://developers.cloudflare.com/pages).

