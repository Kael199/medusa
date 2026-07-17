// First-run seeder. Idempotent: safe to run repeatedly.
// Reads SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD from the environment and creates
// a Super-Admin if missing, plus a starter set of genres/tags and the Settings
// singleton. Run with: nr run seed  (tsx scripts/seed.ts)

// Load env. Next.js auto-loads .env.local for its own scripts, but `tsx` does
// not — explicitly point dotenv at .env.local (falling back to .env).
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

import { connect } from "@/lib/db/mongoose";
import "@/models";
import { User, Genre, Tag, Settings } from "@/models";
import { hashPassword } from "@/lib/auth/password";
import { STAFF_ROLES } from "@/lib/constants";

async function seedOne(model: typeof Genre, name: string, kind: "genre" | "tag") {
  const exists = await model.exists({ name });
  if (!exists) {
    await model.create({ name, kind });
    return true;
  }
  return false;
}

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Missing SEED_ADMIN_EMAIL or SEED_ADMIN_PASSWORD in the environment.",
    );
    console.error("Copy .env.local.example to .env.local and fill them in.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("SEED_ADMIN_PASSWORD must be at least 8 characters.");
    process.exit(1);
  }

  await connect();

  // 1. Super-Admin.
  const existing = await User.findOne({ email }).select("+password");
  if (!existing) {
    await User.create({
      name: "Super Admin",
      email,
      password: await hashPassword(password),
      role: STAFF_ROLES[0], // "super-admin"
      active: true,
    });
    console.log(`Created Super-Admin: ${email}`);
  } else {
    existing.role = STAFF_ROLES[0];
    existing.active = true;
    existing.password = await hashPassword(password); // re-hash on reset
    await existing.save();
    console.log(`Reset existing Super-Admin: ${email}`);
  }

  // 2. Starter genres + tags.
  const genres = [
    "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Horror",
    "Mystery", "Romance", "Sci-Fi", "Slice of Life", "Sports", "Supernatural",
    "Thriller",
  ];
  const tags = [
    "Long Strip", "Adapted from Novel", "School Life", "Isekai",
    "Cultivation", "Monsters", "Survival", "Time Travel", "Virtual Reality",
    "Web Comic",
  ];

  let g = 0;
  for (const name of genres) if (await seedOne(Genre, name, "genre")) g++;
  let t = 0;
  for (const name of tags) if (await seedOne(Tag, name, "tag")) t++;
  console.log(`Genres created: ${g} (skipped ${genres.length - g} existing)`);
  console.log(`Tags created: ${t} (skipped ${tags.length - t} existing)`);

  // 3. Settings singleton.
  const settingsExists = await Settings.exists({ _id: "singleton" });
  if (!settingsExists) {
    await Settings.create({ _id: "singleton", siteName: "Medusa", tagline: "Read manga online" });
    console.log("Settings singleton created");
  } else {
    console.log("Settings singleton already present");
  }

  console.log("\nSeed complete. You can now log in to /admin with the email above.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:");
  console.error(err);
  process.exit(1);
});
