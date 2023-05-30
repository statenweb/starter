const fs = require("fs");
const readline = require("readline");
const { execSync } = require("child_process");
const { spawnSync } = require("child_process");
const slugify = require("slugify");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function copyDirectory(source, destination) {
  fs.mkdirSync(destination, { recursive: true });
  const files = fs.readdirSync(source);
  for (const file of files) {
    const sourcePath = `${source}/${file}`;
    const destinationPath = `${destination}/${file}`;
    if (fs.lstatSync(sourcePath).isDirectory()) {
      copyDirectory(sourcePath, destinationPath);
    } else {
      fs.copyFileSync(sourcePath, destinationPath);
    }
  }
}

function modifyFunctionsPhp(slugifiedThemeName) {
  const functionsPhpPath = `build_result/web/wp-content/themes/${slugifiedThemeName}/functions.php`;
  const functionsPhpContent = fs.readFileSync(functionsPhpPath, "utf8");
  const modifiedContent = functionsPhpContent.replace(
    "<?php",
    `<?php\nrequire_once __DIR__ . '/application.php';`
  );
  fs.writeFileSync(functionsPhpPath, modifiedContent);
}

function findAndReplaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, "utf8");
  for (const [search, replace] of replacements) {
    content = content.replace(new RegExp(search, "g"), replace);
  }
  fs.writeFileSync(filePath, content);
}

rl.question("Enter the theme name: ", (themeName) => {
  rl.close();

  const slugifiedThemeName = slugify(themeName, {
    lower: true,
    remove: /[^a-zA-Z0-9 -]/g,
    replacement: "-",
  });

  // Create build_result directory
  fs.mkdirSync("build_result");

  // Copy composer.json
  fs.copyFileSync(
    "repo_root/custom_templates/composer.json",
    "build_result/composer.json"
  );

  // Read the copied composer.json
  const composerJson = fs.readFileSync("build_result/composer.json", "utf8");

  // Replace '{THEME_NAME}' and '{SLUGIFIED_THEME_NAME}' in composer.json
  const replacedComposerJson = composerJson
    .replace(/{THEME_NAME}/g, themeName)
    .replace(/{SLUGIFIED_THEME_NAME}/g, slugifiedThemeName);

  // Write the replaced composer.json
  fs.writeFileSync("build_result/composer.json", replacedComposerJson);

  // Change to build_result directory
  process.chdir("build_result");

  // Run composer install
  execSync("composer install", { stdio: "inherit" });

  // Create web/wp-content/themes directory
  fs.mkdirSync("web/wp-content/themes", { recursive: true });
  process.chdir("web/wp-content/themes");

  // Clone repository
  spawnSync(
    "git",
    ["clone", "git@github.com:gregsullivan/_tw.git", slugifiedThemeName],
    { stdio: "inherit" }
  );

  // Remove .git directory
  fs.rmdirSync(`${slugifiedThemeName}/.git`, { recursive: true });

  // Copy victoria directory and application.php
  copyDirectory(
    "../../../../repo_root/custom_templates/theme/victoria",
    `${slugifiedThemeName}/victoria`
  );
  fs.copyFileSync(
    "../../../../repo_root/custom_templates/theme/application.php",
    `${slugifiedThemeName}/application.php`
  );

  // Modify functions.php
  modifyFunctionsPhp(slugifiedThemeName);

  // Find and replace in file-header.css
  // Find and replace in file-header.css
  const fileHeaderCssPath = `${slugifiedThemeName}/tailwind/custom/file-header.css`;
  const replacements = [
    ["Theme Name: _tw", `Theme Name: ${themeName}`],
    [
      "Theme URI: https://underscoretw.com/",
      "Theme URI: https://statenweb.com/",
    ],
    ["Author: underscoretw.com", "Author: statenweb.com"],
    [
      "Author URI: https://underscoretw.com/",
      "Author URI: https://statenweb.com/",
    ],
    [
      "Description: A custom theme based on _tw",
      `Description: A custom theme for ${themeName}`,
    ],
  ];
  findAndReplaceInFile(fileHeaderCssPath, replacements);

  console.log("Theme build completed!");
});
