#!/bin/bash

echo "🔄 Resetting Sports Venue Ticketing Database..."
echo ""

# Stop and remove containers with volumes
echo "📦 Stopping containers..."
docker-compose down -v

# Start PostgreSQL
echo "🚀 Starting PostgreSQL..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
sleep 10

# Run migrations
echo ""
echo "📝 Running migrations..."

for i in {001..007}; do
  migration_file=$(ls migrations/${i}_*.sql 2>/dev/null | head -n 1)
  if [ -f "$migration_file" ]; then
    echo "  ✓ Running $(basename $migration_file)..."
    docker-compose exec -T postgres psql -U ticketing_user -d ticketing_db < "$migration_file" > /dev/null 2>&1
  fi
done

echo ""
echo "✅ Database reset complete!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Database Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
docker-compose exec -T postgres psql -U ticketing_user -d ticketing_db -c "
SELECT 
  '👥 Users' as type, COUNT(*)::text as count FROM users
UNION ALL
SELECT '🎫 Events', COUNT(*)::text FROM events
UNION ALL
SELECT '🪑 Sections', COUNT(*)::text FROM seating_sections
UNION ALL
SELECT '🎟️  Tickets', COUNT(*)::text FROM tickets;
" 2>/dev/null | grep -v "^-" | grep -v "rows)"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔐 Demo Credentials:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  📧 demo@example.com  / Demo123!"
echo "  📧 admin@venue.com   / Admin123!"
echo "  📧 test@example.com  / Test123!"
echo ""
echo "🎉 Ready to go! Start the app with: npm run dev"
echo ""
