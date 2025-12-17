# AI Roadmap Generation System with Caching & Quality Control

## Overview

This production-grade system implements intelligent roadmap generation with:
- **Smart Caching**: Searches existing roadmaps before generating new ones
- **Quality Monitoring**: Tracks upvotes/downvotes with automatic regeneration at 100+ downvotes
- **Pre-generated Popular Roadmaps**: Seeds common roadmaps to reduce redundant generation
- **Fuzzy Matching**: Finds similar roadmaps even with different phrasing

## Architecture Flow

```
User Request → Search Existing → Similar Match? → Return Cached
                     ↓                               
                 Not Found → Generate New → Save & Return
                     
Roadmap Quality ← User Votes (Upvote/Downvote)
                     ↓
              100+ Downvotes? → Auto-flag for regeneration
```

## Key Features

### 1. Intelligent Search Before Generation

When a user requests a roadmap:
1. **Exact Match Check**: Searches for exact title match
2. **Similarity Search**: Uses keyword extraction and Jaccard similarity
3. **Quality Filter**: Only returns high-quality roadmaps (not flagged for regeneration)
4. **Threshold**: 0.7 minimum similarity, 0.8 for auto-return

### 2. Quality Tracking

Each roadmap tracks:
- `upvotes[]`: Array of user IDs who upvoted
- `downvotes[]`: Array of user IDs who downvoted
- `qualityScore`: Calculated as (upvotes / totalVotes) * 100
- `needsRegeneration`: Auto-set to true when downvotes >= 100
- `regenerationHistory[]`: Tracks all regeneration events

### 3. Pre-generated Popular Roadmaps

Popular topics are pre-seeded:
- Frontend Development
- Backend Development
- Full Stack JavaScript
- DevOps Engineer
- Python Programming
- React Developer
- Data Science
- Mobile App Development
- Cloud Computing
- Cybersecurity Fundamentals

### 4. Automatic Regeneration

When a roadmap reaches 100+ downvotes:
- `needsRegeneration` flag is set automatically
- Admin or system can trigger regeneration
- Old nodes and resources are deleted
- New content is generated with AI
- Version number is incremented
- Votes are reset
- History is preserved

## API Endpoints

### Generate/Get Roadmap
```
POST /roadmap/generate
Body: { userPrompt: "Learn React" }
```
- Searches existing roadmaps first
- Returns cached version if found (>0.8 similarity & good quality)
- Generates new one if not found

### Upvote Roadmap
```
PATCH /roadmap/:id/upvote
Headers: { Authorization: Bearer <token> }
```
- Removes user from downvotes if present
- Toggles upvote for user
- Recalculates quality score

### Downvote Roadmap
```
PATCH /roadmap/:id/downvote
Headers: { Authorization: Bearer <token> }
```
- Removes user from upvotes if present
- Toggles downvote for user
- Auto-flags for regeneration at 100 downvotes

### Regenerate Roadmap
```
POST /roadmap/:id/regenerate
Headers: { Authorization: Bearer <token> }
```
- Requires `needsRegeneration: true` OR admin role
- Deletes old content
- Generates fresh content with AI
- Resets votes and increments version

## Database Schema Updates

### Roadmap Model Additions
```typescript
{
  upvotes: ObjectId[],
  downvotes: ObjectId[],
  qualityScore: Number,
  needsRegeneration: Boolean,
  regenerationHistory: [{
    regeneratedAt: Date,
    reason: String,
    previousDownvotes: Number
  }],
  isPreGenerated: Boolean,
  searchKeywords: String[]
}
```

## Seeding Popular Roadmaps

Run the seed script:
```bash
npm run seed-roadmaps
```

Or programmatically:
```typescript
import { seedPopularRoadmaps } from './services/seedPopularRoadmaps';
await seedPopularRoadmaps();
```

## Search Algorithm

### Keyword Extraction
1. Converts text to lowercase
2. Removes stopwords (a, an, the, is, etc.)
3. Filters words < 3 characters
4. Returns top 10 keywords

### Similarity Calculation
```
Jaccard Similarity = intersection / union of keywords
Title Boost = +0.2 if title contains major keywords
Quality Factor = 0.5 if needs regeneration, else 1.0
Final Score = min((Jaccard + Boost) * Quality, 1.0)
```

### Search Thresholds
- **Minimum**: 0.6 (60% similarity)
- **Auto-return**: 0.8 (80% similarity)
- Sorted by similarity descending

## Production Best Practices

### ✅ Implemented
- ✅ Fuzzy keyword matching for flexible search
- ✅ Quality score calculation with vote tracking
- ✅ Automatic flagging at 100 downvote threshold
- ✅ Search keywords indexing for performance
- ✅ Regeneration history tracking
- ✅ Pre-generated popular roadmaps
- ✅ Version control for roadmaps
- ✅ Socket.io progress tracking

### 🔄 Monitoring & Maintenance
- Set up cron job to check `needsRegeneration` flag daily
- Monitor quality scores and regeneration patterns
- Track search hit rate vs generation rate
- Alert on high downvote rates

### 🚀 Performance Optimization
- Index `searchKeywords`, `isPreGenerated`, `needsRegeneration`
- Cache frequently accessed roadmaps in Redis (optional)
- Rate limit generation endpoint (1 per minute per user)
- Queue regeneration jobs for async processing

## Usage Examples

### Example 1: User Requests "Learn React"
1. System searches for "react" in existing roadmaps
2. Finds "React Developer" (90% similarity, quality: 95)
3. Returns cached version instantly
4. Increments view count

### Example 2: User Requests "Machine Learning with PyTorch"
1. Searches existing roadmaps
2. Finds "Data Science" (65% similarity) - below 0.8 threshold
3. Generates new roadmap with AI
4. Saves with `isPreGenerated: false`
5. Returns new roadmap

### Example 3: Roadmap Reaches 100 Downvotes
1. User downvotes bring total to 100
2. Pre-save hook sets `needsRegeneration: true`
3. Quality score drops to low value
4. Admin/cron triggers regeneration
5. New version created, votes reset

## Testing

### Manual Test Flow
```bash
# 1. Seed popular roadmaps
npm run seed-roadmaps

# 2. Test search (should return cached)
curl -X POST http://localhost:8000/roadmap/generate \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"frontend development"}'

# 3. Test new generation
curl -X POST http://localhost:8000/roadmap/generate \
  -H "Content-Type: application/json" \
  -d '{"userPrompt":"quantum computing basics"}'

# 4. Test voting
curl -X PATCH http://localhost:8000/roadmap/:id/downvote \
  -H "Authorization: Bearer <token>"

# 5. Test regeneration
curl -X POST http://localhost:8000/roadmap/:id/regenerate \
  -H "Authorization: Bearer <token>"
```

## Monitoring Metrics

Track these metrics for optimization:
- **Cache Hit Rate**: Existing roadmaps returned / Total requests
- **Generation Rate**: New roadmaps created / Total requests
- **Average Quality Score**: Across all roadmaps
- **Regeneration Frequency**: How often roadmaps are regenerated
- **Search Performance**: Time to find similar roadmaps

## Future Enhancements

1. **ML-based Similarity**: Use embeddings instead of keyword matching
2. **User Personalization**: Recommend roadmaps based on user history
3. **Collaborative Filtering**: Suggest similar roadmaps based on votes
4. **Auto-improvement**: Use downvote feedback to improve generation prompts
5. **A/B Testing**: Test different versions of the same roadmap

## Troubleshooting

### Issue: Too many regenerations
- Increase downvote threshold from 100 to higher value
- Implement exponential backoff for regeneration

### Issue: Poor search matches
- Lower similarity threshold (currently 0.7)
- Add more keywords to roadmap descriptions
- Implement fuzzy string matching library

### Issue: Slow generation
- Cache OpenAI responses
- Use streaming for real-time updates
- Queue generation jobs with Bull/BullMQ

## License & Credits

Built with:
- Node.js + Express
- MongoDB + Mongoose
- OpenAI GPT-4
- Socket.io for real-time progress
