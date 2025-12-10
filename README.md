# ICMS Backend (Phase 1 MVP)

Internal Company Management System Backend API.

## Tech Stack
- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication

## Setup

1.  **Install Dependencies**
    ```bash
    npm install
    ```

2.  **Environment Variables**
    Create a `.env` file in the root directory:
    ```env
    PORT=5000
    MONGODB_URI=mongodb://localhost:27017/icms
    JWT_SECRET=your_jwt_secret
    JWT_REFRESH_SECRET=your_refresh_secret
    NODE_ENV=development
    ```

3.  **Seed Data**
    Populate the database with initial data (Admin, Departments, Users):
    ```bash
    node src/seed/seed.js
    ```

4.  **Run Server**
    ```bash
    npm run dev
    ```

## API Documentation
Once the server is running, visit:
`http://localhost:5000/api-docs`

## Features (Phase 1)
-   **Authentication**: Login, Refresh Token, Change Password.
-   **Users**: CRUD, Role Management.
-   **Departments**: Master data management.
-   **Attendance**: Punch In/Out, Monthly Reports.
-   **Leaves**: Apply, Approve, Balance.
-   **Tasks**: Create, Assign, Update Status.
