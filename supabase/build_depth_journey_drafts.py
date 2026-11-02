"""Build unpublished Applied/Advanced journeys for academic review.

The prompts are authored draft scenarios, not model-assigned mastery decisions.
Independent work is assessed by an authorized reviewer against explicit rubrics.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
foundation = json.loads((ROOT / "competency_pilot_drafts.json").read_text(encoding="utf-8"))
# context, worked method, independent task, practical task, unfamiliar context,
# transfer task, investigation/justification task
SCENARIOS = {
"fractions": (
 "A recipe uses three quarters of a cup of flour for six servings. The class needs eight servings.",
 "Scale the amount by eight divided by six. Three quarters multiplied by eight sixths equals one cup. State that both amounts refer to the same cup measure.",
 "A class has thirty oranges and uses three fifths for a snack. Find the number used and remaining. Explain your operations and check that the two quantities recombine to thirty.",
 "Use equal paper strips to represent one half, two thirds and five sixths. Describe how you kept the whole constant, compare the quantities, and record a method another learner could reproduce.",
 "One group claims that adding one half and one third gives two fifths. Another group uses sixths. Both groups used strips of the same length.",
 "Evaluate both methods using a diagram and numerical reasoning. Then connect the correct sum to a percentage or a ratio and explain the comparison base.",
 "Design a new sharing situation involving two different fractions. Solve it in two representations, identify a plausible error and justify why your answer fits the original whole."),
"ratios-proportion": (
 "A school garden mixes compost and soil in a ratio of two to three. It needs twenty-five buckets of mixture.",
 "There are five parts altogether. Twenty-five divided by five gives five buckets per part, so use ten compost buckets and fifteen soil buckets. Check that the total is twenty-five.",
 "Share thirty-five exercise books between two groups in the ratio three to four. Show how you found one part and explain how you checked both the total and the ratio.",
 "Make a ratio table for several batches of a two-to-three mixture using counters or drawings. Explain how the table represents the same comparison at different scales.",
 "Two services charge differently. Service A charges four cedis per item. Service B charges a fixed ten cedis plus two cedis per item.",
 "Create a table for one, five and ten items. Decide which relationship is proportional, explain why a fixed charge matters, and compare costs for a new number of items.",
 "Investigate a real or invented mixture problem. Distinguish scaling by multiplication from adding the same amount to each part, and justify a method that preserves the intended ratio."),
"percentages": (
 "An item costs one hundred and twenty cedis before a fifteen percent discount.",
 "Ten percent of one hundred and twenty is twelve; five percent is six. The discount is eighteen cedis and the new price is one hundred and two cedis. The base is the original price.",
 "A class of forty learners has thirty learners present. Find the attendance percentage, identify the whole, and explain how your fraction, decimal and percentage representations agree.",
 "Design a small budget with prices and discounts. Record the original base for every percentage and show how you checked the final totals.",
 "A shop reduces a price of one hundred cedis by twenty percent, then increases the reduced price by twenty percent. An advertisement claims that the changes cancel out.",
 "Evaluate the claim by calculating both price changes. Explain the changing reference base and compare the final price with the original price.",
 "Create two percentage claims with different bases that appear similar. Use actual quantities to evaluate them and justify how the comparison could be communicated fairly."),
"linear-equations": (
 "A transport model charges a fixed five cedis plus three cedis per kilometre. The total fare is thirty-two cedis.",
 "Let the distance be x kilometres. Solve 5 + 3x = 32 by subtracting five from both sides, then dividing both sides by three. The distance is nine kilometres; substitution gives thirty-two cedis.",
 "A notebook purchase has a fixed delivery charge of four cedis plus six cedis per notebook and totals forty cedis. Form an equation, solve it, check by substitution and interpret the answer.",
 "Invent a simple purchase or measurement problem represented by a two-step equation. Provide measurements or prices, explain the model and exchange your checked solution method with a peer.",
 "Two pricing rules are y = 5 + 3x and y = 11 + 2x. A learner says the second rule is always more expensive because its fixed charge is larger.",
 "Find where the rules give the same cost, compare values on either side, and connect the equation solution to the intersection of two lines. Explain the meaningful domain for x.",
 "Design an unfamiliar multi-step equation problem with a contextual restriction. Solve it, justify each equivalent transformation, and explain how a mathematically valid solution could fail the context."),
"graphs-interpretation": (
 "A rainfall table records ten, thirty, twenty and forty millimetres for four successive days. The class must compare the days and describe the overall pattern.",
 "Label the horizontal axis with days and the vertical axis with rainfall in millimetres. Use equal intervals. Read the values before comparing them: day four has thirty millimetres more rainfall than day one.",
 "Use the rainfall values ten, thirty, twenty and forty millimetres to draw a suitable graph. Describe the pattern with numerical evidence and explain why the fall on day three matters.",
 "Collect or invent a small labelled dataset. Choose a representation, explain the units and scale, and answer two comparison questions from the graph.",
 "Two graphs show the same values, ninety-eight and one hundred, but one vertical axis begins at zero and the other begins at ninety-seven. A claim describes an enormous increase.",
 "Evaluate how the axis choice changes the impression. Calculate the actual difference, discuss what the data do and do not establish, and propose a clearer representation.",
 "Compare two representations of the same dataset and an accompanying claim. Explain uncertainty or missing context, identify whether a causal conclusion is justified, and defend a fair summary."),
"photosynthesis": (
 "A class compares similar plants under different light levels while keeping plant type, water supply and observation time consistent.",
 "Identify light as the changed factor and choose an observable outcome. Keep other relevant conditions consistent, use repeated observations, and explain how the evidence relates to glucose production rather than treating soil as plant food.",
 "Plan a fair investigation of light availability and photosynthesis. Identify the changed variable, measured outcome, controls and a prediction that could be challenged by the results.",
 "Interpret a teacher-provided plant investigation or carry out an approved classroom activity. Record observations, note limitations, and explain how light, carbon dioxide and water relate to the result.",
 "A dataset shows that increasing light initially raises the measured photosynthesis rate, but the rate later levels off. The carbon dioxide supply was not changed.",
 "Analyse the plateau using limiting-factor reasoning. Propose another variable to investigate, state what the current evidence cannot distinguish, and connect photosynthesis with respiration or ecosystem energy transfers.",
 "Design a follow-up investigation to distinguish two explanations for a plateau. Justify controls, replication and measurements, and explain how the conclusions depend on the evidence."),
"density": (
 "A workshop compares two solid materials. A sample has a mass of thirty-six grams and a volume of twelve cubic centimetres.",
 "Measure mass with a balance and volume with a suitable method. Divide thirty-six by twelve to obtain three grams per cubic centimetre. Compare materials using consistent units rather than mass alone.",
 "Sample A has a mass of forty grams and a volume of ten cubic centimetres. Sample B has a mass of sixty grams and a volume of twenty cubic centimetres. Calculate both densities, compare them and justify your method.",
 "Plan a safe classroom comparison of two small, water-safe solid samples. Explain balance use, a suitable volume measurement, units, repeated readings and how you would compare the results.",
 "An irregular solid has a mass of one hundred and twenty grams. Water rises from twenty-five to forty cubic centimetres when the solid is fully submerged. The volume scale has finite precision.",
 "Determine the solid's volume and density. Explain how reading uncertainty affects the result and how displacement connects the calculation to an irregular shape. State the assumptions about submersion and trapped air.",
 "Compare the solid's average density with water at approximately one gram per cubic centimetre. Discuss whether it would sink under the stated conditions, distinguish a hollow object from its material, and design a check of your prediction."),
"forces": (
 "A box is pulled with twelve newtons to the right while friction acts with five newtons to the left.",
 "Draw labelled arrows in opposite directions. Subtract five from twelve to find a resultant of seven newtons right. A nonzero resultant changes velocity; the diagram does not itself specify the current speed.",
 "A trolley experiences nine newtons forward and four newtons backward. Draw the force diagram, determine the resultant and explain a possible change in motion without inventing an unsupported speed.",
 "Plan an approved low-force classroom investigation with a trolley. Identify how forces would be measured or compared, keep relevant conditions consistent and explain how you would record changes in motion.",
 "A moving object follows a curved path at a constant speed. A learner argues that its forces must be balanced because its speed is constant.",
 "Evaluate the argument by distinguishing speed and velocity. Explain the role of changing direction, connect your explanation to a force diagram and state what further information would be needed for a numerical calculation.",
 "Compare two explanations for an unfamiliar motion observation. Design a measurement that could distinguish them, state assumptions about resistance and justify your model using evidence."),
"electricity": (
 "A simple low-voltage cell circuit contains a switch and two lamps in a single series loop. The class must predict and test the effect of opening the switch.",
 "Trace the complete path through the source and components. Opening the switch breaks the only path and stops steady current. Use standard symbols and distinguish current from potential difference.",
 "Draw and explain a simple series circuit with a cell, switch and two lamps. Predict what happens when the switch opens, and describe where you would measure current and potential difference.",
 "Use a teacher-approved low-voltage cell-and-lamp kit or a circuit simulation. Compare a series loop with two parallel lamp branches, record observations and avoid mains electricity or shorting the source.",
 "In a parallel circuit, the measured currents in two branches are 0.2 amperes and 0.3 amperes. The measured current entering the junction is 0.5 amperes. A learner claims that the first lamp uses up charge.",
 "Evaluate the charge claim using the current measurements. Connect the branch and total currents, distinguish energy transfer from charge flow and identify a useful additional measurement.",
 "Propose a low-voltage lighting arrangement in which one lamp can be switched off while another remains on. Justify the branch design, explain a possible measurement error and evaluate limitations before a supervised test."),
"space-solar-system": (
 "A scale model represents one astronomical unit with two centimetres. Jupiter's average distance is approximately 5.2 astronomical units for this activity.",
 "Keep the reference scale explicit. Multiply 5.2 by two to place Jupiter about 10.4 centimetres from the model Sun. A distance scale does not automatically make the drawn planet sizes accurate.",
 "A model uses one astronomical unit per two centimetres. Place Earth at one astronomical unit and a fictional planet at four astronomical units. Explain the distances and identify what the model does not represent accurately.",
 "Build or draw a labelled Solar System model. State whether it shows order, sizes or distances, distinguish rotation and revolution, and explain the limitations of the chosen scale.",
 "Two fictional planets orbit the same star. Planet A has an average orbital distance of one unit and a period of one year; planet B has a distance of four units and a period of eight years. A diagram shows both planets drawn at the same size.",
 "Analyse what the distance and period data support. Connect gravity, motion and scale, explain what cannot be inferred about planet size, and distinguish an observed pattern from a universal claim based on two examples.",
 "Evaluate a claim that space has no gravity because planets keep moving. Use an orbital model, identify the roles of motion and attraction, and propose observations or representations that would support your explanation."),
}

APPLIED = [("Readiness check", "quick_check"), ("Scenario", "big_picture"), ("Method selection", "process"), ("Guided application", "worked_example"), ("Independent application", "application"), ("Lab or practical task", "application"), ("Reflection", "synthesis"), ("Applied check", "quick_check")]
ADVANCED = [("Readiness check", "quick_check"), ("Complex scenario", "big_picture"), ("Cross-concept connection", "relationships"), ("Evidence evaluation", "example"), ("Independent problem", "application"), ("Challenge or investigation", "application"), ("Justification", "synthesis"), ("Advanced check", "quick_check")]
pack = []
for concept in foundation:
    slug = concept["slug"]
    context, worked, independent, practical, complex_context, transfer, investigation = SCENARIOS[slug]
    for depth, template in [("applied", APPLIED), ("advanced", ADVANCED)]:
        competencies = [c for c in concept["competencies"] if c["depth"] == depth]
        keys = [c["key"] for c in competencies]
        rubric = [c["description"] for c in competencies]
        blocks = []
        for sequence, (title, block_type) in enumerate(template):
            content = {"body": context if depth == "applied" else complex_context, "competencyKeys": [], "prerequisites": []}
            if depth == "applied":
                if sequence == 2: content["body"] = "Choose the method by identifying the question, relevant quantities or observations, and an appropriate way to check the result. " + worked
                if sequence == 3: content["body"] = worked
                if sequence == 4: content.update(body=context, competencyKeys=keys[:2], task={"prompt": independent, "rubric": rubric[:2]})
                if sequence == 5: content.update(body="Use measurements or representations to investigate the scenario. State the conditions under which your method is appropriate.", competencyKeys=keys[2:], task={"prompt": practical, "rubric": rubric[2:]+["Record evidence and explain limitations"]})
                if sequence == 6: content["body"] = "Reflect on your independent response and practical task. Identify the evidence supporting your conclusion and one change that would improve the method. " + worked
            else:
                if sequence == 2: content["body"] = "Use the relationship between the relevant concepts rather than relying on a single recalled definition. " + rubric[1] + ". State the assumptions needed for the connection."
                if sequence == 3: content.update(competencyKeys=keys[:1], task={"prompt": "Evaluate the claims and evidence in this scenario. " + complex_context + " State one limitation and explain what further information would help.", "rubric": rubric[:1]+["Distinguish supported conclusions from assumptions"]})
                if sequence == 4: content.update(competencyKeys=keys[:2], task={"prompt": transfer, "rubric": rubric[:2]})
                if sequence == 5: content.update(competencyKeys=keys[2:], task={"prompt": investigation, "rubric": rubric[2:]+["Justify the method using evidence and stated assumptions"]})
                if sequence == 6: content.update(competencyKeys=keys, task={"prompt": "Defend the conclusions of your independent work. Explain the strongest evidence, address a plausible alternative and identify a limitation. " + complex_context, "rubric": rubric})
            if sequence in (0, 7):
                content["body"] = "Check your readiness to use evidence and explain a method. " + (context if depth == "applied" else complex_context)
                content["quickCheck"] = {"prompt": "Which response best supports a defensible conclusion in this scenario?", "options": ["Explain the method, use relevant evidence and state limitations", "Give a conclusion without connecting it to evidence"], "correctIndex": 0, "explanation": "A conclusion needs an appropriate method, relevant evidence and clear limits. Your independent responses are assessed separately."}
            blocks.append({"depth": depth, "title": title, "block_type": block_type, "sequence": sequence, "required": True, "objective": "Use the concept in context" if depth == "applied" else "Transfer and justify understanding", "content": content})
        pack.append({"slug": slug, "depth": depth, "blocks": blocks})
(ROOT / "competency_depth_drafts.json").write_text(json.dumps(pack, indent=2)+"\n", encoding="utf-8")
sql = """BEGIN;
-- Unpublished higher-depth authoring pack; reviewed content is preserved.
DO $seed$
DECLARE pack jsonb := $data$"""+json.dumps(pack)+"""$data$; item jsonb; block jsonb; cid uuid;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements(pack) LOOP
  SELECT id INTO cid FROM public.concepts WHERE slug=item->>'slug';
  IF cid IS NULL THEN RAISE EXCEPTION 'Missing concept %',item->>'slug'; END IF;
  FOR block IN SELECT value FROM jsonb_array_elements(item->'blocks') LOOP
   INSERT INTO public.knowledge_blocks AS kb(concept_id,depth,block_type,title,objective,required,sequence,content,review_status)
    VALUES(cid,item->>'depth',block->>'block_type',block->>'title',block->>'objective',true,(block->>'sequence')::int,block->'content','draft')
   ON CONFLICT(concept_id,depth,sequence) DO UPDATE SET block_type=EXCLUDED.block_type,title=EXCLUDED.title,objective=EXCLUDED.objective,content=EXCLUDED.content,version=kb.version+1,updated_at=now()
    WHERE kb.review_status='draft' AND kb.content IS DISTINCT FROM EXCLUDED.content;
  END LOOP;
 END LOOP;
END;
$seed$;
COMMIT;
"""
(ROOT / "migrations" / "20270000000027_depth_journey_drafts.sql").write_text(sql, encoding="utf-8")
