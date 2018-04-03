module.exports = {
  badQuantity: (quantity) => {
    return {
      key: 'error.quantity',
      params: [quantity]
    };
  },
  beverageDoesNotExist: () => {
    return {
      key: 'error.beverage.notExists'
    };
  }
};
