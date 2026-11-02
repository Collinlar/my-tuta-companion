"""Fill missing Foundation structures with authored, unpublished review drafts."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent
base = json.loads((ROOT / "competency_pilot_drafts.json").read_text(encoding="utf-8"))
# title, type, objective, teaching, question, correct, distractor, optional visual
EXTRA = {
"fractions": [
 ("Numerator and denominator", "components", "Identify the roles of fraction components", "In three quarters, three counts selected parts and four names the number of equal parts in the whole. The denominator also tells you the size of each part relative to that whole.", "In three quarters, what does three count?", "Selected equal parts", "All the parts in the whole", None),
 ("Fraction vocabulary", "vocabulary", "Distinguish a unit fraction from other fractions", "A unit fraction has numerator one, such as one fifth. It names one of the equal parts made by dividing a whole; three fifths contains three of those unit fractions.", "Which is a unit fraction?", "One fifth", "Three fifths", None),
 ("The reference whole", "big_picture", "Keep the reference whole explicit", "Half of a small orange and half of a large orange are the same fraction of different wholes. They need not have the same mass. State the whole whenever comparing fractional quantities.", "Must half of a small orange have the same mass as half of a large orange?", "No, the reference wholes differ", "Yes, both are one half", None),
 ("Equal-area model", "visual_model", "Interpret equal-area fraction models", "The model divides one rectangle into four equal areas and shades three of them. It represents three quarters of that rectangle; equal part sizes make the denominator meaningful.", "Three of four equal areas are shaded. What fraction is shaded?", "Three quarters", "Four thirds", "fraction_parts"),
 ("Worked sharing example", "worked_example", "Explain a fraction-of-a-quantity method", "To find three quarters of twelve counters, first divide twelve into four equal groups of three. Then select three groups, giving nine counters. Recombining the selected nine and remaining three gives twelve.", "What is three quarters of twelve?", "Nine", "Four", None),
],
"ratios-proportion": [
 ("The compared quantities", "components", "Identify the quantities and their order in a ratio", "A ratio must identify which quantities are compared and in which order. In a flour-to-water ratio of three to two, the first quantity is flour and the second is water; reversing the order changes the description.", "In flour to water of three to two, which quantity has three parts?", "Flour", "Water", None),
 ("Parts and consistent units", "vocabulary", "Use consistent units in ratio comparisons", "To compare fifty centimetres with one metre, first express both lengths in the same unit. Fifty to one hundred simplifies to one to two. Treating the units as equal without conversion gives a different and incorrect comparison.", "Fifty centimetres to one metre simplifies to what?", "One to two", "Fifty to one", None),
 ("A multiplicative comparison", "big_picture", "Explain ratio as a multiplicative relationship", "A two-to-three comparison describes a relationship that can be scaled. Four to six and six to nine preserve it because both quantities change by the same factor. The total quantity can vary while the ratio stays fixed.", "Which preserves a two-to-three relationship?", "Four to six", "Four to five", None),
 ("Ratio model", "visual_model", "Connect a ratio model to part-to-whole fractions", "The model has two green counters and three blue counters. Green to blue is two to three, while green to the whole group is two to five. These comparisons answer different questions.", "What fraction of the five-counter group is green?", "Two fifths", "Two thirds", "ratio_groups"),
 ("Worked ratio share", "worked_example", "Calculate a ratio share using one part", "Share twenty counters in a one-to-three ratio. There are four parts, so each part contains five counters. The shares are five and fifteen; their sum and simplified ratio both check the result.", "Twenty counters are shared in a one-to-three ratio. What is the smaller share?", "Five", "Ten", None),
],
"percentages": [
 ("Percent, part and whole", "components", "Identify percentage components", "A percentage comparison has a part, a reference whole and a rate per hundred. If ten of forty learners cycle, ten is the part and forty is the whole. The percentage is twenty-five.", "Ten of forty learners cycle. Which value is the whole?", "Forty", "Ten", None),
 ("Percent and percentage points", "vocabulary", "Use percent and percentage points precisely", "Percent expresses a rate relative to a base. Percentage points express the difference between two percentage rates. Moving from ten percent to fifteen percent adds five percentage points, even though the relative increase is fifty percent.", "From ten percent to fifteen percent is how many percentage points?", "Five", "Fifty", None),
 ("Keep the base visible", "big_picture", "Explain why percentage comparisons depend on the base", "Fifty percent of twenty is ten, while fifty percent of two hundred is one hundred. Equal percentages need not mean equal quantities. Identify the original base before comparing the actual changes.", "Do equal percentages of different totals always give equal quantities?", "No, the bases also matter", "Yes, the percentage alone fixes the quantity", None),
 ("Hundred-square representation", "visual_model", "Read a percentage from a hundred-square grid", "A ten-by-ten grid has one hundred equal squares. Shading twenty-five shows twenty-five percent, which is also one quarter of the grid. Each square represents one percent of this whole.", "Twenty-five of one hundred squares are shaded. What percentage is shaded?", "Twenty-five percent", "Seventy-five percent", "percentage_grid"),
 ("Worked percentage example", "worked_example", "Calculate a simple percentage using known parts", "Find fifteen percent of sixty by combining ten percent and five percent. Ten percent is six and five percent is three, so fifteen percent is nine. Check that the answer is less than the whole sixty.", "What is fifteen percent of sixty?", "Nine", "Fifteen", None),
],
"linear-equations": [
 ("Why equations are useful", "big_picture", "Explain the purpose of an equation model", "An equation represents a condition in which two expressions have equal values. It lets us describe an unknown quantity and find a value that satisfies that condition. A contextual answer must also fit the original situation.", "What must a solution do?", "Make the original equality true", "Only make one side look simpler", None),
 ("Term, coefficient and variable", "vocabulary", "Identify equation vocabulary", "In two x plus three equals eleven, x is a variable, two is the coefficient of x, and three is a constant term. Naming these parts helps explain which operation should be undone first.", "In two x plus three, which is the coefficient of x?", "Two", "Three", None),
 ("A reversible procedure", "process", "Sequence inverse operations correctly", "For three x plus two equals fourteen, first subtract two from both sides. Then divide both sides by three to obtain x equals four. Finally substitute four into the original equation to check it.", "After subtracting two from both sides, three x equals twelve. What comes next?", "Divide both sides by three", "Subtract three only from the left side", None),
 ("Recognise equation variations", "categories", "Recognise equivalent equations in different forms", "An unknown can appear on either side of an equals sign. Eight equals x plus three has the same solution as x plus three equals eight. Read the equality before applying a memorised position rule.", "Does eight equals x plus three have the same solution as x plus three equals eight?", "Yes, both assert the same equality", "No, moving the equals sign changes the solution", None),
 ("Worked balance example", "worked_example", "Justify and check a balance method", "Solve x plus three equals eight by subtracting three from each side. The two sides remain equal and x equals five. Substitution checks that five plus three equals eight.", "Which value solves x plus three equals eight?", "Five", "Eleven", "equation_balance"),
],
"graphs-interpretation": [
 ("Worked data comparison", "example", "Use a graph and its units to compare observations", "The illustrative rainfall graph shows ten, thirty, twenty and forty millimetres over days one to four. Day four has thirty millimetres more rain than day one. The dip on day three means the increase was not continuous.", "Does the rainfall increase on every successive day?", "No, it falls from day two to day three", "Yes, it increases without any fall", "graph_reading"),
],
"photosynthesis": [
 ("Purpose and food chains", "big_picture", "Explain the biological role of photosynthesis", "Photosynthesis transfers light energy into the chemical stores of organic substances such as glucose. Plants use these substances for growth and respiration, and other organisms can obtain them through feeding relationships. This connects leaves to wider food chains.", "How can photosynthesis support a food chain?", "It produces organic substances that organisms can use", "It makes energy disappear from the ecosystem", None),
 ("Limiting factors", "relationships", "Explain why changing one factor may not change the rate", "Light, carbon dioxide and suitable temperature affect photosynthesis. Increasing light helps only when light limits the rate; another factor can prevent a further increase. A plateau is therefore a reason to examine other conditions.", "Must more light always keep increasing the photosynthesis rate?", "No, another factor can become limiting", "Yes, other conditions never matter", None),
 ("Inputs, energy and outputs", "visual_model", "Interpret the photosynthesis process model", "The process model shows carbon dioxide and water entering, light energy being absorbed with the help of chlorophyll, and glucose and oxygen being produced. Light supplies energy rather than atoms of plant material.", "In the model, what role does light play?", "It supplies energy for the process", "It supplies soil particles to the leaf", "photosynthesis_process"),
],
"forces": [
 ("Compare explanations", "misconception", "Distinguish balanced forces from an absence of forces", "A stationary box can have forces acting on it that balance. Lack of acceleration does not by itself prove that no forces act. Identify the interactions and their directions before choosing an explanation.", "A box remains at rest. Must there be no forces on it?", "No, forces can balance", "Yes, rest proves the absence of every force", None),
 ("Evidence from a force diagram", "example", "Use a force diagram to justify a resultant", "The diagram represents twelve newtons right and five newtons left. These opposite forces leave a resultant of seven newtons right. The resultant predicts a change in velocity, not an exact current speed.", "What is the resultant shown by twelve newtons right and five newtons left?", "Seven newtons right", "Seventeen newtons right", "forces_diagram"),
],
"electricity": [
 ("Purpose of the circuit", "big_picture", "Explain a circuit as an energy-transfer system", "A complete circuit connects an electrical source with components that transfer energy, such as lamps. Wires provide conducting paths and switches control whether paths are complete. The source and components have different roles in the system.", "What is a lamp's main role in a circuit?", "Transfer energy into light and thermal stores", "Create charge from nothing", None),
 ("Feedback and control", "process", "Distinguish manual switching from automatic feedback", "A simple cell-and-lamp circuit does not automatically adjust itself to a measured temperature. Feedback needs a measurement used to change the system, as when a thermostat controls a heater. A manual switch alone does not provide that automatic feedback.", "Does an ordinary manual switch alone provide automatic temperature feedback?", "No, measurement and a control response are needed", "Yes, every switch measures temperature", None),
 ("Failure points", "misconception", "Identify a broken path as a circuit failure", "A loose connection, broken wire or open switch can interrupt a series path. A lamp going out is therefore not enough evidence that its charge has been used up. Check the path and components to distinguish the possible faults.", "A loose wire makes a series lamp go out. What is a likely cause?", "The conducting path is incomplete", "The lamp has consumed all the charge", None),
 ("Trace the system", "visual_model", "Trace current through a complete series path", "The schematic uses one cell, one switch and two lamps in a single loop. With the switch closed there is a complete path. Opening that switch breaks the only path and stops steady current through both lamps.", "Opening the switch in this series loop does what?", "Breaks the only conducting path through both lamps", "Leaves an independent path through each lamp", "series_circuit"),
]}
RETAGS = {
"graphs-interpretation": {"What a graph shows": "big_picture", "Axes and scale": "vocabulary", "Read a point": "process"},
"photosynthesis": {"Reactants": "components", "Products": "components", "Chlorophyll and light": "components", "Plant structures": "process"},
"forces": {"Contact and noncontact": "components", "Force arrows": "components", "Resultant force": "process"},
"electricity": {"Circuit parts": "components", "Current and voltage": "components"},
}
pack = []
for concept in base:
    slug = concept["slug"]
    additions = []
    for index, (title, kind, objective, body, prompt, correct, distractor, visual) in enumerate(EXTRA.get(slug, [])):
        key = f"structure-{index+1}"
        content = dict(body=body, competencyKeys=[key], prerequisites=[], quickCheck=dict(prompt=prompt, options=[correct, distractor] if index%2==0 else [distractor, correct], correctIndex=index%2, explanation=correct+". "+body))
        if visual: content["visual"] = visual
        additions.append(dict(title=title, block_type=kind, objective=objective, sequence=len(concept["blocks"])+index, key=key, content=content))
    pack.append(dict(slug=slug, retags=RETAGS.get(slug, {}), additions=additions))
(ROOT / "competency_foundation_completion.json").write_text(json.dumps(pack, indent=2)+"\n", encoding="utf-8")
sql = """BEGIN;
DO $seed$
DECLARE item jsonb; block jsonb; cid uuid; tag record;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements($data$"""+json.dumps(pack)+"""$data$::jsonb) LOOP
  SELECT id INTO cid FROM public.concepts WHERE slug=item->>'slug';
  IF cid IS NULL THEN RAISE EXCEPTION 'Missing concept'; END IF;
  FOR tag IN SELECT key,value FROM jsonb_each_text(item->'retags') LOOP
   UPDATE public.knowledge_blocks SET block_type=tag.value,version=version+1,updated_at=now()
    WHERE concept_id=cid AND depth='foundation' AND title=tag.key AND review_status='draft' AND block_type<>tag.value;
  END LOOP;
  FOR block IN SELECT value FROM jsonb_array_elements(item->'additions') LOOP
   INSERT INTO public.concept_competencies(concept_id,depth,competency_key,description,required,sequence,evidence_type,review_status)
    VALUES(cid,'foundation',block->>'key',block->>'objective',true,(block->>'sequence')::int,'quick_check','draft') ON CONFLICT(concept_id,depth,competency_key) DO NOTHING;
   INSERT INTO public.knowledge_blocks(concept_id,depth,block_type,title,objective,required,sequence,content,review_status)
    VALUES(cid,'foundation',block->>'block_type',block->>'title',block->>'objective',true,(block->>'sequence')::int,block->'content','draft') ON CONFLICT(concept_id,depth,sequence) DO NOTHING;
  END LOOP;
 END LOOP;
END;
$seed$;
COMMIT;
"""
(ROOT / "migrations" / "20270000000031_foundation_structure_completion.sql").write_text(sql, encoding="utf-8")
