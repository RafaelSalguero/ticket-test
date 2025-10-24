#!/bin/bash

echo "🔄 Resetting Sports Venue Ticketing Database..."
echo ""

# Stop and remove containers with volumes
echo "📦 Stopping containers..."
docker-compose down -v

# Start PostgreSQL
echo "🚀 Starting PostgreSQL..."
docker-compose up -d postgres
