# Stage 1

## Notification System REST API Design

### Core Actions
1. View notifications
2. View notification by ID
3. Create notification
4. Mark notification as read
5. Delete notification
6. Get unread notification count

### Get Notifications

Endpoint:
GET /api/v1/notifications

Headers:
Authorization: Bearer <token>

Response:
{
  "notifications": [
    {
      "notificationId": "123",
      "type": "Placement",
      "message": "Amazon Hiring",
      "isRead": false,
      "createdAt": "2026-06-05T09:00:00Z"
    }
  ]
}

### Create Notification

Endpoint:
POST /api/v1/notifications

Request:
{
  "type": "Placement",
  "message": "Amazon Hiring",
  "targetUsers": [101,102]
}

Response:
{
  "notificationId": "123",
  "status": "created"
}

### Mark Notification as Read

Endpoint:
PATCH /api/v1/notifications/{id}/read

Response:
{
  "notificationId": "123",
  "isRead": true
}

### Delete Notification

Endpoint:
DELETE /api/v1/notifications/{id}

### Real-Time Notifications

I would use WebSockets. When a user logs in, the frontend establishes a WebSocket connection with the server. Whenever a new notification is generated, the server pushes it immediately to the connected users without requiring page refresh.

# Stage 2

## Database Selection

I would use PostgreSQL as the persistent storage for the notification system.

### Reasons

1. Supports ACID transactions.
2. Reliable and widely used in production systems.
3. Supports indexing for faster queries.
4. Handles relationships between students and notifications efficiently.
5. Scales well for large datasets.

---

## Database Schema

### Students Table

| Column | Type |
|----------|----------|
| student_id | BIGINT PRIMARY KEY |
| name | VARCHAR(100) |
| email | VARCHAR(255) |

### Notifications Table

| Column | Type |
|----------|----------|
| notification_id | UUID PRIMARY KEY |
| student_id | BIGINT |
| notification_type | VARCHAR(20) |
| message | TEXT |
| is_read | BOOLEAN |
| created_at | TIMESTAMP |

Relationship:

One student can have many notifications.

---

## Problems as Data Volume Increases

As the number of students and notifications increases:

1. Queries may become slow.
2. Full table scans can impact performance.
3. Storage requirements increase.
4. API response time may increase.
5. Database load may become high.

---

## Solutions

### Indexing

Create indexes on frequently searched columns.

Example:

(student_id, is_read)

### Pagination

Instead of loading all notifications at once, load notifications page by page.

Example:

GET /notifications?page=1&limit=20

### Archiving

Move old notifications to archive tables.

### Caching

Use Redis to cache frequently accessed notifications.

### Partitioning

Partition notification tables based on date ranges.

---

## Queries

### Create Notification

INSERT INTO notifications
(notification_id, student_id, notification_type, message, is_read, created_at)
VALUES
(uuid_generate_v4(), 101, 'Placement', 'Amazon Hiring', false, NOW());

### Get Notifications

SELECT *
FROM notifications
WHERE student_id = 101;

### Mark Notification As Read

UPDATE notifications
SET is_read = true
WHERE notification_id = '123';

### Delete Notification

DELETE FROM notifications
WHERE notification_id = '123';

### Get Unread Notification Count

SELECT COUNT(*)
FROM notifications
WHERE student_id = 101
AND is_read = false;