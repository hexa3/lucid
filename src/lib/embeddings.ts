import { env, pipeline } from "@xenova/transformers";

/**
 * Embedding service using Transformers.js (ONNX runtime in Node.js).
 * Downloads the model on first use, caches it afterwards.
 *
 * Model: Xenova/all-MiniLM-L6-v2
 * - 384-dimensional sentence embeddings
 * - Fast, lightweight (~80MB)
 * - Optimized for similarity search
 */

// Suppress the ONNX warning about local template files
env.localModelPath = "/tmp/transformers-cache";

let embedder: PipelineResult | null = null;

/** Minimal type for the pipeline result we use */
interface PipelineResult {
  data: Float32Array;
  dims: number[];
}

/**
 * Get or initialize the embedding pipeline.
 * This is idempotent — subsequent calls return the cached pipeline.
 */
export async function getEmbedder(): Promise<PipelineResult> {
  if (!embedder) {
    const modelName =
      process.env.EMBEDDING_MODEL || "Xenova/all-MiniLM-L6-v2";
    const pipe = await pipeline("feature-extraction", modelName, {
      quantized: true,
    });
    embedder = pipe as unknown as PipelineResult;
  }
  return embedder;
}

/**
 * Embed a single text string into a 384-dimensional vector.
 */
export async function embedText(text: string): Promise<number[]> {
  const pipe = await getEmbedder();
  const result = await (
    pipe as unknown as (texts: string[], options?: Record<string, unknown>) => { data: Float32Array; dims: number[] }
  )([text], { pooling: "mean", normalize: true });
  return Array.from(result.data);
}

/**
 * Embed multiple texts in a single batch (much faster than one at a time).
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];
  const pipe = await getEmbedder();
  const result = await (
    pipe as unknown as (texts: string[], options?: Record<string, unknown>) => { data: Float32Array; dims: number[] }
  )(texts, { pooling: "mean", normalize: true });
  const dims = result.dims;
  const vectorSize = dims[dims.length - 1];
  const vectors: number[][] = [];
  for (let i = 0; i < texts.length; i++) {
    const start = i * vectorSize;
    const end = start + vectorSize;
    vectors.push(Array.from(result.data.slice(start, end)));
  }
  return vectors;
}

/**
 * Hydrate the seed content with precomputed embeddings.
 * Call this once at server startup.
 */
export async function precomputeEmbeddings(
  topics: Array<{
    topic_id: string;
    subconcepts: Array<{
      id: string;
      misconceptions: Array<{
        id: string;
        statement: string;
        socratic_probe: string;
      }>;
    }>;
  }>
): Promise<void> {
  const allStatements: string[] = [];
  const indexMap: Array<{
    topicId: string;
    subconceptId: string;
    misconceptionId: string;
  }> = [];

  for (const topic of topics) {
    for (const sub of topic.subconcepts) {
      for (const mc of sub.misconceptions) {
        allStatements.push(mc.statement);
        indexMap.push({
          topicId: topic.topic_id,
          subconceptId: sub.id,
          misconceptionId: mc.id,
        });
      }
    }
  }

  if (allStatements.length === 0) return;

  const embeddings = await embedBatch(allStatements);

  // Write embeddings back into the topic data
  for (let i = 0; i < indexMap.length; i++) {
    const { topicId, subconceptId, misconceptionId } = indexMap[i];
    const topic = topics.find((t) => t.topic_id === topicId);
    if (!topic) continue;
    const sub = topic.subconcepts.find((s) => s.id === subconceptId);
    if (!sub) continue;
    const mc = sub.misconceptions.find((m) => m.id === misconceptionId);
    if (!mc) continue;
    (mc as any).embedding = embeddings[i];
  }
}
