// backend/controllers/customerController.js
const { pool } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

class CustomerController {
  // Get all customers
  async getAllCustomers(req, res) {
    try {
      const { page = 1, limit = 50, status, plan } = req.query;
      const offset = (page - 1) * limit;

      let query = `
        SELECT * FROM customers
        WHERE 1=1
      `;
      const params = [];

      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      if (plan) {
        query += ' AND plan LIKE ?';
        params.push(`%${plan}%`);
      }

      query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
      params.push(parseInt(limit), offset);

      const [customers] = await pool.execute(query, params);

      // Get total count
      let countQuery = 'SELECT COUNT(*) as total FROM customers WHERE 1=1';
      const countParams = [];

      if (status) {
        countQuery += ' AND status = ?';
        countParams.push(status);
      }

      if (plan) {
        countQuery += ' AND plan LIKE ?';
        countParams.push(`%${plan}%`);
      }

      const [countResult] = await pool.execute(countQuery, countParams);
      const total = countResult[0].total;

      return res.status(200).json({
        success: true,
        data: customers,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      console.error('Error getting customers:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get customer by ID
  async getCustomerById(req, res) {
    try {
      const { id } = req.params;

      const [customers] = await pool.execute(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );

      if (customers.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: customers[0]
      });

    } catch (error) {
      console.error('Error getting customer:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create new customer
  async createCustomer(req, res) {
    try {
      const { name, email, phone, plan, address, status = 'active' } = req.body;

      // Validate required fields
      if (!name || !email || !phone || !plan) {
        return res.status(400).json({
          success: false,
          message: 'Name, email, phone, and plan are required'
        });
      }

      // Check if email already exists
      const [existingCustomer] = await pool.execute(
        'SELECT id FROM customers WHERE email = ?',
        [email]
      );

      if (existingCustomer.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }

      const customerId = uuidv4();
      const joinDate = new Date();

      await pool.execute(
        `INSERT INTO customers (id, name, email, phone, plan, address, status, join_date, created_at, updated_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [customerId, name, email, phone, plan, address || null, status, joinDate]
      );

      // Fetch the created customer
      const [newCustomer] = await pool.execute(
        'SELECT * FROM customers WHERE id = ?',
        [customerId]
      );

      return res.status(201).json({
        success: true,
        message: 'Customer created successfully',
        data: newCustomer[0]
      });

    } catch (error) {
      console.error('Error creating customer:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Customer with this email already exists'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update customer
  async updateCustomer(req, res) {
    try {
      const { id } = req.params;
      const { name, email, phone, plan, address, status } = req.body;

      // Check if customer exists
      const [existingCustomer] = await pool.execute(
        'SELECT id FROM customers WHERE id = ?',
        [id]
      );

      if (existingCustomer.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Check if email is being changed and if it conflicts with another customer
      if (email) {
        const [emailCheck] = await pool.execute(
          'SELECT id FROM customers WHERE email = ? AND id != ?',
          [email, id]
        );

        if (emailCheck.length > 0) {
          return res.status(400).json({
            success: false,
            message: 'Email already in use by another customer'
          });
        }
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      if (name) {
        updateFields.push('name = ?');
        updateValues.push(name);
      }
      if (email) {
        updateFields.push('email = ?');
        updateValues.push(email);
      }
      if (phone) {
        updateFields.push('phone = ?');
        updateValues.push(phone);
      }
      if (plan) {
        updateFields.push('plan = ?');
        updateValues.push(plan);
      }
      if (address !== undefined) {
        updateFields.push('address = ?');
        updateValues.push(address);
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

      const query = `UPDATE customers SET ${updateFields.join(', ')} WHERE id = ?`;
      await pool.execute(query, updateValues);

      // Fetch updated customer
      const [updatedCustomer] = await pool.execute(
        'SELECT * FROM customers WHERE id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Customer updated successfully',
        data: updatedCustomer[0]
      });

    } catch (error) {
      console.error('Error updating customer:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete customer
  async deleteCustomer(req, res) {
    try {
      const { id } = req.params;

      // Check if customer exists
      const [existingCustomer] = await pool.execute(
        'SELECT id FROM customers WHERE id = ?',
        [id]
      );

      if (existingCustomer.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      // Check if customer has pending payments or bills
      const [pendingPayments] = await pool.execute(
        'SELECT COUNT(*) as count FROM payments WHERE customer_id = ? AND status = "pending"',
        [id]
      );

      const [pendingBills] = await pool.execute(
        'SELECT COUNT(*) as count FROM bills WHERE customer_id = ? AND status IN ("pending", "overdue")',
        [id]
      );

      if (pendingPayments[0].count > 0 || pendingBills[0].count > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete customer with pending payments or bills'
        });
      }

      // Soft delete - update status to 'deleted' instead of removing record
      await pool.execute(
        'UPDATE customers SET status = "deleted", updated_at = NOW() WHERE id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        message: 'Customer deleted successfully'
      });

    } catch (error) {
      console.error('Error deleting customer:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get customer statistics
  async getCustomerStats(req, res) {
    try {
      const [stats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_customers,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_customers,
          SUM(CASE WHEN status = 'inactive' THEN 1 ELSE 0 END) as inactive_customers,
          SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending_customers
        FROM customers 
        WHERE status != 'deleted'
      `);

      const [planStats] = await pool.execute(`
        SELECT 
          plan,
          COUNT(*) as count
        FROM customers 
        WHERE status = 'active'
        GROUP BY plan
      `);

      const [recentCustomers] = await pool.execute(`
        SELECT id, name, email, plan, status, join_date
        FROM customers 
        WHERE status != 'deleted'
        ORDER BY join_date DESC 
        LIMIT 5
      `);

      return res.status(200).json({
        success: true,
        data: {
          overview: stats[0],
          byPlan: planStats,
          recent: recentCustomers
        }
      });

    } catch (error) {
      console.error('Error getting customer stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get customer payment history
  async getCustomerPayments(req, res) {
    try {
      const { id } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      // Check if customer exists
      const [customer] = await pool.execute(
        'SELECT id, name FROM customers WHERE id = ?',
        [id]
      );

      if (customer.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }

      const [payments] = await pool.execute(
        `SELECT p.*, b.id as bill_number
         FROM payments p
         LEFT JOIN bills b ON p.bill_id = b.id
         WHERE p.customer_id = ?
         ORDER BY p.created_at DESC
         LIMIT ? OFFSET ?`,
        [id, parseInt(limit), offset]
      );

      const [countResult] = await pool.execute(
        'SELECT COUNT(*) as total FROM payments WHERE customer_id = ?',
        [id]
      );

      return res.status(200).json({
        success: true,
        data: {
          customer: customer[0],
          payments,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: countResult[0].total,
            pages: Math.ceil(countResult[0].total / limit)
          }
        }
      });

    } catch (error) {
      console.error('Error getting customer payments:', error);
      return res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new CustomerController();