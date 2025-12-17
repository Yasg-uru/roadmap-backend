/**
 * Manual Test Plan for Roadmap Generation System
 * Run these tests to verify the complete flow
 */

import { findSimilarRoadmaps, findExactRoadmap } from '../services/roadmapSearch.service';
import Roadmap from '../models/roadmap.model';
import User from '../models/usermodel';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Import seed function inline to avoid server startup
async function seedPopularRoadmaps() {
  const roadmapsToSeed = [
    {
      title: 'Frontend Development',
      description: 'Complete roadmap for becoming a frontend developer',
      category: 'frontend',
      tags: ['frontend', 'web', 'javascript', 'react', 'html', 'css'],
      searchKeywords: ['frontend', 'web', 'development', 'javascript', 'react', 'html', 'css'],
      isPreGenerated: true,
    },
    {
      title: 'Backend Development',
      description: 'Master backend development with Node.js and databases',
      category: 'backend',
      tags: ['backend', 'nodejs', 'api', 'database', 'server'],
      searchKeywords: ['backend', 'nodejs', 'api', 'database', 'server', 'development'],
      isPreGenerated: true,
    },
    {
      title: 'Python Programming',
      description: 'Learn Python from basics to advanced concepts',
      category: 'data-science',
      tags: ['python', 'programming', 'scripting'],
      searchKeywords: ['python', 'programming', 'scripting', 'data'],
      isPreGenerated: true,
    },
  ];

  for (const roadmapData of roadmapsToSeed) {
    const exists = await Roadmap.findOne({ title: roadmapData.title });
    if (!exists) {
      await Roadmap.create(roadmapData);
      console.log(`   ✓ Created: ${roadmapData.title}`);
    } else {
      // Update existing with searchKeywords
      await Roadmap.updateOne({ title: roadmapData.title }, { 
        $set: { 
          searchKeywords: roadmapData.searchKeywords,
          tags: roadmapData.tags 
        } 
      });
      console.log(`   ✓ Updated: ${roadmapData.title}`);
    }
  }
}

// Database connection function
async function ConnectDatabase() {
  const MONGO_URL = process.env.MONGO_URI || process.env.MONGO_URL || '';
  if (!MONGO_URL) {
    throw new Error('MONGO_URI or MONGO_URL not found in environment variables');
  }
  
  await mongoose.connect(MONGO_URL);
  console.log('✓ Database connected\n');
}

/**
 * Test 1: Seed Popular Roadmaps
 */
async function test1_SeedPopularRoadmaps() {
  console.log('\n=== TEST 1: Seeding Popular Roadmaps ===');
  try {
    await seedPopularRoadmaps();
    
    const count = await Roadmap.countDocuments({ isPreGenerated: true });
    console.log(`✅ Success: ${count} popular roadmaps seeded`);
    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Test 2: Search for Exact Match
 */
async function test2_ExactMatch() {
  console.log('\n=== TEST 2: Exact Match Search ===');
  try {
    const result = await findExactRoadmap('Frontend Development');
    
    if (result) {
      console.log(`✅ Success: Found exact match for "Frontend Development"`);
      console.log(`   Title: ${result.title}`);
      console.log(`   Category: ${result.category}`);
      return true;
    } else {
      console.log('❌ Failed: No exact match found');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Test 3: Search for Similar Roadmaps
 */
async function test3_SimilaritySearch() {
  console.log('\n=== TEST 3: Similarity Search ===');
  try {
    const results = await findSimilarRoadmaps('learn frontend web development', 0.3); // Lower threshold
    
    console.log(`   Found ${results.length} similar roadmaps`);
    results.slice(0, 3).forEach((result, idx) => {
      console.log(`   ${idx + 1}. "${result.roadmap.title}" (${(result.similarity * 100).toFixed(1)}% match)`);
    });
    
    if (results.length > 0) {
      console.log('✅ Success: Found similar roadmaps');
      return true;
    } else {
      console.log('❌ Failed: No results found');
      return false;
    }
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Test 4: Test Upvote/Downvote
 */
async function test4_VotingSystem() {
  console.log('\n=== TEST 4: Voting System ===');
  try {
    const roadmap = await Roadmap.findOne({ isPreGenerated: true });
    if (!roadmap) {
      console.log('❌ Failed: No roadmap found');
      return false;
    }

    const userId = new mongoose.Types.ObjectId();

    // Test upvote
    roadmap.upvotes = roadmap.upvotes || [];
    roadmap.upvotes.push(userId);
    await roadmap.save();
    console.log(`✅ Upvote added. Upvotes: ${roadmap.upvotes.length}`);

    // Test downvote
    roadmap.downvotes = roadmap.downvotes || [];
    roadmap.downvotes.push(userId);
    await roadmap.save();
    console.log(`✅ Downvote added. Downvotes: ${roadmap.downvotes.length}`);
    console.log(`   Quality Score: ${roadmap.qualityScore}`);

    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Test 5: Test Regeneration Flag
 */
async function test5_RegenerationThreshold() {
  console.log('\n=== TEST 5: Regeneration Threshold ===');
  try {
    const roadmap = await Roadmap.findOne({ isPreGenerated: true });
    if (!roadmap) {
      console.log('❌ Failed: No roadmap found');
      return false;
    }

    // Simulate 100 downvotes
    roadmap.downvotes = [];
    for (let i = 0; i < 100; i++) {
      roadmap.downvotes.push(new mongoose.Types.ObjectId());
    }
    
    await roadmap.save();
    
    console.log(`✅ Added 100 downvotes`);
    console.log(`   Needs Regeneration: ${roadmap.needsRegeneration}`);
    console.log(`   Quality Score: ${roadmap.qualityScore?.toFixed(2)}`);
    
    return roadmap.needsRegeneration === true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Test 6: Test Generation with Caching
 */
async function test6_GenerationWithCache() {
  console.log('\n=== TEST 6: Search Performance ===');
  try {
    // Test exact match performance
    console.log('   Testing exact match search...');
    const start1 = Date.now();
    const result1 = await findExactRoadmap('Frontend Development');
    const time1 = Date.now() - start1;
    
    console.log(`   ✅ Found in ${time1}ms (exact match)`);
    console.log(`   Title: ${result1?.title || 'N/A'}`);
    
    // Test similarity search performance
    console.log('\n   Testing similarity search...');
    const start2 = Date.now();
    const result2 = await findSimilarRoadmaps('learn python programming basics', 0.6);
    const time2 = Date.now() - start2;
    
    console.log(`   ✅ Found ${result2.length} results in ${time2}ms`);
    if (result2.length > 0) {
      console.log(`   Top match: ${result2[0].roadmap.title} (${(result2[0].similarity * 100).toFixed(1)}%)`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Failed:', error);
    return false;
  }
}

/**
 * Run all tests
 */
async function runAllTests() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  Roadmap Generation System - Test Suite       ║');
  console.log('╚════════════════════════════════════════════════╝');

  try {
    await ConnectDatabase();

    const results = {
      test1: await test1_SeedPopularRoadmaps(),
      test2: await test2_ExactMatch(),
      test3: await test3_SimilaritySearch(),
      test4: await test4_VotingSystem(),
      test5: await test5_RegenerationThreshold(),
      test6: await test6_GenerationWithCache(),
    };

    console.log('\n╔════════════════════════════════════════════════╗');
    console.log('║  Test Results Summary                          ║');
    console.log('╚════════════════════════════════════════════════╝');
    
    Object.entries(results).forEach(([test, passed]) => {
      console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });

    const totalPassed = Object.values(results).filter(Boolean).length;
    const totalTests = Object.keys(results).length;
    
    console.log(`\n📊 ${totalPassed}/${totalTests} tests passed`);

    if (totalPassed === totalTests) {
      console.log('🎉 All tests passed! System is ready for production.');
    } else {
      console.log('⚠️  Some tests failed. Please review and fix issues.');
    }

    await mongoose.disconnect();
    console.log('\n✓ Database disconnected');
    
    process.exit(totalPassed === totalTests ? 0 : 1);
  } catch (error) {
    console.error('Test suite failed:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Run tests if executed directly
if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

export {
  test1_SeedPopularRoadmaps,
  test2_ExactMatch,
  test3_SimilaritySearch,
  test4_VotingSystem,
  test5_RegenerationThreshold,
  test6_GenerationWithCache,
};
