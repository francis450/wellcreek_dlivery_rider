import React, { useState } from 'react';
import { Smartphone, CreditCard, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PaymentStatus } from '../types';

interface PaymentProps {
  orderAmount: number;
  customerPhone?: string;
  onPaymentComplete: (paymentStatus: PaymentStatus) => void;
  onCancel: () => void;
}

export const Payment: React.FC<PaymentProps> = ({ 
  orderAmount, 
  customerPhone, 
  onPaymentComplete, 
  onCancel 
}) => {
  const [phoneNumber, setPhoneNumber] = useState(customerPhone || '');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initiating' | 'processing' | 'completed' | 'failed'>('idle');
  const [currentPayment, setCurrentPayment] = useState<PaymentStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatPhoneNumber = (phone: string) => {
    // Remove any non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format for Kenyan numbers
    if (cleaned.startsWith('254')) {
      return cleaned;
    } else if (cleaned.startsWith('0')) {
      return '254' + cleaned.slice(1);
    } else if (cleaned.length === 9) {
      return '254' + cleaned;
    }
    return cleaned;
  };

  const validatePhoneNumber = (phone: string) => {
    const formatted = formatPhoneNumber(phone);
    return formatted.length === 12 && formatted.startsWith('254');
  };

  const mockSTKPush = async (phone: string, amount: number): Promise<PaymentStatus> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactionId = `TXN${Date.now()}`;
    const formattedPhone = formatPhoneNumber(phone);
    
    // Mock different scenarios based on phone number ending
    const lastDigit = parseInt(formattedPhone.slice(-1));
    
    if (lastDigit < 3) {
      // Simulate failed payment
      throw new Error('Payment failed. Customer cancelled or insufficient funds.');
    } else if (lastDigit < 7) {
      // Simulate successful payment
      return {
        transaction_id: transactionId,
        status: 'success',
        amount: amount,
        phone_number: formattedPhone,
        mpesa_receipt_number: `MPE${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
        transaction_date: new Date().toISOString()
      };
    } else {
      // Simulate processing state (would normally be handled by callbacks)
      return {
        transaction_id: transactionId,
        status: 'processing',
        amount: amount,
        phone_number: formattedPhone
      };
    }
  };

  const handleInitiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid Kenyan phone number');
      return;
    }

    setError(null);
    setPaymentStatus('initiating');

    try {
      // Mock STK push initiation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setPaymentStatus('processing');
      
      // Mock payment processing
      const result = await mockSTKPush(phoneNumber, orderAmount);
      setCurrentPayment(result);
      
      if (result.status === 'success') {
        setPaymentStatus('completed');
        setTimeout(() => {
          onPaymentComplete(result);
        }, 2000);
      } else if (result.status === 'processing') {
        // In real implementation, this would be handled by webhooks/polling
        setPaymentStatus('processing');
        // Mock completion after 5 seconds
        setTimeout(async () => {
          const finalResult = {
            ...result,
            status: 'success' as const,
            mpesa_receipt_number: `MPE${Math.random().toString(36).substr(2, 8).toUpperCase()}`,
            transaction_date: new Date().toISOString()
          };
          setCurrentPayment(finalResult);
          setPaymentStatus('completed');
          setTimeout(() => {
            onPaymentComplete(finalResult);
          }, 2000);
        }, 5000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setPaymentStatus('failed');
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case 'initiating':
      case 'processing':
        return <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-8 h-8 text-green-600" />;
      case 'failed':
        return <XCircle className="w-8 h-8 text-red-600" />;
      default:
        return <CreditCard className="w-8 h-8 text-gray-400" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case 'initiating':
        return 'Initiating payment request...';
      case 'processing':
        return 'STK push sent! Please check your phone and enter your M-Pesa PIN.';
      case 'completed':
        return 'Payment completed successfully!';
      case 'failed':
        return error || 'Payment failed. Please try again.';
      default:
        return 'Ready to process payment';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          {getStatusIcon()}
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">M-Pesa Payment</h2>
        <p className="text-gray-600">{getStatusMessage()}</p>
      </div>

      {paymentStatus === 'idle' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Customer Phone Number
            </label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="0712345678 or 254712345678"
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Amount to collect:</span>
              <span className="text-xl font-bold text-gray-900">
                KES {orderAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleInitiatePayment}
              disabled={!phoneNumber.trim()}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Send STK Push
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {(paymentStatus === 'initiating' || paymentStatus === 'processing') && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-center space-y-2">
              <Clock className="w-6 h-6 text-blue-600 mx-auto" />
              <p className="text-blue-800 font-medium">
                {paymentStatus === 'initiating' ? 'Preparing STK push...' : 'Waiting for customer response'}
              </p>
              <p className="text-blue-600 text-sm">
                {paymentStatus === 'processing' && `Sent to: ${formatPhoneNumber(phoneNumber)}`}
              </p>
            </div>
          </div>
          
          <button
            onClick={onCancel}
            className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel Payment
          </button>
        </div>
      )}

      {paymentStatus === 'completed' && currentPayment && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-green-700">Amount:</span>
                <span className="font-semibold text-green-800">
                  KES {currentPayment.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Phone:</span>
                <span className="font-semibold text-green-800">
                  {currentPayment.phone_number}
                </span>
              </div>
              {currentPayment.mpesa_receipt_number && (
                <div className="flex justify-between">
                  <span className="text-green-700">Receipt:</span>
                  <span className="font-semibold text-green-800">
                    {currentPayment.mpesa_receipt_number}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {paymentStatus === 'failed' && (
        <div className="space-y-4">
          <div className="bg-red-50 rounded-lg p-4">
            <p className="text-red-800 text-center">{error}</p>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={() => {
                setPaymentStatus('idle');
                setError(null);
                setCurrentPayment(null);
              }}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onCancel}
              className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
