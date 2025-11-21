// src/utils/storage.js
import localForage from "localforage";

// Configure localForage
localForage.config({
  name: "NutritionTracker",
  version: 1.0,
  storeName: "nutrition_data",
  description: "Nutrition tracker offline storage",
});

export { localForage };

// Open Food Facts API utility
export const searchOpenFoodFacts = async (barcode) => {
  try {
    // First check cache
    const cached = await localForage.getItem(`product_${barcode}`);
    if (cached) return cached;

    // If not cached, fetch from API
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`
    );

    if (!response.ok) throw new Error("Product not found");

    const data = await response.json();

    if (data.status === 1) {
      const product = data.product;
      const nutritionInfo = {
        name: product.product_name || "Unknown Product",
        brand: product.brands || "",
        calories: product.nutriments?.["energy-kcal"] || 0,
        protein: product.nutriments?.proteins || 0,
        carbs: product.nutriments?.carbohydrates || 0,
        fats: product.nutriments?.fat || 0,
        servingSize: product.serving_size || "100g",
        ingredients: product.ingredients_text || "",
        barcode: barcode,
      };

      // Cache the result
      await localForage.setItem(`product_${barcode}`, nutritionInfo);
      return nutritionInfo;
    } else {
      throw new Error("Product not found in database");
    }
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
};
