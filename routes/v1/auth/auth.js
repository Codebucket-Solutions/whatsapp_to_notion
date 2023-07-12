const express = require("express");
const router = express.Router();
const { webhook, 
  webhookVerify } = require("../../../controllers/v1");
const { dispatcher } = require("../../../middleware");

router.post("/webhook", (req, res, next) => {
  dispatcher(req, res, next, webhook);
});

router.get("/webhook", async (req, res, next) => {
  let data = await webhookVerify(req, res, next);
  console.log(data);
  return res.send(data);
});

module.exports = router;
