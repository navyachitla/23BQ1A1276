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

# Stage 3

## Analysis of Existing Query

Given Query:

```sql
SELECT *
FROM notifications
WHERE studentID = 1042
AND isRead = false
ORDER BY createdAt ASC;
```

### Is the Query Accurate?

The query correctly returns unread notifications for a specific student. However, it is not optimized for large datasets.

### Why is it Slow?

1. Uses SELECT * which fetches unnecessary columns.
2. No LIMIT clause is used.
3. Database may scan millions of rows.
4. Sorting using ORDER BY adds extra cost.
5. No suitable index is mentioned.

### Improved Query

```sql
SELECT notification_id,
       notification_type,
       message,
       created_at
FROM notifications
WHERE student_id = 1042
AND is_read = false
ORDER BY created_at DESC
LIMIT 50;
```

### Recommended Index

```sql
CREATE INDEX idx_student_read_created
ON notifications(student_id, is_read, created_at DESC);
```

### Computation Cost

Without Index:

O(N)

With Index:

O(log N + K)

where K is the number of matching notifications.

---

## Should We Add Indexes on Every Column?

No.

Adding indexes on every column is not a good strategy because:

1. More storage space is required.
2. Insert operations become slower.
3. Update operations become slower.
4. Delete operations become slower.
5. Many indexes may never be used.

Indexes should only be created on columns that are frequently searched or sorted.

---

## Query to Find Students Who Received Placement Notifications in the Last 7 Days

```sql
SELECT DISTINCT student_id
FROM notifications
WHERE notification_type = 'Placement'
AND created_at >= NOW() - INTERVAL '7 days';

# Stage 4

## Problem

Currently notifications are fetched from the database every time a student loads a page. As the number of students and notifications grows, the database receives a large number of requests which can impact performance and user experience.

---

## Solution 1: Redis Caching

Store frequently accessed notifications in Redis.

### Advantages

1. Very fast access time.
2. Reduces database load.
3. Improves response time.

### Tradeoffs

1. Additional infrastructure is required.
2. Cache invalidation must be managed properly.

---

## Solution 2: Pagination

Instead of loading all notifications, load a limited number at a time.

Example:

GET /notifications?page=1&limit=20

### Advantages

1. Smaller response size.
2. Faster API responses.
3. Lower database load.

### Tradeoffs

1. Multiple requests may be required to view all notifications.

---

## Solution 3: WebSockets

Use WebSockets to push new notifications to users instead of repeatedly requesting notifications from the server.

### Advantages

1. Real-time updates.
2. Fewer database queries.
3. Better user experience.

### Tradeoffs

1. More complex implementation.
2. Requires connection management.

---

## Solution 4: Database Read Replicas

Create read replicas to handle read operations.

### Advantages

1. Reduces load on the primary database.
2. Improves scalability.

### Tradeoffs

1. Increased infrastructure cost.
2. Possible replication delay.

---

## Recommended Approach

A combination of:

1. Redis Caching
2. Pagination
3. WebSockets
4. Read Replicas

would provide the best performance and scalability for the notification system.

#Stage 5
function notify_all(student_ids, message):

    notification_id = save_notification_to_db(message)

    for student_id in student_ids:
        queue.publish({
            "student_id": student_id,
            "notification_id": notification_id
        })


worker consume(message):

    try:
        send_email(message.student_id, message.notification_id)
        update_status(message, "SUCCESS")
    except error:
        retry(message) or send_to_dead_letter_queue(message)