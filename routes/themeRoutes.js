const express = require("express");
const router = express.Router();
const themeController = require("../controllers/themeController");

router.get("/", themeController.helloWorld);
router.get("/blockNames", themeController.getBlocks);
router.post("/generate", themeController.generateTheme);

module.exports = router;
