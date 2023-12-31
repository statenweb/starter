const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const { execSync, spawnSync } = require("child_process");
const rimraf = require("rimraf");
const recursiveRead = require("recursive-readdir");
const archiver = require("archiver");
const copy = require("recursive-copy");
const mkdirp = require("mkdirp");

const baseDirectory = process.env.BASE_DIRECTORY || path.join(__dirname, "../");
const workspaceDirectory =
  process.env.WORKSPACE_DIRECTORY || path.join(__dirname, "../workspace");
const buildResultDirectory = `${workspaceDirectory}/build_result`;

const customizationDirectory = `${baseDirectory}/custom_templates`;

// Modify functions.php file

const copyFiles = async (sourceDir, targetDir) => {
  try {
    await copy(sourceDir, targetDir, {
      overwrite: true,
      expand: true,
      dot: true,
    });
  } catch (error) {
    console.error("Error copying files:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};

function modifyFunctionsPhp(dir) {
  const functionsPhpPath = `${dir}/theme/functions.php`;
  const functionsPhpContent = fs.readFileSync(functionsPhpPath, "utf8");
  const modifiedContent = functionsPhpContent.replace(
    "<?php",
    `<?php\nrequire_once __DIR__ . '/../vendor/autoload.php';`
  );
  fs.writeFileSync(functionsPhpPath, modifiedContent);
}

async function zipBuildResult(themeName, buildResultDirectory, res) {
  const archive = archiver("zip", { zlib: { level: 9 } });

  res.writeHead(200, {
    "Content-Type": "application/zip",
    "Content-Disposition": `attachment; filename="${slugify(themeName, {
      lower: true,
    })}.zip"`,
  });

  archive.on("error", function (err) {
    throw err;
  });

  archive.pipe(res);
  archive.directory(buildResultDirectory, false);
  await archive.finalize();
}

// Delete Git directories
function deleteGitDirectories(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isDirectory() && file === ".git") {
        deleteFolderRecursive(filePath);
      } else if (fs.statSync(filePath).isDirectory()) {
        deleteGitDirectories(filePath);
      }
    });
  }
}

// Delete a folder recursively
function deleteFolderRecursive(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    fs.readdirSync(directoryPath).forEach((file) => {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        deleteFolderRecursive(filePath);
      } else {
        fs.unlinkSync(filePath);
      }
    });
    fs.rmdirSync(directoryPath);
  }
}

// Apply find and replace to all files
async function applyFindAndReplaceToAllFiles(directory, replacements) {
  try {
    const files = await recursiveRead(directory);
    files.forEach((file) => {
      findAndReplaceInFile(file, replacements);
    });
  } catch (error) {
    console.error("Error processing files:", error);
  }
}

function findAndReplaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const key in replacements) {
    const search = `{${key}}`;
    const replace = replacements[key];
    content = content.replace(new RegExp(search, "g"), replace);
  }
  fs.writeFileSync(filePath, content);
}

// Main function to generate the theme
async function generateTheme(themeConfig, res) {
  if (!fs.existsSync(baseDirectory)) {
    mkdirp(baseDirectory);
  }

  if (fs.existsSync(buildResultDirectory)) {
    rimraf.sync(buildResultDirectory);
  }

  fs.mkdirSync(buildResultDirectory, { recursive: true });

  const themeDirectory = `${buildResultDirectory}/web/wp-content/themes/${slugify(
    themeConfig.THEME_NAME,
    { lower: true }
  )}`;
  fs.mkdirSync(themeDirectory, { recursive: true });

  spawnSync(
    "git",
    ["clone", "git@github.com:gregsullivan/_tw.git", themeDirectory],
    { stdio: "inherit" }
  );

  await copyFiles(`${customizationDirectory}/[root]`, buildResultDirectory);
  await copyFiles(`${customizationDirectory}/[theme]`, themeDirectory);

  modifyFunctionsPhp(themeDirectory);

  deleteGitDirectories(buildResultDirectory);

  // Stream the ZIP file directly
  await zipBuildResult(themeConfig.THEME_NAME, buildResultDirectory, res);
}

module.exports = { generateTheme };
