-- Expand Labs to 20 and Challenges to 10 across all STEM subjects.
-- Idempotent via ON CONFLICT (slug) DO NOTHING.

-- Add concept_id FK to lab_activities if not already present (for concept-lab linking).
ALTER TABLE public.lab_activities
  ADD COLUMN IF NOT EXISTS concept_id uuid REFERENCES public.concepts(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS difficulty text;

-- =====================================================================
-- LABS (20 total — seeding 19 new + 1 already exists: leaf-starch)
-- =====================================================================
INSERT INTO public.lab_activities
  (slug, category, subject, title, body, equipment, time_estimate, demonstrates, objective, materials, safety, steps, color, cat_fg, cat_bg, difficulty)
VALUES

-- BIOLOGY
('photosynthesis-rate', 'Experiment', 'Biology',
 'Measure the rate of photosynthesis',
 'Investigate how light intensity affects the rate of oxygen produced by pondweed.',
 'Household', '45 min', 'Light intensity affects photosynthesis rate',
 'Count oxygen bubbles produced by pondweed at different distances from a lamp.',
 '["Pondweed (Elodea or similar water plant)","Lamp","Ruler","Beaker of water","Stopwatch"]'::jsonb,
 'Use a lamp that does not get too hot. Keep water at room temperature.',
 '[{"n":1,"step":"Place pondweed in a beaker of water near a lamp."},{"n":2,"step":"Count bubbles per minute at distances of 5, 10, 20, and 30 cm."},{"n":3,"step":"Record results in a table and plot a graph."},{"n":4,"step":"Describe the relationship between distance and bubble rate."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('dna-extraction', 'Investigation', 'Biology',
 'Extract DNA from a strawberry',
 'Use household materials to extract visible strands of DNA from fruit.',
 'Household', '30 min', 'DNA is found in cells',
 'Demonstrate that DNA can be extracted from plant cells using simple chemical methods.',
 '["Strawberry (fresh or frozen)","Salt","Washing-up liquid","Cold surgical spirit (70%+ alcohol)","Zip-lock bag","Coffee filter or cloth","Glass"]'::jsonb,
 'Keep alcohol away from flames. Adult supervision recommended.',
 '[{"n":1,"step":"Crush the strawberry in the zip-lock bag with 1 tsp salt and 2 tsp washing-up liquid."},{"n":2,"step":"Filter the liquid through a coffee filter into a glass."},{"n":3,"step":"Slowly pour cold alcohol down the side of the glass."},{"n":4,"step":"Wait 2 minutes — white stringy DNA will appear at the alcohol layer."},{"n":5,"step":"Describe what you observe and explain why alcohol was needed."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('ecology-quadrat', 'Field Study', 'Biology',
 'Ecology quadrat survey',
 'Use a quadrat to estimate the population of a plant species in an area.',
 'Outdoor', '40 min', 'Sampling methods in ecology',
 'Estimate the abundance and distribution of a chosen plant species using random quadrats.',
 '["4 sticks and string (or a 1 m² wire frame)","Measuring tape","Recording sheet","Camera (optional)"]'::jsonb,
 'Wear appropriate footwear. Be aware of plants that cause skin irritation.',
 '[{"n":1,"step":"Mark out a 20×20 m study area."},{"n":2,"step":"Use random number coordinates to place your quadrat 5 times."},{"n":3,"step":"Count the number of the chosen plant species inside each quadrat."},{"n":4,"step":"Calculate the mean count and estimate the total population."},{"n":5,"step":"Record the percentage cover using the DAFOR scale."}]'::jsonb,
 '#3f8fc4', '#1c4f72', '#e6f1fb', 'extension'),

-- CHEMISTRY
('acids-bases-indicators', 'Experiment', 'Chemistry',
 'Test household liquids with natural indicators',
 'Make a red cabbage indicator and test common household liquids.',
 'Household', '45 min', 'pH and acid-base properties',
 'Classify household liquids as acids, alkalis, or neutral using a natural indicator.',
 '["Red cabbage","Water","White vinegar","Lemon juice","Bicarbonate of soda solution","Milk","Soap solution","Glass cups or clear containers"]'::jsonb,
 'Do not mix bleach with vinegar or other liquids. Avoid skin contact with strong alkalis.',
 '[{"n":1,"step":"Boil red cabbage in water for 10 minutes. Let the purple liquid cool — this is your indicator."},{"n":2,"step":"Pour equal amounts of the indicator into separate cups."},{"n":3,"step":"Add a small amount of each test liquid to a separate cup."},{"n":4,"step":"Record the colour change: red/pink = acid, green/yellow = alkali, purple = neutral."},{"n":5,"step":"Arrange the liquids in order from most acidic to most alkaline."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'core'),

('rates-temperature', 'Experiment', 'Chemistry',
 'Effect of temperature on reaction rate',
 'Investigate how temperature affects the rate of a sodium thiosulfate and hydrochloric acid reaction.',
 'School lab', '50 min', 'Temperature increases reaction rate',
 'Measure the time for a cross to disappear as temperature increases.',
 '["Sodium thiosulfate solution (0.1 mol/l)","Dilute hydrochloric acid (1 mol/l)","Thermometer","Water baths or beakers","Stopwatch","Paper with a cross drawn on it","Conical flask"]'::jsonb,
 'Wear eye protection. The sulfur dioxide produced is irritating — do in a well-ventilated area.',
 '[{"n":1,"step":"Set up the sodium thiosulfate solution at 20°C, 30°C, 40°C, 50°C and 60°C using water baths."},{"n":2,"step":"Pour 25 cm³ of sodium thiosulfate into the conical flask over the cross."},{"n":3,"step":"Add 5 cm³ of HCl and start the stopwatch immediately."},{"n":4,"step":"Stop timing when you can no longer see the cross through the cloudy mixture."},{"n":5,"step":"Plot a graph of 1/time against temperature. What pattern do you see?"}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'extension'),

('electrolysis-copper', 'Experiment', 'Chemistry',
 'Electrolysis of copper sulfate',
 'Use electrolysis to deposit copper onto a carbon electrode.',
 'School lab', '40 min', 'Electrolysis and ionic compounds',
 'Observe how copper deposits at the cathode during electrolysis of copper sulfate solution.',
 '["Copper sulfate solution","Two carbon or copper electrodes","Battery (4.5 V or two 1.5 V cells in series)","Connecting wires","Beaker"]'::jsonb,
 'Wear eye protection. Copper sulfate is harmful if swallowed.',
 '[{"n":1,"step":"Connect the electrodes to the battery with the carbon rods submerged in copper sulfate solution."},{"n":2,"step":"Observe both electrodes after 5 minutes."},{"n":3,"step":"Note the colour and texture of the deposit on the cathode (-)."},{"n":4,"step":"What happens at the anode (+)? Explain using your knowledge of ions."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'extension'),

-- PHYSICS
('forces-spring-balance', 'Experiment', 'Physics',
 'Investigate Hooke law with a spring',
 'Measure how a spring extends when different masses are added.',
 'School lab', '40 min', 'Force and extension in a spring',
 'Plot a force-extension graph and determine the spring constant.',
 '["Spring","Newton meter or 100 g masses","Ruler","Clamp stand","Paper and pencil"]'::jsonb,
 'Do not exceed the elastic limit of the spring.',
 '[{"n":1,"step":"Set up the spring vertically on a clamp stand. Record the natural length."},{"n":2,"step":"Add masses in 100 g increments up to 500 g, recording the extension each time."},{"n":3,"step":"Plot force (N) on the x-axis and extension (m) on the y-axis."},{"n":4,"step":"Determine if the graph is linear. Calculate the spring constant k = F/x for the linear region."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'core'),

('electricity-circuits', 'Experiment', 'Physics',
 'Series and parallel circuits',
 'Build series and parallel circuits and compare their behaviour.',
 'School lab', '45 min', 'Series and parallel circuit properties',
 'Measure voltage and current in series and parallel circuits to verify Kirchhoff rules.',
 '["Two light bulbs with holders","Battery pack (4.5 V)","Connecting wires","Voltmeter","Ammeter"]'::jsonb,
 'Use batteries only — mains electricity is dangerous.',
 '[{"n":1,"step":"Connect both bulbs in series. Measure the current through each bulb and voltage across each."},{"n":2,"step":"Connect both bulbs in parallel. Repeat the measurements."},{"n":3,"step":"Record the brightness of bulbs in each circuit. Explain the difference using V = IR."},{"n":4,"step":"What happens to one bulb when the other is removed in each circuit?"}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'core'),

('optics-mirror', 'Experiment', 'Physics',
 'Reflection and refraction of light',
 'Trace rays to investigate the laws of reflection and measure refractive index.',
 'School lab', '40 min', 'Reflection and refraction of light',
 'Verify the law of reflection and calculate the refractive index of glass.',
 '["Ray box and single slit","Plane mirror","Glass block","Protractor","Plain paper","Ruler","Pencil"]'::jsonb,
 'Do not look directly into the ray box.',
 '[{"n":1,"step":"Place the mirror on paper. Shine a ray at 30°, 45°, and 60° to the normal. Measure the angle of reflection each time."},{"n":2,"step":"Replace the mirror with a glass block. Shine a ray in and trace both the incident ray and the refracted ray."},{"n":3,"step":"Measure angles of incidence and refraction. Calculate sin i / sin r for each."},{"n":4,"step":"Is the ratio constant? This is the refractive index."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'extension'),

-- GENERAL SCIENCE / SCIENTIFIC PRACTICE
('variables-experiment', 'Design', 'Science',
 'Design a fair test',
 'Plan and conduct an experiment controlling variables.',
 'Household', '50 min', 'Variables and fair test design',
 'Design an experiment to test one factor affecting how quickly sugar dissolves.',
 '["Sugar","Water","Cups","Thermometer","Stopwatch","Measuring spoon"]'::jsonb,
 'Wash hands after handling materials.',
 '[{"n":1,"step":"Identify: independent variable (e.g. water temperature), dependent variable (time to dissolve), control variables (amount of water, amount of sugar, stirring)."},{"n":2,"step":"Write a hypothesis: if I increase water temperature, then sugar will dissolve faster because..."},{"n":3,"step":"Conduct 3 trials at each temperature and record results."},{"n":4,"step":"Calculate mean time for each temperature. Plot a graph. Evaluate whether results support your hypothesis."}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'core'),

('data-graphing', 'Data Activity', 'Science',
 'Collect and graph local weather data',
 'Collect temperature or rainfall data and represent it graphically.',
 'Household', '30 min', 'Data collection and graphing',
 'Record daily temperature for one week and produce a line graph with analysis.',
 '["Thermometer","Ruler and graph paper (or phone for digital version)","Pencil"]'::jsonb,
 'No safety issues.',
 '[{"n":1,"step":"Record the temperature at the same time each day for 7 days. Note the day, time, and reading."},{"n":2,"step":"Draw a line graph: time on x-axis, temperature on y-axis."},{"n":3,"step":"Calculate the mean, maximum, and minimum temperature."},{"n":4,"step":"Write two conclusions from your graph."}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation'),

-- NO-EQUIPMENT ACTIVITIES
('observation-journal', 'Observation', 'Science',
 'Scientific observation journal',
 'Develop observation skills by recording a natural process over several days.',
 'Household', '10 min per day x 5 days', 'Observation and scientific recording',
 'Observe and record a natural process such as seed germination or mould growth, using accurate scientific language.',
 '["Any seed or food item to observe","Paper or notebook","Pencil or phone for photos"]'::jsonb,
 'Wash hands after handling seeds or mould.',
 '[{"n":1,"step":"Choose a subject: germinating a bean seed in damp cotton wool, or a piece of bread on a plate."},{"n":2,"step":"Each day, record: date, observation (size, colour, smell, change), a sketch or photo."},{"n":3,"step":"After 5 days, write a summary: what changed, what stayed the same, and why."},{"n":4,"step":"Identify one controlled variable and explain how you kept it constant."}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation'),

('pattern-recognition', 'Data Activity', 'Mathematics',
 'Find patterns in number sequences',
 'Identify arithmetic and geometric sequences in real data sets.',
 'No equipment needed', '25 min', 'Pattern recognition in sequences',
 'Identify the rule in number sequences and predict the next terms.',
 '[]'::jsonb,
 'No safety issues.',
 '[{"n":1,"step":"Look at: 2, 5, 8, 11, … — what is the rule? Write the next 3 terms."},{"n":2,"step":"Look at: 3, 6, 12, 24, … — is this arithmetic or geometric? Find the nth term."},{"n":3,"step":"Create your own sequence using a rule. Give it to a classmate to decode."},{"n":4,"step":"Collect 5 real-world sequences (phone credit top-up offers, market price changes) and identify the pattern."}]'::jsonb,
 '#e8a020', '#633806', '#fef3e2', 'core'),

('practical-thinking-bridge', 'Design Challenge', 'Science',
 'Build the strongest bridge from paper',
 'Engineer a bridge from one sheet of paper that holds the most weight.',
 'Household', '30 min', 'Engineering design and forces',
 'Apply knowledge of forces to design a structure that maximises load capacity.',
 '["One sheet of A4 paper","Scissors","Tape or glue","Small objects for weights (coins, sugar sachets)"]'::jsonb,
 'No safety issues.',
 '[{"n":1,"step":"You have only one sheet of A4. You may fold, cut, and tape it. You cannot use extra paper."},{"n":2,"step":"Build a bridge to span a 15 cm gap between two books."},{"n":3,"step":"Test it by adding coins one at a time. Record how many before it collapses."},{"n":4,"step":"Redesign and test again. Explain why your second design performed differently."}]'::jsonb,
 '#e8a020', '#633806', '#fef3e2', 'core'),

-- THREE MORE TO REACH 20 (including the already-seeded leaf-starch counted as 1)
('fermentation-yeast', 'Experiment', 'Biology',
 'Yeast fermentation: effect of sugar concentration',
 'Investigate how sugar concentration affects the volume of CO₂ produced by yeast.',
 'Household', '45 min', 'Anaerobic respiration in yeast',
 'Measure gas production as evidence of fermentation at different sugar concentrations.',
 '["Dried yeast","Sugar","Warm water (around 35°C)","Balloons","Empty plastic bottles","Measuring spoons","Ruler"]'::jsonb,
 'Do not heat to boiling. Keep water warm but not hot.',
 '[{"n":1,"step":"Label 3 bottles: 1 tsp, 2 tsp, 3 tsp sugar."},{"n":2,"step":"Add 200 ml warm water and the labelled amount of sugar to each. Add 1 tsp yeast and mix briefly."},{"n":3,"step":"Stretch a balloon over each bottle opening."},{"n":4,"step":"After 30 minutes, measure the circumference of each balloon."},{"n":5,"step":"Which bottle produced the most gas? Explain using the fermentation equation."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('motion-timing-ramp', 'Experiment', 'Physics',
 'Acceleration on a slope',
 'Time a ball rolling down ramps of different angles and calculate acceleration.',
 'Household', '40 min', 'Acceleration and inclined planes',
 'Measure how angle affects acceleration using timing and distance measurements.',
 '["Long flat board (ramp)","Textbooks to raise one end","Ball or marble","Stopwatch","Ruler or tape measure","Calculator"]'::jsonb,
 'Ensure the ramp cannot fall. Work on a clear, flat floor.',
 '[{"n":1,"step":"Set the ramp at 10° by raising one end with books. Measure the length of the ramp."},{"n":2,"step":"Release the ball from the top. Time how long it takes to reach the bottom. Repeat 3 times."},{"n":3,"step":"Use s = ½at² to calculate acceleration (rearrange to a = 2s/t²)."},{"n":4,"step":"Repeat at 20° and 30°. Plot angle vs acceleration."},{"n":5,"step":"How does angle affect acceleration? Is this what Newton second law predicts?"}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'extension'),

('household-chemistry-clean', 'Investigation', 'Chemistry',
 'Investigate cleaning agents as acids and alkalis',
 'Compare the effectiveness of an acidic cleaner (vinegar) vs an alkaline cleaner (bicarbonate of soda) on different stains.',
 'Household', '35 min', 'Acids and alkalis in everyday chemistry',
 'Apply acid-base chemistry to evaluate which cleaner works best on different household stains.',
 '["White vinegar","Bicarbonate of soda","Water","Tomato sauce stain","Grease stain","Rust stain (if available)","White cloth or paper towels","Universal indicator paper"]'::jsonb,
 'Avoid contact with eyes. Work in a ventilated space.',
 '[{"n":1,"step":"Test each cleaner with universal indicator paper. Record the pH."},{"n":2,"step":"Apply each cleaner to the same type of stain on separate pieces of cloth. Leave for 2 minutes then rinse."},{"n":3,"step":"Rate cleaning effectiveness on a 1–5 scale."},{"n":4,"step":"Explain which cleaner worked better for each stain in terms of its acid-base chemistry."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'core')

ON CONFLICT (slug) DO NOTHING;


-- =====================================================================
-- CHALLENGES (10 total)
-- =====================================================================
INSERT INTO public.challenges
  (slug, type, scope, title, body, brief, stages, is_featured, accent, fg, bg)
VALUES

('algebra-speed-sprint', 'Knowledge Sprint', 'Personal',
 'Algebra Speed Sprint',
 'Solve 20 linear equations in 10 minutes. Beat your own best time.',
 'Race the clock through 20 linear equations. Each correct answer in under 30 seconds earns a bonus point.',
 '[{"stage":1,"title":"Warm-up","desc":"5 one-step equations","time":"2 min"},{"stage":2,"title":"Core","desc":"10 two-step equations","time":"5 min"},{"stage":3,"title":"Sprint","desc":"5 equations with brackets","time":"3 min"}]'::jsonb,
 true, '#2e9e6b', '#1f5c3f', '#e5f5ed'),

('science-facts-blitz', 'Knowledge Sprint', 'Personal',
 'STEM Facts Blitz',
 'How many STEM facts can you recall correctly in 5 minutes?',
 '50 rapid-fire questions across Biology, Chemistry, and Physics. Score your accuracy and review every wrong answer.',
 '[{"stage":1,"title":"Biology","desc":"15 facts","time":"90 sec"},{"stage":2,"title":"Chemistry","desc":"20 facts","time":"2 min"},{"stage":3,"title":"Physics","desc":"15 facts","time":"90 sec"}]'::jsonb,
 false, '#3f8fc4', '#1c4f72', '#e6f1fb'),

('units-conversion-sprint', 'Knowledge Sprint', 'Class',
 'Units and Measurement Sprint',
 'Convert between metric units across all STEM subjects. Speed and accuracy both count.',
 'A class-wide sprint: every student attempts the same 25 unit conversion questions. Class leaderboard at the end.',
 '[{"stage":1,"title":"Length and mass","desc":"10 questions"},{"stage":2,"title":"Volume and density","desc":"8 questions"},{"stage":3,"title":"Speed and energy","desc":"7 questions"}]'::jsonb,
 false, '#e8a020', '#633806', '#fef3e2'),

('bridge-design-challenge', 'Design Challenge', 'Class',
 'Bridge Design Challenge',
 'Design and test a bridge from limited materials. The strongest design wins.',
 'Each team uses the same materials: 10 sticks, 1 sheet of paper, and tape. The bridge must span 20 cm and hold the most weight.',
 '[{"stage":1,"title":"Design","desc":"Plan your bridge structure — sketch three options and choose one.","time":"15 min"},{"stage":2,"title":"Build","desc":"Construct your bridge with only the provided materials.","time":"20 min"},{"stage":3,"title":"Test","desc":"Load the bridge. Record the maximum load before failure.","time":"5 min"},{"stage":4,"title":"Review","desc":"Explain which forces acted on your bridge and why it succeeded or failed.","time":"10 min"}]'::jsonb,
 true, '#c47a17', '#6b3f00', '#fef3e2'),

('solar-cooker-design', 'Design Challenge', 'Class',
 'Solar Cooker Design Challenge',
 'Build a solar cooker from household materials that reaches the highest temperature.',
 'Use cardboard, foil, plastic wrap, and black paper. The team whose cooker reaches the highest temperature after 15 minutes in sunlight wins.',
 '[{"stage":1,"title":"Research","desc":"Sketch a parabolic or box design. Identify which material reflects and which absorbs heat best."},{"stage":2,"title":"Build","desc":"Construct from allowed materials only."},{"stage":3,"title":"Test","desc":"Place in sunlight for 15 minutes with a thermometer inside."},{"stage":4,"title":"Evaluate","desc":"Compare temperatures. Which design choices made the biggest difference?"}]'::jsonb,
 false, '#e8a020', '#633806', '#fef3e2'),

('population-data-challenge', 'Data Challenge', 'Class',
 'Population Data Analysis',
 'Analyse a real Ghanaian population dataset and draw conclusions.',
 'Use the Ghana Statistical Service data on district populations. Calculate growth rates, identify trends, and present findings.',
 '[{"stage":1,"title":"Load the data","desc":"Review the district population table for 2010 and 2021."},{"stage":2,"title":"Calculate","desc":"Find the percentage change for 5 districts. Identify the fastest growing."},{"stage":3,"title":"Graph","desc":"Plot population vs year for 3 districts on the same axes."},{"stage":4,"title":"Interpret","desc":"Write 3 conclusions and one question you would want to investigate further."}]'::jsonb,
 false, '#9b59b6', '#5c2d91', '#f3e8ff'),

('reaction-rates-data', 'Data Challenge', 'Class',
 'Compare Reaction Rates',
 'Analyse experimental data from a rates-of-reaction investigation and explain the results.',
 'You are given data from three experiments varying temperature, concentration, and surface area for a calcium carbonate reaction. Calculate rates and explain patterns.',
 '[{"stage":1,"title":"Calculate rate","desc":"Rate = 1/time for each experiment. Organise data in a table."},{"stage":2,"title":"Plot","desc":"Draw three separate graphs, one per variable."},{"stage":3,"title":"Compare","desc":"Which variable produced the greatest change in rate?"},{"stage":4,"title":"Explain","desc":"Use collision theory to explain all three results."}]'::jsonb,
 false, '#c47a17', '#6b3f00', '#fef3e2'),

('hypothesis-plants', 'Scientific Investigation', 'Class',
 'Test a Hypothesis: What Do Plants Need?',
 'Design and run a 5-day experiment to test one condition plants need for growth.',
 'Your team chooses one variable: light, water, or soil. Set up a controlled experiment and record results daily.',
 '[{"stage":1,"title":"Hypothesis","desc":"State: if we remove [variable], then the plant will... because..."},{"stage":2,"title":"Setup","desc":"Plant identical seeds in identical conditions. Change only your chosen variable."},{"stage":3,"title":"Observe","desc":"Record height, colour, and health daily for 5 days."},{"stage":4,"title":"Conclude","desc":"Was your hypothesis supported? What would you change in a follow-up experiment?"}]'::jsonb,
 true, '#2e9e6b', '#1f5c3f', '#e5f5ed'),

('local-temperature-investigation', 'Scientific Investigation', 'School',
 'Map Temperature Differences Across Your School',
 'Investigate how temperature varies in different parts of your school building and grounds.',
 'Use a thermometer to map temperature at 10+ locations. Identify patterns and explain using heat transfer principles.',
 '[{"stage":1,"title":"Plan","desc":"Choose 10 locations: sunny, shaded, inside, outside. Record each location description."},{"stage":2,"title":"Measure","desc":"Record temperature at each location at the same time of day for 3 days."},{"stage":3,"title":"Map","desc":"Draw a floor plan and mark temperatures on it. Shade hottest zones red, coolest blue."},{"stage":4,"title":"Explain","desc":"Use conduction, convection, and radiation to explain at least 3 of your findings."}]'::jsonb,
 false, '#185fa5', '#0c3d71', '#e6f1fb'),

('multistep-word-problems', 'Problem-Solving Challenge', 'Personal',
 'Multi-Step Word Problem Set',
 '10 real-world STEM problems that require more than one step to solve.',
 'Each problem takes a real Ghanaian scenario and requires at least two mathematical or scientific steps. Work through all 10.',
 '[{"n":1,"problem":"Kofi buys 4.5 kg of rice at GHS 8 per kg and 2 litres of oil at GHS 18 per litre. He pays with GHS 80. What change does he receive?"},{"n":2,"problem":"A compound has 10 rooms of 4×5 m each. What total area does the compound cover?"},{"n":3,"problem":"A tro-tro travels at 60 km/h. The journey is 135 km. How long does the journey take in hours and minutes?"},{"n":4,"problem":"A solar panel generates 400 W. It runs for 6 hours per day. How many kWh does it produce per week?"},{"n":5,"problem":"Ama invests GHS 2000 at 8% simple interest per year for 3 years. How much interest does she earn?"}]'::jsonb,
 true, '#e8a020', '#633806', '#fef3e2')

ON CONFLICT (slug) DO NOTHING;
