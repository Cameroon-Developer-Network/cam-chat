# Use the official Rust image as base
FROM rust:1.75-slim as builder

# Install system dependencies
RUN apt-get update && apt-get install -y \
    pkg-config \
    libssl-dev \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create a new empty shell project
WORKDIR /app

# Copy over your manifests
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies - this is the caching Docker layer!
RUN cargo build --release && rm src/main.rs

# Copy your source tree
COPY src ./src
COPY migrations ./migrations

# Build for release
RUN cargo build --release

# Runtime stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy the binary from builder stage
COPY --from=builder /app/target/release/whatsapp-backend /usr/local/bin/whatsapp-backend

# Copy migrations
COPY --from=builder /app/migrations /app/migrations

# Set the startup command
WORKDIR /app
EXPOSE 8080

CMD ["whatsapp-backend"]