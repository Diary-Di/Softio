export interface SaleInvoiceData {
  saleId: string;
  date: string; // jj/mm/aaaa
  customer: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: {
    ref: string;
    designation: string;
    qty: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discountAmount: number;
  netAmount: number;
  paidAmount: number;
  changeAmount: number;
  remainingAmount: number;
  paymentMethod: string;
  condition: string;
  company?: {
    name: string;
    address: string;
    phone?: string;
    email?: string;
    siret?: string;
  };
}

export type PaperFormat = 'A4' | 'A5' | 'BL-A4' | 'BL-A5' | 'T80' | 'T58';