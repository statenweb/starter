const express = require("express");
const router = express.Router();
const themeController = require("../controllers/themeController");
const userController = require("../controllers/userController");

router.get("/", themeController.helloWorld);
router.get("/blockNames", themeController.getBlocks);
router.post("/generate", themeController.generateTheme);
router.post("/users/aws/email/user", userController.generateAWSEmailUser);
router.get(
  "/users/aws/email/user/:userName/exists",
  userController.doesAWSEmailUserExist
);

//checkIfUserExists
module.exports = router;
