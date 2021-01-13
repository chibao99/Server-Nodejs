const mongoose = require("mongoose");

const CommentSchema = mongoose.Schema({
  product: String,
  comments: [
    {
      rating: {
        type: Number,
        default: 0,
      },
      userComment: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: "user",
      },
      time: {
        type: Date,
        default: Date.now(),
      },
      content: String,
      response: [
        {
          user: {
            type: mongoose.SchemaTypes.ObjectId,
            ref: "user",
          },
          time: {
            type: Date,
            default: Date.now(),
          },
          content: String,
        },
      ],
    },
  ],
});

module.exports = Comments = mongoose.model("comment", CommentSchema);
