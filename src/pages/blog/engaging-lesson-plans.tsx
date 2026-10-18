import { ArticleLayout } from "../marketing/ArticleLayout";

export default function EngagingLessonPlans() {
  return (
    <ArticleLayout
      meta={{
        title: "Build an engaging lesson plan in minutes",
        category: "For Teachers",
        date: "Jan 12, 2025",
        readTime: "4 min read",
        description: "A fast, practical process for planning lessons that meet the curriculum and hold a class, built for teachers carrying a full load.",
      }}
    >
      <p className="mk-lead">You know the squeeze: lessons that meet the syllabus and actually hold the class, planned on top of marking, admin and a full teaching week.</p>
      <p>Traditional planning eats hours an evening. It does not have to. Here is a process that turns a topic into a ready lesson, with mytuta carrying the heavy part so you keep the judgement.</p>

      <h2>Where the hours go</h2>
      <p>A single plan usually means researching content, building activities and assessment, adapting for different levels, lining it up with the curriculum, and preparing handouts. Done by hand, every lesson starts from zero.</p>

      <h2>A faster process</h2>
      <div className="mk-grid">
        <div className="mk-box green"><h3>1. Name the topic</h3><p>Give the subject, the exact topic, the class level and how long the lesson runs.</p></div>
        <div className="mk-box green"><h3>2. Let mytuta draft it</h3><p>It returns learning objectives, activities and an assessment approach tied to the level.</p></div>
        <div className="mk-box green"><h3>3. Make it yours</h3><p>Adjust activities for your class, swap in local examples, cut what does not fit.</p></div>
        <div className="mk-box green"><h3>4. Pull the materials</h3><p>Generate the worksheets, quiz questions and board notes from the plan.</p></div>
      </div>

      <h2>What a draft looks like</h2>
      <p>For a 45-minute JHS 1 lesson on <strong>fractions</strong>, mytuta might hand you:</p>
      <div className="mk-grid">
        <div className="mk-box">
          <h3>Objectives</h3>
          <ul><li>Define a fraction and name its parts</li><li>Compare fractions with the same denominator</li><li>Add and subtract simple fractions</li><li>Use fractions in everyday situations</li></ul>
        </div>
        <div className="mk-box">
          <h3>Activities</h3>
          <ul><li>Share a ball of kenkey or an orange into equal parts</li><li>A quick fraction matching game</li><li>Small-group problem solving</li><li>Market-stall word problems in cedis</li></ul>
        </div>
      </div>
      <div className="mk-box">
        <h3>Checking understanding</h3>
        <p>An exit task: three fraction problems, with each student writing one line on how they worked it out. You read the thinking, not just the answer.</p>
      </div>

      <h2>Why it works</h2>
      <ul>
        <li><strong>It gives time back.</strong> The draft lands in minutes, so your evening goes to refining, not starting.</li>
        <li><strong>It fits the curriculum.</strong> Plans are built to the level and the syllabus you teach.</li>
        <li><strong>It reaches every level.</strong> Ask for a simpler and a harder version of the same activity in one go.</li>
        <li><strong>It is editable.</strong> Everything is a starting point you shape, never a script you are stuck with.</li>
      </ul>

      <h2>Getting the most from it</h2>
      <ul>
        <li><strong>Be specific.</strong> "Fractions for JHS 1" beats "Maths." The sharper the input, the better the draft.</li>
        <li><strong>Always adapt.</strong> Match it to your class, your resources and your style before you teach it.</li>
        <li><strong>Add local colour.</strong> Ghanaian examples and references make a lesson land.</li>
        <li><strong>Save what works.</strong> Keep your best plans and reuse them for the next topic.</li>
      </ul>

      <h2>Start with one lesson</h2>
      <p>Pick one subject and one topic for tomorrow. Let mytuta draft it, shape it in a few minutes, and teach it. One lesson is usually enough to see how much time this gives back.</p>
    </ArticleLayout>
  );
}
