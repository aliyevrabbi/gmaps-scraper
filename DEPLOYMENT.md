# Deployment Guide — GMapsScraper Telegram Bot on Render.com

This guide will help you deploy the GMapsScraper Telegram Bot to Render.com as a free 24/7 background worker.

## Prerequisites

1. **Telegram Bot Token**
   - Create a bot via [@BotFather](https://t.me/BotFather) on Telegram
   - Use `/newbot` command and follow the instructions
   - Copy the bot token (format: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

2. **GitHub Account**
   - Push this repository to GitHub (Render requires a Git repository)

3. **Render.com Account**
   - Sign up at [render.com](https://render.com)
   - Free tier is sufficient for this bot

## Step-by-Step Deployment

### 1. Prepare Your Repository

Ensure your repository contains these files in the root directory:
- `bot.py` — Main Telegram bot application
- `scraper.py` — Optimized Playwright scraper
- `requirements.txt` — Python dependencies
- `Dockerfile` — Container configuration
- `render.yaml` — Render infrastructure configuration

### 2. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: GMapsScraper Telegram Bot"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

### 3. Deploy to Render

#### Option A: Automatic Deployment via render.yaml (Recommended)

1. Log in to [Render.com](https://dashboard.render.com)
2. Click **"New +"** button
3. Select **"Blueprint"** (or "New Blueprint Instance")
4. Connect your GitHub repository
5. Render will automatically detect `render.yaml` and configure the worker
6. Click **"Apply"** to deploy

#### Option B: Manual Deployment

1. Log in to [Render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Worker"** (Background Worker)
3. Configure:
   - **Name**: `gmaps-scraper-bot` (or your preferred name)
   - **Region**: Choose nearest region
   - **Branch**: `main`
   - **Runtime**: Docker
   - **Instance Type**: Free
4. **Environment Variables**:
   - Key: `BOT_TOKEN`
   - Value: Your Telegram bot token from BotFather
5. Click **"Create Worker"**

### 4. Configure Environment Variables

After deployment, you must set the `BOT_TOKEN`:

1. Go to your worker dashboard on Render
2. Navigate to **"Environment"** tab
3. Add environment variable:
   - **Key**: `BOT_TOKEN`
   - **Value**: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz` (your actual token)
   - **Sync**: Leave unchecked (keeps token secure)
4. Click **"Save Changes"**
5. **Important**: Click **"Manual Deploy"** → **"Clear build cache & deploy"** to apply changes

### 5. Verify Deployment

1. Check the **"Logs"** tab in your Render dashboard
2. Look for: `🤖 GMapsScraper Telegram Bot started...`
3. If you see errors, check the logs for missing dependencies or configuration issues

### 6. Test Your Bot

1. Open Telegram and search for your bot by username
2. Send `/start` to see the welcome message
3. Try a scrape command: `/scrape baku dentists`
4. Monitor the logs to see the bot processing requests

## Troubleshooting

### Bot Token Not Set

**Error**: `BOT_TOKEN environment variable not set`

**Solution**:
- Ensure `BOT_TOKEN` is set in Render Environment variables
- Redeploy after setting the variable

### Playwright Browser Installation Issues

**Error**: `Executable doesn't exist` or browser-related errors

**Solution**:
- The Dockerfile includes `playwright install chromium` and `playwright install-deps chromium`
- Ensure Dockerfile is present and correctly formatted
- Check build logs for installation errors

### Memory Issues

**Error**: Container crashes due to memory limits

**Solution**:
- The scraper is already optimized with low-RAM Chromium arguments
- If issues persist, reduce the target count in `bot.py` (line ~115)
- Consider upgrading to a paid Render plan for more resources

### Timeout Errors

**Error**: Scraping operations timeout

**Solution**:
- The scraper has 60-second timeout configured
- Try simpler search queries
- Reduce target count in `bot.py`

### Bot Not Responding

**Error**: Bot doesn't reply to commands

**Solution**:
- Check Render logs for errors
- Verify bot token is correct
- Ensure bot is running (check worker status)
- Try restarting the worker: **"Manual Deploy"** → **"Restart"**

## Architecture Overview

### Components

- **bot.py**: Async Telegram bot using python-telegram-bot v20+
- **scraper.py**: Playwright-based Google Maps scraper with optimizations
- **Dockerfile**: Container configuration using official Playwright image
- **render.yaml**: Infrastructure-as-Code for Render deployment

### Optimizations Applied

1. **Headless Mode**: Always runs headless (no GUI)
2. **Network Interception**: Blocks images, stylesheets, fonts, media
3. **Low-RAM Args**: Chromium optimized for cloud containers
4. **Navigation Controls**: 60-second timeout, domcontentloaded wait
5. **Async Operations**: Non-blocking for multi-user concurrency

### Resource Usage

- **Memory**: ~200-400MB (optimized for free tier)
- **CPU**: Minimal during idle, spikes during scraping
- **Storage**: Temporary files only, no persistent storage needed

## Maintenance

### Updating the Bot

1. Make changes to your code
2. Commit and push to GitHub
3. Render will auto-deploy (if enabled) or manually trigger deploy

### Monitoring

- Check Render logs regularly for errors
- Monitor resource usage in Render dashboard
- Set up alerts (Render paid feature) for critical issues

### Scaling

If you need higher performance:
- Upgrade to paid Render plan for more CPU/RAM
- Increase target count in `bot.py`
- Consider multiple workers for load balancing

## Security Notes

- **Never commit** your BOT_TOKEN to Git
- Always use environment variables for sensitive data
- The bot token is stored securely in Render's environment
- Render's free tier includes SSL/TLS for all services

## Cost

- **Render Free Tier**: $0/month
- **Includes**: 512MB RAM, 0.1 CPU, background worker
- **Limitations**: Spins down after 15min inactivity (may wake on webhook)
- **For 24/7 operation**: Consider paid plan (~$7/month) or use alternative like Railway

## Alternative Deployments

### Railway

1. Create `railway.json`:
```json
{
  "build": {
    "docker": true
  }
}
```
2. Connect GitHub repo to Railway
3. Set `BOT_TOKEN` environment variable
4. Deploy

### Docker (VPS/Cloud)

```bash
docker build -t gmaps-scraper-bot .
docker run -d -e BOT_TOKEN=your_token gmaps-scraper-bot
```

## Support

For issues related to:
- **Render**: [Render Support](https://render.com/support)
- **Playwright**: [Playwright Docs](https://playwright.dev/python)
- **python-telegram-bot**: [PTB Documentation](https://docs.python-telegram-bot.org)

---

**Made with ❤️ for automated lead generation**
