const mongoose = require('mongoose');
const deTai = require('./deTaiModel');
const SinhVien = require('./sinhVien');

const doAnSchema = mongoose.Schema(
  {
    deTai: {
      type: mongoose.Schema.ObjectId,
      ref: 'deTais',
      required: [true, 'Đồ án phải thuộc về một đề tài '],
    },
    giangVien: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
    },
    maDoAn: {
      type: Number,
      unique: true,
      required: [true, 'Không có mã đồ án'],
    },
    tenDoAn: {
      type: String,
      trim: true,
    },
    giangVienPhanBien1: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
    },
    giangVienPhanBien2: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
    },
    giangVienHoiDong: {
      loai: Number,
      giangVien: [
        {
          userId: { type: mongoose.Schema.ObjectId, ref: 'users' },
          stt: { type: Number },
          chucDanh: { type: String, trim: '' },
        },
      ],
    },
    sinhVien1: {
      type: mongoose.Schema.ObjectId,
      ref: 'users',
      require: [true, 'Đồ án phải có sinh viên'],
    },
    sinhVien2: { type: mongoose.Schema.ObjectId, ref: 'users' },
    ngayThamGia: { type: Date, default: Date.now() },
    trangThai: { type: Number, default: 0 },
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
    huongDan: [
      {
        type: String,
        ngayBatDau: Date,
        ngayKetThuc: {
          type: Date,
          validate: {
            validator: function (val) {
              // this keyword in there can be used on create method
              return val > this.ngayBatDau;
            },
            message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu ',
          },
        },
        tieuChiHoanThanh: {
          type: String,
          required: [true, 'Hướng dẫn phải có tiêu chí hoàn thành '],
        },
        trangThai: {
          type: Boolean,
          default: false,
        },
        isFile: {
          type: Boolean,
          default: false,
        },
        file: {
          type: String,
          trim: true,
        },
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
    taiLieuPhanBien: [
      {
        tenTaiLieu: { type: String, trim: true },
        loaiTaiLieu: String,
        dungLuong: String,
        duongDan: { type: String, trim: true },
        ngayDang: { type: Date, default: Date.now() },
      },
    ],
    taiLieuHoiDong: [
      {
        tenTaiLieu: { type: String, trim: true },
        loaiTaiLieu: String,
        dungLuong: String,
        duongDan: { type: String, trim: true },
        ngayDang: { type: Date, default: Date.now() },
      },
    ],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
doAnSchema.virtual('deTais', {
  ref: 'deTais',
  foreignField: '_id',
  localField: 'deTai',
});
doAnSchema.virtual('sinhVien1Info', {
  ref: 'sinhViens',
  foreignField: 'userId',
  localField: 'sinhVien1',
  select: 'thucTap doAn diem -_id',
  justOne: true,
});
doAnSchema.virtual('sinhVien2Info', {
  ref: 'sinhViens',
  foreignField: 'userId',
  localField: 'sinhVien2',
  select: 'thucTap doAn diem -_id',
  justOne: true,
});
doAnSchema.pre('find', function (next) {
  this.wasNew = this.isNew;
  next();
});
doAnSchema.pre('save', function (next) {
  this.wasNew = this.isNew; // Capture if it's new before saving
  next();
});
doAnSchema.post('save', async function () {
  if (this.wasNew) {
    // If it's an insert, increase soLuongDoAn in deTai and update SinhVien
    const deTaiNew = await deTai.findByIdAndUpdate(this.deTai, {
      $inc: { soLuongDoAn: 1 },
    });

    await SinhVien.findOneAndUpdate(
      { userId: this.sinhVien1 },
      {
        doAn: this._id,
        giangVien: deTaiNew.giangVien,
      },
    );
  } else if (!this.wasNew) {
    console.log('Document was updated');
  }
});

const doAn = mongoose.model('doAn', doAnSchema);
module.exports = doAn;
