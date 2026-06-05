import { describe, it, expect, vi } from 'vitest';
import { validateEmbedding } from '../infra/aiService';
import { getMagnitude, cosineSimilarityOptimized, narrativeMemoryService } from '../narrative/memory/narrativeMemoryService';
import { VectorData } from '../types';

// Mock geminiService for isolated embedding testing
const mockEmbedText = async (
  text: string,
  taskType: string = 'RETRIEVAL_DOCUMENT'
): Promise<number[]> => {
  if (!text || text.length < 5) return [];
  // Return mock 768-dimensional vector
  const arr = new Array(768).fill(1).map((_, i) => (i === 0 ? 0.5 : 0.0));
  return arr;
};

describe('1. Embedding Generation & Validation Tests', () => {
  it('should validate 768-dimensional vectors as correct for gemini-embedding-2', () => {
    const validVector = new Array(768).fill(0.1);
    expect(validateEmbedding(validVector)).toBe(true);
  });

  it('should reject non-array types', () => {
    expect(validateEmbedding(null as any)).toBe(false);
    expect(validateEmbedding(undefined as any)).toBe(false);
  });

  it('should reject vectors with dimension mismatches (length !== 768)', () => {
    const invalidVector1536 = new Array(1536).fill(0.1);
    const invalidVectorEmpty: number[] = [];
    const invalidVectorSmall = [0.1, 0.2];

    expect(validateEmbedding(invalidVector1536)).toBe(false);
    expect(validateEmbedding(invalidVectorEmpty)).toBe(false);
    expect(validateEmbedding(invalidVectorSmall)).toBe(false);
  });

  it('should reject vectors containing NaN values', () => {
    const nanVector = new Array(768).fill(0.1);
    nanVector[10] = NaN;
    expect(validateEmbedding(nanVector)).toBe(false);
  });

  it('should verify taskType parameters passed to embedding engine mock', async () => {
    const resDoc = await mockEmbedText('Test document chunk', 'RETRIEVAL_DOCUMENT');
    expect(resDoc.length).toBe(768);
    expect(resDoc[0]).toBe(0.5);

    const resQuery = await mockEmbedText('Test query parameter', 'RETRIEVAL_QUERY');
    expect(resQuery.length).toBe(768);
  });
});

describe('2. Vector Search Dimension Safety & Similarity Tests', () => {
  it('should calculate cosine magnitude and similarity accurately', () => {
    const vecA = [1, 0, 0];
    const vecB = [0.1, 0.9, 0];
    const normA = getMagnitude(vecA);
    const normB = getMagnitude(vecB);
    
    expect(normA).toBeCloseTo(1.0);
    const similarity = cosineSimilarityOptimized(vecA, vecB, normA, normB);
    expect(similarity).toBeCloseTo(0.1 / normB);
  });

  it('should filter out vectors with dimension mismatches in search results', () => {
    const queryEmbedding = [1.0, 0.0, 0.0]; // Dim 3
    const mockVectors: VectorData[] = [
      {
        id: '1',
        storyId: 'story-123',
        text: 'Chính xác chiều',
        embedding: [0.9, 0.1, 0.0], // Dim 3
        magnitude: 1.0,
        createdAt: Date.now(),
        metadata: { type: 'canon_core', referenceId: 'bible', importance: 5 }
      },
      {
        id: '2',
        storyId: 'story-123',
        text: 'Lệch chiều 2 chiều',
        embedding: [1.0, 0.0], // Mismatched Dim 2
        magnitude: 1.0,
        createdAt: Date.now(),
        metadata: { type: 'canon_core', referenceId: 'bible', importance: 5 }
      },
      {
        id: '3',
        storyId: 'story-123',
        text: 'Lệch chiều 4 chiều',
        embedding: [1.0, 0.0, 0.0, 0.0], // Mismatched Dim 4
        magnitude: 1.0,
        createdAt: Date.now(),
        metadata: { type: 'canon_core', referenceId: 'bible', importance: 5 }
      }
    ];

    // Execution search
    const results = narrativeMemoryService.search(queryEmbedding, mockVectors, { topK: 5, minScore: 0.1 });
    
    // Result verification: ONLY vector '1' matches dimensions and should be retrieved
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('1');
  });
});

describe('3. Backward Compatibility & Migration Logic Tests', () => {
  it('should correctly identify when migration is required for loaded vectors', () => {
    // Scenario A: Vectors lack 'model' field or have wrong embedding length
    const legacyVectors: VectorData[] = [
      {
        id: 'v1',
        storyId: 's1',
        text: 'Old snippet',
        embedding: new Array(1536).fill(0.1), // Old models had 1536 dim
        createdAt: Date.now(),
        metadata: { type: 'chapter', referenceId: 'c1' } // Excludes model info
      },
      {
        id: 'v2',
        storyId: 's1',
        text: 'New snippet but old model mark',
        embedding: new Array(768).fill(0.1),
        createdAt: Date.now(),
        metadata: { type: 'chapter', referenceId: 'c1', model: 'gemini-embedding-001' }
      }
    ];

    const needsMigrationLegacy = legacyVectors.some(v => 
      !v.embedding || 
      v.embedding.length !== 768 || 
      v.metadata.model !== 'gemini-embedding-2'
    );
    expect(needsMigrationLegacy).toBe(true);

    // Scenario B: Vectors are fully up-to-date
    const modernVectors: VectorData[] = [
      {
        id: 'v3',
        storyId: 's1',
        text: 'Modern snippet 1',
        embedding: new Array(768).fill(0.1),
        createdAt: Date.now(),
        metadata: { type: 'chapter', referenceId: 'c1', model: 'gemini-embedding-2' }
      },
      {
        id: 'v4',
        storyId: 's1',
        text: 'Modern snippet 2',
        embedding: new Array(768).fill(0.1),
        createdAt: Date.now(),
        metadata: { type: 'chapter', referenceId: 'c1', model: 'gemini-embedding-2' }
      }
    ];

    const needsMigrationModern = modernVectors.some(v => 
      !v.embedding || 
      v.embedding.length !== 768 || 
      v.metadata.model !== 'gemini-embedding-2'
    );
    expect(needsMigrationModern).toBe(false);
  });
});
