# API Documentation

This document provides documentation for the API endpoints in the application.

## Endpoints

- [Attendance](#attendance)
- [Club](#club)
- [Club User](#club-user)
- [Generate QR Token](#generate-qr-token)
- [Profile](#profile)
- [User Profile](#user-profile)
- [Verify QR](#verify-qr)

---

## Attendance

### `GET /api/attendance`

Retrieves attendance records for the authenticated user's club.

**Authentication:** Requires an authenticated user who is associated with a club.

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  [
    {
      "attendanceId": "string",
      "scanTime": "string (ISO 8601 date-time)",
      "deviceId": "string",
      "userName": "string",
      "clubName": "string"
    }
  ]
  ```

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `400 Bad Request` - If the authenticated user does not have a `clubId`.
- **Status:** `404 Not Found` - If the user's club is not found.
- **Status:** `500 Internal Server Error` - For any other server-side error.

---

## Club

### `POST /api/club`

Creates a new club.

**Authentication:** Requires an authenticated user.

**Request Body:**

```json
{
  "name": "string",
  "location": "string",
  "description": "string"
}
```

**Response:**

- **Status:** `200 OK`
- **Body:** The created club object.

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `400 Bad Request` - If the request body is invalid.
- **Status:** `404 Not Found` - If the user is not found in the database.

### `GET /api/club`

Retrieves the club of the authenticated user.

**Authentication:** Requires an authenticated user.

**Response:**

- **Status:** `200 OK`
- **Body:** The user's club object.

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `404 Not Found` - If the user is not found, doesn't have a club, or the club doesn't exist.
- **Status:** `500 Internal Server Error` - For any other server-side error.

---

## Club User

### `GET /api/club/user`

Retrieves all users who are not currently assigned to a club.

**Authentication:** Requires an authenticated user.

**Response:**

- **Status:** `200 OK`
- **Body:** An array of user objects.

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `500 Internal Server Error` - For any other server-side error.

### `POST /api/club/user`

Adds a user to a club.

**Authentication:** Requires an authenticated user who is the owner of the club.

**Request Body:**

```json
{
  "clubId": "string",
  "userId": "string"
}
```

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "message": "Usuario añadido al club exitosamente"
  }
  ```

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `400 Bad Request` - If `clubId` or `userId` are missing from the request body.
- **Status:** `404 Not Found` - If the club or user is not found.
- **Status:** `403 Forbidden` - If the authenticated user is not the owner of the club.
- **Status:** `400 Bad Request` - If the user to be added already belongs to a club.
- **Status:** `500 Internal Server Error` - For any other server-side error.

---

## Generate QR Token

### `POST /api/generate-qr-token`

Generates a JWT for an admin user to be used in a QR code.

**Authentication:** Requires an authenticated user with the 'admin' role.

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "token": "string",
    "expiresAt": "number"
  }
  ```

**Error Responses:**

- **Status:** `500 Internal Server Error` - If the server configuration is invalid (e.g., missing `JWT_SECRET_KEY`).
- **Status:** `401 Unauthorized` - If no session is found or the user's email is not in the session.
- **Status:** `403 Forbidden` - If the user does not have the 'admin' role.
- **Status:** `500 Internal Server Error` - If the server fails to sign or store the JWT.

---

## Profile

### `POST /api/profile`

Updates a user's profile information (name and ID number).

**Authentication:** Requires an authenticated user.

**Request Body:**

```json
{
  "name": "string",
  "idNumber": "string"
}
```

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "success": true,
    "message": "Perfil actualizado correctamente"
  }
  ```

**Error Responses:**

- **Status:** `400 Bad Request` - If the request body is invalid.
- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `400 Bad Request` - If the user's email is not found.
- **Status:** `409 Conflict` - If the `idNumber` already exists.
- **Status:** `500 Internal Server Error` - For any other server-side or database error.

---

## User Profile

### `GET /api/user/profile`

Retrieves the authenticated user's profile.

**Authentication:** Requires an authenticated user.

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "success": true,
    "profile": "object"
  }
  ```

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `404 Not Found` - If the user profile is not found.
- **Status:** `500 Internal Server Error` - For any other server-side error.

### `PUT /api/user/profile`

Updates the authenticated user's profile (name, phone, clubId).

**Authentication:** Requires an authenticated user.

**Request Body:**

```json
{
  "name": "string",
  "phone": "string",
  "clubId": "string"
}
```

**Response:**

- **Status:** `200 OK`
- **Body:**
  ```json
  {
    "success": true,
    "profile": "object"
  }
  ```

**Error Responses:**

- **Status:** `401 Unauthorized` - If the user is not authenticated.
- **Status:** `400 Bad Request` - If no data is provided for the update or if the user's email is missing.
- **Status:** `500 Internal Server Error` - For any other server-side error.

---

## Verify QR

### `POST /api/verify-qr`

Verifies a QR code token.

**Request Body:**

```json
{
  "token": "string",
  "deviceId": "string"
}
```

**Response:**

- **Status:** `200 OK`
- **Body:** The result of the verification.

**Error Responses:**

- The specific error response will vary depending on the nature of the error, but it will be a JSON object describing the error.
