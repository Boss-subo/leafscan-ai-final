# Use Python 3.9 as base
FROM python:3.9

# Create a working directory
WORKDIR /app

# Copy requirements and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
# NOTE: Hugging Face expects the entry file to be named app.py
COPY master_api.py ./app.py

# Expose port 7860 (Hugging Face default)
EXPOSE 7860

# Run the app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
