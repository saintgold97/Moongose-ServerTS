import express, { Request, Response, NextFunction } from "express";
export const app = express();
import mongoose from "mongoose";
import auth from "./routes/auth";
import product from "./routes/product";
app.use(express.json());

app.use("/v1/auth", auth);
app.use("/v1", product);

//SERVER
app.listen(process.env.PORT || 3001, async () => {
  console.log("Server is running");
  await
    mongoose.connect(`mongodb://127.0.0.1:27017/${process.env.DB}`)
      .then(() => {
        console.log('| Connection to MongoDB | HOST: localhost:27017');
      })
      .catch((error) => {
        console.log(
          '| An error occurred while connecting to MongoDB: ',
          error
        );
      });
});

export default app;
