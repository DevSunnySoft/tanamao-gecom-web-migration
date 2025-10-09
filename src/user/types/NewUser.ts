export interface IUser {
  companyId?: string;
  pdvId?: string;
  name: string;
  username: string;
  password: string;
  isActive: boolean;
  isAdmin: boolean;
  isConfirmed: boolean;
  photoUrl?: string;
  cpf?: string;
  isTemporary: boolean;
  phone?: string;
  expireAt?: Date;
  sendWsNotification?: boolean;
  dashboardPushSubscription?: {
    endpoint: string;
    expirationTime: Date;
    keys: {
      p256dh: string;
      auth: string;
    };
  }; // descontinuado
  pushSubscription?: Array<{
    endpoint: string;
    expirationTime: Date;
    keys: {
      p256dh: string;
      auth: string;
    };
  }>;
  addresses?: Array<{
    street: string;
    number: string;
    reference: string;
    complement: string;
    city: any;
    zipCode: string;
    neighborhood: string;
  }>;
  createdAt: Date;
  updatedAt?: Date;
  version?: string;

  // LGPD Compliance Fields
  privacySettings?: {
    allowDataCollection: boolean;
    allowMarketingEmails: boolean;
    allowLocationTracking: boolean;
    dataRetentionPeriod: number; // dias
    consentGivenAt: Date;
    consentUpdatedAt?: Date;
  };
  dataUsageLog?: Array<{
    action: string;
    timestamp: Date;
    purpose: string;
    legalBasis: string;
    ipAddress?: string;
  }>;
  lgpdConsent?: {
    hasGivenConsent: boolean;
    consentDate: Date;
    consentVersion: string;
    ipAddress?: string;
    userAgent?: string;
  };
}