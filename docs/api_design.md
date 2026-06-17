# Cineverse API Design

This document details the API endpoints, input/output structures, and communication contracts for the Cineverse microservices.

---

## 1. Base URL Routing

All public APIs are exposed through the API Gateway at:
- **Local URL**: `http://localhost:5000`

---

## 2. Auth Service API (`/api/auth`)

Manages user registration, login, and administrative user management.

### A. Register User
- **Endpoint**: `POST /api/auth/register`
- **Request Body**:
  ```json
  {
    "name": "Naitik Pathak",
    "username": "naitik",
    "password": "mySecurePassword",
    "role": "Admin",
    "status": "Active"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "name": "Naitik Pathak",
    "username": "naitik",
    "role": "Admin",
    "status": "Active"
  }
  ```

### B. Login User
- **Endpoint**: `POST /api/auth/login`
- **Request Body**:
  ```json
  {
    "username": "naitik",
    "password": "mySecurePassword",
    "role": "Admin"
  }
  ```
- **Response (200 OK)**:
  - Returns a Base64-encoded authentication session token (containing `"username:role"`).
  ```json
  {
    "token": "bmFpdGlrOkFkbWlu"
  }
  ```

### C. Get All Users (Admin Feature)
- **Endpoint**: `GET /api/auth/users`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "name": "Naitik Pathak",
      "username": "naitik",
      "role": "Admin",
      "status": "Active"
    }
  ]
  ```

### D. Toggle User Status (Admin Feature)
- **Endpoint**: `POST /api/auth/users/{id}/toggle`
- **Response (200 OK)**:
  ```json
  {
    "id": 2,
    "username": "alice",
    "status": "Suspended"
  }
  ```

---

## 3. Movie Service API (`/api/movies`)

Manages movies, show schedules, and seat bookings.

### A. Get All Movies
- **Endpoint**: `GET /api/movies`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "title": "Interstellar",
      "genre": "Sci-Fi",
      "year": 2014,
      "rating": 8.7,
      "image": "https://...",
      "overview": "A team of explorers...",
      "reviews": []
    }
  ]
  ```

### B. Get Movie Details (with Integrated Reviews)
- **Endpoint**: `GET /api/movies/{id}`
- **Response (200 OK)**:
  ```json
  {
    "id": 3,
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "rating": 8.8,
    "image": "https://...",
    "overview": "A thief who steals...",
    "reviews": [
      {
        "id": 1,
        "author": "Naitik Pathak",
        "comment": "Masterpiece film!",
        "rating": 5
      }
    ]
  }
  ```

### C. Save Movie
- **Endpoint**: `POST /api/movies`
- **Request Body**:
  ```json
  {
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "rating": 8.8,
    "image": "https://...",
    "overview": "A thief who steals..."
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 3,
    "title": "Inception",
    "genre": "Sci-Fi",
    "year": 2010,
    "rating": 8.8,
    "image": "https://...",
    "overview": "A thief who steals..."
  }
  ```

### D. Create Booking
- **Endpoint**: `POST /api/movies/bookings`
- **Request Body**:
  ```json
  {
    "username": "alice",
    "movieTitle": "Inception",
    "seats": "C-2, C-3",
    "price": 25.0
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 10,
    "username": "alice",
    "movieTitle": "Inception",
    "seats": "C-2, C-3",
    "price": 25.0
  }
  ```

### E. Get Bookings by User
- **Endpoint**: `GET /api/movies/bookings?username={username}`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 10,
      "username": "alice",
      "movieTitle": "Inception",
      "seats": "C-2, C-3",
      "price": 25.0
    }
  ]
  ```

### F. Block Seats on Show Schedule
- **Endpoint**: `POST /api/movies/schedules/{scheduleId}/block`
- **Request Body (String format)**:
  ```
  A-1,A-2
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "movieId": 3,
    "movieTitle": "Inception",
    "showDate": "2026-06-12",
    "showTime": "18:00",
    "blockedSeats": "B-3,B-4,D-5,D-6,A-8,A-1,A-2"
  }
  ```

---

## 4. Review Service API (`/api/reviews`)

Manages ratings and reviews submitted by viewers.

### A. Get Reviews by Movie
- **Endpoint**: `GET /api/reviews?movieId={movieId}`
- **Response (200 OK)**:
  ```json
  [
    {
      "id": 1,
      "movieId": 3,
      "author": "Naitik Pathak",
      "comment": "Masterpiece film!",
      "rating": 5
    }
  ]
  ```

### B. Submit Review
- **Endpoint**: `POST /api/reviews`
- **Request Body**:
  ```json
  {
    "movieId": 3,
    "author": "Naitik Pathak",
    "comment": "Masterpiece film!",
    "rating": 5
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": 1,
    "movieId": 3,
    "author": "Naitik Pathak",
    "comment": "Masterpiece film!",
    "rating": 5
  }
  ```
