const express = require("express");
const router = express.Router();
const Catalog = require("../../models/Catalog");
//@route    GET api/products/:product_id
//@desc     Get product by id
//@access   Public
router.post("/", async (req, res) => {
  const { name } = req.body;
  try {
    catalog = new Catalog({ name });
    await catalog.save();
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});
//@route    GET api/catalog
//@desc     Get all catalog
//@access   Public
router.get("/", async (req, res) => {
  try {
    const catalogs = await Catalog.find();
    res.json(catalogs);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
});

module.exports = router;
