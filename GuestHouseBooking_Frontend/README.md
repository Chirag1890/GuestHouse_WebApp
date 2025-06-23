# Guest House Booking System - Frontend

This is the frontend application for the Guest House Booking System. It's built with React, TypeScript, and Material-UI.

## Features

- User Authentication (Login/Register)
- Browse Guest Houses
- View Room Details
- Book Rooms/Beds
- View Booking History
- Admin Dashboard for Booking Management

## Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd GuestHouseBooking_Frontend
```

2. Install dependencies:
```bash
npm install
```

## Running the Application

1. Start the development server:
```bash
npm start
```

The application will start running at `http://localhost:3000`

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
REACT_APP_API_URL=http://localhost:8080/api
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from create-react-app

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── types/         # TypeScript interfaces
  ├── App.tsx        # Main app component
  └── index.tsx      # Entry point
```

## API Integration

The frontend communicates with the backend API using Axios. The API base URL can be configured in the `.env` file.

## Authentication

The application uses JWT tokens for authentication. Tokens are stored in localStorage and automatically included in API requests through an Axios interceptor.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request 