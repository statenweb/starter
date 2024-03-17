const fs = require("fs");
const path = require("path");
const { userGenerator, checkIfUserExists } = require("../utils/userGenerator");

exports.generateAWSEmailUser = async (req, res) => {
  const userName = req.body.userName;
  try {
    const { AccessKeyId, SecretAccessKey } = await userGenerator(userName);
    res.status(200).json({
      AccessKeyId,
      SecretAccessKey,
    });
  } catch (error) {
    console.error("Error in userController:", error);
    res.status(500).json({
      message: `Error generating user for ${userName}. ${error.message}`,
      error: error.message,
      success: false,
    });
  }
};

exports.doesAWSEmailUserExist = async (req, res) => {
  const userName = req.params.userName;
  try {
    const exists = await checkIfUserExists(userName);
    res.status(200).json({
      exists,
      userNameRequested: userName,
    });
  } catch (error) {
    console.error("Error in userController::doesAWSEmailUserExist:", error);
    res.status(500).json({
      message: `Error getting user for ${userName}. ${error.message}`,
      error: error.message,
      success: false,
    });
  }
};
