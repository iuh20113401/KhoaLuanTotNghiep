const mongoose = require('mongoose');

const hoiDongModel = new mongoose.Schema({
  stt: { type: Number, default: 0 },
  giangVien: { type: mongoose.Schema.ObjectId, ref: 'users' },
  vaiTro: { type: Number },
  hocKy: {
    type: String,
    required: [true, 'Hội đồng phải thuộc về một học kỳ nhất định'],
  },
  namHoc: {
    type: String,
    required: [true, 'Hội đồng phải thuộc về một năm học nhất định'],
  },
  loai: { type: Number, default: 0 },
});
const hoiDong = mongoose.model('hoiDongs', hoiDongModel);

module.exports = hoiDong;
