const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class DarajaService {
  constructor() {
    this.baseURL = process.env.DARAJA_BASE_URL || 'https://sandbox.safaricom.co.ke';
    this.consumerKey = process.env.DARAJA_CONSUMER_KEY;
    this.consumerSecret = process.env.DARAJA_CONSUMER_SECRET;
    this.passkey = process.env.DARAJA_PASSKEY;
    this.shortcode = process.env.DARAJA_SHORTCODE;
    this.callbackURL = process.env.DARAJA_CALLBACK_URL;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token from Daraja API
  async getAccessToken() {
    try {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry) {
        return this.accessToken;
      }

      const auth = Buffer.from(`${this.consumerKey}:${this.consumerSecret}`).toString('base64');
      
      const response = await axios.get(`${this.baseURL}/oauth/v1/generate?grant_type=client_credentials`, {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json'
        }
      });

      this.accessToken = response.data.access_token;
      // Token expires in 1 hour, set expiry to 50 minutes to be safe
      this.tokenExpiry = Date.now() + (50 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Error getting Daraja access token:', error.message);
      throw new Error('Failed to get access token from Daraja API');
    }
  }

  // Generate password for STK Push
  generatePassword() {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const password = Buffer.from(`${this.shortcode}${this.passkey}${timestamp}`).toString('base64');
    return password;
  }

  // Initiate STK Push (M-Pesa payment request)
  async initiateSTKPush(phoneNumber, amount, accountReference, transactionDesc) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword();
      const businessShortCode = this.shortcode;
      const partyA = phoneNumber;
      const partyB = this.shortcode;
      const callBackURL = this.callbackURL;
      const transactionType = 'CustomerPayBillOnline';
      const accountReference = accountReference || 'Legion Connections';
      const transactionDesc = transactionDesc || 'WiFi Service Payment';

      const requestBody = {
        BusinessShortCode: businessShortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: transactionType,
        Amount: amount,
        PartyA: partyA,
        PartyB: partyB,
        PhoneNumber: partyA,
        CallBackURL: callBackURL,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpush/v1/processrequest`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        checkoutRequestID: response.data.CheckoutRequestID,
        merchantRequestID: response.data.MerchantRequestID,
        responseCode: response.data.ResponseCode,
        responseDescription: response.data.ResponseDescription,
        customerMessage: response.data.CustomerMessage
      };

    } catch (error) {
      console.error('Error initiating STK Push:', error.response?.data || error.message);
      
      // For development/testing, return a simulated response
      if (process.env.NODE_ENV === 'development') {
        return this.simulateSTKPush(phoneNumber, amount, accountReference);
      }
      
      throw new Error('Failed to initiate M-Pesa payment');
    }
  }

  // Simulate STK Push for development/testing
  simulateSTKPush(phoneNumber, amount, accountReference) {
    const checkoutRequestID = uuidv4();
    const merchantRequestID = uuidv4();
    
    console.log(`🔧 SIMULATION: STK Push initiated for ${phoneNumber}, Amount: ${amount}`);
    
    return {
      success: true,
      checkoutRequestID: checkoutRequestID,
      merchantRequestID: merchantRequestID,
      responseCode: '0',
      responseDescription: 'Success. Request accepted for processing',
      customerMessage: 'Success. Request accepted for processing',
      isSimulated: true
    };
  }

  // Query STK Push status
  async querySTKPushStatus(checkoutRequestID) {
    try {
      const accessToken = await this.getAccessToken();
      const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
      const password = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.shortcode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestID
      };

      const response = await axios.post(
        `${this.baseURL}/mpesa/stkpushquery/v1/query`,
        requestBody,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        resultCode: response.data.ResultCode,
        resultDesc: response.data.ResultDesc,
        amount: response.data.Amount,
        mpesaReceiptNumber: response.data.MpesaReceiptNumber,
        transactionDate: response.data.TransactionDate,
        phoneNumber: response.data.PhoneNumber
      };

    } catch (error) {
      console.error('Error querying STK Push status:', error.response?.data || error.message);
      
      // For development/testing, return a simulated response
      if (process.env.NODE_ENV === 'development') {
        return this.simulateSTKPushQuery(checkoutRequestID);
      }
      
      throw new Error('Failed to query payment status');
    }
  }

  // Simulate STK Push query for development/testing
  simulateSTKPushQuery(checkoutRequestID) {
    console.log(`🔧 SIMULATION: Querying STK Push status for ${checkoutRequestID}`);
    
    // Simulate different response scenarios
    const scenarios = [
      {
        resultCode: '0',
        resultDesc: 'The service request is processed successfully.',
        amount: '100.00',
        mpesaReceiptNumber: 'QK' + Math.random().toString(36).substr(2, 8).toUpperCase(),
        transactionDate: new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3),
        phoneNumber: '254700000000'
      },
      {
        resultCode: '1',
        resultDesc: 'The balance is insufficient for the transaction.',
        amount: '0.00',
        mpesaReceiptNumber: null,
        transactionDate: null,
        phoneNumber: null
      },
      {
        resultCode: '1032',
        resultDesc: 'Request cancelled by user.',
        amount: '0.00',
        mpesaReceiptNumber: null,
        transactionDate: null,
        phoneNumber: null
      }
    ];

    // Randomly select a scenario (80% success rate)
    const random = Math.random();
    const scenario = random < 0.8 ? scenarios[0] : scenarios[Math.floor(Math.random() * scenarios.length) + 1];

    return {
      success: true,
      ...scenario,
      isSimulated: true
    };
  }

  // Process callback from Daraja API
  processCallback(callbackData) {
    try {
      const {
        Body: {
          stkCallback: {
            CheckoutRequestID,
            ResultCode,
            ResultDesc,
            CallbackMetadata
          }
        }
      } = callbackData;

      if (ResultCode === 0) {
        // Payment successful
        const metadata = CallbackMetadata.Item;
        const amount = metadata.find(item => item.Name === 'Amount')?.Value;
        const mpesaReceiptNumber = metadata.find(item => item.Name === 'MpesaReceiptNumber')?.Value;
        const transactionDate = metadata.find(item => item.Name === 'TransactionDate')?.Value;
        const phoneNumber = metadata.find(item => item.Name === 'PhoneNumber')?.Value;

        return {
          success: true,
          checkoutRequestID: CheckoutRequestID,
          resultCode: ResultCode,
          resultDesc: ResultDesc,
          amount: amount,
          mpesaReceiptNumber: mpesaReceiptNumber,
          transactionDate: transactionDate,
          phoneNumber: phoneNumber
        };
      } else {
        // Payment failed
        return {
          success: false,
          checkoutRequestID: CheckoutRequestID,
          resultCode: ResultCode,
          resultDesc: ResultDesc
        };
      }

    } catch (error) {
      console.error('Error processing Daraja callback:', error.message);
      throw new Error('Invalid callback data format');
    }
  }

  // Validate phone number format
  validatePhoneNumber(phoneNumber) {
    // Remove any non-digit characters
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // Check if it's a valid Kenyan phone number
    if (cleanNumber.length === 11 && cleanNumber.startsWith('254')) {
      return cleanNumber;
    } else if (cleanNumber.length === 10 && cleanNumber.startsWith('0')) {
      return '254' + cleanNumber.substring(1);
    } else if (cleanNumber.length === 9 && cleanNumber.startsWith('7')) {
      return '254' + cleanNumber;
    }
    
    throw new Error('Invalid phone number format. Please use format: 07XXXXXXXX or 2547XXXXXXXX');
  }

  // Get transaction status description
  getTransactionStatusDescription(resultCode) {
    const statusMap = {
      '0': 'Success',
      '1': 'Insufficient Balance',
      '2': 'Less Than Minimum Transaction Value',
      '3': 'More Than Maximum Transaction Value',
      '4': 'Would Have Exceeded Daily Transfer Limit',
      '5': 'Would Have Exceeded Minimum Balance',
      '6': 'Unresolved Primary Party',
      '7': 'Unresolved Receiver Party',
      '8': 'Would Have Exceeded Maximum Balance',
      '11': 'Debit Account Invalid',
      '12': 'Credit Account Invalid',
      '13': 'Unresolved Debit Account',
      '14': 'Unresolved Credit Account',
      '15': 'Duplicate Detected',
      '16': 'Internal Failure',
      '17': 'Unresolved Initiator',
      '18': 'Blocked for Lack of KYC Compliance',
      '19': 'Transaction Not Permitted to Receiver',
      '20': 'Arrangement Permits This Channel',
      '21': 'Transaction Suspended by Pending Dispute',
      '22': 'Transaction Cancelled',
      '23': 'Reverse Operation Failed',
      '24': 'Transaction Reversed',
      '25': 'Refund Operation Failed',
      '26': 'Refund Reversed',
      '27': 'Reversal Operation Failed',
      '28': 'Reversal Reversed',
      '29': 'Refund Reversal Failed',
      '30': 'Refund Reversal Reversed',
      '31': 'Refund Reversal Operation Failed',
      '32': 'Refund Reversal Reversed',
      '33': 'Refund Reversal Operation Failed',
      '34': 'Refund Reversal Reversed',
      '35': 'Refund Reversal Operation Failed',
      '36': 'Refund Reversal Reversed',
      '37': 'Refund Reversal Operation Failed',
      '38': 'Refund Reversal Reversed',
      '39': 'Refund Reversal Operation Failed',
      '40': 'Refund Reversal Reversed',
      '41': 'Refund Reversal Operation Failed',
      '42': 'Refund Reversal Reversed',
      '43': 'Refund Reversal Operation Failed',
      '44': 'Refund Reversal Reversed',
      '45': 'Refund Reversal Operation Failed',
      '46': 'Refund Reversal Reversed',
      '47': 'Refund Reversal Operation Failed',
      '48': 'Refund Reversal Reversed',
      '49': 'Refund Reversal Operation Failed',
      '50': 'Refund Reversal Reversed',
      '51': 'Refund Reversal Operation Failed',
      '52': 'Refund Reversal Reversed',
      '53': 'Refund Reversal Operation Failed',
      '54': 'Refund Reversal Reversed',
      '55': 'Refund Reversal Operation Failed',
      '56': 'Refund Reversal Reversed',
      '57': 'Refund Reversal Operation Failed',
      '58': 'Refund Reversal Reversed',
      '59': 'Refund Reversal Operation Failed',
      '60': 'Refund Reversal Reversed',
      '61': 'Refund Reversal Operation Failed',
      '62': 'Refund Reversal Reversed',
      '63': 'Refund Reversal Operation Failed',
      '64': 'Refund Reversal Reversed',
      '65': 'Refund Reversal Operation Failed',
      '66': 'Refund Reversal Reversed',
      '67': 'Refund Reversal Operation Failed',
      '68': 'Refund Reversal Reversed',
      '69': 'Refund Reversal Operation Failed',
      '70': 'Refund Reversal Reversed',
      '71': 'Refund Reversal Operation Failed',
      '72': 'Refund Reversal Reversed',
      '73': 'Refund Reversal Operation Failed',
      '74': 'Refund Reversal Reversed',
      '75': 'Refund Reversal Operation Failed',
      '76': 'Refund Reversal Reversed',
      '77': 'Refund Reversal Operation Failed',
      '78': 'Refund Reversal Reversed',
      '79': 'Refund Reversal Operation Failed',
      '80': 'Refund Reversal Reversed',
      '81': 'Refund Reversal Operation Failed',
      '82': 'Refund Reversal Reversed',
      '83': 'Refund Reversal Operation Failed',
      '84': 'Refund Reversal Reversed',
      '85': 'Refund Reversal Operation Failed',
      '86': 'Refund Reversal Reversed',
      '87': 'Refund Reversal Operation Failed',
      '88': 'Refund Reversal Reversed',
      '89': 'Refund Reversal Operation Failed',
      '90': 'Refund Reversal Reversed',
      '91': 'Refund Reversal Operation Failed',
      '92': 'Refund Reversal Reversed',
      '93': 'Refund Reversal Operation Failed',
      '94': 'Refund Reversal Reversed',
      '95': 'Refund Reversal Operation Failed',
      '96': 'Refund Reversal Reversed',
      '97': 'Refund Reversal Operation Failed',
      '98': 'Refund Reversal Reversed',
      '99': 'Refund Reversal Operation Failed',
      '100': 'Refund Reversal Reversed',
      '1032': 'Request cancelled by user',
      '1037': 'Timeout',
      '1038': 'Transaction failed',
      '1039': 'Transaction failed',
      '1040': 'Transaction failed',
      '1041': 'Transaction failed',
      '1042': 'Transaction failed',
      '1043': 'Transaction failed',
      '1044': 'Transaction failed',
      '1045': 'Transaction failed',
      '1046': 'Transaction failed',
      '1047': 'Transaction failed',
      '1048': 'Transaction failed',
      '1049': 'Transaction failed',
      '1050': 'Transaction failed',
      '1051': 'Transaction failed',
      '1052': 'Transaction failed',
      '1053': 'Transaction failed',
      '1054': 'Transaction failed',
      '1055': 'Transaction failed',
      '1056': 'Transaction failed',
      '1057': 'Transaction failed',
      '1058': 'Transaction failed',
      '1059': 'Transaction failed',
      '1060': 'Transaction failed',
      '1061': 'Transaction failed',
      '1062': 'Transaction failed',
      '1063': 'Transaction failed',
      '1064': 'Transaction failed',
      '1065': 'Transaction failed',
      '1066': 'Transaction failed',
      '1067': 'Transaction failed',
      '1068': 'Transaction failed',
      '1069': 'Transaction failed',
      '1070': 'Transaction failed',
      '1071': 'Transaction failed',
      '1072': 'Transaction failed',
      '1073': 'Transaction failed',
      '1074': 'Transaction failed',
      '1075': 'Transaction failed',
      '1076': 'Transaction failed',
      '1077': 'Transaction failed',
      '1078': 'Transaction failed',
      '1079': 'Transaction failed',
      '1080': 'Transaction failed',
      '1081': 'Transaction failed',
      '1082': 'Transaction failed',
      '1083': 'Transaction failed',
      '1084': 'Transaction failed',
      '1085': 'Transaction failed',
      '1086': 'Transaction failed',
      '1087': 'Transaction failed',
      '1088': 'Transaction failed',
      '1089': 'Transaction failed',
      '1090': 'Transaction failed',
      '1091': 'Transaction failed',
      '1092': 'Transaction failed',
      '1093': 'Transaction failed',
      '1094': 'Transaction failed',
      '1095': 'Transaction failed',
      '1096': 'Transaction failed',
      '1097': 'Transaction failed',
      '1098': 'Transaction failed',
      '1099': 'Transaction failed',
      '1100': 'Transaction failed'
    };

    return statusMap[resultCode] || 'Unknown Status';
  }
}

module.exports = new DarajaService(); 