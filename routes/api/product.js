const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Product = require("../../models/Product");
const User = require("../../models/User");
const auth = require("../../middleware/auth");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function (req, file, cb) {
    const now = new Date().toISOString();
    const date = now.replace(/:/g, "-");
    cb(null, date + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

//@route    POST api/products
//@desc     Add product
//@access   Public
router.post(
  "/",
  auth,
  upload.single("image"),
  [
    check("name", "Tên không được để rỗng").not().isEmpty(),
    check("price", "Giá không được để rỗng").not().isEmpty(),
    check("desc", "Mô tả không được để rỗng").not().isEmpty(),
    check("discount", "Giảm Giá không được để rỗng").not().isEmpty(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const user = await User.findById({ _id: req.user.id });
    if (!user.isAdmin) {
      return res.status(400).json({
        errors: [{ msg: "Khong duoc phep them" }],
      });
    }
    const { catalog, name, price, inventory, desc, discount } = req.body;
    const image =
      req.protocol + "://" + req.hostname + ":5000/" + req.file.path;
    try {
      product = new Product({
        catalog,
        name,
        image,
        price,
        inventory,
        desc,
        discount
      });
      await product.save();
      res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

//@route    DELETE api/products/:product_id
//@desc     Delete products by ID
//@access   Private
router.delete("/:product_id", auth, async (req, res) => {
  try {
    let user = await User.findById({ _id: req.user.id });
    if (!user.isAdmin) {
      return res.status(400).json({
        errors: [{ msg: "Khong duoc phep lay" }],
      });
    }
    await Product.updateOne(
      { _id: req.params.product_id },
      { $set: { inventory: 0 } }
    );
    res.json({ msg: true });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    PUT api/products/edit/:product_id
//@desc     Edit product
//@access   Private
router.put(
  "/edit/:product_id",
  [
    check("name", "Tên không được để rỗng").not().isEmpty(),
    check("price", "Giá không được để rỗng").not().isEmpty(),
    check("desc", "Mô tả không được để rỗng").not().isEmpty(),
  ],
  upload.single("image"),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, price, inventory, desc } = req.body;
    const image =
      req.protocol + "://" + req.hostname + ":5000/" + req.file.path;
    const productFields = {};
    if (name) productFields.name = name;
    if (image) productFields.image = image;
    if (price) productFields.price = price;
    if (inventory) productFields.inventory = inventory;
    if (desc) productFields.desc = desc;
    try {
      let product = await Product.findById(req.params.product_id);
      if (product) {
        product = await Product.updateOne(
          { _id: req.params.product_id },
          { $set: productFields }
        );
        res.json({ msg: "Update success" });
      }
      return res.json(product);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

//@route    PUT api/products/edit/inventory/:product_id
//@desc     Edit inventory product
//@access   Private
router.put("/edit/inventory/:product_id", async (req, res) => {
  const { quantity } = req.body;
  try {
    let product = await Product.findById(req.params.product_id);
    if (product.inventory >= quantity) {
      let temp = product.inventory - quantity;
      product = await Product.updateOne(
        { _id: req.params.product_id },
        { $set: { inventory: temp } }
      );
      return res.json({ msg: "Update success" });
    } else {
      return res.json({ msg: "Số lượng hàng không đủ" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

//@route    GET api/products/:product_id
//@desc     Get product by id
//@access   Public
router.get("/:product_id", async (req, res) => {
  try {
    const products = await Product.find({
      _id: req.params.product_id,
    }).populate("product", ["name", "image", "price", "inventory", "desc"]);
    res.json(products);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

//@route    GET api/products/:product_id
//@desc     Get product by id
//@access   Public
router.get("/catalog/:id", async (req, res) => {
  try {
    const products = await Product.find({ catalog: req.params.id });

    res.json(products);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

//@route    GET api/products?page&limit
//@desc     Get product by page
//@access   Public

router.get("/", async (req, res) => {
  try {
    const page = req.query.page;
    const limit = req.query.limit;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const results = {};
    const products = await Product.find();
    results.totals = products.length;
    results.results = products.slice(startIndex, endIndex);
    if (!page && !limit) {
      results.results = products;
    }
    res.json(results);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
