const mongoose = require('mongoose');

const thongBaoSchema = new mongoose.Schema({
  tieuDe: {
    type: String,
    trim: true,
    required: [true, 'Không có tiêu đề'],
    unique: [true, 'Tiêu đề đã tồn tại'],
  },
  nguoiTao: { type: mongoose.Schema.ObjectId, ref: 'users' },
  ngayTao: { type: Date, default: Date.now() },
  noiDung: { type: String, trim: true },
  loai: { type: Number, default: 0 }, // for all or only teachers
  hinhThuc: { type: Number, default: 0 }, // for text, picture, table
});

const ThongBao = mongoose.model('thongBaos', thongBaoSchema);
module.exports = ThongBao;
