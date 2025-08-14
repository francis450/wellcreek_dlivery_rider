import React, { useState, useEffect } from 'react';
import { ArrowLeft, Package, MapPin, Phone, Mail, DollarSign, Clock, User } from 'lucide-react';
import { SalesOrder, PaymentStatus } from '../types';
import { erpnextService } from '../services/erpnext';
import { Payment } from './Payment';

interface OrderDetailsProps {
  order: SalesOrder;
  onBack: () => void;
}

export const OrderDetails: React.FC<OrderDetailsProps> = ({ order, onBack }) => {
  const [customerDetails, setCustomerDetails] = useState<any>(null);
  const [customerAddress, setCustomerAddress] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [orderStatus, setOrderStatus] = useState(order.status);

  useEffect(() => {
    const fetchCustomerInfo = async () => {
      try {
        setLoading(true);
        const [details, address] = await Promise.all([
          erpnextService.getCustomerDetails(order.customer),
          erpnextService.getCustomerAddress(order.customer)
        ]);
        setCustomerDetails(details);
        setCustomerAddress(address);
      } catch (error) {
        console.error('Error fetching customer info:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCustomerInfo();
  }, [order.customer]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'to deliver and bill':
        return 'bg-blue-100 text-blue-800';
      case 'to deliver':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paid':
        return 'bg-emerald-100 text-emerald-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePaymentComplete = async (paymentStatus: PaymentStatus) => {
    try {
      // Since ERPNext will automatically update the order status via frappe_mpsa_payments,
      // we just need to update our local state and notify the user
      setOrderStatus('Completed');
      setShowPayment(false);
      
      // Show success message with receipt details
      alert(`Payment completed successfully! Receipt: ${paymentStatus.mpesa_receipt_number}`);
    } catch (error) {
      console.error('Error handling payment completion:', error);
      alert('Payment received but there was an issue. Please check the order status manually.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center p-4">
          <button 
            onClick={onBack}
            className="mr-3 p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900">Order #{order.name}</h1>
            <p className="text-sm text-gray-600">{order.customer_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderStatus)}`}>
            {orderStatus}
          </span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <Clock className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Delivery Date</p>
                <p className="font-medium text-gray-900">{formatDate(order.delivery_date)}</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-5 h-5 text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="font-medium text-gray-900">KES {order.grand_total.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Customer Information</h2>
          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Customer</p>
                  <p className="font-medium text-gray-900">{order.customer_name}</p>
                </div>
              </div>
              
              {customerDetails?.mobile_no && (
                <div className="flex items-center">
                  <Phone className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <a 
                      href={`tel:${customerDetails.mobile_no}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {customerDetails.mobile_no}
                    </a>
                  </div>
                </div>
              )}

              {customerDetails?.email_id && (
                <div className="flex items-center">
                  <Mail className="w-5 h-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <a 
                      href={`mailto:${customerDetails.email_id}`}
                      className="font-medium text-emerald-600 hover:text-emerald-700"
                    >
                      {customerDetails.email_id}
                    </a>
                  </div>
                </div>
              )}

              {customerAddress && (
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Delivery Address</p>
                    <div className="font-medium text-gray-900">
                      <p>{customerAddress.address_line1}</p>
                      {customerAddress.address_line2 && <p>{customerAddress.address_line2}</p>}
                      <p>{customerAddress.city}, {customerAddress.state} {customerAddress.pincode}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
            <Package className="w-5 h-5 mr-2" />
            Order Items ({order.items?.length || 0})
          </h2>
          <div className="space-y-3">
            {order.items?.map((item, index) => (
              <div key={index} className="flex justify-between items-start p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{item.item_name}</h3>
                  <p className="text-sm text-gray-600">{item.item_code}</p>
                  {item.description && (
                    <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  <p className="font-medium text-gray-900">
                    {item.qty} × KES {item.rate.toLocaleString()}
                  </p>
                  <p className="text-sm font-semibold text-emerald-600">
                    KES {item.amount.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Section */}
        {showPayment && (
          <Payment
            orderAmount={order.grand_total}
            customerPhone={customerDetails?.mobile_no}
            onPaymentComplete={handlePaymentComplete}
            onCancel={() => setShowPayment(false)}
          />
        )}

        {/* Action Buttons */}
        {!showPayment && (
          <div className="space-y-3 pb-6">
            {orderStatus !== 'Completed' && (
              <button 
                onClick={() => setShowPayment(true)}
                className="w-full bg-blue-600 text-white py-4 rounded-xl font-semibold text-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                Process Payment
              </button>
            )}
            
            {orderStatus === 'Completed' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                <p className="text-green-800 font-semibold">✅ Order Completed Successfully</p>
                <p className="text-green-600 text-sm mt-1">Payment has been processed and order status updated automatically</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};