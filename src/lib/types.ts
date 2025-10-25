// modal 

export interface PopUpInterface {
  isOpen: boolean;
  type: "warning" | "error" | "confirm" | "success" | "";
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}


export interface AlertInterface {
  isOpen: boolean;
  type: "success" | "error" | "";
  message: string;
}

// end modal

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  inStock: boolean;
  createdAt: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

export interface Order {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  createdAt: string;
}


export interface Size {
  id: number;
  name: string;
   description?: string;
  createdAt: string;
}


export interface DeliveryOption {
  id: number;
  name: string;
  description?: string;
  minTime: number;
  maxTime: number;
  cutOffTime: string;
  cost: number;
  freeOver?: number;
  status: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content: string;
  image?: string;
  categoryId: number;
  category: any,
  createdAt: string;
  updatedAt: string;
}


export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product?: {
    id: number;
    title: string;
    sellingPrice: number;
    productimage: { url: string }[];
  };
}

export interface Order {
  id: number;
  userId: number;
  totalAmount: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}
