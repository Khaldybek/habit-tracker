# Habit Tracker API Documentation

## Health Check

### Check API Status
```http
GET {{baseUrl}}/api/health
```

## Authentication

### Register
```http
POST {{baseUrl}}/api/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@",
  "name": "Test User"
}
```

### Login
```http
POST {{baseUrl}}/api/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!@"
}
```

### Get Profile
```http
GET {{baseUrl}}/api/auth/profile
Authorization: Bearer {{token}}
```

### Update Profile
```http
PATCH {{baseUrl}}/api/auth/profile
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "name": "Updated Name",
  "email": "updated@example.com"
}
```

### Change Password
```http
POST {{baseUrl}}/api/auth/change-password
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "currentPassword": "CurrentPass123!@",
  "newPassword": "NewPass123!@"
}
```

### Forgot Password
```http
POST {{baseUrl}}/api/auth/forgot-password
Content-Type: application/json

{
  "email": "test@example.com"
}
```

### Reset Password
```http
POST {{baseUrl}}/api/auth/reset-password
Content-Type: application/json

{
  "token": "reset_token_here",
  "newPassword": "NewPass123!@"
}
```

## Habits

### Create Habit
```http
POST {{baseUrl}}/api/habits
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Daily Exercise",
  "description": "30 minutes of exercise",
  "category": "fitness",
  "frequency": {
    "type": "daily",
    "times": 1,
    "days": []
  },
  "target": {
    "type": "duration",
    "value": 30,
    "unit": "minutes"
  },
  "icon": "fitness",
  "color": "#4F46E5",
  "priority": "high",
  "reminderEnabled": true,
  "reminderTime": "08:00",
  "startDate": "2023-01-01",
  "endDate": "2023-12-31",
  "tags": ["health", "fitness"]
}
```

### Get Habits
```http
GET {{baseUrl}}/api/habits
Authorization: Bearer {{token}}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- category: string (optional, one of: health, fitness, learning, productivity, mindfulness, other)
- status: string (optional)
```

### Get Habit
```http
GET {{baseUrl}}/api/habits/:id
Authorization: Bearer {{token}}
```

### Update Habit
```http
PATCH {{baseUrl}}/api/habits/:id
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "title": "Updated Exercise",
  "description": "45 minutes of exercise",
  "target": {
    "type": "duration",
    "value": 45,
    "unit": "minutes"
  }
}
```

### Delete Habit
```http
DELETE {{baseUrl}}/api/habits/:id
Authorization: Bearer {{token}}
```

## Check-ins

### Create Check-in
```http
POST {{baseUrl}}/api/checkins
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "habitId": "habit_id_here",
  "date": "2023-01-01",
  "status": true,
  "note": "Completed 45 minutes of exercise",
  "mood": 5,
  "duration": 45,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  }
}
```

### Get Check-ins
```http
GET {{baseUrl}}/api/checkins
Authorization: Bearer {{token}}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- habitId: string (optional)
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)
- status: boolean (optional)
- mood: number (optional, 1-5)
```

### Get Check-in
```http
GET {{baseUrl}}/api/checkins/:id
Authorization: Bearer {{token}}
```

### Update Check-in
```http
PATCH {{baseUrl}}/api/checkins/:id
Authorization: Bearer {{token}}
Content-Type: application/json

{
  "date": "2023-01-01",
  "status": true,
  "note": "Updated: Completed 45 minutes of exercise",
  "mood": 5,
  "duration": 45,
  "location": {
    "latitude": 40.7128,
    "longitude": -74.0060,
    "address": "New York, NY"
  }
}
```

### Delete Check-in
```http
DELETE {{baseUrl}}/api/checkins/:id
Authorization: Bearer {{token}}
```

## Notifications

### Get Notifications
```http
GET {{baseUrl}}/api/notifications
Authorization: Bearer {{token}}
Query Parameters:
- page: number (default: 1)
- limit: number (default: 10)
- read: boolean (optional)
```

### Get Unread Count
```http
GET {{baseUrl}}/api/notifications/unread/count
Authorization: Bearer {{token}}
```

### Mark as Read
```http
PATCH {{baseUrl}}/api/notifications/:id/read
Authorization: Bearer {{token}}
```

### Mark All as Read
```http
PATCH {{baseUrl}}/api/notifications/read/all
Authorization: Bearer {{token}}
```

### Delete Notification
```http
DELETE {{baseUrl}}/api/notifications/:id
Authorization: Bearer {{token}}
```

### Delete All Notifications
```http
DELETE {{baseUrl}}/api/notifications/all
Authorization: Bearer {{token}}
```

## Analytics

### Get Habit Stats
```http
GET {{baseUrl}}/api/analytics/habits/:habitId
Authorization: Bearer {{token}}
Query Parameters:
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)
- period: string (optional, one of: day, week, month)
```

### Get User Stats
```http
GET {{baseUrl}}/api/analytics/user
Authorization: Bearer {{token}}
Query Parameters:
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)
- period: string (optional, one of: day, week, month)
- page: number (default: 1)
- limit: number (default: 10)
```

### Export Data
```http
GET {{baseUrl}}/api/analytics/export
Authorization: Bearer {{token}}
Query Parameters:
- startDate: string (optional, ISO 8601)
- endDate: string (optional, ISO 8601)
- format: string (optional, one of: json, csv)
```

## Common Response Formats

### Success Response
```json
{
  "status": "success",
  "data": {
    // Response data here
  }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error message here",
  "errors": [
    {
      "field": "field_name",
      "message": "Validation error message"
    }
  ]
}
```

### Pagination Response
```json
{
  "status": "success",
  "data": {
    "items": [],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

## Notes

1. All requests except login, register, forgot-password, and reset-password require the `Authorization` header with a valid JWT token
2. Date formats should be in ISO 8601 format (YYYY-MM-DD)
3. All IDs are MongoDB ObjectIds
4. Pagination is available for list endpoints
5. Error responses include detailed validation messages when applicable
6. Valid categories for habits: health, fitness, learning, productivity, mindfulness, other
7. Valid frequency types: daily, weekly, monthly
8. Valid target types: boolean, number, duration
9. Valid priority levels: low, medium, high
10. Mood values must be integers between 1 and 5 