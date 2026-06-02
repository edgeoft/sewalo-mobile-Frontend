export interface ReceivableEarningItem {
  id: string;
  date: string;
  customerName: string;
  serviceTitle: string;
  totalEarnings: string; // net after 15%
  status: 'Received' | 'Unpaid';
}

export interface CommissionDueItem {
  id: string;
  date: string;
  customerName: string;
  serviceTitle: string;
  totalEarnings: string; // gross order amount
  commission: string; // 15% of gross
  status: 'Paid' | 'Unpaid';
}

export const RECEIVABLE_EARNINGS_MOCK: ReceivableEarningItem[] = [
  {
    id: 'rec-1',
    date: 'Jun 02, 2026',
    customerName: 'Sam Billings',
    serviceTitle: 'Deep House Cleaning',
    totalEarnings: 'Rs. 2,125',
    status: 'Unpaid',
  },
  {
    id: 'rec-2',
    date: 'Jun 01, 2026',
    customerName: 'Aria Sharma',
    serviceTitle: 'Bathroom Plumbing Repair',
    totalEarnings: 'Rs. 1,530',
    status: 'Received',
  },
  {
    id: 'rec-3',
    date: 'May 28, 2026',
    customerName: 'Niranjan Thapa',
    serviceTitle: 'Living Room Painting',
    totalEarnings: 'Rs. 7,225',
    status: 'Received',
  },
  {
    id: 'rec-4',
    date: 'May 25, 2026',
    customerName: 'Sita Rana',
    serviceTitle: 'Full Home Salon Package',
    totalEarnings: 'Rs. 2,550',
    status: 'Received',
  },
  {
    id: 'rec-5',
    date: 'May 22, 2026',
    customerName: 'Sunil Tamang',
    serviceTitle: 'Wall Crack Repair',
    totalEarnings: 'Rs. 1,190',
    status: 'Unpaid',
  },
  {
    id: 'rec-6',
    date: 'May 18, 2026',
    customerName: 'Esther Howard',
    serviceTitle: 'Microwave Defect Fix',
    totalEarnings: 'Rs. 1,020',
    status: 'Received',
  },
  {
    id: 'rec-7',
    date: 'May 15, 2026',
    customerName: 'Raj Khatri',
    serviceTitle: 'Shower Installation',
    totalEarnings: 'Rs. 3,400',
    status: 'Received',
  },
];

export const COMMISSIONS_DUE_MOCK: CommissionDueItem[] = [
  {
    id: 'com-1',
    date: 'Jun 02, 2026',
    customerName: 'Sam Billings',
    serviceTitle: 'Deep House Cleaning',
    totalEarnings: 'Rs. 2,500',
    commission: 'Rs. 375',
    status: 'Unpaid',
  },
  {
    id: 'com-2',
    date: 'Jun 01, 2026',
    customerName: 'Aria Sharma',
    serviceTitle: 'Bathroom Plumbing Repair',
    totalEarnings: 'Rs. 1,800',
    commission: 'Rs. 270',
    status: 'Paid',
  },
  {
    id: 'com-3',
    date: 'May 28, 2026',
    customerName: 'Niranjan Thapa',
    serviceTitle: 'Living Room Painting',
    totalEarnings: 'Rs. 8,500',
    commission: 'Rs. 1,275',
    status: 'Paid',
  },
  {
    id: 'com-4',
    date: 'May 25, 2026',
    customerName: 'Sita Rana',
    serviceTitle: 'Full Home Salon Package',
    totalEarnings: 'Rs. 3,000',
    commission: 'Rs. 450',
    status: 'Paid',
  },
  {
    id: 'com-5',
    date: 'May 22, 2026',
    customerName: 'Sunil Tamang',
    serviceTitle: 'Wall Crack Repair',
    totalEarnings: 'Rs. 1,400',
    commission: 'Rs. 210',
    status: 'Unpaid',
  },
  {
    id: 'com-6',
    date: 'May 18, 2026',
    customerName: 'Esther Howard',
    serviceTitle: 'Microwave Defect Fix',
    totalEarnings: 'Rs. 1,200',
    commission: 'Rs. 180',
    status: 'Paid',
  },
];
