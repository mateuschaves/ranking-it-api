# Swagger API Documentation

![Test Coverage](https://img.shields.io/badge/test%20coverage-0%25-red)

## Overview

This API provides comprehensive documentation for the Ranking IT API using Swagger/OpenAPI 3.0. The documentation is automatically generated from the code and provides an interactive interface for testing API endpoints.

## Accessing the Documentation

### Local Development
When running the application locally, you can access the Swagger documentation at:

```
http://localhost:3000/api
```

### Production
In production, the documentation will be available at:

```
https://your-domain.com/api
```

## API Structure

The API is organized into the following sections:

### 🔐 User Authentication
- **POST** `/user/signup` - Create a new user account
- **POST** `/user/signin` - Sign in with existing account

### 📊 Rankings
- **POST** `/rankings` - Create a new ranking
- **GET** `/rankings` - Get all rankings for the authenticated user
- **PUT** `/rankings/:rankingId` - Update a ranking
- **POST** `/rankings/:rankingId/invite` - Invite a user to join a ranking
- **GET** `/rankings/:rankingId/suggest-criteria` - Get AI-suggested criteria for a ranking
- **GET** `/rankings/:rankingId/criteria` - Get ranking criteria
- **POST** `/rankings/:rankingId/criteria` - Create ranking criteria
- **DELETE** `/rankings/:rankingId/criteria/:criteriaId` - Remove ranking criteria

### 📧 Ranking Invites
- **POST** `/ranking-invites` - Create a ranking invite
- **GET** `/ranking-invites/my-invites` - Get all invites for the authenticated user
- **GET** `/ranking-invites/ranking/:rankingId` - Get all invites for a specific ranking
- **POST** `/ranking-invites/accept` - Accept a ranking invite
- **DELETE** `/ranking-invites/decline/:inviteId` - Decline a ranking invite
- **DELETE** `/ranking-invites/cancel/:inviteId` - Cancel a ranking invite

### 📎 Attachments
- **POST** `/attachments` - Upload a file
- **GET** `/attachments/:key` - Get a private file by key

## Authentication

Most endpoints require JWT authentication. To authenticate:

1. Use the `/user/signin` endpoint to get a JWT token
2. Click the "Authorize" button in the Swagger UI
3. Enter your JWT token in the format: `Bearer your-jwt-token-here`
4. Click "Authorize"

## Data Models

### User Authentication
```typescript
// SignUpDto
{
  name?: string;
  email: string;
  password: string;
  avatarId?: string;
}

// SignInDto
{
  email: string;
  password: string;
}
```

### Rankings
```typescript
// CreateRankingDto
{
  name: string;
  description?: string;
  photo?: string;
  ownerId: string; // Automatically set from JWT
}

// UpdateRankingDto
{
  name?: string;
  description?: string;
  photo?: string;
}
```

### Ranking Invites
```typescript
// CreateRankingInviteDto
{
  email: string;
  rankingId: string;
}

// AcceptRankingInviteDto
{
  inviteId: string;
}
```

### Ranking Criteria
```typescript
// CreateRankingCriteriaDto
{
  criteria: string;
}
```

## Response Examples

### Successful User Signup
```json
{
  "id": "user-123",
  "email": "john.doe@example.com",
  "name": "John Doe",
  "token": "jwt-token-here"
}
```

### Successful Ranking Creation
```json
{
  "id": "ranking-123",
  "name": "Best Restaurants in NYC",
  "description": "Top restaurants in New York City",
  "ownerId": "user-123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

### Successful Invite Creation
```json
{
  "id": "invite-123",
  "email": "friend@example.com",
  "rankingId": "ranking-123",
  "invitedById": "user-123",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "message": "Invite sent successfully"
}
```

## Error Responses

### Validation Error (400)
```json
{
  "statusCode": 400,
  "message": ["Email não pode ser vazio"],
  "error": "Bad Request"
}
```

### Unauthorized (401)
```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

### Not Found (404)
```json
{
  "statusCode": 404,
  "message": "Ranking not found",
  "error": "Not Found"
}
```

## Testing with Swagger UI

1. **Explore Endpoints**: Browse through the different API sections
2. **Try It Out**: Click "Try it out" on any endpoint to test it
3. **Fill Parameters**: Enter required parameters and request body
4. **Execute**: Click "Execute" to make the API call
5. **View Response**: See the response, status code, and headers

## Features

- ✅ **Interactive Documentation**: Test endpoints directly from the browser
- ✅ **Request/Response Examples**: See example data for all endpoints
- ✅ **Authentication Support**: JWT Bearer token authentication
- ✅ **Parameter Validation**: Automatic validation of request parameters
- ✅ **Response Schemas**: Detailed response schemas for all endpoints
- ✅ **Error Documentation**: Comprehensive error response documentation

## Development

### Adding New Endpoints

To add Swagger documentation to new endpoints:

1. **Add ApiTags decorator** to controllers:
   ```typescript
   @ApiTags('Your Section')
   @Controller('your-endpoint')
   ```

2. **Add ApiOperation decorator** to methods:
   ```typescript
   @ApiOperation({ summary: 'Description of what this endpoint does' })
   ```

3. **Add ApiResponse decorators** for different status codes:
   ```typescript
   @ApiResponse({
     status: 200,
     description: 'Success response description',
   })
   ```

4. **Add ApiProperty decorators** to DTOs:
   ```typescript
   @ApiProperty({
     description: 'Field description',
     example: 'example value',
   })
   ```

### Regenerating Documentation

The documentation is automatically generated when the server starts. No manual regeneration is needed.

## Security

- All sensitive endpoints are protected with JWT authentication
- The Swagger UI includes an "Authorize" button for easy token management
- Bearer token format is used for authentication
- File upload endpoints support both public and private access control

## Support

For questions about the API or documentation, please refer to:
- The interactive Swagger UI for endpoint testing
- This documentation for general information
- The source code for implementation details 