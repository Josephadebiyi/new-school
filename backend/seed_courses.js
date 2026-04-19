
const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URL || "mongodb://localhost:27017/gitb_lms";
const DB_NAME = process.env.DB_NAME || "gitb_lms";

const courses = [
  {
    title: "Cybersecurity Acceleration Program",
    category: "Technology",
    description: "Fast-track your path into cybersecurity with hands-on labs, real-world simulations, and industry mentors.",
    duration: "Rolling Intake — 2025",
    img: "/images/course-cybersec.jpg",
    price: { upfront: 1500, monthly: 150 },
    discount: 10,
    is_active: true,
    code: "CYBER-ACC-2025"
  },
  {
    title: "KYC & Compliance Sprint",
    category: "Finance",
    description: "Intensive 8-week program covering AML, KYC processes, and EU regulatory frameworks.",
    duration: "Cohort 3 — Spring 2025",
    img: "/images/course-kyc.jpg",
    price: { upfront: 1200, monthly: 120 },
    discount: 5,
    is_active: true,
    code: "KYC-SPRINT-2025"
  },
  {
    title: "UI/UX Design Bootcamp",
    category: "Design",
    description: "From wireframes to polished prototypes — build a portfolio that gets you hired.",
    duration: "Cohort 2 — Summer 2025",
    img: "/images/course-uiux.jpg",
    price: { upfront: 1800, monthly: 180 },
    discount: 0,
    is_active: true,
    code: "UIUX-BOOT-2025"
  },
  {
    title: "Data Science & AI",
    category: "Technology",
    description: "Master Python, Machine Learning, and Big Data to drive business insights.",
    duration: "6 Months",
    img: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
    price: { upfront: 2500, monthly: 250 },
    discount: 15,
    is_active: true,
    code: "DS-AI-2025"
  },
  {
    title: "Digital Marketing Mastery",
    category: "Business",
    description: "Growth hacking, SEO, and social media strategy for modern brands.",
    duration: "4 Months",
    img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    price: { upfront: 900, monthly: 90 },
    discount: 20,
    is_active: true,
    code: "DIGI-MARK-2025"
  }
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    
    // Clear existing courses for a fresh start
    await db.collection("courses").deleteMany({});
    
    // Insert new courses
    for (const c of courses) {
      await db.collection("courses").insertOne({
        ...c,
        id: Math.random().toString(36).substr(2, 9),
        created_at: new Date().toISOString()
      });
    }
    
    console.log("Successfully seeded courses!");
  } catch (err) {
    console.error("Seeding failed:", err);
  } finally {
    await client.close();
  }
}

seed();
