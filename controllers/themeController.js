const themeGenerator = require('../utils/themeGenerator');
const {deleteOldDownloads} = require('../utils/deleteOldDownloads');


exports.generateTheme = async (req, res) => {
    try {
        const themeConfig = req.body;
        const downloadLink = await themeGenerator.generateTheme(themeConfig);
        deleteOldDownloads();
        res.status(200).json({ message: "Theme generated successfully", downloadLink, success: true });
    } catch (error) {
        res.status(500).json({ message: "Error generating theme", error: error.message, success: false });
    }
};
