import { ArticleLayout } from "../marketing/ArticleLayout";

export default function AIEducationGhana() {
  return (
    <ArticleLayout
      meta={{
        title: "AI in the Ghanaian classroom",
        category: "AI & Education",
        date: "Jan 8, 2025",
        readTime: "6 min read",
        description: "What AI can realistically change for teaching and learning in Ghana, the constraints that are real, and how to adopt it without losing the teacher.",
      }}
    >
      <p className="mk-lead">A teacher with forty-five students cannot sit with each one. That single fact is why personalised learning has always been more aspiration than practice. AI is the first tool that changes the maths.</p>
      <p>There is a lot of noise about AI in education. Here is the grounded version: what it can actually do in a Ghanaian classroom, what stands in the way, and how to adopt it so it helps the teacher instead of replacing the thinking.</p>

      <h2>What AI can actually do</h2>
      <p>Strip away the hype and the useful part is narrow and real: AI can give each student a version of the lesson pitched at their level, and give the teacher a clearer view of who is where.</p>
      <div className="mk-grid">
        <div className="mk-box"><h3>Meet the student where they are</h3><p>Adjust the explanation, pace and practice to one learner, so the student who is behind gets support and the one who is ahead stays stretched.</p></div>
        <div className="mk-box"><h3>Give fast, specific feedback</h3><p>Show a student where their reasoning broke, in the moment, instead of a week later on a marked script.</p></div>
        <div className="mk-box"><h3>Lighten the load</h3><p>Draft lesson plans, build practice sets and surface who needs help, so the teacher spends energy on teaching.</p></div>
        <div className="mk-box"><h3>Reach beyond the classroom</h3><p>Let a student keep learning at home on a phone, which is where most of Ghana's internet already lives.</p></div>
      </div>

      <h2>The constraints are real</h2>
      <p>Any honest case for AI in Ghanaian education has to sit next to the conditions on the ground.</p>
      <ul>
        <li><strong>Connectivity and power.</strong> Data is costly and supply is not always steady, so anything built for here has to be light and forgiving of a dropped connection.</li>
        <li><strong>Devices.</strong> The phone, not the laptop, is the classroom computer. Mobile-first is not a nice-to-have.</li>
        <li><strong>Training and trust.</strong> A tool only helps if teachers are shown how to use it and have a reason to trust it. That takes support, not a one-off rollout.</li>
        <li><strong>Privacy.</strong> Student data deserves care and protection under the Ghana Data Protection Act. How a tool stores and uses that data is a first-order question, not fine print.</li>
      </ul>
      <p>A tool that ignores any of these does not survive contact with a real school.</p>

      <h2>Keep the teacher at the centre</h2>
      <p>The failure mode to avoid is treating AI as a replacement for the teacher. It is not. It is good at the repetitive, individual work that does not scale by hand: drafting, practice, tracking, tireless explanation. It is poor at the things that matter most in a classroom, the relationship, the encouragement, the read of a room. Used well, AI does the first so the teacher has more room for the second.</p>

      <h2>How mytuta approaches it</h2>
      <p>mytuta is built for this context, not adapted to it. It runs on a phone, it adapts each concept to the learner instead of handing over answers, and it gives teachers a plain view of how a class is moving. The aim is not to automate the classroom. It is to give every learner the patient, personal attention a single teacher cannot stretch to forty-five ways, and to give the teacher back the time to do what only they can.</p>

      <h2>Where this goes</h2>
      <p>The near-term shift is unglamorous and real: more students getting help pitched to their level, more teachers saving hours on preparation, more learning continuing after the bell. That is worth more than any grand promise. The schools that get there first will be the ones that pick tools built for their conditions and keep the teacher firmly in charge.</p>
    </ArticleLayout>
  );
}
