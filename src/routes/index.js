// const AuthRouter = require("./AuthRouter");
const CategoriesRouter = require("./CategoriesRouter");
const RestaurantsRouter = require("./RestaurantsRouter");
const DishesRouter = require("./DishesRouter");
const UserRouter = require("./UserRouter");
const OrderRouter = require("./OrderRouter");
const TypeRouter = require("./TypeRouter");
const CartRouter = require("./CartRouter");
const routes = (app) => {
  // app.use("/api/auth", AuthRouter);
  app.use("/api/categories", CategoriesRouter);
  app.use("/api/restaurants", RestaurantsRouter);
  app.use("/api/dishes", DishesRouter);
  app.use("/api/user", UserRouter);
  app.use("/api/orders", OrderRouter);
  app.use("/api/types", TypeRouter);
  app.use("/api/cart", CartRouter);
};

module.exports = routes;
