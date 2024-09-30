module.exports = (obj, ...filterFields) => {
  const newObj = {};
  Object.keys(obj).forEach((element) => {
    if (filterFields.includes(element)) {
      newObj[element] = obj[element];
    }
  });
  return newObj;
};
