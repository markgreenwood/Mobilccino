const sinon = require('sinon');
const { expect } = require('chai');

module.exports = function () {
  const dao = {
    byId: sinon.stub(),
    update: sinon.stub()
  };
  const storage = {};

  storage.updateWillNotFail = function () {
    dao.update.resolves([]);
  };

  storage.dao = function () {
    return dao;
  };

  storage.alreadyContains = function (entity) {
    const { data } = entity;
    dao.byId
      .withArgs(entity.id)
      .resolves(data);
    return entity;
  };

  storage.toExpectUpdate = function (entity) {
    return expect(dao.update.calledWith(entity)).to.be.ok;
  };

  return storage;
};
