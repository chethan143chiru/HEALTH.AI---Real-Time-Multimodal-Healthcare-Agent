import { AdminUserRecord, SystemServiceHealth, AuditLogEntry, BroadcastAnnouncement, SystemBackupRecord, RolePermissionMatrix } from '../types/admin';

export const MOCK_ADMIN_USERS: AdminUserRecord[] = [
  {
    id: 'usr-admin-001',
    name: 'Dr. Sarah Connor',
    email: 'admin@health.ai',
    phone: '+1 (555) 019-2831',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150',
    role: 'super_admin',
    status: 'active',
    isVerified: true,
    registrationDate: '2024-01-15T08:30:00Z',
    lastLogin: '2026-08-04T07:12:00Z',
    lastActiveTime: 'Just now',
    age: 38,
    gender: 'Female',
    bloodGroup: 'O+',
    heightCm: 168,
    weightKg: 62,
    bmi: 22.0,
    healthScore: 96,
    predictionsCount: 14,
    reportsCount: 12,
    conversationsCount: 45,
    address: '100 Medical Center Way, Boston, MA',
    emergencyContact: 'John Connor (+1 555-019-9999)',
    allergies: ['Penicillin'],
    chronicConditions: ['None'],
    activeDevices: [
      { id: 'dev-1', device: 'MacBook Pro 16"', browser: 'Chrome 127.0', os: 'macOS Sonoma', ip: '192.168.1.45', lastActive: 'Just now', isCurrent: true }
    ]
  },
  {
    id: 'usr-002',
    name: 'Michael Vance',
    email: 'user@health.ai',
    phone: '+1 (555) 234-5678',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'user',
    status: 'active',
    isVerified: true,
    registrationDate: '2024-02-10T11:20:00Z',
    lastLogin: '2026-08-04T06:45:00Z',
    lastActiveTime: '30 mins ago',
    age: 32,
    gender: 'Male',
    bloodGroup: 'A+',
    heightCm: 175,
    weightKg: 74,
    bmi: 24.2,
    healthScore: 89,
    predictionsCount: 8,
    reportsCount: 6,
    conversationsCount: 18,
    address: '452 Park Avenue, New York, NY',
    emergencyContact: 'Emily Vance (+1 555-234-9999)',
    allergies: ['Dust Mites', 'Peanuts'],
    chronicConditions: ['Mild Asthma'],
    activeDevices: [
      { id: 'dev-3', device: 'Dell XPS 15', browser: 'Edge 126.0', os: 'Windows 11', ip: '192.168.1.88', lastActive: '30 mins ago', isCurrent: false }
    ]
  }
];

export const MOCK_SYSTEM_HEALTH: SystemServiceHealth[] = [
  { id: 's1', name: 'Firestore Database', category: 'database', status: 'online', responseTimeMs: 14, healthPercent: 100, lastChecked: 'Just now', message: 'Read/Write latency < 15ms' },
  { id: 's2', name: 'Firebase Auth Service', category: 'auth', status: 'online', responseTimeMs: 22, healthPercent: 100, lastChecked: 'Just now', message: 'Token verification active' },
  { id: 's3', name: 'Cloud File Storage', category: 'storage', status: 'online', responseTimeMs: 38, healthPercent: 99, lastChecked: 'Just now', message: '24.2 GB used of 500 GB' },
  { id: 's4', name: 'Gemini 2.5 Flash Disease Engine', category: 'ai_engine', status: 'online', responseTimeMs: 410, healthPercent: 99.8, lastChecked: 'Just now', message: 'Symptoms analyzer active (500+ conditions)' },
  { id: 's5', name: 'Prescription OCR Engine', category: 'ocr', status: 'online', responseTimeMs: 620, healthPercent: 98.5, lastChecked: 'Just now', message: 'Tesseract & Gemini Vision fallback ready' },
  { id: 's6', name: 'Medical Radiology AI Engine', category: 'image_ai', status: 'online', responseTimeMs: 780, healthPercent: 99.1, lastChecked: 'Just now', message: 'X-Ray, MRI, CT scan analyzer operational' },
  { id: 's7', name: 'Live Camera Detection Engine', category: 'live_camera', status: 'online', responseTimeMs: 320, healthPercent: 99.4, lastChecked: 'Just now', message: 'Skin lesion & eye exam computer vision active' },
  { id: 's8', name: 'In-App & Push Notification Gateway', category: 'notifications', status: 'online', responseTimeMs: 18, healthPercent: 100, lastChecked: 'Just now', message: 'Broadcast channel operational' },
  { id: 's9', name: 'PDF Medical Report Generator', category: 'pdf_service', status: 'online', responseTimeMs: 150, healthPercent: 100, lastChecked: 'Just now', message: 'jsPDF rendering engine ready' },
  { id: 's10', name: 'Node / Express Gateway API', category: 'api', status: 'online', responseTimeMs: 8, healthPercent: 100, lastChecked: 'Just now', message: 'Port 3000 SSL Proxy Active' }
];

export const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  { id: 'aud-101', timestamp: '2026-08-04T07:12:30Z', adminEmail: 'admin@health.ai', adminName: 'Dr. Sarah Connor', adminRole: 'super_admin', action: 'SUPER_ADMIN_LOGIN', module: 'Auth', result: 'success', ipAddress: '192.168.1.45', deviceInfo: 'MacBook Pro 16" (Chrome 127)', details: 'Super Admin logged in via password authentication' },
  { id: 'aud-102', timestamp: '2026-08-04T06:40:12Z', adminEmail: 'admin@health.ai', adminName: 'Dr. Sarah Connor', adminRole: 'super_admin', action: 'VERIFY_USER', targetUserEmail: 'user@health.ai', targetUserId: 'usr-002', module: 'User Management', result: 'success', ipAddress: '192.168.1.45', deviceInfo: 'MacBook Pro 16" (Chrome 127)', details: 'Verified identity documentation for user@health.ai' }
];

export const MOCK_BROADCASTS: BroadcastAnnouncement[] = [
  {
    id: 'brd-001',
    title: 'Seasonal Flu & Respiratory Health Alert 2026',
    message: 'New diagnostic algorithms updated for early flu and viral infection screening. Run a quick symptom scan if experiencing fever or chills.',
    type: 'info',
    targetAudience: 'all',
    author: 'Dr. Sarah Connor (Super Admin)',
    createdAt: '2026-08-01T10:00:00Z',
    isPublished: true,
    deliveryCount: 1240,
    readCount: 980
  },
  {
    id: 'brd-002',
    title: 'Scheduled System Maintenance Notice',
    message: 'The Medical Radiology Image Analysis Engine will undergo routine model optimization on Saturday 02:00 AM UTC. Estimated downtime 15 minutes.',
    type: 'warning',
    targetAudience: 'all',
    author: 'System Operations',
    createdAt: '2026-08-03T15:30:00Z',
    isPublished: true,
    deliveryCount: 1240,
    readCount: 610
  }
];

export const MOCK_BACKUPS: SystemBackupRecord[] = [
  { id: 'bkp-20260803', backupName: 'FULL_BACKUP_2026_08_03_DAILY', createdAt: '2026-08-03T19:00:00Z', createdBy: 'Dr. Sarah Connor', sizeMb: 412.5, type: 'full', status: 'completed' },
  { id: 'bkp-20260727', backupName: 'FULL_BACKUP_2026_07_27_WEEKLY', createdAt: '2026-07-27T00:00:00Z', createdBy: 'Scheduled Auto-Cron', sizeMb: 398.2, type: 'full', status: 'completed' },
  { id: 'bkp-20260720', backupName: 'DB_ONLY_BACKUP_2026_07_20', createdAt: '2026-07-20T12:00:00Z', createdBy: 'Scheduled Auto-Cron', sizeMb: 85.4, type: 'database', status: 'completed' }
];

export const DEFAULT_ROLE_PERMISSIONS: RolePermissionMatrix[] = [
  {
    role: 'super_admin',
    roleName: 'Super Administrator',
    description: 'Unrestricted full platform control, user deletion, configuration, security, audit logs & backups.',
    color: '#ef4444',
    isProtected: true,
    permissions: {
      'view_users': true, 'edit_users': true, 'delete_users': true, 'verify_users': true, 'suspend_users': true, 'lock_users': true,
      'view_reports': true, 'download_reports': true, 'delete_reports': true, 'export_reports': true,
      'view_ai': true, 'configure_ai': true, 'restart_ai': true,
      'view_settings': true, 'manage_settings': true, 'manage_backups': true,
      'view_audit': true, 'view_security': true, 'force_logout': true,
      'create_admin': true, 'delete_admin': true, 'assign_roles': true
    }
  },
  {
    role: 'admin',
    roleName: 'Administrator',
    description: 'Can manage users, review reports, post announcements & inspect analytics. Cannot delete super admins.',
    color: '#f59e0b',
    isProtected: false,
    permissions: {
      'view_users': true, 'edit_users': true, 'delete_users': false, 'verify_users': true, 'suspend_users': true, 'lock_users': true,
      'view_reports': true, 'download_reports': true, 'delete_reports': false, 'export_reports': true,
      'view_ai': true, 'configure_ai': false, 'restart_ai': false,
      'view_settings': true, 'manage_settings': false, 'manage_backups': false,
      'view_audit': true, 'view_security': true, 'force_logout': true,
      'create_admin': false, 'delete_admin': false, 'assign_roles': false
    }
  },
  {
    role: 'moderator',
    roleName: 'Content & Diagnostics Moderator',
    description: 'Reviews predictions, medical reports, patient feedback, and platform broadcasts.',
    color: '#3b82f6',
    isProtected: false,
    permissions: {
      'view_users': true, 'edit_users': false, 'delete_users': false, 'verify_users': true, 'suspend_users': false, 'lock_users': false,
      'view_reports': true, 'download_reports': true, 'delete_reports': false, 'export_reports': true,
      'view_ai': true, 'configure_ai': false, 'restart_ai': false,
      'view_settings': false, 'manage_settings': false, 'manage_backups': false,
      'view_audit': false, 'view_security': false, 'force_logout': false,
      'create_admin': false, 'delete_admin': false, 'assign_roles': false
    }
  },
  {
    role: 'support',
    roleName: 'Support Staff',
    description: 'Helps users recover accounts, unlock passwords, and view diagnosis report history.',
    color: '#10b981',
    isProtected: false,
    permissions: {
      'view_users': true, 'edit_users': false, 'delete_users': false, 'verify_users': true, 'suspend_users': false, 'lock_users': true,
      'view_reports': true, 'download_reports': true, 'delete_reports': false, 'export_reports': false,
      'view_ai': false, 'configure_ai': false, 'restart_ai': false,
      'view_settings': false, 'manage_settings': false, 'manage_backups': false,
      'view_audit': false, 'view_security': false, 'force_logout': true,
      'create_admin': false, 'delete_admin': false, 'assign_roles': false
    }
  },
  {
    role: 'user',
    roleName: 'Standard Patient User',
    description: 'Standard access to AI Disease Prediction, Prescription Analyzer, Radiology Analyzer, Live Camera & Assistant.',
    color: '#64748b',
    isProtected: true,
    permissions: {
      'view_users': false, 'edit_users': false, 'delete_users': false, 'verify_users': false, 'suspend_users': false, 'lock_users': false,
      'view_reports': false, 'download_reports': false, 'delete_reports': false, 'export_reports': false,
      'view_ai': false, 'configure_ai': false, 'restart_ai': false,
      'view_settings': false, 'manage_settings': false, 'manage_backups': false,
      'view_audit': false, 'view_security': false, 'force_logout': false,
      'create_admin': false, 'delete_admin': false, 'assign_roles': false
    }
  }
];

export const MOCK_CHART_USER_GROWTH = [
  { period: 'Jan', users: 340, active: 290 },
  { period: 'Feb', users: 510, active: 430 },
  { period: 'Mar', users: 780, active: 650 },
  { period: 'Apr', users: 950, active: 810 },
  { period: 'May', users: 1120, active: 940 },
  { period: 'Jun', users: 1380, active: 1150 },
  { period: 'Jul', users: 1650, active: 1410 },
  { period: 'Aug', users: 1980, active: 1720 }
];

export const MOCK_CHART_AI_MODULE_USAGE = [
  { module: 'Disease Prediction', count: 4820, avgConfidence: 94.2 },
  { module: 'Prescription OCR', count: 2150, avgConfidence: 91.8 },
  { module: 'Medical Image AI', count: 1890, avgConfidence: 93.5 },
  { module: 'Live Camera Detection', count: 1420, avgConfidence: 92.0 },
  { module: 'AI Health Companion', count: 6800, avgConfidence: 97.4 }
];

export const MOCK_CHART_DISEASE_DISTRIBUTION = [
  { disease: 'Hypertension', count: 410, risk: 'High' },
  { disease: 'Type 2 Diabetes', count: 350, risk: 'High' },
  { disease: 'Upper Respiratory Infection', count: 290, risk: 'Moderate' },
  { disease: 'Migraine / Tension Headache', count: 240, risk: 'Low' },
  { disease: 'Gastritis / GERD', count: 190, risk: 'Low' }
];
