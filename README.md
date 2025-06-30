# Hospital Appointment Scheduling - Backend API

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

A comprehensive NestJS backend API for hospital appointment scheduling system with advanced features including real-time chat, video consultation, payment integration, and multi-database support.

## 🚀 Features

- 🏥 **Hospital & Doctor Management**: Complete CRUD operations with certification management
- 📅 **Appointment Scheduling**: Advanced booking system with time slot management
- 💰 **Payment Integration**: VNPay and MoMo payment gateways
- 💬 **Real-time Chat**: WebSocket-based messaging system
- 🎥 **Video Consultation**: WebRTC signaling for telemedicine
- 📧 **Email Notifications**: Automated appointment reminders and confirmations
- 🔐 **Authentication**: JWT-based auth with Google OAuth integration
- 📊 **Analytics Dashboard**: Comprehensive reporting and analytics
- 🗃️ **Multi-Database**: PostgreSQL + MongoDB + Redis support
- ☁️ **Cloud Storage**: Cloudinary integration for media management

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v13 or higher)
- **MongoDB** (v5 or higher)
- **Redis** (v6 or higher)

## 🛠️ Environment Setup

Create a `.env` file in the root directory with the following configuration:

```env
# Server Configuration
PORT=3000
FRONTEND_URL="http://localhost:4000"

# Database Configuration
DATABASE_URL="postgresql://postgres:123456@localhost:32768/postgres"
MONGODB_URL="mongodb://localhost:27017/mydb?retryWrites=true"
REDIS_URL=redis://localhost:6379

# JWT Authentication
JWT_ACCESS_TOKEN_SECRET=1111
JWT_REFRESH_TOKEN_SECRET=2222
JWT_ACCESS_TOKEN_EXPIRATION=1d
JWT_REFRESH_TOKEN_EXPIRATION=7d

# Google OAuth Configuration
GOOGLE_CLIENT_ID==""
GOOGLE_CLIENT_SECRET=""
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/redirect

# VNPay Payment Configuration (Sandbox)
VNPAY_TMN_CODE=""
VNPAY_HASH_SECRET=""
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:4000/payment-success

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""

# Email Configuration (Gmail SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=""
SMTP_PASSWORD=""
```

## 🗄️ Database Setup

### PostgreSQL Setup
```bash
# Install PostgreSQL and create database
createdb postgres

# Run Prisma migrations
npx prisma migrate dev --name init --schema=prisma/postgre/schema.prisma
npx prisma generate --schema=prisma/postgre/schema.prisma

# Open Prisma Studio
npx prisma studio --schema=prisma/postgre/schema.prisma
```

### MongoDB Setup
```bash
# Make sure MongoDB is running
mongod

# Generate Prisma client for MongoDB
npx prisma generate --schema=prisma/mongo/schema.prisma
```

### Redis Setup
```bash
# Install and start Redis
redis-server
```

## 🚀 Installation & Running

```bash
# Install dependencies
npm install

# Development mode
npm run start:dev

# Production mode
npm run start:prod

# Watch mode
npm run start

# Reset database (if needed)
npx prisma migrate reset --schema=prisma/postgre/schema.prisma
```

## 📚 API Documentation

Once the server is running, visit:
- **Swagger UI**: https://bookingserver.devtri.xyz/api
- **API Endpoints**: https://bookingserver.devtri.xyz/docs

### Key API Endpoints

```
🔐 Authentication
POST /auth/login
POST /auth/register
GET  /auth/google
POST /auth/refresh

🏥 Hospitals
GET    /hospital
POST   /hospital
PUT    /hospital/:id
DELETE /hospital/:id

👨‍⚕️ Doctors
GET    /doctor
POST   /doctor
PUT    /doctor/:id
DELETE /doctor/:id

📅 Appointments
GET    /appointment
POST   /appointment
PUT    /appointment/:id
DELETE /appointment/:id

💰 Payments
POST /payment/vnpay/create
POST /payment/vnpay/return
POST /payment/momo/create

💬 Chat
WebSocket: /chat
GET  /chat/conversations
POST /chat/send

👤 Patient Profiles
GET    /patient-profile
POST   /patient-profile
PUT    /patient-profile/:id
DELETE /patient-profile/:id
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## 🏗️ Project Structure

```
src/
├── app.module.ts              # Main application module
├── main.ts                    # Application entry point
├── auth/                      # Authentication module
│   ├── strategies/            # Passport strategies
│   ├── guards/               # Auth guards
│   └── decorators/           # Custom decorators
├── appointment/              # Appointment management
├── doctor/                   # Doctor management
├── hospital/                 # Hospital management
├── chat/                     # Real-time messaging
├── payment/                  # Payment processing
├── patient-profile/          # Patient management
├── email/                    # Email services
├── cloudinary/              # Media upload
├── prisma/                  # Database services
├── common/                  # Shared utilities
└── config/                  # Configuration files

prisma/
├── postgre/                 # PostgreSQL schema
└── mongo/                   # MongoDB schema
```

## 🔌 WebSocket Events

### Chat Events
```typescript
// Client to Server
'join-conversation'    // Join a chat room
'send-message'        // Send a message
'leave-conversation'  // Leave a chat room

// Server to Client
'new-message'         // Receive new message
'user-joined'         // User joined conversation
'user-left'          // User left conversation
```
## 💳 Payment Integration

### VNPay Configuration
1. Register at [VNPay Sandbox](https://sandbox.vnpayment.vn/)
2. Get TMN Code and Hash Secret
3. Configure return URL in environment variables

### MoMo Configuration
1. Register at [MoMo Developer](https://developers.momo.vn/)
2. Get Partner Code and Access Key
3. Set up webhook endpoints

## 📧 Email Templates

Email templates are located in `src/email/templates/`:
- `appointment-confirmation.template.html`
- `appointment-reminder.html`
- `follow-up-reminder.html`

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Cross-origin resource sharing configuration
- **Input Validation**: DTOs with class-validator
- **Password Hashing**: bcrypt for password security
- **Role-based Access**: Guards for different user roles

## 🌐 Deployment

### Production Deployment
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Environment Variables for Production
Update the following for production:
- `DATABASE_URL`: Production PostgreSQL URL
- `MONGODB_URL`: Production MongoDB URL
- `REDIS_URL`: Production Redis URL
- `FRONTEND_URL`: Production frontend URL
- `VNPAY_*`: Production VNPay credentials
- `CLOUDINARY_*`: Production Cloudinary settings

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the code comments and API documentation
- **Issues**: Create an issue on GitHub for bug reports
- **Email**: Contact the development team for urgent issues

## 🔗 Related Projects

- **Frontend**: [Hospital Appointment UI](../scheduling_an_appointment_ui)
- **Mobile App**: Coming soon...

---

**Built with ❤️ using NestJS, Prisma, and modern web technologies**
