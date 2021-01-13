const express = require("express");
const router = express.Router();
const Comment = require("../../models/Comment");
const auth = require("../../middleware/auth");

router.post("/newcomments", auth, async (req, res) => {
  const { content, product } = req.body;
  let comments = [
    {
      userComment: req.user.id,
      content: content,
    },
  ];
  try {
    let newComment = new Comment({
      comments: comments,
      product: product,
    });
    await newComment.save();
    res.json({ msg: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/addcommnet", auth, async (req, res) => {
  const { productID, content } = req.body;
  try {
    const comment = {
      userComment: req.user.id,
      content: content,
    };
    let comments = await Comment.findOne({ product: productID });
    if (comments) {
      comments = await Comment.updateOne(
        { product: productID },
        { $push: { comments: { $each: [comment], $position: 1 } } }
      );
      res.json({ msg: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/addresponse/:productID/:commentID", auth, async (req, res) => {
  const { content } = req.body;
  const { productID, commentID } = req.params;
  try {
    let comments = await Comment.findOne({ product: productID });
    if (comments) {
      comments.comments.forEach(async (e) => {
        if (e._id.toString() == commentID) {
          e.response.push({ user: req.user.id, content });
          await comments.save();
        }
      });
    }
    res.json({ msg: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

router.get("/:productID", async (req, res) => {
  try {
    const comments = await Comment.find({
      product: req.params.productID,
    })
      .populate("comments.userComment comments.response.user")
      .limit(2);
    res.json({ comments });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

router.post("/editrating", auth, async (req, res) => {
  try {
    const { productID, rating } = req.body;
    let comment = await Comment.findOne({ product: productID });
    if (comment) {
      comment = await Comment.update(
        { "comments.userComment": req.user.id },
        { $set: { "comments.$.rating": rating } }
      );
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("server error");
  }
});

module.exports = router;
