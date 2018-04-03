const R = require('ramda');

module.exports = function ({ orderDAO, messageDAO }) {
  return ({
    display: async (orderId) => {
      const items = await orderDAO.byId(orderId);
      const messages = await messageDAO.byId(orderId);
      const subTotal = R.converge(R.multiply, [R.pathOr(0, ['beverage', 'price']), R.propOr(0, 'quantity')]);
      const totalPrice = R.sum(R.map(subTotal, items));
      const actions = [
        {
          action: 'append-beverage',
          target: orderId,
          parameters: {
            beverageRef: null,
            quantity: 0
          }
        }
      ];

      if (items.length > 0) {
        actions.push({
          action: 'place-order',
          target: orderId
        });

        R.forEach((item) => {
          actions.push({
            action: 'remove-beverage',
            target: orderId,
            parameters: {
              beverageRef: item.beverage.id
            }
          });

          actions.push({
            action: 'edit-beverage',
            target: orderId,
            parameters: {
              beverageRef: item.beverage.id,
              newQuantity: item.quantity
            }
          });
        }, items);
      }

      messageDAO.update({ id: orderId, data: [] });

      return ({
        items,
        totalPrice,
        actions,
        messages
      });
    }
  });
};
