const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true
    },
    mobile: {
      type: String,
      trim: true,
      index: true
    },
    phone: {
      type: String,
      trim: true
    },
    password: {
      type: String // Optional direct setter
    },
    passwordHash: {
      type: String,
      required: false
    },
    role: {
      type: String,
      enum: ['CSC', 'ADMIN', 'CSC_OPERATOR', 'SUPER_ADMIN', 'CUSTOMER'],
      default: 'CSC',
      index: true
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'PENDING', 'SUSPENDED', 'BLOCKED'],
      default: 'ACTIVE',
      index: true
    },
    centerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Center',
      index: true
    },
    lastLoginAt: {
      type: Date
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to hash password if password was modified
UserSchema.pre('save', async function (next) {
  if (this.isModified('password') && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.password, salt);
    this.password = undefined;
  }

  // Strictly enforce password requirement for operator and admin accounts
  if (!this.passwordHash && !this.password) {
    if (this.role === 'CUSTOMER') {
      // Unauthenticated customer placeholder — generate random unusable hash
      const crypto = require('crypto');
      const randomSecret = crypto.randomBytes(32).toString('hex');
      const salt = await bcrypt.genSalt(10);
      this.passwordHash = await bcrypt.hash(randomSecret, salt);
    } else {
      return next(new Error('Password is required for administrative and operator user accounts.'));
    }
  }
  next();
});

// Method to verify password
UserSchema.methods.comparePassword = async function (plainPassword) {
  if (!this.passwordHash && this.password) {
    return this.password === plainPassword;
  }
  return bcrypt.compare(plainPassword, this.passwordHash);
};

// Static helper to hash password
UserSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Exclude sensitive fields in default JSON responses
UserSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.passwordHash;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpires;
  return user;
};

module.exports = mongoose.model('User', UserSchema);
