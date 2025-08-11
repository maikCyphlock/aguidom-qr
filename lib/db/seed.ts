
import { db } from "./index";
import { clubs, users } from "./schema";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

async function main() {
  console.log("Seeding database...");

  const clubId = uuidv4();

  await db.insert(clubs).values({
    id: clubId,
    name: "Club Aguidom",
    location: "Santiago, Chile",
    description: "Club de Taekwondo",
  });

  console.log("Club inserted.");

  const passwordHash = await bcrypt.hash("password123", 10);
  const qrToken = uuidv4();

  // await db.insert(users).values({
  //   userId: uuidv4(),
  //   idNumber: "123456789", // Ejemplo de DNI
  //   name: "Admin User",
  //   email: "admin@example.com",
  //   passwordHash,
  //   phone: "123456789",
  //   qrToken,
  //   clubId,
  // });

  console.log("User inserted.");

  console.log("Database seeded successfully!");
}

main().catch((error) => {
  console.error("Error seeding database:", error);
  process.exit(1);
});
