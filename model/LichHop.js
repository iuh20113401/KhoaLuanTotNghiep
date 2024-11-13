const mongoose = require('mongoose');

const lichHopSchema = mongoose.Schema({
  tieuDe: {
    type: String,
    trim: true,
  },
  phong: {
    type: String,
    trim: true,
  },
  giangVien: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
  },
  batDau: { type: Date, default: Date.now() },
  ketThuc: { type: Date, default: Date.now() },
});

const LichHop = mongoose.model('lichHops', lichHopSchema);

module.exports = LichHop;
