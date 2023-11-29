const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res, next) {
  const { data: {
    deliverTo,
    dishes,
    mobileNumber,
    quantity,
  } = {} } = req.body;
  const newOrder = {
    deliverTo,
    dishes,
    id: nextId(),
    mobileNumber,
    quantity,
  }

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function destroy(req, res, next) {
  orders.splice(res.locals.index, 1);
  res.sendStatus(204);
}

function hasBodyData(prop) {
  return function(req, res, next) {
    const { data = {} } = req.body;
    if (data[prop]) {
      return next();
    }

    next({
      message: `Dish must include ${prop}`,
      status: 400,
    });
  }
}

function hasMatchingOrderId(req, res, next) {
  const orderId =  req.params.orderId;
  const { data: { id } = {} } = req.body;

  if (!id || orderId === id) {
    return next();
  }

  next({
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
    status: 400,
  })
}

function hasOrder(req, res, next) {
  const { orderId } = req.params;
  const foundIndex = orders.findIndex(order => order.id === orderId);
  
  if (foundIndex > -1) {
    res.locals.order = orders[foundIndex];
    res.locals.index = foundIndex;
    return next();
  }

  next({
    message: `Order not found: ${orderId}`,
    status: 404,
  });
}

function hasValidDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    if (Array.isArray(dishes)) {
      if (dishes.length > 0) {
        return next();
      }
    }
  }

  next({
    message: `Order must include at least one dish`,
    status: 400,
  });
}

function hasValidQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  const foundIndex = dishes.findIndex(
    dish => !dish.quantity
    || typeof dish.quantity !== "number"
    || dish.quantity <= 0
  );

  if (foundIndex === -1) {
    return next();
  }

  next({
    message: `Dish ${foundIndex} must have a quantity that is an integer greater than 0`,
    status: 400,
  });
}

function hasValidDestroyStatus(req, res, next) {
  if (res.locals.order.status === "pending") {
    return next();
  }

  next({
    message: 'An order cannot be deleted unless it is pending',
    status: 400,
  });
}

function hasValidUpdateStatus(req, res, next) {
  const { data: { status } = {} } = req.body;

  if (status) {
    if (
      status === "pending"
      || status === "preparing"
      || status === "out-for-delivery"
    ) {
      return next();
    }
  }

  if (status === "delivered") {
    return next ({
      message: "A delivered order cannot be changed",
      status: 400,
    });
  }

  next({
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered",
    status: 400,
  });
}

function list(req, res, next) {
  res.json({ data: orders });
}

function read(req, res, next) {
  res.json({ data: res.locals.order });
}

function update(req, res, next) {
  const order = res.locals.order;
  const { data: { 
    deliverTo,
    dishes,
    mobileNumber,
    quantity,
    status,
  } = {} } = req.body;
  order.deliverTo = deliverTo;
  order.dishes = dishes;
  order.mobileNumber = mobileNumber;
  order.quantity = quantity;
  order.status = status;

  res.json({ data: order });
}

module.exports = {
  create: [
    hasBodyData('deliverTo'),
    hasBodyData('mobileNumber'),
    hasValidDishes,
    hasValidQuantity,
    create,
  ],
  destroy: [
    hasOrder,
    hasValidDestroyStatus,
    destroy,
  ],
  list,
  read: [
    hasOrder,
    read,
  ],
  update: [
    hasOrder,
    hasMatchingOrderId,
    hasBodyData('deliverTo'),
    hasBodyData('mobileNumber'),
    hasValidDishes,
    hasValidQuantity,
    hasValidUpdateStatus,
    update,
  ],
}
