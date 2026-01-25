# Use official Python image
FROM python:3.14-slim

# Set working directory
WORKDIR /app

# Copy requirements (if you have a requirements.txt)
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the app
COPY . .

# Expose port FastAPI runs on
EXPOSE 8000

# Start the app with uvicorn
CMD ["uvicorn", "resolver.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
