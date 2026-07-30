import { MasteryState, SMCard, UserProfile } from "@/types";

/**
 * In-memory data store for Lucid.
 *
 * This is a hackathon-appropriate storage solution. In production,
 * replace with Supabase, Firebase, or PostgreSQL.
 *
 * The store is intentionally simple: a singleton object with
 * synchronous accessors. All data is lost on server restart.
 */

interface Store {
  users: Map<string, UserProfile>;
  mastery: Map<string, MasteryState>; // key: user_id
  cards: Map<string, SMCard[]>; // key: user_id
}

const store: Store = {
  users: new Map(),
  mastery: new Map(),
  cards: new Map(),
};

// ─── User Operations ───────────────────────────────────────

export function getUser(userId: string): UserProfile | undefined {
  return store.users.get(userId);
}

export function upsertUser(user: UserProfile): UserProfile {
  store.users.set(user.id, user);
  return user;
}

export function getAllUsers(): UserProfile[] {
  return Array.from(store.users.values());
}

// ─── Mastery Operations ────────────────────────────────────

export function getMastery(userId: string): MasteryState {
  return store.mastery.get(userId) ?? {};
}

export function setMastery(userId: string, mastery: MasteryState): void {
  store.mastery.set(userId, mastery);
}

// ─── SM-2 Card Operations ──────────────────────────────────

export function getCards(userId: string): SMCard[] {
  return store.cards.get(userId) ?? [];
}

export function setCards(userId: string, cards: SMCard[]): void {
  store.cards.set(userId, cards);
}

export function upsertCard(userId: string, card: SMCard): SMCard {
  const cards = getCards(userId);
  const existingIndex = cards.findIndex((c) => c.id === card.id);
  if (existingIndex >= 0) {
    cards[existingIndex] = card;
  } else {
    cards.push(card);
  }
  setCards(userId, cards);
  return card;
}

// Re-export for convenience
import { INTEREST_TAGS } from "@/types";
export { INTEREST_TAGS };

// ─── Utility ───────────────────────────────────────────────

export function getDueCards(userId: string, now?: Date): SMCard[] {
  const cards = getCards(userId);
  const currentDate = now ?? new Date();
  return cards.filter((c) => new Date(c.dueDate) <= currentDate);
}

export function generateUserId(): string {
  return `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}
