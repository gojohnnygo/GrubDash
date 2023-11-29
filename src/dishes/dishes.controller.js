const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res, next) {
  const { data: {
    description,
    image_url,
    name,
    price,
  } = {} } = req.body;
  const newDish = {
    description,
    id: nextId(),
    image_url,
    name,
    price,
  }

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
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
    })
  }
}

function hasDish(req, res, next) {
  const dishId =  req.params.dishId;
  const foundDish = dishes.find(dish => dish.id === dishId);

  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }

  next({
    message: `Dish does not exist: ${dishId}.`,
    status: 404,
  })
}

function hasMatchingDishId(req, res, next) {
  const dishId =  req.params.dishId;
  const { data: { id } = {} } = req.body;

  if (!id || dishId === id) {
    return next();
  }

  next({
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
    status: 400,
  });
}

function hasValidPrice(req, res, next) {
  const { data = {} } = req.body;
  if (data.price) {
    if (typeof data.price === "number") {
      if (data.price > 0) {
        return next();
      }
    }
  }

  next({
    message: `Dish must have a price that is an integer greater than 0`,
    status: 400,
  });
}

function list(req, res, next) {
  res.json({ data: dishes });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res, next) {
  const dish = res.locals.dish;
  const { data: {
    description,
    image_url,
    name,
    price,
  } = {} } = req.body;
  dish.description = description;
  dish.image_url = image_url;
  dish.name = name;
  dish.price = price;

  res.json({ data: dish });
}

module.exports = {
  create: [
    hasBodyData('description'),
    hasBodyData('image_url'),
    hasBodyData('name'),
    hasBodyData('price'),
    hasValidPrice,
    create,
  ],
  list,
  read: [
    hasDish,
    read,
  ],
  update: [
    hasDish,
    hasMatchingDishId,
    hasBodyData('description'),
    hasBodyData('name'),
    hasBodyData('image_url'),
    hasBodyData('price'),
    hasValidPrice,
    update,
  ],
}