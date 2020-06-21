// =========================================
// Airline Router:
// =========================================

// Import dependencies:
import express from "express";
import { registerAirline, payAirlineFee, getAllAirlines, getAirline } from "../controllers/airline";

// Create router:
const router = express.Router();

// Create routes:
router.get("/airlines", async (req, res, next) => {
  try {
    const airlines = await getAllAirlines();
    res.status(200).json({
      message: "Successfully fetched airlines",
      airlines
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) getting airlines",
      err: e
    });
  }
});

router.get("/airlines/:airline", async (req, res, next) => {
  try {
    const airline = await getAirline(req.params.airline);
    res.status(200).json({
      message: "Successfully fetched airline",
      airline
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) fetching airline",
      err: e
    });
  }
})

router.patch("/register", async (req, res, next) => {
    try {
      await registerAirline(req.body.sender, req.body.address, req.body.name);
      res.status(201).json({
        message: "Successfully voted for airline"
      });
    } catch(e) {
      console.log(e);
      res.status(500).json({
        message: "Error(s) registering airline",
        err: e
      });
    }
  }
);

router.post("/pay", async (req, res, next) => {
  try {
    await payAirlineFee(req.body.sender, req.body.value);
    res.status(200).json({
      message: "Successfully paid airline fee"
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) paying airline fee",
      err: e
    });
  }
});

export {
  router
}