const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const slugify = require("slugify");
const { execSync, spawnSync } = require("child_process");
const {rimraf} = require("rimraf");
const recursiveRead = require('recursive-readdir');
const archiver = require("archiver");



const modifyFunctionsPhp = (dir) => {
  const functionsPhpPath = `${dir}/theme/functions.php`;
  const functionsPhpContent = fs.readFileSync(functionsPhpPath, "utf8");
  const modifiedContent = functionsPhpContent.replace(
      "<?php",
      `<?php\nrequire_once __DIR__ . '/../vendor/autoload.php';`
  );
  fs.writeFileSync(functionsPhpPath, modifiedContent);
};
function zipBuildResult(themeName, buildResultDirectory, downloadsDirectory) {
  // Define the filename based on SLUGIFIED_THEME_NAME
  const baseFilename = `${slugify(themeName)}`;
  let filename = `${baseFilename}.zip`;

  // Check if the filename already exists and append a number if necessary
  let counter = 1;
  while (fs.existsSync(path.join(downloadsDirectory, filename))) {
    filename = `${baseFilename}-${counter}.zip`;
    counter++;
  }

  // Create a write stream for the zip file
  const output = fs.createWriteStream(path.join(downloadsDirectory, filename));

  // Create an archiver instance
  const archive = archiver("zip", {
    zlib: { level: 9 }, // Set compression level
  });

  // Pipe the archive data to the output file
  archive.pipe(output);

  // Add the build_result directory to the archive (recursively)
  archive.directory(buildResultDirectory, false);

  // Listen for all archive data to be written
  output.on("close", () => {
    console.log(`Successfully zipped and saved as: ${filename}`);

    // Remove the build_result directory (recursively)
    rimraf.sync(buildResultDirectory);
  });

  // Finalize the archive
  archive.finalize();
}

function deleteGitDirectories(directoryPath) {
  if (fs.existsSync(directoryPath)) {
    const files = fs.readdirSync(directoryPath);
    files.forEach((file) => {
      const filePath = path.join(directoryPath, file);
      if (fs.statSync(filePath).isDirectory()) {
        if (file === ".git") {
          // Delete the .git directory
          deleteFolderRecursive(filePath);
        } else {
          // Recursively check subdirectories
          deleteGitDirectories(filePath);
        }
      }
    });
  }
}

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
const findAndReplaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, "utf8");
  for (const key in replacements) {
    const search = `{${key}}`;
    const replace = replacements[key];
    content = content.replace(new RegExp(search, "g"), replace);
  }
  fs.writeFileSync(filePath, content);
};

async function applyFindAndReplaceToAllFiles(directory, replacements) {
  try {
    const files = await recursiveRead(directory);
    files.forEach(file => {
      findAndReplaceInFile(file, replacements);
    });
  } catch (error) {
    console.error("Error processing files:", error);
  }
}
// Function to read JSON configuration file
function readConfigFile(filePath) {
  try {
    const fileContent = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileContent);
  } catch (error) {
    console.error(`Error reading JSON file: ${error.message}`);
    process.exit(1);
  }
}

// Function to copy files from source to target directory
const copyFiles = (sourceDir, targetDir) => {
  return new Promise((resolve, reject) => {
    copy(sourceDir, targetDir, {
      overwrite: true,
      expand: true,
      dot: true
    }, (error) => {
      if (error) {
        console.error("Error:", error);
        reject(error);
      } else {
        console.log(`Files copied from ${sourceDir} to ${targetDir}.`);
        resolve();
      }
    });
  });
};

// Main execution
(async () => {
  // Read the JSON configuration file or default to 'options.json'
  const configFilePath = process.argv[2] || 'options.json';
  if (!fs.existsSync(configFilePath)) {
    console.error(`Error: Missing configuration file (${configFilePath}).`);
    process.exit(1);
  }
  const config = readConfigFile(configFilePath);
  config['SLUGIFIED_THEME_NAME'] = slugify(config["THEME_NAME"], {
    lower: true,
    remove: /[^a-zA-Z0-9 -]/g,
    replacement: "-",
  });
  const scriptRootDirectory = process.cwd();
  const buildResultDirectory = `${scriptRootDirectory}/build_result`;
  const customizationDirectory = `${scriptRootDirectory}/custom_templates`;


  const downloadsDirectory = path.join(__dirname, "downloads")
  if (!fs.existsSync(downloadsDirectory)) {
    fs.mkdirSync(downloadsDirectory);
  }

  if (fs.existsSync(buildResultDirectory)) {
    rimraf.sync(buildResultDirectory); // Use rimraf to remove the directory and its contents
  }



  // Delete the build_result directory recursively if it exists
  if (fs.existsSync(buildResultDirectory)) {
    fs.rmdirSync(buildResultDirectory, { recursive: true });
  }

  // Ensure build_result directory exists
  fs.mkdirSync(buildResultDirectory, { recursive: true });

  // Copy files from [root] to build_result
  await copyFiles(`${customizationDirectory}/[root]`, buildResultDirectory);

  // Create the theme directory
  const themeDirectory = `${buildResultDirectory}/web/wp-content/themes/${config["SLUGIFIED_THEME_NAME"]}`;
  fs.mkdirSync(themeDirectory, { recursive: true });

  // Clone the _tw repository into the theme directory
  spawnSync(
      "git",
      ["clone", "git@github.com:gregsullivan/_tw.git", themeDirectory],
      { stdio: "inherit" }
  );

  await copyFiles(`${customizationDirectory}/[theme]`, themeDirectory);
  const buildResultDirectoryThemeBase = `${buildResultDirectory}/web/wp-content/themes/${config["SLUGIFIED_THEME_NAME"]}`;

  const tailwindConfigLocation = `${buildResultDirectoryThemeBase}/tailwind/tailwind.config.js`;
  const configPath = path.resolve(tailwindConfigLocation);

  const configContent = fs.readFileSync(configPath, "utf8");
  const newFunction = `
  function ({ addVariant }) {
    addVariant('mobile-only', "@media screen and (max-width: theme('screens.md'))")
  }
`;
  modifyFunctionsPhp(buildResultDirectoryThemeBase);

  const envExamplePath = path.join(buildResultDirectory, ".env.example");
  const envPath = path.join(buildResultDirectory, ".env");

// Read the content of .env.example
  const envExampleContent = fs.readFileSync(envExamplePath, "utf8");

// Write the content to .env
  fs.writeFileSync(envPath, envExampleContent);

  const updatedConfigContent = configContent.replace(
      /(plugins:\s*\[)([\s\S]*?)(\s*]\s*)/,
      (match, start, plugins, end) => {
        const modifiedPlugins = plugins.replace(/,\s*$/, "");
        return `${start}${modifiedPlugins}${newFunction}${end}`;
      }
  );

  fs.writeFileSync(configPath, updatedConfigContent, "utf8");


  // Change permissions for the .git directory
  spawnSync(
      "chmod",
      ["-R", "777", `${themeDirectory}/.git`],
      { stdio: "inherit" }
  );
  await applyFindAndReplaceToAllFiles(buildResultDirectory, config);
  const composerJsonPath = path.join(buildResultDirectoryThemeBase, "composer.json");
  const composerJsonContent = fs.readFileSync(composerJsonPath, "utf8");

// Parse the JSON content
  const composerJson = JSON.parse(composerJsonContent);

// Add the "autoload" section
  composerJson["autoload"] = {
    "psr-4": {
      "Victoria\\": "theme/victoria"
    }
  };

// Write the updated content back to composer.json
  fs.writeFileSync(composerJsonPath, JSON.stringify(composerJson, null, 2));

  // Change to build_result directory and perform composer install
  process.chdir(buildResultDirectory);
  deleteGitDirectories(buildResultDirectory);
  console.log("Theme build completed!");
  zipBuildResult(config["SLUGIFIED_THEME_NAME"], buildResultDirectory, downloadsDirectory);
})();
