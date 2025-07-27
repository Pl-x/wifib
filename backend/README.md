# Legion Connections Backend API

A Node.js backend API for the Legion Connections WiFi Billing System with MySQL database and M-Pesa (Daraja API) integration.

## 🚀 Features

- **MySQL Database**: Robust relational database with proper indexing and relationships
- **M-Pesa Integration**: Complete Daraja API integration for mobile payments
- **Payment Processing**: STK Push, payment status queries, and callback handling
- **Security**: JWT authentication, rate limiting, input validation
- **API Documentation**: RESTful API endpoints with proper error handling
- **Development Mode**: Simulation mode for testing without real M-Pesa credentials

## 📋 Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

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
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=legion_connections
   DB_PORT=3306

   # Daraja API Configuration (Optional for development)
   DARAJA_CONSUMER_KEY=your_daraja_consumer_key
   DARAJA_CONSUMER_SECRET=your_daraja_consumer_secret
   DARAJA_BASE_URL=https://sandbox.safaricom.co.ke
   DARAJA_PASSKEY=your_daraja_passkey
   DARAJA_SHORTCODE=your_daraja_shortcode
   DARAJA_CALLBACK_URL=http://localhost:5000/api/payments/mpesa/callback
   ```

4. **Create MySQL database:**
   ```sql
   CREATE DATABASE legion_connections;
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

The application automatically creates the following tables:

### Customers
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - Customer full name
- `email` (VARCHAR) - Unique email address
- `phone` (VARCHAR) - Phone number
- `plan_id` (VARCHAR) - Foreign key to plans
- `status` (ENUM) - active, inactive, pending
- `address` (TEXT) - Customer address
- `join_date` (DATE) - Registration date
- `last_payment_date` (DATE) - Last payment date

### Plans
- `id` (VARCHAR) - Primary key
- `name` (VARCHAR) - Plan name
- `speed` (VARCHAR) - Internet speed
- `price` (DECIMAL) - Monthly price
- `data_limit` (VARCHAR) - Data limit
- `description` (TEXT) - Plan description
- `is_active` (BOOLEAN) - Plan availability

### Bills
- `id` (VARCHAR) - Primary key
- `customer_id` (VARCHAR) - Foreign key to customers
- `plan_id` (VARCHAR) - Foreign key to plans
- `amount` (DECIMAL) - Bill amount
- `issue_date` (DATE) - Bill issue date
- `due_date` (DATE) - Payment due date
- `status` (ENUM) - pending, paid, overdue, cancelled
- `payment_method` (VARCHAR) - Payment method used
- `payment_date` (DATE) - Payment date

### Payments
- `id` (VARCHAR) - Primary key
- `customer_id` (VARCHAR) - Foreign key to customers
- `bill_id` (VARCHAR) - Foreign key to bills
- `amount` (DECIMAL) - Payment amount
- `payment_method` (ENUM) - credit_card, bank_transfer, paypal, cash, mpesa
- `transaction_id` (VARCHAR) - M-Pesa transaction ID
- `status` (ENUM) - pending, completed, failed, cancelled
- `mpesa_phone` (VARCHAR) - M-Pesa phone number
- `mpesa_receipt` (VARCHAR) - M-Pesa receipt number

### Users
- `id` (VARCHAR) - Primary key
- `username` (VARCHAR) - Unique username
- `email` (VARCHAR) - Unique email
- `password_hash` (VARCHAR) - Hashed password
- `role` (ENUM) - admin, staff
- `is_active` (BOOLEAN) - Account status

### Activities
- `id` (VARCHAR) - Primary key
- `user_id` (VARCHAR) - Foreign key to users
- `action` (VARCHAR) - Action performed
- `entity_type` (VARCHAR) - Type of entity affected
- `entity_id` (VARCHAR) - ID of affected entity
- `details` (JSON) - Additional details
- `ip_address` (VARCHAR) - User IP address
- `user_agent` (TEXT) - User agent string

## 🔌 API Endpoints

### M-Pesa Payment Endpoints

#### Initiate M-Pesa Payment
```http
POST /api/payments/mpesa/initiate
Content-Type: application/json

{
  "customerId": "customer-123",
  "amount": 100.00,
  "phoneNumber": "254700000000",
  "billId": "bill-123" // Optional
}
```

#### Query Payment Status
```http
GET /api/payments/mpesa/status/{checkoutRequestID}
```

#### M-Pesa Callback (Internal)
```http
POST /api/payments/mpesa/callback
```

### General Payment Endpoints

#### Get All Payments
```http
GET /api/payments?page=1&limit=10&status=completed&customerId=customer-123
```

#### Get Payment by ID
```http
GET /api/payments/{paymentId}
```

#### Get Payment Statistics
```http
GET /api/payments/stats
```

### Health Check
```http
GET /health
```

## 💳 M-Pesa Integration

### Development Mode
In development mode, the system simulates M-Pesa responses without requiring real Daraja API credentials:

- **STK Push Simulation**: Generates fake checkout request IDs
- **Status Query Simulation**: Returns random success/failure scenarios
- **80% Success Rate**: Simulates realistic payment success rates

### Production Mode
For production, configure real Daraja API credentials:

1. **Get Daraja API Credentials** from Safaricom Developer Portal
2. **Configure Environment Variables**:
   ```env
   DARAJA_CONSUMER_KEY=your_consumer_key
   DARAJA_CONSUMER_SECRET=your_consumer_secret
   DARAJA_PASSKEY=your_passkey
   DARAJA_SHORTCODE=your_shortcode
   ```
3. **Set Callback URL** to your production domain

### Phone Number Validation
The system validates Kenyan phone numbers in these formats:
- `07XXXXXXXX` (10 digits starting with 0)
- `2547XXXXXXXX` (11 digits starting with 254)
- `7XXXXXXXX` (9 digits starting with 7)

## 🔒 Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Express-validator for all endpoints
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Restricted to frontend domain
- **Helmet Security**: HTTP headers protection
- **Request Size Limits**: 10MB max request size

## 🧪 Testing

### Manual Testing with cURL

#### Test M-Pesa Payment Initiation:
```bash
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-001",
    "amount": 50.00,
    "phoneNumber": "254700000000"
  }'
```

#### Test Payment Status Query:
```bash
curl -X GET http://localhost:5000/api/payments/mpesa/status/{checkoutRequestID}
```

#### Test Health Check:
```bash
curl -X GET http://localhost:5000/health
```

## 🚀 Deployment

### Environment Variables for Production:
```env
NODE_ENV=production
PORT=5000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=legion_connections
JWT_SECRET=your_super_secure_jwt_secret
DARAJA_CONSUMER_KEY=your_production_consumer_key
DARAJA_CONSUMER_SECRET=your_production_consumer_secret
DARAJA_BASE_URL=https://api.safaricom.co.ke
DARAJA_PASSKEY=your_production_passkey
DARAJA_SHORTCODE=your_production_shortcode
DARAJA_CALLBACK_URL=https://yourdomain.com/api/payments/mpesa/callback
FRONTEND_URL=https://yourdomain.com
```

### PM2 Deployment:
```bash
npm install -g pm2
pm2 start server.js --name "legion-connections-api"
pm2 save
pm2 startup
```

## 📝 Logs

The application logs:
- **Database connections** and initialization
- **M-Pesa API calls** and responses
- **Payment processing** events
- **Error details** in development mode
- **Access logs** with Morgan middleware

## 🔧 Troubleshooting

### Common Issues:

1. **Database Connection Failed**:
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Ensure database exists

2. **M-Pesa Integration Issues**:
   - Verify Daraja API credentials
   - Check network connectivity to Safaricom API
   - Review callback URL configuration

3. **Port Already in Use**:
   - Change PORT in `.env` file
   - Kill existing process: `lsof -ti:5000 | xargs kill -9`

## 📞 Support

For issues and questions:
- Check the logs for error details
- Verify environment configuration
- Test with the provided cURL examples
- Review the API documentation

## 🔄 Updates

The system automatically:
- Creates database tables on startup
- Inserts default plans and admin user
- Handles database migrations
- Manages M-Pesa token refresh

---

**Legion Connections** - Modern WiFi Billing System with M-Pesa Integration 