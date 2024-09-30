const { default: mongoose } = require('mongoose');
const deTai = require('../model/deTaiModel');
const doAn = require('../model/doAnModel');
const SinhVien = require('../model/sinhVien');
const ThucTap = require('../model/ThucTapModel');
const catchAsync = require('../utils/catchAsync');

exports.layThongTinDashboardGiangVien = catchAsync(async (req, res, next) => {
  const giangVienId = req.user._id;
  const soLuongDeTai = await deTai.countDocuments({ giangVien: giangVienId });

  // 2. Số lượng đồ án
  const soLuongDoAn = await doAn.countDocuments({ giangVien: giangVienId });

  // 3. Số lượng sinh viên thực tập
  const soLuongSinhVienThucTap = await ThucTap.countDocuments({
    giangVien: giangVienId,
  });

  // 4. Tỉ lệ đậu/rớt trên đề tài thực tập và khóa luận (trạng thái 1 là đạt, 2 là rớt)
  const ketQuaThucTap = await ThucTap.aggregate([
    { $match: { giangVien: new mongoose.Types.ObjectId(giangVienId) } },
    { $group: { _id: { trangThai: '$trangThaiThucTap' }, count: { $sum: 1 } } },
    {
      $project: {
        _id: 0,
        trangThai: '$_id.trangThai',
        count: 1,
      },
    },
  ]);

  const ketQuaDoAn = await doAn.aggregate([
    { $match: { giangVien: giangVienId } },
    { $group: { _id: { trangThai: '$trangThai' }, count: { $sum: 1 } } },
    {
      $project: {
        _id: 0,
        trangThai: '$_id.trangThai',
        count: 1,
      },
    },
  ]);

  const tiLeDauRot = {
    thucTap: ketQuaThucTap,
    doAn: ketQuaDoAn,
  };

  // 5. Số lượng từng điểm tổng hướng dẫn
  const diemHuongDan = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'doans',
        localField: 'doAn',
        foreignField: '_id',
        as: 'doAnInfo',
      },
    },
    {
      $unwind: {
        path: '$doAnInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'doAnInfo.giangVien': giangVienId } },
    {
      $group: {
        _id: {
          diem: '$diem.diemHuongDan.diemTong',
        },
        count: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by 'stt' (which is stored in '_id' at this point)
    },
    {
      $project: {
        _id: 0,
        diem: '$_id.diem',
        count: 1,
      },
    },
  ]);

  const diemAbet = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'doans',
        localField: 'doAn',
        foreignField: '_id',
        as: 'doAnInfo',
      },
    },
    {
      $unwind: {
        path: '$doAnInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'doAnInfo.giangVien': giangVienId } },
    {
      $unwind: '$diem.diemHuongDan.diemAbet',
    },
    {
      $group: {
        _id: {
          abet: '$diem.diemHuongDan.diemAbet.stt',
          diem: '$diem.diemHuongDan.diemAbet.diem',
        },
        count: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: '$_id.abet',
        diemCounts: {
          $push: {
            diem: '$_id.diem',
            count: '$count',
          },
        },
      },
    },
    {
      $addFields: {
        diemCounts: {
          $sortArray: {
            input: '$diemCounts',
            sortBy: { diem: 1 }, // Sort `diemCounts` array by `diem` in ascending order
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by 'stt' (which is stored in '_id' at this point)
    },
    {
      $project: {
        _id: 0,
        lo: '$_id',
        diemCounts: 1,
      },
    },
  ]);
  const diemThucTapDoanhNghiep = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'thuctaps',
        localField: 'thucTap',
        foreignField: '_id',
        as: 'thucTapInfo',
      },
    },
    {
      $unwind: {
        path: '$thucTapInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'thucTapInfo.giangVien': giangVienId } },
    {
      $unwind: '$diem.diemThucTap.diemDoanhNghiep', // Unwind 'diemDoanhNghiep' to handle individual entries
    },
    {
      $group: {
        _id: {
          lo: '$diem.diemThucTap.diemDoanhNghiep.stt',
          diem: '$diem.diemThucTap.diemDoanhNghiep.diemAbet',
        },
        count: { $sum: 1 }, // Count the occurrences of each combination
      },
    },

    {
      $group: {
        _id: '$_id.lo',
        diemCounts: {
          $push: {
            diem: '$_id.diem',
            count: '$count',
          },
        },
      },
    },

    {
      $addFields: {
        diemCounts: {
          $sortArray: {
            input: '$diemCounts',
            sortBy: { diem: 1 }, // Sort `diemCounts` array by `diem` in ascending order
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by 'abet' field (stored in '_id.abet')
    },
    {
      $project: {
        _id: 0,
        lo: '$_id',
        diemCounts: 1,
      },
    },
  ]);

  const diemThucTapGiangVien = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'thuctaps',
        localField: 'thucTap',
        foreignField: '_id',
        as: 'thucTapInfo',
      },
    },
    {
      $unwind: {
        path: '$thucTapInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    { $match: { 'thucTapInfo.giangVien': giangVienId } },
    {
      $unwind: '$diem.diemThucTap.diemGiangVien', // Unwind 'diemDoanhNghiep' to handle individual entries
    },
    {
      $group: {
        _id: {
          lo: '$diem.diemThucTap.diemGiangVien.stt',
          diem: '$diem.diemThucTap.diemGiangVien.diemAbet',
        },
        count: { $sum: 1 }, // Count the occurrences of each combination
      },
    },
    {
      $sort: { '_id.lo': 1 }, // Sort by 'abet' field (stored in '_id.abet')
    },
    {
      $group: {
        _id: '$_id.lo',
        diemCounts: {
          $push: {
            diem: '$_id.diem',
            count: '$count',
          },
        },
      },
    },
    {
      $addFields: {
        diemCounts: {
          $sortArray: {
            input: '$diemCounts',
            sortBy: { diem: 1 }, // Sort `diemCounts` array by `diem` in ascending order
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by 'abet' field (stored in '_id.abet')
    },
    {
      $project: {
        _id: 0,
        lo: '$_id',
        diemCounts: 1,
      },
    },
  ]);

  // Trả về toàn bộ dữ liệu
  res.status(200).json({
    status: 'success',
    data: {
      soLuongDeTai,
      soLuongDoAn,
      soLuongSinhVienThucTap,
      tiLeDauRot,
      diemHuongDan,
      diemThucTapDoanhNghiep,
      diemAbet,
      diemThucTapGiangVien,
    },
  });
});
