# Use official Python image
FROM python:3.14-slim

# Set working directory
WORKDIR /app

# Copy backend requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/app ./app

# Copy data directory (now at project root level)
COPY data ./data

# Copy rules directory (now at project root level)
COPY rules ./rules

# Expose port FastAPI runs on
EXPOSE 8000

# Start the app with uvicorn
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
