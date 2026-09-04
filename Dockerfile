FROM mcr.microsoft.com/playwright/python:v1.40.0-jammy

# Set working directory
WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Playwright browsers
RUN playwright install chromium
RUN playwright install-deps chromium

# Copy application files
COPY scraper.py .
COPY bot.py .

# Set environment variable for unbuffered Python output
ENV PYTHONUNBUFFERED=1

# Run the bot
CMD ["python", "bot.py"]
