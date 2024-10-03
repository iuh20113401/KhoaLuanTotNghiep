const mongoose = require('mongoose');

const loiMoiSchema = new mongoose.Schema({
  nguoiGui: { type: mongoose.Schema.ObjectId, ref: 'users' },
  maSo: { type: Number },
  hoTen: { type: String },
  doAn: { type: mongoose.Schema.ObjectId, ref: 'doans' },
  tenDoAn: { type: String },
  giangVien: { type: String },
  ngayGui: { type: Date, default: Date.now() },
  noiDung: { type: String, trim: true },
});
const sinhVienSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.ObjectId, ref: 'users' },
  doAn: { type: mongoose.Schema.ObjectId, ref: 'doAns', default: null },
  loiMoi: [loiMoiSchema],
  soLuongLoiMoi: { type: Number, default: 0 },
  thucTap: {
    type: mongoose.Schema.Types.ObjectId, // Ensure it's ObjectId, not Number
    ref: 'ThucTap', // Reference the ThucTap model
  },
  pretest: {
    type: Number,
    default: 0,
  },
  diemDanh: [
    {
      ngay: { type: Date, default: Date.now() },
      ghiChu: { type: String, default: '', trim: true },
      phong: { type: String, trim: true },
      loai: { type: Number, default: 0 },
    },
  ],
  diem: {
    ketQua: {
      type: Number,
      default: 0,
    },
    nhanXet: {
      type: String,
    },
    diemHuongDan: {
      diemAbet: [
        {
          stt: Number,
          ten: String,
          diem: Number,
          ghiChu: String,
        },
      ],
      diemTong: {
        type: Number,
        default: null,
      },
    },
    diemPhanBien: {
      diemPhanBien1: {
        diemAbet: [
          {
            stt: Number,
            ten: String,
            diem: Number,
            ghiChu: String,
          },
        ],
        diemTong: {
          type: Number,
          default: null,
        },
        ketQua: {
          type: Number,
          default: 0,
        },
      },
      diemPhanBien2: {
        diemAbet: [
          {
            stt: Number,
            ten: String,
            diem: Number,
            ghiChu: String,
          },
        ],
        diemTong: {
          type: Number,
          default: null,
        },
        ketQua: {
          type: Number,
          default: 0,
        },
      },
    },
    diemHoiDong: {
      diemHoiDong1: {
        diemAbet: [
          {
            stt: Number,
            ten: String,
            diem: Number,
            ghiChu: String,
          },
        ],
        diemTong: {
          type: Number,
          default: null,
        },
        ketQua: {
          type: Number,
          default: 0,
        },
      },
      diemHoiDong2: {
        diemAbet: [
          {
            stt: Number,
            ten: String,
            diem: Number,
            ghiChu: String,
          },
        ],
        diemTong: {
          type: Number,
          default: null,
        },
        ketQua: {
          type: Number,
          default: 0,
        },
      },
      diemHoiDong3: {
        diemAbet: [
          {
            stt: Number,
            ten: String,
            diem: Number,
            ghiChu: String,
          },
        ],
        diemTong: {
          type: Number,
          default: null,
        },
        ketQua: {
          type: Number,
          default: 0,
        },
      },
    },
    diemThucTap: {
      diemDoanhNghiep: [
        {
          stt: Number,
          ten: String,
          diemAbet: Number,
          diemThang10: Number,
          ghiChu: String,
        },
      ],
      diemGiangVien: [
        {
          stt: Number,
          ten: String,
          diemAbet: Number,
          diemThang10: Number,
          ghiChu: String,
        },
      ],
    },
  },
});
const SinhVien = mongoose.model('sinhViens', sinhVienSchema);

module.exports = SinhVien;