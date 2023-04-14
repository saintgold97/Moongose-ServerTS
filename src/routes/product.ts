import express from "express";
import { body, header, param, query } from "express-validator";
import { Product } from "../models/productSchema";
import { checkErrors, isAuth } from "./utils";

const router = express.Router();

router.post(
  "/",
  header("authorization").isJWT(),
  body("brand").exists().isString(),
  body("model").exists().isString(),
  body("car_model_year").exists().isLength({ min: 4, max: 4 }).isNumeric(),
  body("price").exists().isNumeric(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { brand, model, car_model_year, price } = req.body;
    const product = new Product({
      brand,
      model,
      car_model_year,
      price,
    });
    //Adds document to collection
    const productSaved = await product.save();
    res.status(201).json({
      message: "Product Inserted",
      productSaved,
    });
  }
);

router.put(
  "/:id",
  header("authorization").isJWT(),
  param("id").isMongoId(),
  body("brand").exists().optional().isString(),
  body("model").exists().optional().isString(),
  body("car_model_year")
    .optional()
    .exists()
    .isLength({ min: 4, max: 4 })
    .isNumeric(),
  body("price").optional().exists().isNumeric(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { id } = req.params;
    const { brand, model, car_model_year, price } = req.body;
    try {
      const productFinder = await Product.findByIdAndUpdate(id, {
        brand: brand,
        model: model,
        car_model_year: car_model_year,
        price: price,
      });
      if (!productFinder) {
        return res.status(404).json({ message: "product not found" });
      } else {
        const product = new Product({
          brand,
          model,
          car_model_year,
          price,
        });
        //Edit document to collection
        res.status(200).json({ message: "product updated", product });
      }
    } catch (err) {
      res.status(500).json({ err });
    }
  }
);

router.delete(
  "/:id",
  header("authorization").isJWT(),
  param("id").isMongoId(),
  checkErrors,
  isAuth,
  async (req, res) => {
    const { id } = req.params;
    const productDeleted = await Product.findByIdAndDelete(id);
    productDeleted
      ? res.status(200).json({ message: "product delete", productDeleted })
      : res.status(404).json({ message: "product not found" });
  }
);

router.get(
  "/",
  query("brand").optional().isString(),
  query("model").optional().isString(),
  query("car_model_year").optional().isNumeric(),
  query("price").optional().isLength({ min: 4, max: 4 }).isNumeric(),
  checkErrors,
  async (req, res) => {
    const products = await Product.find({ ...req.query });
    res.json(products);
  }
);

router.get("/:id", param("id").isMongoId(), checkErrors, async (req, res) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product) {
    return res.status(404).json({ message: "product not found" });
  }
  res.json(product);
});

export default router;
