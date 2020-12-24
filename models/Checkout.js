const mongoose = require("mongoose");
const CheckoutSchema = new mongoose.Schema({
  user: {
    type: mongoose.SchemaTypes.ObjectId,
    ref: "user",
  },
  date: {
    type: Date,
    default: Date.now,
  },
  cthd: [
    {
      _id: false,
      product: { type: mongoose.SchemaTypes.ObjectId, ref: "product" },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
  address: {
    type: String,
    required: true,
  },
  status: {
    type: Boolean,
    default: false,
  },
  total: {
    type: String,
    required: true,
  },
});

module.exports = Checkout = mongoose.model("checkout", CheckoutSchema);
