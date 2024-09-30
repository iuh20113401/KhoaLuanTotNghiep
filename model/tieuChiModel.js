const mongoose = require('mongoose');

const tieuChiSchema = mongoose.Schema({
  ten: { type: String, trim: true },
  LO: [
    {
      stt: Number,
      ten: { type: String, trim: true },
      thangDiem: [
        {
          diemAbet: { type: String, trim: true },
          diemNhoNhat: Number,
          diemLonNhat: Number,
          noiDung: { type: String, trim: true },
        },
      ],
      isHuongDan: Boolean,
      isPhanBien: Boolean,
      isHoiDong: Boolean,
    },
  ],

  ngayTao: { type: Date, default: Date.now() },
  ngaySuaDoi: { type: Date, default: null },
});

const tieuChi = mongoose.model('tieuChi', tieuChiSchema);

module.exports = tieuChi;
