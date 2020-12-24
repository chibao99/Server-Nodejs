const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  catalog: { type: mongoose.SchemaTypes.ObjectId, ref: "catalog" },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  price: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    required: true,
  },
  inventory: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  discount: {
    type: Number,
    required: true,
    default:0
  },
});

module.exports = Product = mongoose.model("product", ProductSchema);
