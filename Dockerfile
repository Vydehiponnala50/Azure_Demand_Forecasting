FROM python:3.10-slim

WORKDIR /app

# Copy dependencies
COPY requirements.txt .
RUN python -m pip install --upgrade pip setuptools wheel && \
    pip install --no-cache-dir -r requirements.txt

# Copy application and scripts
COPY app ./app
COPY scripts ./scripts

# Create data and models directories (should exist even if ignored)
RUN mkdir -p data app/models

# Expose FastAPI port
EXPOSE 10000

# Start API
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "10000"]
