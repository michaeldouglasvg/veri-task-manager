# Task Manager Application

This is a full-stack Task Manager application built with Angular (Frontend) and Spring Boot (Backend). The application allows users to manage tasks with authentication and authorization features.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

### Backend Requirements
- Java JDK 17 or higher
- Maven 3.6+ or higher
- An IDE (recommended: IntelliJ IDEA or Eclipse)

### Frontend Requirements
- Node.js (v18 or higher)
- npm (comes with Node.js)
- Angular CLI v19.2.17

<!-- Sample Pages -->
https://docs.google.com/document/d/1IAgdkXrWsO5372_o92mSrEn-JleoumuBakGH9oCXyvE/edit?usp=sharing

<!-- DEVELOPMENT -->
## Development Setup
### Backend Setup (Spring Boot)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Maven dependencies (if not using Maven Wrapper):
   ```bash
   mvn clean install
   ```

3. Configure application properties:
   - The application uses H2 database by default
   - Configuration files are located in:
     - `src/main/resources/application.properties` (main configuration)
     - `src/main/resources/application-dev.properties` (development profile)
     - `src/main/resources/application-prod.properties` (production profile)

4. Run the application in development mode:
   ```bash
   ./mvnw spring-boot:run -Dspring.profiles.active=dev
   ```
   The backend server will start on `http://localhost:8082`

   Note: Using `./mvnw` ensures you're using the Maven Wrapper, which doesn't require Maven to be installed on your system.

### Frontend Setup (Angular)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```
   The frontend application will be available at `http://localhost:4200`
   
   This command starts the Angular development server with live reload enabled.


<!-- PRODUCTION -->
## Production Setup
### Backend Production Build and Deploy

1. Update production configurations in `src/main/resources/application-prod.properties`

2. Build the application with production profile:
   ```bash
   ./mvnw clean package -Pprod
   ```

3. Run the production build:
   ```bash
   java -jar target/taskmanager-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod
   ```

### Frontend Production Build and Deploy

1. Build the application for production:
   ```bash
   ng build --configuration production
   ```

2. The production build will be created in `dist/frontend/`

3. Deploy the contents of `dist/frontend` to your web server
   - For Apache: Copy to `/var/www/html/`
   - For Nginx: Copy to `/usr/share/nginx/html/`

## Technology Stack

### Backend Technologies
- Spring Boot 3.5.6
- Spring Security
- Spring Data JPA
- H2 Database
- JSON Web Token (JWT) 0.11.5
- Lombok
- Maven

### Frontend Dependencies
- Angular 19.2.0
- Angular CLI 19.2.17
- RxJS 7.8.0
- @auth0/angular-jwt 5.2.0
- ngx-quill 27.1.2
- TypeScript 5.7.2

## Features
- User Authentication (Login/Register)
- JWT-based Authorization
- Task Management (CRUD operations)
- Responsive Design
- Form Validation
- HTTP Interceptors for JWT
- Route Guards for Protected Routes


<!-- STRUCTURE -->
## Project Structure
### Backend Structure
```
backend/
├── src/main/java/com/example/taskmanager/
│   ├── config/         # Configuration classes
│   ├── controller/     # REST controllers
│   ├── dto/           # Data Transfer Objects
│   ├── model/         # Entity classes
│   ├── repository/    # JPA repositories
│   ├── service/       # Business logic
│   └── security/      # Security configurations
```

### Frontend Structure
```
frontend/src/app/
├── auth/              # Authentication components
│   ├── login/
│   └── register/
├── shared/           # Shared services and guards
├── tasks/           # Task management components
├── models/          # TypeScript interfaces
└── assets/         # Static resources
```


<!-- CONFIGURATIONS -->
## Environment Configuration
### Development Environment
The development environment is configured for local development with hot-reload capabilities.

Backend (application-dev.properties):
- H2 Database with in-memory storage
- Debug logging enabled
- CORS configured for Angular development server
- JWT token configured for development

Frontend (environment.ts):
- API URL pointing to local backend (`http://localhost:8082`)
- Debug mode enabled
- Development server with hot reload

### Production Environment
The production environment is optimized for performance and security.

Backend (application-prod.properties):
- Configure your production database
- Logging level set to INFO
- CORS configured for production domain
- Enhanced security settings

Frontend (environment.prod.ts):
- API URL pointing to production backend
- Production optimizations enabled
- Disabled debug mode

## Security Considerations
- The application uses JWT for authentication
- Passwords are hashed using BCrypt
- CORS is configured for development
- Protected routes are secured with Guards
- HTTP-only cookies for JWT storage

## API Documentation
The backend provides RESTful endpoints:

- POST /api/auth/register - Register new user
- POST /api/auth/login - User login
- GET /api/tasks - Get all tasks
- POST /api/tasks - Create new task
- PUT /api/tasks/{id} - Update task
- DELETE /api/tasks/{id} - Delete task


<!-- DEBUGGING -->
## Troubleshooting
### Backend Issues
- Ensure Java 17 is installed and JAVA_HOME is set correctly
- Check application.properties for correct database configuration
- Verify that port 8080 is available

### Frontend Issues
- Clear npm cache if facing installation issues:
  ```bash
  npm cache clean --force
  ```
- Check if Angular CLI is installed globally:
  ```bash
  npm install -g @angular/cli
  ```
- Make sure backend URL is correctly configured in environment files

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License
This project is licensed under the MIT License.
