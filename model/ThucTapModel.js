const mongoose = require('mongoose');
const SinhVien = require('./sinhVien');

const thucTapSchema = mongoose.Schema(
  {
    userId: { type: mongoose.Schema.ObjectId, ref: 'users' },
    giangVien: { type: mongoose.Schema.ObjectId, ref: 'users' },
    hocKy: {
      type: Number,
      enum: [1, 2],
    },
    namHoc: {
      type: String,
      validate: {
        validator: function (val) {
          return /^\d{4}-\d{4}$/.test(val);
        },
        message: 'Năm học phải có định dạng YYYY-YYYY',
      },
    },
    trangThaiThucTap: { type: Number, default: 0 },
    tenCongTy: {
      type: String,
      trim: true,
      required: [true, 'Phải có tên công ty'],
    },
    maSoThue: { type: String, trim: true },
    diaChiCongTy: {
      type: String,
      trim: true,
      required: [true, 'Phải có tên địa chỉ công ty'],
    },
    ngayThamGia: { type: Date, default: Date.now() },
    emaiCongTy: {
      type: String,
      trim: true,
    },
    tenNguoiDaiDien: {
      type: String,
      trim: true,
      required: [true, 'Phải có tên người đại diện '],
    },
    tenNguoiGiamSat: {
      type: String,
      trim: true,
      required: [true, 'Phải có tên người giám sát'],
    },
    emaiLNguoiGiamSat: {
      type: String,
      trim: true,
    },
    soDienThoaiNguoiGiamSat: {
      type: String,
      trim: true,
      required: [true, 'Phải có số điện thoại người giám sát'],
    },
    comment: [
      {
        id: mongoose.Schema.ObjectId,
        maSo: Number,
        hoTen: String,
        hinhAnh: String,
        ngayTao: {
          type: Date,
          default: Date.now(),
        },
        noiDung: String,
      },
    ],
    taiLieu: [
      {
        tenTaiLieu: { type: String, trim: true },
        loaiTaiLieu: String,
        dungLuong: String,
        duongDan: { type: String, trim: true },
        ngayDang: { type: Date, default: Date.now() },
      },
    ],
    trangThai: { type: Number, default: 0 },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

thucTapSchema.pre('save', function (next) {
  this.wasNew = this.isNew; // Capture if it's new before saving
  next();
});
thucTapSchema.post('save', async function () {
  if (this.wasNew) {
    console.log('ok i"m here');
    await SinhVien.findOneAndUpdate(
      { userId: this.userId },
      {
        thucTap: this._id,
      },
    );
  } else if (!this.wasNew) {
    console.log('Document was updated');
  }
});

const ThucTap = mongoose.model('thuctaps', thucTapSchema);

module.exports = ThucTap;
