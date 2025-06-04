# Stage 1: Build React App
FROM node:20 AS frontend-build
ARG FRONTEND_ENV
ENV FRONTEND_ENV=${FRONTEND_ENV}
WORKDIR /app
COPY frontend/ /app/
RUN rm /app/.env
RUN touch /app/.env
RUN echo "${FRONTEND_ENV}" | tr ',' '\n' > /app/.env
RUN cat /app/.env
RUN yarn install --frozen-lockfile && yarn build

# Stage 2: Install Python Backend
FROM python:3.11-slim as backend
WORKDIR /app
COPY backend/ /app/
RUN rm /app/.env
RUN pip install --no-cache-dir -r requirements.txt

# Stage 3: Final Image
FROM nginx:stable-alpine
# Install Python and dependencies
RUN apk add --no-cache python3 py3-pip python3-dev gcc musl-dev postgresql-dev

# Set up Python virtual environment
ENV VIRTUAL_ENV=/opt/venv
RUN python3 -m venv $VIRTUAL_ENV
ENV PATH="$VIRTUAL_ENV/bin:$PATH"

# Copy built frontend
COPY --from=frontend-build /app/build /usr/share/nginx/html
# Copy backend and requirements
COPY --from=backend /app /backend
COPY backend/requirements.txt /backend/

# Install Python dependencies in virtual environment with retry logic
RUN echo "#!/bin/sh\n\
for i in \$(seq 1 3); do\n\
    echo \"Attempt \$i of 3\"\n\
    pip install --default-timeout=100 --no-cache-dir -r /backend/requirements.txt && \
    pip install --default-timeout=100 --no-cache-dir asyncpg psycopg2-binary && break\n\
    sleep 5\n\
done" > /install.sh && \
    chmod +x /install.sh && \
    /install.sh

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Add env variables if needed
ENV PYTHONUNBUFFERED=1

# Start both services: Uvicorn and Nginx
CMD ["/entrypoint.sh"]
