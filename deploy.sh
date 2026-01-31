#!/bin/bash

# Realm CRM Deployment Script for Hostinger
# This script automates the deployment process

echo "🚀 Realm CRM Deployment Script"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configuration (Update these values)
PROJECT_DIR="$HOME/domains/your-domain.com/public_html/realm-crm"
PUBLIC_HTML="$HOME/domains/your-domain.com/public_html"
PM2_APP_NAME="realm-crm-api"

# Function to print colored output
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if we're in the right directory
if [ ! -d "$PROJECT_DIR" ]; then
    print_error "Project directory not found: $PROJECT_DIR"
    exit 1
fi

cd "$PROJECT_DIR" || exit 1

# Step 1: Pull latest changes from GitHub
print_info "Pulling latest changes from GitHub..."
git pull origin main

if [ $? -ne 0 ]; then
    print_error "Failed to pull from GitHub"
    exit 1
fi
print_success "Code updated from GitHub"

# Step 2: Deploy Backend
print_info "Deploying backend..."
cd backend || exit 1

# Install/update dependencies
print_info "Installing backend dependencies..."
npm install --production

if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi
print_success "Backend dependencies installed"

# Restart PM2 process
print_info "Restarting backend server..."
pm2 restart $PM2_APP_NAME

if [ $? -ne 0 ]; then
    print_error "Failed to restart backend"
    exit 1
fi
print_success "Backend restarted"

# Step 3: Deploy Frontend
print_info "Deploying frontend..."
cd ../frontend || exit 1

# Install/update dependencies
print_info "Installing frontend dependencies..."
npm install

if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi
print_success "Frontend dependencies installed"

# Build production bundle
print_info "Building frontend..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Failed to build frontend"
    exit 1
fi
print_success "Frontend built successfully"

# Copy build files to public_html
print_info "Copying files to public_html..."
cp -r dist/* "$PUBLIC_HTML/"

if [ $? -ne 0 ]; then
    print_error "Failed to copy files"
    exit 1
fi
print_success "Files copied to public_html"

# Step 4: Show status
echo ""
echo "================================"
print_success "Deployment completed successfully!"
echo "================================"
echo ""

print_info "Backend status:"
pm2 status $PM2_APP_NAME

echo ""
print_info "Recent logs:"
pm2 logs $PM2_APP_NAME --lines 10 --nostream

echo ""
print_success "Your application is now live!"
echo ""
