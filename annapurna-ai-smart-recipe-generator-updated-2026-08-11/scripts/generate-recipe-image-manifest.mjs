import fs from 'node:fs';
import path from 'node:path';

const publicImageRoot = path.join(process.cwd(), 'public', 'recipe-images');
const manifestPath = path.join(process.cwd(), 'src', 'data', 'recipeImageManifest.ts');

function listJpgPaths(dir, publicPrefix) {
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const filePath = path.join(dir, entry.name);
      const publicPath = `${publicPrefix}/${entry.name}`;

      if (entry.isDirectory()) {
        return listJpgPaths(filePath, publicPath);
      }

      return /\.(jpe?g)$/i.test(entry.name) ? [publicPath] : [];
    });
}

const imagePaths = listJpgPaths(publicImageRoot, '/recipe-images').sort((a, b) =>
  a.localeCompare(b, undefined, { numeric: true })
);

const manifest = `// Generated from JPG files in public/recipe-images.
// Run "npm run images:manifest" after adding or removing recipe images.
export const RECIPE_IMAGE_PATHS = ${JSON.stringify(imagePaths, null, 2)} as const;
`;

fs.writeFileSync(manifestPath, manifest);

console.log(`Generated ${imagePaths.length} recipe image paths in ${path.relative(process.cwd(), manifestPath)}`);
