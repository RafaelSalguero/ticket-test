# Ticketing system

A sports venue wants to be able to offer tickets for sale through a web application.
They need to be able to set up events, market the events, and sell tickets. 

Requirements:

## Event Management:
- Ability to create, edit, and delete events (e.g., basketball games, concerts).
- Define event details such as name, date, time, venue, and available seating sections.
- Set ticket pricing.


## Ticket Sales:
Web application for customers to browse events and purchase tickets.

## Customer Management:
User authentication for ticket purchasers. (Simple password based)
Order history viewing for customers.
Basic reporting on ticket sales and event attendance.

# Tech stack

- Write a nextjs typescript app, use server components and server actions for data access
- Use PostgreSQL for database, "node-postgres" and "node-pg-migrate"
- Use docker compose so it is fully contained, use a database container and another for the node backend
- Use postgre upsert (INSERT ON CONFLICT) and indices to ensure ticket unicity (no to customers should have the same ticket seat)
