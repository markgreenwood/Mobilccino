const chai = require('chai');
const sinon = require('sinon');
const orderSystemWith = require('../lib/orders');

const { expect } = chai;

describe('Customer displays order', () => {
  beforeEach(() => {
    this.orderDAO = {
      byId: sinon.stub()
    };
    this.orderSystem = orderSystemWith(this.orderDAO);
  });

  context('Given that the order is empty', () => {
    let result;

    beforeEach(async () => {
      this.orderId = 'some empty order id';
      this.orderDAO.byId.withArgs(this.orderId).resolves([]);
      result = await this.orderSystem.display(this.orderId);
    });

    it('will show no order items', () => {
      expect(result).to.have.property('items').that.is.empty;
    });

    it('will show 0 as the total', () => {
      expect(result).to.have.property('totalPrice').that.is.equal(0);
    });

    it('will only be possible to add a beverage', () => {
      expect(result).to.have.property('actions').that.is.deep.equal([{
        action: 'append-beverage',
        target: this.orderId,
        parameters: {
          beverageRef: null,
          quantity: 0
        }
      }]);
    });
  });

  context('Given that the order contains beverages', () => {
    let result;

    beforeEach(async () => {
      this.orderId = 'some non-empty order id';
      this.orderDAO.byId.withArgs(this.orderId).resolves([
        {
          beverage: {
            id: 'espresso id',
            name: 'Espresso',
            price: 1.50
          },
          quantity: 1
        },
        {
          beverage: {
            id: 'mochaccino id',
            name: 'Mochaccino',
            price: 2.30
          },
          quantity: 2
        }
      ]);
      result = await this.orderSystem.display(this.orderId);
    });

    it('will show one item per beverage', () => {
      expect(result).to.have.property('items').that.is.deep.equal([
        {
          beverage: {
            id: 'espresso id',
            name: 'Espresso',
            price: 1.50
          },
          quantity: 1
        },
        {
          beverage: {
            id: 'mochaccino id',
            name: 'Mochaccino',
            price: 2.30
          },
          quantity: 2
        }
      ]);
    });

    it('will show the sum of the unit prices as the total price', () => {
      expect(result).to.have.property('totalPrice').that.is.equal(6.10);
    });

    it('will be possible to place the order');

    it('will be possible to add a beverage');

    it('will be possible to remove a beverage');

    it('will be possible to change the quantity of a beverage');
  });

  context('Given that the order has pending messages', () => {
    it('will show the pending messages');
    it('there will be no more pending messages');
  });
});
