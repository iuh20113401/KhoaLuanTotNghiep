const mongoose = require('mongoose');

const deTaiSchema = mongoose.Schema({
  tenDeTai: {
    type: String,
    trim: true,
    required: [true, 'Vui lòng nhập tên đề tài '],
  },
  giangVien: {
    type: mongoose.Schema.ObjectId,
    ref: 'users',
  },
  sinhVien: { type: mongoose.Schema.ObjectId, ref: 'users' },
  moTa: {
    type: String,
    trim: true,
  },
  kyNangCanCo: {
    type: String,
  },
  ketQuaCanDat: {
    type: String,
    trim: true,
  },
  ngayTao: {
    type: Date,
    default: Date.now(),
  },
  soLuongDoAn: {
    type: Number,
    default: 0,
  },
  hinhAnh: {
    type: String,
  },
  tag: [String],
  ghiChu: [
    {
      noiDung: { type: String, trim: true },
      ngayTao: { type: Date, default: new Date() },
    },
  ],
  trangThai: { type: Number, default: 0 }, // 0 cho chưa duyệt, 1 cho đã duyệt, 2 cho chỉnh sửa, 3 là cho không duyệt và 4 là cho sinh viên đã tạo
  danhMuc: {
    type: String,
    trim: true,
    required: [true, 'Đề tài phải thuộc một danh mục cụ thể'],
  },
  loai: { type: Number, default: 0 }, // 0 cho giảng viên và 1 cho sinh viên
});

const deTai = mongoose.model('deTais', deTaiSchema);

module.exports = deTai;
