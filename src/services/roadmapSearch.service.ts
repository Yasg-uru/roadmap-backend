import Roadmap from "../models/roadmap.model";
import mongoose from "mongoose";

interface SearchResult {
  roadmap: any;
  similarity: number;
}

/**
 * Search for similar roadmaps based on user prompt
 * Uses keyword matching and title similarity
 */
export async function findSimilarRoadmaps(
  userPrompt: string,
  threshold: number = 0.6
): Promise<SearchResult[]> {
  try {
    // Normalize and extract keywords from user prompt
    const keywords = extractKeywords(userPrompt);
    
    if (keywords.length === 0) {
      return [];
    }

    // Search for roadmaps with matching keywords or similar titles
    const roadmaps = await Roadmap.find({
      $or: [
        { searchKeywords: { $in: keywords } },
        { title: { $regex: keywords.join('|'), $options: 'i' } },
        { description: { $regex: keywords.join('|'), $options: 'i' } },
        { tags: { $in: keywords } }
      ]
    })
    .lean();

    // Calculate similarity scores
    const results: SearchResult[] = roadmaps.map(roadmap => ({
      roadmap,
      similarity: calculateSimilarity(userPrompt, roadmap)
    }));

    // Filter by threshold and sort by similarity
    return results
      .filter(result => result.similarity >= threshold)
      .sort((a, b) => b.similarity - a.similarity);
      
  } catch (error) {
    console.error("Error finding similar roadmaps:", error);
    return [];
  }
}

/**
 * Extract relevant keywords from user prompt
 */
function extractKeywords(text: string): string[] {
  // Common stopwords to filter out
  const stopwords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'how', 'what', 'when', 'where', 'who',
    'learn', 'guide', 'tutorial', 'roadmap', 'i', 'want', 'need', 'can',
    'should', 'would', 'like', 'make', 'create', 'build'
  ]);

  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopwords.has(word))
    .slice(0, 10); // Limit to top 10 keywords
}

/**
 * Calculate similarity score between user prompt and roadmap
 * Returns a score between 0 and 1
 */
function calculateSimilarity(prompt: string, roadmap: any): number {
  const promptKeywords = new Set(extractKeywords(prompt));
  const roadmapKeywords = new Set([
    ...extractKeywords(roadmap.title),
    ...(roadmap.searchKeywords || []),
    ...(roadmap.tags || [])
  ]);

  if (promptKeywords.size === 0 || roadmapKeywords.size === 0) {
    return 0;
  }

  // Calculate Jaccard similarity (intersection / union)
  const intersection = new Set(
    [...promptKeywords].filter(k => roadmapKeywords.has(k))
  );
  
  const union = new Set([...promptKeywords, ...roadmapKeywords]);
  
  const jaccardSimilarity = intersection.size / union.size;

  // Boost score if title contains major keywords
  const titleBoost = [...promptKeywords].some(keyword => 
    roadmap.title.toLowerCase().includes(keyword)
  ) ? 0.2 : 0;

  // Consider quality score (downvotes should reduce similarity)
  const qualityFactor = roadmap.needsRegeneration ? 0.5 : 1.0;

  return Math.min((jaccardSimilarity + titleBoost) * qualityFactor, 1.0);
}

/**
 * Check if a roadmap exists by exact title match
 */
export async function findExactRoadmap(title: string) {
  return await Roadmap.findOne({
    title: { $regex: `^${title}$`, $options: 'i' }
  });
}

/**
 * Get popular pre-generated roadmaps
 */
export async function getPopularRoadmaps(limit: number = 20) {
  return await Roadmap.find({
    isPreGenerated: true,
    isPublished: true
  })
  .sort({ 'stats.views': -1, 'stats.completions': -1 })
  .limit(limit);
}
