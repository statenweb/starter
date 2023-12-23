const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const slugify = require("slugify");
const recursiveRead = require('recursive-readdir'); // Ensure this package is installed
const readline = require("readline");
const { execSync } = require("child_process");
const { spawnSync } = require("child_process");
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

// Function to find and replace in files
const findAndReplaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [search, replace] of replacements) {
    content = content.replace(new RegExp(`${search}`, "g"), replace);
  }
  fs.writeFileSync(filePath, content);
};

// Function to apply find-and-replace to all files in a directory
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

// Main execution
(async () => {
  // Read the JSON configuration file or default to 'options.json'
  const configFilePath = process.argv[2] || 'options.json';
  if (!fs.existsSync(configFilePath)) {
    console.error(`Error: Missing configuration file (${configFilePath}).`);
    process.exit(1);
  }
  const config = readConfigFile(configFilePath);
  const additionalReplacements = Object.entries(config).map(([key, value]) => [`{${key}}`, value]);

  const scriptRootDirectory = process.cwd();
  const buildResultDirectory = `${scriptRootDirectory}/build_result`;
  const customizationDirectory = `${scriptRootDirectory}/custom_templates`;
  const rootCustomizationDirectory = `${customizationDirectory}/[root]`;
  const themeCustomizationDirectory = `${customizationDirectory}/[theme]`;
  const composerFileLocation = `${rootCustomizationDirectory}/composer.json`;

  const fileHeaderCssFile = `${buildResultDirectoryThemeBase}/tailwind/file-header.css`;



  const slugifiedThemeName = slugify(config["THEME_NAME"], {
    lower: true,
    remove: /[^a-zA-Z0-9 -]/g,
    replacement: "-",
  });
  const buildResultDirectoryThemeBase = `${buildResultDirectory}/web/wp-content/themes/${slugifiedThemeName}`;

  if (fs.existsSync(buildResultDirectory)) {
    fs.rmSync(buildResultDirectory, { recursive: true, force: true });
  }

  fs.mkdirSync(`${buildResultDirectoryThemeBase}`, { recursive: true });

  const { spawnSync } = require("child_process");
  spawnSync(
      "git",
      ["clone", "git@github.com:gregsullivan/_tw.git", buildResultDirectoryThemeBase],
      { stdio: "inherit" }
  );

  const tailwindConfigLocation = `${buildResultDirectoryThemeBase}/tailwind/tailwind.config.js`;
  const configPath = path.resolve(tailwindConfigLocation);
  const configContent = fs.readFileSync(configPath, "utf8");
  const newFunction = `
    function ({ addVariant }) {
      addVariant('mobile-only', "@media screen and (max-width: theme('screens.md'))")
    }
  `;

  const updatedConfigContent = configContent.replace(
      /(plugins:\s*\[)([\s\S]*?)(\s*]\s*)/,
      (match, start, plugins, end) => {
        const modifiedPlugins = plugins.replace(/,\s*$/, "");
        return `${start}${modifiedPlugins}${newFunction}${end}`;
      }
  );

  fs.writeFileSync(configPath, updatedConfigContent, "utf8");

  fs.rmSync(`${buildResultDirectoryThemeBase}/.git`, { recursive: true });

  const copyFiles = (sourceDir, targetDir) => {
    return new Promise((resolve, reject) => {
      copy(sourceDir, targetDir, {
        overwrite: true,
        expand: true,
        dot: true,
        filter: ['**/*', '!**/*.git'], // Add any other filters as necessary
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

  const syncDirectories = [
    {
      source: rootCustomizationDirectory,
      target: buildResultDirectory,
    },
    {
      source: themeCustomizationDirectory,
      target: buildResultDirectoryThemeBase,
    },
  ];

  for (const { source, target } of syncDirectories) {
    await copyFiles(source, target);
  }

  // Apply find-and-replace to all files in custom_templates
  await applyFindAndReplaceToAllFiles(customizationDirectory, additionalReplacements);
  console.log('-------------------');
  console.log(customizationDirectory, additionalReplacements);
  console.log('-------------------');
  // Modify functions.php
  const functionsPhpPath = `${buildResultDirectoryThemeBase}/theme/functions.php`;
  if (fs.existsSync(functionsPhpPath)) {
    const functionsPhpContent = fs.readFileSync(functionsPhpPath, "utf8");
    const modifiedContent = functionsPhpContent.replace(
        "<?php",
        `<?php\nrequire_once __DIR__ . '/application.php';`
    );
    fs.writeFileSync(functionsPhpPath, modifiedContent);
    console.log("Updated functions.php.");
  } else {
    console.log("functions.php not found, skipping modification.");
  }




  // Change to build_result directory
  process.chdir(buildResultDirectory);
  console.log("Changed directory to:", buildResultDirectory);

  // Run composer install
  console.log("Running composer install...");
  execSync("composer update", { stdio: "inherit" });
  execSync("composer install", { stdio: "inherit" });
  console.log("Composer install completed.");

  console.log("Theme build completed!");
})();
