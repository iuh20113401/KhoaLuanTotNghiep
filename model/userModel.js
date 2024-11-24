const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const SinhVien = require('./sinhVien');

const userSchema = new mongoose.Schema({
  maSo: {
    type: Number,
    unique: true,
    required: [true, 'Mỗi tài khoản phải có mã só'],
  },
  password: {
    type: String,
    trim: true,
    requiredd: [true, 'Please provide a password'],
    minlength: 0,
    select: false,
  },
  passwordConfirm: {
    type: String,
    trim: true,
    requiredd: [true, 'Must confirm password'],
    validate: {
      validator: function (val) {
        return this.password === val;
      },
      message: 'Password confirm does not match',
    },
  },
  hoTen: {
    type: String,
    required: [true, 'Mỗi tài khoản phải có họ tên đầy đủ'],
  },
  ngaySinh: {
    type: Date,
  },
  gioiTinh: {
    type: Boolean,
    default: true,
  },
  khoa: {
    ten: String,
    vaiTro: String,
  },
  boMon: {
    ten: {
      type: String,
      trim: true,
      requiredd: [true, 'Bộ môn phải có tên'],
    },
    vaiTro: {
      type: String,
      trim: true,
      requiredd: [true, 'Bộ môn phải có vị trí'],
    },
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },
  soDienThoai: {
    type: String,
  },
  hinhAnh: {
    type: String,
    trim: true,
  },
  hocKy: {
    type: Number,
    trim: true,
  },
  namHoc: {
    type: String,
    trim: true,
  },
  lop: {
    type: String,
    trim: true,
  },
  vaiTro: {
    type: Number,
    trim: true,
    required: [true, 'Mối tài khoản phải có một vai trò'],
  },
  passwordChangeDate: Date,
  passwordResetToken: String,
  passwordResetTokenExpired: Date,
  active: {
    type: Boolean,
    default: true,
  },
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  this.passwordChangeDate = Date.now() - 1000;
  next();
});
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword,
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};
//crate sinh vien
userSchema.post('bulkWrite', async (docs, next) => {
  let sinhVienDocs = Object.keys(docs.upsertedIds)
    .map((key) => {
      const userId = docs.upsertedIds[key]; // Get the user ID of the upserted record

      return { userId };
    })
    .filter(Boolean);

  if (sinhVienDocs.length > 0) {
    sinhVienDocs = sinhVienDocs.map((sv) => ({
      ...sv,
      diem: {
        diemHuongDan: null,
        diemPhanBien: {
          diemPhanBien1: null,
          diemPhanBien2: null,
        },
        diemHoiDong: null,
        diemThucTap: {
          diemGiangVien: null,
          diemDoanhNghiep: null,
        },
      },
    }));
    await SinhVien.insertMany(sinhVienDocs);
  }

  next();
});

userSchema.post('save', async (doc, next) => {
  if (doc.vaiTro === 0) {
    await SinhVien.create({
      userId: doc._id,
    });
  }
  next();
});

userSchema.methods.changePasswordAfter = function (JWTTimeStamps) {
  if (this.passwordChangeDate) {
    const changeDate = this.passwordChangeDate.getTime() / 1000;
    return JWTTimeStamps < changeDate;
  }
  return false;
};
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');
  this.passwordResetTokenExpired = Date.now() + 10 * 60 * 1000;
  return resetToken;
};
const User = mongoose.model('users', userSchema);

module.exports = User;
