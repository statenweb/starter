const themeGenerator = require("../utils/themeGenerator");
const { deleteOldDownloads } = require("../utils/deleteOldDownloads");

exports.helloWorld = (req, res) => {
  res.status(200).json({ message: "Hello World!" });
};

exports.generateTheme = async (req, res) => {
  const themeConfig = req.body;
  try {
    const downloadLink = await themeGenerator.generateTheme(themeConfig);
    deleteOldDownloads();
    res
      .status(200)
      .json({
        message: `${themeConfig.THEME_NAME} theme generated successfully`,
        downloadLink,
        success: true,
      });
  } catch (error) {
    res
      .status(500)
      .json({
        message: `Error generating theme for ${themeConfig.THEME_NAME}}`,
        error: error.message,
        success: false,
      });
  }
};
