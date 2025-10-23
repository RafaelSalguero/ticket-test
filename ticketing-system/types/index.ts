// Database Models
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  event_date: Date;
  event_time: string;
  venue: string;
  created_at: Date;
  updated_at: Date;
  created_by: string;
}

export interface SeatingSection {
  id: string;
  event_id: string;
  section_name: string;
  price: number;
  total_seats: number;
  available_seats: number;
  created_at: Date;
}

export interface Ticket {
  id: string;
  event_id: string;
  section_id: string;
  seat_number: string;
  user_id: string | null;
  order_id: string | null;
  status: 'available' | 'reserved' | 'sold';
  reserved_at: Date | null;
  created_at: Date;
}

export interface Order {
  id: string;
  user_id: string;
  total_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_method: string;
  created_at: Date;
  updated_at: Date;
}

export interface OrderItem {
  id: string;
  order_id: string;
  ticket_id: string;
  price: number;
  created_at: Date;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

export interface EventFormData {
  name: string;
  description: string;
  eventDate: string;
  eventTime: string;
  venue: string;
  sections: SectionFormData[];
}

export interface SectionFormData {
  sectionName: string;
  price: number;
  totalSeats: number;
}

export interface CheckoutFormData {
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cvv: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface EventWithSections extends Event {
  sections: SeatingSection[];
}

export interface TicketWithDetails extends Ticket {
  event: Event;
  section: SeatingSection;
}

export interface OrderItemWithDetails extends OrderItem {
  ticket: TicketWithDetails;
}

export interface OrderWithDetails extends Order {
  items: OrderItemWithDetails[];
  user?: User;
}

// Component Props Types
export interface EventCardProps {
  event: EventWithSections;
}

export interface TicketSelectionProps {
  eventId: string;
  sections: SeatingSection[];
  onSelectionChange: (tickets: SelectedTicket[]) => void;
}

export interface SelectedTicket {
  sectionId: string;
  sectionName: string;
  seatNumber: string;
  price: number;
}

// Admin Types
export interface SalesReport {
  totalRevenue: number;
  totalTicketsSold: number;
  eventCount: number;
  recentOrders: OrderWithDetails[];
}

export interface AttendanceReport {
  eventId: string;
  eventName: string;
  totalSeats: number;
  soldSeats: number;
  availableSeats: number;
  revenue: number;
}

export interface RevenueData {
  eventId: string;
  eventName: string;
  revenue: number;
  ticketsSold: number;
}
