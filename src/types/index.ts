export type Language = 'en' | 'bn' | 'ru' | 'ar';

export type Theme = 'light' | 'dark';

export interface CompanySettings {
  name: string;
  tagline: string;
  email: string;
  website: string;
  address: string;
  phone: string;
  shortDescription?: string;
  socialLinks: {
    telegram: string;
    twitter: string;
    youtube: string;
    facebook: string;
    linkedin: string;
    discord: string;
  };
}

export interface PlatformStats {
  totalUsers: number;
  activeUsers: number;
  bannedAccounts: number;
  totalTransactions: number;
  calculationMethod: string;
  isRealRecordBased: boolean;
}

export type NoticeType = 'text' | 'pdf' | 'image';

export interface Notice {
  id: string;
  title: string;
  title_bn?: string;
  title_ru?: string;
  title_ar?: string;
  shortDescription: string;
  shortDescription_bn?: string;
  shortDescription_ru?: string;
  shortDescription_ar?: string;
  content: string;
  noticeType: NoticeType;
  fileUrl?: string;
  r2Key?: string;
  fileName?: string;
  fileSize?: string;
  category: string;
  priority: 'Low' | 'Normal' | 'High';
  publicationDate: string;
  expirationDate?: string;
  isPinned?: boolean;
  status: 'active' | 'inactive' | 'expired' | 'archived';
  views: number;
}

export interface AppVersion {
  version: string;
  releaseDate: string;
  fileSize: string;
  sha256: string;
  isLatest: boolean;
  status: string;
  notes: string;
  downloadMethod?: 'upload' | 'external';
  downloadUrl?: string;
  r2Key?: string;
}

export interface MobileApp {
  id: string;
  name: string;
  name_bn?: string;
  packageName: string;
  currentVersion: string;
  versionCode?: number;
  releaseDate: string;
  minAndroidVersion?: string;
  targetAndroidVersion?: string;
  fileSize: string;
  sha256?: string;
  sha256Hash?: string;
  downloadCount: number;
  supportedPlatforms?: string[];
  isHot?: boolean;
  isNew?: boolean;
  shortDescription: string;
  shortDescription_bn?: string;
  description?: string;
  fullDescription?: string;
  fullDescription_bn?: string;
  iconUrl?: string;
  screenshots: string[];
  downloadMethod: 'upload' | 'external';
  downloadUrl?: string;
  r2Key?: string;
  changelog: string[];
  versions?: AppVersion[];
  status?: 'active' | 'inactive';
  ratingsAverage?: number;
  ratingsCount?: number;
}

export type BillingType = 'Weekly' | 'Monthly' | 'Yearly' | 'Lifetime' | 'Custom';

export interface PricingPlan {
  id: string;
  name: string;
  name_bn?: string;
  price: number;
  priceUSD?: number;
  priceFSD: number;
  currency: string;
  billingType: BillingType;
  duration: string;
  validity?: string;
  shortDescription?: string;
  description: string;
  features: string[];
  isFeatured: boolean;
  status: 'active' | 'inactive' | 'archived';
  order: number;
}

export interface Course {
  id: string;
  title: string;
  title_bn?: string;
  instructor: string;
  duration: string;
  category: string;
  thumbnail: string;
  description: string;
  status: 'Available' | 'Coming Soon' | 'Currently Unavailable';
}

export interface PlatformFeature {
  id: string;
  title: string;
  category: string;
  description: string;
  isImplemented: boolean;
  status: string;
}

export interface LegalDocument {
  id: string;
  title: string;
  title_bn?: string;
  category: string;
  version: string;
  publicationDate: string;
  lastUpdated: string;
  status: 'published' | 'draft';
  body: string;
}

export interface FAQItem {
  id: string;
  category: string;
  category_bn?: string;
  question: string;
  question_bn?: string;
  answer: string;
  answer_bn?: string;
  helpfulCount: number;
  unhelpfulCount: number;
}

export interface SupportTicket {
  id: string;
  name: string;
  email: string;
  category: string;
  subject: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Closed';
  createdAt: string;
  internalNotes?: string;
}

export interface ReportItem {
  id: string;
  name: string;
  email: string;
  category: string;
  description: string;
  relatedItem: string;
  status: 'Open' | 'Investigating' | 'Resolved' | 'Dismissed';
  createdAt: string;
  internalNotes?: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'Unread' | 'Replied';
}

export interface UploadedFileRecord {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  r2Key: string;
  publicUrl: string;
  category: 'apps/apk' | 'apps/icons' | 'apps/screenshots' | 'notices/pdf' | 'notices/images' | 'documents' | 'images';
  uploadDate: string;
  relatedId?: string;
  storageProvider: 'r2' | 'local';
}

export interface AuditLog {
  id: string;
  action: string;
  detail: string;
  timestamp: string;
}
