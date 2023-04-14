import express from "express";
import { body } from "express-validator";
import { Product } from "../models/productSchema";
import { checkErrors, isAuth } from "./utils";

const router = express.Router();

export type Product = {
    _id: string;
    brand: string,
    model: string,
    car_model_year: number,
    price: number,
};

router.get('/products', async (_, res) => {
    res.json(await Product.find())
});

router.post(
    '/products',
    body('brand').notEmpty(),
    body('model').notEmpty(),
    body('car_model_year').notEmpty().isLength({ min: 4, max: 4 }),
    body('price').notEmpty(),
    isAuth,
    checkErrors,
    async (req, res) => {
        const { brand, model, car_model_year, price } = req.body;
        const product = new Product({
            brand,
            model,
            car_model_year,
            price,
        });
        //Adds document to collection
        const response = await product.save();
        res.status(201).json({
            message: "Product Inserted",
            id: response._id,
            brand: product.brand,
            model: product.model,
            car_model_year: product.car_model_year,
            price: product.price,
        });
    }
);

router.put(
    '/products/:_id',
    isAuth,
    checkErrors,
    async (req, res) => {
        const { brand, model, car_model_year, price } = req.body;
        const productFinder = await Product.findByIdAndUpdate(req.params._id, { brand: brand, model: model, car_model_year: car_model_year, price: price })
        if (productFinder) {
            const product = new Product({
                brand,
                model,
                car_model_year,
                price
            })
            //Edit document to collection
            res.status(201).json({ message: "product updated", product });
        }
        else {
            return res.status(404).json({ message: "product not found" })
        }
    }
);

router.delete(
    '/products/:_id',
    isAuth,
    checkErrors,
    async (req, res) => {
        const productDeleted = await Product.findByIdAndDelete(req.params._id);
        productDeleted ? res.status(201).json({ message: "product delete", productDeleted })
            : res.status(404).json({ message: "product not found" })
    }
);

export default router;