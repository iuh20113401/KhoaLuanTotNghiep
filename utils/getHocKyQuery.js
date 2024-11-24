/* eslint-disable prefer-destructuring */
const caiDat = require('../model/CaiDatModel');

exports.getHocKyQuery = async (req) => {
  let hocKy = req.query.hocKy;
  let namHoc = req.query.namHoc;
  if (!hocKy && !namHoc) {
    try {
      const caiDatInfo = await caiDat.find();
      hocKy = caiDatInfo[0].hocKy;
      namHoc = caiDatInfo[0].namHoc;
    } catch (error) {
      console.error('Error fetching caiDat info:', error);
    }
  }
  hocKy = parseInt(hocKy, 10);

  return { hocKy, namHoc };
};
