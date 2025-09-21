const express = require("express");
const router = express.Router();
const transferService = require("../service/transferService");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware);

router.post("/", (req, res) => {
  const { from, to, amount } = req.body;
  if (!from || !to || typeof amount !== "number") {
    return res
      .status(400)
      .json({ error: "Campos obrigatórios: from, to, amount (number)" });
  }
  try {
    const transfer = transferService.transfer({ from, to, amount });
    res.status(201).json(transfer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get("/", (req, res) => {
  res.json(transferService.listTransfers());
});

module.exports = router;
