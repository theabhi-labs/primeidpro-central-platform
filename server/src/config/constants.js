module.exports = {
  ROLES: {
    SUPER_ADMIN: 'SUPER_ADMIN',
    CSC_OPERATOR: 'CSC_OPERATOR',
    CUSTOMER: 'CUSTOMER'
  },
  USER_STATUS: {
    ACTIVE: 'ACTIVE',
    PENDING_APPROVAL: 'PENDING_APPROVAL',
    SUSPENDED: 'SUSPENDED'
  },
  DEVICE_STATUS: {
    PENDING: 'PENDING',
    ACTIVE: 'ACTIVE',
    REVOKED: 'REVOKED',
    BLOCKED: 'BLOCKED'
  },
  JOB_STATUS: {
    CREATED: 'CREATED',
    PAID: 'PAID',
    DISPATCHED: 'DISPATCHED',
    DOWNLOADING: 'DOWNLOADING',
    PROCESSING: 'PROCESSING',
    READY: 'READY',
    PRINTING: 'PRINTING',
    COMPLETED: 'COMPLETED',
    FAILED: 'FAILED',
    CANCELLED: 'CANCELLED'
  },
  PAYMENT_STATUS: {
    PENDING: 'PENDING',
    PAID: 'PAID',
    REFUNDED: 'REFUNDED',
    FAILED: 'FAILED'
  },
  SERVICE_TYPES: {
    PASSPORT_PHOTO: 'PASSPORT_PHOTO',
    VISA_PHOTO: 'VISA_PHOTO',
    STAMP_PHOTO: 'STAMP_PHOTO',
    PVC_ID_CARD: 'PVC_ID_CARD',
    CERTIFICATE: 'CERTIFICATE',
    CUSTOM_ID: 'CUSTOM_ID'
  },
  PAPER_SIZES: {
    FOUR_BY_SIX: '4x6',
    A4: 'A4',
    SINGLE_CARD: 'SINGLE_CARD'
  },
  LEDGER_TYPES: {
    WALLET_RECHARGE: 'WALLET_RECHARGE',
    JOB_DEBIT: 'JOB_DEBIT',
    JOB_REFUND: 'JOB_REFUND',
    ADMIN_ADJUSTMENT: 'ADMIN_ADJUSTMENT'
  },
  LEDGER_REFERENCE: {
    RAZORPAY: 'RAZORPAY',
    JOB: 'JOB',
    ADMIN: 'ADMIN',
    MANUAL: 'MANUAL'
  },
  STORAGE_TYPES: {
    LOCAL: 'LOCAL',
    S3: 'S3',
    R2: 'R2'
  },
  DEFAULT_TEMPLATES: [
    {
      serviceType: 'PASSPORT_PHOTO',
      name: 'Standard Indian Passport (35x45 mm)',
      description: 'Standard passport photos with white/light background. 8 photos on 4x6 inch paper.',
      dimensionsMm: { width: 35, height: 45 },
      defaultCopies: 8,
      paperSize: '4x6',
      customerPriceInr: 50,
      cscCreditCost: 5,
      aspectRatio: 35 / 45
    },
    {
      serviceType: 'VISA_PHOTO',
      name: 'US / Global Visa (2x2 inch / 51x51 mm)',
      description: 'Square 2x2 inch format for US/Schengen visas. 6 photos on 4x6 inch paper.',
      dimensionsMm: { width: 51, height: 51 },
      defaultCopies: 6,
      paperSize: '4x6',
      customerPriceInr: 70,
      cscCreditCost: 7,
      aspectRatio: 1
    },
    {
      serviceType: 'STAMP_PHOTO',
      name: 'Stamp Size Photo (25x30 mm)',
      description: 'Compact stamp size photo for student forms, hall tickets, and official registers. 16 photos on 4x6.',
      dimensionsMm: { width: 25, height: 30 },
      defaultCopies: 16,
      paperSize: '4x6',
      customerPriceInr: 40,
      cscCreditCost: 4,
      aspectRatio: 25 / 30
    },
    {
      serviceType: 'PVC_ID_CARD',
      name: 'PVC Smart ID Card (CR80 Standard)',
      description: 'CR80 standard 85.6x54 mm PVC card with thermal overlay and crisp color.',
      dimensionsMm: { width: 85.6, height: 54 },
      defaultCopies: 1,
      paperSize: 'SINGLE_CARD',
      customerPriceInr: 80,
      cscCreditCost: 15,
      aspectRatio: 85.6 / 54
    },
    {
      serviceType: 'CERTIFICATE',
      name: 'Document / Certificate Print (A4 Color)',
      description: 'High-definition color document print on premium 100 GSM A4 bond paper.',
      dimensionsMm: { width: 210, height: 297 },
      defaultCopies: 1,
      paperSize: 'A4',
      customerPriceInr: 30,
      cscCreditCost: 3,
      aspectRatio: 210 / 297
    }
  ]
};
