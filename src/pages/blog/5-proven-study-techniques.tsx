import { ArticleLayout } from "../marketing/ArticleLayout";

export default function StudyTechniques() {
  return (
    <ArticleLayout
      meta={{
        title: "5 study techniques that actually work",
        category: "Study Tips",
        date: "Jan 15, 2025",
        readTime: "5 min read",
        description: "Five evidence-based study methods that help you retain more and perform better in exams, and how to put each one to work with mytuta.",
      }}
    >
      <p className="mk-lead">You can spend hours studying and still forget most of it in the exam. The problem is rarely effort. It is usually method.</p>
      <p>Cognitive science points to a handful of techniques that reliably move what you learn into long-term memory. Here are five, with how to use each one, and where mytuta does the work for you.</p>

      <h2>1. Spaced repetition</h2>
      <p>Review material at widening gaps instead of cramming it once. Each time you return to it just as you are about to forget, the memory holds a little longer.</p>
      <div className="mk-box">
        <h3>A simple schedule</h3>
        <ul><li>Review one day after learning</li><li>Again after three days</li><li>Again after a week</li><li>Again after a month</li></ul>
      </div>
      <p>mytuta tracks what you have learned and brings each concept back at the right moment, so you do not have to manage the schedule yourself.</p>

      <h2>2. Active recall</h2>
      <p>Test yourself without looking at your notes. Pulling an answer from memory strengthens it far more than reading the page again.</p>
      <ul>
        <li>Close the book and write down everything you remember about the topic</li>
        <li>Compare with your notes and mark the gaps</li>
        <li>Go back to what you missed, not what you already knew</li>
      </ul>
      <p>mytuta turns your work into quick checks, so recall becomes part of every session rather than an afterthought.</p>

      <h2>3. Elaborative interrogation</h2>
      <p>Ask <em>why</em> and <em>how</em>, not just <em>what</em>. Explaining the reason behind a fact ties it to things you already understand, and connected knowledge is harder to lose.</p>
      <ul>
        <li>Why does this happen?</li>
        <li>How does it connect to what I already know?</li>
        <li>What would change if one part were different?</li>
      </ul>

      <h2>4. Interleaving</h2>
      <p>Mix topics and problem types in one session instead of drilling one thing for an hour. Switching trains you to spot which method a problem needs, which is exactly what an exam asks.</p>
      <ul>
        <li>Work across a few topics in a sitting</li>
        <li>Mix problem types together</li>
        <li>Move between them every 15 to 30 minutes</li>
      </ul>

      <h2>5. Retrieval practice</h2>
      <p>Regularly test yourself on things you learned earlier. It shows you what has actually stuck and surfaces the gaps while there is still time to close them.</p>
      <ul>
        <li>Take short practice tests often</li>
        <li>Explain a concept out loud, to someone or to yourself</li>
        <li>Build a summary sheet from memory, then check it</li>
      </ul>

      <h2>Putting it together</h2>
      <p>These work best as a set. Start with one or two that fit how you already study, then add the others. They can feel harder than rereading at first, and that difficulty is the point, it is the sign that the learning is sticking. mytuta builds all five into your path, so you get the method without having to engineer it yourself.</p>
    </ArticleLayout>
  );
}
