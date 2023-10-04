const fs = require("fs");
const path = require("path");
const copy = require("recursive-copy");
const { promisify } = require("util");
const readline = require("readline");
const { execSync } = require("child_process");
const { spawnSync } = require("child_process");
const slugify = require("slugify");

const copyFiles = (sourceDir, targetDir) => {
  return new Promise((resolve, reject) => {
    copy(sourceDir, targetDir, { overwrite: true, dot: true }, (error) => {
      if (error) {
        console.error("Error:", error);
        reject(error);
      } else {
        console.log("Files copied successfully.");
        resolve();
      }
    });
  });
};

const modifyFunctionsPhp = (themeDirectory) => {
  const functionsPhpPath = `${themeDirectory}/theme/functions.php`;
  const functionsPhpContent = fs.readFileSync(functionsPhpPath, "utf8");
  const modifiedContent = functionsPhpContent.replace(
    "<?php",
    `<?php\nrequire_once __DIR__ . '/application.php';`
  );
  fs.writeFileSync(functionsPhpPath, modifiedContent);
};

const findAndReplaceInFile = (filePath, replacements) => {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [search, replace] of replacements) {
    content = content.replace(new RegExp(search, "g"), replace);
  }
  fs.writeFileSync(filePath, content);
};

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Enter the theme name: ", async (themeName) => {
  rl.close();

  const scriptRootDirectory = process.cwd();
  const buildResultDirectory = `${scriptRootDirectory}/build_result`;
  const customizationDirectory = `${scriptRootDirectory}/custom_templates`;
  const rootCustomizationDirectory = `${customizationDirectory}/[root]`;
  const themeCustomizationDirectory = `${customizationDirectory}/[theme]`;
  const composerFileLocation = `${rootCustomizationDirectory}/composer.json`;
  const buildResultDirectoryThemeBase = `${buildResultDirectory}/web/wp-content/themes/${slugifiedThemeName}`;

  const fileHeaderCssFile = `${buildResultDirectoryThemeBase}/tailwind/file-header.css`;

  const slugifiedThemeName = slugify(themeName, {
    lower: true,
    remove: /[^a-zA-Z0-9 -]/g,
    replacement: "-",
  });

  console.log("Updated file-header.css.");

  findAndReplaceInFile(fileHeaderCssFile, [
    ["{THEME_NAME}", themeName],
    ["{SLUGIFIED_THEME_NAME}", slugifiedThemeName],
  ]);

  // Remove build_result directory if it exists
  if (fs.existsSync(buildResultDirectory)) {
    fs.rmSync(buildResultDirectory, { recursive: true, force: true });
  }

  // Create web/wp-content/themes directory
  fs.mkdirSync(`${buildResultDirectoryThemeBase}`, { recursive: true });

  // Clone repository
  spawnSync(
    "git",
    [
      "clone",
      "git@github.com:gregsullivan/_tw.git",
      buildResultDirectoryThemeBase,
    ],
    { stdio: "inherit" }
  );

  // MODIFY FILE

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

  // Remove .git directory
  fs.rmSync(`${buildResultDirectoryThemeBase}/.git`, { recursive: true });

  // HANDLE SYNC

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

  console.log("Syncing directories...");
  try {
    for (const { source, target } of syncDirectories) {
      await copyFiles(source, target);
    }
    console.log("Directories synced successfully.");
  } catch (error) {
    console.error("Error syncing directories:", error);
  }

  // Modify functions.php
  modifyFunctionsPhp(buildResultDirectoryThemeBase);

  const composerJson = fs.readFileSync(composerFileLocation, "utf8");

  // Replace '{THEME_NAME}' and '{SLUGIFIED_THEME_NAME}' in composer.json
  const replacedComposerJson = composerJson
    .replace(/{THEME_NAME}/g, themeName)
    .replace(/{SLUGIFIED_THEME_NAME}/g, slugifiedThemeName);

  // Write the replaced composer.json
  fs.writeFileSync(composerFileLocation, replacedComposerJson);
  console.log("File updated: composer.json");

  // Change to build_result directory
  process.chdir(buildResultDirectory);
  console.log("Changed directory to:", buildResultDirectory);

  // Run composer install
  console.log("Running composer install...");
  execSync("composer update", { stdio: "inherit" });
  execSync("composer install", { stdio: "inherit" });
  console.log("Composer install completed.");

  console.log("Theme build completed!");
});
