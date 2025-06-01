const mongoose = require("mongoose");

const restaurantsSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    image: { type: { uri: String }, required: true },
    description: { type: String, required: true },
    address: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    stars: { type: Number, required: true },
    reviews: { type: String, required: true },
    dishes_id: [
      { type: mongoose.Schema.Types.ObjectId, ref: "dishes", required: true },
    ],
  },
  {
    timestamps: true,
  }
);

const RestaurantsModel = mongoose.model("restaurants", restaurantsSchema);
module.exports = RestaurantsModel;
