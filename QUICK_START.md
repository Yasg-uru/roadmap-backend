# Quick Start Guide - AI Roadmap Generation System

## 🚀 Quick Start

### 1. Seed Popular Roadmaps
```bash
cd roadmap-website-backend
npm run seed-roadmaps
```

This pre-generates 10 popular roadmaps that will be returned instantly when requested.

### 2. Test the System
```bash
npm run test-roadmap-system
```

Runs comprehensive tests to verify all features are working.

### 3. Start Development Server
```bash
npm run dev
```

## 📡 API Endpoints

### Generate/Get Roadmap
```http
POST /api/roadmaps/generate
Content-Type: application/json

{
  "userPrompt": "frontend development",
  "isCommunityContributed": false
}
```

**Flow**:
1. Checks for exact title match (instant return if found)
2. Searches for similar roadmaps (returns if 80%+ similarity and good quality)
3. Generates new roadmap if no good match (saves for future)

### Vote on Roadmap
```http
PATCH /api/roadmaps/:id/upvote
Authorization: Bearer <token>
```

```http
PATCH /api/roadmaps/:id/downvote
Authorization: Bearer <token>
```

- Toggles user's vote (clicking again removes vote)
- Updates quality score automatically
- Sets `needsRegeneration: true` at 100 downvotes

### Regenerate Roadmap
```http
POST /api/roadmaps/:id/regenerate
Authorization: Bearer <token>

{
  "reason": "Low quality feedback"
}
```

**Process**:
1. Deletes old nodes and resources
2. Generates fresh content with AI
3. Resets votes to 0
4. Increments version number
5. Saves old version to history

## 🔍 How Search Works

### Keyword Extraction
Prompt: "I want to learn frontend web development"

**Extracted**: `['frontend', 'web', 'development']`
- Removes stopwords (i, want, learn, etc.)
- Filters short words (<3 chars)
- Limits to top 10 keywords

### Similarity Calculation
Uses **Jaccard Similarity**:
```
similarity = (keywords_in_common) / (total_unique_keywords)
```

**Boosts**:
- +0.2 if title contains major keywords
- ×0.5 if roadmap needs regeneration

**Thresholds**:
- **0.6**: Minimum to be considered similar
- **0.7**: Included in search results
- **0.8**: Auto-returned without generating new

## 📊 Quality Tracking

### Quality Score Formula
```javascript
qualityScore = (upvotes.length / totalVotes) * 100
```

Where: `totalVotes = upvotes.length + downvotes.length`

### Regeneration Logic
- **Trigger**: 100 downvotes
- **Flag**: `needsRegeneration = true`
- **Process**: Stored in `regenerationHistory[]`
- **Reset**: Votes reset to 0 after regeneration

## 🎯 Use Cases

### Case 1: Popular Topic (Cache Hit)
```
User Request: "Frontend Development"
↓
Exact Match Found: "Frontend Development" (pre-generated)
↓
Return instantly (no AI call) ⚡
```

### Case 2: Similar Topic (Similarity Match)
```
User Request: "learn modern frontend"
↓
No exact match
↓
Similar Found: "Frontend Development" (85% similarity)
↓
Return existing roadmap (no AI call) ⚡
```

### Case 3: New Topic (Generate)
```
User Request: "quantum computing for beginners"
↓
No exact match
↓
No similar results (< 70% similarity)
↓
Generate new with AI 🤖
↓
Save for future requests
```

### Case 4: Low Quality (Regenerate)
```
Roadmap: "Outdated React Tutorial"
↓
105 downvotes (> 100 threshold)
↓
needsRegeneration = true
↓
Admin/System triggers regeneration
↓
Fresh content generated, old archived
```

## 🛠️ Configuration

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/your-db
OPENAI_API_KEY=sk-...
PORT=8000
```

### Deployment notes (Render)

- Ensure the **Build Command** is `npm run build` and the **Start Command** is `npm start` (or `node dist/index.js`).
- Render may run `node index.js` by default — that will fail because the TypeScript source is in `src/` and the compiled entry is `dist/index.js`.
- To auto-build after `npm install`, a `postinstall` script is included that runs `npm run build`.
- Do NOT commit your `.env` with secrets to the repo; use Render's environment variables in the dashboard.

### Adjust Thresholds
Edit `src/services/generateroadmap_service.ts`:

```typescript
// Minimum similarity to consider
const SIMILARITY_THRESHOLD = 0.7; // Default: 0.7

// Auto-return threshold
const AUTO_RETURN_THRESHOLD = 0.8; // Default: 0.8

// Quality threshold
const QUALITY_THRESHOLD = 50; // Default: 50
```

Edit `src/models/roadmap.model.ts`:
```typescript
// Regeneration threshold
if (downvotes >= 100) { // Default: 100
  this.needsRegeneration = true;
}
```

## 🐛 Troubleshooting

### Issue: "User model not registered"
**Solution**: Import User model before using Roadmap queries
```typescript
import User from '../models/usermodel';
import Roadmap from '../models/roadmap.model';
```

### Issue: Tests show 0 search results
**Solution**: Ensure `searchKeywords` are populated:
```bash
npm run seed-roadmaps
```

### Issue: Votes not updating
**Solution**: Check authentication middleware is active on routes

### Issue: Slow searches
**Solution**: Add indexes to frequently queried fields:
```typescript
roadmapSchema.index({ searchKeywords: 1 });
roadmapSchema.index({ title: 1 });
roadmapSchema.index({ isPreGenerated: 1, isPublished: 1 });
```

## 📈 Monitoring

### Key Metrics to Track
1. **Cache Hit Rate**: % of requests served from cache
2. **Regeneration Frequency**: Roadmaps needing updates
3. **Search Performance**: Query response times
4. **AI Generation Cost**: OpenAI API usage

### Suggested Alerts
- Alert when any roadmap reaches 90 downvotes
- Alert if cache hit rate drops below 50%
- Alert if search queries exceed 500ms
- Alert on AI generation failures

## 🎓 Best Practices

### DO:
✅ Run seed script before production
✅ Monitor downvote counts regularly
✅ Update pre-generated roadmaps quarterly
✅ Use exact matches for common queries
✅ Cache AI responses immediately

### DON'T:
❌ Generate roadmaps synchronously without caching
❌ Ignore roadmaps with high downvote counts
❌ Skip the seed script in production
❌ Remove similarity thresholds without testing
❌ Populate contributor field in tests

## 📚 Additional Resources

- **Full Documentation**: `ROADMAP_SYSTEM_DOCS.md`
- **Test Results**: `TEST_RESULTS.md`
- **API Routes**: `src/route/roadmap.route.ts`
- **Search Algorithm**: `src/services/roadmapSearch.service.ts`
- **Generation Logic**: `src/services/generateroadmap_service.ts`

## 💡 Tips

1. **Pre-generate strategically**: Focus on high-traffic topics
2. **Monitor quality**: Set up alerts for downvote thresholds
3. **Optimize keywords**: Review and update searchKeywords periodically
4. **Test similarity**: Adjust thresholds based on user feedback
5. **Archive history**: Keep regeneration history for analytics

---

**Need Help?** Check `ROADMAP_SYSTEM_DOCS.md` for comprehensive documentation.
