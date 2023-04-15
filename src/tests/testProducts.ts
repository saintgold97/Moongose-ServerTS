import request from "supertest";
require("chai").should();
import bcrypt from "bcrypt";
import { app } from "../app";
import { Product } from "../models/productSchema";
import { User as userSchema } from "../models/user";
import { saltRounds } from "../routes/auth";
import jwt from "jsonwebtoken";
const jwtToken = "shhhhhhh";

const basicUrl = "/v1/products";

describe("products", () => {
  const product = {
    brand: "Fiat",
    model: "Punto",
    car_model_year: 1996,
    price: 1000,
  };
  const user = {
    name: "Roberto",
    surname: "Santoro",
    email: "rob@outlook.it",
    password: "testtest",
  };
  let token: string;
  before(async () => {
    const newUser = new userSchema({
      name: user.name,
      surname: user.surname,
      email: user.email,
      password: await bcrypt.hash(user.password, saltRounds),
    });
    await newUser.save();
    token = jwt.sign(
      {
        id: newUser._id,
        email: newUser.email,
        name: newUser.name,
        surname: newUser.surname,
      },
      jwtToken
    );
    console.log("token:", token);
  });
  after(async () => {
    await userSchema.findOneAndDelete({ email: user.email });
  });

  describe.only("create product", () => {
    let id: string;
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test 401 UNATHORIZED", async () => {
      const { status } = await request(app).post(basicUrl).send(product);
      status.should.be.equal(401);
    });
    it("test 400 missing brand", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.brand;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct)
        .set({ authorization: token });
      status.should.be.equal(400);
    });
    it("test 400 missing model", async () => {
      const fakeProduct = { ...product } as any;
      delete fakeProduct.model;
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct)
        .set({ authorization: token });
      status.should.be.equal(400);
    });
    it("test 400 car_model_year not number", async () => {
      const fakeProduct = { ...product } as any;
      fakeProduct.price = "pippo";
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send(fakeProduct)
        .set({ authorization: token });
      status.should.be.equal(400);
    });
    it("test 400 price not number", async () => {
      const fakeProduct = { ...product } as any;
      fakeProduct.price = "pippo";
      const { status } = await request(app)
        .post(`${basicUrl}`)
        .send({ fakeProduct })
        .set({ authorization: token });
      status.should.be.equal(400);
    });
    it("test 201 for insert product", async () => {
      const { body, status } = await request(app)
        .post(basicUrl)
        .send(product)
        .set({ authorization: token });
      status.should.be.equal(201);
      body.should.have.property("_id");
      body.should.have.property("brand").equal(product.brand);
      body.should.have.property("model").equal(product.model);
      body.should.have.property("car_model_year").equal(product.car_model_year);
      body.should.have.property("price").equal(product.price);
      id = body._id;
    });
  });

  describe("Update products", () => {
    let id: string;
    const newBrand = "Nissan";
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test failed 401", async () => {
      const { status } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send({ ...product, brand: newBrand });
      status.should.be.equal(401);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app)
        .put(`${basicUrl}/${id}`)
        .send({
          message: "product updated",
          brand: newBrand,
          _id: id,
        })
        .set({ authorization: token });
      status.should.be.equal(200);
      console.log(product);
      console.log(body);
      body.should.have.property("product");
      if (body.product.brand && body.product._id) {
        body.product.should.have.property("_id");
        body.product.should.have.property("brand").equal(newBrand);
      }
    });
    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app)
        .put(`${basicUrl}/${fakeId}`)
        .send({ ...product, brand: newBrand })
        .set({ authorization: token });
      status.should.be.equal(404);
    });
  });

  describe("Delete products", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    it("test failed 401", async () => {
      const { status } = await request(app).delete(`${basicUrl}/${id}`);
      status.should.be.equal(401);
    });
    it("test success 200", async () => {
      const { status } = await request(app)
        .delete(`${basicUrl}/${id}`)
        .set({ authorization: token });
      status.should.be.equal(200);
    });
  });

  describe("get product", () => {
    let id: string;
    before(async () => {
      const p = await Product.create(product);
      id = p._id.toString();
    });
    after(async () => {
      await Product.findByIdAndDelete(id);
    });
    it("test success 200", async () => {
      const { status, body } = await request(app).get(`${basicUrl}/${id}`);
      status.should.be.equal(200);
      body.should.have.property("_id").equal(id);
      body.should.have.property("brand").equal(product.brand);
      body.should.have.property("model").equal(product.model);
      body.should.have.property("car_model_year").equal(product.car_model_year);
      body.should.have.property("price").equal(product.price);
    });
    it("test unsuccess 404 not valid mongoId", async () => {
      const fakeId = "a" + id.substring(1);
      const { status } = await request(app).get(`${basicUrl}/${fakeId}`);
      status.should.be.equal(404);
    });
  });

  describe("get products", () => {
    let ids: string[] = [];
    const products = [
      {
        brand: "Nissan",
        model: "Juke",
        car_model_year: 2020,
        price: 25000,
      },
      {
        brand: "Alfa Romeo",
        model: "Giulietta",
        car_model_year: 2012,
        price: 10000,
      },
      {
        brand: "Alfa Romeo",
        model: "Giulia",
        car_model_year: 2018,
        price: 30000,
      },
    ];
    before(async () => {
      const response = await Promise.all([
        Product.create(products[0]),
        Product.create(products[1]),
        Product.create(products[2]),
      ]);
      ids = response.map((item) => item._id.toString());
    });
    after(async () => {
      await Promise.all([
        Product.findByIdAndDelete(ids[0]),
        Product.findByIdAndDelete(ids[1]),
        Product.findByIdAndDelete(ids[2]),
      ]);
    });

    it("test success 200", async () => {
      const { status, body } = await request(app).get(basicUrl);
      status.should.be.equal(200);
      body.should.have.property("length").equal(products.length);
    });

    it("test success 200 with query params", async () => {
      const { status, body } = await request(app).get(
        `${basicUrl}?brand=Nissan`
      );
      status.should.be.equal(200);
      body.should.have.property("length").equal(1);
    });
  });
});
