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
const APIFeature = require('../utils/apiFeatures');
const { getCurrentHocKy } = require('../utils/getCurrentHocKy');

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
// Hàm tạo một user với vai trò sinh viên (vaiTro = 0)
exports.taoMotSinhVien = catchAsync(async (req, res, next) => {
  // Kiểm tra xem vai trò đã được đặt thành 0 chưa
  if (req.body.vaiTro !== 0) {
    return next(
      new ApiError(
        'Để tạo user với vai trò sinh viên, vaiTro phải được đặt thành 0',
        400,
      ),
    );
  }

  // Tạo người dùng mới
  req.body.hinhAnh = 'public/hinhanh/iuh_logo_2.png';
  const newUser = await User.create(req.body);

  // Tạo sinh viên mới
  await SinhVien.create({ userId: newUser._id });

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// Hàm tạo nhiều user với vai trò sinh viên (vaiTro = 0)
exports.taoNhieuSinhVien = catchAsync(async (req, res, next) => {
  // Kiểm tra xem tất cả người dùng có vai trò là 0 không
  if (req.body.some((user) => user.vaiTro !== 0)) {
    return next(
      new ApiError(
        'Để tạo user với vai trò sinh viên, vaiTro phải được đặt thành 0',
        400,
      ),
    );
  }

  // Tạo nhiều người dùng mới
  const newUsers = await User.insertMany(req.body);

  // Tạo nhiều sinh viên mới
  await SinhVien.insertMany(newUsers.map((user) => ({ userId: user._id })));

  res.status(201).json({
    status: 'success',
    data: {
      users: newUsers,
    },
  });
});

// Hàm tạo một user với vai trò giảng viên (vaiTro = 2)
exports.taoMotGiangVien = catchAsync(async (req, res, next) => {
  // Kiểm tra xem vai trò đã được đặt thành 2 chưa
  const vaiTro = [1, 2, 3];

  if (!vaiTro.includes(parseInt(req.body.vaiTro, 10))) {
    return next(
      new ApiError(
        'Để tạo user với vai trò giảng viên, vaiTro phải được đặt thành 1',
        400,
      ),
    );
  }
  req.body.hinhAnh = 'public/hinhanh/iuh_logo_2.png';

  // Tạo người dùng mới
  const newUser = await User.create(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      user: newUser,
    },
  });
});

// Hàm tạo nhiều user với vai trò giảng viên (vaiTro = 2)
exports.taoNhieuGiangVien = catchAsync(async (req, res, next) => {
  // Kiểm tra xem tất cả người dùng có vai trò là 2 không
  if (req.body.some((user) => user.vaiTro !== 2)) {
    return next(
      new ApiError(
        'Để tạo user với vai trò giảng viên, vaiTro phải được đặt thành 2',
        400,
      ),
    );
  }

  // Tạo nhiều người dùng mới
  const newUsers = await User.insertMany(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      users: newUsers,
    },
  });
});

// Hàm lấy danh sách các tài khoản sinh viên
exports.layDanhSachSinhVien = catchAsync(async (req, res) => {
  const feature = await new APIFeature(User.find({ vaiTro: 0 }), req.query)
    .filter()
    .sort('maSo')
    .fields()
    .panigation();
  const { query, totalDocs } = feature;
  const danhSachSinhVien = await query.select('-__v');
  const totalPages = Math.ceil(totalDocs / req.query.limit);

  res.status(200).json({
    status: 'success',
    data: {
      danhSachSinhVien,
      totalPages,
    },
  });
});

// Hàm lấy danh sách các tài khoản là giảng viên
exports.layDanhSachGiangVien = catchAsync(async (req, res) => {
  const feature = await new APIFeature(
    User.find({ vaiTro: { $gte: 1 } }),
    req.query,
  )
    .filter()
    .sort('maSo')
    .fields()
    .panigation();
  const { query, totalDocs } = feature;
  const danhSachGiangVien = await query.select('-__v');
  const totalPages = Math.ceil(totalDocs / req.query.limit);
  res.status(200).json({
    status: 'success',
    data: {
      danhSachGiangVien,
      totalPages,
    },
  });
});

// Hàm cập nhật lại mật khẩu mặc định một tài khoản là 'test123'
exports.capNhatMatKhauMacDinh = catchAsync(async (req, res, next) => {
  // Tìm người dùng theo id
  const user = await User.findById(req.params.id);

  // Kiểm tra xem người dùng có tồn tại không
  if (!user) {
    return next(new ApiError('Không tìm thấy người dùng với id này', 404));
  }

  // Băm mật khẩu mới

  user.password = 'test1234';
  await user.save();

  res.status(200).json({
    status: 'success',
    message: 'Cập nhật mật khẩu thành công',
  });
});

// Hàm cập nhật thông tin tài khoản
exports.capNhatThongTinTaiKhoan = catchAsync(async (req, res, next) => {
  // Chỉ cho phép cập nhật các trường được chỉ định
  const filteredBody = fieldObj(
    req.body,
    'hoTen',
    'soDienThoai',
    'email',
    'gioiTinh',
    'ngaySinh',
    'lop',
  );
  // Tìm và cập nhật người dùng
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });

  // Xử lý lỗi nếu không tìm thấy người dùng
  if (!updatedUser) {
    return next(new ApiError('Không tìm thấy người dùng với ID này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser,
    },
  });
});

// Hàm lưu hình ảnh
const storageHinhAnh = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/hinhanh')); // Set upload directory
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`); // Set filename
  },
});

const uploadHinhANh = multer({
  storage: storageHinhAnh,
  limits: { fileSize: 1000000 }, // Limit file size to 1MB
}).single('hinhAnh'); // Expect field name to be 'taiLieu'

// Hàm cập nhật hình ảnh đại diện
exports.capNhatHinhAnh = catchAsync(async (req, res, next) => {
  uploadHinhANh(req, res, async () => {
    // Kiểm tra xem có file hình ảnh nào được tải lên không
    if (!req.file) {
      return next(new ApiError('Vui lòng cung cấp hình ảnh', 400));
    }

    // Tìm người dùng theo id
    const user = await User.findById(req.user.id);

    // Kiểm tra xem người dùng có tồn tại không
    if (!user) {
      return next(new ApiError('Không tìm thấy người dùng với id này', 404));
    }

    // Cập nhật đường dẫn hình ảnh mới cho người dùng
    console.log(req.file);
    user.hinhAnh = `uploads/hinhanh/${req.file.filename}`;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'Cập nhật hình ảnh thành công',
    });
  });
});

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
// Tạo nhiều tài khoản sinh viên
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
    const header = jsonData[0];
    const maSoIndex = header.findIndex((row) => row === 'Mã SV');
    const hoIndex = header.findIndex((row) => row === 'Họ đệm');
    const tenIndex = header.findIndex((row) => row === 'Tên');
    const emailIndex = header.findIndex((row) => row.trim === 'Email');
    const soDienThoaiIndex = header.findIndex((row) => row === 'Số điện thoại');
    const lopIndex = header.findIndex((row) => row === 'Mã lớp');
    const ngaySinhIndex = header.findIndex((row) => row === 'Ngày sinh');
    const gioiTinhIndex = header.findIndex((row) => row === 'Giới tính');
    const dataRows = jsonData.slice(headerRowIndex + 1);
    const password = await bcrypt.hash('test1234', 12);
    const { hocKy, namHoc } = getCurrentHocKy();

    const sinhVienData = dataRows
      .filter((row) => row[lopIndex] && row[lopIndex].startsWith('DHHTTT'))
      .map((row) => {
        const maSo = row[maSoIndex];
        const email = emailIndex ? row[emailIndex] : null;
        const soDienThoai = (() => {
          let sdt = row[soDienThoaiIndex]?.toString() || '';

          if (/[^0-9]/.test(sdt)) {
            return null;
          }

          if (sdt.length === 9) {
            return `0${sdt}`; // Add '0' for 9-digit numbers
          } else if (sdt.length === 10) {
            return sdt; // Return as-is if valid 10-digit number
          }

          return null; // Set to null for numbers that are too short or long
        })();
        const hoTen = `${row[hoIndex]} ${row[tenIndex]}`;
        const ngaySinh =
          ngaySinhIndex && row[ngaySinhIndex]
            ? convertDate(row[ngaySinhIndex])
            : null;
        const lop = row[lopIndex];
        // eslint-disable-next-line no-nested-ternary
        const gioiTinh = gioiTinhIndex && row[gioiTinhIndex] === 'Nam' ? 0 : 1;
        return {
          maSo,
          hoTen,
          ngaySinh,
          soDienThoai,
          lop,
          gioiTinh,
          khoa: { ten: 'Công nghệ thông tin', vaiTro: 'Sinh viên' },
          boMon: { ten: 'Hệ thống thông tin', vaiTro: 'Sinh viên' },
          password,
          email,
          hinhAnh: 'public/hinhanh/iuh_logo_2.png',
          vaiTro: 0,
          hocKy,
          namHoc,
        };
      });

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
// Tạo nhiều tài khoản giảng viên
exports.insertManyGiangVien = catchAsync(async (req, res, next) => {
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
      (row) => row.includes('Mã GV') && row.includes('STT'),
    );
    if (headerRowIndex === -1) {
      return res
        .status(400)
        .json({ error: 'Không tìm thấy tiêu đề hợp lệ trong tệp Excel.' });
    }
    const header = jsonData[0];
    const maSoIndex = header.findIndex((row) => row.trim() === 'Mã GV');
    const hoIndex = header.findIndex((row) => row.trim() === 'Họ đệm');
    const tenIndex = header.findIndex((row) => row.trim() === 'Tên');
    const emailIndex = header.findIndex((row) => row.trim() === 'Email');
    const soDienThoaiIndex = header.findIndex(
      (row) => row.trim === 'Số điện thoại',
    );
    const lopIndex = header.findIndex((row) => row.trim() === 'Mã lớp');
    const ngaySinhIndex = header.findIndex((row) => row.trim() === 'Ngày sinh');
    const gioiTinhIndex = header.findIndex((row) => row.trim() === 'Giới tính');
    const vaiTroIndex = header.findIndex((row) => row.trim() === 'Vai trò');
    const dataRows = jsonData.slice(headerRowIndex + 1);
    const password = await bcrypt.hash('test1234', 12);
    const giangVienData = dataRows.map((row) => {
      const maSo = row[maSoIndex];
      const email = emailIndex ? row[emailIndex] : null;

      const soDienThoai = (() => {
        let sdt = row[soDienThoaiIndex]?.toString() || '';

        if (/[^0-9]/.test(sdt)) {
          return null;
        }

        if (sdt.length === 9) {
          return `0${sdt}`; // Add '0' for 9-digit numbers
        } else if (sdt.length === 10) {
          return sdt; // Return as-is if valid 10-digit number
        }

        return null; // Set to null for numbers that are too short or long
      })();
      const hoTen = `${row[hoIndex]} ${row[tenIndex]}`;
      const ngaySinh =
        ngaySinhIndex && row[ngaySinhIndex]
          ? convertDate(row[ngaySinhIndex])
          : null;
      const lop = row[lopIndex];
      // eslint-disable-next-line no-nested-ternary
      const gioiTinh = gioiTinhIndex && row[gioiTinhIndex] === 'Nam' ? 0 : 1;
      let vaiTro = 1;

      if (vaiTroIndex) {
        switch (row[vaiTroIndex]) {
          case 'Giảng viên':
            vaiTro = 1;
            break;
          case 'Quản lý môn học':
            vaiTro = 2;
            break;
          case 'Trưởng bộ môn':
            vaiTro = 3;
            break;
          default:
            vaiTro = 1;
        }
      }
      return {
        maSo,
        hoTen,
        ngaySinh,
        soDienThoai,
        lop,
        gioiTinh,
        khoa: { ten: 'Công nghệ thông tin', vaiTro: 'Sinh viên' },
        boMon: { ten: 'Hệ thống thông tin', vaiTro: 'Sinh viên' },
        password,
        email,
        hinhAnh: 'public/hinhanh/iuh_logo_2.png',
        vaiTro,
      };
    });

    const bulkOps = giangVienData.map((student) => ({
      updateOne: {
        filter: { maSo: student.maSo },
        update: { $setOnInsert: student },
        upsert: true,
      },
    }));

    await User.bulkWrite(bulkOps);

    fs.unlinkSync(filePath);
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
                  { $eq: ['$_id', '$$giangVienThucTap'] },
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
        vaiTro: 1,
      },
    },
    { $sort: { maSo: 1 } },
  ]);
  return [...danhSach.filter((user) => user._id.toString() !== id.toString())];
}

async function layDanhSachTroTruyenGiangVien(id) {
  const danhSach = await User.aggregate([
    {
      $match: {
        _id: id,
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
    { $sort: { maSo: 1 } },
  ]);
  return danhSach;
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
