const { pool } = require('../config/database');
const darajaService = require('../services/darajaService');
const { v4: uuidv4 } = require('uuid');

class PaymentController {
  // Initiate M-Pesa payment
  async initiateMpesaPayment(req, res) {
    try {
      const { customerId, amount, phoneNumber, billId } = req.body;

      // Validate required fields
      if (!customerId || !amount || !phoneNumber) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID, amount, and phone number are required'
        });
      }

      // Get customer details
      const [customers] = await pool.execute(
        'SELECT * FROM customers WHERE id = ?',
        [customerId]
      );

      if (customers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const customer = customers[0];

      // Validate phone number format
      let validatedPhone;
      try {
        validatedPhone = darajaService.validatePhoneNumber(phoneNumber);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      // Create payment record
      const paymentId = uuidv4();
      const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      await pool.execute(
        `INSERT INTO payments (id, customer_id, bill_id, amount, payment_method, transaction_id, status, mpesa_phone) 
         VALUES (?, ?, ?, ?, 'mpesa', ?, 'pending', ?)`,
        [paymentId, customerId, billId || null, amount, transactionId, validatedPhone]
      );

      // Initiate STK Push
      const stkResponse = await darajaService.initiateSTKPush(
        validatedPhone,
        amount,
        `Customer: ${customer.name}`,
        'WiFi Service Payment'
      );

      if (stkResponse.success) {
        // Update payment with checkout request ID
        await pool.execute(
          'UPDATE payments SET transaction_id = ? WHERE id = ?',
          [stkResponse.checkoutRequestID, paymentId]
        );

        return res.status(200).json({
          success: true,
          message: 'Payment initiated successfully',
          data: {
            paymentId,
            checkoutRequestID: stkResponse.checkoutRequestID,
            customerMessage: stkResponse.customerMessage,
            isSimulated: stkResponse.isSimulated || false
          }
        });
      } else {
        // Update payment status to failed
        await pool.execute(
          'UPDATE payments SET status = ? WHERE id = ?',
          ['failed', paymentId]
        );

        return res.status(400).json({
          success: false,
          message: 'Failed to initiate payment',
          error: stkResponse.responseDescription
        });
      }

    } catch (error) {
      console.error('Error initiating M-Pesa payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Query payment status
  async queryPaymentStatus(req, res) {
    try {
      const { checkoutRequestID } = req.params;

      if (!checkoutRequestID) {
        return res.status(400).json({
          success: false,
          message: 'Checkout request ID is required'
        });
      }

      // Get payment from database
      const [payments] = await pool.execute(
        'SELECT * FROM payments WHERE transaction_id = ?',
        [checkoutRequestID]
      );

      if (payments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      const payment = payments[0];

      // Query Daraja API for status
      const queryResponse = await darajaService.querySTKPushStatus(checkoutRequestID);

      if (queryResponse.success) {
        let newStatus = 'pending';
        let mpesaReceipt = null;

        if (queryResponse.resultCode === '0') {
          newStatus = 'completed';
          mpesaReceipt = queryResponse.mpesaReceiptNumber;
          
          // Update payment status
          await pool.execute(
            `UPDATE payments SET 
             status = ?, 
             mpesa_receipt = ?, 
             payment_date = NOW() 
             WHERE id = ?`,
            [newStatus, mpesaReceipt, payment.id]
          );

          // If there's a bill, update its status
          if (payment.bill_id) {
            await pool.execute(
              `UPDATE bills SET 
               status = 'paid', 
               payment_method = 'mpesa',
               payment_date = NOW() 
               WHERE id = ?`,
              [payment.bill_id]
            );
          }

          // Update customer's last payment date
          await pool.execute(
            'UPDATE customers SET last_payment_date = NOW() WHERE id = ?',
            [payment.customer_id]
          );

        } else if (['1', '1032', '1037', '1038'].includes(queryResponse.resultCode)) {
          newStatus = 'failed';
          
          await pool.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            [newStatus, payment.id]
          );
        }

        return res.status(200).json({
          success: true,
          data: {
            paymentId: payment.id,
            status: newStatus,
            resultCode: queryResponse.resultCode,
            resultDesc: queryResponse.resultDesc,
            amount: queryResponse.amount,
            mpesaReceiptNumber: mpesaReceipt,
            phoneNumber: queryResponse.phoneNumber,
            isSimulated: queryResponse.isSimulated || false
          }
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'Failed to query payment status',
          error: queryResponse.resultDesc
        });
      }

    } catch (error) {
      console.error('Error querying payment status:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Handle Daraja callback
  async handleMpesaCallback(req, res) {
    try {
      const callbackData = req.body;

      console.log('📞 M-Pesa Callback received:', JSON.stringify(callbackData, null, 2));

      // Process the callback
      const result = darajaService.processCallback(callbackData);

      if (result.success) {
        // Find payment by checkout request ID
        const [payments] = await pool.execute(
          'SELECT * FROM payments WHERE transaction_id = ?',
          [result.checkoutRequestID]
        );

        if (payments.length > 0) {
          const payment = payments[0];

          // Update payment status
          await pool.execute(
            `UPDATE payments SET 
             status = 'completed', 
             mpesa_receipt = ?, 
             payment_date = NOW() 
             WHERE id = ?`,
            [result.mpesaReceiptNumber, payment.id]
          );

          // Update bill status if exists
          if (payment.bill_id) {
            await pool.execute(
              `UPDATE bills SET 
               status = 'paid', 
               payment_method = 'mpesa',
               payment_date = NOW() 
               WHERE id = ?`,
              [payment.bill_id]
            );
          }

          // Update customer's last payment date
          await pool.execute(
            'UPDATE customers SET last_payment_date = NOW() WHERE id = ?',
            [payment.customer_id]
          );

          console.log(`✅ Payment ${payment.id} completed successfully`);
        }
      } else {
        // Payment failed
        const [payments] = await pool.execute(
          'SELECT * FROM payments WHERE transaction_id = ?',
          [result.checkoutRequestID]
        );

        if (payments.length > 0) {
          await pool.execute(
            'UPDATE payments SET status = ? WHERE id = ?',
            ['failed', payments[0].id]
          );

          console.log(`❌ Payment ${payments[0].id} failed: ${result.resultDesc}`);
        }
      }

      // Respond to Daraja API
      res.status(200).json({
        ResultCode: 0,
        ResultDesc: 'Success'
      });

    } catch (error) {
      console.error('Error handling M-Pesa callback:', error);
      res.status(500).json({
        ResultCode: 1,
        ResultDesc: 'Failed to process callback'
      });
    }
  }

  // Get all payments
  async getAllPayments(req, res) {
    try {
      const { page = 1, limit = 10, status, customerId } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT p.*, c.name as customer_name, c.email as customer_email, b.id as bill_id
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        LEFT JOIN bills b ON p.bill_id = b.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND p.status = ?';
        params.push(status);
      }

      if (customerId) {
        query += ' AND p.customer_id = ?';
        params.push(customerId);
      }

      query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const [payments] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM payments WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      if (customerId) {
        countQuery += ' AND customer_id = ?';
        countParams.push(customerId);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return res.status(200).json({
        success: true,
        data: payments,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting payments:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get payment by ID
  async getPaymentById(req, res) {
    try {
      const { id } = req.params;

      const [payments] = await pool.execute(
        `SELECT p.*, c.name as customer_name, c.email as customer_email, b.id as bill_id, b.amount as bill_amount
         FROM payments p
         LEFT JOIN customers c ON p.customer_id = c.id
         LEFT JOIN bills b ON p.bill_id = b.id
         WHERE p.id = ?`,
        [id]
      );

      if (payments.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: payments[0]
      });

    } catch (error) {
      console.error('Error getting payment:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get payment statistics
  async getPaymentStats(req, res) {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_payments,
          SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_payments,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_payments,
          SUM(CASE WHEN status = 'failed' THEN 1 ELSE 0 END) as failed_payments,
          SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_amount,
          AVG(CASE WHEN status = 'completed' THEN amount ELSE NULL END) as average_amount
        FROM payments
      `);

      const [methodStats] = await pool.execute(`
        SELECT 
          payment_method,
          COUNT(*) as count,
          SUM(amount) as total_amount
        FROM payments 
        WHERE status = 'completed'
        GROUP BY payment_method
      `);

      const [recentPayments] = await pool.execute(`
        SELECT p.*, c.name as customer_name
        FROM payments p
        LEFT JOIN customers c ON p.customer_id = c.id
        ORDER BY p.created_at DESC
        LIMIT 5
      `);

      return res.status(200).json({
        success: true,
        data: {
          overview: stats[0],
          byMethod: methodStats,
          recent: recentPayments
        }
      });

    } catch (error) {
      console.error('Error getting payment stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new PaymentController(); 