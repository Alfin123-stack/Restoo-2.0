import "server-only";
import { cacheLife } from "next/cache";
import { z } from "zod";

const BASE_URL = "https://www.themealdb.com/api/json/v1";

export type FoodCategory = {
  id: string;
  name: string;
  thumb: string;
  description: string;
};
export type FoodSummary = { id: string; name: string; thumb: string };
export type FoodDetail = FoodSummary & {
  category: string | null;
  area: string | null;
  instructions: string;
  tags: string[];
  youtube: string | null;
  ingredients: { name: string; measure: string }[];
};

const categoriesSchema = z.object({
  categories: z.array(
    z.object({
      idCategory: z.string(),
      strCategory: z.string(),
      strCategoryThumb: z.string(),
      strCategoryDescription: z.string().default(""),
    }),
  ),
});

const summarySchema = z.object({
  meals: z
    .array(
      z.object({ idMeal: z.string(), strMeal: z.string(), strMealThumb: z.string() }),
    )
    .nullable(),
});

const detailSchema = z.object({
  meals: z.array(z.record(z.string(), z.string().nullable())).nullable(),
});

/** Respons TheMealDB memakai strIngredient1..20 / strMeasure1..20; ubah jadi array rapi. */
export function normalizeMeal(raw: Record<string, string | null>): FoodDetail {
  const ingredients: FoodDetail["ingredients"] = [];
  for (let i = 1; i <= 20; i++) {
    const name = raw[`strIngredient${i}`]?.trim();
    if (!name) continue;
    ingredients.push({ name, measure: raw[`strMeasure${i}`]?.trim() ?? "" });
  }
  return {
    id: raw.idMeal ?? "",
    name: raw.strMeal ?? "",
    thumb: raw.strMealThumb ?? "",
    category: raw.strCategory || null,
    area: raw.strArea || null,
    instructions: (raw.strInstructions ?? "").replace(/\r\n/g, "\n").trim(),
    tags: (raw.strTags ?? "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    youtube: raw.strYoutube || null,
    ingredients,
  };
}

async function request<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const key = process.env.MEALDB_API_KEY || "1";
  const response = await fetch(`${BASE_URL}/${key}/${path}`, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`TheMealDB responded with ${response.status}`);
  return schema.parse(await response.json());
}

export async function getFoodCategories(): Promise<FoodCategory[]> {
  "use cache";
  cacheLife("days");
  const data = await request("categories.php", categoriesSchema);
  return data.categories.map((c) => ({
    id: c.idCategory,
    name: c.strCategory,
    thumb: c.strCategoryThumb,
    description: c.strCategoryDescription,
  }));
}

export async function getFoodsByCategory(category: string): Promise<FoodSummary[]> {
  "use cache";
  cacheLife("days");
  const data = await request(
    `filter.php?c=${encodeURIComponent(category)}`,
    summarySchema,
  );
  return (data.meals ?? []).map((m) => ({
    id: m.idMeal,
    name: m.strMeal,
    thumb: m.strMealThumb,
  }));
}

export async function getFoodById(id: string): Promise<FoodDetail | null> {
  "use cache";
  cacheLife("days");
  const data = await request(`lookup.php?i=${encodeURIComponent(id)}`, detailSchema);
  const first = data.meals?.[0];
  return first ? normalizeMeal(first) : null;
}
