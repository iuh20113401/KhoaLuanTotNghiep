exports.getCurrentHocKy = () => {
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
  }
  if ((month === 12 && day >= 25) || (month > 0 && month <= 5)) {
    // Trong khoảng từ 25/12 đến 31/5 => Học kỳ 2
    const adjustedYear = month === 12 ? year + 1 : year;
    return { hocKy: 2, namHoc: `${adjustedYear - 1}-${adjustedYear}` };
  }
  // Các tháng hè ngoài học kỳ (tháng 6 và 7)
  return { hocKy: null, namHoc: null };
};
