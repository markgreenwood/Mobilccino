const R = require('ramda');

module.exports = function (orderDAO) {
  return ({
    display: async (orderId) => {
      const items = await orderDAO.byId(orderId);
      const subTotal = R.converge(R.multiply, [R.pathOr(0, ['beverage', 'price']), R.propOr(0, 'quantity')]);
      const totalPrice = R.sum(R.map(subTotal, items));

      return ({
        items,
        totalPrice,
        actions: [
          {
            action: 'append-beverage',
            target: orderId,
            parameters: {
              beverageRef: null,
              quantity: 0
            }
          }
        ]
      });
    }
  });
};
