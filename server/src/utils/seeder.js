const User = require('../models/User');
const Center = require('../models/Center');
const CreditWallet = require('../models/CreditWallet');
const CreditPackage = require('../models/CreditPackage');
const PricingRule = require('../models/PricingRule');
const Device = require('../models/Device');
const UpdateRelease = require('../models/UpdateRelease');
const logger = require('./logger');
const crypto = require('crypto');
const { signDeviceToken } = require('./jwt');

const seedDefaultData = async () => {
  try {
    // 1. Seed Super Admin
    let admin = await User.findOne({ email: 'admin@primeidpro.online' });
    if (!admin) {
      const passwordHash = await User.hashPassword('AdminPassword2026!');
      admin = await User.create({
        name: 'Super Admin',
        email: 'admin@primeidpro.online',
        mobile: '+919999999999',
        passwordHash,
        role: 'ADMIN',
        status: 'ACTIVE'
      });
      logger.info('  [Seed] Super Admin user created: admin@primeidpro.online');
    }

    // 2. Seed Demo CSC Studio Operator
    let cscUser = await User.findOne({ email: 'csc@primeidpro.online' });
    let cscCenter = await Center.findOne({ centerCode: 'CSC-DL-1001' });

    if (!cscUser) {
      const passwordHash = await User.hashPassword('CscPassword2026!');
      cscUser = await User.create({
        name: 'Rajesh Sharma (CSC Demo)',
        email: 'csc@primeidpro.online',
        mobile: '+919876543210',
        passwordHash,
        role: 'CSC',
        status: 'ACTIVE'
      });
      logger.info('  [Seed] Demo CSC user created: csc@primeidpro.online');
    }

    if (!cscCenter) {
      cscCenter = await Center.create({
        ownerId: cscUser._id,
        centerName: 'Prime Digital Photo & CSC Studio',
        centerCode: 'CSC-DL-1001',
        slug: 'delhi-central-hub-1001',
        qrToken: 'demo-qr-token-delhi-1001',
        address: 'Shop 12, Main Market, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        phone: '+919876543210',
        email: 'csc@primeidpro.online',
        walletBalance: 500,
        pairingCode: '889900',
        pairingCodeExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year demo expiry
        serviceSettings: {
          serviceEnabled: true,
          pricePerPhoto: 7,
          minimumQuantity: 3,
          maximumQuantity: 20,
          quantityStep: 1,
          onlinePaymentEnabled: true,
          cashPaymentEnabled: true
        }
      });

      cscUser.centerId = cscCenter._id;
      await cscUser.save();
      logger.info('  [Seed] Demo Center created: Prime Digital Photo & CSC Studio (CSC-DL-1001)');
    }

    // 3. Seed Credit Wallet
    let wallet = await CreditWallet.findOne({ centerId: cscCenter._id });
    if (!wallet) {
      wallet = await CreditWallet.create({
        centerId: cscCenter._id,
        currentBalance: 500,
        lifetimePurchased: 500,
        lifetimeUsed: 0
      });
      logger.info('  [Seed] Demo Credit Wallet initialized with 500 credits');
    }

    // 4. Seed Credit Packages
    const packageCount = await CreditPackage.countDocuments();
    if (packageCount === 0) {
      await CreditPackage.create([
        { name: 'Starter Pack', price: 100, credits: 100, active: true, displayOrder: 1 },
        { name: 'Growth Pack (Bonus 50)', price: 500, credits: 550, active: true, displayOrder: 2 },
        { name: 'Studio Pro (Bonus 150)', price: 1000, credits: 1150, active: true, displayOrder: 3 },
        { name: 'Enterprise Hub (Bonus 400)', price: 2000, credits: 2400, active: true, displayOrder: 4 }
      ]);
      logger.info('  [Seed] Default Credit Packages created');
    }

    // 5. Seed Pricing Rules (Service Templates)
    const pricingCount = await PricingRule.countDocuments();
    if (pricingCount === 0) {
      await PricingRule.create([
        {
          serviceType: 'PASSPORT_PHOTO',
          name: 'Indian Passport (35x45mm)',
          displayName: 'Indian Passport (35x45mm)',
          description: 'Official Indian passport & visa specification with white background',
          dimensionsMm: { width: 35, height: 45 },
          paperSize: '4x6',
          defaultCopies: 8,
          customerPriceInr: 50,
          cscCreditCost: 2, // 2 credits per photo
          creditCost: 2,
          active: true
        },
        {
          serviceType: 'VISA_PHOTO',
          name: 'US / Schengen Visa (2x2 inch)',
          displayName: 'US / Schengen Visa (2x2 inch)',
          description: '51x51mm square format for US, Canada, Schengen visa applications',
          dimensionsMm: { width: 51, height: 51 },
          paperSize: '4x6',
          defaultCopies: 4,
          customerPriceInr: 70,
          cscCreditCost: 2,
          creditCost: 2,
          active: true
        },
        {
          serviceType: 'STAMP_PHOTO',
          name: 'Stamp Size (25x30mm)',
          displayName: 'Stamp Size (25x30mm)',
          description: 'Small format for application forms, school IDs, and gate passes',
          dimensionsMm: { width: 25, height: 30 },
          paperSize: '4x6',
          defaultCopies: 16,
          customerPriceInr: 40,
          cscCreditCost: 2,
          creditCost: 2,
          active: true
        },
        {
          serviceType: 'PVC_ID_CARD',
          name: 'PVC Smart ID Card (86x54mm)',
          displayName: 'PVC Smart ID Card (86x54mm)',
          description: 'CR80 standard credit card size with 300 DPI edge-to-edge printing',
          dimensionsMm: { width: 85.6, height: 53.98 },
          paperSize: 'SINGLE_CARD',
          defaultCopies: 1,
          customerPriceInr: 100,
          cscCreditCost: 5,
          creditCost: 5,
          active: true
        },
        {
          serviceType: 'CERTIFICATE',
          name: 'Official Document Photo (30x40mm)',
          displayName: 'Official Document Photo (30x40mm)',
          description: 'Exam admit cards, government forms, and hall tickets',
          dimensionsMm: { width: 30, height: 40 },
          paperSize: '4x6',
          defaultCopies: 8,
          customerPriceInr: 50,
          cscCreditCost: 2,
          creditCost: 2,
          active: true
        }
      ]);
      logger.info('  [Seed] Default Service Templates & Pricing created');
    }

    // 6. Seed Demo Desktop Device
    let demoDevice = await Device.findOne({ deviceId: 'PIP-DEV-DEMO-01' });
    const demoToken = signDeviceToken({
      deviceId: 'PIP-DEV-DEMO-01',
      installationId: 'demo-installation-id-pc-01',
      centerId: cscCenter._id.toString()
    });
    const demoTokenHash = crypto.createHash('sha256').update(demoToken).digest('hex');

    if (!demoDevice) {
      demoDevice = await Device.create({
        centerId: cscCenter._id,
        installationId: 'demo-installation-id-pc-01',
        deviceId: 'PIP-DEV-DEMO-01',
        deviceName: 'Front Desk Dell OptiPlex (DNP DS-RX1HS)',
        authToken: demoToken,
        authTokenHash: demoTokenHash,
        appVersion: '1.0.0',
        status: 'ACTIVE',
        lastSeenAt: new Date(),
        metrics: {
          jobsCompleted: 124,
          lastPrintedAt: new Date(),
          printerName: 'DNP DS-RX1HS Photo Printer'
        }
      });
      logger.info('  [Seed] Demo Device created: PIP-DEV-DEMO-01');
    } else {
      demoDevice.authToken = demoToken;
      demoDevice.authTokenHash = demoTokenHash;
      await demoDevice.save();
    }

    // 7. Seed Initial Desktop Release
    let release = await UpdateRelease.findOne({ version: '1.0.0' });
    if (!release) {
      await UpdateRelease.create({
        version: '1.0.0',
        channel: 'stable',
        platform: 'win32',
        downloadUrl: 'https://github.com/theabhi-labs/primeidpro-core/releases/download/v1.0.0/PrimeIdPro.exe',
        releaseNotes: 'Initial production hardened release with offline AI processing and 300 DPI native printing.',
        sha512: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        minimumSupportedVersion: '1.0.0',
        isMandatory: false
      });
      logger.info('  [Seed] Desktop Update Release v1.0.0 manifest published');
    }
  } catch (err) {
    logger.error(`[Seeder] Error during default data seeding: ${err.message}`);
  }
};

module.exports = { seedDefaultData, seedInitialData: seedDefaultData };
