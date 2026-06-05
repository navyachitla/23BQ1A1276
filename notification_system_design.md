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