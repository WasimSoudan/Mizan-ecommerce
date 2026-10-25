import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import bcrypt from "bcryptjs";

loadEnvLocal();

const db = readDbConfig();

const categories = [
  ["Ceramics", "الخزف"],
  ["Textiles", "المنسوجات"],
  ["Pantry", "المؤونة"],
];

const products = [
  {
    category: "Ceramics",
    name_en: "Stoneware bowl",
    name_ar: "وعاء حجري",
    description_en: "A wide bowl for fruit, salad, or bread dough.",
    description_ar: "وعاء واسع للفاكهة أو السلطة أو عجين الخبز.",
    price: "48.00",
    image_url:
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 12,
    is_active: true,
  },
  {
    category: "Ceramics",
    name_en: "Pour-over cup",
    name_ar: "كوب التقطير",
    description_en: "A small cup with a thick lip, made for slow coffee.",
    description_ar: "كوب صغير بحافة سميكة للقهوة المتأنية.",
    price: "36.00",
    image_url:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 20,
    is_active: true,
  },
  {
    category: "Textiles",
    name_en: "Linen throw",
    name_ar: "غطاء كتّان",
    description_en: "Washed linen in a natural oat color.",
    description_ar: "كتّان مغسول بلون الشوفان الطبيعي.",
    price: "120.00",
    image_url:
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 6,
    is_active: true,
  },
  {
    category: "Textiles",
    name_en: "Wool cushion",
    name_ar: "وسادة صوف",
    description_en: "A firm square cushion in undyed wool.",
    description_ar: "وسادة مربعة متماسكة من صوف غير مصبوغ.",
    price: "85.00",
    image_url:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 9,
    is_active: true,
  },
  {
    category: "Pantry",
    name_en: "Wild olive oil",
    name_ar: "زيت زيتون بري",
    description_en: "Early-harvest oil with a green, peppery finish.",
    description_ar: "زيت أول الموسم بنهاية خضراء لاذعة.",
    price: "64.00",
    image_url:
      "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 15,
    is_active: true,
  },
  {
    category: "Pantry",
    name_en: "Cardamom coffee",
    name_ar: "قهوة الهيل",
    description_en: "A small bag of coffee ground with green cardamom.",
    description_ar: "كيس صغير من البن المطحون مع الهيل الأخضر.",
    price: "28.00",
    image_url:
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 30,
    is_active: true,
  },
  {
    category: "Pantry",
    name_en: "Sidr honey",
    name_ar: "عسل السدر",
    description_en: "A jar of dark sidr honey. This sample is out of stock.",
    description_ar: "جرة عسل سدر داكن. هذه العينة نفدت كميتها.",
    price: "42.00",
    image_url:
      "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=1200&q=80",
    stock_quantity: 0,
    is_active: true,
  },
  {
    category: "Ceramics",
    name_en: "Studio glaze set",
    name_ar: "طقم طلاء الاستوديو",
    description_en: "Hidden from the shop until the set is ready.",
    description_ar: "مخفي عن المتجر إلى أن يجهز الطقم.",
    price: "54.00",
    image_url: null,
    stock_quantity: 3,
    is_active: false,
  },
];

function loadEnvLocal() {
  const filePath = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function readDbConfig() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT);
  const database = process.env.DB_NAME;
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;

  if (!host || !Number.isInteger(port) || !database || !user || password === undefined) {
    console.error("Set DB_HOST, DB_PORT, DB_NAME, DB_USER, and DB_PASSWORD in .env.local.");
    process.exit(1);
  }

  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(database)) {
    console.error(`Database name must be a simple identifier. Received: ${database}`);
    process.exit(1);
  }

  return { host, port, database, user, password };
}

function clientConfig(database) {
  return {
    host: db.host,
    port: db.port,
    database,
    user: db.user,
    password: db.password,
  };
}

async function ensureDatabase() {
  const client = new pg.Client(clientConfig(db.database));
  try {
    await client.connect();
    return;
  } catch (error) {
    if (!error || error.code !== "3D000") throw error;
  } finally {
    await client.end().catch(() => {});
  }

  const admin = new pg.Client(clientConfig("postgres"));
  await admin.connect();
  try {
    await admin.query(`CREATE DATABASE ${db.database}`);
    console.log(`Created database ${db.database}.`);
  } finally {
    await admin.end();
  }
}

async function seed(client) {
  for (const [nameEn, nameAr] of categories) {
    await client.query(
      `INSERT INTO categories (name_en, name_ar)
       SELECT $1::varchar, $2::varchar
       WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name_en = $1)`,
      [nameEn, nameAr],
    );
  }

  for (const product of products) {
    await client.query(
      `INSERT INTO products (
         category_id, name_en, name_ar, description_en, description_ar,
         price, image_url, stock_quantity, is_active
       )
       SELECT c.id, $2, $3, $4, $5, $6, $7, $8, $9
       FROM categories c
       WHERE c.name_en = $1
         AND NOT EXISTS (SELECT 1 FROM products WHERE name_en = $2)`,
      [
        product.category,
        product.name_en,
        product.name_ar,
        product.description_en,
        product.description_ar,
        product.price,
        product.image_url,
        product.stock_quantity,
        product.is_active,
      ],
    );
  }

  const passwordHash = await bcrypt.hash("admin123", 10);
  const inserted = await client.query(
    `INSERT INTO admin_users (email, password_hash)
     VALUES ($1, $2)
     ON CONFLICT (email) DO NOTHING
     RETURNING id`,
    ["admin@mizan.shop", passwordHash],
  );

  if (inserted.rowCount === 0) {
    console.log("Admin already exists, so the password was left unchanged.");
  } else {
    console.log("Admin created: admin@mizan.shop / admin123");
  }
}

async function main() {
  console.log(`Connecting to ${db.host}:${db.port}/${db.database}`);
  await ensureDatabase();

  const client = new pg.Client(clientConfig(db.database));
  await client.connect();
  try {
    const schema = fs.readFileSync(path.join(process.cwd(), "migrations", "001_init.sql"), "utf8");
    await client.query("BEGIN");
    await client.query(schema);
    await seed(client);
    await client.query("COMMIT");
    console.log("Schema and sample catalog are ready.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
