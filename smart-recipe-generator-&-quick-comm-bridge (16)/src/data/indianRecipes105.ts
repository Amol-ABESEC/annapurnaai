import part1 from './indianRecipes105_part1.json';
import part2 from './indianRecipes105_part2.json';
import part3 from './indianRecipes105_part3.json';
import part4 from './indianRecipes105_part4.json';
import part5 from './indianRecipes105_part5.json';

export interface Raw105Recipe {
  id: string;
  title: string;
  cuisine: string;
  type: 'Veg' | 'Non-Veg';
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  ingredients: string[];
  instructions: string[];
}

export type Raw200Recipe = Raw105Recipe;

export const RAW_INDIAN_RECIPES_105: Raw105Recipe[] = [
  ...(part1 as Raw105Recipe[]),
  ...(part2 as Raw105Recipe[]),
  ...(part3 as Raw105Recipe[]),
  ...(part4 as Raw105Recipe[]),
  ...(part5 as Raw105Recipe[])
];

export const RAW_INDIAN_RECIPES_200: Raw105Recipe[] = RAW_INDIAN_RECIPES_105;

