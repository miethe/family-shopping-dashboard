#!/bin/bash
# Docker build verification script for Family Gifting Dashboard

set -e

echo "========================================="
echo "Family Gifting Dashboard - Docker Build"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_info() {
    echo -e "${BLUE}→ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

print_success "Docker is installed"

# Check if docker-compose is available
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null; then
    COMPOSE_CMD="docker compose"
else
    print_error "Docker Compose is not available"
    exit 1
fi

print_success "Docker Compose is available"
echo ""

# Build API image
print_info "Building API image (services/api)..."
if docker build -t gifting-api:latest ./services/api; then
    print_success "API image built successfully"
else
    print_error "Failed to build API image"
    exit 1
fi
echo ""

# Build Web image
print_info "Building Web image (apps/web)..."
if docker build -t gifting-web:latest ./apps/web; then
    print_success "Web image built successfully"
else
    print_error "Failed to build Web image"
    exit 1
fi
echo ""

# Build with docker-compose
print_info "Building all services with docker-compose..."
if $COMPOSE_CMD build; then
    print_success "All services built successfully with docker-compose"
else
    print_error "Failed to build services with docker-compose"
    exit 1
fi
echo ""

# List images
print_info "Docker images created:"
docker images | grep -E "gifting|REPOSITORY"
echo ""

print_success "All builds completed successfully!"
echo ""
echo "Next steps:"
echo "  1. Start services: $COMPOSE_CMD up -d"
echo "  2. View logs: $COMPOSE_CMD logs -f"
echo "  3. Stop services: $COMPOSE_CMD down"
echo "  4. View running containers: docker ps"
echo ""
