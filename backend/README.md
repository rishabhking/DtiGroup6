# CodingSphere3 Backend

A modern Node.js backend API built with Express.js and MongoDB for the CodingSphere3 platform.

## 🚀 Features

- **Express.js** - Fast, unopinionated web framework
- **MongoDB** with **Mongoose** - NoSQL database with elegant object modeling
- **ES6 Modules** - Modern JavaScript module system
- **Environment Variables** - Configuration management with dotenv
- **Error Handling** - Centralized error handling middleware
- **RESTful API** - Clean and organized API endpoints

## 📁 Project Structure

```
backend/
├── config/
│   └── database.js          # MongoDB connection configuration
├── controllers/             # Request handlers (future)
├── middleware/
│   └── errorHandler.js      # Global error handling middleware
├── models/
│   └── User.js              # User model schema
├── routes/
│   └── users.js             # User-related API routes
├── utils/                   # Utility functions
├── .env                     # Environment variables
├── .gitignore              # Git ignore rules
├── index.js                # Main application entry point
├── package.json            # Project dependencies and scripts
└── README.md               # This file
```

## 🛠️ Installation

1. **Clone the repository and navigate to backend:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory with:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/codingsphere3
   ```

4. **Make sure MongoDB is running:**
   - Install MongoDB locally or use MongoDB Atlas
   - Default connection: `mongodb://localhost:27017/codingsphere3`

## 🚀 Running the Application

### Development Mode (with auto-restart)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📋 API Endpoints

### Health Check
- **GET** `/health` - Server health status

### Users
- **GET** `/api/users` - Get all users
- **GET** `/api/users/:id` - Get user by ID
- **POST** `/api/users` - Create new user

### Example User Creation
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }'
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/codingsphere3` |

## 🛡️ Security Features

- **Input Validation** - Mongoose schema validation
- **Error Handling** - No sensitive data exposure

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests (to be implemented)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the ISC License.
