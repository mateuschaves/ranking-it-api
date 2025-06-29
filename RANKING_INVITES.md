# Ranking Invites Feature

This document describes the ranking invites functionality that allows users to invite others to join their rankings.

## Overview

The ranking invites feature enables users to:
- Send invites to other users by email
- Accept or decline invites they receive
- View pending invites for a ranking
- Cancel invites they've sent

## API Endpoints

### Create Ranking Invite

**POST** `/rankings/:rankingId/invite`

Creates an invite for a user to join a specific ranking.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "id": "invite-123",
  "email": "user@example.com",
  "rankingId": "ranking-123",
  "invitedById": "user-456",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Invite sent successfully"
}
```

### Get My Invites

**GET** `/ranking-invites/my-invites`

Retrieves all pending invites for the authenticated user.

**Response:**
```json
{
  "invites": [
    {
      "id": "invite-123",
      "email": "user@example.com",
      "rankingId": "ranking-123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "ranking": {
        "id": "ranking-123",
        "name": "Best Restaurants",
        "description": "Top restaurants in the city",
        "banner": "banner-url"
      },
      "invitedBy": {
        "id": "user-456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1
}
```

### Get Ranking Invites

**GET** `/ranking-invites/ranking/:rankingId`

Retrieves all pending invites for a specific ranking (requires user to be a member of the ranking).

**Response:**
```json
{
  "invites": [
    {
      "id": "invite-123",
      "email": "user@example.com",
      "rankingId": "ranking-123",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "invitedBy": {
        "id": "user-456",
        "name": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "count": 1
}
```

### Accept Invite

**POST** `/ranking-invites/accept`

Accepts a ranking invite and adds the user to the ranking.

**Request Body:**
```json
{
  "inviteId": "invite-123"
}
```

**Response:**
```json
{
  "message": "Invite accepted successfully",
  "rankingId": "ranking-123",
  "rankingName": "Best Restaurants"
}
```

### Decline Invite

**DELETE** `/ranking-invites/decline/:inviteId`

Declines a ranking invite and removes it from the database.

**Response:**
```json
{
  "message": "Invite declined successfully"
}
```

### Cancel Invite

**DELETE** `/ranking-invites/cancel/:inviteId`

Cancels a ranking invite (can be called by the person who sent the invite or ranking members).

**Response:**
```json
{
  "message": "Invite canceled successfully"
}
```

## Business Rules

1. **Invite Creation:**
   - Only ranking members can send invites
   - Cannot invite users who are already members
   - Cannot send duplicate invites to the same email for the same ranking
   - Invites are sent by email (user doesn't need to exist in the system yet)

2. **Invite Acceptance:**
   - Only the user with the matching email can accept the invite
   - Cannot accept if already a member of the ranking
   - Accepting automatically adds the user to the ranking and deletes the invite

3. **Invite Management:**
   - Users can decline invites sent to their email
   - Invite senders or ranking members can cancel invites
   - All operations require proper authentication

## Database Schema

The feature uses the existing `RankingInvite` model:

```prisma
model RankingInvite {
  id          String @id @default(cuid())
  invitedById String
  rankingId   String
  email       String

  invitedBy User    @relation(fields: [invitedById], references: [id])
  ranking   Ranking @relation(fields: [rankingId], references: [id])

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## Error Handling

The API returns appropriate error messages for common scenarios:

- `User is already a member of this ranking`
- `An invite for this user to this ranking already exists`
- `Invite not found`
- `This invite is not for your email`
- `You are already a member of this ranking`

## Security

- All endpoints require JWT authentication
- Users can only access invites relevant to them
- Proper validation ensures users can only perform actions they're authorized for 