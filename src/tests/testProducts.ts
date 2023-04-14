import request from "supertest";
require("chai").should();
import bcrypt from "bcrypt";
import { app } from "../app";
import { Product as productSchema } from "../models/productSchema";
import { v4 } from "uuid";
import { assert } from "chai";
import mongoose from "mongoose";
import { isAuth } from "../routes/utils";
import { User as userSchema } from "../models/user";
import { saltRounds } from "../routes/auth";

const baseAuth = "/v1";

describe('endpoints', () => {
    /* const user = {
        name: "Carlo",
        surname: "Leonardi",
        email: "carloleonard83@gmail.com",
        password: "testtest",
    }; */
    const product = {
        _id: new mongoose.Types.ObjectId(),
        brand: "Fiat",
        model: "Punto",
        car_model_year: 1996,
        price: 1000,
    };

    /* describe("user UNATHORIZED", () => {
        before(async () => {
            const newUser = new userSchema({
                name: user.name,
                surname: user.surname,
                email: user.email,
                password: await bcrypt.hash(user.password, saltRounds),
                verify: v4(),
            });
            await newUser.save();
        });
        after(async () => {
            await userSchema.findOneAndDelete({ email: user.email });
        });
        it("test 401 UNATHORIZED", async () => {
            const { status } = await request(app)
                .post(`${baseAuth}/login`)
                .send({ email: user.email, password: user.password });
            status.should.be.equal(401);
        });
    }); */

    describe.only('Add products', () => {
        /* before(async () => {
            const newUser = new userSchema({
                name: user.name,
                surname: user.surname,
                email: user.email,
                password: await bcrypt.hash(user.password, saltRounds),
                verify: v4(),
            });
            await newUser.save();
        }); */
        after(async () => {
            await productSchema.findOneAndDelete({ model: product.model });
            /*  await userSchema.findOneAndDelete({ email: user.email }); */
        });
        it("test 400 missing brand", async () => {
            const productWithoutBrand = { ...product } as any;
            delete productWithoutBrand.brand;
            const { status } = await request(app)
                .post(`${baseAuth}/products`)
                .send(productWithoutBrand);
            status.should.be.equal(400);
        });
        it("test 400 missing model", async () => {
            const productWithoutmModel = { ...product } as any;
            delete productWithoutmModel.model;
            const { status } = await request(app)
                .post(`${baseAuth}/products`)
                .send(productWithoutmModel);
            status.should.be.equal(400);
        });
        it("test 400 missing car_model_year", async () => {
            const productWithoutmYear = { ...product } as any;
            delete productWithoutmYear.car_model_year;
            const { status } = await request(app)
                .post(`${baseAuth}/products`)
                .send(productWithoutmYear);
            status.should.be.equal(400);
        });
        it("test 400 missing price", async () => {
            const productWithoutmPrice = { ...product } as any;
            delete productWithoutmPrice.price;
            const { status } = await request(app)
                .post(`${baseAuth}/products`)
                .send(productWithoutmPrice);
            status.should.be.equal(400);
        });
        it("test 201 for insert product", async () => {
            const { body, status } = await request(app)
                .post(`${baseAuth}/products`)
                .send({product, _id: "Product Inserted"});
            status.should.be.equal(201);
            body.should.have.property("_id");
            body.should.have.property("brand").equal(product.brand);
            body.should.have.property("model").equal(product.model);
            body.should.have.property("car_model_year").equal(product.car_model_year);
            body.should.have.property("price").equal(product.price);
        });
    })

    describe('Put products', () => {
        before(async () => {
            const newProduct = new productSchema({
                _id: product._id,
                brand: product.brand,
                model: product.model,
                car_model_year: product.car_model_year,
                price: product.price
            });
            await newProduct.save()
        });
        after(async () => {
            await productSchema.findOneAndDelete({ _id: product._id });
        });
        it("test 404 product not found", async () => {
            await productSchema.findById({_id: product._id})
            const { status } = await request(app)
                .put(`${baseAuth}/products/:${product._id}`)
                .send({_id: "product does not exist" });
            status.should.be.equal(404);
        })
        it("test 201 product updated", async () => {
            await productSchema.findByIdAndUpdate(product._id,
                { brand: product.brand, model: product.model, car_model_year: product.car_model_year, price: product.price })
            const { body, status } = await request(app)
                .put(`${baseAuth}/products/:${product._id}`)
                .send({ _id: "product update" });
            status.should.be.equal(201);
            body.should.have.property("brand").equal(product.brand);
            body.should.have.property("model").equal(product.model);
            body.should.have.property("car_model_year").equal(product.car_model_year);
            body.should.have.property("price").equal(product.price);
        })
    })

    describe('Delete products', () => {
        before(async () => {
            const newProduct = new productSchema({
                _id: product._id,
                brand: product.brand,
                model: product.model,
                car_model_year: product.car_model_year,
                price: product.price
            });
            await newProduct.save()
        });
/*         after(async () => {
            await productSchema.findOneAndDelete({ _id: product._id });
        }); */
        it("test 404 product not found", async () => {
            await productSchema.findById({_id: product._id})
            const { status } = await request(app)
                .delete(`${baseAuth}/products/:${product._id}`)
                .send({_id: "product does not exist" });
            status.should.be.equal(404);
        })
        it("test 201 product delete", async () => {
            await productSchema.findByIdAndDelete(product._id);
            const { body, status } = await request(app)
                .delete(`${baseAuth}/products/:${product._id}`)
                .send({_id:"Product delete"});
            status.should.be.equal(201);
            body.should.have.property("brand").equal(product.brand);
            body.should.have.property("model").equal(product.model);
            body.should.have.property("car_model_year").equal(product.car_model_year);
            body.should.have.property("price").equal(product.price);
        })
    })

})