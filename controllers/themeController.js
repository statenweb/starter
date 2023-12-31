const themeGenerator = require("../utils/themeGenerator");

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
