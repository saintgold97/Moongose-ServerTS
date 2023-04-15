import { NextFunction, Response, Request } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { User } from "../models/user";
const jwtToken = "shhhhhhh";

//Middleware express-validator
export const checkErrors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Finds the validation errors in this request and wraps them in an object with handy functions
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    if (errors.array()[0].param === "authorization") {
      return res.status(401).json({ errors: errors.array() });
    }
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

//Middleware authorization
export const isAuth = async (
  { headers }: Request,
  res: Response,
  next: NextFunction
) => {
  const auth = headers.authorization as string;
  try {
    const decodedToken = jwt.verify(auth, jwtToken) as { id: string };
    const user = await User.findById(decodedToken.id);
    if (user) {
      res.locals.userFinded = user;
      return next();
    } else {
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
