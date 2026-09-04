#!/usr/bin/env python3
"""
GMapsScraper Telegram Bot — Production-ready async bot
Replaces TUI with Telegram interface for cloud deployment
"""

import os
import sys
import asyncio
import tempfile
from datetime import datetime
from telegram import Update, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackContext, filters, ConversationHandler
from telegram.constants import ParseMode, ChatAction
import pandas as pd

# Import scraper
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from scraper import scrape_google_maps

# Configuration
BOT_TOKEN = os.environ.get("BOT_TOKEN")
if not BOT_TOKEN:
    raise ValueError("BOT_TOKEN environment variable not set")

# Conversation states
SCRAPING = 1

# Active jobs tracking (user_id -> task)
active_jobs = {}


def format_result_markdown(results):
    """Format results as beautiful Markdown for small result sets."""
    if not results:
        return "No results found."
    
    md = f"📊 *Results Found: {len(results)}*\n\n"
    
    for i, r in enumerate(results, 1):
        md += f"*{i}. {r.get('Business Name', 'N/A')}*\n"
        if r.get('Rating'):
            md += f"   ⭐ Rating: {r['Rating']}\n"
        if r.get('Reviews Count'):
            md += f"   📝 Reviews: {r['Reviews Count']}\n"
        if r.get('Phone Number'):
            md += f"   📞 Phone: {r['Phone Number']}\n"
        if r.get('Instagram'):
            md += f"   📸 Instagram: [{r['Instagram']}]({r['Instagram']})\n"
        if r.get('Address'):
            md += f"   📍 Address: {r['Address']}\n"
        md += "\n"
    
    return md


async def start_command(update: Update, context: CallbackContext):
    """Handle /start command."""
    welcome_message = """
🤖 *GMapsScraper Telegram Bot*

Welcome! I can help you find businesses on Google Maps that have Instagram pages but no websites.

*Available Commands:*
• `/start` - Show this help message
• `/scrape <query>` - Start scraping (e.g., `/scrape baku dentists`)
• `/cancel` - Cancel active scraping job

*How it works:*
1. Send `/scrape <your search query>`
2. I'll search Google Maps for businesses
3. I'll filter for businesses with Instagram but no website
4. Results are sent as formatted message or file

*Example:*
`/scrape restaurants in istanbul`

Made with ❤️ for lead generation
"""
    await update.message.reply_text(welcome_message, parse_mode=ParseMode.MARKDOWN)


async def cancel_command(update: Update, context: CallbackContext):
    """Handle /cancel command."""
    user_id = update.effective_user.id
    
    if user_id in active_jobs:
        # Cancel the job (this is a simple implementation)
        del active_jobs[user_id]
        await update.message.reply_text("❌ Scraping job cancelled.")
    else:
        await update.message.reply_text("No active scraping job to cancel.")


async def scrape_command(update: Update, context: CallbackContext):
    """Handle /scrape command."""
    user_id = update.effective_user.id
    
    # Check if user already has an active job
    if user_id in active_jobs:
        await update.message.reply_text(
            "⚠️ You already have an active scraping job. Use /cancel to stop it first."
        )
        return
    
    # Get query from command arguments
    if not context.args or len(context.args) < 1:
        await update.message.reply_text(
            "❌ Please provide a search query.\n\n"
            "Usage: `/scrape <query>`\n"
            "Example: `/scrape baku dentists`",
            parse_mode=ParseMode.MARKDOWN
        )
        return
    
    query = " ".join(context.args)
    
    # Send immediate feedback
    status_message = await update.message.reply_text(
        f"🔍 *Scraping started for:* `{query}`\n\n"
        f"⏳ Searching Google Maps...",
        parse_mode=ParseMode.MARKDOWN
    )
    
    # Mark job as active
    active_jobs[user_id] = {
        "query": query,
        "status_message": status_message,
        "start_time": datetime.now()
    }
    
    # Start scraping in background
    asyncio.create_task(run_scraping_job(update, context, query, status_message, user_id))


async def run_scraping_job(update: Update, context: CallbackContext, query: str, status_message, user_id: int):
    """Run the scraping job asynchronously."""
    temp_filename = None
    results = []
    
    try:
        # Progress callback for status updates
        async def progress_callback(event_type, data):
            if user_id not in active_jobs:
                return  # Job was cancelled
            
            try:
                if event_type == "inspect":
                    await status_message.edit_text(
                        f"🔍 *Scraping:* `{query}`\n\n"
                        f"🔎 Inspecting businesses...",
                        parse_mode=ParseMode.MARKDOWN
                    )
                elif event_type == "result":
                    await status_message.edit_text(
                        f"🔍 *Scraping:* `{query}`\n\n"
                        f"✅ Found: {data.get('Business Name', 'N/A')}",
                        parse_mode=ParseMode.MARKDOWN
                    )
                elif event_type == "scroll":
                    await status_message.edit_text(
                        f"🔍 *Scraping:* `{query}`\n\n"
                        f"📜 Scrolling for more results...",
                        parse_mode=ParseMode.MARKDOWN
                    )
            except Exception:
                pass  # Message might have been deleted
        
        # Create temporary file for output
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as tmp:
            temp_filename = tmp.name
        
        # Run scraper
        await scrape_google_maps(
            query=query,
            target_count=20,  # Default target
            output_filename=temp_filename,
            progress_callback=progress_callback,
            headless=True
        )
        
        # Load results from Excel file
        try:
            df = pd.read_excel(temp_filename)
            results = df.to_dict('records')
        except Exception as e:
            await status_message.edit_text(
                f"❌ Error reading results: {str(e)}"
            )
            return
        
        # Remove job from active jobs
        if user_id in active_jobs:
            del active_jobs[user_id]
        
        # Send results based on count
        if len(results) <= 5:
            # Send as formatted Markdown message
            markdown = format_result_markdown(results)
            await status_message.edit_text(markdown, parse_mode=ParseMode.MARKDOWN)
        else:
            # Send as file attachment
            await status_message.edit_text(
                f"✅ *Scraping complete!*\n\n"
                f"📊 Found {len(results)} businesses\n"
                f"💾 Sending results as Excel file...",
                parse_mode=ParseMode.MARKDOWN
            )
            
            # Send the Excel file
            with open(temp_filename, 'rb') as f:
                await update.message.reply_document(
                    document=f,
                    filename=f"gmaps_results_{query.replace(' ', '_')[:20]}.xlsx",
                    caption=f"📊 {len(results)} businesses found for: {query}"
                )
    
    except asyncio.TimeoutError:
        if user_id in active_jobs:
            del active_jobs[user_id]
        await status_message.edit_text(
            f"⏱️ *Timeout Error*\n\n"
            f"The scraping operation took too long. Please try a simpler query."
        )
    
    except Exception as e:
        if user_id in active_jobs:
            del active_jobs[user_id]
        error_msg = f"❌ *Error occurred*\n\n"
        error_msg += f"```\n{str(e)}\n```"
        await status_message.edit_text(error_msg, parse_mode=ParseMode.MARKDOWN)
    
    finally:
        # Clean up temporary file
        if temp_filename and os.path.exists(temp_filename):
            try:
                os.unlink(temp_filename)
            except Exception:
                pass


async def error_handler(update: Update, context: CallbackContext):
    """Handle errors."""
    print(f"Error: {context.error}")
    
    if update and update.message:
        await update.message.reply_text(
            "❌ An unexpected error occurred. Please try again."
        )


def main():
    """Start the bot."""
    # Create application
    application = Application.builder().token(BOT_TOKEN).build()
    
    # Add handlers
    application.add_handler(CommandHandler("start", start_command))
    application.add_handler(CommandHandler("cancel", cancel_command))
    application.add_handler(CommandHandler("scrape", scrape_command))
    
    # Add error handler
    application.add_error_handler(error_handler)
    
    # Start bot
    print("🤖 GMapsScraper Telegram Bot started...")
    application.run_polling(allowed_updates=Update.ALL_TYPES)


if __name__ == "__main__":
    main()
