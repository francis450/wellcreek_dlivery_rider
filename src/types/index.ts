export interface SalesOrder {
  name: string;
  customer: string;
  customer_name: string;
  delivery_date: string;
  grand_total: number;
  status: string;
  items: OrderItem[];
  customer_address?: string;
  contact_mobile?: string;
  contact_email?: string;
  territory?: string;
  payment_terms_template?: string;
}

export interface OrderItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  amount: number;
  description?: string;
}

export interface DeliveryStatus {
  order_id: string;
  status: 'pending' | 'in_transit' | 'delivered' | 'payment_pending' | 'completed';
  updated_at: string;
}

export interface PaymentRequest {
  order_id: string;
  amount: number;
  phone_number: string;
  transaction_id?: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface STKPushResponse {
  transaction_id: string;
  checkout_request_id: string;
  response_code: string;
  response_description: string;
  customer_message: string;
}

export interface PaymentStatus {
  transaction_id: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  amount: number;
  phone_number: string;
  mpesa_receipt_number?: string;
  transaction_date?: string;
  error_message?: string;
}

export interface PaymentEntry {
  name: string;
  party: string;
  party_name: string;
  paid_amount: number;
  posting_date: string;
  reference_no?: string;
  mode_of_payment: string;
}