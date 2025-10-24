# 🚀 Quick Start Guide

## Step 1: Start the Application (2 minutes)

```bash
cd ticketing-system

# Switch to correct Node version (if using nvm)
nvm use

# Start PostgreSQL
docker-compose up -d postgres

# Start Next.js
pnpm run dev
```

> **Note:** The `.nvmrc` file specifies Node.js 22 (lts/jod) to match the Dockerfile. Run `nvm use` to automatically switch to this version.

Visit: **http://localhost:3000**

## Step 2: Demo Data Already Loaded! ✅

The database is already populated with demo data:

**Demo Users (ready to use):**
- **admin@venue.com** / **Admin123!**
- **demo@example.com** / **Demo123!**
- **test@example.com** / **Test123!**

**3 Events with 600 tickets:**
- Championship Finals 2025 (Dec 15, 2025)
- Spring Tournament 2025 (Apr 20, 2025)
- Summer Classic 2025 (Jul 10, 2025)

**No setup needed!** Just start testing →

## Step 3: Test the Application (5 minutes)

### Test 1: Login with Demo Account
1. Go to http://localhost:3000
2. Click "Login"
3. Use: **demo@example.com** / **Demo123!**
4. You'll be redirected to the home page

Or register a new account if you prefer!

### Test 2: Browse & Book Tickets
1. Click "Events" in the navigation
2. Click on "Championship Finals 2025"
3. Click any section button (e.g., "Economy")
4. Click 2-3 seat numbers (they turn blue)
5. Click "Reserve Seats"
6. See the green confirmation box

### Test 3: Complete Purchase
1. Click "Complete Purchase"
2. You'll see your order confirmation
3. Click "My Orders" to see your purchase

### Test 4: Test Atomic Reservation (The Cool Part!)
1. Open TWO different browsers
2. Register different users in each
3. Both navigate to the same event
4. Both select the SAME section
5. Both click the SAME seat
6. Both click "Reserve" at the SAME time
7. **Result:** Only ONE will succeed! 🎉

This proves the system prevents double-booking!

## 🎯 What You're Testing

- ✅ **Atomic Reservation:** PostgreSQL INSERT ON CONFLICT prevents double-booking
- ✅ **Auto-Expiration:** Reservations expire after 5 minutes
- ✅ **Secure Auth:** Bcrypt password hashing, HTTP-only cookies
- ✅ **Transaction Safety:** All operations wrapped in database transactions
- ✅ **Real-time Updates:** Seat availability updates instantly

## 📊 Verify in Database

```bash
# Connect to database
docker-compose exec postgres psql -U ticketing_user -d ticketing_db

# See all events
SELECT name, event_date, venue FROM events;

# See ticket status
SELECT 
  s.section_name,
  COUNT(*) FILTER (WHERE t.status = 'available') as available,
  COUNT(*) FILTER (WHERE t.status = 'reserved') as reserved,
  COUNT(*) FILTER (WHERE t.status = 'sold') as sold
FROM tickets t
JOIN seating_sections s ON t.section_id = s.id
GROUP BY s.section_name;

# Exit
\q
```

## 🔄 Database Management

### When Are Migrations Run?

**Migrations are run ONCE during initial setup.** They were already executed for you, which is why the demo data is already in the database.

If you're setting up the project for the first time OR need to rebuild:

### Rebuild Database from Scratch

```bash
# 1. Stop and remove the PostgreSQL container
docker-compose down -v

# 2. Start PostgreSQL fresh (this creates an empty database)
docker-compose up -d postgres

# 3. Wait for PostgreSQL to be ready (about 5-10 seconds)
sleep 10

# 4. Run ALL migrations in order (creates tables + adds demo data)
cd ticketing-system

# Run migrations 001-006 (table structure)
for i in {001..006}; do
  docker-compose exec -T postgres psql -U ticketing_user -d ticketing_db < migrations/${i}_*.sql
done

# Run migration 007 (demo data)
docker-compose exec -T postgres psql -U ticketing_user -d ticketing_db < migrations/007_seed_data.sql

# 5. Verify setup
docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "\dt"
docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "SELECT COUNT(*) FROM events;"
```

### Quick Reset Script

Create a file `reset-db.sh` for easy reset:

```bash
#!/bin/bash
echo "🔄 Resetting database..."

# Stop and remove containers
docker-compose down -v

# Start PostgreSQL
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL..."
sleep 10

# Run migrations
echo "📝 Running migrations..."
cd ticketing-system 2>/dev/null || true

for i in {001..007}; do
  echo "Running migration ${i}..."
  docker-compose exec -T postgres psql -U ticketing_user -d ticketing_db < migrations/${i}_*.sql 2>/dev/null || true
done

echo "✅ Database reset complete!"
echo ""
echo "Demo credentials:"
echo "  demo@example.com / Demo123!"
echo "  admin@venue.com / Admin123!"
echo "  test@example.com / Test123!"
```

Make it executable:
```bash
chmod +x reset-db.sh
./reset-db.sh
```

### Check Current Database State

```bash
# See all tables
docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "\dt"

# Count records
docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM events) as events,
  (SELECT COUNT(*) FROM tickets) as tickets,
  (SELECT COUNT(*) FROM orders) as orders;
"

# View all events
docker-compose exec postgres psql -U ticketing_user -d ticketing_db -c "SELECT name, event_date FROM events;"
```

## 🐛 Troubleshooting

**PostgreSQL not running?**
```bash
docker-compose up -d postgres
docker-compose ps  # Check status
```

**Port 3000 in use?**
```bash
lsof -ti:3000 | xargs kill -9
npm run dev
```

**Database seems empty?**
Run the migrations as shown in "Rebuild Database from Scratch" above.

**Want to start completely fresh?**
```bash
# Nuclear option - removes everything
docker-compose down -v
rm -rf postgres_data/  # Remove persistent data
# Then follow "Rebuild Database from Scratch"
```

## 🎉 Success Indicators

You'll know it's working when:
1. ✅ You can register and login
2. ✅ "Championship Finals 2025" appears on events page
3. ✅ You can see and select seats
4. ✅ Reservations create a green box
5. ✅ Purchase redirects to order confirmation
6. ✅ **Two users CANNOT book the same seat** (most important!)

## 📖 More Details

- **Full Testing Guide:** See `TESTING_GUIDE.md`
- **Implementation Status:** See `IMPLEMENTATION_STATUS.md`
- **Setup Instructions:** See `README.md`

---

**Total Time: ~8 minutes to full working ticketing system!** ⚡
