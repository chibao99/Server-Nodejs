const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const User = require("../../models/User");
const auth = require("../../middleware/auth");

router.post(
  "/",
  [
    check("name", "Ten khong rong").not().isEmpty(),
    check("email", "Email Khong hop le").isEmail(),
    check("password", "Nhap mat khau lon hon 8 ky tu").isLength({ min: 9 }),
    check("phone", "Số điền thoại phải hợp lệ ").matches(
      /(03|07|08|09|01[2|6|8|9])+([0-9]{8})\b/
    ),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, phone, address, city, dis } = req.body;
    try {
      // Kiem tra user ton tai chua
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Email đã được sử dụng" }] });
      }
      let userPhone = await User.findOne({ phone });
      if (userPhone) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Số điện thoại đã được sử dụng" }] });
      }
      // Tao avatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });
      user = new User({
        name,
        email,
        password,
        avatar,
        phone,
        address,
        city,
        dis,
      });
      // Ma hoa pass
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      // return
      const payload = {
        user: {
          id: user.id,
        },
      };
      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ status: "success", data: { token, user } });
        }
      );
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server error");
    }
  }
);

router.put(
  "/editprofile",
  [
    check("name", "Ten khong rong").not().isEmpty(),
    check("email", "Email Khong hop le").isEmail(),
    check("phone", "Số điền thoại phải ").matches(
      /(03|07|08|09|01[2|6|8|9])+([0-9]{8})\b/
    ),
    check("address", "Dia chi khong rong").not().isEmpty(),
    check("city", "Thanh pho khong rong").not().isEmpty(),
    check("dis", "So nha khong rong").not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, phone, address, city, dis } = req.body;

    const profileNew = {};
    if (name) profileNew.name = name;
    if (email) profileNew.email = email;
    if (phone) profileNew.phone = phone;
    if (address) profileNew.address = address;
    if (city) profileNew.city = city;
    if (dis) profileNew.dis = dis;
    try {
      let user = await User.findById({ _id: req.user.id });
      if (user) {
        user = await User.updateOne({ _id: req.user.id }, { $set: profileNew });
        return res.json({ msg: true });
      }
      return res.json({ msg: false });
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.post(
  "/changePass",
  [
    check("passwordOld", "Mat khau cu phai 9 ky tu").isLength({ min: 9 }),
    check("passwordNew", "Mat khau moi phai 9 ky tu").isLength({ min: 9 }),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { passwordOld, passwordNew } = req.body;
    try {
      let user = await User.findById({ _id: req.user.id });
      if (!user) {
        return res.status(400).json({
          errors: [{ msg: "User khong ton tai" }],
        });
      }
      const isMatch = await bcrypt.compare(passwordOld, user.password);
      if (isMatch) {
        const salt = await bcrypt.genSalt(10);
        const passwordN = await bcrypt.hash(passwordNew, salt);
        user = await User.updateOne(
          { _id: req.user.id },
          { $set: { password: passwordN } }
        );
        return res.json({ msg: true });
      } else {
        return res.status(400).json({
          errors: [{ msg: "Mat khau cu khong dung" }],
        });
      }
    } catch (error) {
      res.status(500).send("Server error");
    }
  }
);

router.get("/getallcustomer", auth, async (req, res) => {
  try {
    const user = await User.findById({ _id: req.user.id });
    if (!user.isAdmin) {
      return res.status(400).json({
        errors: [{ msg: "Khong duoc phep lay" }],
      });
    }
    let users = await User.find().select("-password");
    res.json(users);
  } catch (error) {
    res.status(500).send("Server error");
  }
});

module.exports = router;
