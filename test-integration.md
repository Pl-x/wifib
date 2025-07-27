# Frontend-Backend Integration Test Guide

## 🧪 **Testing the Integration**

### **Prerequisites:**
1. Backend server running on `http://localhost:5000`
2. Frontend server running on `http://localhost:3000`
3. MySQL database configured and running

### **Step 1: Start Both Servers**

#### **Backend:**
```bash
cd backend
npm install
npm run dev
```

#### **Frontend:**
```bash
# In a new terminal
npm install
npm start
```

### **Step 2: Verify Backend Connection**

1. **Check Backend Status Indicator:**
   - Look at the bottom-right corner of the frontend
   - Should show "Backend Connected" with green indicator
   - If red, check backend server is running

2. **Test Health Check:**
   ```bash
   curl http://localhost:5000/health
   ```
   Should return:
   ```json
   {
     "status": "OK",
     "timestamp": "2024-01-01T00:00:00.000Z",
     "uptime": 123.456,
     "environment": "development"
   }
   ```

### **Step 3: Test M-Pesa Payment Integration**

1. **Navigate to Payments Page:**
   - Go to `http://localhost:3000/payments`
   - Select "M-Pesa (Mobile Money)" as payment method

2. **Fill Payment Form:**
   - Select a customer from dropdown
   - Enter amount (e.g., 50.00)
   - Enter phone number (e.g., 254700000000)
   - Click "Process Payment"

3. **Expected Behavior:**
   - Should show "Payment initiated (Simulation Mode)"
   - Status should change to "Payment pending"
   - After ~10 seconds, should show "Payment completed successfully!"
   - Payment should appear in the Recent Payments table

### **Step 4: Test API Endpoints**

#### **Test M-Pesa Payment Initiation:**
```bash
curl -X POST http://localhost:5000/api/payments/mpesa/initiate \
  -H "Content-Type: application/json" \
  -d '{
    "customerId": "customer-001",
    "amount": 50.00,
    "phoneNumber": "254700000000"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Payment initiated successfully",
  "data": {
    "paymentId": "uuid-here",
    "checkoutRequestID": "ws_CO_123456789",
    "customerMessage": "Success. Request accepted for processing",
    "isSimulated": true
  }
}
```

#### **Test Payment Status Query:**
```bash
curl -X GET http://localhost:5000/api/payments/mpesa/status/ws_CO_123456789
```

#### **Test Payment Statistics:**
```bash
curl -X GET http://localhost:5000/api/payments/stats
```

### **Step 5: Verify Database Integration**

1. **Check Database Tables:**
   ```sql
   USE legion;
   SHOW TABLES;
   SELECT * FROM payments LIMIT 5;
   SELECT * FROM customers LIMIT 5;
   SELECT * FROM plans LIMIT 5;
   ```

2. **Verify Payment Records:**
   - After processing a payment, check the `payments` table
   - Should see new records with M-Pesa details

### **Step 6: Test Error Handling**

1. **Invalid Phone Number:**
   - Try payment with invalid phone format
   - Should show validation error

2. **Backend Offline:**
   - Stop backend server
   - Frontend should show "Backend Offline" indicator
   - Payments should still work with local data

3. **Network Errors:**
   - Disconnect internet
   - Should gracefully handle connection errors

### **Step 7: Test Real M-Pesa (Optional)**

To test with real M-Pesa:

1. **Get Daraja API Credentials:**
   - Register at Safaricom Developer Portal
   - Get Consumer Key, Consumer Secret, Passkey, Shortcode

2. **Update Environment Variables:**
   ```env
   DARAJA_CONSUMER_KEY=your_real_consumer_key
   DARAJA_CONSUMER_SECRET=your_real_consumer_secret
   DARAJA_PASSKEY=your_real_passkey
   DARAJA_SHORTCODE=your_real_shortcode
   DARAJA_BASE_URL=https://api.safaricom.co.ke
   ```

3. **Test with Real Phone:**
   - Use a real M-Pesa registered phone number
   - Should receive actual STK Push notification

### **Step 8: Performance Testing**

1. **Multiple Payments:**
   - Process several payments simultaneously
   - Check for race conditions

2. **Large Data Sets:**
   - Add many customers and payments
   - Test pagination and performance

### **Step 9: Security Testing**

1. **CORS:**
   - Try accessing API from different origins
   - Should be blocked if not configured

2. **Rate Limiting:**
   - Make many rapid requests
   - Should be rate limited after 100 requests per 15 minutes

3. **Input Validation:**
   - Try SQL injection attempts
   - Should be properly sanitized

### **Step 10: Monitoring**

1. **Check Logs:**
   ```bash
   # Backend logs
   tail -f backend/logs/app.log
   
   # Database logs
   tail -f /var/log/mysql/error.log
   ```

2. **Monitor Network:**
   - Use browser DevTools Network tab
   - Check API request/response times

### **Troubleshooting**

#### **Common Issues:**

1. **Backend Connection Failed:**
   - Check MySQL service is running
   - Verify database credentials in `.env`
   - Check port 5000 is not in use

2. **CORS Errors:**
   - Verify CORS configuration in backend
   - Check frontend URL matches backend CORS settings

3. **Payment Not Processing:**
   - Check backend logs for errors
   - Verify Daraja API credentials (if using real M-Pesa)
   - Check database connection

4. **Frontend Not Loading:**
   - Check React development server
   - Verify all dependencies are installed
   - Check browser console for errors

### **Success Criteria:**

✅ Backend connects successfully  
✅ M-Pesa payments work in simulation mode  
✅ Payment status updates correctly  
✅ Database records are created  
✅ Frontend shows real-time status  
✅ Error handling works gracefully  
✅ Performance is acceptable  

---

**Integration Status: COMPLETE** 🎉 