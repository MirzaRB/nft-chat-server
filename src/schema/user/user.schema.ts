import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
var Schema = mongoose.Schema;

var userSchema = new Schema(
  {
    email: {
      type: String,
      required: false,
    },
    displayName: {
      type: String,
      required: false,
    },
    userName: {
      type: String,
      required: true,
    },
    poddTitle: {
      type: String,
      required: false,
    },
    poddDescription: {
      type: String,
      required: false,
    },
    profileImageUrl: {
      type: String,
      required: false,
    },
    dob: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: false,
    },
    verificationCode: {
      type: String,
      required: false,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDisabled: {
      type: Boolean,
      default: false,
    },
  },
  {
    collection: 'users',
    timestamps: true,
  },
);

// Hashing Password before saving to DB
userSchema.pre('save', function (next) {
  const user = this;

  if (!user.isModified('password')) return next();

  bcrypt.hash(user.password, 10, function (err, hash) {
    if (err) return next(err);

    user.password = hash;
    next();
  });
});
export const UserSchema = mongoose.model('Users', userSchema);
