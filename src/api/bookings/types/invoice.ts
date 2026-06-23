export interface InvoiceItem {
  id: string;
  invoice_id: string;
  name: string;
  quantity: number;
  unit_price: string;
  total_amount: string;
  is_primary_item: boolean;
}

export interface Invoice {
  id: string;
  invoice_id: string;
  booking_id: string;
  additional_note: string | null;
  sub_total: string;
  discount_amount: string;
  coupon_discount: string;
  coupon_id: string | null;
  vat: string;
  loyalty_points_used: number;
  loyalty_points_discount: string;
  total: string;
  total_amount_paid: string;
  invoice_items: InvoiceItem[];
}

export interface InvoiceItemToAdd {
  name: string;
  quantity: number;
  unit_price: number;
}

export interface InvoiceItemToUpdate {
  id: string;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface UpdateInvoiceItemsPayload {
  id: string;
  additional_note: string;
  discount_amount: number;
  items_to_add: InvoiceItemToAdd[];
  items_to_update: InvoiceItemToUpdate[];
  items_to_delete: string[];
}
