const QRCode = require('qrcode');
const geolib = require('geolib'); // For distance calculation
const diemDanh = require('../model/diemDanhModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const SinhVien = require('../model/sinhVien');
// const Factory = require('./handlerFactory');

exports.taoMaDiemDanh = catchAsync(async (req, res, next) => {
  const maDiemDanh = await diemDanh.create({
    ...req.body,
    giangVien: req.user._id,
  });
  if (!maDiemDanh) {
    next(new ApiError('Không thể tạo mã điểm danh', 500));
  }
  const diemDanhData = JSON.stringify(maDiemDanh._id);
  QRCode.toDataURL(diemDanhData, (err, url) => {
    if (err) {
      return res.status(500).json({ error: 'Error generating QR code' });
    }
    res.status(200).json({ status: 'success', data: { qrCode: url } }); // Sends QR code as a base64 image
  });
});

// Attendance marking function
exports.diemDanh = catchAsync(async (req, res, next) => {
  const userId = req.user._id; // Assuming the logged-in user's ID is in req.user
  const maDiemDanh = req.params.id; // Attendance ID sent from the client
  const studentLocation = req.body.location; // Expected to be { latitude, longitude }
  // Find the diemDanh record by maDiemDanh
  const DiemDanh = await diemDanh.findById(maDiemDanh);

  if (!DiemDanh) {
    return res.status(404).json({ message: 'Attendance record not found.' });
  }

  // 1. Check if the attendance record is still valid (hieuLuc)
  const currentTime = new Date();
  if (currentTime > DiemDanh.hieuLuc) {
    return res
      .status(400)
      .json({ message: 'Mã điểm danh đã hết thời gian hiệu lực' });
  }

  if (DiemDanh.diaDiem && DiemDanh.diaDiem.coordinates) {
    if (!studentLocation)
      return res.status(400).json({
        status: 'fail',
        data: {
          message:
            'Mã điểm danh này yêu cầu truy cập vị trí của bạn, hãy bật định vị và cấp quyền truy cập cho hệ thống',
        },
      });
    const attendanceLocation = {
      latitude: DiemDanh.diaDiem.coordinates[1], // longitude is second in coordinates
      longitude: DiemDanh.diaDiem.coordinates[0], // latitude is first in coordinates
    };

    const distance = geolib.getDistance(
      {
        latitude: studentLocation.lat,
        longitude: studentLocation.lng,
      },
      attendanceLocation,
    );

    if (distance > 300) {
      return res.status(400).json({
        status: 'fail',
        data: {
          message: 'Bạn không ở trong phạm vi 300 mét',
        },
      });
    }
  }

  // 5. Update the sinhVien's diemDanh information
  const sinhVien = await SinhVien.findOneAndUpdate(
    { userId: userId }, // Find the sinhVien by userId
    {
      $push: {
        diemDanh: {
          // Append the new diemDanh record to the array
          ngay: new Date(),
          ghiChu: DiemDanh.ghiChu,
          phong: DiemDanh.phong,
          loai: DiemDanh.loai,
        },
      },
    },
    { new: true }, // Return the updated document
  );

  res.status(200).json({
    status: 'success',
    data: { sinhVien },
  });
});
