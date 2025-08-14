import React, { useState, useEffect } from 'react';
import { CreditCard, RefreshCw, Clock, User, Receipt, DollarSign } from 'lucide-react';
import { PaymentEntry } from '../types';
import { erpnextService } from '../services/erpnext';

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const paymentsData = await erpnextService.getTodaysPayments();
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const formatTime = (timeString: string) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTotalAmount = () => {
    return payments.reduce((total, payment) => total + payment.paid_amount, 0);
  };

  const handleRefresh = () => {
    fetchPayments(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900 flex items-center">
                <CreditCard className="w-6 h-6 mr-2 text-emerald-600" />
                Today's Payments
              </h1>
              <p className="text-sm text-gray-600 mt-1">{formatDate(new Date().toISOString())}</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 rounded-full bg-emerald-50 hover:bg-emerald-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-emerald-600 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Summary Card */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100 text-sm">Total Collected Today</p>
              <p className="text-3xl font-bold">KES {getTotalAmount().toLocaleString()}</p>
              <p className="text-emerald-100 text-sm mt-1">{payments.length} transactions</p>
            </div>
            <div className="bg-white bg-opacity-20 rounded-full p-4">
              <DollarSign className="w-8 h-8 text-white" />
            </div>
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
            <CreditCard className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Payments Today</h3>
            <p className="text-gray-600">No M-Pesa payments have been collected today yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Receipt className="w-5 h-5 text-emerald-600 mr-2" />
                      <h3 className="font-semibold text-gray-900">{payment.name}</h3>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{payment.party_name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{formatTime(payment.posting_date)}</span>
                      </div>
                      
                      {payment.reference_no && (
                        <div className="flex items-center text-sm text-gray-600">
                          <CreditCard className="w-4 h-4 mr-2 text-gray-400" />
                          <span>Ref: {payment.reference_no}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-emerald-600">
                      KES {payment.paid_amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">M-Pesa</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
