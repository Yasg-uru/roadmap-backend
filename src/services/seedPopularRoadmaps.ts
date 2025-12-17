import mongoose from "mongoose";
import Roadmap from "../models/roadmap.model";
import RoadmapNode from "../models/roadmap_node.model";
import Resource from "../models/resource.model";
import ConnectDatabase from "../lib/connectDb";
import dotenv from "dotenv";

dotenv.config();

/**
 * Popular roadmaps to pre-generate
 * These will be created when the system starts or via manual seeding
 */
const popularRoadmaps = [
  {
    title: "Frontend Development",
    description: "Complete roadmap to become a frontend developer",
    category: "frontend",
    difficulty: "beginner",
    tags: ["html", "css", "javascript", "react", "vue", "angular"],
  },
  {
    title: "Backend Development",
    description: "Master backend development with Node.js, Python, and more",
    category: "backend",
    difficulty: "intermediate",
    tags: ["nodejs", "python", "java", "api", "database"],
  },
  {
    title: "Full Stack JavaScript",
    description: "Learn full stack development with JavaScript",
    category: "frontend",
    difficulty: "intermediate",
    tags: ["javascript", "nodejs", "react", "mongodb", "express"],
  },
  {
    title: "DevOps Engineer",
    description: "Complete DevOps learning path",
    category: "devops",
    difficulty: "advanced",
    tags: ["docker", "kubernetes", "ci/cd", "aws", "terraform"],
  },
  {
    title: "Python Programming",
    description: "Learn Python from basics to advanced",
    category: "backend",
    difficulty: "beginner",
    tags: ["python", "django", "flask", "data-science"],
  },
  {
    title: "React Developer",
    description: "Master React.js and its ecosystem",
    category: "frontend",
    difficulty: "intermediate",
    tags: ["react", "redux", "hooks", "nextjs"],
  },
  {
    title: "Data Science",
    description: "Complete data science learning path",
    category: "data-science",
    difficulty: "intermediate",
    tags: ["python", "machine-learning", "pandas", "numpy", "tensorflow"],
  },
  {
    title: "Mobile App Development",
    description: "Learn to build mobile apps with React Native or Flutter",
    category: "mobile",
    difficulty: "intermediate",
    tags: ["react-native", "flutter", "ios", "android"],
  },
  {
    title: "Cloud Computing",
    description: "Master cloud platforms and services",
    category: "cloud",
    difficulty: "advanced",
    tags: ["aws", "azure", "gcp", "serverless"],
  },
  {
    title: "Cybersecurity Fundamentals",
    description: "Learn cybersecurity basics and best practices",
    category: "cybersecurity",
    difficulty: "intermediate",
    tags: ["security", "ethical-hacking", "penetration-testing"],
  },
];

/**
 * Seed popular roadmaps into the database
 */
export async function seedPopularRoadmaps() {
  try {
    console.log("Starting to seed popular roadmaps...");

    for (const roadmapData of popularRoadmaps) {
      // Check if roadmap already exists
      const existing = await Roadmap.findOne({
        title: roadmapData.title,
        isPreGenerated: true,
      });

      if (existing) {
        console.log(`Roadmap "${roadmapData.title}" already exists, skipping...`);
        continue;
      }

      // Create the roadmap
      const roadmap = await Roadmap.create({
        ...roadmapData,
        isPublished: true,
        isPreGenerated: true,
        stats: {
          views: 0,
          completions: 0,
          averageRating: 4.5,
          ratingsCount: 0,
        },
        upvotes: [],
        downvotes: [],
        qualityScore: 100,
        needsRegeneration: false,
      });

      console.log(`Created pre-generated roadmap: ${roadmap.title}`);
    }

    console.log("Finished seeding popular roadmaps!");
  } catch (error) {
    console.error("Error seeding popular roadmaps:", error);
    throw error;
  }
}

/**
 * Clear all pre-generated roadmaps (useful for testing)
 */
export async function clearPreGeneratedRoadmaps() {
  try {
    console.log("Clearing pre-generated roadmaps...");

    const preGenerated = await Roadmap.find({ isPreGenerated: true });

    for (const roadmap of preGenerated) {
      // Delete associated nodes and resources
      await RoadmapNode.deleteMany({ roadmap: roadmap._id });
      await roadmap.deleteOne();
    }

    console.log("Cleared all pre-generated roadmaps!");
  } catch (error) {
    console.error("Error clearing pre-generated roadmaps:", error);
    throw error;
  }
}

// Run seed if this file is executed directly
if (require.main === module) {
  ConnectDatabase()
    .then(async () => {
      await seedPopularRoadmaps();
      console.log("Seeding completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}
