FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libsndfile1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /tmp/podstream/voice_uploads \
    /tmp/podstream/voice_models \
    /tmp/podstream/voice_output

# Expose port
EXPOSE 5002

# Run the application
CMD ["python", "app.py"]
