const mongoose = require('mongoose');

const huongDanSchema = mongoose.Schema({
  tenHuongDan: {
    type: String,
    trim: true,
    required: [true, 'Hướng dẫn phải có tên'],
  },
  soLuongHuongDan: {
    type: Number,
  },
  giangVien: Number,
  chiTietHuongDan: [
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
      trangThai: { type: Boolean, defautl: false },
      isFile: {
        type: Boolean,
        default: false,
      },
    },
  ],
});

const huongDan = mongoose.model('huongDan', huongDanSchema);

module.exports = huongDan;
