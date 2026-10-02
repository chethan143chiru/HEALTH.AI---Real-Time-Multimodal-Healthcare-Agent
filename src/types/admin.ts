export type AdminRole = 'super_admin' | 'admin' | 'moderator' | 'support' | 'user';

export type UserAccountStatus = 
  | 'active' 
  | 'inactive' 
  | 'verified' 
  | 'unverified' 
  | 'suspended' 
  | 'locked' 
  | 'disabled' 
  | 'deleted';

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  role: AdminRole;
  status: UserAccountStatus;
  isVerified: boolean;
  registrationDate: string;
  lastLogin: string;
  lastActiveTime?: string;
  age?: number;
  gender?: string;
  bloodGroup?: string;
  heightCm?: number;
  weightKg?: number;
  bmi?: number;
  healthScore?: number;
  predictionsCount: number;
  reportsCount: number;
  conversationsCount: number;
  address?: string;
  emergencyContact?: string;
  allergies?: string[];
  chronicConditions?: string[];
  activeDevices?: {
    id: string;
    device: string;
    browser: string;
    os: string;
    ip: string;
    lastActive: string;
    isCurrent: boolean;
  }[];
  suspensionDetails?: {
    reason: string;
    startDate: string;
    endDate?: string;
    suspendedBy: string;
  };
  lockDetails?: {
    reason: string;
    lockedAt: string;
    lockedBy: string;
  };
}

export interface SystemServiceHealth {
  id: string;
  name: string;
  category: 'database' | 'auth' | 'storage' | 'ai_engine' | 'ocr' | 'image_ai' | 'live_camera' | 'notifications' | 'pdf_service' | 'api';
  status: 'online' | 'offline' | 'maintenance' | 'degraded';
  responseTimeMs: number;
  healthPercent: number;
  lastChecked: string;
  message?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  adminEmail: string;
  adminName: string;
  adminRole: string;
  action: string;
  targetUserEmail?: string;
  targetUserId?: string;
  module: string;
  result: 'success' | 'failure' | 'warning';
  ipAddress?: string;
  deviceInfo?: string;
  details: string;
}

export interface BroadcastAnnouncement {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  targetAudience: 'all' | 'verified' | 'unverified' | 'active' | 'inactive' | 'roles';
  targetRoles?: AdminRole[];
  author: string;
  createdAt: string;
  scheduledFor?: string;
  expiresAt?: string;
  isPublished: boolean;
  deliveryCount?: number;
  readCount?: number;
}

export interface SystemBackupRecord {
  id: string;
  backupName: string;
  createdAt: string;
  createdBy: string;
  sizeMb: number;
  type: 'full' | 'database' | 'reports' | 'config';
  status: 'completed' | 'failed' | 'in_progress';
  downloadUrl?: string;
}

export interface PermissionDefinition {
  key: string;
  label: string;
  category: 'User Management' | 'Reports' | 'AI & Analytics' | 'Platform & Settings' | 'Security & Audit' | 'Administration';
  description: string;
}

export interface RolePermissionMatrix {
  role: AdminRole;
  roleName: string;
  description: string;
  color: string;
  isProtected?: boolean;
  permissions: Record<string, boolean>;
}
