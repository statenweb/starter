const themeGenerator = require("../utils/themeGenerator");
const fs = require("fs");
const path = require("path");

exports.generateTheme = async (req, res) => {
  const themeConfig = req.body;
  try {
    await themeGenerator.generateTheme(themeConfig, res);
    // The response is handled in the generateTheme function
  } catch (error) {
    console.error("Error in generateTheme:", error);
    res.status(500).json({
      message: `Error generating theme for ${themeConfig.THEME_NAME}`,
      error: error.message,
      success: false,
    });
  }
};

exports.helloWorld = (req, res) => {
  res.status(200).json({ message: "Hello World!" });
};

exports.getBlocks = (req, res) => {
  const themeDirectory = path.join(
    __dirname,
    "../custom_templates/[theme]/theme/block"
  );

  fs.readdir(themeDirectory, (err, files) => {
    if (err) {
      console.error("Error reading directory:", err);
      return res.status(500).send("Error reading blocks directory");
    }

    const blockNames = files
      .filter((file) => file.endsWith(".php")) // Filter .php files
      .map((file) => file.replace(".php", "")); // Remove .php extension

    res.json(blockNames);
  });
};
