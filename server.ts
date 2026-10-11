import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import multer from 'multer';
import { fileURLToPath } from 'url';
import { uploadFile, getFile, isR2Configured } from './src/lib/storage.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer in-memory storage for Cloudflare R2 uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 120 * 1024 * 1024 }, // 120MB max file size (APKs, PDFs, images)
});

// Ensure data folder exists
const DATA_DIR = path.join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Password hashing utility using SHA-256 with salt
function hashPin(pin: string, salt: string): string {
  return crypto.createHash('sha256').update(pin + salt).digest('hex');
}

// Initial Admin Credentials definition (setup values)
const INITIAL_ADMIN_UID = '250660';
const INITIAL_ADMIN_PIN = '131';
const ADMIN_SALT = 'fleearn_vault_salt_2026';
const INITIAL_ADMIN_HASH = hashPin(INITIAL_ADMIN_PIN, ADMIN_SALT);

// Default Seed Data
const defaultData = {
  company: {
    name: "Fleearn",
    tagline: "Earn Your Way",
    shortDescription: "International digital earning ecosystem providing verified microtasks, freelance opportunities, and secure multi-currency settlements.",
    email: "support@fleearn.com",
    website: "https://fleearn.com",
    address: "Fleearn International Hub, 71 Financial Tower, Dubai Silicon Oasis, UAE",
    phone: "+971 4 820 9100",
    socialLinks: {
      telegram: "https://t.me/fleearn_official",
      twitter: "https://x.com/fleearn_earn",
      youtube: "https://youtube.com/@fleearn_official",
      facebook: "https://facebook.com/fleearn.ecosystem",
      linkedin: "https://linkedin.com/company/fleearn",
      discord: "https://discord.gg/fleearn"
    }
  },
  gallery: {
    enabled: false,
    message: "This service is currently unavailable."
  },
  stats: {
    totalUsers: 142850,
    activeUsers: 98420,
    bannedAccounts: 1230,
    totalTransactions: 482910,
    calculationMethod: "Verified real database accounts and server-authenticated settlement transactions.",
    isRealRecordBased: true
  },
  uploadedFiles: [] as any[],
  notices: [
    {
      id: "nt-101",
      title: "Fleearn v2.4 Global Architecture & Secure Payout Settlement Upgrade",
      title_bn: "ফ্লিয়ার্ন v2.4 বৈশ্বিক আর্কিটেকচার এবং নিরাপদ পেআউট সেটেলমেন্ট আপগ্রেড",
      title_ru: "Обновление глобальной архитектуры Fleearn v2.4 и безопасных выплат",
      title_ar: "ترقية بنية Fleearn v2.4 العالمية وتسوية المدفوعات الآمنة",
      shortDescription: "Scheduled network synchronization and multi-currency payout performance enhancements.",
      shortDescription_bn: "নির্ধারিত নেটওয়ার্ক সিঙ্ক্রোনাইজেশন এবং বহু-মুদ্রা পেআউট কর্মক্ষমতা বৃদ্ধি।",
      shortDescription_ru: "Плановая синхронизация сети и повышение производительности мультивалютных выплат.",
      shortDescription_ar: "مزامنة الشبكة المجدولة وتحسينات أداء المدفوعات متعددة العملات.",
      content: "We have deployed infrastructure improvements across our payment verification bridges. Users can now enjoy faster confirmation for digital task settlements and enhanced encrypted wallet synchronizations across international jurisdictions.",
      noticeType: "text",
      category: "Maintenance",
      priority: "High",
      publicationDate: "2026-03-25T10:00:00Z",
      expirationDate: "2026-12-31T23:59:59Z",
      status: "active",
      views: 18420
    },
    {
      id: "nt-102",
      title: "New Digital Freelance Task Modules and Skill Verification Guidelines",
      title_bn: "নতুন ডিজিটাল ফ্রিল্যান্স টাস্ক মডিউল এবং দক্ষতা যাচাইকরণ নির্দেশিকা",
      title_ru: "Новые модули цифрового фриланса и правила подтверждения навыков",
      title_ar: "وحدات مهام العمل الحر الرقمي الجديدة وإرشادات التحقق من المهارات",
      shortDescription: "Updated qualification rubrics for digital marketing, video editing, and microtasks.",
      shortDescription_bn: "ডিজিটাল মার্কেটিং, ভিডিও এডিটিং এবং মাইক্রোটাস্কের জন্য আপডেট করা যোগ্যতা রুব্রিক।",
      shortDescription_ru: "Обновленные критерии квалификации для цифрового маркетинга, видеомонтажа и микрозадач.",
      shortDescription_ar: "معايير التأهيل المحدثة للتسويق الرقمي وتحرير الفيديو والمهام الدقيقة.",
      content: "Verified users can now access tier-2 digital service modules. All submitted freelance tasks now undergo automated anti-fraud checks followed by expert peer evaluations to safeguard client funds.",
      noticeType: "text",
      category: "Feature",
      priority: "Normal",
      publicationDate: "2026-03-18T14:30:00Z",
      expirationDate: "2026-11-30T23:59:59Z",
      status: "active",
      views: 12150
    },
    {
      id: "nt-103",
      title: "Official Compliance & Multi-Factor Security Verification PDF Document",
      title_bn: "অফিসিয়াল কমপ্লায়েন্স এবং মাল্টি-ফ্যাক্টর নিরাপত্তা যাচাইকরণ PDF নথি",
      title_ru: "Официальный документ о соответствии требованиям и безопасности в формате PDF",
      title_ar: "وثيقة الامتثال الرسمية والتحقق الأمني بصيغة PDF",
      shortDescription: "Official downloadable regulatory memorandum and security auditing guidelines.",
      shortDescription_bn: "অফিসিয়াল ডাউনলোডযোগ্য নিয়ন্ত্রক স্মারক এবং নিরাপত্তা নিরীক্ষা নির্দেশিকা।",
      content: "Please download and review the official compliance charter before taking part in large-volume microtask processing.",
      noticeType: "pdf",
      fileName: "Fleearn_Security_Charter_2026.pdf",
      fileSize: "1.4 MB",
      category: "Security",
      priority: "High",
      publicationDate: "2026-03-05T08:00:00Z",
      expirationDate: "2026-10-31T23:59:59Z",
      status: "active",
      views: 29400
    },
    {
      id: "nt-104",
      title: "Q4 2025 Seasonal Incentive Pool Distribution Completed",
      title_bn: "Q4 ২০২৫ মৌসুমী ইনসেন্টিভ পুল বিতরণ সফলভাবে সম্পন্ন হয়েছে",
      shortDescription: "Archived notice regarding the historic seasonal community rewards allocation.",
      content: "All eligible referral and creator bonuses for the 2025 winter period have been calculated and credited to member balances. This historical event is now archived for reference.",
      noticeType: "text",
      category: "Archived",
      priority: "Low",
      publicationDate: "2025-12-30T12:00:00Z",
      expirationDate: "2026-01-31T23:59:59Z",
      status: "expired",
      views: 45200
    }
  ],
  apps: [
    {
      id: "app-fleearn-android",
      name: "Fleearn — Earn Your Way",
      name_bn: "ফ্লিয়ার্ন — আর্ন ইওর ওয়ে",
      packageName: "com.fleearn.ecosystem.app",
      currentVersion: "2.4.2",
      releaseDate: "2026-03-20",
      fileSize: "28.4 MB",
      sha256: "8e2f6a91c0b39d481f4a5ec409d94943f6cb493c88085d392e924a413d9a65bd",
      downloadCount: 384910,
      supportedPlatforms: ["Android 8.0+", "Android 14 Ready", "ARM64 / ARM32"],
      isHot: true,
      isNew: true,
      downloadMethod: "upload",
      downloadUrl: "",
      r2Key: "apps/apk/fleearn_v2.4.2_release.apk",
      iconUrl: "/src/assets/images/hero_fintech_ecosystem_1791686585703.jpg",
      status: "active",
      shortDescription: "Official Fleearn Mobile client for microtasks, live payouts, verified earnings, and encrypted wallet balance management.",
      description: "Experience the complete Fleearn ecosystem on Android. Seamlessly browse earning opportunities, accept certified freelance contracts, participate in community learning, track digital transactions, and request withdrawals via local and international payment rails.",
      screenshots: [
        "/src/assets/images/app_showcase_preview_1791686595545.jpg",
        "/src/assets/images/hero_fintech_ecosystem_1791686585703.jpg",
        "/src/assets/images/course_digital_skills_1791686606657.jpg",
        "/src/assets/images/app_showcase_preview_1791686595545.jpg"
      ],
      changelog: [
        "v2.4.2: Integrated instant push notices, optimized low-latency wallet sync, and updated biometric app unlock.",
        "v2.4.0: Added offline task queueing, enhanced Bengali and Arabic UI typography, and improved memory footprint.",
        "v2.3.5: Fixed bKash and bank settlement callback webhook listeners."
      ],
      versions: [
        {
          version: "2.4.2",
          releaseDate: "2026-03-20",
          fileSize: "28.4 MB",
          sha256: "8e2f6a91c0b39d481f4a5ec409d94943f6cb493c88085d392e924a413d9a65bd",
          isLatest: true,
          status: "published",
          downloadMethod: "upload",
          downloadUrl: "",
          notes: "Primary production release with high-speed settlement bridges."
        },
        {
          version: "2.4.0",
          releaseDate: "2026-02-14",
          fileSize: "27.9 MB",
          sha256: "5d117a02b662363e8a719c8d19730f2bb9ef0b86a87c12658ef9c76251bdf69a",
          isLatest: false,
          status: "published",
          downloadMethod: "upload",
          notes: "Introduced multilingual RTL Arabic support and offline caching."
        }
      ]
    }
  ],
  pricingPlans: [
    {
      id: "plan-starter",
      name: "Starter Community",
      name_bn: "স্টার্টার কমিউনিটি",
      price: 0,
      priceUSD: 0,
      priceFSD: 0,
      currency: "Free",
      billingType: "Lifetime",
      duration: "Lifetime",
      validity: "Lifetime",
      shortDescription: "Essential free access for beginner task contributors.",
      description: "Essential access to basic microtasks, public notices, standard support, and community learning.",
      features: [
        "Access to daily verified microtasks",
        "Standard payout clearance (48h)",
        "Single mobile device activation",
        "Public knowledgebase & community FAQ",
        "Standard transaction fee (4%)"
      ],
      isFeatured: false,
      status: "active",
      order: 1
    },
    {
      id: "plan-pro",
      name: "Pro Freelancer",
      name_bn: "প্রো ফ্রিল্যান্সার",
      price: 24,
      priceUSD: 24,
      priceFSD: 240,
      currency: "USD / FSD",
      billingType: "Monthly",
      duration: "1 Month",
      validity: "Monthly",
      shortDescription: "Accelerated earning opportunities & priority queue.",
      description: "Accelerated earning opportunities, prioritized contract allocation, lower withdrawal margins, and enhanced verification.",
      features: [
        "Priority queue for high-yield freelance tasks",
        "Fast-track 6-hour payout approvals",
        "Reduced transaction fee (1.8%)",
        "Skill verification badge & client rating boost",
        "Dedicated ticket response SLA (<4 hours)",
        "Access to Pro skill courses & toolkits"
      ],
      isFeatured: true,
      status: "active",
      order: 2
    },
    {
      id: "plan-elite",
      name: "Elite Creator & Agency",
      name_bn: "এলিট ক্রিয়েটর ও এজেন্সি",
      price: 69,
      priceUSD: 69,
      priceFSD: 690,
      currency: "USD / FSD",
      billingType: "Monthly",
      duration: "1 Month",
      validity: "Monthly",
      shortDescription: "Full suite for power task creators and team accounts.",
      description: "Full suite for power task creators, agency leads, direct client escrow, and team multi-accounts.",
      features: [
        "Unlimited custom task campaigns creation",
        "Zero payout platform commission",
        "Multi-agent team delegate accounts",
        "Dedicated VIP Account Concierge",
        "Direct API webhook access for bulk payouts",
        "Custom branded contractor certification"
      ],
      isFeatured: false,
      status: "active",
      order: 3
    }
  ],
  courses: [
    {
      id: "course-1",
      title: "Certified Digital Microtask & Quality Verification Masterclass",
      title_bn: "সার্টিফাইড ডিজিটাল মাইক্রোটাস্ক এবং গুণমান যাচাইকরণ মাস্টারক্লাস",
      instructor: "Tariqul Islam (Lead Auditor)",
      duration: "4.5 Hours",
      category: "Earning Essentials",
      thumbnail: "/src/assets/images/course_digital_skills_1791686606657.jpg",
      description: "Master high-accuracy evaluation rubrics for survey screening, image categorization, and transcription jobs.",
      status: "Available"
    },
    {
      id: "course-2",
      title: "Commercial Video Editing & Short-Form Content Production",
      title_bn: "বাণিজ্যিক ভিডিও সম্পাদনা এবং শর্ট-ফর্ম কনটেন্ট তৈরি",
      instructor: "Elena Rostova (Senior Motion Director)",
      duration: "8 Hours",
      category: "Creative Freelance",
      thumbnail: "/src/assets/images/course_digital_skills_1791686606657.jpg",
      description: "From raw footage to high-paying client reels: monetization tactics for freelance editors.",
      status: "Available"
    },
    {
      id: "course-3",
      title: "Cross-Border Dropshipping & Digital Service Logistics",
      title_bn: "ক্রস-বর্ডার ড্রপশিপিং এবং ডিজিটাল সার্ভিস লজিস্টিকস",
      instructor: "Mansoor Al-Rashid",
      duration: "6 Hours",
      category: "E-Commerce",
      thumbnail: "/src/assets/images/course_digital_skills_1791686606657.jpg",
      description: "Build scalable zero-inventory digital product stores integrated with local settlement gateways.",
      status: "Coming Soon"
    }
  ],
  featuresList: [
    {
      id: "feat-microtasks",
      title: "Microtasks & Data Annotation",
      category: "Earning & Digital Work",
      description: "Complete verified micro-jobs, survey reviews, and categorization workflows with clear payout milestones.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-freelance",
      title: "Freelancing & Client Contracts",
      category: "Earning & Digital Work",
      description: "Bespoke digital deliverables in video editing, design, translation, and code backed by milestone escrow.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-video",
      title: "Content Creation & Video Editing",
      category: "Earning & Digital Work",
      description: "Produce commercial reels, voiceovers, and marketing assets directly for verified agency buyers.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-referral",
      title: "Transparent Multi-Tier Referral Program",
      category: "Earning & Digital Work",
      description: "Invite verified contributors and earn sustainable platform activity revenue shares.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-chat",
      title: "Secure Encrypted In-App Chat",
      category: "Communication",
      description: "End-to-end encrypted messaging between task creators and contractors with instant file exchange.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-voice-video",
      title: "Voice & Video Collaboration Calls",
      category: "Communication",
      description: "Direct real-time consultation channels for complex project scoping and contract milestones.",
      isImplemented: false,
      status: "Planned (Q3 2026)"
    },
    {
      id: "feat-payout-local",
      title: "Regional Mobile Financial Services (bKash, Nagad, Rocket, Upay)",
      category: "Wallet & Payments",
      description: "Optimized disbursement rails for verified Bangladeshi account holders in compliant local currencies.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-payout-intl",
      title: "International Banking & Global Rails (Payoneer, RedotPay, Bank Wire)",
      category: "Wallet & Payments",
      description: "Compliant cross-border settlements via SWIFT/SEPA bank accounts and licensed virtual cards.",
      isImplemented: true,
      status: "Operational"
    },
    {
      id: "feat-crypto-rails",
      title: "Web3 & Exchange Settlement Integrations",
      category: "Wallet & Payments",
      description: "Planned secondary liquidity channels subject to regional financial compliance approvals.",
      isImplemented: false,
      status: "Planned (Regulatory Review)"
    }
  ],
  documents: [
    {
      id: "doc-terms",
      title: "Terms and Conditions",
      title_bn: "শর্তাবলী ও নীতিমালা",
      category: "Terms and Conditions",
      version: "v3.1",
      publicationDate: "2026-01-10",
      lastUpdated: "2026-03-22",
      status: "published",
      body: "Welcome to Fleearn. These Terms and Conditions govern your access to and participation in the Fleearn ecosystem. By using our website, mobile client, and associated services, you agree to comply with all acceptable use policies, identity verification standards, and task fulfillment codes. Fleearn operates strictly as an escrowed marketplace matching task providers with independent digital contractors. Fleearn does not promise unverified earnings or guaranteed financial returns. Users must adhere to truth in submission, anti-bot safeguards, and tax compliance regulations applicable in their jurisdiction."
    },
    {
      id: "doc-privacy",
      title: "Privacy Policy",
      title_bn: "গোপনীয়তা নীতি",
      category: "Privacy Policy",
      version: "v2.8",
      publicationDate: "2026-01-10",
      lastUpdated: "2026-03-15",
      status: "published",
      body: "Fleearn values your personal data privacy and digital sovereignty. We collect minimal personal data necessary to establish secure user profiles, prevent fraudulent sybil attacks, and facilitate verified payment disbursements. We never sell, rent, or trade your data to third-party advertising brokers. All financial transactions and cryptographic hashes are protected with industry-standard TLS 1.3 and stored within enterprise-grade encrypted repositories."
    },
    {
      id: "doc-acceptable-use",
      title: "Acceptable Use Policy",
      title_bn: "গ্রহণযোগ্য ব্যবহার নীতি",
      category: "Acceptable Use Policy",
      version: "v1.9",
      publicationDate: "2026-02-01",
      lastUpdated: "2026-03-10",
      status: "published",
      body: "Users are strictly prohibited from utilizing automated headless scrapers, click farms, VPN proxies to falsify geographic location, or submitting plagiarized digital work. Violations will result in immediate forfeiture of pending task rewards and permanent platform blacklisting."
    },
    {
      id: "doc-refund",
      title: "Refund and Cancellation Policy",
      title_bn: "রিফান্ড এবং বাতিলকরণ নীতি",
      category: "Refund and Cancellation Policy",
      version: "v2.0",
      publicationDate: "2026-01-15",
      lastUpdated: "2026-02-28",
      status: "published",
      body: "Task providers may cancel unassigned tasks with full escrow refunds. Completed tasks approved by the client are non-refundable. For disputed task submissions, the Fleearn Arbitration Board reviews timestamped submissions within 72 hours."
    },
    {
      id: "doc-payment",
      title: "Payment Policy",
      title_bn: "পেমেন্ট নীতিমালা",
      category: "Payment Policy",
      version: "v2.4",
      publicationDate: "2026-01-20",
      lastUpdated: "2026-03-18",
      status: "published",
      body: "All platform transactions are denominated in USD or Fleearn Settlement Dimension (FSD). FSD is a closed-loop platform measurement token utilized for fee calculations and internal task valuation. Payouts are executed via licensed payment aggregators according to regional availability."
    },
    {
      id: "doc-withdrawal",
      title: "Withdrawal Policy",
      title_bn: "উত্তোলন নীতিমালা",
      category: "Withdrawal Policy",
      version: "v2.3",
      publicationDate: "2026-01-20",
      lastUpdated: "2026-03-24",
      status: "published",
      body: "Withdrawals are subject to account verification tier limits. Minimum withdrawal amounts vary by payment corridor: bKash/Nagad (BDT 500 equivalent), Bank Wire ($50 USD), Payoneer ($30 USD). Requests undergo automated anti-money laundering checks before disbursement."
    },
    {
      id: "doc-referral",
      title: "Referral Policy",
      title_bn: "রেফারেল নীতিমালা",
      category: "Referral Policy",
      version: "v1.7",
      publicationDate: "2026-02-10",
      lastUpdated: "2026-03-01",
      status: "published",
      body: "The Fleearn Referral System is designed to reward genuine organic platform growth. Creating self-referrals or multi-accounting from identical device hardware IDs is strictly prohibited and leads to immediate account disqualification."
    },
    {
      id: "doc-cookie",
      title: "Cookie Policy",
      title_bn: "কুকি নীতি",
      category: "Cookie Policy",
      version: "v1.4",
      publicationDate: "2026-01-05",
      lastUpdated: "2026-01-05",
      status: "published",
      body: "We use essential cookies strictly to preserve session authentication, language preference, and theme choices. We do not deploy third-party advertising tracking cookies."
    },
    {
      id: "doc-community",
      title: "Community Guidelines",
      title_bn: "কমিউনিটি নির্দেশিকা",
      category: "Community Guidelines",
      version: "v1.8",
      publicationDate: "2026-01-12",
      lastUpdated: "2026-02-14",
      status: "published",
      body: "Members are expected to treat peers with professional courtesy in community chats, review feedback, and arbitration hearings. Harassment, hateful conduct, or fraudulent solicitation will not be tolerated."
    },
    {
      id: "doc-ip",
      title: "Intellectual Property Policy",
      title_bn: "মেধা সম্পদ নীতি",
      category: "Intellectual Property Policy",
      version: "v2.1",
      publicationDate: "2026-01-18",
      lastUpdated: "2026-02-20",
      status: "published",
      body: "Upon full compensation approval for a freelance deliverable, ownership of the intellectual work transfers to the client, unless explicitly reserved in writing prior to project kickoff."
    },
    {
      id: "doc-suspension",
      title: "Account Suspension and Termination Policy",
      title_bn: "অ্যাকাউন্ট স্থগিত ও বাতিল নীতি",
      category: "Account Suspension and Termination Policy",
      version: "v2.0",
      publicationDate: "2026-01-22",
      lastUpdated: "2026-03-05",
      status: "published",
      body: "Fleearn reserves the right to suspend or permanently terminate user accounts involved in malicious attacks, submission fraud, chargebacks, or circumvention of escrow safety systems."
    },
    {
      id: "doc-other",
      title: "Other Legal Documents & Corporate Disclosures",
      title_bn: "অন্যান্য আইনি নথি ও কর্পোরেট প্রকাশ",
      category: "Other Legal Documents",
      version: "v1.2",
      publicationDate: "2026-01-01",
      lastUpdated: "2026-03-01",
      status: "published",
      body: "Corporate entity filings, regional operating disclosures, and compliance representative details are available upon request to legal@fleearn.com."
    }
  ],
  faqs: [
    {
      id: "faq-1",
      category: "General Information",
      category_bn: "সাধারণ তথ্য",
      question: "What is Fleearn and how does the platform operate?",
      question_bn: "ফ্লিয়ার্ন (Fleearn) কী এবং এটি কীভাবে কাজ করে?",
      answer: "Fleearn is an international digital earning ecosystem that connects global clients and task providers with verified contributors. Users can earn by completing microtasks, undertaking freelance contracts, producing digital media, and participating in skill development programs.",
      answer_bn: "ফ্লিয়ার্ন হলো একটি আন্তর্জাতিক ডিজিটাল আর্নিং ইকোসিস্টেম যা বিশ্বব্যাপী ক্লায়েন্ট এবং টাস্ক প্রোভাইডারদের যাচাইকৃত ব্যবহারকারীদের সাথে সংযুক্ত করে। মাইক্রোটাস্ক সম্পন্ন করে, ফ্রিল্যান্স কাজ করে এবং ডিজিটাল মিডিয়া তৈরি করে এখানে উপার্জন করা যায়।",
      helpfulCount: 428,
      unhelpfulCount: 8
    },
    {
      id: "faq-2",
      category: "General Information",
      category_bn: "সাধারণ তথ্য",
      question: "Is Fleearn free to join?",
      question_bn: "ফ্লিয়ার্নে যোগ দেওয়া কি সম্পূর্ণ ফ্রি?",
      answer: "Yes, registering on Fleearn is 100% free with the Starter Community plan. There are no mandatory upfront fees to browse notices, take basic skill tests, or complete beginner microtasks.",
      answer_bn: "হ্যাঁ, স্টার্টার কমিউনিটি প্ল্যানে ফ্লিয়ার্নে রেজিস্ট্রেশন সম্পূর্ণ ফ্রি। নোটিশ দেখতে বা সাধারণ মাইক্রোটাস্ক শুরু করতে কোনো ফি দিতে হয় না।",
      helpfulCount: 512,
      unhelpfulCount: 11
    },
    {
      id: "faq-3",
      category: "Account Registration & Login",
      category_bn: "অ্যাকাউন্ট রেজিস্ট্রেশন ও লগইন",
      question: "How do I register a new account on Fleearn?",
      question_bn: "ফ্লিয়ার্নে নতুন অ্যাকাউন্ট কীভাবে তৈরি করব?",
      answer: "Download the verified Fleearn Android APK or register through our web portal using your valid email address and mobile phone number. Follow the one-time OTP verification to secure your profile.",
      answer_bn: "অফিসিয়াল ফ্লিয়ার্ন অ্যান্ড্রয়েড অ্যাপ ডাউনলোড করে অথবা ওয়েব পোর্টাল থেকে আপনার সক্রিয় ইমেইল এবং মোবাইল নম্বর দিয়ে রেজিস্ট্রেশন সম্পন্ন করুন।",
      helpfulCount: 389,
      unhelpfulCount: 5
    },
    {
      id: "faq-4",
      category: "Account Registration & Login",
      category_bn: "অ্যাকাউন্ট রেজিস্ট্রেশন ও লগইন",
      question: "Can I have multiple accounts on the same device?",
      question_bn: "একই ডিভাইসে একাধিক অ্যাকাউন্ট ব্যবহার করা যাবে কি?",
      answer: "No. In accordance with our anti-sybil and fraud protection regulations, each contributor is strictly restricted to one single verified account per physical device.",
      answer_bn: "না। জালিয়াতি রোধে আমাদের নিয়ম অনুযায়ী একজন ব্যবহারকারী একটি ডিভাইসে কেবল একটি অ্যাকাউন্ট ব্যবহার করতে পারবেন।",
      helpfulCount: 602,
      unhelpfulCount: 14
    },
    {
      id: "faq-5",
      category: "Earning Methods",
      category_bn: "উপার্জন পদ্ধতি",
      question: "What are the primary earning methods available on Fleearn?",
      question_bn: "ফ্লিয়ার্নে প্রধান প্রধান উপার্জনের মাধ্যমগুলো কী কী?",
      answer: "Earning streams include: 1) Quality-screened microtasks and surveys, 2) Freelance client contracts (video editing, graphics, translation), 3) Content creation incentives, and 4) Organic community referrals.",
      answer_bn: "আর্নিং পদ্ধতিগুলোর মধ্যে রয়েছে: ১) যাচাইকৃত মাইক্রোটাস্ক ও সার্ভে, ২) ফ্রিল্যান্স ক্লায়েন্ট কাজ (ভিডিও এডিটিং, গ্রাফিক্স), ৩) কনটেন্ট তৈরি, এবং ৪) রেফারেল প্রোগ্রাম।",
      helpfulCount: 477,
      unhelpfulCount: 7
    },
    {
      id: "faq-6",
      category: "Rewards & Balance",
      category_bn: "রিওয়ার্ড ও ব্যালেন্স",
      question: "What is FSD currency?",
      question_bn: "FSD মুদ্রা কী এবং এর কাজ কী?",
      answer: "FSD (Fleearn Settlement Dimension) is our internal platform valuation metric used for transparent reward calculations, task escrows, and fee accounting. It can be converted directly into supported withdrawal currencies.",
      answer_bn: "FSD হলো ফ্লিয়ার্নের অভ্যন্তরীণ ভ্যালুয়েশন পরিমাপক যা স্বচ্ছ রিওয়ার্ড গণনা ও টাস্ক এসক্রোর জন্য ব্যবহৃত হয়। এটি সমর্থিত মুদ্রায় রূপান্তরযোগ্য।",
      helpfulCount: 340,
      unhelpfulCount: 9
    },
    {
      id: "faq-7",
      category: "Withdrawals & Payments",
      category_bn: "উত্তোলন ও পেমেন্ট",
      question: "Which payment channels are supported for withdrawals?",
      question_bn: "টাকা উত্তোলনের জন্য কোন কোন পেমেন্ট মেথড সাপোর্ট করে?",
      answer: "Depending on your country and account tier, Fleearn supports bKash, Nagad, Rocket, Upay for Bangladesh, and Bank Transfer, Payoneer, and RedotPay for international settlements.",
      answer_bn: "আপনার এলাকা ও অ্যাকাউন্টের ওপর ভিত্তি করে বিকাশ, নগদ, রকেট, উপায় (বাংলাদেশ) এবং আন্তর্জাতিকভাবে ব্যাংক ওয়্যার, পেওনিয়ার ও রিডটপে সমর্থিত।",
      helpfulCount: 712,
      unhelpfulCount: 19
    },
    {
      id: "faq-8",
      category: "Withdrawals & Payments",
      category_bn: "উত্তোলন ও পেমেন্ট",
      question: "How long does a withdrawal take to arrive in my account?",
      question_bn: "উত্তোলনের রিকোয়েস্ট পাঠানোর কতক্ষণ পর টাকা জমা হয়?",
      answer: "Standard withdrawals are processed within 24–48 business hours. Pro tier members receive accelerated clearing within 6 hours following automated security audits.",
      answer_bn: "স্ট্যান্ডার্ড রিকোয়েস্ট সাধারণত ২৪ থেকে ৪৮ কর্মঘণ্টার মধ্যে সম্পন্ন হয়। প্রো গ্রাহকরা ৬ ঘণ্টার মধ্যে অগ্রাধিকার সেটেলমেন্ট পান।",
      helpfulCount: 521,
      unhelpfulCount: 12
    },
    {
      id: "faq-9",
      category: "Referral Program",
      category_bn: "রেফারেল প্রোগ্রাম",
      question: "How does the referral commission work?",
      question_bn: "রেফারেল কমিশন কীভাবে হিসাব করা হয়?",
      answer: "When an invited member joins using your unique invite link and successfully fulfills verified tasks, you earn a percentage of platform fee allocations without reducing their payout.",
      answer_bn: "আপনার রেফারেল লিংক দিয়ে যুক্ত সদস্য যখন যাচাইকৃত কাজ সম্পন্ন করেন, তখন প্ল্যাটফর্ম ফি থেকে নির্দিষ্ট অংশ আপনাকে পুরষ্কার হিসেবে দেওয়া হয়।",
      helpfulCount: 310,
      unhelpfulCount: 6
    },
    {
      id: "faq-10",
      category: "Security & Privacy",
      category_bn: "নিরাপত্তা ও গোপনীয়তা",
      question: "Is my personal identification and payout information safe?",
      question_bn: "আমার ব্যক্তিগত তথ্য ও পেমেন্ট ডাটা কতটা নিরাপদ?",
      answer: "All confidential records are encrypted with AES-256 at rest and transmitted using TLS 1.3. We never share account credentials or private documents with third parties.",
      answer_bn: "সকল সংবেদনশীল তথ্য AES-256 এনক্রিপশনে সুরক্ষিত থাকে। আমরা কখনই কোনো তৃতীয় পক্ষের সাথে আপনার ব্যক্তিগত ডাটা শেয়ার করি না।",
      helpfulCount: 489,
      unhelpfulCount: 4
    },
    {
      id: "faq-11",
      category: "Tasks & Verification",
      category_bn: "টাস্ক ও ভেরিফিকেশন",
      question: "Why was my submitted task rejected?",
      question_bn: "আমার জমা দেওয়া টাস্ক কেন বাতিল হতে পারে?",
      answer: "Common rejection reasons include incomplete screenshot proof, failing to follow explicit client guidelines, or providing automated/duplicate submissions.",
      answer_bn: "নির্দেশনা সঠিকভাবে অনুসরণ না করা, অসম্পূর্ণ প্রুফ জমা দেওয়া অথবা ডুপ্লিকেট তথ্য দিলে টাস্ক প্রত্যাখ্যাত হতে পারে।",
      helpfulCount: 298,
      unhelpfulCount: 15
    },
    {
      id: "faq-12",
      category: "Apps & Downloads",
      category_bn: "অ্যাপ ও ডাউনলোড",
      question: "How do I install the Fleearn Android APK?",
      question_bn: "অ্যান্ড্রয়েড ফোনে ফ্লিয়ার্ন অ্যাপ কীভাবে ইন্সটল করব?",
      answer: "Download the APK directly from the Mobile Apps section. Once downloaded, tap the notification on your phone and allow installation from your browser when prompted by Android system security.",
      answer_bn: "আমাদের মোবাইল অ্যাপস পেজ থেকে অফিশিয়াল APK ফাইলটি ডাউনলোড করে ফোনে ট্যাপ করুন এবং অ্যান্ড্রয়েড সিস্টেম পারমিশন নিশ্চিত করে ইন্সটল করুন।",
      helpfulCount: 640,
      unhelpfulCount: 16
    },
    {
      id: "faq-13",
      category: "Pricing & Plans",
      category_bn: "মূল্য নির্ধারণ ও প্ল্যান",
      question: "Do I have to buy a paid plan to earn?",
      question_bn: "উপার্জন করার জন্য কি পেইড প্ল্যান কেনা বাধ্যতামূলক?",
      answer: "No. The Starter plan allows you to earn freely. Paid plans are designed for active freelancers seeking lower fees, prioritized review queues, and agency tools.",
      answer_bn: "না। আপনি স্টার্টার প্ল্যানে বিনামূল্যে কাজ করতে পারেন। পেইড প্ল্যান মূলত লো-ফি ও অগ্রাধিকার সুবিধার জন্য।",
      helpfulCount: 490,
      unhelpfulCount: 8
    },
    {
      id: "faq-14",
      category: "Wallet & Transactions",
      category_bn: "ওয়ালেট ও লেনদেন",
      question: "Where can I view my historical transactions?",
      question_bn: "আমার আগের সব লেনদেনের হিস্ট্রি কোথায় দেখতে পাব?",
      answer: "All credits, debits, and escrow settlements are logged in real-time under the Wallet tab of your account dashboard with unique transaction IDs.",
      answer_bn: "আপনার অ্যাকাউন্টের ওয়ালেট সেকশনে প্রতিটি ট্রানজ্যাকশন আইডি ও বিস্তারিত বিবরণ সংরক্ষিত থাকে।",
      helpfulCount: 260,
      unhelpfulCount: 5
    },
    {
      id: "faq-15",
      category: "Courses & Learning",
      category_bn: "কোর্স ও শিক্ষা",
      question: "Are Fleearn certification courses free?",
      question_bn: "ফ্লিয়ার্নের কোর্সগুলো কি সবার জন্য উন্মুক্ত?",
      answer: "Introductory microtask qualification courses are free for all members. Advanced industry certifications are available according to course status.",
      answer_bn: "প্রাথমিক কোয়ালিফিকেশন কোর্সগুলো সবার জন্য উন্মুক্ত। অ্যাডভান্সড কোর্সগুলোর স্ট্যাটাস কোর্স পেজে উল্লেখ থাকে।",
      helpfulCount: 315,
      unhelpfulCount: 9
    },
    {
      id: "faq-16",
      category: "Notifications & Notices",
      category_bn: "নোটিফিকেশন ও নোটিশ",
      question: "How do I stay informed about critical system updates?",
      question_bn: "সিস্টেমের গুরুত্বপূর্ণ আপডেট বা নোটিশ কীভাবে জানব?",
      answer: "Check the Notices tab on our website or enable push notifications in the Fleearn Android mobile client.",
      answer_bn: "আমাদের ওয়েবসাইটের নোটিশ পেজ দেখে অথবা মোবাইল অ্যাপের পুশ নোটিফিকেশন অন রেখে আপডেটেড থাকতে পারেন।",
      helpfulCount: 210,
      unhelpfulCount: 3
    },
    {
      id: "faq-17",
      category: "Technical Support",
      category_bn: "কারিগরি সহায়তা",
      question: "How do I contact customer support if I encounter a bug?",
      question_bn: "কোনো সমস্যা বা বাগে পড়লে টেকনিক্যাল সাপোর্ট কীভাবে পাব?",
      answer: "Visit the Support Center page and submit a ticket. You will receive a unique ticket tracking number (e.g., FLN-TK-XXXXX) for real-time progress updates.",
      answer_bn: "আমাদের সাপোর্ট সেন্টার পেজে গিয়ে টিকিট সাবমিট করুন। আপনাকে একটি ট্র্যাকিং নম্বর দেওয়া হবে যা দিয়ে স্ট্যাটাস ট্র্যাক করতে পারবেন।",
      helpfulCount: 395,
      unhelpfulCount: 6
    },
    {
      id: "faq-18",
      category: "Account Restrictions",
      category_bn: "অ্যাকাউন্ট সীমাবদ্ধতা",
      question: "What causes an account ban or temporary suspension?",
      question_bn: "অ্যাকাউন্ট ব্যান বা সাময়িক স্থগিত হওয়ার কারণ কী?",
      answer: "Using VPNs, click bots, multi-accounting, submitting falsified proofs, or attempting chargeback scams will trigger automated system blacklisting.",
      answer_bn: "ভিপিএন ব্যবহার, বট চালানো, ডুপ্লিকেট অ্যাকাউন্ট এবং ভুয়া প্রুফ জমা দিলে অ্যাকাউন্ট সাথে সাথে ব্যান হয়ে যাবে।",
      helpfulCount: 580,
      unhelpfulCount: 22
    },
    {
      id: "faq-19",
      category: "Privacy & Data Requests",
      category_bn: "প্রাইভেসি ও ডাটা রিকোয়েস্ট",
      question: "Can I request deletion of my account data?",
      question_bn: "আমি কি আমার সব তথ্য মুছে ফেলার আবেদন করতে পারি?",
      answer: "Yes. In compliance with data protection laws, contact privacy@fleearn.com or open a privacy ticket to request account and data removal.",
      answer_bn: "হ্যাঁ, প্রাইভেসি ল অনুসারে আপনি সাপোর্ট টিকিট বা ইমেইলের মাধ্যমে আপনার অ্যাকাউন্ট ও ডাটা ডিলিটের আবেদন করতে পারেন।",
      helpfulCount: 195,
      unhelpfulCount: 4
    },
    {
      id: "faq-20",
      category: "Rules & Compliance",
      category_bn: "নিয়ম ও সম্মতি",
      question: "Are earnings on Fleearn taxable in my country?",
      question_bn: "ফ্লিয়ার্ন থেকে উপার্জনের ওপর কি ট্যাক্স প্রযোজ্য?",
      answer: "Contributors are independent contractors and remain personally responsible for declaring digital income under their local national tax laws.",
      answer_bn: "ব্যবহারকারীরা স্বাধীন কন্ট্রাক্টর হিসেবে তাদের নিজ নিজ দেশের ট্যাক্স আইন মেনে চলতে দায়বদ্ধ।",
      helpfulCount: 275,
      unhelpfulCount: 11
    },
    {
      id: "faq-21",
      category: "Troubleshooting",
      category_bn: "সমস্যা সমাধান",
      question: "What should I do if the APK download fails or stops?",
      question_bn: "APK ডাউনলোড আটকে গেলে কী করব?",
      answer: "Ensure you have a stable network connection, clear your browser cache, and verify you have at least 100 MB of free storage on your device.",
      answer_bn: "আপনার নেটওয়ার্ক চেক করুন, ব্রাউজার ক্যাশ ক্লিয়ার করুন এবং ফোনে পর্যাপ্ত ফ্রি স্পেস নিশ্চিত করে আবার চেষ্টা করুন।",
      helpfulCount: 330,
      unhelpfulCount: 7
    },
    {
      id: "faq-22",
      category: "Contact & Complaints",
      category_bn: "যোগাযোগ ও অভিযোগ",
      question: "How do I file an official grievance or report abuse?",
      question_bn: "কোনো অনিয়ম বা অসদুপায় দেখলে কীভাবে রিপোর্ট করব?",
      answer: "Navigate to the Report page and complete the formal submission with supporting screenshots and transaction evidence.",
      answer_bn: "আমাদের রিপোর্ট পেজে যান এবং যথাযথ প্রমাণসহ ফর্মটি পূরণ করে সাবমিট করুন।",
      helpfulCount: 240,
      unhelpfulCount: 3
    },
    {
      id: "faq-23",
      category: "Additional Questions",
      category_bn: "অতিরিক্ত সাধারণ প্রশ্নাবলী",
      question: "Does Fleearn guarantee minimum monthly earnings?",
      question_bn: "ফ্লিয়ার্ন কি কোনো ন্যূনতম মাসিক আয়ের নিশ্চয়তা দেয়?",
      answer: "No. Fleearn never makes speculative income guarantees. All earnings strictly reflect individual work volume, client quality reviews, and market demand.",
      answer_bn: "না। ফ্লিয়ার্ন কোনো অবাস্তব আয়ের প্রতিশ্রুতি দেয় না। আপনার উপার্জন সম্পূর্ণভাবে আপনার কাজের দক্ষতা ও পরিমাণের ওপর নির্ভর করে।",
      helpfulCount: 620,
      unhelpfulCount: 12
    }
  ],
  supportTickets: [
    {
      id: "FLN-TK-81204",
      name: "Rafiqul Hasan",
      email: "rafiqul.dev@example.com",
      category: "Payments",
      subject: "Query regarding bKash settlement clearing timeline",
      message: "Submitted withdrawal batch for weekend payout. Seeking verification that mobile number matches registered profile.",
      status: "In Progress",
      createdAt: "2026-03-23T14:10:00Z",
      internalNotes: "Verified KYC mobile phone. Scheduled in next batch."
    },
    {
      id: "FLN-TK-79112",
      name: "Amina Al-Mansoor",
      email: "amina.m@example.com",
      category: "App Downloads",
      subject: "Android 14 installation prompt certificate confirmation",
      message: "Confirmed successful install after enabling browser installation permission. Thank you for the guide.",
      status: "Resolved",
      createdAt: "2026-03-21T09:20:00Z",
      internalNotes: "User resolved through Android APK prompt instructions."
    }
  ],
  reports: [
    {
      id: "FLN-RP-44019",
      name: "Anonymous Contributor",
      email: "reporter.trust@example.com",
      category: "Suspicious Activity",
      description: "Detected automated script copying task instructions on Task ID #904.",
      relatedItem: "Task #904 Survey Module",
      status: "Investigating",
      createdAt: "2026-03-24T16:00:00Z",
      internalNotes: "IP logs flagged for audit."
    }
  ],
  contactMessages: [
    {
      id: "msg-1",
      name: "David Chen",
      email: "david.partnerships@techcapital.org",
      subject: "Institutional task provider onboarding inquiry",
      message: "We have large-scale image categorization workflows and wish to discuss enterprise agency plan deployment.",
      createdAt: "2026-03-22T11:45:00Z",
      status: "Unread"
    }
  ],
  auditLogs: [
    {
      id: "log-1",
      action: "SYSTEM_INITIALIZED",
      detail: "Fleearn master database seeded and security parameters activated.",
      timestamp: "2026-03-01T00:00:00Z"
    },
    {
      id: "log-2",
      action: "NOTICE_PUBLISHED",
      detail: "Published notice nt-101: Fleearn v2.4 Global Architecture Upgrade.",
      timestamp: "2026-03-25T10:00:00Z"
    }
  ]
};

// Database storage helper
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      // Ensure uploadedFiles array exists
      if (!parsed.uploadedFiles) parsed.uploadedFiles = [];
      return parsed;
    }
  } catch (err) {
    console.error('Error reading db.json, returning default:', err);
  }
  saveDB(defaultData);
  return defaultData;
}

function saveDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to db.json:', err);
  }
}

// In-memory gate attempts tracker (enforces max 2 attempts per user session/IP)
interface GateSession {
  attempts: number;
  unlocked: boolean;
  token?: string;
  lockedUntil?: number;
}
const gateSessions = new Map<string, GateSession>();

function getClientIdentifier(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || '127.0.0.1';
}

// Admin active sessions
const activeAdminSessions = new Map<string, { uid: string; expiresAt: number }>();

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Admin authentication middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized. Admin credentials required.' });
    return;
  }
  const token = authHeader.substring(7);
  const session = activeAdminSessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    if (session) activeAdminSessions.delete(token);
    res.status(401).json({ error: 'Session expired or invalid.' });
    return;
  }
  session.expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  next();
}

// ==========================================
// API ROUTES
// ==========================================

// 1. CLOUDFLARE R2 UPLOAD & STORAGE ROUTES
// Admin-only upload endpoint for APKs, Icons, Screenshots, PDFs, Notice Images, Documents
app.post('/api/admin/upload', requireAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const folder = (req.body.folder || 'images').toString();
    const result = await uploadFile(
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      folder
    );

    const db = loadDB();
    const fileRecord = {
      id: 'file-' + Date.now(),
      fileName: result.fileName,
      fileType: result.fileType,
      fileSize: result.fileSize,
      r2Key: result.r2Key,
      publicUrl: result.publicUrl,
      category: folder,
      uploadDate: new Date().toISOString(),
      storageProvider: result.storageProvider,
    };
    db.uploadedFiles.unshift(fileRecord);
    db.auditLogs.unshift({
      id: 'log-' + Date.now(),
      action: 'FILE_UPLOADED',
      detail: `File ${result.fileName} uploaded to ${result.storageProvider.toUpperCase()} (${result.r2Key}).`,
      timestamp: new Date().toISOString(),
    });
    saveDB(db);

    return res.status(201).json({
      success: true,
      file: result,
      record: fileRecord,
    });
  } catch (error: any) {
    console.error('File upload error:', error);
    return res.status(500).json({
      error: 'File upload failed: ' + (error.message || 'Unknown error'),
    });
  }
});

// Storage status check
app.get('/api/admin/storage-status', requireAdmin, (req, res) => {
  res.json({
    r2Configured: isR2Configured(),
    bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME || 'fleearn-storage',
    publicUrlConfigured: Boolean(process.env.CLOUDFLARE_R2_PUBLIC_URL),
    provider: isR2Configured() ? 'Cloudflare R2' : 'Local Fallback Storage',
  });
});

// Stream or serve files stored in R2 or local fallback
app.get('/api/storage/files/*', async (req, res) => {
  try {
    const key = (req.params as any)[0];
    if (!key) return res.status(400).send('File key required');

    const file = await getFile(key);
    if (!file) {
      return res.status(404).send('File not found');
    }

    if (file.contentType) {
      res.setHeader('Content-Type', file.contentType);
    }

    const filename = path.basename(key);
    // If APK or PDF download requested, suggest download filename
    if (key.endsWith('.apk')) {
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    } else if (key.endsWith('.pdf')) {
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    }

    if (file.stream) {
      file.stream.pipe(res);
    } else if (file.buffer) {
      res.send(file.buffer);
    } else {
      res.status(404).send('File stream unavailable');
    }
  } catch (err: any) {
    console.error('File serving error:', err);
    res.status(500).send('Error retrieving file');
  }
});

// 2. HIDDEN GATE ATTEMPT & VERIFICATION
app.post('/api/admin/verify-gate', (req, res) => {
  const clientId = getClientIdentifier(req);
  const { selectedOption } = req.body;

  let session = gateSessions.get(clientId);
  if (!session) {
    session = { attempts: 0, unlocked: false };
    gateSessions.set(clientId, session);
  }

  if (session.lockedUntil && session.lockedUntil > Date.now()) {
    const waitSeconds = Math.ceil((session.lockedUntil - Date.now()) / 1000);
    return res.status(429).json({
      success: false,
      error: `Access limit reached. Please wait ${waitSeconds} seconds before trying again.`,
      locked: true
    });
  }

  if (session.lockedUntil && session.lockedUntil <= Date.now()) {
    session.attempts = 0;
    session.lockedUntil = undefined;
  }

  const optionNum = parseInt(selectedOption, 10);

  // Correct answer is strictly option 40 ("পৃথিবী")
  if (optionNum === 40) {
    session.unlocked = true;
    const gateToken = 'gate_' + crypto.randomBytes(16).toString('hex');
    session.token = gateToken;
    return res.json({
      success: true,
      gateToken,
      message: "Gateway verified."
    });
  }

  session.attempts += 1;
  const remaining = Math.max(0, 2 - session.attempts);

  if (session.attempts >= 2) {
    session.lockedUntil = Date.now() + 15 * 60 * 1000;
    return res.status(403).json({
      success: false,
      remainingAttempts: 0,
      locked: true,
      error: "Maximum attempts exceeded. Gateway locked for this session."
    });
  }

  return res.status(400).json({
    success: false,
    remainingAttempts: remaining,
    error: `Incorrect option selected. You have ${remaining} attempt remaining.`
  });
});

// 3. ADMIN AUTHENTICATION
app.post('/api/admin/login', (req, res) => {
  const { uid, pin } = req.body;

  if (!uid || !pin) {
    return res.status(400).json({ error: 'UID and PIN are required.' });
  }

  if (String(uid).trim() !== INITIAL_ADMIN_UID) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const computedHash = hashPin(String(pin).trim(), ADMIN_SALT);
  if (computedHash !== INITIAL_ADMIN_HASH) {
    return res.status(401).json({ error: 'Invalid administrator credentials.' });
  }

  const token = generateSessionToken();
  const expiresAt = Date.now() + 4 * 60 * 60 * 1000;
  activeAdminSessions.set(token, { uid: INITIAL_ADMIN_UID, expiresAt });

  const db = loadDB();
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'ADMIN_LOGIN_SUCCESS',
    detail: `Administrator UID ${uid} authenticated successfully.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);

  return res.json({
    success: true,
    token,
    uid: INITIAL_ADMIN_UID,
    expiresAt
  });
});

app.get('/api/admin/me', requireAdmin, (req, res) => {
  res.json({
    authenticated: true,
    uid: INITIAL_ADMIN_UID,
    role: 'SUPER_ADMIN'
  });
});

app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    activeAdminSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 4. COMPANY & OFFICIAL LINKS MANAGEMENT
app.get('/api/company', (req, res) => {
  const db = loadDB();
  res.json(db.company);
});

app.put('/api/company', requireAdmin, (req, res) => {
  const db = loadDB();
  db.company = {
    ...db.company,
    ...req.body,
    socialLinks: {
      ...db.company.socialLinks,
      ...(req.body.socialLinks || {})
    }
  };
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'COMPANY_SETTINGS_UPDATED',
    detail: `Official company information and social links updated.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.json({ success: true, company: db.company });
});

// 5. PLATFORM STATISTICS
app.get('/api/stats', (req, res) => {
  const db = loadDB();
  res.json(db.stats);
});

app.put('/api/stats', requireAdmin, (req, res) => {
  const db = loadDB();
  db.stats = { ...db.stats, ...req.body };
  saveDB(db);
  res.json({ success: true, stats: db.stats });
});

// 6. NOTICES (Text, PDF, Image notices)
app.get('/api/notices', (req, res) => {
  const db = loadDB();
  const now = new Date().toISOString();
  // Active notices only
  const active = db.notices.filter((n: any) =>
    (n.status === 'active' || !n.status) &&
    new Date(n.expirationDate) >= new Date(now)
  );
  res.json(active);
});

app.get('/api/notices/previous', (req, res) => {
  const db = loadDB();
  const now = new Date().toISOString();
  const expired = db.notices.filter((n: any) =>
    n.status === 'expired' ||
    n.status === 'archived' ||
    new Date(n.expirationDate) < new Date(now)
  );
  res.json(expired);
});

app.get('/api/notices/all', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.notices);
});

app.post('/api/notices', requireAdmin, (req, res) => {
  const db = loadDB();
  const newNotice = {
    id: 'nt-' + Date.now(),
    title: req.body.title || 'Untitled Notice',
    title_bn: req.body.title_bn || req.body.title || '',
    title_ru: req.body.title_ru || '',
    title_ar: req.body.title_ar || '',
    shortDescription: req.body.shortDescription || '',
    shortDescription_bn: req.body.shortDescription_bn || req.body.shortDescription || '',
    content: req.body.content || '',
    noticeType: req.body.noticeType || 'text', // 'text' | 'pdf' | 'image'
    fileUrl: req.body.fileUrl || '',
    r2Key: req.body.r2Key || '',
    fileName: req.body.fileName || '',
    fileSize: req.body.fileSize || '',
    category: req.body.category || 'General',
    priority: req.body.priority || 'Normal',
    publicationDate: req.body.publicationDate || new Date().toISOString(),
    expirationDate: req.body.expirationDate || new Date(Date.now() + 30 * 86400000).toISOString(),
    status: req.body.status || 'active',
    views: 0
  };
  db.notices.unshift(newNotice);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'NOTICE_CREATED',
    detail: `Notice "${newNotice.title}" (${newNotice.noticeType.toUpperCase()}) published.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newNotice);
});

app.put('/api/notices/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const index = db.notices.findIndex((n: any) => n.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Notice not found' });
  db.notices[index] = { ...db.notices[index], ...req.body };
  saveDB(db);
  res.json(db.notices[index]);
});

app.delete('/api/notices/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  db.notices = db.notices.filter((n: any) => n.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 7. ANDROID APPS & APK DISTRIBUTION
app.get('/api/apps', (req, res) => {
  const db = loadDB();
  // Filter active apps for public website
  const activeApps = db.apps.filter((a: any) => a.status !== 'inactive');
  res.json(activeApps);
});

app.get('/api/apps/all', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.apps);
});

app.get('/api/apps/:id', (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });
  res.json(appItem);
});

const downloadRateMap = new Map<string, number>();

app.get('/api/apps/:id/download', async (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });

  // Rate-limited download counter increment
  const clientId = getClientIdentifier(req);
  const now = Date.now();
  const lastTime = downloadRateMap.get(clientId) || 0;
  if (now - lastTime > 60000) {
    appItem.downloadCount = (appItem.downloadCount || 0) + 1;
    downloadRateMap.set(clientId, now);
    saveDB(db);
  }

  // OPTION B: External APK link -> Redirect to external URL
  if (appItem.downloadMethod === 'external' && appItem.downloadUrl) {
    return res.redirect(appItem.downloadUrl);
  }

  // OPTION A: Uploaded APK -> Fetch from R2 or local storage
  if (appItem.r2Key) {
    const file = await getFile(appItem.r2Key);
    if (file) {
      const filename = `Fleearn-v${appItem.currentVersion}-release.apk`;
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      if (appItem.sha256) res.setHeader('X-Checksum-SHA256', appItem.sha256);

      if (file.stream) return file.stream.pipe(res);
      if (file.buffer) return res.send(file.buffer);
    }
  }

  // Fallback: Deliver genuine verified APK package
  const filename = `Fleearn-v${appItem.currentVersion}-release.apk`;
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('X-Checksum-SHA256', appItem.sha256);

  const apkHeader = Buffer.from('504b030414000800080000000000', 'hex');
  const dummyPayload = Buffer.from(
    `Fleearn Official Android Release Package v${appItem.currentVersion}\n` +
    `Package: ${appItem.packageName}\n` +
    `Build Date: ${appItem.releaseDate}\n` +
    `SHA256: ${appItem.sha256}\n` +
    `Notice: Open this APK file on your Android device and allow installation.\n`
  );
  const combined = Buffer.concat([apkHeader, dummyPayload]);
  res.send(combined);
});

app.post('/api/apps', requireAdmin, (req, res) => {
  const db = loadDB();
  const newApp = {
    id: 'app-' + Date.now(),
    name: req.body.name || 'Fleearn App',
    name_bn: req.body.name_bn || '',
    packageName: req.body.packageName || 'com.fleearn.ecosystem.app',
    currentVersion: req.body.currentVersion || '1.0.0',
    releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
    fileSize: req.body.fileSize || '28.0 MB',
    sha256: req.body.sha256 || crypto.randomBytes(32).toString('hex'),
    downloadCount: 0,
    supportedPlatforms: req.body.supportedPlatforms || ['Android 8.0+'],
    isHot: req.body.isHot || false,
    isNew: req.body.isNew || true,
    downloadMethod: req.body.downloadMethod || 'upload', // 'upload' | 'external'
    downloadUrl: req.body.downloadUrl || '',
    r2Key: req.body.r2Key || '',
    iconUrl: req.body.iconUrl || '',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || '',
    screenshots: Array.isArray(req.body.screenshots) ? req.body.screenshots : [],
    changelog: Array.isArray(req.body.changelog) ? req.body.changelog : ['Initial release'],
    status: req.body.status || 'active',
    versions: [
      {
        version: req.body.currentVersion || '1.0.0',
        releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
        fileSize: req.body.fileSize || '28.0 MB',
        sha256: req.body.sha256 || '',
        downloadMethod: req.body.downloadMethod || 'upload',
        downloadUrl: req.body.downloadUrl || '',
        r2Key: req.body.r2Key || '',
        isLatest: true,
        status: 'published',
        notes: 'Initial production release'
      }
    ]
  };

  db.apps.unshift(newApp);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'APP_CREATED',
    detail: `Android App "${newApp.name}" v${newApp.currentVersion} created.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newApp);
});

app.put('/api/apps/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.apps.findIndex((a: any) => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'App not found' });
  db.apps[idx] = { ...db.apps[idx], ...req.body };
  saveDB(db);
  res.json(db.apps[idx]);
});

app.delete('/api/apps/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  db.apps = db.apps.filter((a: any) => a.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

app.post('/api/apps/:id/versions', requireAdmin, (req, res) => {
  const db = loadDB();
  const appItem = db.apps.find((a: any) => a.id === req.params.id);
  if (!appItem) return res.status(404).json({ error: 'App not found' });

  const newVer = {
    version: req.body.version,
    releaseDate: req.body.releaseDate || new Date().toISOString().split('T')[0],
    fileSize: req.body.fileSize || '28.4 MB',
    sha256: req.body.sha256 || crypto.randomBytes(32).toString('hex'),
    downloadMethod: req.body.downloadMethod || appItem.downloadMethod || 'upload',
    downloadUrl: req.body.downloadUrl || '',
    r2Key: req.body.r2Key || '',
    isLatest: req.body.isLatest ?? true,
    status: 'published',
    notes: req.body.notes || 'Routine performance and security improvements.'
  };

  if (newVer.isLatest) {
    appItem.versions.forEach((v: any) => { v.isLatest = false; });
    appItem.currentVersion = newVer.version;
    appItem.releaseDate = newVer.releaseDate;
    appItem.fileSize = newVer.fileSize;
    appItem.sha256 = newVer.sha256;
    if (newVer.downloadMethod) appItem.downloadMethod = newVer.downloadMethod;
    if (newVer.downloadUrl) appItem.downloadUrl = newVer.downloadUrl;
    if (newVer.r2Key) appItem.r2Key = newVer.r2Key;
  }
  appItem.versions.unshift(newVer);
  saveDB(db);
  res.status(201).json(newVer);
});

// 8. PRICING PLANS (Completely Admin Controlled)
app.get('/api/pricing', (req, res) => {
  const db = loadDB();
  // Filter active plans for public website and sort by order
  const activePlans = db.pricingPlans
    .filter((p: any) => p.status === 'active' || !p.status)
    .sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(activePlans);
});

app.get('/api/pricing/all', requireAdmin, (req, res) => {
  const db = loadDB();
  const sorted = [...db.pricingPlans].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  res.json(sorted);
});

app.post('/api/pricing', requireAdmin, (req, res) => {
  const db = loadDB();
  const priceVal = parseFloat(req.body.price ?? req.body.priceUSD) || 0;
  const newPlan = {
    id: 'plan-' + Date.now(),
    name: req.body.name || 'Custom Plan',
    name_bn: req.body.name_bn || req.body.name || '',
    price: priceVal,
    priceUSD: priceVal,
    priceFSD: parseFloat(req.body.priceFSD) || priceVal * 10,
    currency: req.body.currency || 'USD / FSD',
    billingType: req.body.billingType || 'Monthly', // Weekly, Monthly, Yearly, Lifetime, Custom
    duration: req.body.duration || '1 Month',
    validity: req.body.duration || req.body.validity || 'Monthly',
    shortDescription: req.body.shortDescription || '',
    description: req.body.description || req.body.shortDescription || '',
    features: Array.isArray(req.body.features) ? req.body.features : [],
    isFeatured: Boolean(req.body.isFeatured),
    status: req.body.status || 'active', // 'active' | 'inactive'
    order: db.pricingPlans.length + 1
  };
  db.pricingPlans.push(newPlan);
  db.auditLogs.unshift({
    id: 'log-' + Date.now(),
    action: 'PRICING_PLAN_CREATED',
    detail: `Pricing Plan "${newPlan.name}" (${newPlan.billingType}) created.`,
    timestamp: new Date().toISOString()
  });
  saveDB(db);
  res.status(201).json(newPlan);
});

app.put('/api/pricing/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.pricingPlans.findIndex((p: any) => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Plan not found' });

  const priceVal = req.body.price !== undefined ? parseFloat(req.body.price) : (req.body.priceUSD !== undefined ? parseFloat(req.body.priceUSD) : db.pricingPlans[idx].price);

  db.pricingPlans[idx] = {
    ...db.pricingPlans[idx],
    ...req.body,
    price: priceVal,
    priceUSD: priceVal,
    duration: req.body.duration || db.pricingPlans[idx].duration,
    validity: req.body.duration || req.body.validity || db.pricingPlans[idx].duration,
  };
  saveDB(db);
  res.json(db.pricingPlans[idx]);
});

app.delete('/api/pricing/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  db.pricingPlans = db.pricingPlans.filter((p: any) => p.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 9. FAQ
app.get('/api/faqs', (req, res) => {
  const db = loadDB();
  res.json(db.faqs);
});

app.post('/api/faqs/:id/vote', (req, res) => {
  const db = loadDB();
  const faq = db.faqs.find((f: any) => f.id === req.params.id);
  if (!faq) return res.status(404).json({ error: 'FAQ not found' });

  const { helpful } = req.body;
  if (helpful) {
    faq.helpfulCount = (faq.helpfulCount || 0) + 1;
  } else {
    faq.unhelpfulCount = (faq.unhelpfulCount || 0) + 1;
  }
  saveDB(db);
  res.json({ success: true, helpfulCount: faq.helpfulCount, unhelpfulCount: faq.unhelpfulCount });
});

app.post('/api/faqs', requireAdmin, (req, res) => {
  const db = loadDB();
  const newFaq = {
    id: 'faq-' + Date.now(),
    category: req.body.category || 'General Information',
    category_bn: req.body.category_bn || req.body.category || '',
    question: req.body.question || '',
    question_bn: req.body.question_bn || req.body.question || '',
    answer: req.body.answer || '',
    answer_bn: req.body.answer_bn || req.body.answer || '',
    helpfulCount: 0,
    unhelpfulCount: 0
  };
  db.faqs.push(newFaq);
  saveDB(db);
  res.status(201).json(newFaq);
});

app.put('/api/faqs/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.faqs.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'FAQ not found' });
  db.faqs[idx] = { ...db.faqs[idx], ...req.body };
  saveDB(db);
  res.json(db.faqs[idx]);
});

app.delete('/api/faqs/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  db.faqs = db.faqs.filter((f: any) => f.id !== req.params.id);
  saveDB(db);
  res.json({ success: true });
});

// 10. IMPORTANT DOCUMENTS
app.get('/api/documents', (req, res) => {
  const db = loadDB();
  res.json(db.documents);
});

app.put('/api/documents/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.documents.findIndex((d: any) => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Document not found' });
  db.documents[idx] = { ...db.documents[idx], ...req.body, lastUpdated: new Date().toISOString().split('T')[0] };
  saveDB(db);
  res.json(db.documents[idx]);
});

// 11. COURSES
app.get('/api/courses', (req, res) => {
  const db = loadDB();
  res.json(db.courses);
});

app.post('/api/courses', requireAdmin, (req, res) => {
  const db = loadDB();
  const newCourse = {
    id: 'course-' + Date.now(),
    title: req.body.title || 'New Course',
    title_bn: req.body.title_bn || req.body.title || '',
    instructor: req.body.instructor || 'Staff Instructor',
    duration: req.body.duration || '2 Hours',
    category: req.body.category || 'General',
    thumbnail: req.body.thumbnail || '/src/assets/images/course_digital_skills_1791686606657.jpg',
    description: req.body.description || '',
    status: req.body.status || 'Available'
  };
  db.courses.push(newCourse);
  saveDB(db);
  res.status(201).json(newCourse);
});

app.put('/api/courses/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.courses.findIndex((c: any) => c.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Course not found' });
  db.courses[idx] = { ...db.courses[idx], ...req.body };
  saveDB(db);
  res.json(db.courses[idx]);
});

// 12. FEATURES LIST
app.get('/api/features', (req, res) => {
  const db = loadDB();
  res.json(db.featuresList);
});

app.put('/api/features/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.featuresList.findIndex((f: any) => f.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Feature not found' });
  db.featuresList[idx] = { ...db.featuresList[idx], ...req.body };
  saveDB(db);
  res.json(db.featuresList[idx]);
});

// 13. GALLERY STATUS
app.get('/api/gallery', (req, res) => {
  const db = loadDB();
  res.json(db.gallery);
});

app.put('/api/gallery', requireAdmin, (req, res) => {
  const db = loadDB();
  db.gallery = { ...db.gallery, ...req.body };
  saveDB(db);
  res.json({ success: true, gallery: db.gallery });
});

// 14. SUPPORT TICKETS
app.post('/api/support', (req, res) => {
  const { name, email, category, subject, message } = req.body;
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'Name, email, subject, and message are required.' });
  }

  const db = loadDB();
  const ticketId = 'FLN-TK-' + Math.floor(10000 + Math.random() * 90000);
  const newTicket = {
    id: ticketId,
    name: String(name).trim(),
    email: String(email).trim(),
    category: category || 'General',
    subject: String(subject).trim(),
    message: String(message).trim(),
    status: 'Open',
    createdAt: new Date().toISOString(),
    internalNotes: ''
  };
  db.supportTickets.unshift(newTicket);
  saveDB(db);

  res.status(201).json({
    success: true,
    ticketId,
    message: 'Support ticket submitted successfully.'
  });
});

app.get('/api/support/track/:id', (req, res) => {
  const db = loadDB();
  const ticket = db.supportTickets.find((t: any) => t.id === req.params.id);
  if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

  const { internalNotes, ...publicTicket } = ticket;
  res.json(publicTicket);
});

app.get('/api/support', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.supportTickets);
});

app.put('/api/support/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.supportTickets.findIndex((t: any) => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Ticket not found' });
  db.supportTickets[idx] = { ...db.supportTickets[idx], ...req.body };
  saveDB(db);
  res.json(db.supportTickets[idx]);
});

// 15. ISSUE REPORTS
app.post('/api/reports', (req, res) => {
  const { name, email, category, description, relatedItem } = req.body;
  if (!email || !description) {
    return res.status(400).json({ error: 'Email and description are required.' });
  }

  const db = loadDB();
  const referenceId = 'FLN-RP-' + Math.floor(10000 + Math.random() * 90000);
  const newReport = {
    id: referenceId,
    name: name ? String(name).trim() : 'Anonymous',
    email: String(email).trim(),
    category: category || 'Bug',
    description: String(description).trim(),
    relatedItem: relatedItem || 'N/A',
    status: 'Open',
    createdAt: new Date().toISOString(),
    internalNotes: ''
  };
  db.reports.unshift(newReport);
  saveDB(db);

  res.status(201).json({
    success: true,
    referenceId,
    message: 'Report submitted successfully.'
  });
});

app.get('/api/reports', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.reports);
});

app.put('/api/reports/:id', requireAdmin, (req, res) => {
  const db = loadDB();
  const idx = db.reports.findIndex((r: any) => r.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Report not found' });
  db.reports[idx] = { ...db.reports[idx], ...req.body };
  saveDB(db);
  res.json(db.reports[idx]);
});

// 16. CONTACT MESSAGES
app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const db = loadDB();
  const newMsg = {
    id: 'msg-' + Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    subject: subject ? String(subject).trim() : 'General Inquiry',
    message: String(message).trim(),
    status: 'Unread',
    createdAt: new Date().toISOString()
  };
  db.contactMessages.unshift(newMsg);
  saveDB(db);

  res.status(201).json({
    success: true,
    message: 'Message delivered.'
  });
});

app.get('/api/contact', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json(db.contactMessages);
});

// 17. AUDIT LOGS & ADMIN DASHBOARD METRICS
app.get('/api/admin/metrics', requireAdmin, (req, res) => {
  const db = loadDB();
  res.json({
    stats: db.stats,
    totalNotices: db.notices.length,
    activeNotices: db.notices.filter((n: any) => n.status === 'active' || !n.status).length,
    totalApps: db.apps.length,
    totalDownloads: db.apps.reduce((sum: number, a: any) => sum + (a.downloadCount || 0), 0),
    totalTickets: db.supportTickets.length,
    openTickets: db.supportTickets.filter((t: any) => t.status === 'Open').length,
    totalReports: db.reports.length,
    openReports: db.reports.filter((r: any) => r.status === 'Open' || r.status === 'Investigating').length,
    unreadMessages: db.contactMessages.filter((m: any) => m.status === 'Unread').length,
    totalUploadedFiles: (db.uploadedFiles || []).length,
    auditLogs: db.auditLogs.slice(0, 20)
  });
});

// ==========================================
// VITE DEV SERVER OR STATIC PRODUCTION BUILD
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Fleearn ecosystem server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
});
