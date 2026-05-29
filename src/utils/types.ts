/**
 * Mifania Sustainable Fashion Line (SFL)
 * API Type Definitions (JSON-LD / Hydra)
 * VERIFIED AGAINST BACKEND SOURCE
 */

// --- Base Hydra Types ---
export interface HydraResource {
  '@id'?: string;
  '@type'?: string;
  id?: number;
}

export interface HydraCollection<T> {
  'hydra:member': T[];
  'hydra:totalItems': number;
  'hydra:view'?: {
    '@id': string;
    '@type': string;
    'hydra:first': string;
    'hydra:last': string;
    'hydra:next'?: string;
  };
}

// --- Enums (Strictly Matched to Backend) ---
export enum PaymentMethod {
  CASH = 'Cash',
  CREDIT_CARD = 'Credit Card',
  BANK_TRANSFER = 'Bank Transfer',
  PAYPAL = 'Paypal',
}

export enum PaymentStatus {
  PENDING = 'Pending',
  PAID = 'Paid',
  REFUNDED = 'Refunded',
  FAILED = 'Failed',
}

export enum OrderStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  SHIPPED = 'Shipped',
  DELIVERED = 'Delivered',
  CANCELLED = 'Cancelled',
}

export enum Size {
  EXTRA_SMALL = 'Extra Small',
  SMALL = 'Small',
  MEDIUM = 'Medium',
  LARGE = 'Large',
  EXTRA_LARGE = 'Extra Large',
  DOUBLE_EXTRA_LARGE = 'Double Extra Large',
  TRIPLE_EXTRA_LARGE = 'Triple Extra Large',
  NA = 'N/A',
}

export enum Color {
  BLUE = 'Blue',
  GREEN = 'Green',
  BLACK = 'Black',
  WHITE = 'White',
  BROWN = 'Brown',
  MOCHA = 'Mocha',
  BEIGE = 'Beige',
}

export enum StockStatus {
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock',
  LOW_STOCK = 'Low Stock',
}

export enum AccountStatus {
  ACTIVE = 'Active',
  DEACTIVATED = 'Deactivated',
}

export enum Gender {
  MEN = 'Men',
  WOMEN = 'Women',
  UNISEX = 'Unisex',
}

export enum Provider {
  MANUAL = 'Manual',
  GOOGLE = 'Google',
}

export enum VerificationStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
}

// --- Entities ---

export interface Product extends HydraResource {
  name: string;
  material: string;
  size: Size;
  color: Color;
  price: string; // Decimal as string
  description?: string;
  slug: string;
  image: string;
  ecoInfo?: string;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string; // Custom API field
  subCategory?: string | SubCategory; // IRI or Object
  story?: string | Story; // IRI or Object
  qrTag?: string | QrTag | QrTag[]; // IRI or Object
  stocks?: any[]; // OneToMany
  wishlisted?: any[]; // ManyToMany
}

export interface Category extends HydraResource {
  name: string;
  description?: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  subCategories?: string[] | SubCategory[]; // OneToMany
}

export interface SubCategory extends HydraResource {
  name: string;
  description?: string;
  slug: string;
  icon?: string;
  createdAt?: string;
  updatedAt?: string;
  category?: string | Category; // ManyToOne
  products?: string[] | Product[]; // OneToMany
}

export interface Order extends HydraResource {
  shippingLabel?: string;
  shippingRecipientName?: string;
  shippingContactNumber?: string;
  shippingAddressLine?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingCountry?: string;
  shippingPostalCode?: string;
  customerAddress?: string | CustomerAddress;
  totalAmount: string; // Decimal as string
  originalAmount?: string;
  discountAmount?: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  rewardPoints: number;
  pointsRedeemed?: number;
  createdAt?: string;
  updatedAt?: string;
  customer?: string | Customer; // ManyToOne
  orderItems?: string[] | OrderItem[]; // OneToMany
}

export interface OrderItem extends HydraResource {
  quantity: number;
  price: string; // Decimal as string
  subtotal: string; // Decimal as string
  createdAt?: string;
  order?: string | Order; // ManyToOne
  product?: string | Product; // ManyToOne
}

export interface CustomerAddress extends HydraResource {
  label: string;
  recipientFirstName?: string;
  recipientLastName?: string;
  recipientFullName?: string;
  contactNumber?: string;
  address: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  courierNote?: string;
  isDefault?: boolean;
  hasPinpoint?: boolean;
  formattedAddress?: string;
  customer?: string | Customer;
}

export interface Customer extends HydraResource {
  firstName: string;
  lastName: string;
  contactNumber?: string;
  address?: string;
  city?: string;
  country?: string;
  state?: string;
  postalCode?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
  user?: string | User; // OneToOne
  wallet?: string | Wallet; // OneToOne
  orders?: string[] | Order[]; // OneToMany
  wishlist?: string[] | Product[]; // ManyToMany
}

export interface User extends HydraResource {
  email: string;
  roles: string[];
  password?: string;
  status?: AccountStatus;
  isVerified: boolean;
  verified?: boolean;
  verificationToken?: string;
  lastActiveAt?: string;
  firstName?: string;
  lastName?: string;
  customerId?: number;
  customer?: string | Customer;
}

export interface Wallet extends HydraResource {
  balance: string; // Decimal as string
  rewardPoints: number;
  customer?: string | Customer; // OneToOne
  walletTransactions?: string[] | WalletTransaction[]; // OneToMany
}

export interface WalletTransaction extends HydraResource {
  amount: string; // Decimal as string
  type: string; // 'deposit', 'withdrawal', 'reward'
  description?: string;
  createdAt?: string;
  wallet?: string | Wallet; // ManyToOne
}

export interface Cart extends HydraResource {
  totalQuantity: number;
  name?: string;
  isMain: boolean;
  totalPrice: string; // Decimal as string
  customer?: string | Customer; // ManyToOne
  cartItems?: string[] | CartItem[]; // OneToMany
}

export interface CartItem extends HydraResource {
  quantity: number;
  price: string; // Decimal as string
  subtotal: string; // Decimal as string
  cart?: string | Cart; // ManyToOne
  product: string | Product; // ManyToOne
  // UI Helpers
  selected?: boolean;
  productName?: string;
  productImageUrl?: string;
}

export interface QrTag extends HydraResource {
  qrCodeValue?: string;
  qrImagePath?: string;
  image?: string;
  imageUrl?: string;
}

export interface Story extends HydraResource {
  title: string;
  materialContent?: string;
  artisanContent?: string;
  dyeingContent?: string;
  products?: string[] | Product[]; // OneToMany
}

export interface Reward extends HydraResource {
  name: string;
  description?: string;
  pointsRequired: number;
  isActive: boolean;
  createdAt?: string;
}

export interface Redemption extends HydraResource {
  pointSpent: number;
  status: string;
  redeemedAt?: string;
  customer?: string | Customer;
  reward?: string | Reward;
}

export interface Notification extends HydraResource {
  title: string;
  message?: string;
  type: string;
  isRead: boolean;
  targetUrl?: string;
  createdAt: string;
  user?: string | User;
  // UI Helpers
  body?: string;
  icon?: string;
  emoji?: string;
}

export type SavedPaymentProviderType = 'card' | 'paypal' | 'google_pay' | 'apple_pay';

export interface SavedPaymentMethod extends HydraResource {
  providerType: SavedPaymentProviderType;
  cardBrand?: string | null;
  lastFour?: string | null;
  expiryMonth?: number | null;
  expiryYear?: number | null;
  holderName?: string | null;
  isConnected: boolean;
  displayName?: string;
  maskedNumber?: string | null;
  createdAt?: string;
}

// --- Redux State Types ---

export interface AuthState {
  isLoading: boolean;
  data: {
    user: User;
    token?: string;
  } | null;
  isError: boolean;
  error: string | null;
}

export interface ProductState {
  items: Product[];
  isLoading: boolean;
  error: string | null;
}

export interface CategoryState {
  items: Category[];
  isLoading: boolean;
  error: string | null;
}

export interface SubCategoryState {
  items: SubCategory[];
  isLoading: boolean;
  error: string | null;
}

export interface CartState {
  items: CartItem[];
  collections: any[];
  isLoading: boolean;
  error: string | null;
  totalPrice: string;
  totalQuantity: number;
}

export interface WishlistState {
  items: Product[];
}

export interface WalletSliceState {
  wallet: Wallet | null;
  rewards: Reward[];
  redemptions: Redemption[];
  isLoading: boolean;
  isError: boolean;
  error: string | null;
  isRedeeming: boolean;
  redemptionError: string | null;
}

export interface RootState {
  authentication: AuthState;
  product: ProductState;
  category: CategoryState;
  subCategory: SubCategoryState;
  cart: CartState;
  wishlist: WishlistState;
  customer: {
    data: Customer | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
  };
  address: {
    items: CustomerAddress[];
    isLoading: boolean;
    isError: boolean;
    error: string | null;
  };
  wallet: WalletSliceState;
  order: {
    items: Order[];
    currentOrder: Order | null;
    isLoading: boolean;
    isError: boolean;
    error: string | null;
    cancelError: string | null;
    lastCreatedOrder: Order | null;
  };
  notification: {
    items: Notification[];
    isLoading: boolean;
    error: string | null;
  };
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
  is_new_user?: boolean;
}

export interface RegisterCredentials {
  email: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  user: User;
}
