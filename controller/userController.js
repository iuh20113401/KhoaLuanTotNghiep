const xlsx = require('xlsx');
const fs = require('fs');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');

const SinhVien = require('../model/sinhVien');
const User = require('../model/userModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

exports.taoUser = Factory.createOne(User);
exports.getAllUser = Factory.getAll(User);
exports.getUser = Factory.getOne(User);
exports.deleteUser = Factory.deleteOne(User);

exports.getMe = catchAsync(async (req, res) => {
  // Fetch the user data
  let user = await User.findById(req.user.id).select(
    '_id maSo hoTen ngaySinh gioiTinh soDienThoai vaiTro hinhAnh',
  );

  // If the user has 'vaiTro' equal to 0, merge the SinhVien data
  if (user.vaiTro === 0) {
    const sinhVien = await SinhVien.findOne({ userId: req.user._id });

    // Combine user and sinhVien, but keep the user's _id
    user = { ...user._doc, ...sinhVien._doc, _id: user._id };
  }

  // Send the response with the user data, including the _id
  res.status(200).json({
    status: 'success',
    data: { user: user },
  });
});

const fieldObj = (obj, ...filterFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (filterFields.includes(element)) {
      newObj[element] = obj[element];
    }
  });
  return newObj;
};
exports.upudateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new ApiError('Không cập nhật mật khẩu cho api này', 400));
  }
  const filterRes = fieldObj(req.body, 'hoTen', 'email', 'soDienThoai');
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterRes, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: { user: updateUser },
  });
});

exports.getAllGiangVien = catchAsync(async (req, res, next) => {
  const results = await User.find({ vaiTro: { $gte: 1 } }).select(
    'maSo _id email soDienThoai hoTen vaiTro',
  );
  res.status(200).json({
    status: 'success',
    data: { danhSachGiangVien: results },
  });
});
// Multer configuration to handle file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/tailieu')); // Set upload directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Set filename
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
}).single('taiLieu'); // Expect field name to be 'taiLieu'
function convertDate(dateStr) {
  const [day, month, year] = dateStr.split('/');
  return `${year}-${month}-${day}`;
}
// Your insertMany function (with Multer file upload handling)
exports.insertMany = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    const workbook = xlsx.readFile(filePath);
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });

    const headerRowIndex = jsonData.findIndex(
      (row) => row[0] === 'STT' && row[1] === 'Mã SV',
    );

    if (headerRowIndex === -1) {
      return res
        .status(400)
        .json({ error: 'Không tìm thấy tiêu đề hợp lệ trong tệp Excel.' });
    }

    const dataRows = jsonData.slice(headerRowIndex + 1);
    const password = await bcrypt.hash('test1234', 12);
    const sinhVienData = dataRows
      .filter((row) => row[8] && row[8].startsWith('DHHTTT'))
      .map((row) => ({
        maSo: row[1], // Student ID
        hoTen: `${row[2]} ${row[3]}`, // Full name (First + Last)
        ngaySinh: convertDate(row[5]), // Convert date format before saving
        soDienThoai: row[6], // Phone number
        lop: row[8], // Class code
        gioiTinh: row[4] === 'Nam' ? 0 : 1, // Gender (0 for Male, 1 for Female)
        khoa: { ten: 'Công nghệ thông tin', vaiTro: 'Sinh viên' },
        boMon: { ten: 'Hệ thống thông tin', vaiTro: 'Sinh viên' },
        password,
        email: null,
        hinhAnh: '/public/img/user5.png',
        vaiTro: 0,
      }));

    const bulkOps = sinhVienData.map((student) => ({
      updateOne: {
        filter: { maSo: student.maSo },
        update: { $setOnInsert: student },
        upsert: true,
      },
    }));

    await User.bulkWrite(bulkOps);

    fs.unlinkSync(filePath); // Remove file after processing
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.status(200).json({ message: 'Upload và xử lý thành công' });
  });
});
async function layDanhSachTroTruyenSinhVien(id) {
  const danhSach = await User.aggregate([
    {
      $match: {
        _id: id,
        vaiTro: 0,
      },
    },
    {
      $lookup: {
        from: 'doans',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$sinhVien1', '$$userId'] },
                  { $eq: ['$sinhVien2', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'doAnInfo',
      },
    },
    { $unwind: '$doAnInfo' },

    // New lookup for giangVienThucTap
    {
      $lookup: {
        from: 'thuctaps',
        localField: '_id',
        foreignField: 'userId',
        as: 'thucTapInfo',
      },
    },
    { $unwind: { path: '$thucTapInfo', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'users',
        let: {
          giangVien: '$doAnInfo.giangVien',
          giangVienPhanBien1: '$doAnInfo.giangVienPhanBien1',
          giangVienPhanBien2: '$doAnInfo.giangVienPhanBien2',
          sinhVien1: '$doAnInfo.sinhVien1',
          sinhVien2: '$doAnInfo.sinhVien2',
          giangVienThucTap: '$thucTapInfo.giangVien',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$_id', '$$giangVien'] },
                  { $eq: ['$_id', '$$giangVienPhanBien1'] },
                  { $eq: ['$_id', '$$giangVienPhanBien2'] },
                  { $eq: ['$_id', '$$sinhVien1'] },
                  { $eq: ['$_id', '$$sinhVien2'] },
                  { $eq: ['$_id', '$$giangVienThucTap'] }, // Include giangVienThucTap
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              hoTen: 1,
              email: 1,
              soDienThoai: 1,
              maSo: 1,
              hinhAnh: 1,
              vaiTro: 1,
            },
          },
        ],
        as: 'relatedUsers',
      },
    },
    { $unwind: '$relatedUsers' },
    {
      $group: {
        _id: '$relatedUsers._id',
        hoTen: { $first: '$relatedUsers.hoTen' },
        email: { $first: '$relatedUsers.email' },
        soDienThoai: { $first: '$relatedUsers.soDienThoai' },
        maSo: { $first: '$relatedUsers.maSo' },
        hinhAnh: { $first: '$relatedUsers.hinhAnh' },
        vaiTro: { $first: '$relatedUsers.vaiTro' },
      },
    },
    {
      $project: {
        _id: 1,
        hoTen: 1,
        email: 1,
        soDienThoai: 1,
        maSo: 1,
        hinhAnh: 1,
      },
    },
  ]);
  return [...danhSach.filter((user) => user._id.toString() !== id.toString())];
}

async function layDanhSachTroTruyenGiangVien(id) {
  const danhSach = await User.aggregate([
    {
      $match: {
        _id: id,
        vaiTro: 1, // Matching only lecturers (vaiTro = 1)
      },
    },
    {
      $lookup: {
        from: 'doans',
        let: { userId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$giangVien', '$$userId'] },
                  { $eq: ['$giangVienPhanBien1', '$$userId'] },
                  { $eq: ['$giangVienPhanBien2', '$$userId'] },
                ],
              },
            },
          },
        ],
        as: 'doAnInfo',
      },
    },
    { $unwind: '$doAnInfo' },

    // Lookup for sinhVienThucTap
    {
      $lookup: {
        from: 'thuctaps',
        localField: '_id',
        foreignField: 'giangVien',
        as: 'thucTapInfo',
      },
    },
    { $unwind: { path: '$thucTapInfo', preserveNullAndEmptyArrays: true } },

    {
      $lookup: {
        from: 'users',
        let: {
          sinhVien1: '$doAnInfo.sinhVien1',
          sinhVien2: '$doAnInfo.sinhVien2',
          sinhVienThucTap: '$thucTapInfo.userId',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  { $eq: ['$_id', '$$sinhVien1'] },
                  { $eq: ['$_id', '$$sinhVien2'] },
                  { $eq: ['$_id', '$$sinhVienThucTap'] },
                ],
              },
            },
          },
          {
            $project: {
              _id: 1,
              hoTen: 1,
              email: 1,
              soDienThoai: 1,
              maSo: 1,
              hinhAnh: 1,
              vaiTro: 1,
            },
          },
        ],
        as: 'relatedSinhVien',
      },
    },
    {
      $unwind: '$relatedSinhVien',
    },

    {
      $group: {
        _id: '$relatedSinhVien._id',
        hoTen: { $first: '$relatedSinhVien.hoTen' },
        email: { $first: '$relatedSinhVien.email' },
        soDienThoai: { $first: '$relatedSinhVien.soDienThoai' },
        maSo: { $first: '$relatedSinhVien.maSo' },
        hinhAnh: { $first: '$relatedSinhVien.hinhAnh' },
        vaiTro: { $first: '$relatedSinhVien.vaiTro' },
      },
    },

    {
      $project: {
        _id: 1,
        hoTen: 1,
        email: 1,
        soDienThoai: 1,
        maSo: 1,
        hinhAnh: 1,
        vaiTro: 1,
      },
    },
  ]);
  return danhSach; // The list of unique students
}

exports.layDanhSachTroChuyen = catchAsync(async (req, res, next) => {
  let danhSachTroChuyen = {};
  if (req.user.vaiTro === 0) {
    danhSachTroChuyen = await layDanhSachTroTruyenSinhVien(req.user._id);
  } else {
    danhSachTroChuyen = await layDanhSachTroTruyenGiangVien(req.user._id);
  }
  res.status(200).json({
    status: 'success',
    data: { danhSachTroChuyen },
  });
});
