// =========================================
// Primary Application Router:
// =========================================

// Import dependencies:
import express from "express";
const router = express.Router();

// Import Routers:
import { router as oracleRouter } from "./oracle";
import { router as airlineRouter } from "./airline";

router.get("/", (req, res) => {
  res.status(200).send({
    message: "An API for use with your Dapp!"
  });
});

router.use("/oracle", oracleRouter);
router.use("/airline", airlineRouter);

export {
  router
}