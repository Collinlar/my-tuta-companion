import { ArticleLayout } from "../marketing/ArticleLayout";

export default function MasteringFlashcards() {
  return (
    <ArticleLayout
      meta={{
        title: "Mastering flashcards",
        category: "Study Tips",
        date: "Jan 5, 2025",
        readTime: "5 min read",
        description: "Why flashcards work, how to write ones worth reviewing, and the review systems that move what you learn into long-term memory.",
      }}
    >
      <p className="mk-lead">Flashcards are one of the oldest study tools there is, and one of the most misused. Used well, they are hard to beat for remembering things under exam pressure.</p>
      <p>The difference is in how you write them and how you review them. Here is what makes flashcards work, and how to build ones worth returning to.</p>

      <h2>Why they work</h2>
      <p>Flashcards lean on two ideas that memory research keeps confirming.</p>
      <div className="mk-grid">
        <div className="mk-box"><h3>Active recall</h3><p>Trying to remember the answer before you flip the card forces retrieval. That effort is what strengthens the memory, far more than rereading the note.</p></div>
        <div className="mk-box"><h3>Spaced repetition</h3><p>Reviewing at widening gaps works against the forgetting curve, moving a fact from something you just saw to something you know.</p></div>
      </div>

      <h2>Writing a good card</h2>
      <ul>
        <li><strong>One idea per card.</strong> A single fact or concept, not a whole topic.</li>
        <li><strong>A clear question.</strong> Specific enough that there is one honest answer.</li>
        <li><strong>A complete answer.</strong> Everything you need, nothing you do not.</li>
        <li><strong>A visual where it helps.</strong> A quick diagram can carry more than a paragraph.</li>
      </ul>
      <div className="mk-grid">
        <div className="mk-box green">
          <h3>Works</h3>
          <p><strong>Front:</strong> What is photosynthesis?<br /><strong>Back:</strong> The process by which plants use sunlight to make food from water and carbon dioxide.</p>
        </div>
        <div className="mk-box">
          <h3>Does not</h3>
          <p><strong>Front:</strong> Everything about plants<br /><strong>Back:</strong> Too broad to ever recall or mark as known.</p>
        </div>
      </div>

      <h2>How to review</h2>
      <div className="mk-grid">
        <div className="mk-box">
          <h3>The Leitner boxes</h3>
          <p>Sort cards into boxes by how well you know them, and move a card up when you get it right, back to the start when you do not.</p>
          <ul><li>Box 1: review daily</li><li>Box 2: every three days</li><li>Box 3: weekly</li></ul>
        </div>
        <div className="mk-box">
          <h3>A spacing schedule</h3>
          <p>If you prefer a fixed rhythm, review each new card on day 1, then day 3, day 7 and day 14.</p>
        </div>
      </div>

      <h2>Paper or screen</h2>
      <p>Paper cards need nothing but a pen, feel good in the hand, and never run out of battery, but you manage the spacing yourself and they are slow to make. Digital cards schedule the spacing for you, track your progress, carry images and go wherever your phone does. For most students the automatic scheduling tips it towards digital, especially when the tool builds the cards from your own material and handles the review. mytuta does both: it turns your notes into cards and brings them back at the right time.</p>

      <h2>Mistakes to avoid</h2>
      <ul>
        <li><strong>Overloading a card.</strong> Keep it to one idea.</li>
        <li><strong>Making cards and never reviewing.</strong> The review is the whole point; set a daily slot.</li>
        <li><strong>Memorising without meaning.</strong> Add the why, so you can use the fact, not just repeat it.</li>
        <li><strong>Reading instead of recalling.</strong> Always try to answer before you flip.</li>
        <li><strong>Giving up early.</strong> The payoff is in the weeks, not the first session.</li>
      </ul>

      <h2>Start small</h2>
      <p>Make a handful of cards for one topic today, review them properly, and grow the set as each concept sticks. Consistency and real recall beat a huge deck you never open.</p>
    </ArticleLayout>
  );
}
