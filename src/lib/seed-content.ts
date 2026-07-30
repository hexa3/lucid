import { Topic } from "@/types";

/**
 * Seed content for Lucid.
 * Each topic has hand-authored sub-concepts and misconceptions.
 * These are precomputed with embeddings at startup.
 */
export const SEED_TOPICS: Topic[] = [
  // ─── Topic 1: Newton's Second Law (Physics) ─────────────────────
  {
    topic_id: "newtons_second_law",
    display_name: "Newton's Second Law (F = ma)",
    subconcepts: [
      {
        id: "force_mass_accel_relationship",
        label: "Force, mass, and acceleration",
        misconceptions: [
          {
            id: "M1",
            statement:
              "Heavier objects always accelerate slower than lighter ones, regardless of the force applied",
            socratic_probe:
              "If a truck and a bicycle both have the SAME force applied, which accelerates more, and why?",
          },
          {
            id: "M2",
            statement:
              "A constant force is required just to keep something moving at constant velocity",
            socratic_probe:
              "If you're in deep space with no friction and give something one push, does it need another push to keep moving?",
          },
          {
            id: "M3",
            statement:
              "Force and acceleration are the same thing measured in different units",
            socratic_probe:
              "If you push a wall as hard as you can and it doesn't move, is there zero acceleration but still a force?",
          },
        ],
      },
      {
        id: "inertia_momentum",
        label: "Inertia and momentum",
        misconceptions: [
          {
            id: "M4",
            statement:
              "Inertia is just another word for momentum and they mean the same thing",
            socratic_probe:
              "A parked car has momentum? A parked car has inertia? Are those answers the same?",
          },
          {
            id: "M5",
            statement:
              "Objects in motion naturally slow down and stop on their own without any force acting on them",
            socratic_probe:
              "If you slide a book across a table, what forces are actually slowing it down? What would happen on ice?",
          },
        ],
      },
    ],
  },

  // ─── Topic 2: Photosynthesis (Biology) ──────────────────────────
  {
    topic_id: "photosynthesis",
    display_name: "Photosynthesis",
    subconcepts: [
      {
        id: "plant_nutrition_source",
        label: "Where plants get their mass from",
        misconceptions: [
          {
            id: "M1",
            statement:
              "Plants get most of their mass and food from the soil, not from CO₂ in the air",
            socratic_probe:
              "If a tree grows from a tiny seed into a massive tree, and the soil around it barely loses any mass, where did all that tree mass come from?",
          },
          {
            id: "M2",
            statement:
              "Fertilizer IS the plant's food the same way pizza is our food",
            socratic_probe:
              "What does fertilizer actually provide — calories/energy, or something else like minerals? What do plants actually 'eat' for energy?",
          },
        ],
      },
      {
        id: "photosynthesis_respiration_relationship",
        label: "Photosynthesis vs. cellular respiration",
        misconceptions: [
          {
            id: "M3",
            statement:
              "Plants only photosynthesize and never respire — they don't breathe like animals",
            socratic_probe:
              "If plants only release oxygen and never use it, what happens to them at night when there's no sunlight? Do they still need energy to live?",
          },
          {
            id: "M4",
            statement:
              "Photosynthesis and cellular respiration are exact opposites that cancel each other out",
            socratic_probe:
              "Do opposites cancel out and disappear, or do they coexist in a cycle? What does each process produce that the other needs?",
          },
        ],
      },
      {
        id: "photosynthesis_mechanics",
        label: "Where and how photosynthesis happens",
        misconceptions: [
          {
            id: "M5",
            statement:
              "Photosynthesis only happens in leaves — that's the only green part of a plant",
            socratic_probe:
              "What about a cactus that has no leaves? Or a stem that's green? What makes something able to photosynthesize?",
          },
          {
            id: "M6",
            statement:
              "Plants breathe in CO₂ and breathe out O₂ in exactly the same way humans breathe air in and out",
            socratic_probe:
              "Do plants have lungs? Do they actively 'inhale' and 'exhale' on a rhythm? How do gases actually move in and out of a leaf?",
          },
        ],
      },
    ],
  },

  // ─── Topic 3: Recursion (Computer Science) ──────────────────────
  {
    topic_id: "recursion",
    display_name: "Recursion",
    subconcepts: [
      {
        id: "recursion_vs_iteration",
        label: "Recursion vs. loops",
        misconceptions: [
          {
            id: "M1",
            statement:
              "Recursion is just a fancy way to write a loop — it's the same thing with different syntax",
            socratic_probe:
              "In a loop, the computer keeps executing one block of code. In recursion, each call has its OWN copy of variables. How are those different when returning values?",
          },
          {
            id: "M2",
            statement:
              "You can always replace recursion with a loop and it'll be equally understandable",
            socratic_probe:
              "Would you rather implement a tree traversal or a Fibonacci calculator with a loop or with recursion? Which one maps more naturally to the problem structure?",
          },
        ],
      },
      {
        id: "base_case_role",
        label: "The role of the base case",
        misconceptions: [
          {
            id: "M3",
            statement:
              "Recursive functions just keep going forever until they crash — the base case isn't that important",
            socratic_probe:
              "If a recursive function has no base case but you know it should eventually stop, how does the computer know when to stop? What actually tells it to return?",
          },
          {
            id: "M4",
            statement:
              "The base case is just an optimization — the function could work without it, just slower",
            socratic_probe:
              "What actually happens to a recursive function without a base case? Does it return an answer eventually, or does something else happen?",
          },
        ],
      },
      {
        id: "call_stack_propagation",
        label: "The call stack and return value propagation",
        misconceptions: [
          {
            id: "M5",
            statement:
              "The return value of a recursive function is determined by the LAST call only — earlier calls don't matter",
            socratic_probe:
              "In factorial(5), the last call returns 1 (factorial(0) = 1). If that were the final answer, factorial would always return 1. How does that 1 become 120?",
          },
          {
            id: "M6",
            statement:
              "Each recursive call returns its answer directly to the original caller, like multiple functions running in parallel",
            socratic_probe:
              "When factorial(3) calls factorial(2), where does factorial(2)'s return value go — back to the original function or back to factorial(3)?",
          },
        ],
      },
    ],
  },

  // ─── Topic 4: Cognitive Biases (Psychology/Humanities) ─────────
  {
    topic_id: "cognitive_biases",
    display_name: "Cognitive Biases",
    subconcepts: [
      {
        id: "confirmation_bias",
        label: "Confirmation bias",
        misconceptions: [
          {
            id: "M1",
            statement:
              "Confirmation bias means people are stubborn and refuse to change their minds",
            socratic_probe:
              "Is stubbornness a conscious choice, or does confirmation bias operate below our awareness? Can you be unaware you're doing it?",
          },
          {
            id: "M2",
            statement:
              "Confirmation bias is rare — most people are pretty objective when evaluating evidence",
            socratic_probe:
              "When you read a news article you agree with, do you tend to accept it immediately? When you disagree, do you look for flaws? How often do you double-check a claim that confirms what you already believe?",
          },
        ],
      },
      {
        id: "dunning_kruger_effect",
        label: "The Dunning-Kruger effect",
        misconceptions: [
          {
            id: "M3",
            statement:
              "The Dunning-Kruger effect means stupid people think they're smart — it's about low intelligence",
            socratic_probe:
              "If a brilliant physicist tries to fix a car engine for the first time, how accurately would they estimate their own skill? Is it about intelligence or about experience in a specific domain?",
          },
          {
            id: "M4",
            statement:
              "The Dunning-Kruger effect means everyone overestimates their abilities all the time",
            socratic_probe:
              "If you're an expert in something, do you tend to think it's 'easy' and underestimate how hard it is for beginners? Is the effect about overestimation or about inaccurate self-assessment in both directions?",
          },
        ],
      },
      {
        id: "availability_heuristic",
        label: "The availability heuristic",
        misconceptions: [
          {
            id: "M5",
            statement:
              "The availability heuristic means we use whatever information is easily accessible — which is usually correct",
            socratic_probe:
              "If vivid plane crash footage is all over the news, and car accidents that kill far more people happen quietly every day, which one feels more dangerous? Does 'feeling more dangerous' mean it actually IS more dangerous?",
          },
          {
            id: "M6",
            statement:
              "The availability heuristic is a flaw or bug in human thinking that smarter people can avoid entirely",
            socratic_probe:
              "Can you consciously choose NOT to be influenced by how easily something comes to mind? Or is it an automatic mental shortcut that affects everyone, including experts?",
          },
        ],
      },
    ],
  },
];
