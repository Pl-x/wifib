// backend/controllers/billController.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class BillController {
  // Get all bills
  async getAllBills(req, res) {
    try {
      const { page = 1, limit = 50, status, customerId } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT b.*, c.name as customer_name, c.email as customer_email
        FROM bills b
        LEFT JOIN customers c ON b.customer_id = c.id
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND b.status = ?';
        params.push(status);
      }

      if (customerId) {
        query += ' AND b.customer_id = ?';
        params.push(customerId);
      }

      query += ' ORDER BY b.created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const [bills] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM bills WHERE 1=1';
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
        data: bills,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting bills:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get bill by ID
  async getBillById(req, res) {
    try {
      const { id } = req.params;

      const [bills] = await pool.execute(
        `SELECT b.*, c.name as customer_name, c.email as customer_email, c.phone as customer_phone
         FROM bills b
         LEFT JOIN customers c ON b.customer_id = c.id
         WHERE b.id = ?`,
        [id]
      );

      if (bills.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: bills[0]
      });

    } catch (error) {
      console.error('Error getting bill:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create new bill
  async createBill(req, res) {
    try {
      const { customerId, amount, description, dueDate } = req.body;

      // Validate required fields
      if (!customerId || !amount || !dueDate) {
        return res.status(400).json({
          success: false,
          message: 'Customer ID, amount, and due date are required'
        });
      }

      // Check if customer exists
      const [customers] = await pool.execute(
        'SELECT id, name FROM customers WHERE id = ? AND status != "deleted"',
        [customerId]
      );

      if (customers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const billId = uuidv4();
      const issueDate = new Date().toISOString().split('T')[0];

      await pool.execute(
        `INSERT INTO bills (id, customer_id, amount, description, due_date, issue_date, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [billId, customerId, amount, description || null, dueDate, issueDate]
      );

      // Fetch the created bill with customer info
      const [newBill] = await pool.execute(
        `SELECT b.*, c.name as customer_name, c.email as customer_email
         FROM bills b
         LEFT JOIN customers c ON b.customer_id = c.id
         WHERE b.id = ?`,
        [billId]
      );

      return res.status(201).json({
        success: true,
        message: 'Bill created successfully',
        data: newBill[0]
      });

    } catch (error) {
      console.error('Error creating bill:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update bill
  async updateBill(req, res) {
    try {
      const { id } = req.params;
      const { amount, description, dueDate, status } = req.body;

      // Check if bill exists
      const [existingBill] = await pool.execute(
        'SELECT id FROM bills WHERE id = ?',
        [id]
      );

      if (existingBill.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      if (amount !== undefined) {
        updateFields.push('amount = ?');
        updateValues.push(amount);
      }
      if (description !== undefined) {
        updateFields.push('description = ?');
        updateValues.push(description);
      }
      if (dueDate) {
        updateFields.push('due_date = ?');
        updateValues.push(dueDate);
      }
      if (status) {
        updateFields.push('status = ?');
        updateValues.push(status);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No fields to update'
        });
      }

      updateFields.push('updated_at = NOW()');
      updateValues.push(id);

      const query = `UPDATE bills SET ${updateFields.join(', ')} WHERE id = ?`;
      await pool.execute(query, updateValues);

      // Fetch updated bill
      const [updatedBill] = await pool.execute(
        `SELECT b.*, c.name as customer_name, c.email as customer_email
         FROM bills b
         LEFT JOIN customers c ON b.customer_id = c.id
         WHERE b.id = ?`,
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Bill updated successfully',
        data: updatedBill[0]
      });

    } catch (error) {
      console.error('Error updating bill:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete bill
  async deleteBill(req, res) {
    try {
      const { id } = req.params;

      // Check if bill exists and is not paid
      const [existingBill] = await pool.execute(
        'SELECT id, status FROM bills WHERE id = ?',
        [id]
      );

      if (existingBill.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Bill not found'
        });
      }

      if (existingBill[0].status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete a paid bill'
        });
      }

      // Check if there are any payments associated with this bill
      const [associatedPayments] = await pool.execute(
        'SELECT COUNT(*) as count FROM payments WHERE bill_id = ?',
        [id]
      );

      if (associatedPayments[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete bill with associated payments'
        });
      }

      await pool.execute('DELETE FROM bills WHERE id = ?', [id]);

      return res.status(200).json({
        success: true,
        message: 'Bill deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting bill:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Generate bills for all active customers
  async generateBills(req, res) {
    try {
      const { dueDate, description } = req.body;

      if (!dueDate) {
        return res.status(400).json({
          success: false,
          message: 'Due date is required'
        });
      }

      // Get all active customers
      const [activeCustomers] = await pool.execute(
        'SELECT id, name, plan FROM customers WHERE status = "active"'
      );

      if (activeCustomers.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No active customers found'
        });
      }

      // Define plan prices (you might want to get these from the plans table)
      const planPrices = {
        'Basic 25Mbps': 29.99,
        'Premium 50Mbps': 49.99,
        'Ultra 100Mbps': 79.99
      };

      const generatedBills = [];
      const issueDate = new Date().toISOString().split('T')[0];

      for (const customer of activeCustomers) {
        // Extract plan name and get price
        const planPrice = planPrices[customer.plan] || 50.00; // Default price if plan not found
        
        const billId = uuidv4();
        
        await pool.execute(
          `INSERT INTO bills (id, customer_id, amount, description, due_date, issue_date, status) 
           VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
          [
            billId, 
            customer.id, 
            planPrice, 
            description || `Monthly service fee for ${customer.plan}`,
            dueDate, 
            issueDate
          ]
        );

        generatedBills.push({
          id: billId,
          customerId: customer.id,
          customerName: customer.name,
          amount: planPrice,
          plan: customer.plan
        });
      }

      return res.status(201).json({
        success: true,
        message: `Generated ${generatedBills.length} bills successfully`,
        data: {
          count: generatedBills.length,
          bills: generatedBills
        }
      });

    } catch (error) {
      console.error('Error generating bills:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get bill statistics
  async getBillStats(req, res) {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_bills,
          SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as paid_bills,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_bills,
          SUM(CASE WHEN status = 'overdue' THEN 1 ELSE 0 END) as overdue_bills,
          SUM(amount) as total_amount,
          SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paid_amount,
          SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pending_amount
        FROM bills
      `);

      const [recentBills] = await pool.execute(`
        SELECT b.id, b.amount, b.status, b.due_date, c.name as customer_name
        FROM bills b
        LEFT JOIN customers c ON b.customer_id = c.id
        ORDER BY b.created_at DESC
        LIMIT 5
      `);

      // Update overdue bills
      await pool.execute(`
        UPDATE bills 
        SET status = 'overdue' 
        WHERE status = 'pending' AND due_date < CURDATE()
      `);

      return res.status(200).json({
        success: true,
        data: {
          overview: stats[0],
          recent: recentBills
        }
      });

    } catch (error) {
      console.error('Error getting bill stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Mark bills as overdue (can be called by a cron job)
  async updateOverdueBills(req, res) {
    try {
      const [result] = await pool.execute(`
        UPDATE bills 
        SET status = 'overdue', updated_at = NOW()
        WHERE status = 'pending' AND due_date < CURDATE()
      `);

      return res.status(200).json({
        success: true,
        message: `Updated ${result.affectedRows} bills to overdue status`,
        data: {
          updatedCount: result.affectedRows
        }
      });

    } catch (error) {
      console.error('Error updating overdue bills:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new BillController();