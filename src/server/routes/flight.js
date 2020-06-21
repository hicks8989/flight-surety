// =========================================
// Airline Router:
// =========================================

// Import dependencies:
import express from "express";
import { registerFlight, getFlight, getAllFlights, buy, withdraw } from "../controllers/flight";

// Create router:
const router = express.Router();

// Create routes:
router.post("/register", async (req, res, next) => {
  try {
    await registerFlight(req.body.sender, req.body.flight, req.body.timestamp);
    res.status(201).json({
      message: "Successfully registered flight"
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) registering flight",
      err: e
    });
  }
});

router.get("/flights", async (req, res, next) => {
  try {
    const flights = await getAllFlights();
    res.status(200).json({
      message: "Successfully fetched flights",
      flights
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) fetching flights",
      err: e
    });
  }
});

router.get("/flights/:flight", async (req, res, next) => {
  try {
    const flight = await getFlight(req.params.flight);
    res.status(200).json({
      message: "Successfully fetched flight",
      flight
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) fetching flight",
      err: e
    });
  }
});

router.post("/buy/:flight", async (req, res, next) => {
  try {
    await buy(req.body.sender, req.body.value, req.params.flight);
    res.status(201).json({
      message: "Flight is successfully insured"
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) with transaction",
      err: e
    });
  }
});

router.post("/withdraw", async (req, res, next) => {
  try {
    await withdraw(req.body.sender, req.body.value);
    res.status(201).json({
      message: "Successfully withdrew funds"
    });
  } catch(e) {
    console.log(e);
    res.status(500).json({
      message: "Error(s) withdrawing funds",
      err: e
    });
  }
});

export {
  router
}