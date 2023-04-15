import express from "express";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import jwt from "jsonwebtoken";
import { body, header } from "express-validator";
import { User } from "../models/user";
import { checkErrors, isAuth } from "./utils";
export const saltRounds = 10;
const jwtToken = "shhhhhhh";

const router = express.Router();

//Active server check
router.get("/status", (_, res) => res.json({ message: "Server is running!" }));

//EndPoint signup
router.post(
  "/signup",
  body("email").isEmail(),
  body("password").isLength({ min: 8 }).notEmpty(),
  body("name").notEmpty(),
  body("surname").notEmpty(),
  checkErrors,
  async (req, res) => {
    try {
      const verify = v4();
      const { name, surname, email, password } = req.body;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      const user = new User({
        name,
        surname,
        email,
        password: hashedPassword,
        verify,
      });
      //Adds document to collection
      const response = await user.save();
      res.status(201).json({
        name: user.name,
        id: response._id,
        surname: user.surname,
        email: user.email,
      });
    } catch (e) {
      return res.status(409).json({ message: "Email is just present" });
    }
  }
);

//EndPoint validate/tokenVerify
router.get("/validate/:tokenVerify", async (req, res) => {
  const userVerify = await User.findOneAndUpdate(
    { verify: req.params.tokenVerify },
    { $unset: { verify: 1 } }
  );
  userVerify
    ? res.status(200).json({ message: "User enabled" })
    : res.status(400).json({ message: "token not valid" });
});

//EndPoint login
router.post(
  "/login",
  body("email").isEmail(),
  body("password").isLength({ min: 8 }),
  checkErrors,
  async ({ body }, res) => {
    try {
      const { email, password } = body;
      //check email if password found
      const userValid = await User.findOne({ email: email });
      //If the user exists and the encrypted password matches it returns the token
      if (
        userValid &&
        !userValid.verify &&
        (await bcrypt.compare(password, userValid.password!))
      ) {
        const token = jwt.sign(
          {
            id: userValid._id,
            name: userValid.name,
            surname: userValid.surname,
            email: userValid.email,
          },
          jwtToken
        );
        return res.status(200).json({ token });
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

//EndPoint me
router.get(
  "/me",
  header("authorization").isJWT(),
  checkErrors,
  isAuth,
  async (_, res) => {
    try {
      const userFinded = res.locals.userFinded;
      res.json({
        id: userFinded._id,
        name: userFinded.name,
        surname: userFinded.surname,
        email: userFinded.email,
      });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
