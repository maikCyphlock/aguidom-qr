import { db } from "./index";
import { users } from "./schema";

export async function seed() {
  try {
    console.log("🌱 Seeding database...");

    // Clear existing data
    await db.delete(users);

    console.log("✅ Database seeded successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}
