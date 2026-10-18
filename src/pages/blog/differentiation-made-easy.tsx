import { ArticleLayout } from "../marketing/ArticleLayout";

export default function DifferentiationMadeEasy() {
  return (
    <ArticleLayout
      meta={{
        title: "Differentiation made easy with AI",
        category: "For Teachers",
        date: "Jan 3, 2025",
        readTime: "4 min read",
        description: "How to adapt your lessons for every learning level with mytuta, so struggling students get support and advanced students stay challenged, without hours of extra planning.",
      }}
    >
      <p className="mk-lead">Your class is full of students at different levels. Some grasp a concept in minutes; others need more time and more support. One-size-fits-all teaching leaves some behind and lets others coast.</p>
      <p>Differentiated instruction fixes that, but doing it by hand is slow. Preparing a separate version of every lesson, for every level, every day, is not realistic on top of everything else you carry. This is where mytuta helps: it builds the different versions for you, so reaching every student stops being a planning problem.</p>

      <h2>The real challenge</h2>
      <div className="mk-grid">
        <div className="mk-box">
          <h3>Time</h3>
          <ul>
            <li>Writing several versions of one lesson</li>
            <li>Preparing different materials per level</li>
            <li>Assessing students who are all at different points</li>
            <li>Running several groups at once</li>
          </ul>
        </div>
        <div className="mk-box">
          <h3>Resources</h3>
          <ul>
            <li>Limited access to varied materials</li>
            <li>Patchy technology in the room</li>
            <li>Little training on differentiation</li>
            <li>No simple way to track each child</li>
          </ul>
        </div>
      </div>
      <blockquote>
        I have 45 students in my JHS 2 class, all at different levels. Some are still on the basics while others are ready for harder work. Making different materials for each one would take hours a day, but I know I need to reach every child.
        <cite>Ms. Adjei, Mathematics teacher, Accra</cite>
      </blockquote>

      <h2>How mytuta makes it easy</h2>
      <div className="mk-grid">
        <div className="mk-box green"><h3>Finds the level</h3><p>It reads each student's answers and works out where they are, what they are strong at, and what needs work.</p></div>
        <div className="mk-box green"><h3>Builds the material</h3><p>It creates explanations, practice and checks tuned to each student's level and the way they learn.</p></div>
        <div className="mk-box green"><h3>Adapts as they go</h3><p>The path adjusts in real time as a student's understanding changes, so the work stays at the right stretch.</p></div>
        <div className="mk-box green"><h3>Handles the groups</h3><p>It groups students with similar needs and suggests collaborative tasks so they support each other.</p></div>
      </div>

      <h2>Putting it to work</h2>
      <h3>1. Set up your class</h3>
      <p>Create your groups by level or learning style, set clear goals for each, and point mytuta at your curriculum and existing materials.</p>
      <h3>2. Generate the differentiated work</h3>
      <div className="mk-grid">
        <div className="mk-box">
          <h3>For students who are struggling</h3>
          <ul><li>Simpler explanations with more examples</li><li>Step-by-step guided practice</li><li>Visuals and diagrams</li><li>Frequent check-ins and feedback</li></ul>
        </div>
        <div className="mk-box">
          <h3>For students who are ahead</h3>
          <ul><li>Harder, richer problems</li><li>Extension tasks and projects</li><li>Independent investigation</li><li>Chances to teach their peers</li></ul>
        </div>
      </div>
      <h3>3. Monitor and adjust</h3>
      <p>Track progress, let the difficulty move with each student's performance, and send targeted support to anyone who needs it.</p>

      <h2>What it looks like in a lesson</h2>
      <p>Take <strong>fractions</strong> in Maths. Students still finding their feet work with fraction strips and pie charts and add fractions with the same denominator, hands-on, with a classmate alongside them. Students in the middle move to mixed numbers and word problems set in real situations. Students who are ahead take on fraction equations, convert to decimals, and teach the idea to a younger class.</p>
      <p>The same shape works in <strong>English reading</strong>: simplified texts with audio support and picture questions for some, grade-level texts with guided questions for others, and complex passages with inference and analysis for those ready to stretch.</p>

      <h2>Why it is worth it</h2>
      <ul>
        <li><strong>Hours become minutes.</strong> Planning that used to eat an evening takes a fraction of the time.</li>
        <li><strong>Every student is reached.</strong> Support for those behind, challenge for those ahead, nobody stuck in the middle.</li>
        <li><strong>You see what is happening.</strong> Clear signals on who is moving and who needs you next.</li>
        <li><strong>You teach.</strong> mytuta does the content lifting so you spend your energy on the students.</li>
      </ul>

      <h2>Start small</h2>
      <p>You do not have to redesign everything at once. Pick one subject and one class, let mytuta build the levels for the next topic, and see how it goes. That first lesson is usually enough to show you how much time this gives back and how many more students it reaches.</p>
    </ArticleLayout>
  );
}
