class ERPNextService {
  private getSettings() {
    const savedSettings = localStorage.getItem('erpnext-settings');
    if (savedSettings) {
      return JSON.parse(savedSettings);
    }
    return {
      baseUrl: 'https://wellcreek.boraerp.co.ke',
      apiKey: '',
      apiSecret: '',
      useProxy: false,
      proxyUrl: ''
    };
  }

  private getBaseUrl() {
    const settings = this.getSettings();
    return settings.useProxy ? settings.proxyUrl : settings.baseUrl;
  }

  async makeRequest(endpoint: string, options: RequestInit = {}) {
    const settings = this.getSettings();
    const baseUrl = this.getBaseUrl();
    const url = settings.useProxy 
      ? `${baseUrl}${settings.baseUrl}${endpoint}`
      : `${baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };

    // Add authentication if API key and secret are provided
    if (settings.apiKey && settings.apiSecret) {
      defaultHeaders['Authorization'] = `token ${settings.apiKey}:${settings.apiSecret}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ERPNext API Error:', error);
      throw error;
    }
  }

  async getSalesOrders() {
    try {
      const response = await this.makeRequest(
        '/api/resource/Sales Order?fields=["name","customer","customer_name","delivery_date","grand_total","status"]&filters=[["status","in",["To Deliver and Bill","To Deliver"]]]&limit_page_length=50&order_by=creation desc'
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching sales orders:', error);
      return [];
    }
  }

  async getSalesOrderDetails(orderName: string) {
    try {
      const response = await this.makeRequest(`/api/resource/Sales Order/${orderName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  async getCustomerDetails(customerName: string) {
    try {
      const response = await this.makeRequest(
        `/api/resource/Customer/${customerName}?fields=["customer_name","mobile_no","email_id","territory"]`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching customer details:', error);
      return null;
    }
  }

  async getCustomerAddress(customerName: string) {
    try {
      // Try to get the billing address first (most common for delivery)
      const billingAddressName = `${customerName}-Billing-Billing`;
      
      try {
        const billingResponse = await this.makeRequest(
          `/api/resource/Address/${billingAddressName}?fields=["name","address_line1","address_line2","city","state","pincode"]`
        );
        return billingResponse.data;
      } catch (billingError) {
        // If billing address doesn't exist, try shipping address
        const shippingAddressName = `${customerName}-Shipping-Shipping`;
        
        try {
          const shippingResponse = await this.makeRequest(
            `/api/resource/Address/${shippingAddressName}?fields=["name","address_line1","address_line2","city","state","pincode"]`
          );
          return shippingResponse.data;
        } catch (shippingError) {
          console.error('Neither billing nor shipping address found:', { billingError, shippingError });
          return null;
        }
      }
    } catch (error) {
      console.error('Error fetching customer address:', error);
      return null;
    }
  }

  async updateOrderStatus(orderName: string, status: string) {
    try {
      const response = await this.makeRequest(`/api/resource/Sales Order/${orderName}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: status
        })
      });
      return response;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }

  // Mock payment methods for testing (will be replaced with real frappe-mpsa-payments integration)
  async initiateMockSTKPush(phoneNumber: string, amount: number, orderReference: string) {
    // This is a mock implementation for testing
    // In real implementation, this will call frappe-mpsa-payments endpoints
    console.log(`Mock STK Push initiated for ${phoneNumber}, amount: ${amount}, order: ${orderReference}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const transactionId = `TXN${Date.now()}`;
        const lastDigit = parseInt(phoneNumber.slice(-1));
        
        if (lastDigit < 3) {
          reject(new Error('Payment failed. Customer cancelled or insufficient funds.'));
        } else {
          resolve({
            transaction_id: transactionId,
            checkout_request_id: `CHK${Date.now()}`,
            response_code: '0',
            response_description: 'Success. Request accepted for processing',
            customer_message: 'Success. Request accepted for processing'
          });
        }
      }, 1000);
    });
  }

  async checkMockPaymentStatus(transactionId: string) {
    // Mock payment status check
    return new Promise((resolve) => {
      setTimeout(() => {
        const random = Math.random();
        if (random > 0.7) {
          resolve({
            transaction_id: transactionId,
            status: 'success',
            mpesa_receipt_number: `MPE${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            transaction_date: new Date().toISOString()
          });
        } else {
          resolve({
            transaction_id: transactionId,
            status: 'processing'
          });
        }
      }, 2000);
    });
  }
  
  // Payment Entry methods
  async getTodaysPayments() {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const response = await this.makeRequest(
        `/api/resource/Payment Entry?fields=["name","party","party_name","paid_amount","posting_date","posting_date","reference_no","mode_of_payment"]&filters=[["mode_of_payment","=","Mpesa-WELLCREEK COFFEE"],["posting_date","=","${today}"]]&order_by=posting_date desc&limit_page_length=50`
      );
      return response.data || [];
    } catch (error) {
      console.error('Error fetching today\'s payments:', error);
      return [];
    }
  }

  async getPaymentDetails(paymentName: string) {
    try {
      const response = await this.makeRequest(`/api/resource/Payment Entry/${paymentName}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      throw error;
    }
  }
}

export const erpnextService = new ERPNextService();