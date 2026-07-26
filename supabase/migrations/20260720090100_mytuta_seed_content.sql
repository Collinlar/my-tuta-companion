-- =====================================================================
-- mytuta STEM mastery — global seed content
-- Idempotent: stable slugs + ON CONFLICT DO NOTHING. Lifted from the
-- Phase 1 mock modules so screens show real, Ghana-grounded content.
-- Apply AFTER 20260720090000_mytuta_stem_core.sql.
--
-- JSON payloads use $j$ ... $j$ dollar-quoting with a space after the tag
-- so web SQL editors cannot mistake the payload for a JS template,
-- and apostrophes in copy cannot break string literals.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Concepts
-- ---------------------------------------------------------------------
INSERT INTO public.concepts (slug, subject, name, description, learning_stage, difficulty, related_areas) VALUES
  ('photosynthesis', 'General Science', 'Photosynthesis',
   'How a plant makes its own food using light energy, carbon dioxide and water.',
   'Lower secondary', 'medium',
   ARRAY['Plant cells','Chlorophyll','Light energy','Carbon dioxide','Glucose']),
  ('linear-equations', 'Mathematics', 'Linear equations', 'Solving equations of the first degree.', 'Lower secondary', 'medium', ARRAY['Algebra','Balancing','Substitution']),
  ('density', 'Physics', 'Density', 'Mass per unit volume and its applications.', 'Lower secondary', 'medium', ARRAY['Mass','Volume','Units']),
  ('fractions', 'Mathematics', 'Fractions', 'Parts of a whole and operations on them.', 'Lower secondary', 'easy', ARRAY['Numerator','Denominator','Equivalence']),
  ('chemical-bonding', 'Chemistry', 'Chemical bonding', 'How atoms join to form compounds.', 'Upper secondary', 'hard', ARRAY['Ionic','Covalent','Electrons'])
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------
-- Misconceptions (photosynthesis)
-- ---------------------------------------------------------------------
INSERT INTO public.misconceptions (concept_id, label, detail)
SELECT id, 'Gas exchange reversed',
  'Many students think plants take in oxygen and release carbon dioxide like we do. During photosynthesis it is the reverse: they take in carbon dioxide and release oxygen.'
FROM public.concepts WHERE slug = 'photosynthesis'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- Concept stages for Photosynthesis (8-stage mastery path with content)
-- ---------------------------------------------------------------------
INSERT INTO public.concept_stages (concept_id, ord, name, loop_phase, description, est_time, content)
SELECT c.id, v.ord, v.name, v.loop_phase, v.description, v.est_time, v.content
FROM public.concepts c
CROSS JOIN (VALUES
  (0, 'Foundations', 'Diagnose', 'Confirm what this builds on', '3 min', $j$ {"intro":"Quick confirmation of the ideas photosynthesis builds on. Skip anything you already know.","items":[{"icon":"✓","title":"Plant cell structure","body":"You mastered this last week.","status":"Secure"},{"icon":"✓","title":"What chlorophyll is","body":"Confirmed in your check.","status":"Secure"},{"icon":"→","title":"Energy and light","body":"A quick refresher first.","status":"Review"}]} $j$::jsonb),
  (1, 'Understand', 'Understand', 'The concept, explained your way', '8 min', $j$ {"modes":["Explain simply","Show visually","Real example","Explain the parts","Compare"],"texts":["Photosynthesis is how a plant makes its own food. Using energy from sunlight, it takes in carbon dioxide from the air and water from the soil, and turns them into glucose, a kind of sugar it uses for energy. As it does this, it releases oxygen into the air.","Picture a leaf as a small factory. Sunlight is the power supply, carbon dioxide and water are the raw materials coming in, and glucose and oxygen are the products going out. The green colour, chlorophyll, is the machine that captures the light.","Think of a mango tree in the yard. On a bright day its leaves are busy making sugar from air, water and sunlight. That stored sugar is what later helps the tree grow and produce fruit.","The concept has three inputs and two outputs. Inputs: carbon dioxide, water, and light energy. Outputs: glucose and oxygen. Chlorophyll in the leaf captures the light energy that drives the whole reaction.","Photosynthesis and respiration are opposites. Photosynthesis takes in carbon dioxide and releases oxygen while storing energy. Respiration takes in oxygen and releases carbon dioxide while using energy."],"misconception":"Many students think plants take in oxygen and release carbon dioxide like we do. During photosynthesis it is the reverse: they take in carbon dioxide and release oxygen."} $j$::jsonb),
  (2, 'Worked examples', 'Understand', 'Follow the reasoning', '6 min', $j$ {"question":"A leaf is placed in sunlight. Explain what happens to the carbon dioxide it absorbs.","steps":[{"n":1,"title":"What is being asked","body":"We need to trace the carbon dioxide the leaf absorbs and explain what it becomes."},{"n":2,"title":"Which concept applies","body":"Photosynthesis combines carbon dioxide and water using light energy."},{"n":3,"title":"The reasoning","body":"In the presence of sunlight, chlorophyll captures energy and uses it to join carbon dioxide and water into glucose."},{"n":4,"title":"Conclusion","body":"The carbon dioxide becomes part of the glucose the plant stores as food, and oxygen is released."}]} $j$::jsonb),
  (3, 'Recall', 'Recall', 'Build lasting recall', '5 min', $j$ {"intro":"Short retrieval session. Rate each card so mytuta schedules it at the right time.","card":"What is the word equation for photosynthesis?","count":"Card 2 of 8"} $j$::jsonb),
  (4, 'Guided practice', 'Practise', 'Solve with a Step Coach', '10 min', $j$ {"question":"A plant produces 12 g of glucose. If it needs 6 units of carbon dioxide per glucose, how many units did it use?","coachSteps":[{"mark":"✓","bg":"#2e9e6b","fg":"#fff","q":"What is being asked?","hint":"You worked out that we need the units of carbon dioxide used."},{"mark":"2","bg":"#eaf5ef","fg":"#2e9e6b","q":"What do we know?","hint":"12 g of glucose, and 6 units of carbon dioxide per glucose."},{"mark":"3","bg":"#f0ece1","fg":"#b3ac9c","q":"What is the next step?","hint":"Decide what to multiply."}]} $j$::jsonb),
  (5, 'Independent practice', 'Practise', 'Solve on your own', '12 min', $j$ {"intro":"No hints this time. After each answer mytuta names the type of mistake, not just right or wrong.","items":[{"mark":"✓","bg":"#eaf5ef","fg":"#2e9e6b","text":"Name the gas plants release during photosynthesis.","level":"Foundational","hasNote":false},{"mark":"✕","bg":"#fff0eb","fg":"#c05a2e","text":"Calculate glucose produced from 24 units of carbon dioxide.","level":"Standard","hasNote":true,"note":"Method error: you added instead of dividing by 6.","noteColor":"#c05a2e"},{"mark":"✓","bg":"#eaf5ef","fg":"#2e9e6b","text":"Explain why a plant in the dark cannot photosynthesise.","level":"Standard","hasNote":false}]} $j$::jsonb),
  (6, 'Apply', 'Apply', 'Use it in the real world', '20 min', $j$ {"badges":["Mini investigation","Household materials"],"title":"Show that a plant needs light to make food","body":"Cover part of a leaf with foil for two days, then test both parts for starch. Record what you observe and explain it using what you learned about photosynthesis.","submitTypes":["Photo","Short explanation","Diagram","Data table"]} $j$::jsonb),
  (7, 'Mastery check', 'Prove', 'Prove you have it', '10 min', $j$ {"dims":[{"name":"Concept knowledge","level":"Secure","pct":82,"color":"#2e9e6b"},{"name":"Procedural fluency","level":"Developing","pct":58,"color":"#3f8fc4"},{"name":"Application","level":"Beginning","pct":34,"color":"#c47a17"},{"name":"Reasoning","level":"Secure","pct":80,"color":"#2e9e6b"}],"overall":"Developing","note":"Complete two application activities and review how glucose is produced to reach Secure."} $j$::jsonb)
) AS v(ord, name, loop_phase, description, est_time, content)
WHERE c.slug = 'photosynthesis'
ON CONFLICT (concept_id, ord) DO NOTHING;

-- ---------------------------------------------------------------------
-- Lab activities
-- ---------------------------------------------------------------------
INSERT INTO public.lab_activities (slug, category, subject, title, body, equipment, time_estimate, demonstrates, objective, materials, safety, steps, color, cat_fg, cat_bg) VALUES
  ('leaf-starch', 'Experiment', 'General Science', 'Test a leaf for starch', 'Show that light is needed for photosynthesis.', 'Household', '2 days', 'Photosynthesis needs light',
   'Prove that a leaf can only make starch in the parts that receive light.',
   $j$ ["A potted plant kept in the dark for 2 days","Aluminium foil or thick paper","Boiling water and ethanol (adult help)","Iodine solution"] $j$::jsonb,
   'Ethanol is flammable. Warm it in a cup of hot water, never over a direct flame, and ask an adult to help.',
   $j$ [{"phase":"Set up","title":"Cover part of a leaf","body":"Wrap foil over the middle of one leaf so light cannot reach it. Leave the plant in bright sunlight for a few hours."},{"phase":"Method","title":"Decolourise the leaf","body":"Remove the leaf, soften it in boiling water, then stand it in warm ethanol until the green fades to pale."},{"phase":"Observe","title":"Add iodine","body":"Rinse the leaf and drop iodine solution across it. Watch closely for where the colour changes."},{"phase":"Record","title":"Sketch what you see","body":"Draw the leaf and shade where it turned blue-black. Note which region stayed brown and why.","record":true}] $j$::jsonb,
   '#2e9e6b', '#2e9e6b', '#eaf5ef'),
  ('cooling-water', 'Data activity', 'Physics', 'Graph a cooling cup of water', 'Record temperature over time and interpret the curve.', 'Household', '40 min', 'Rate of cooling and heat transfer',
   'Record how a hot drink loses heat and read meaning from the shape of the curve.',
   $j$ ["A cup of hot water","A thermometer","A clock or phone timer","Graph paper or a device"] $j$::jsonb,
   'Handle hot water carefully and keep the cup on a stable, flat surface.',
   $j$ [{"phase":"Set up","title":"Prepare the cup","body":"Fill a cup with hot water and rest the thermometer in it without touching the base."},{"phase":"Method","title":"Take readings","body":"Record the temperature every minute for fifteen minutes. Do not stir between readings."},{"phase":"Observe","title":"Watch the trend","body":"Notice whether the temperature falls quickly at first, then more slowly, or steadily throughout."},{"phase":"Record","title":"Plot the curve","body":"Plot temperature against time and describe the shape of the line in one sentence.","record":true}] $j$::jsonb,
   '#3f8fc4', '#3f8fc4', '#eaf1f7'),
  ('paper-bridge', 'Design and build', 'Physics', 'Build a bridge from paper', 'Test how shape affects strength.', 'Classroom', '1 hr', 'Structures and forces',
   'Investigate how the shape of a beam changes how much load it can carry.',
   $j$ ["Several sheets of A4 paper","Sticky tape","Two stacks of books as supports","Coins or small weights"] $j$::jsonb,
   'Clear anything fragile from the area before you load the bridge.',
   $j$ [{"phase":"Set up","title":"Make a gap","body":"Place two stacks of books 20 cm apart to act as the supports for your bridge."},{"phase":"Method","title":"Try three shapes","body":"Fold one sheet flat, one into a tube and one into a zig-zag. Bridge the gap with each in turn."},{"phase":"Observe","title":"Load until it fails","body":"Add coins one at a time to the centre of each bridge until it bends or drops."},{"phase":"Record","title":"Compare the shapes","body":"Note how many coins each shape held and which was strongest for the same paper.","record":true}] $j$::jsonb,
   '#6b5aa8', '#6b5aa8', '#f0edf7'),
  ('conductors', 'Investigation', 'Physics', 'Which materials conduct?', 'Sort household items by conductivity.', 'Household', '30 min', 'Conductors and insulators',
   'Sort everyday objects by whether they let electricity flow.',
   $j$ ["A small battery","A bulb and holder","Connecting wires","Objects to test: spoon, key, eraser, coin, plastic"] $j$::jsonb,
   'Use only a low-voltage battery. Never test mains sockets or wall plugs.',
   $j$ [{"phase":"Set up","title":"Build a test circuit","body":"Connect the battery and bulb, leaving a gap in the circuit where a test object will go."},{"phase":"Method","title":"Test each object","body":"Bridge the gap with each object in turn and watch the bulb."},{"phase":"Observe","title":"Watch the bulb","body":"Note which objects make the bulb light and which leave it dark."},{"phase":"Record","title":"Sort your results","body":"Group the objects into conductors and insulators, and look for a pattern in the materials.","record":true}] $j$::jsonb,
   '#c47a17', '#c47a17', '#fff7e9'),
  ('circuit-sim', 'Simulation', 'Physics', 'Model a simple circuit', 'Change resistance and watch current respond.', 'Device', '25 min', 'Current, voltage and resistance',
   'See how changing the resistance in a circuit changes the current that flows.',
   $j$ ["A phone, tablet or computer","The mytuta circuit simulator"] $j$::jsonb,
   'None needed. This activity runs safely on your device.',
   $j$ [{"phase":"Set up","title":"Build the circuit","body":"Open the simulator and connect a battery, a bulb and a resistor in a loop."},{"phase":"Method","title":"Change resistance","body":"Increase the resistance in small steps and read the ammeter after each change."},{"phase":"Observe","title":"Watch the current","body":"Notice how the current responds every time you raise the resistance."},{"phase":"Record","title":"State the pattern","body":"Write one sentence describing the link between resistance and current.","record":true}] $j$::jsonb,
   '#2e9e6b', '#2e9e6b', '#eaf5ef'),
  ('times-table', 'Coding', 'Mathematics', 'Automate a times table', 'Write a short loop that prints a pattern.', 'Device', '35 min', 'Loops and sequences',
   'Write a short program that prints a times table using a loop.',
   $j$ ["A device with the mytuta code editor"] $j$::jsonb,
   'None needed.',
   $j$ [{"phase":"Set up","title":"Start a project","body":"Open the code editor and create a new, empty project."},{"phase":"Method","title":"Write a loop","body":"Write a loop that counts from 1 to 12 and multiplies each number by 7."},{"phase":"Observe","title":"Run and check","body":"Run your program and compare the output line by line with the real times table."},{"phase":"Record","title":"Change one thing","body":"Swap the 7 for another number and note what stays the same in your code.","record":true}] $j$::jsonb,
   '#3f8fc4', '#3f8fc4', '#eaf1f7')
ON CONFLICT (slug) DO NOTHING;

-- ---------------------------------------------------------------------
-- Challenges (platform-owned; created_by NULL)
-- ---------------------------------------------------------------------
INSERT INTO public.challenges (slug, type, scope, mode, timeline, accent, fg, bg, title, body, brief, stages, is_featured) VALUES
  ('clean-water', 'Design challenge', 'Pan-African', 'Solo or team', '3 weeks', '#6b5aa8', '#6b5aa8', '#f0edf7',
   'Clean Water: design a low-cost filter for your community', 'Design a low-cost water filter using materials people can find nearby.',
   'Millions of people collect water that is not safe to drink. Design and model a filter that removes dirt and makes water clearer, using only materials that are easy to find where you live.',
   $j$ [{"name":"Understand","goal":"Frame the problem","task":"Describe who needs cleaner water near you and what makes their water unsafe. List the filtering materials that are easy to find nearby."},{"name":"Design","goal":"Plan a solution","task":"Sketch your filter and label each layer. Explain what each material is meant to remove and why you chose it."},{"name":"Build","goal":"Make and test","task":"Build a model of your filter, pour in dirty water and record how clear the water looks coming out."},{"name":"Present","goal":"Share your reasoning","task":"Explain your design, your results and one change you would make. Upload a photo or a short recording."}] $j$::jsonb,
   true),
  ('fractions-sprint', 'Knowledge sprint', 'Personal', 'Solo', '5 min', '#2e9e6b', '#2e9e6b', '#eaf5ef',
   'Fractions rapid round', '20 timed questions to sharpen your speed.',
   'Twenty timed questions on fractions. Answer as many as you can before the timer runs out, then see exactly where your speed slows down.',
   $j$ [{"name":"Warm up","goal":"Get ready","task":"Try three practice questions with no timer to bring the method back to mind."},{"name":"Sprint","goal":"Beat the clock","task":"Answer twenty questions in five minutes. Skip and return to anything that slows you down."},{"name":"Review","goal":"Learn from it","task":"See which questions you missed. mytuta names the type of slip so you can fix the cause."}] $j$::jsonb,
   false),
  ('energy-lamp', 'Design challenge', 'Class', 'Team · Mrs Mensah', 'This term', '#6b5aa8', '#6b5aa8', '#f0edf7',
   'Design an energy-saving lamp', 'Sketch and explain a low-power lighting idea.',
   'Design a low-power lamp that a family could actually use at home. It should give useful light while using as little energy as possible.',
   $j$ [{"name":"Understand","goal":"Frame the need","task":"Describe when and why families near you need light, and what limits the power they can use."},{"name":"Design","goal":"Sketch it","task":"Sketch your lamp and label how each part helps it save energy."},{"name":"Build","goal":"Model it","task":"Describe or model how your lamp would be made from parts people can get."},{"name":"Present","goal":"Pitch it","task":"Present your idea to the class and explain the energy it would save."}] $j$::jsonb,
   false),
  ('school-water', 'Data challenge', 'School', 'Team', 'This term', '#3f8fc4', '#3f8fc4', '#eaf1f7',
   'Analyse your school water use', 'Collect data and propose one saving.',
   'Find out how much water your school uses and where, then propose one realistic change that would save water.',
   $j$ [{"name":"Understand","goal":"Find the sources","task":"Find out where your school uses the most water across a normal day."},{"name":"Collect","goal":"Gather data","task":"Measure or estimate water use over one week and record it clearly."},{"name":"Analyse","goal":"Read the data","task":"Turn your data into a chart and identify the single biggest source of use."},{"name":"Propose","goal":"Recommend","task":"Recommend one change and estimate how much water it would save."}] $j$::jsonb,
   false),
  ('bridge-load', 'Build challenge', 'Regional', 'Team · West Africa', '2 weeks', '#c47a17', '#c47a17', '#fff7e9',
   'Strongest bridge, least material', 'Build, test and record your load.',
   'Build a bridge that holds the most weight using the least material. Your score is the load it carries divided by the material you used.',
   $j$ [{"name":"Understand","goal":"Study loads","task":"Study how the shape of a beam decides how much load it can carry."},{"name":"Design","goal":"Plan it","task":"Plan your bridge and predict where it is most likely to fail."},{"name":"Build","goal":"Test it","task":"Construct your bridge and load it until it fails, noting the maximum weight."},{"name":"Record","goal":"Submit","task":"Submit your load-to-material ratio with a photo of the test."}] $j$::jsonb,
   false),
  ('market-route', 'Problem solving', 'Personal', 'Solo', '30 min', '#2e9e6b', '#2e9e6b', '#eaf5ef',
   'Plan a market delivery route', 'Use ratios and distance to save time.',
   'Use ratios and distances to plan the fastest route for delivering goods around a local market with several stops.',
   $j$ [{"name":"Understand","goal":"Map the stops","task":"List every stop and the distance between each pair."},{"name":"Plan","goal":"Choose a route","task":"Work out a route and justify the order using your distances."},{"name":"Check","goal":"Compare","task":"Compare your route with one alternative and explain which is faster and why."}] $j$::jsonb,
   false),
  ('learning-tool', 'Design challenge', 'Pan-African', 'Team', 'Continental', '#6b5aa8', '#6b5aa8', '#f0edf7',
   'Accessible learning tool', 'Design something that helps a peer learn.',
   'Design something, a tool, a game or a method, that helps a peer learn a topic they find hard.',
   $j$ [{"name":"Understand","goal":"Choose a peer","task":"Choose a peer and describe clearly what they find difficult."},{"name":"Design","goal":"Plan the tool","task":"Plan your tool and explain exactly how it makes the topic easier."},{"name":"Build","goal":"Make it","task":"Make a first version or a clear mock-up of your idea."},{"name":"Present","goal":"Show it","task":"Show how a peer would use it and what improved for them."}] $j$::jsonb,
   false)
ON CONFLICT (slug) DO NOTHING;
