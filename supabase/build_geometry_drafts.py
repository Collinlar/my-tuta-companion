"""Deterministic, unpublished geometry authoring packs. Academic review required."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent

FOUNDATION = {
"perimeter-area": [
 ("definition", "Boundary and coverage", "Perimeter measures the total distance around a two-dimensional shape. Area measures the region it covers. A garden fence follows a boundary; paving covers a region.", "Which quantity measures how much ground a rectangular garden covers?", "Area", "Perimeter"),
 ("components", "Rectangle dimensions", "A rectangle has two pairs of equal opposite sides. Name its length and width, and measure both in the same unit before calculating. Both dimensions are perpendicular to one another.", "A rectangle has length 6 metres and width 4 metres. What is the length of the opposite side to the 6-metre side?", "6 metres", "4 metres"),
 ("vocabulary", "Linear and square units", "Perimeter uses length units such as centimetres or metres. Area uses square units: one square centimetre is a square with sides one centimetre long. Convert all lengths to a common unit before using a formula.", "Which is an appropriate unit for the area of a tabletop?", "Square centimetres", "Centimetres"),
 ("relationships", "Rectangle formulas", "A rectangle of length l and width w has perimeter 2 times the sum of l and w. Its area is l times w. The first calculation adds boundary lengths; the second counts unit squares in rows and columns.", "Which expression gives a rectangle's perimeter?", "2 times (length plus width)", "Length times width"),
 ("relationships", "Changing one dimension", "For a rectangle with fixed width, increasing length increases both area and perimeter. Doubling only the length doubles the area, but does not generally double the perimeter because the width is unchanged.", "A rectangle changes from 3 by 2 metres to 6 by 2 metres. How does its area change?", "It doubles from 6 to 12 square metres", "It stays at 6 square metres"),
 ("big_picture", "Choose the quantity", "Before calculating, decide what the job needs. Edging a school garden calls for perimeter; buying turf calls for area. A numerical answer is useful only when its meaning and units fit the decision.", "A gardener buys edging for every side of a rectangular bed. Which quantity is needed?", "Perimeter", "Area"),
 ("visual_model", "Inside squares and boundary", "Use the rectangle model to count equal unit squares inside and trace the outside edge. Changing its dimensions changes the two measurements differently. The default model is 6 units by 4 units.", "For a 6-by-4 rectangle, what is the area?", "24 square units", "20 square units"),
 ("worked_example", "A rectangular school garden", "A school garden is 8 metres long and 3 metres wide. Its area is 8 times 3, or 24 square metres. Its perimeter is 2 times (8 plus 3), or 22 metres. Each answer measures a different feature.", "How much edging covers all four sides of an 8-by-3-metre garden?", "22 metres", "24 metres"),
 ("misconception", "Equal perimeter is not equal area", "A 1-by-5 rectangle and a 2-by-4 rectangle both have perimeter 12 units. Their areas are 5 and 8 square units. Equal perimeter does not guarantee equal area, and area cannot be compared by boundary length alone.", "Must two rectangles with equal perimeter have equal area?", "No; their side lengths can give different areas", "Yes; the boundary fixes the area"),
 ("application", "Budget for paving", "A rectangular courtyard is 5 metres by 4 metres. Paving covers 20 square metres. At 30 Ghana cedis per square metre, material costs 600 Ghana cedis before any allowance for cutting, labour or wastage.", "At 30 Ghana cedis per square metre, what is the material cost for a 5-by-4-metre courtyard?", "600 Ghana cedis", "540 Ghana cedis"),
 ("worked_example", "Triangle area and height", "A triangle's area is half its base times the perpendicular height. A triangle with base 8 centimetres and perpendicular height 3 centimetres has area 12 square centimetres. A sloping side is not automatically the perpendicular height. This gives one building block for calculating composite regions later.", "A triangle has base 8 centimetres and perpendicular height 3 centimetres. What is its area?", "12 square centimetres", "24 square centimetres"),
],
"angles": [
 ("definition", "An angle is a turn", "An angle describes a turn between two rays meeting at a point. Specify which turn is intended when the same rays bound a smaller angle and a reflex angle. The vertex is the common endpoint.", "What does an angle measure?", "The amount of turn between rays", "The length of a ray"),
 ("components", "Vertex and rays", "Two rays start at a shared vertex and form an angle. In angle ABC, B names the vertex. Extending either ray changes its drawn length but not the turn between the directions.", "In angle ABC, which letter identifies the vertex?", "B", "A"),
 ("vocabulary", "Degrees and a full turn", "A degree is one three-hundred-and-sixtieth of a full turn. A right angle is 90 degrees, a straight angle is 180 degrees and a full turn is 360 degrees. Degrees measure turn, not distance.", "How many degrees are in a full turn?", "360", "180"),
 ("categories", "Classify the marked angle", "An acute angle is greater than zero and less than 90 degrees. A right angle is 90 degrees; an obtuse angle is greater than 90 and less than 180 degrees. A straight angle is 180 degrees; a reflex angle is greater than 180 and less than 360 degrees.", "How is a marked angle of 120 degrees classified?", "Obtuse", "Reflex"),
 ("relationships", "Angles on a straight line", "Adjacent angles that together form a straight angle sum to 180 degrees. Angles around a point that make one complete turn sum to 360 degrees. Apply these totals only to the indicated complete straight angle or turn.", "Adjacent angles make a straight angle. One is 65 degrees. What is the other?", "115 degrees", "295 degrees"),
 ("relationships", "Triangle angle total", "The three interior angles of a triangle on a flat plane sum to 180 degrees. If two interior angles are 50 and 60 degrees, the third is 70 degrees. Identify the interior angles rather than substituting a marked exterior angle.", "A plane triangle has interior angles 50 and 60 degrees. What is the third?", "70 degrees", "110 degrees"),
 ("big_picture", "Direction, not arm length", "Angles compare directions. Two drawings can show the same angle with different ray lengths or different orientations on the page. A right angle remains 90 degrees when its whole drawing is rotated.", "Does rotating an entire right-angle drawing change its angle size?", "No; it remains 90 degrees", "Yes; any rotation changes its size"),
 ("visual_model", "Explore a marked turn", "The model measures an anticlockwise turn from a fixed horizontal ray. Move the control through 90, 180 and 360 degrees and notice the marked turn. The same final ray direction can represent zero or a full turn, so the marked turn matters.", "The control shows a marked turn of 270 degrees. What type is it?", "Reflex", "Acute"),
 ("worked_example", "Missing angle at a point", "Three adjacent angles fill one complete turn at a point. If two are 120 degrees and 95 degrees, the remaining angle is 360 minus 120 minus 95, or 145 degrees. Check that all three add to 360 degrees.", "Three angles fill a complete turn. Two are 120 and 95 degrees. What is the third?", "145 degrees", "35 degrees"),
 ("misconception", "Do not measure by appearance", "A sketch may not be drawn to scale. Use stated measurements and justified angle relationships rather than judging by eye. Longer rays do not make a larger angle, and a tilted square corner is still a right angle.", "A diagram is explicitly not to scale. Which is the sound method?", "Use given measurements and angle relationships", "Trust how wide the angle looks"),
 ("application", "A triangular roof frame", "A plane triangular roof-frame drawing has two interior angles of 45 degrees and 65 degrees. The third is 70 degrees because the three interior angles total 180 degrees. A drawing alone does not certify a real structure's safety.", "In a plane triangle, two interior angles are 45 and 65 degrees. What is the third?", "70 degrees", "110 degrees"),
],
}

CASES = {
"perimeter-area": {
 "applied": {
  "scenario": "A rectangular school garden is 12 metres by 8 metres. An attached 4-by-3-metre rectangle shares its complete 3-metre side with part of the garden's 8-metre side, without overlap. Fence only the outside boundary; pave both regions.",
  "method": "Add the two rectangle areas for paving. Add their perimeters and subtract the shared edge twice for the outside fence: the shared edge is internal to the combined region.",
  "worked": "The areas are 96 and 12 square metres, giving 108 square metres. The separate perimeters are 40 and 14 metres. Subtract twice the 3-metre shared edge: the outside boundary is 48 metres.",
  "checks": [("A rectangle is 12 by 8 metres. What is its area?", "96 square metres", "40 square metres"), ("Why subtract a shared internal edge twice when adding the two perimeters?", "It was counted once in each shape and is not on the outside boundary", "Every composite shape has half the perimeter"), ("What is the combined paved area in the stated scenario?", "108 square metres", "48 square metres"), ("At 20 Ghana cedis per square metre, what is the material-only cost to pave 108 square metres?", "2160 Ghana cedis", "960 Ghana cedis")],
  "independent": "Calculate the paved area and outside fence length for the stated garden. Explain the shared-edge correction and units. If fencing costs 15 Ghana cedis per metre, give the fence material cost, excluding gates and wastage.",
  "lab": "Draw a scaled plan of the stated garden or model it with squared paper. Trace every external segment, measure or count lengths, and independently verify the 48-metre outside boundary. Distinguish model units from actual metres.",
  "rubric": ["Choose area or perimeter to match each resource", "Obtain 108 square metres and 48 metres, with a justified shared edge", "Use correct units and state measurement or cost assumptions"],
 },
 "advanced": {
  "scenario": "A school has 24 metres of fencing for a rectangular garden, with no gate. Compare side lengths 1 and 11, 2 and 10, 3 and 9, 4 and 8, 5 and 7, and 6 and 6 metres. Then consider all positive real side lengths with the same perimeter.",
  "method": "Each candidate has length plus width equal to 12. Area is length times (12 minus length). A table supports a conjecture; the identity area = 36 minus (length minus 6) squared proves the maximum for all positive real lengths.",
  "worked": "The candidate areas are 11, 20, 27, 32, 35 and 36 square metres. The 6-by-6 square is best among them. Since the square of a real number is nonnegative, 36 minus (length minus 6) squared cannot exceed 36.",
  "checks": [("A rectangle has perimeter 24 metres and width 5 metres. What is its length?", "7 metres", "19 metres"), ("If every length of a shape doubles, what happens to its area?", "It becomes four times as large", "It doubles"), ("Which gives the greatest area among 4-by-8 and 6-by-6 rectangles?", "6 by 6, with 36 square metres", "4 by 8, with 32 square metres"), ("What is the greatest rectangular area enclosed by 24 metres of fencing, with no gate?", "36 square metres", "48 square metres")],
  "independent": "Use the stated constraint to compare the candidate rectangles. Then justify the maximum over all positive real lengths using the supplied squared expression or another valid proof. Separate evidence from a finite table from a general argument.",
  "lab": "Investigate a different fixed perimeter, such as 20 metres. Predict and test the maximum-area rectangle, and give a general argument for the maximum over all rectangles with that perimeter. Explain how scaling a square changes length, perimeter and area. State whether the same reasoning establishes a result for non-rectangular shapes.",
  "rubric": ["Model the fixed-perimeter constraint consistently", "Justify the square's maximum using an argument beyond a finite table", "State the domain of the claim and distinguish examples from proof"],
 },
},
"angles": {
 "applied": {
  "scenario": "Two parallel horizontal lines are crossed by one transversal. The upper-right angle at the top intersection is 65 degrees. At the bottom intersection, identify the upper-right corresponding angle and the upper-left adjacent angle.",
  "method": "Corresponding angles are equal when the lines are parallel. Adjacent angles forming a straight angle total 180 degrees. At one intersection, vertically opposite angles are equal: they face one another and do not share a side. Name the angle positions and relationship before calculating.",
  "worked": "The bottom upper-right angle is 65 degrees by corresponding angles. The bottom upper-left angle is 115 degrees because it forms a straight angle with 65 degrees. The parallel-line condition is essential for the corresponding-angle step.",
  "checks": [("A straight angle is split into 65 degrees and x. Find x.", "115 degrees", "65 degrees"), ("When may corresponding angles at distinct intersections be assumed equal here?", "When the two lines are parallel", "Whenever two lines look nearly parallel"), ("In the scenario, what is the bottom upper-right angle?", "65 degrees", "115 degrees"), ("In the scenario, what is the bottom upper-left angle?", "115 degrees", "245 degrees")],
  "independent": "Draw and label the stated configuration. Find the two requested bottom angles, and explain each step with its condition. Explain which inference is no longer guaranteed if the two horizontal lines are not parallel.",
  "lab": "Draw the stated two parallel lines and the transversal with the given 65-degree angle. Label corresponding, adjacent and vertically opposite angles. Measure to check the predictions and record one source of protractor error. Explain why measurement supports rather than proves the exact relationships.",
  "rubric": ["Identify angle positions unambiguously", "Use corresponding and straight-angle relationships to obtain 65 and 115 degrees", "State the conditions and limits of the reasoning"],
 },
 "advanced": {
  "scenario": "A convex polygon has n sides. Diagonals from one vertex partition its interior into n minus 2 triangles without overlap. A pupil claims that every polygon has interior-angle sum 360 degrees because a full turn is 360 degrees.",
  "method": "For a convex n-sided polygon, the triangle partition gives interior-angle sum (n minus 2) times 180 degrees. A full exterior turn is a different quantity. For a regular polygon all interior angles are equal; equal side lengths alone do not justify equal angles in a general polygon.",
  "worked": "A convex pentagon partitions into three triangles, so its interior-angle sum is 540 degrees. A regular pentagon has interior angles 108 degrees. Its exterior turning angles are 72 degrees each and total 360 degrees.",
  "checks": [("What is the interior-angle sum of a plane triangle?", "180 degrees", "360 degrees"), ("How many triangles are formed by drawing all diagonals from one vertex of a convex hexagon?", "4", "6"), ("What is one interior angle of a regular pentagon?", "108 degrees", "72 degrees"), ("What is the interior-angle sum of a convex hexagon?", "720 degrees", "360 degrees")],
  "independent": "Evaluate the pupil's claim using a convex pentagon as a counterexample. Derive the interior-angle sum formula from the stated triangle partition. Explain why a 360-degree exterior turn does not establish that interior sum.",
  "lab": "Investigate whether a regular polygon can have each exterior turning angle equal to 40 degrees. Determine the number of sides and each interior angle, justify the result, and explain why a non-integer side count would reject a proposed regular polygon. Connect the result to the interior-angle sum obtained from a triangle partition, and contrast interior and exterior totals.",
  "rubric": ["Derive the convex-polygon interior-angle sum from a triangle partition", "Distinguish interior sums from exterior turns with a valid counterexample", "Distinguish regularity assumptions and justify an angle calculation"],
 },
}}

def check(item, position):
    question, correct, wrong = item
    options = [correct, wrong] if position % 2 == 0 else [wrong, correct]
    return dict(prompt=question, options=options, correctIndex=options.index(correct), explanation=correct + ". Use the relationship and conditions explained in this block.")

pack = []
for slug, rows in FOUNDATION.items():
    competencies, blocks = [], []
    for i, (kind, title, body, question, correct, wrong) in enumerate(rows):
        key = f"geometry-foundation-{i+1}"
        evidence = kind if kind in ("application", "worked_example", "misconception") else "quick_check"
        competencies.append(dict(depth="foundation", key=key, description=title + ": explain and apply the stated relationship", sequence=i, evidence_type=evidence))
        content = dict(body=body, competencyKeys=[key], quickCheck=check((question, correct, wrong), i), narration=body)
        if kind == "visual_model":
            content["visual"] = "area_perimeter" if slug == "perimeter-area" else "angle_turn"
        blocks.append(dict(depth="foundation", block_type=kind, title=title, objective="Demonstrate " + title.lower(), sequence=i, required=True, content=content))
    # An assessed refresher and an easier, prerequisite-free alternative travel
    # with the worked example and their own checks.
    worked = next(b for b in blocks if b["block_type"] == "worked_example")
    repair = dict(kind="skill", key="geometry-multiply" if slug == "perimeter-area" else "geometry-subtract", label="Multiply whole numbers" if slug == "perimeter-area" else "Subtract whole numbers", refresher="Use repeated equal groups for multiplication." if slug == "perimeter-area" else "Subtract the known part from the stated total.", check=check(("What is 6 times 4?", "24", "10") if slug == "perimeter-area" else ("What is 180 minus 65?", "115", "245"), 0))
    worked["content"]["prerequisites"] = [repair]
    simple_body = "A rectangle has two sides of 4 metres and two of 1 metre. Add all four boundary lengths: 4 plus 1 plus 4 plus 1 is 10 metres." if slug == "perimeter-area" else "Two angles fill a complete 360-degree turn. One is 270 degrees. The remaining angle is 90 degrees because 270 plus 90 equals 360."
    simple_check = ("A rectangle is 4 metres by 1 metre. What is its perimeter?", "10 metres", "4 metres") if slug == "perimeter-area" else ("Two angles fill a complete turn. One is 270 degrees. What is the remaining angle?", "90 degrees", "270 degrees")
    worked["content"]["examples"] = [dict(key="simple-worked-method", body=simple_body, category="quantitative", difficulty=1, support="guided", quickCheck=check(simple_check, 0)), dict(key="apply-worked-method", body=worked["content"]["body"], category="quantitative", difficulty=2, support="independent", prerequisites=[repair], quickCheck=worked["content"]["quickCheck"])]
    for depth, case in CASES[slug].items():
        keys = [f"geometry-{depth}-{i+1}" for i in range(3)]
        for i, description in enumerate(case["rubric"]):
            competencies.append(dict(depth=depth, key=keys[i], description=description, sequence=i, evidence_type="application" if depth == "applied" else "quick_check"))
        template = [("Readiness check", "quick_check"), ("Scenario" if depth == "applied" else "Complex scenario", "big_picture"), ("Method selection" if depth == "applied" else "Cross-concept connection", "process" if depth == "applied" else "relationships"), ("Guided application" if depth == "applied" else "Evidence evaluation", "worked_example" if depth == "applied" else "example"), ("Independent application" if depth == "applied" else "Independent problem", "application"), ("Lab or practical task" if depth == "applied" else "Challenge or investigation", "application"), ("Reflection" if depth == "applied" else "Justification", "synthesis"), (depth.title()+" check", "quick_check")]
        for i, (title, kind) in enumerate(template):
            content = dict(body=case["scenario"] if i in (0,1,4,5,7) else case["method"] if i in (2,6) else case["worked"], competencyKeys=[])
            if i in (0,2,3,7): content["quickCheck"] = check(case["checks"][[0,2,3,7].index(i)], i)
            if i in (4,5) or (depth == "advanced" and i in (3,6)):
                content.pop("quickCheck", None)
                prompt = case["independent"] if i == 4 else case["lab"] if i == 5 else "Evaluate and justify the reasoning in the stated scenario. " + case["independent"]
                content.update(competencyKeys=keys, task=dict(prompt=case["scenario"] + " " + prompt, rubric=case["rubric"]))
            blocks.append(dict(depth=depth, block_type=kind, title=title, objective=case["rubric"][0], sequence=i, required=True, content=content))
    pack.append(dict(slug=slug, concept_type="quantitative", competencies=competencies, blocks=blocks))

(ROOT / "competency_geometry_drafts.json").write_text(json.dumps(pack, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
sql = """-- Geometry drafts only. Existing frameworks and review decisions are preserved.
BEGIN;
DO $seed$
DECLARE pack jsonb := $data$""" + json.dumps(pack, ensure_ascii=False) + """$data$; item jsonb; comp jsonb; block jsonb; cid uuid;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements(pack) LOOP
  SELECT id INTO cid FROM public.concepts WHERE slug=item->>'slug';
  IF cid IS NULL THEN RAISE EXCEPTION 'Missing catalogue concept %',item->>'slug'; END IF;
  IF EXISTS(SELECT 1 FROM public.concept_competencies WHERE concept_id=cid) OR EXISTS(SELECT 1 FROM public.knowledge_blocks WHERE concept_id=cid) THEN
   RAISE NOTICE 'Preserving existing framework for %',item->>'slug'; CONTINUE;
  END IF;
  IF EXISTS(SELECT 1 FROM public.concepts WHERE id=cid AND concept_type IS NOT NULL AND concept_type<>item->>'concept_type') THEN
   RAISE NOTICE 'Preserving existing concept type for %',item->>'slug'; CONTINUE;
  END IF;
  UPDATE public.concepts SET concept_type=item->>'concept_type' WHERE id=cid;
  FOR comp IN SELECT value FROM jsonb_array_elements(item->'competencies') LOOP
   INSERT INTO public.concept_competencies(concept_id,depth,competency_key,description,required,sequence,evidence_type,review_status)
   VALUES(cid,comp->>'depth',comp->>'key',comp->>'description',true,(comp->>'sequence')::int,comp->>'evidence_type','draft');
  END LOOP;
  FOR block IN SELECT value FROM jsonb_array_elements(item->'blocks') LOOP
   INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,objective,required,sequence,content,review_status)
   VALUES(cid,block->>'depth',block->>'block_type',block->>'title',block->>'objective',true,(block->>'sequence')::int,block->'content','draft');
  END LOOP;
 END LOOP;
END;
$seed$;
COMMIT;
"""
(ROOT / "migrations" / "20270000000037_geometry_drafts.sql").write_text(sql, encoding="utf-8")
regression_path = ROOT / "test_geometry_drafts.sql"
if regression_path.exists():
    regression = regression_path.read_text(encoding="utf-8")
    start = regression.index("DO $seed$")
    end = regression.index("$seed$;", start) + len("$seed$;")
    seed_body = sql[sql.index("DO $seed$"):sql.rindex("COMMIT;")]
    regression_path.write_text(regression[:start] + seed_body.rstrip() + regression[end:], encoding="utf-8")
# Extend the reviewed catalogue contract before inserting blocks with new models.
media = (ROOT / "migrations" / "20270000000035_media_support_contract.sql").read_text(encoding="utf-8")
media = media[media.index("CREATE OR REPLACE FUNCTION"):media.index("DROP TRIGGER")]
publication = (ROOT / "migrations" / "20270000000030_publish_competency_depth.sql").read_text(encoding="utf-8")
publication = publication[publication.index("CREATE OR REPLACE FUNCTION"):publication.index("CREATE OR REPLACE FUNCTION public.admin_update")]
contract = ("BEGIN;\n" + media + publication + "COMMIT;\n").replace("'series_circuit'", "'series_circuit','area_perimeter','angle_turn'")
(ROOT / "migrations" / "20270000000036_geometry_visuals.sql").write_text(contract, encoding="utf-8")
print(f"Built {len(pack)} concepts, {sum(len(c['blocks']) for c in pack)} blocks, {sum(len(c['competencies']) for c in pack)} competencies")
