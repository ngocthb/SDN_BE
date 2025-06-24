const express = require('express');
const routerSubscription = express.Router();
const subscriptionController = require('../controller/SubscriptionController');
const {
    authUserMiddleware,
} = require("../middleware/authMiddleware");

routerSubscription.use(authUserMiddleware);

routerSubscription
    .post('/create', subscriptionController.createSubscription);

routerSubscription
    .get('/current', subscriptionController.getCurrentSubscription);

routerSubscription
    .get('/history', subscriptionController.getSubscriptionHistory);

routerSubscription
    .put('/cancel', subscriptionController.cancelSubscription);

routerSubscription
    .put('/extend', subscriptionController.extendSubscription);

module.exports = routerSubscription;
