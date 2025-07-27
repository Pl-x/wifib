import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Download, Eye, Send, Filter, DollarSign, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function Billing() {
  const { bills, customers, addBill } = useData();
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredBills = bills.filter(bill => 
    filterStatus === 'all' || bill.status === filterStatus
  );

  const generateBills = () => {
    // Generate bills for all active customers
    const activeCustomers = customers.filter(c => c.status === 'active');
    const currentDate = new Date();
    const dueDate = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    activeCustomers.forEach(customer => {
      const planPrice = customer.plan_id.includes('Basic') ? 29.99 : 
                       customer.plan_id.includes('Premium') ? 49.99 : 79.99;
      
      const newBill = {
        id: `INV-${Date.now()}-${customer.id}`,
        customerId: customer.id,
        customerName: customer.name,
        amount: planPrice,
        dueDate: dueDate.toISOString().split('T')[0],
        status: 'pending',
        issueDate: currentDate.toISOString().split('T')[0]
      };
      
      addBill(newBill);
    });

    toast.success(`Generated ${activeCustomers.length} bills!`);
  };

  const sendReminder = (customerName) => {
    toast.success(`Reminder sent to ${customerName}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Billing Management</h1>
          <p className="text-gray-600">Generate and manage customer invoices</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={generateBills}
            className="btn btn-accent flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Bills</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">Filter:</span>
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="input w-48"
        >
          <option value="all">All Bills</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="overdue">Overdue</option>
        </select>
      </div>

      {/* Bills Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Invoice #
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Issue Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{bill.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bill.customerName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">₽{bill.amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.issueDate).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(bill.dueDate).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`
                      px-2 py-1 text-xs font-medium rounded-full
                      ${bill.status === 'paid' ? 'bg-green-100 text-green-800' : ''}
                      ${bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                      ${bill.status === 'overdue' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {bill.status === 'paid' ? 'Paid' : 
                       bill.status === 'pending' ? 'Pending' : 'Overdue'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {/* View bill logic */}}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {/* Download bill logic */}}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => sendReminder(bill.customerName)}
                        className="text-orange-600 hover:text-orange-900 p-1"
                        title="Send Reminder"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold text-gray-900">
                ₽{bills.reduce((sum, bill) => sum + bill.amount, 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Payments</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(bill => bill.status === 'pending').length}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">
                {bills.filter(bill => bill.status === 'overdue').length}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <Clock className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Billing; 