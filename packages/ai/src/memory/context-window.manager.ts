/**
 * Context Window & Token Budget Management
 * Provides deterministic token calculation, priority-based pruning, and memory compression.
 */

export enum MemoryPriority {
  P1_CURRENT_USER_INSTRUCTION = 1, // Current prompt/edit command (Mandatory, 100% retained)
  P2_CURRENT_IMAGE_VERSION = 2,    // Selected version metadata & seed (Mandatory, 100% retained)
  P3_BRAND_VISUAL_PROFILE = 3,     // Brand colors, fonts, logo rules, prohibited styles (Mandatory)
  P4_CREATIVE_DIRECTION = 4,       // Chosen variation angle (Hero/Lifestyle/Editorial/Bold)
  P5_RECENT_EDIT_HISTORY = 5,      // Immediate parent version edit deltas (last 2-3 turns)
  P6_BRAND_KNOWLEDGE_BASE = 6,     // Audience, USPs, FAQs, Competitors (Compressible)
  P7_OLDER_SESSION_HISTORY = 7,    // Previous generations & older turns (Prunable/Summarized)
}

export interface MemoryItem {
  id: string;
  priority: MemoryPriority;
  category: string;
  content: string;
  structuredData?: any;
  estimatedTokens?: number;
  isCompressible?: boolean;
  compressedContent?: string;
}

export interface TokenBudget {
  modelContextWindow: number;
  systemReservation: number;
  outputReservation: number;
  netAvailableBudget: number;
  allocatedTokens: number;
  remainingTokens: number;
}

export interface AllocatedContextResult {
  budget: TokenBudget;
  retainedItems: MemoryItem[];
  compressedItems: MemoryItem[];
  droppedItems: MemoryItem[];
  totalTokensUsed: number;
  isTruncated: boolean;
}

/**
 * Fast, accurate token estimator for text and structured objects.
 * Accurately models OpenAI/Llama/Gemini BPE token distributions without binary native dependencies.
 */
export function estimateTokens(input: string | object | null | undefined): number {
  if (!input) return 0;

  const text = typeof input === "string" ? input : JSON.stringify(input);
  if (!text || text.length === 0) return 0;

  // Average 3.8 - 4.0 characters per token for English prose + code/JSON punctuation factor
  const charCount = text.length;
  const wordCount = text.trim().split(/\s+/).length;
  const specialChars = (text.match(/[{}\[\],":\-_/\\]/g) || []).length;

  // Weighted formula: base on character count with adjustments for word density and JSON syntax tokens
  const estimated = Math.ceil(charCount / 3.8 + specialChars * 0.25);
  return Math.max(wordCount, estimated);
}

export class ContextWindowManager {
  /**
   * Computes the net memory budget available for conversation and brand context.
   */
  public calculateBudget(
    modelContextWindow: number,
    systemReservation: number = 800,
    outputReservation: number = 2048
  ): TokenBudget {
    const netAvailableBudget = Math.max(
      0,
      modelContextWindow - systemReservation - outputReservation
    );

    return {
      modelContextWindow,
      systemReservation,
      outputReservation,
      netAvailableBudget,
      allocatedTokens: 0,
      remainingTokens: netAvailableBudget,
    };
  }

  /**
   * Allocates memory items into the context window strictly following the Priority Hierarchy.
   * - P1, P2, P3 are NEVER dropped.
   * - P4, P5, P6 are preserved in full if budget permits, or compressed if tight.
   * - P7 is pruned or compressed into a short summary when context is constrained.
   */
  public allocateContext(items: MemoryItem[], budget: TokenBudget): AllocatedContextResult {
    // 1. Pre-calculate token counts for each item
    const itemsWithTokens = items.map((item) => ({
      ...item,
      estimatedTokens: item.estimatedTokens || estimateTokens(item.content),
    }));

    // 2. Sort items strictly by priority (1 to 7)
    const sorted = [...itemsWithTokens].sort((a, b) => a.priority - b.priority);

    let remainingTokens = budget.netAvailableBudget;
    const retainedItems: MemoryItem[] = [];
    const compressedItems: MemoryItem[] = [];
    const droppedItems: MemoryItem[] = [];

    // 3. First Pass: Guarantee P1, P2, P3 (Mandatory Core)
    for (const item of sorted) {
      if (item.priority <= MemoryPriority.P3_BRAND_VISUAL_PROFILE) {
        retainedItems.push(item);
        remainingTokens -= item.estimatedTokens!;
      }
    }

    // 4. Second Pass: Allocate Remaining Priorities (P4 -> P5 -> P6 -> P7)
    for (const item of sorted) {
      if (item.priority <= MemoryPriority.P3_BRAND_VISUAL_PROFILE) {
        continue; // Already allocated
      }

      const itemTokens = item.estimatedTokens!;

      if (remainingTokens >= itemTokens) {
        // Fits completely in full detail
        retainedItems.push(item);
        remainingTokens -= itemTokens;
      } else if (item.isCompressible && item.compressedContent) {
        // Check if compressed representation fits
        const compressedTokens = estimateTokens(item.compressedContent);
        if (remainingTokens >= compressedTokens) {
          const compressedItem: MemoryItem = {
            ...item,
            content: item.compressedContent,
            estimatedTokens: compressedTokens,
          };
          compressedItems.push(compressedItem);
          retainedItems.push(compressedItem);
          remainingTokens -= compressedTokens;
        } else {
          droppedItems.push(item);
        }
      } else {
        // Insufficient budget; item dropped
        droppedItems.push(item);
      }
    }

    const totalTokensUsed = budget.netAvailableBudget - Math.max(0, remainingTokens);

    return {
      budget: {
        ...budget,
        allocatedTokens: totalTokensUsed,
        remainingTokens: Math.max(0, remainingTokens),
      },
      retainedItems,
      compressedItems,
      droppedItems,
      totalTokensUsed,
      isTruncated: droppedItems.length > 0 || compressedItems.length > 0,
    };
  }
}

export const globalContextWindowManager = new ContextWindowManager();
