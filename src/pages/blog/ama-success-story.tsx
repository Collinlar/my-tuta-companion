import { ArticleLayout } from "../marketing/ArticleLayout";

export default function AmaSuccessStory() {
  return (
    <ArticleLayout
      meta={{
        title: "What a turnaround looks like",
        category: "Student Stories",
        date: "Jan 10, 2025",
        readTime: "6 min read",
        description: "A portrait of the kind of student mytuta is built for, and the shift in method that turns struggling into mastery.",
      }}
    >
      <p className="mk-lead">Meet Ama, a composite of the JHS students we built mytuta for. She is not one real person, she is the pattern we see again and again: a capable learner convinced she is not clever enough, when the real problem is how she is studying.</p>
      <p>Her story is worth telling because the shift that changes things is almost never about working harder. It is about working differently.</p>

      <h2>Where she starts</h2>
      <p>Ama is in JHS 2 in Accra. She studies, but only the night before a test. She reads her notes over and over, understands them in the moment, and forgets most of it by morning. Maths feels like a wall. When friends seem to grasp things quickly, she reads it as proof she is not built for school.</p>
      <div className="mk-box">
        <h3>In her own words</h3>
        <blockquote style={{ margin: 0, border: "none", padding: 0 }}>I tried hard and still did badly, so I decided I just was not a maths person.</blockquote>
      </div>
      <p>That belief, not the maths, is the thing holding her back.</p>

      <h2>What changes</h2>
      <p>The turning point is not a new timetable or more hours. It is a different kind of session. Instead of rereading, Ama starts working with a concept until she can explain it, and the work meets her where she actually is rather than where the syllabus assumes she is.</p>
      <div className="mk-grid">
        <div className="mk-box green"><h3>Understanding first</h3><p>She stops collecting answers and starts following the reasoning, so a concept makes sense before she practises it.</p></div>
        <div className="mk-box green"><h3>Recall, not rereading</h3><p>She tests herself instead of staring at notes, which shows her what has actually stuck.</p></div>
        <div className="mk-box green"><h3>Spaced review</h3><p>Topics come back just as she is about to forget them, so they hold instead of fading.</p></div>
        <div className="mk-box green"><h3>Small, daily sessions</h3><p>Twenty focused minutes a day beats a frantic night before, and it is sustainable.</p></div>
      </div>

      <h2>What shifts first</h2>
      <p>The grades move, but they are not the first thing to change. Confidence is. Once Ama sees herself get a hard problem right, she studies because it is working, not because an exam is looming. She starts explaining topics to the friend next to her, which is its own kind of proof that she now understands them. The version of Ama who decided she was not a maths person has quietly disappeared.</p>

      <h2>Why this pattern repeats</h2>
      <p>Most students who struggle are not short on ability. They are stuck with a method, rereading and cramming, that memory science says does not work, and they blame themselves for the result. Change the method and the ceiling moves. That is the whole idea behind mytuta: build understanding, make recall and spacing automatic, and let the confidence follow.</p>

      <h2>The point of the story</h2>
      <p>If any of Ama sounds familiar, the lesson is not try harder. It is study differently, and give it a few honest weeks. The students who turn things around are rarely the ones who suddenly got clever. They are the ones who changed how they learn.</p>
    </ArticleLayout>
  );
}
