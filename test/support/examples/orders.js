const beverage = require('./beverages');

let counter = 0;

function asOrderItem(itemExample) {
  return {
    beverage: beverage[itemExample.beverage](),
    quantity: itemExample.quantity
  };
}

module.exports = {
  empty: () => {
    return {
      id: '<empty order>',
      data: []
    };
  },
  withItems: (itemExamples) => {
    counter += 1;
    return {
      id: `<non-empty order ${counter}>`,
      data: itemExamples.map(asOrderItem)
    };
  },
  actionsFor: (order) => {
    return {
      removeItem: (index) => {
        const item = order.data[index];
        return {
          action: 'remove-beverage',
          target: order.id,
          parameters: {
            beverageRef: item.beverage.id
          }
        };
      },
      editItemQuantity: (index) => {
        const item = order.data[index];
        return {
          action: 'edit-beverage',
          target: order.id,
          parameters: {
            beverageRef: item.beverage.id,
            newQuantity: item.quantity
          }
        };
      },
      appendItem: () => {
        return {
          action: 'append-beverage',
          target: order.id,
          parameters: {
            beverageRef: null,
            quantity: 0
          }
        };
      },
      place: () => {
        return {
          action: 'place-order',
          target: order.id
        };
      }
    };
  }
};
