import React, { useState} from 'react';
import { useData } from '../context/DataContext';
import { paymentAPI } from '../services/api';
import { CreditCard, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

function Payments() {
  const { payments, customers, addPayment } = useData();
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [checkoutRequestID, setCheckoutRequestID] = useState(null);

  // Get payment statistics
  const getPaymentStats = () => {
    const totalPayments = payments.length;
    const completedPayments = payments.filter(p => p.status === 'completed').length;
    const pendingPayments = payments.filter(p => p.status === 'pending').length;
    const totalAmount = payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    return { totalPayments, completedPayments, pendingPayments, totalAmount };
  };

  const stats = getPaymentStats();

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedCustomer || !paymentAmount || !paymentMethod) {
      toast.error('Please fill in all required fields');
      return;
    }

    // For M-Pesa payments, validate phone number
    if (paymentMethod === 'mpesa' && !phoneNumber) {
      toast.error('Phone number is required for M-Pesa payments');
      return;
    }

    setIsProcessing(true);
    setPaymentStatus('initiating');

    try {
      if (paymentMethod === 'mpesa') {
        // Handle M-Pesa payment
        const response = await paymentAPI.initiateMpesaPayment({
          customerId: selectedCustomer,
          amount: parseFloat(paymentAmount),
          phoneNumber: phoneNumber,
          billId: invoiceNumber || null
        });

        if (response.data.success) {
          setCheckoutRequestID(response.data.data.checkoutRequestID);
          setPaymentStatus('pending');
          
          if (response.data.data.isSimulated) {
            toast.success('M-Pesa payment initiated (Simulation Mode)');
          } else {
            toast.success('M-Pesa payment initiated. Check your phone for STK Push.');
          }

          // Start polling for payment status
          pollPaymentStatus(response.data.data.checkoutRequestID);
        } else {
          setPaymentStatus('failed');
          toast.error(response.data.message || 'Failed to initiate payment');
        }
      } else {
        // Handle other payment methods (simulated for now)
        const newPayment = {
          id: `payment-${Date.now()}`,
          customerId: selectedCustomer,
          amount: parseFloat(paymentAmount),
          method: paymentMethod,
          status: 'completed',
          date: new Date().toISOString(),
          invoiceNumber: invoiceNumber
        };

        addPayment(newPayment);
        setPaymentStatus('completed');
        toast.success('Payment processed successfully!');
        
        // Reset form
        setSelectedCustomer('');
        setPaymentAmount('');
        setInvoiceNumber('');
        setPhoneNumber('');
      }
    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestID) => {
    const maxAttempts = 30; // 5 minutes with 10-second intervals
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await paymentAPI.queryPaymentStatus(requestID);
        
        if (response.data.success) {
          const status = response.data.data.status;
          
          if (status === 'completed') {
            setPaymentStatus('completed');
            toast.success('Payment completed successfully!');
            
            // Reset form
            setSelectedCustomer('');
            setPaymentAmount('');
            setInvoiceNumber('');
            setPhoneNumber('');
            setCheckoutRequestID(null);
            return;
          } else if (status === 'failed') {
            setPaymentStatus('failed');
            toast.error('Payment failed. Please try again.');
            setCheckoutRequestID(null);
            return;
          }
        }
        
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000); // Poll every 10 seconds
        } else {
          setPaymentStatus('timeout');
          toast.error('Payment timeout. Please check your phone or try again.');
          setCheckoutRequestID(null);
        }
      } catch (error) {
        console.error('Status polling error:', error);
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(poll, 10000);
        } else {
          setPaymentStatus('error');
          toast.error('Error checking payment status');
          setCheckoutRequestID(null);
        }
      }
    };

    setTimeout(poll, 10000); // Start polling after 10 seconds
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initiating':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      case 'pending':
        return <Clock className="w-5 h-5 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'failed':
      case 'error':
      case 'timeout':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (paymentStatus) {
      case 'initiating':
        return 'Initiating payment...';
      case 'pending':
        return 'Payment pending. Please complete on your phone.';
      case 'completed':
        return 'Payment completed successfully!';
      case 'failed':
        return 'Payment failed. Please try again.';
      case 'timeout':
        return 'Payment timeout. Please check your phone.';
      case 'error':
        return 'Error occurred. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Processing</h1>
          <p className="text-gray-600">Manage payments and financial transactions</p>
        </div>
      </div>

      {/* Payment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Payments</p>
              <p className="text-lg font-semibold text-gray-900">{stats.totalPayments}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-lg font-semibold text-gray-900">{stats.completedPayments}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-lg font-semibold text-gray-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Amount</p>
              <p className="text-lg font-semibold text-gray-900">${stats.totalAmount.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Form */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Process New Payment</h2>
        
        {paymentStatus && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center">
              {getStatusIcon()}
              <span className="ml-2 text-sm font-medium">{getStatusText()}</span>
            </div>
            {checkoutRequestID && (
              <p className="mt-1 text-xs text-gray-500">Request ID: {checkoutRequestID}</p>
            )}
          </div>
        )}

        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="input w-full"
                disabled={isProcessing}
              >
                <option value="credit_card">Credit Card</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="cash">Cash</option>
                <option value="mpesa">M-Pesa (Mobile Money)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Customer
              </label>
              <select
                value={selectedCustomer}
                onChange={(e) => setSelectedCustomer(e.target.value)}
                className="input w-full"
                disabled={isProcessing}
                required
              >
                <option value="">Select customer</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($)
              </label>
              <input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
                step="0.01"
                min="0"
                className="input w-full"
                disabled={isProcessing}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number (Optional)
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-XXX"
                className="input w-full"
                disabled={isProcessing}
              />
            </div>
          </div>

          {paymentMethod === 'mpesa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number (M-Pesa)
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="07XXXXXXXX or 2547XXXXXXXX"
                className="input w-full"
                disabled={isProcessing}
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your M-Pesa registered phone number
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing}
            className="btn btn-primary w-full md:w-auto"
          >
            {isProcessing ? (
              <div className="flex items-center">
                <div className="loading-spinner mr-2"></div>
                Processing...
              </div>
            ) : (
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Process Payment
              </div>
            )}
          </button>
        </form>
      </div>

      {/* Recent Payments Table */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Recent Payments</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.slice(0, 10).map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(payment.date).toLocaleDateString('en-US')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customers.find(c => c.id === payment.customerId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${payment.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <span className="capitalize">{payment.method.replace('_', ' ')}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      payment.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Payments; 