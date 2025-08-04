# Legion Connections - WiFi Billing System

A modern WiFi service management and billing system built on React and Node.js.

## 🚀 Features

- **Modern UI/UX**: Beautiful and intuitive interface using Tailwind CSS
- **Full Functionality**: Customer management, billing, payments, and plans
- **Analytics**: Detailed reports and charts using Recharts
- **Responsive Design**: Works on all devices
- **English Localization**: Full English language support
- **Real-time**: Real-time data updates

## 📋 System Components

### Main Pages:
- **Dashboard** - Main panel with key metrics
- **Customers** - Customer management (CRUD operations)
- **Billing** - Invoice generation and management
- **Payments** - Payment processing
- **Plans** - Service plan management
- **Reports** - Business analytics and reports

### Components:
- **Layout**: Sidebar, Header, Navigation
- **UI**: StatCard, Modal, Forms, Tables
- **Charts**: Revenue, Customer Distribution, Payment Methods
- **Context**: DataProvider for state management

## 🛠 Technologies

### Frontend:
- **React 18** - Main framework
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Recharts** - Charts and diagrams
- **Lucide React** - Icons
- **React Hot Toast** - Notifications
- **React Hook Form** - Form management

### Backend (recommended):
- **Node.js** - Server environment
- **Express.js** - Web framework
- **MongoDB/PostgreSQL** - Database
- **JWT** - Authentication
- **Multer** - File uploads
- **Nodemailer** - Email sending

## 📦 Installation and Setup

### 1. Clone the repository
```bash
git clone <repository-url>
cd legion-connections-billing
```

### 2. Install dependencies
```bash
npm install
```

### 3. Run in development mode
```bash
npm start
```

Application will be available at: http://localhost:3000

### 4. Build for production
```bash
npm run build
```

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the project root:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Legion Connections
```

## 📊 Data Structure

### Customers
```javascript
{
  id: string,
  name: string,
  email: string,
  phone: string,
  plan: string,
  status: 'active' | 'inactive' | 'pending',
  address: string,
  joinDate: string,
  lastPayment: string | null
}
```

### Bills
```javascript
{
  id: string,
  customerId: string,
  customerName: string,
  amount: number,
  dueDate: string,
  status: 'paid' | 'pending' | 'overdue',
  issueDate: string
}
```

### Payments
```javascript
{
  id: string,
  customerId: string,
  customerName: string,
  amount: number,
  method: string,
  date: string,
  status: 'completed' | 'pending',
  invoiceNumber: string
}
```

### Plans
```javascript
{
  id: string,
  name: string,
  speed: string,
  price: number,
  dataLimit: string,
  description: string
}
```

## 🔐 What Still Needs to be Added

### 1. Backend API
```bash
# Create backend folder
mkdir backend
cd backend
npm init -y
npm install express mongoose cors dotenv bcryptjs jsonwebtoken
```

### 2. Database
- **MongoDB** for NoSQL solution
- **PostgreSQL** for relational DB
- **Redis** for caching

### 3. Authentication
- JWT tokens
- User roles (Admin, Manager, Operator)
- Protected routes

### 4. Additional Features
- **Email notifications** - payment reminders
- **SMS integration** - customer notifications
- **PDF generation** - invoices and reports
- **API integrations** - payment systems
- **Network monitoring** - connection status
- **Automatic billing** - scheduled billing
- **Discount system** - promo codes and promotions
- **Multi-language** - other language support

### 5. DevOps
- **Docker** - containerization
- **Nginx** - web server
- **PM2** - process management
- **SSL certificates** - HTTPS
- **Backup systems** - data backup

### 6. Monitoring
- **Logging** - action logging
- **Analytics** - usage analytics
- **Error tracking** - error monitoring
- **Performance monitoring** - performance tracking

## 🎨 Customization

### Color Scheme
Change colors in `tailwind.config.js`:

```javascript
colors: {
  primary: {
    500: '#your-color',
    // ...
  }
}
```

### Localization
Add new languages to components or use i18next.

### Themes
Add dark theme support in `DataContext`.

## 📱 Mobile Version

The application is fully responsive and works on:
- 📱 Mobile phones
- 📱 Tablets
- 💻 Desktops
- 🖥 Large screens

## 🤝 Contributing

1. Fork the repository
2. Create a branch for new feature
3. Make changes
4. Create a Pull Request

## 📄 License

MIT License - see LICENSE file for details.

## 🆘 Support

If you have questions or issues:
- Create an Issue on GitHub
- Refer to documentation
- Check examples in code

## 🚀 Demo

Demo version available at: [demo link]

---

**Legion Connections** - Your reliable partner in WiFi service management! 🌐