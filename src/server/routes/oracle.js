// =========================================
// Oracle Router:
// =========================================

// Import Dependencies:
import express from "express";
import { registerOracle, getMyIndexes } from "../controllers/oracle";

// Create router:
const router = express.Router();

// Create routes:
router.route("/")
  .post( async (req, res, next) => {
    try {
      await registerOracle(req.body.address);
      res.status(201).send({
        message: "Successfully registered oracle"
      });
    } catch(e) {
      console.log(e);
      res.status(500).json({
        message: "Error(s) registering oracle",
        err: e
      });
    }
  }
);

router.get("/indexes/:address", async (req, res, next) => {
  try {
    const indexes = await getMyIndexes(req.params.address);
    res.status(200).json({
      message: "Successfully fetched indexes",
      indexes
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) fetching oracle indexes",
      err: e
    });
  }
});

export {
  router
}