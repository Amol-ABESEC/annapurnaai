/**
 * Utility to strip redundant 'Recipe' or '(Recipe)' suffix from recipe names
 */
export function cleanRecipeTitle(title: string | undefined | null): string {
  if (!title) return '';
  return title
    .replace(/\s*\(\s*recipe\s*\)/gi, '')
    .replace(/\s*\(\s*indian\s+recipe\s*\)/gi, '')
    .replace(/\s+recipe$/gi, '')
    .trim();
}
