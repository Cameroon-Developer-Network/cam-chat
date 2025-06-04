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
RUN apk add --no-cache python3 py3-pip

# Copy built frontend
COPY --from=frontend-build /app/build /usr/share/nginx/html
# Copy backend and its dependencies
COPY --from=backend /app /backend
COPY --from=backend /usr/local/lib/python3.11/site-packages /usr/lib/python3.12/site-packages
# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Add env variables if needed
ENV PYTHONUNBUFFERED=1

# Start both services: Uvicorn and Nginx
CMD ["/entrypoint.sh"]
