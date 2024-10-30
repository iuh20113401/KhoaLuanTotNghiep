const caiDat = require('../model/CaiDatModel');
const deTai = require('../model/deTaiModel');
const catchAsync = require('../utils/catchAsync');

/* eslint-disable no-else-return */
function getCurrentHocKy() {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth() + 1; // tháng từ 1-12
  const year = now.getFullYear();

  if (
    (month === 8 && day >= 5) ||
    (month > 8 && month < 12) ||
    (month === 12 && day <= 24)
  ) {
    // Trong khoảng từ 5/8 đến 24/12 => Học kỳ 1
    return { hocKy: 1, namHoc: `${year}-${year + 1}` };
  } else if ((month === 12 && day >= 25) || (month > 0 && month <= 5)) {
    // Trong khoảng từ 25/12 đến 31/5 => Học kỳ 2
    const adjustedYear = month === 12 ? year + 1 : year;
    return { hocKy: 2, namHoc: `${adjustedYear - 1}-${adjustedYear}` };
  } else {
    // Các tháng hè ngoài học kỳ (tháng 6 và 7)
    return { hocKy: null, namHoc: null };
  }
}
exports.get = catchAsync(async (req, res, next) => {
  let result = await caiDat.find();
  result = result[0];
  res.status(200).json({ status: 'success', data: { result } });
});
exports.resetDeTai = catchAsync(async (req, res, next) => {
  let result2;
  const results = await deTai.updateMany(
    {},
    {
      $set: {
        soLuongDoAn: 0,
        trangThai: 0,
      },
    },
  );
  if (results) {
    /* empty */
    result2 = await caiDat.updateMany(
      {},
      {
        $set: {
          isDangKyDeTai: false,
          isDangKyThucTap: false,
          namHoc: null,
          hocKy: null,
        },
      },
    );
  }
  if (!results || !result2) {
    res
      .status(500)
      .json({ status: 'fail', data: { message: 'External error' } });
    return;
  }
  res
    .status(200)
    .json({ status: 'success', data: { message: 'Reset thành công' } });
});
exports.capNhatDangKyDeTai = catchAsync(async (req, res, next) => {
  const { isOpen } = req.body; // lấy trạng thái từ payload
  const { namHoc, hocKy } = getCurrentHocKy();
  const updateOption = {
    isDangKyDeTai: isOpen,
    namHoc,
    hocKy,
  };
  const result = await caiDat.updateMany(
    {},
    {
      $set: updateOption,
    },
  );

  if (!result) {
    return res
      .status(500)
      .json({ status: 'fail', data: { message: 'External error' } });
  }

  const message = isOpen
    ? 'Mở đăng ký đề tài thành công'
    : 'Đóng đăng ký đề tài thành công';
  res.status(200).json({
    status: 'success',
    data: { message },
  });
});

exports.capNhatDangKyThucTap = catchAsync(async (req, res, next) => {
  const { isOpen } = req.body;
  const { namHoc, hocKy } = getCurrentHocKy();
  const updateOption = {
    isDangKyThucTap: isOpen,
    namHoc,
    hocKy,
  };
  const result = await caiDat.updateMany(
    {},
    {
      $set: updateOption,
    },
  );

  if (!result) {
    return res
      .status(500)
      .json({ status: 'fail', data: { message: 'External error' } });
  }

  const message = isOpen
    ? 'Mở đăng ký thực tập thành công'
    : 'Đóng đăng ký thực tập thành công';
  res.status(200).json({
    status: 'success',
    data: { message },
  });
});
