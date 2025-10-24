# Getting started

Run the following commands:
```
docker-compose build
docker-compose up
```

Open http://localhost:3000

![Landing page](./screenshots/landing.png)

## Login info:

|email|password|role
|-|-|-|
  |admin@venue.com|Admin123!|admin|
  |demo@example.com|Demo123!|customer|
  |test@example.com|Test123!|customer|


- Login with a "customer"
- Click "Browse events"

![Events](./screenshots/events.png)

From here you can reserve and purchase tickets
![Events](./screenshots/reserve.png)

You can test reservation locks with 2 browsers, the reservation
time is 10 seconds

![Lock](./screenshots/lock-1.png)
![Lock](./screenshots/lock-2.png)
![Lock](./screenshots/lock-3.png)

## Admin

The admin has a dashboard with KPI and reports
![Admin](./screenshots/admin-dashboard.png)
![Reports](./screenshots/reports.png)

You can also create new events:
![New event](./screenshots/new-event.png)
![events](./screenshots/event-list.png)
