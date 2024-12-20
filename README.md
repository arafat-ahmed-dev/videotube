# videotube

## Backend Documentation

### Folder Structure

The backend folder contains the following components:

- **controllers/**: 
  - Contains the logic for handling incoming requests and sending responses. Each controller corresponds to a specific resource in the application.
  
- **middlewares/**: 
  - Contains middleware functions that process requests before they reach the controllers. This includes authentication, logging, and error handling.

- **models/**: 
  - Defines the data structure and interacts with the database. Each model corresponds to a specific entity in the application.

- **routes/**: 
  - Defines the API endpoints and maps them to the appropriate controller functions.

- **utils/**: 
  - Contains utility functions and classes that provide common functionality across the application, such as error handling and API response formatting.

### API Endpoints

#### User Routes:
- **POST /register**: Register a new user (handles avatar and cover image uploads).
  - **Request**: 
    - Body: `{ "username": "string", "password": "string", "email": "string", "avatar": "file", "coverImage": "file" }`
  - **Response**: 
    - Success: `{ "message": "User registered successfully", "user": { "id": "string", "username": "string", "email": "string" } }`
    - Error: `{ "error": "Error message" }`

- **POST /login**: Log in a user.
  - **Request**: 
    - Body: `{ "username": "string", "password": "string" }`
  - **Response**: 
    - Success: `{ "accessToken": "string", "refreshToken": "string" }`
    - Error: `{ "error": "Error message" }`

- **POST /logout**: Log out the current user (requires authentication).
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "message": "Logged out successfully" }`
    - Error: `{ "error": "Error message" }`

- **POST /refresh-token**: Refresh the access token.
  - **Request**: 
    - Body: `{ "refreshToken": "string" }`
  - **Response**: 
    - Success: `{ "accessToken": "string" }`
    - Error: `{ "error": "Error message" }`

- **POST /password-change**: Change the current user's password (requires authentication).
  - **Request**: 
    - Body: `{ "currentPassword": "string", "newPassword": "string" }`
  - **Response**: 
    - Success: `{ "message": "Password changed successfully" }`
    - Error: `{ "error": "Error message" }`

- **PATCH /update-account**: Update account details (requires authentication).
  - **Request**: 
    - Body: `{ "email": "string", "username": "string" }`
  - **Response**: 
    - Success: `{ "message": "Account updated successfully" }`
    - Error: `{ "error": "Error message" }`

- **PATCH /avatar**: Update the user's avatar (requires authentication).
  - **Request**: 
    - Body: `{ "avatar": "file" }`
  - **Response**: 
    - Success: `{ "message": "Avatar updated successfully" }`
    - Error: `{ "error": "Error message" }`

- **PATCH /cover-image**: Update the user's cover image (requires authentication).
  - **Request**: 
    - Body: `{ "coverImage": "file" }`
  - **Response**: 
    - Success: `{ "message": "Cover image updated successfully" }`
    - Error: `{ "error": "Error message" }`

- **GET /current-user**: Retrieve the current user's information (requires authentication).
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "user": { "id": "string", "username": "string", "email": "string" } }`
    - Error: `{ "error": "Error message" }`

- **GET /c/:username**: Get the channel profile of a user by username (requires authentication).
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "profile": { "username": "string", "subscribers": "number", "videos": "array" } }`
    - Error: `{ "error": "Error message" }`

- **GET /history**: Get the watch history of the current user (requires authentication).
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "history": "array" }`
    - Error: `{ "error": "Error message" }`

#### Tweet Routes:
- **POST /tweets**: Create a new tweet (handles image upload).
  - **Request**: 
    - Body: `{ "content": "string", "tweetImage": "file" }`
  - **Response**: 
    - Success: `{ "message": "Tweet created successfully", "tweet": { "id": "string", "content": "string" } }`
    - Error: `{ "error": "Error message" }`

- **GET /tweets**: Retrieve all tweets for the authenticated user.
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "tweets": "array" }`
    - Error: `{ "error": "Error message" }`

- **PATCH /tweets/:tweetId/content**: Update the content of a specific tweet.
  - **Request**: 
    - Body: `{ "content": "string" }`
  - **Response**: 
    - Success: `{ "message": "Tweet content updated successfully" }`
    - Error: `{ "error": "Error message" }`

- **PATCH /tweets/:tweetId/image**: Update the image of a specific tweet (handles image upload).
  - **Request**: 
    - Body: `{ "tweetImage": "file" }`
  - **Response**: 
    - Success: `{ "message": "Tweet image updated successfully" }`
    - Error: `{ "error": "Error message" }`

- **DELETE /tweets/:tweetId**: Delete a specific tweet.
  - **Request**: 
    - Headers: `{ "Authorization": "Bearer token" }`
  - **Response**: 
    - Success: `{ "message": "Tweet deleted successfully" }`
    - Error: `{ "error": "Error message" }`

### Getting Started

To get started with the backend, ensure you have the necessary dependencies installed. You can do this by running:

```bash
npm install
```

### Running the Application

To run the backend server, use the following command:

```bash
npm start
```

This will start the server on the specified port, allowing you to access the API endpoints.
