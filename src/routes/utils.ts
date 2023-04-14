import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { Product } from "./product";
const jwtToken = "shhhhhhh";

//Middleware express-validator
export const checkErrors = (req: Request, res: Response, next: NextFunction) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//Middleware authorization
export const isAuth = ({ headers }: Request, res: Response, next: NextFunction) => {
  try {
    const auth = headers.authorization as string;
    const productVerify = jwt.verify(auth, jwtToken) as Product;
    if (productVerify) {
      next();
    }
  } catch (e) {
    res.status(401).json({ message: "UNAUTHORIZED" })
  }
}
