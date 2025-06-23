# GuestHouse_WebApp

A full-stack web application for booking guest houses, built with a Java Spring Boot backend and a React frontend.

## Project Structure

This project follows a monorepo structure and is divided into two main parts:

-   `GuestHouseBooking_backend/`: The backend application built with Java and Spring Boot.
-   `GuestHouseBooking_Frontend/`: The frontend application built with React and TypeScript.

## Technologies Used

### Backend

-   **Java 24**
-   **Spring Boot**
-   **Spring Security** (with JWT for authentication)
-   **Spring Data JPA** (Hibernate)
-   **MySQL** as the database
-   **Maven** for dependency management
-   **Java Mail Sender** for email notifications

### Frontend

-   **React**
-   **TypeScript**
-   **Material-UI (MUI)** for the user interface components
-   **React Router** for client-side routing
-   **Axios** for making HTTP requests to the backend
-   **Formik and Yup** for form handling and validation
-   **date-fns** for date manipulation

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

Make sure you have the following installed on your local development machine:

-   Java JDK 17 or later
-   Maven
-   Node.js and npm
-   MySQL

### Backend Setup

1.  **Configure the database:**
    -   Open the `GuestHouseBooking_backend/src/main/resources/application.properties` file.
    -   Update the `spring.datasource.url`, `spring.datasource.username`, and `spring.datasource.password` properties to match your local MySQL setup. You will need to have a database named `guest_house_booking`.

2.  **Configure email:**
    -   In the same `application.properties` file, update the `spring.mail.username` and `spring.mail.password` for the application's email functionality.

3.  **Run the backend server:**
    -   Navigate to the `GuestHouseBooking_backend` directory in your terminal.
    -   Run the command `mvn spring-boot:run` to start the backend server.
    -   The server will start on `http://localhost:8080`.

### Frontend Setup

1.  **Navigate to the frontend directory:**
    ```sh
    cd GuestHouseBooking_Frontend/guesthouse-booking-frontend
    ```

2.  **Install dependencies:**
    ```sh
    npm install
    ```

3.  **Start the frontend development server:**
    ```sh
    npm start
    ```

4.  The application will be accessible at `http://localhost:3000` in your browser. 
