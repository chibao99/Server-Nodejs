const express = require("express");
const router = express.Router();
const Checkout = require("../../models/Checkout");
const auth = require("../../middleware/auth");
const nodemailer = require("nodemailer");
const { check } = require("express-validator");

//@route    POST /api/checkout
//@desc     Payment product
//@access   Public
router.post("/", auth, async (req, res) => {
  const { hd } = req.body;
  try {
    const hoadon = new Checkout(hd);
    if (hoadon) {
      // let transporter = nodemailer.createTransport({
      //   service: "Gmail",
      //   auth: {
      //     user: "vinhthanhvip0@gmail.com",
      //     pass: "0972311472",
      //   },
      // });
      // let mainOptions = {
      //   from: "Bao Dep Trai",
      //   to: "chibao9965@gmail.com",
      //   subject: "test thoi lam gi cang",
      //   text: "bao.xml",
      //   html: "<p>Xin chao day la bao</p>",
      // };
      // transporter.sendMail(mainOptions, (err, info) => {
      //   if (err) {
      //     console.log(err);
      //     return res.json({ msg: err });
      //   } else {
      //     console.log("Thanh Cong " + info.response);
      //   }
      // });
    }
    await hoadon.save();
    res.json({ msg: true });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route    GET /api/checkout
//@desc     Get checkout by user
//@access   Public

router.get("/", auth, async (req, res) => {
  try {
    const checkouts = await Checkout.find({ user: req.user.id }).populate(
      "cthd.product"
    );
    return res.json({ status: "success", data: checkouts });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.get("/getallcheckout", auth, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    if (!user.isAdmin) {
      return res.status(400).json({
        errors: [{ msg: "Khong duoc phep lay" }],
      });
    }
    const checkouts = await Checkout.find().populate("cthd.product user");
    return res.json({ checkouts });
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

router.post(
  "/accesscheckout",
  [
    check("status", "Khong rong").not().isEmpty(),
    check("id", "Khong rong").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const user = await User.findById({ _id: req.user.id });
    if (!user.isAdmin) {
      return res.status(400).json({ msg: false });
    }
    const { status, id } = req.body;
    try {
      let checkout = await Checkout.findById({ _id: id });
      if (checkout) {
        checkout = await Checkout.updateOne(
          { _id: id },
          { $set: { status: status } }
        );
        res.json({ msg: true });
      }
    } catch (error) {
      res.status(500).send("server error");
    }
  }
);

module.exports = router;
