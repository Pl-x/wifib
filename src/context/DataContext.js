import React, { createContext, useContext, useReducer, useEffect , useCallback } from 'react';
import { paymentAPI, healthAPI } from '../services/api';
import toast from 'react-hot-toast';

// Initial state with dummy data for development
const initialState = {
  customers: [
    { id: 'customer-001', name: 'John Smith', email: 'john@email.com', phone: '+1234567890', plan: 'Premium 50Mbps', status: 'active', joinDate: '2024-01-15' },
    { id: 'customer-002', name: 'Sarah Johnson', email: 'sarah@email.com', phone: '+1234567891', plan: 'Basic 25Mbps', status: 'active', joinDate: '2024-02-20' },
    { id: 'customer-003', name: 'Mike Wilson', email: 'mike@email.com', phone: '+1234567892', plan: 'Ultra 100Mbps', status: 'pending', joinDate: '2024-03-10' },
  ],
  plans: [
    { id: 'plan-001', name: 'Basic Plan', speed: '25 Mbps', price: 29.99, dataLimit: 'Unlimited', description: 'Perfect for light browsing and email' },
    { id: 'plan-002', name: 'Premium Plan', speed: '50 Mbps', price: 49.99, dataLimit: 'Unlimited', description: 'Great for streaming and gaming' },
    { id: 'plan-003', name: 'Ultra Plan', speed: '100 Mbps', price: 79.99, dataLimit: 'Unlimited', description: 'Maximum speed for heavy users' },
  ],
  bills: [
    { id: 'bill-001', customerId: 'customer-001', amount: 49.99, dueDate: '2024-08-15', status: 'paid' },
    { id: 'bill-002', customerId: 'customer-002', amount: 29.99, dueDate: '2024-08-20', status: 'pending' },
  ],
  payments: [
    { id: 'payment-001', customerId: 'customer-001', amount: 49.99, method: 'credit_card', status: 'completed', date: '2024-07-27' },
    { id: 'payment-002', customerId: 'customer-002', amount: 29.99, method: 'bank_transfer', status: 'completed', date: '2024-07-26' },
  ],
  activities: [
    { id: 'activity-001', customer: 'John Smith', action: 'Payment Received', status: 'paid', time: '10:30 AM' },
    { id: 'activity-002', customer: 'Sarah Johnson', action: 'Plan Upgraded', status: 'active', time: '09:15 AM' },
    { id: 'activity-003', customer: 'Mike Wilson', action: 'New Connection', status: 'pending', time: '08:45 AM' },
  ],
  backendConnected: false,
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_BACKEND_STATUS: 'SET_BACKEND_STATUS',
  ADD_PAYMENT: 'ADD_PAYMENT',
  UPDATE_PAYMENT: 'UPDATE_PAYMENT',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  ADD_BILL: 'ADD_BILL',
  UPDATE_BILL: 'UPDATE_BILL',
  ADD_PLAN: 'ADD_PLAN',
  UPDATE_PLAN: 'UPDATE_PLAN',
  DELETE_PLAN: 'DELETE_PLAN',
  ADD_ACTIVITY: 'ADD_ACTIVITY',
  SYNC_PAYMENTS: 'SYNC_PAYMENTS'
};

// Reducer function
function dataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    
    case ACTIONS.SET_BACKEND_STATUS:
      return { ...state, backendConnected: action.payload };
    
    case ACTIONS.ADD_PAYMENT:
      return {
        ...state,
        payments: [action.payload, ...state.payments]
      };
    
    case ACTIONS.UPDATE_PAYMENT:
      return {
        ...state,
        payments: state.payments.map(payment =>
          payment.id === action.payload.id ? action.payload : payment
        )
      };
    
    case ACTIONS.ADD_CUSTOMER:
      return {
        ...state,
        customers: [...state.customers, action.payload]
      };
    
    case ACTIONS.UPDATE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.map(customer =>
          customer.id === action.payload.id ? action.payload : customer
        )
      };
    
    case ACTIONS.DELETE_CUSTOMER:
      return {
        ...state,
        customers: state.customers.filter(customer => customer.id !== action.payload)
      };
    
    case ACTIONS.ADD_BILL:
      return {
        ...state,
        bills: [...state.bills, action.payload]
      };
    
    case ACTIONS.UPDATE_BILL:
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill.id === action.payload.id ? action.payload : bill
        )
      };
    
    case ACTIONS.ADD_PLAN:
      return {
        ...state,
        plans: [...state.plans, action.payload]
      };
    
    case ACTIONS.UPDATE_PLAN:
      return {
        ...state,
        plans: state.plans.map(plan =>
          plan.id === action.payload.id ? action.payload : plan
        )
      };
    
    case ACTIONS.DELETE_PLAN:
      return {
        ...state,
        plans: state.plans.filter(plan => plan.id !== action.payload)
      };
    
    case ACTIONS.ADD_ACTIVITY:
      return {
        ...state,
        activities: [action.payload, ...state.activities.slice(0, 4)] // Keep only 5 activities
      };
    
    case ACTIONS.SYNC_PAYMENTS:
      return {
        ...state,
        payments: action.payload
      };
    
    default:
      return state;
  }
}

// Create context
const DataContext = createContext();

// Provider component
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Check backend connection on mount
  

  // Check if backend is available
  const checkBackendConnection = useCallback(async () => {
    try {
      const response = await healthAPI.checkHealth();
      if (response.status === 200) {
        dispatch({ type: ACTIONS.SET_BACKEND_STATUS, payload: true });
        console.log('✅ Backend connected successfully');
        
        // Sync payments from backend
        await syncPaymentsFromBackend();
      }
    } catch (error) {
      console.warn('⚠️ Backend not available, using local data:', error.message);
      dispatch({ type: ACTIONS.SET_BACKEND_STATUS, payload: false });
    }
  }, []); 

useEffect(() => {
    checkBackendConnection();
  }, [checkBackendConnection]);
  
  // Sync payments from backend
  const syncPaymentsFromBackend = async () => {
    try {
      const response = await paymentAPI.getAllPayments();
      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedPayments = response.data.data.map(payment => ({
          id: payment.id,
          customerId: payment.customer_id,
          amount: payment.amount,
          method: payment.payment_method,
          status: payment.status,
          date: payment.payment_date || payment.created_at,
          invoiceNumber: payment.bill_id
        }));
        
        dispatch({ type: ACTIONS.SYNC_PAYMENTS, payload: transformedPayments });
      }
    } catch (error) {
      console.warn('Failed to sync payments from backend:', error.message);
    }
  };

  // Add payment (with backend integration)
  const addPayment = async (paymentData) => {
    // Add to local state immediately for UI responsiveness
    const newPayment = {
      id: paymentData.id || `payment-${Date.now()}`,
      customerId: paymentData.customerId,
      amount: paymentData.amount,
      method: paymentData.method,
      status: paymentData.status || 'completed',
      date: paymentData.date || new Date().toISOString(),
      invoiceNumber: paymentData.invoiceNumber
    };

    dispatch({ type: ACTIONS.ADD_PAYMENT, payload: newPayment });

    // Try to sync with backend if available
    if (state.backendConnected) {
      try {
        // For M-Pesa payments, the backend already handles the creation
        // For other payment methods, we could add a backend endpoint
        console.log('Payment added locally, backend sync would happen here');
      } catch (error) {
        console.warn('Failed to sync payment to backend:', error.message);
        toast.error('Payment saved locally but failed to sync with server');
      }
    }

    // Add activity
    const customer = state.customers.find(c => c.id === paymentData.customerId);
    const activity = {
      id: `activity-${Date.now()}`,
      customer: customer?.name || 'Unknown Customer',
      action: 'Payment Received',
      status: 'paid',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: activity });
  };

  // Update payment status (for M-Pesa polling)
  const updatePaymentStatus = (paymentId, status, additionalData = {}) => {
    const updatedPayment = {
      id: paymentId,
      status,
      ...additionalData
    };
    dispatch({ type: ACTIONS.UPDATE_PAYMENT, payload: updatedPayment });
  };

  // Add customer
  const addCustomer = (customerData) => {
    const newCustomer = {
      id: `customer-${Date.now()}`,
      ...customerData,
      joinDate: new Date().toISOString().split('T')[0]
    };
    dispatch({ type: ACTIONS.ADD_CUSTOMER, payload: newCustomer });
    
    // Add activity
    const activity = {
      id: `activity-${Date.now()}`,
      customer: customerData.name,
      action: 'New Customer Added',
      status: 'active',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    dispatch({ type: ACTIONS.ADD_ACTIVITY, payload: activity });
  };

  // Update customer
  const updateCustomer = (customerId, updates) => {
    const customer = state.customers.find(c => c.id === customerId);
    if (customer) {
      const updatedCustomer = { ...customer, ...updates };
      dispatch({ type: ACTIONS.UPDATE_CUSTOMER, payload: updatedCustomer });
    }
  };

  // Delete customer
  const deleteCustomer = (customerId) => {
    dispatch({ type: ACTIONS.DELETE_CUSTOMER, payload: customerId });
  };

  // Add bill
  const addBill = (billData) => {
    const newBill = {
      id: `bill-${Date.now()}`,
      ...billData
    };
    dispatch({ type: ACTIONS.ADD_BILL, payload: newBill });
  };

  // Update bill
  const updateBill = (billId, updates) => {
    const bill = state.bills.find(b => b.id === billId);
    if (bill) {
      const updatedBill = { ...bill, ...updates };
      dispatch({ type: ACTIONS.UPDATE_BILL, payload: updatedBill });
    }
  };

  // Add plan
  const addPlan = (planData) => {
    const newPlan = {
      id: `plan-${Date.now()}`,
      ...planData
    };
    dispatch({ type: ACTIONS.ADD_PLAN, payload: newPlan });
  };

  // Update plan
  const updatePlan = (planId, updates) => {
    const plan = state.plans.find(p => p.id === planId);
    if (plan) {
      const updatedPlan = { ...plan, ...updates };
      dispatch({ type: ACTIONS.UPDATE_PLAN, payload: updatedPlan });
    }
  };

  // Delete plan
  const deletePlan = (planId) => {
    dispatch({ type: ACTIONS.DELETE_PLAN, payload: planId });
  };

  // Get dashboard stats
  const getDashboardStats = () => {
    const totalCustomers = state.customers.length;
    const activeConnections = state.customers.filter(c => c.status === 'active').length;
    const monthlyRevenue = state.payments
      .filter(p => p.status === 'completed')
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const pendingPayments = state.bills.filter(b => b.status === 'pending').length;

    return {
      totalCustomers,
      activeConnections,
      monthlyRevenue,
      pendingPayments
    };
  };

  const value = {
    ...state,
    addPayment,
    updatePaymentStatus,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    addBill,
    updateBill,
    addPlan,
    updatePlan,
    deletePlan,
    getDashboardStats,
    checkBackendConnection
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom hook to use the data context
export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
} 