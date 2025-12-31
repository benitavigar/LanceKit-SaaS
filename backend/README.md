# Freelance CRM - Backend API

A production-ready NestJS backend API for managing freelance clients and invoices with JWT authentication.

## 🚀 Features

- ✅ **JWT Authentication** - Secure user registration and login
- ✅ **Client Management** - Full CRUD operations for freelance clients
- ✅ **Invoice System** - Complete invoicing with line items and auto-calculated totals
- ✅ **User Scoping** - Users can only access their own data
- ✅ **Input Validation** - DTOs with class-validator
- ✅ **API Documentation** - Auto-generated Swagger/OpenAPI docs
- ✅ **Clean Architecture** - Module/Controller/Service separation
- ✅ **Database ORM** - Prisma with PostgreSQL

## 📋 Prerequisites

- Node.js (v18 or higher)
- Docker and Docker Compose
- npm or yarn

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
# Create .env file from example
cp .env.example .env

# Install dependencies
npm install
```

### 2. Start PostgreSQL Database

```bash
# Start database container
docker-compose up -d

# Verify database is running
docker-compose ps
```

### 3. Run Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Create database schema
npx prisma migrate dev --name init
```

### 4. Start the Development Server

```bash
npm run start:dev
```

The API will be available at:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api/docs

## 📁 Project Structure

```
freelance-crm-backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── decorators/       # Custom decorators (@CurrentUser)
│   │   ├── dto/              # Data Transfer Objects
│   │   ├── guards/           # JWT guard
│   │   ├── strategies/       # Passport JWT strategy
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   └── auth.module.ts
│   ├── client/               # Client management module
│   │   ├── dto/
│   │   ├── client.controller.ts
│   │   ├── client.service.ts
│   │   └── client.module.ts
│   ├── invoice/              # Invoice management module
│   │   ├── dto/
│   │   ├── invoice.controller.ts
│   │   ├── invoice.service.ts
│   │   └── invoice.module.ts
│   ├── prisma/               # Prisma service module
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   ├── app.module.ts         # Root module
│   └── main.ts               # Application entry point
├── docker-compose.yml        # PostgreSQL container
├── package.json
└── tsconfig.json
```

## 🔐 API Endpoints

### Authentication

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login user | ❌ |
| GET | `/auth/me` | Get current user | ✅ |

### Clients

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/clients` | Create client | ✅ |
| GET | `/clients` | Get all user's clients | ✅ |
| GET | `/clients/:id` | Get client by ID | ✅ |
| PATCH | `/clients/:id` | Update client | ✅ |
| DELETE | `/clients/:id` | Delete client | ✅ |

### Invoices

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/invoices` | Create invoice | ✅ |
| GET | `/invoices` | Get all user's invoices | ✅ |
| GET | `/invoices/:id` | Get invoice by ID | ✅ |
| PATCH | `/invoices/:id` | Update invoice | ✅ |
| DELETE | `/invoices/:id` | Delete invoice | ✅ |

## 📝 Usage Examples

### 1. Register a User

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "createdAt": "2024-12-31T12:00:00.000Z"
  },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 2. Create a Client

```bash
curl -X POST http://localhost:3000/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@company.com",
    "company": "Acme Corp"
  }'
```

### 3. Create an Invoice

```bash
curl -X POST http://localhost:3000/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "invoiceNo": "INV-2024-001",
    "status": "DRAFT",
    "dueDate": "2024-12-31",
    "clientId": "client-uuid-here",
    "items": [
      {
        "description": "Website Development",
        "quantity": 40,
        "unitPrice": 75.50
      },
      {
        "description": "Logo Design",
        "quantity": 5,
        "unitPrice": 100.00
      }
    ]
  }'
```

**Response:**
```json
{
  "id": "invoice-uuid",
  "invoiceNo": "INV-2024-001",
  "status": "DRAFT",
  "totalAmount": 3520.00,
  "items": [...],
  "client": {...}
}
```

> **Note:** The `totalAmount` is automatically calculated from the invoice items!

## 🧪 Testing with Swagger

Visit http://localhost:3000/api/docs to:

1. **Authenticate**: Use the `/auth/register` or `/auth/login` endpoint
2. **Authorize**: Click the 🔒 "Authorize" button and paste your JWT token
3. **Test Endpoints**: Try out all API endpoints interactively

## 🗄️ Database Management

```bash
# Open Prisma Studio (GUI database editor)
npx prisma studio

# Reset database
npx prisma migrate reset

# Create a new migration
npx prisma migrate dev --name your_migration_name
```

## 🏗️ Architecture Highlights

### Separation of Concerns

- **Controllers**: Handle HTTP requests/responses
- **Services**: Contain business logic
- **Prisma Service**: Database access layer
- **DTOs**: Input validation and data transformation
- **Guards**: Authentication and authorization

### Key Features

1. **Auto-calculated Invoice Totals**: The `InvoiceService` automatically calculates `totalAmount` from line items
2. **User Scoping**: All services verify that users can only access their own data
3. **Password Security**: Bcrypt hashing with salt rounds
4. **Validation**: Class-validator decorators on all DTOs
5. **Error Handling**: Proper HTTP exceptions (404, 403, 409, etc.)

## 🔒 Security

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days (configurable)
- All Client and Invoice routes require authentication
- User data is isolated (can't access other users' data)
- Input validation on all endpoints

## 📦 Production Deployment

```bash
# Build the application
npm run build

# Start in production mode
npm run start:prod
```

**Environment Variables for Production:**
- Set a strong `JWT_SECRET`
- Update `DATABASE_URL` to your production database
- Set `NODE_ENV=production`

## 🤝 Contributing

This is a production-ready scaffold. Customize it to your needs!

## 📄 License

MIT
