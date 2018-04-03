const chai = require('chai');
const orderSystemWith = require('../lib/orders');
const newStorage = require('./support/storageDouble');
const order = require('./support/examples/orders');
const errors = require('./support/examples/errors');

const { expect } = chai;

describe('Customer displays order', () => {
  beforeEach(() => {
    this.orderStorage = newStorage();
    this.messageStorage = newStorage();
    this.orderSystem = orderSystemWith({
      orderDAO: this.orderStorage.dao(),
      messageDAO: this.messageStorage.dao()
    });
  });

  context('Given that the order is empty', () => {
    let result;

    beforeEach(async () => {
      this.order = this.orderStorage.alreadyContains(order.empty());
      this.messages = this.messageStorage.alreadyContains({
        id: this.order.id,
        data: []
      });
      this.messageStorage.updateWillNotFail();
      this.orderActions = order.actionsFor(this.order);
      result = await this.orderSystem.display(this.order.id);
    });

    it('will show no order items', () => expect(result).to.have.property('items').that.is.empty);

    it('will show 0 as the total', () => expect(result).to.have.property('totalPrice').that.is.equal(0));

    it(
      'will only be possible to add a beverage',
      () => expect(result).to.have.property('actions').that.is.deep.equal([this.orderActions.appendItem()])
    );
  });

  function scenarioOrderContainsBeverages(testExample) {
    context(`Given that the order contains ${testExample.title}`, () => {
      let result;

      beforeEach(async () => {
        this.order = this.orderStorage.alreadyContains(order.withItems(testExample.items));
        this.messages = this.messageStorage.alreadyContains({
          id: this.order.id,
          data: []
        });
        this.messageStorage.updateWillNotFail();
        this.orderActions = order.actionsFor(this.order);
        result = await this.orderSystem.display(this.order.id);
      });

      it(
        'will show one item per beverage',
        () => expect(result).to.have.property('items').that.is.deep.equal(this.order.data)
      );

      it(
        'will show the sum of the unit prices as the total price',
        () => expect(result).to.have.property('totalPrice').that.is.equal(testExample.expectedTotalPrice)
      );

      it(
        'will be possible to place the order',
        () => expect(result).to.have.property('actions').that.deep.include(this.orderActions.place())
      );

      it(
        'will be possible to add a beverage',
        () => expect(result).to.have.property('actions').that.deep.include(this.orderActions.appendItem())
      );

      testExample.items.forEach((itemExample, i) => {
        it(
          `will be possible to remove the ${itemExample.beverage}`,
          () => expect(result).to.have.property('actions')
            .that.deep.include(this.orderActions.removeItem(i))
        );

        it(
          `will be possible to change the quantity of ${itemExample.beverage}`,
          () => expect(result).to.have.property('actions')
            .that.deep.include(this.orderActions.editItemQuantity(i))
        );
      });
    });
  }

  [
    {
      title: '1 Espresso and 2 Mocaccini',
      items: [
        { beverage: 'espresso', quantity: 1 },
        { beverage: 'mocaccino', quantity: 2 }
      ],
      expectedTotalPrice: 6.10
    },
    {
      title: '1 Mocaccino, 2 Espressi, and 1 Capuccino',
      items: [
        { beverage: 'espresso', quantity: 2 },
        { beverage: 'mocaccino', quantity: 1 },
        { beverage: 'capuccino', quantity: 1 }
      ],
      expectedTotalPrice: 7.30
    }
  ].forEach(scenarioOrderContainsBeverages.bind(this));

  function scenarioOrderHasPendingMessages(testExample) {
    context(`Given that the order has pending the following messages: ${testExample.title}`, () => {
      let result;

      beforeEach(async () => {
        this.order = this.orderStorage.alreadyContains(order.empty());
        this.messages = this.messageStorage.alreadyContains({
          id: this.order.id,
          data: testExample.pendingMessages
        });
        this.messageStorage.updateWillNotFail();
        result = await this.orderSystem.display(this.order.id);
      });

      it(
        'will show the pending messages',
        () => expect(result).to.have.property('messages').that.is.deep.equal(this.messages.data)
      );

      it(
        'there will be no more pending messages',
        () => {
          const orderId = this.order.id;
          return this.messageStorage.toExpectUpdate({ id: orderId, data: [] });
        }
      );
    });
  }

  [
    {
      title: 'bad quantity [-1]',
      pendingMessages: [
        errors.badQuantity(-1)
      ]
    },
    {
      title: 'beverage does not exist, bad quantity[0]',
      pendingMessages: [
        errors.beverageDoesNotExist(),
        errors.badQuantity(0)
      ]
    }
  ].forEach(scenarioOrderHasPendingMessages.bind(this));
});
