# API Reference

Base URL (local default): `http://localhost:5000/api`

All API endpoints require `Authorization: Bearer <firebase-id-token>` unless server dev auth bypass is enabled.

## Rooms

### `POST /rooms`
Create room.

### `GET /rooms`
List rooms where current user is a member.

### `GET /rooms/:roomId`
Get room details.

### `POST /rooms/join/:code`
Join room by invite code.

### `PUT /rooms/:roomId`
Update room (creator only).

### `DELETE /rooms/:roomId`
Delete room (creator only).

## Roommates

### `POST /roommates`
Create roommate record.

### `GET /roommates`
List roommates excluding current user.

### `GET /roommates/me`
Get current user profile.

### `PUT /roommates/me`
Update current user profile fields (`displayName`, `bio`, `profilePicture`).

### `PUT /roommates/:id`
Update roommate by ID.

### `DELETE /roommates/:id`
Delete roommate by ID.

## Chores

### `POST /chores`
Create chore. If `roomId` is omitted, a default room is created/used.

### `GET /chores`
List chores.

### `PUT /chores/:id`
Update chore fields (`title`, `assignedTo`, `completed`).

### `DELETE /chores/:id`
Delete chore.

## Expenses

### `POST /expenses`
Create expense. Requires valid `description`, positive `amount`, and `paidBy`.
If `roomId` is omitted, a default room is created/used.

### `GET /expenses`
List expenses.

### `PUT /expenses/:id`
Update expense fields (`description`, `amount`, `paidBy`, `splitBetween`).

### `DELETE /expenses/:id`
Delete expense.

### `GET /expenses/balances/summary`
Get current user net balance summary.

## Events

### `GET /events`
List all events.

### `GET /events/range?start=<iso>&end=<iso>`
List events in date range.

### `GET /events/upcoming`
List upcoming events (limited).

### `GET /events/bills/unpaid`
List unpaid bill events.

### `POST /events`
Create event (creator is current user).

### `PUT /events/:id`
Update event.

### `PATCH /events/:id/pay`
Mark bill event as paid.

### `DELETE /events/:id`
Delete event.

## Chat (REST history endpoints)

### `GET /chat/:roomId/chat`
Get room message history (membership required).

### `POST /chat/:roomId/chat`
Create room message (membership required).

## Socket.IO events

After connecting with auth token:

- Client emits `joinRoom(roomId)`
- Client emits `sendMessage({ roomId, text, relatedType?, relatedId? })`
- Server emits `chatMessage` with populated sender
- Server may emit `errorMessage`

## Rate limits

Configured in server:

- General API: 100 requests / 15 minutes / IP
- Write-heavy routes: 30 requests / 15 minutes / IP

