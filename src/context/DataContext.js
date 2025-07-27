// src/context/DataContext.js
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { paymentAPI, customerAPI, billAPI } from '../services/api';
import toast from 'react-hot-toast';

const DataContext = createContext();

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_CUSTOMERS: 'SET_CUSTOMERS',
  SET_BILLS: 'SET_BILLS',
  SET_PAYMENTS: 'SET_PAYMENTS',
  SET_PLANS: 'SET_PLANS',
  ADD_CUSTOMER: 'ADD_CUSTOMER',
  UPDATE_CUSTOMER: 'UPDATE_CUSTOMER',
  DELETE_CUSTOMER: 'DELETE_CUSTOMER',
  ADD_BILL: 'ADD_BILL',
  UPDATE_BILL: 'UPDATE_BILL',
  ADD_PAYMENT: 'ADD_PAYMENT',
  SET_ACTIVITIES: 'SET_ACTIVITIES',
};

// Initial state
const initialState = {
  loading: {
    customers: false,
    bills: false,
    payments: false,
    plans: false,
  },
  error: null,
  customers: [],
  bills: [],
  payments: [],
  plans: [
    {
      id: 'plan1',
      name: 'Basic 25Mbps',
      speed: '25 Mbps',
      price: 29.99,
      dataLimit: '500 GB',
      description: 'Perfect for basic internet browsing and email'
    },
    {
      id: 'plan2',
      name: 'Premium 50Mbps',
      speed: '50 Mbps',
      price: 49.99,
      dataLimit: '1 TB',
      description: 'Great for streaming and moderate downloads'
    },
    {
      id: 'plan3',
      name: 'Ultra 100Mbps',
      speed: '100 Mbps',
      price: 79.99,
      dataLimit: 'Unlimited',
      description: 'Ultimate speed for gaming and heavy usage'
    }
  ],
  activities: [],
};

// Reducer
function dataReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return {
        ...state,
        loading: { ...state.loading, [action.payload.type]: action.payload.value }
      };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload };
    case ACTIONS.SET_CUSTOMERS:
      return { ...state, customers: action.payload };
    case ACTIONS.SET_BILLS:
      return { ...state, bills: action.payload };
    case ACTIONS.SET_PAYMENTS:
      return { ...state, payments: action.payload };
    case ACTIONS.SET_PLANS:
      return { ...state, plans: action.payload };
    case ACTIONS.ADD_CUSTOMER:
      return { ...state, customers: [...state.customers, action.payload] };
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
      return { ...state, bills: [...state.bills, action.payload] };
    case ACTIONS.UPDATE_BILL:
      return {
        ...state,
        bills: state.bills.map(bill =>
          bill.id === action.payload.id ? action.payload : bill
        )
      };
    case ACTIONS.ADD_PAYMENT:
      return { ...state, payments: [action.payload, ...state.payments] };
    case ACTIONS.SET_ACTIVITIES:
      return { ...state, activities: action.payload };
    default:
      return state;
  }
}

// Provider component
export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  // Helper function to handle API errors
  const handleApiError = (error, context) => {
    console.error(`${context} error:`, error);
    const message = error.response?.data?.message || error.message || 'An error occurred';
    dispatch({ type: ACTIONS.SET_ERROR, payload: message });
    toast.error(`${context}: ${message}`);
  };

  // Load data on mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    await Promise.all([
      fetchCustomers(),
      fetchBills(),
      fetchPayments(),
    ]);
  };

  // Customer functions
  const fetchCustomers = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'customers', value: true } });
    try {
      const response = await customerAPI.getAllCustomers();
      if (response.data.success) {
        dispatch({ type: ACTIONS.SET_CUSTOMERS, payload: response.data.data });
      }
    } catch (error) {
      // If customers API not implemented yet, use mock data
      if (error.response?.status === 501) {
        console.log('Customer API not implemented, using mock data');
        const mockCustomers = [
          {
            id: '001',
            name: 'Alexander Petrov',
            email: 'alex.petrov@email.com',
            phone: '+7 495 123-4567',
            plan: 'Premium 50Mbps',
            status: 'active',
            address: 'Moscow, Russia',
            joinDate: '2023-01-15',
            lastPayment: '2024-07-01'
          },
          {
            id: '002',
            name: 'Maria Volkov',
            email: 'maria.volkov@email.com',
            phone: '+7 812 987-6543',
            plan: 'Basic 25Mbps',
            status: 'active',
            address: 'St. Petersburg, Russia',
            joinDate: '2023-03-20',
            lastPayment: '2024-06-28'
          },
        ];
        dispatch({ type: ACTIONS.SET_CUSTOMERS, payload: mockCustomers });
      } else {
        handleApiError(error, 'Fetch customers');
      }
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'customers', value: false } });
    }
  };

  const addCustomer = async (customerData) => {
    try {
      const response = await customerAPI.createCustomer(customerData);
      if (response.data.success) {
        dispatch({ type: ACTIONS.ADD_CUSTOMER, payload: response.data.data });
        toast.success('Customer added successfully!');
        return response.data.data;
      }
    } catch (error) {
      // If API not implemented, add to local state
      if (error.response?.status === 501) {
        dispatch({ type: ACTIONS.ADD_CUSTOMER, payload: customerData });
        toast.success('Customer added successfully! (Mock data)');
        return customerData;
      } else {
        handleApiError(error, 'Add customer');
        throw error;
      }
    }
  };

  const deleteCustomer = async (customerId) => {
    try {
      await customerAPI.deleteCustomer(customerId);
      dispatch({ type: ACTIONS.DELETE_CUSTOMER, payload: customerId });
      toast.success('Customer deleted successfully!');
    } catch (error) {
      // If API not implemented, delete from local state
      if (error.response?.status === 501) {
        dispatch({ type: ACTIONS.DELETE_CUSTOMER, payload: customerId });
        toast.success('Customer deleted successfully! (Mock data)');
      } else {
        handleApiError(error, 'Delete customer');
        throw error;
      }
    }
  };

  // Bill functions
  const fetchBills = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'bills', value: true } });
    try {
      const response = await billAPI.getAllBills();
      if (response.data.success) {
        dispatch({ type: ACTIONS.SET_BILLS, payload: response.data.data });
      }
    } catch (error) {
      // If bills API not implemented yet, use mock data
      if (error.response?.status === 501) {
        console.log('Bills API not implemented, using mock data');
        const mockBills = [
          {
            id: 'INV-2024-001',
            customerId: '001',
            customerName: 'Alexander Petrov',
            amount: 49.99,
            dueDate: '2024-08-15',
            status: 'pending',
            issueDate: '2024-07-15'
          },
          {
            id: 'INV-2024-002',
            customerId: '002',
            customerName: 'Maria Volkov',
            amount: 29.99,
            dueDate: '2024-08-20',
            status: 'paid',
            issueDate: '2024-07-20'
          },
        ];
        dispatch({ type: ACTIONS.SET_BILLS, payload: mockBills });
      } else {
        handleApiError(error, 'Fetch bills');
      }
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'bills', value: false } });
    }
  };

  const addBill = async (billData) => {
    try {
      const response = await billAPI.createBill(billData);
      if (response.data.success) {
        dispatch({ type: ACTIONS.ADD_BILL, payload: response.data.data });
        return response.data.data;
      }
    } catch (error) {
      // If API not implemented, add to local state
      if (error.response?.status === 501) {
        dispatch({ type: ACTIONS.ADD_BILL, payload: billData });
        return billData;
      } else {
        handleApiError(error, 'Add bill');
        throw error;
      }
    }
  };

  // Payment functions - these should work with your existing backend
  const fetchPayments = async () => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'payments', value: true } });
    try {
      const response = await paymentAPI.getAllPayments();
      if (response.data.success) {
        // Transform backend data to match frontend format
        const transformedPayments = response.data.data.map(payment => ({
          id: payment.id,
          customerId: payment.customer_id,
          amount: parseFloat(payment.amount),
          method: payment.payment_method || payment.method,
          status: payment.status,
          date: payment.created_at || payment.payment_date,
          invoiceNumber: payment.bill_id,
          mpesaReceipt: payment.mpesa_receipt,
          phoneNumber: payment.mpesa_phone,
        }));
        dispatch({ type: ACTIONS.SET_PAYMENTS, payload: transformedPayments });
      }
    } catch (error) {
      handleApiError(error, 'Fetch payments');
      // Fallback to empty array if payments can't be loaded
      dispatch({ type: ACTIONS.SET_PAYMENTS, payload: [] });
    } finally {
      dispatch({ type: ACTIONS.SET_LOADING, payload: { type: 'payments', value: false } });
    }
  };

  const addPayment = (paymentData) => {
    // This will be called after successful payment processing
    dispatch({ type: ACTIONS.ADD_PAYMENT, payload: paymentData });
  };

  // Generate activities from recent data
  const generateActivities = () => {
    const activities = [];
    
    // Add recent payments
    state.payments.slice(0, 3).forEach(payment => {
      const customer = state.customers.find(c => c.id === payment.customerId);
      if (customer) {
        activities.push({
          id: `payment-${payment.id}`,
          customer: customer.name,
          action: `Made payment of $${payment.amount}`,
          time: new Date(payment.date).toLocaleTimeString(),
          status: payment.status
        });
      }
    });

    // Add recent customer activities
    state.customers.slice(0, 2).forEach(customer => {
      activities.push({
        id: `customer-${customer.id}`,
        customer: customer.name,
        action: 'Service connection active',
        time: '2 hours ago',
        status: customer.status
      });
    });

    dispatch({ type: ACTIONS.SET_ACTIVITIES, payload: activities });
  };

  // Update activities when data changes
  useEffect(() => {
    generateActivities();
  }, [state.payments, state.customers]);

  // Refresh functions
  const refreshData = async () => {
    await loadInitialData();
  };

  const refreshPayments = async () => {
    await fetchPayments();
  };

  const value = {
    ...state,
    // Actions
    addCustomer,
    deleteCustomer,
    addBill,
    addPayment,
    refreshData,
    refreshPayments,
    fetchCustomers,
    fetchBills,
    fetchPayments,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}