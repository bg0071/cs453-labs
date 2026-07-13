# Lab 5 Starter

## How to Run

```bash
npm install
docker compose up -d
npm run api
npm run client
```

Open:

```text
http://localhost:5173
```

Postgres is exposed on:

```text
postgres://postgres:postgres@localhost:5433/lab05
```

## What Already Works

- Postgres runs in Docker.
- The Express server connects to Postgres.
- The server creates and seeds an `items` table on startup.
- `GET /health`, `GET /api/items`, and `POST /api/items` are implemented.
- The browser client can load items and add a new item.

## What You Need to Add

- `GET /api/items/:id`
- `PUT /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`
- Better validation and error handling
- Client-side UI for at least some of the new routes

## Graduate Extension

Add one more resource or relationship, such as categories, projects, or tags,
and connect it to the database.

## Reflection Answers

### 1. What changed when the API moved from in-memory data to Postgres?

When the API moved from in-memory data to Postgres, the items were no longer stored only in a JavaScript array while the server was running. Instead, each item was stored as a row in the Postgres items table. This made the data persistent, so added, updated, and deleted items remained changed even after the API or browser client was restarted.

The route handlers also became asynchronous because they had to send SQL queries to the database and wait for the results. Database operations could fail for reasons such as a lost connection or an invalid query, so the API needed try/catch blocks and appropriate 500 Internal Server Error responses. Postgres also provided database-level constraints, such as requiring a name and preventing negative quantities, which helped protect the data even if invalid input reached the database.

### 2. When should you use `PUT` instead of `PATCH`?

PUT should be used when the client is replacing the complete editable representation of a resource. For an item in this lab, a PUT request must provide both the name and quantity, even when only one of those values is different.

PATCH should be used when the client only wants to change selected fields. For example, a PATCH request can update only the quantity while leaving the existing name unchanged. Therefore, PUT represents a full replacement, while PATCH represents a partial update.

### 3. What kinds of validation belong in the API even if the browser client also validates input?

The API must validate all information that could affect the database, even when the browser performs its own validation. This includes verifying that an item ID is a positive integer, that required fields are present, that the name is a non-empty string, and that the quantity is a non-negative integer. The API should also reject empty PATCH requests, malformed JSON, and requests with missing fields when a complete replacement is required.

Server-side validation is necessary because browser validation can be bypassed. A user could send requests directly with curl, another application, or modified JavaScript. The API is the final boundary before the database, so it cannot assume that every request came from the provided browser client.

### 4. How does the browser client help you test the API differently than `curl` alone?

curl is useful for testing individual HTTP requests, request bodies, status codes, and JSON responses directly. It makes it easy to test invalid IDs, missing resources, malformed input, and each API method separately.

The browser client tests the complete application workflow. It verifies that the HTML controls, JavaScript event listeners, fetch requests, CORS configuration, JSON parsing, page rendering, validation messages, and database-backed updates all work together. For example, using the update and delete buttons confirmed that the client could send PATCH and DELETE requests and then reload the current data from the API. Refreshing the browser also helped confirm that the changes were stored in Postgres instead of only being held in the page's memory.

### 5. If you added an extension, what did you add and why?

I did not add an optional extension for I am an undergrad. I did add browser controls for updating item quantities and deleting items (awesome when it worked correctly). 
