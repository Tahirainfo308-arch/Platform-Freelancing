# ==========================================
# Stage 1: Build stage with dependencies compile
# ==========================================
FROM python:3.11-slim as builder

WORKDIR /build

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

# Install dependencies into temporary directory
RUN pip install --no-cache-dir --user -r requirements.txt

# ==========================================
# Stage 2: Clean execution image
# ==========================================
FROM python:3.11-slim as runner

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Copy build dependencies
COPY --from=builder /root/.local /root/.local
ENV PATH=/root/.local/bin:$PATH

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy code structure
COPY app/ /app/app
COPY run.py /app/run.py

EXPOSE 8000

# Run FastAPI app
CMD ["python", "run.py"]
