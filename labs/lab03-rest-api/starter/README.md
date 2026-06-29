# Lab 3 REST API

## How to Run

```bash
npm install
npm run server
```

The server runs on:

```text
http://localhost:3000
```

## How to Test

```bash
npm test
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/items` | Return all items |
| GET | `/items/:id` | Return one item |
| POST | `/items` | Create one item |
| PUT | `/items/:id` | Update one item |
| DELETE | `/items/:id` | Delete one item |

## Reflection Answers

### 1. What makes this API more REST-like than the previous HTTP/JSON lab?

This API is more REST-like because it uses resource-based routes such as /items and /items/:id, and it uses HTTP methods to describe the action being performed. For example, GET reads items, POST creates an item, PUT updates an item, and DELETE removes an item.

### 2. What is the purpose of a route parameter such as `/items/:id`?

A route parameter lets the server get a specific value from the URL. In /items/:id, the id part identifies which item the client wants to read, update, or delete. For example, /items/1 refers to the item with ID 1.

### 3. Why should `POST`, `PUT`, and `DELETE` use different HTTP methods?

They should use different methods because they represent different actions. POST creates a new resource, PUT updates an existing resource, and DELETE removes a resource. Using different methods makes the API clearer and easier to test.

### 4. What is the difference between a `400` error and a `404` error?

A 400 error means the client sent a bad request, such as missing or invalid JSON data. A 404 error means the requested resource could not be found, such as trying to get an item ID that does not exist.

### 5. How does the OpenAPI file relate to your Express server code?

The OpenAPI file is documentation for the API implemented in the Express server. It describes the available routes, request bodies, response bodies, status codes, and error responses. The OpenAPI file should match what the Express code actually does.

## Graduate Extension

Not applicable.
