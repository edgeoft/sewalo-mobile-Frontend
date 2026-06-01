export interface CustomerFavouriteItem {
  id: string;
  avatarUri: string;
  name: string;
  serviceLabel: string;
  location: string;
  ordersCompleted: string;
  rating: string;
  startingFromPrice: string;
}

export const CUSTOMER_FAVOURITES_MOCK: CustomerFavouriteItem[] = [
  {
    id: 'fav-1',
    avatarUri: 'https://i.pravatar.cc/300?img=47',
    name: 'Pepper Potts',
    serviceLabel: 'Design',
    location: 'Sukedhara, Kathmandu',
    ordersCompleted: '2 Orders Completed',
    rating: '4.2',
    startingFromPrice: 'Rs. 2300',
  },
  {
    id: 'fav-2',
    avatarUri: 'https://i.pravatar.cc/300?img=32',
    name: 'Amina Shrestha',
    serviceLabel: 'Cleaning',
    location: 'Boudha, Kathmandu',
    ordersCompleted: '18 Orders Completed',
    rating: '4.8',
    startingFromPrice: 'Rs. 1800',
  },
  {
    id: 'fav-3',
    avatarUri: 'https://i.pravatar.cc/300?img=12',
    name: 'Raj Khatri',
    serviceLabel: 'Plumbing',
    location: 'Baneshwor, Kathmandu',
    ordersCompleted: '31 Orders Completed',
    rating: '4.7',
    startingFromPrice: 'Rs. 1500',
  },
  {
    id: 'fav-4',
    avatarUri: 'https://i.pravatar.cc/300?img=20',
    name: 'Sita Rana',
    serviceLabel: 'Beauty',
    location: 'Lalitpur, Nepal',
    ordersCompleted: '24 Orders Completed',
    rating: '4.6',
    startingFromPrice: 'Rs. 1200',
  },
  {
    id: 'fav-5',
    avatarUri: 'https://i.pravatar.cc/300?img=8',
    name: 'Nabin Gurung',
    serviceLabel: 'Electrical',
    location: 'Chabahil, Kathmandu',
    ordersCompleted: '14 Orders Completed',
    rating: '4.9',
    startingFromPrice: 'Rs. 2100',
  },
  {
    id: 'fav-6',
    avatarUri: 'https://i.pravatar.cc/300?img=15',
    name: 'Prakash Rai',
    serviceLabel: 'Tutoring',
    location: 'Kirtipur, Kathmandu',
    ordersCompleted: '11 Orders Completed',
    rating: '4.4',
    startingFromPrice: 'Rs. 1000',
  },
  {
    id: 'fav-7',
    avatarUri: 'https://i.pravatar.cc/300?img=24',
    name: 'Kiran Shahi',
    serviceLabel: 'Appliance Repair',
    location: 'Kalanki, Kathmandu',
    ordersCompleted: '7 Orders Completed',
    rating: '4.3',
    startingFromPrice: 'Rs. 1900',
  },
  {
    id: 'fav-8',
    avatarUri: 'https://i.pravatar.cc/300?img=29',
    name: 'Anita Lama',
    serviceLabel: 'Cleaning',
    location: 'Bhaktapur',
    ordersCompleted: '9 Orders Completed',
    rating: '4.1',
    startingFromPrice: 'Rs. 1600',
  },
];
