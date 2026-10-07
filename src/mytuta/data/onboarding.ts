/**
 * Onboarding steps — student (6) and teacher (4) — from PRD sections 12 and 22
 * and the design import.
 */

export interface OnbStep {
  kicker: string;
  title: string;
  sub: string;
  options: string[];
  /** indices flagged "Soon" (deferred subjects). */
  soon?: number[];
}

export const studentSteps: OnbStep[] = [
  { kicker: "About you", title: "What is your learning stage?", sub: "This shapes the level of every explanation.", options: ["Lower secondary", "Upper secondary", "Early tertiary", "Other"] },
  { kicker: "Your subjects", title: "Which STEM areas interest you?", sub: "Pick what you study. Computing and Engineering are coming soon.", options: ["Mathematics", "General Science", "Biology", "Chemistry", "Physics", "Computing", "Engineering"], soon: [5, 6] },
  { kicker: "Your goals", title: "What do you want from mytuta?", sub: "Pick as many as you like.", options: ["Understand difficult topics", "Improve in school", "Prepare for a test", "Solve questions better", "Build practical skills", "Join challenges", "Explore STEM"] },
  { kicker: "Where you struggle", title: "What makes STEM hard for you?", sub: "We will meet you there first.", options: ["Some explanations are unclear", "I forget what I study", "I struggle to start questions", "I make calculation mistakes", "I struggle to apply concepts", "I need more practice"] },
  { kicker: "How you learn", title: "How do you like to learn?", sub: "This only shapes your first experience.", options: ["Simple explanations", "Visual explanations", "Worked examples", "Step-by-step guidance", "Practice questions", "Practical activities"] },
  { kicker: "First step", title: "Where would you like to start?", sub: "You can change this any time.", options: ["Learn a concept", "Solve a problem", "Take a diagnostic", "Join a teacher class", "Explore a challenge"] },
];

export const teacherSteps: OnbStep[] = [
  { kicker: "Your context", title: "What do you teach?", sub: "Select your subjects and stage.", options: ["Mathematics", "General Science", "Biology", "Chemistry", "Physics", "Lower secondary", "Upper secondary"] },
  { kicker: "Your challenges", title: "What is hardest in your classroom?", sub: "mytuta focuses here first.", options: ["Students do not understand concepts", "They memorise without applying", "Preparation takes too long", "I need better practice activities", "I cannot see where they struggle", "Practical resources are limited"] },
  { kicker: "Your resources", title: "What can your classroom use?", sub: "Activities will match what you have.", options: ["Laboratory", "Classroom materials", "Projector", "Student devices", "Teacher device only", "Limited internet", "No specialised equipment"] },
  { kicker: "First step", title: "How would you like to begin?", sub: "You can explore the rest later.", options: ["Create a learning experience", "Create a class", "Upload teaching material", "Diagnose a topic", "Explore a sample"] },
];
