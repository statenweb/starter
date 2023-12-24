const fs = require('fs');
const path = require('path');

/**
 * Deletes files older than 2 days in the given directory.
 * @param {string} dirPath - The path to the directory.
 */
function deleteOldDownloads() {
    const dirPath = path.join(__dirname, '..', 'downloads');
    fs.readdir(dirPath, (err, files) => {
        if (err) {
            console.error('Error reading directory:', err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(dirPath, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }

                const twoDaysAgo = Date.now() - (2 * 24 * 60 * 60 * 1000);
                if (stats.isFile() && stats.birthtime.getTime() < twoDaysAgo) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error('Error deleting file:', err);
                        } else {
                            console.log(`Deleted old file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
}

module.exports = { deleteOldDownloads };