#### Setup

```bash
npm install && npm start
```

#### Database Connection

1. Import connect.js
2. Invoke in start()
3. Setup .env in the root
4. Add MONGO_URI with correct value

#### Routers

- auth.js
- jobs.js

#### User Model

Email Validation Regex

```regex
/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
```

#### Register User

- Validate - name, email, password - with Mongoose
- Hash Password (with bcryptjs)
- Save User
- Generate Token
- Send Response with Token

#### Login User

- Validate - email, password - in controller
- If email or password is missing, throw BadRequestError
- Find User
- Compare Passwords
- If no user or password does not match, throw UnauthenticatedError
- If correct, generate Token
- Send Response with Token

#### Mongoose Errors

- Validation Errors
- Duplicate (Email)
- Cast Error

#### Security

- helmet
- cors
- xss-clean
- express-rate-limit

#### API Endpoints

##### Authentication

- **POST /api/v1/auth/register**

  Register a new user.

  Request Body:

  ```json
  {
    "name": "string",
    "email": "string",
    "password": "string"
  }
  ```

  Response:

  ```json
  {
    "user": {
      "name": "string"
    },
    "token": "string"
  }
  ```

- **POST /api/v1/auth/login**

  Login a user.

  Request Body:

  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```

  Response:

  ```json
  {
    "user": {
      "name": "string"
    },
    "token": "string"
  }
  ```

##### Jobs

All jobs endpoints require authentication. Include the token in the Authorization header: `Bearer <token>`

- **GET /api/v1/jobs**

  Get all jobs for the authenticated user.

  Response:

  ```json
  {
    "jobs": [
      {
        "_id": "string",
        "company": "string",
        "position": "string",
        "status": "pending|interview|declined",
        "createdBy": "string",
        "createdAt": "date",
        "updatedAt": "date"
      }
    ],
    "count": number
  }
  ```

- **POST /api/v1/jobs**

  Create a new job.

  Request Body:

  ```json
  {
    "company": "string",
    "position": "string"
  }
  ```

  Response:

  ```json
  {
    "job": {
      "_id": "string",
      "company": "string",
      "position": "string",
      "status": "pending",
      "createdBy": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

- **GET /api/v1/jobs/:id**

  Get a specific job by ID.

  Response:

  ```json
  {
    "job": {
      "_id": "string",
      "company": "string",
      "position": "string",
      "status": "pending|interview|declined",
      "createdBy": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

- **PATCH /api/v1/jobs/:id**

  Update a job.

  Request Body:

  ```json
  {
    "status": "pending|interview|declined",
    "company": "string (optional)",
    "position": "string (optional)"
  }
  ```

  Response:

  ```json
  {
    "job": {
      "_id": "string",
      "company": "string",
      "position": "string",
      "status": "pending|interview|declined",
      "createdBy": "string",
      "createdAt": "date",
      "updatedAt": "date"
    }
  }
  ```

- **DELETE /api/v1/jobs/:id**

  Delete a job.

  Response:

  ```json
  {
    "msg": "Job deleted successfully"
  }
  ```

Swagger UI

```yaml
/jobs/{id}:
  parameters:
    - in: path
      name: id
      schema:
        type: string
      required: true
      description: the job id
```
