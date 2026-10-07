-- Flagship Labs: 5 fully authored lab activities for the MVP experience upgrade.
-- Each row stores the extended content object in the `content` jsonb column alongside
-- the existing flat fields. The renderer reads `content` for mission, prediction,
-- reflection, whatThisProves, skillTags, and the enriched step fields (watchFor, thinkingPrompt).

-- Add extended content column if it doesn't exist yet.
alter table lab_activities add column if not exists content jsonb default '{}'::jsonb;
alter table challenges add column if not exists content jsonb default '{}'::jsonb;

-- Clear any previous thin placeholder labs for these 5 slugs so we can replace cleanly.
delete from lab_activities where slug in (
  'density-investigation',
  'photosynthesis-experiment',
  'simple-circuits',
  'forces-paper-bridge',
  'cooling-temperature-data'
);

-- 1. DENSITY INVESTIGATION
insert into lab_activities (
  slug, title, body, category, cat_fg, cat_bg, color,
  subject, difficulty, team_mode, equipment, time_estimate,
  objective, demonstrates, materials, safety, steps,
  dimensions, content
) values (
  'density-investigation',
  'Density Investigation',
  'Use water, a ruler, and a kitchen scale to find out why some objects float and others sink.',
  'Physics', '#185FA5', '#E6F1FB', '#185FA5',
  'Physics', 'Core', 'Solo or pairs', 'Household', '25 minutes',
  'Calculate the density of three objects and use that to predict whether each will float in water.',
  'density, measurement, and scientific reasoning',
  '["Kitchen scale or balance","Ruler (30 cm)","3 small solid objects (e.g. stone, wood block, soap bar)","Bucket or large bowl of water","Notebook and pen"]',
  'Dry your hands before using the scale. Do not submerge the scale. Keep water away from notebooks.',
  '[
    {"phase":"Predict","title":"What will happen?","body":"Look at your three objects. Without testing them, rank them from most dense to least dense. Write down your prediction and the reason for each ranking.","record":true,"thinkingPrompt":"What clues can you use to estimate density before you measure anything?"},
    {"phase":"Measure","title":"Find the mass","body":"Place each object on the scale one at a time. Record its mass in grams in your notebook.","record":true,"watchFor":"Check that the scale reads zero before each object. If you have no scale, estimate using water displacement volume and the formula density = mass/volume."},
    {"phase":"Measure","title":"Find the volume","body":"Use the ruler to measure the length, width, and height of each object in centimetres. Calculate volume using $V = l \\times w \\times h$. Record the volume in cm³.","record":true,"thinkingPrompt":"Volume for a rectangular solid is straightforward. What would you do if the object had an irregular shape?"},
    {"phase":"Calculate","title":"Work out the density","body":"Use the formula $\\rho = \\frac{m}{V}$ to find the density of each object. Record your answers in g/cm³.","record":true,"watchFor":"Water has a density of $1 \\text{ g/cm}^3$. Any object denser than $1 \\text{ g/cm}^3$ will sink. Anything less dense will float."},
    {"phase":"Test","title":"Float or sink?","body":"Place each object gently into the bucket of water. Observe what happens. Record whether each object floats or sinks.","record":true,"watchFor":"Watch carefully — some objects partially submerge before settling. Note the position of the waterline."},
    {"phase":"Conclude","title":"Explain the result","body":"Compare your floating and sinking results against the densities you calculated. Write one sentence explaining the relationship between density and floating.","record":true,"thinkingPrompt":"Did your results match your prediction? If any object surprised you, what might explain the difference?"}
  ]',
  '["Measurement","Scientific Reasoning","Calculation","Data Interpretation"]',
  '{
    "mission": "Why do some objects float while others sink in the same water?",
    "predictionPrompt": "Before you measure anything: rank these three objects from most dense to least dense, and explain what clues you used to make that call.",
    "reflectionPrompts": [
      "What did this experiment show you about the connection between density and floating?",
      "Was there anything that surprised you in your results?",
      "If you could improve this experiment, what would you change and why?"
    ],
    "whatThisProves": "Your measurements show that density (mass divided by volume) determines whether an object floats. Objects denser than water ($1 \\text{ g/cm}^3$) sink; those less dense float. This is the same principle that explains why ships made of steel can float: their hollow shape makes their average density less than water.",
    "skillTags": ["Measurement","Calculation","Scientific Reasoning","Application"],
    "conceptSlug": "density",
    "conceptName": "Density"
  }'
);

-- 2. PHOTOSYNTHESIS EXPERIMENT
insert into lab_activities (
  slug, title, body, category, cat_fg, cat_bg, color,
  subject, difficulty, team_mode, equipment, time_estimate,
  objective, demonstrates, materials, safety, steps,
  dimensions, content
) values (
  'photosynthesis-experiment',
  'Photosynthesis Experiment',
  'Use a green leaf and a torch to see how light intensity changes the rate of oxygen production.',
  'Biology', '#085041', '#E1F5EE', '#1D9E75',
  'Biology', 'Core', 'Pairs', 'Household', '30 minutes',
  'Observe and record how changing the distance of a light source affects the bubbling rate of an aquatic plant or leaf.',
  'photosynthesis, light energy, and oxygen production',
  '["Green aquatic plant or fresh spinach leaf","Clear glass or jar of water","Torch or phone flashlight","Ruler","Notebook and pen","Optional: bicarbonate of soda (a small pinch speeds up bubbling)"]',
  'Do not shine the torch directly into your eyes. Keep water away from electrical devices. Handle leaves gently.',
  '[
    {"phase":"Set up","title":"Prepare your plant","body":"Place the green leaf or aquatic plant in the jar of water. If using spinach, make a small cut across the stem end. Position the jar on a table with nothing else around it blocking the light.","watchFor":"The leaf should be fully submerged. If it floats, weigh it down with a small stone or clip."},
    {"phase":"Predict","title":"What do you expect?","body":"Shine the torch from 5 cm away for 30 seconds and count any bubbles. Now predict: if you move the torch to 20 cm, will you see more bubbles, fewer, or the same? Write your prediction.","record":true,"thinkingPrompt":"What is the relationship between the amount of light and how fast photosynthesis can happen?"},
    {"phase":"Investigate","title":"Test three distances","body":"Shine the torch from 5 cm, then 10 cm, then 20 cm. At each distance, wait 30 seconds then count the number of bubbles produced. Record your count for each distance.","record":true,"watchFor":"Count only visible bubbles coming from the leaf or stem, not from the sides of the glass. Bubbles = oxygen produced by photosynthesis."},
    {"phase":"Record","title":"Build a results table","body":"In your notebook, draw a table with two columns: Distance (cm) and Bubbles per 30 seconds. Fill in your three readings.","record":true,"thinkingPrompt":"What pattern do you see in the numbers? Write it as a sentence before you try to explain it."},
    {"phase":"Explain","title":"Connect to photosynthesis","body":"The bubbles you counted are oxygen, a product of photosynthesis. Write the word equation for photosynthesis and mark which part of the equation these bubbles represent.","record":true,"thinkingPrompt":"The equation is: carbon dioxide + water → glucose + oxygen. Which side of the equation are the bubbles evidence of?"},
    {"phase":"Conclude","title":"What the data shows","body":"Write a conclusion: does light intensity affect the rate of photosynthesis? Support your answer with the numbers you recorded.","record":true,"watchFor":"A good scientific conclusion states the relationship (more light = more/fewer bubbles) and gives the actual numbers as evidence."}
  ]',
  '["Scientific Reasoning","Data Interpretation","Observation","Communication"]',
  '{
    "mission": "Does the amount of light a plant receives change how fast it photosynthesises?",
    "predictionPrompt": "Before you start: predict whether moving the light source further away will increase or decrease the number of bubbles, and explain the science behind your prediction.",
    "reflectionPrompts": [
      "What did the bubbles actually tell you about what was happening inside the leaf?",
      "How confident are you in your results? What could have made your counts inaccurate?",
      "Where in real life does the relationship between light and photosynthesis matter for people in Ghana?"
    ],
    "whatThisProves": "Your results show that light intensity directly affects the rate of photosynthesis. More light means more energy available for the plant to convert $CO_2$ and $H_2O$ into glucose and oxygen. This is why farmers in Ghana plant crops in open sunlight rather than in shade, and why plants near windows grow faster than those in dark corners.",
    "skillTags": ["Observation","Scientific Reasoning","Data Interpretation","Communication"],
    "conceptSlug": "photosynthesis",
    "conceptName": "Photosynthesis"
  }'
);

-- 3. SIMPLE CIRCUITS
insert into lab_activities (
  slug, title, body, category, cat_fg, cat_bg, color,
  subject, difficulty, team_mode, equipment, time_estimate,
  objective, demonstrates, materials, safety, steps,
  dimensions, content
) values (
  'simple-circuits',
  'Simple Circuits',
  'Build a circuit with a gap and test everyday objects to find out which materials conduct electricity.',
  'Physics', '#185FA5', '#E6F1FB', '#185FA5',
  'Physics', 'Core', 'Solo or pairs', 'Household', '20 minutes',
  'Classify common household materials as electrical conductors or insulators using a simple test circuit.',
  'electrical conductors, insulators, and circuit building',
  '["1.5V battery (AA or AAA)","Small torch bulb or LED","Three short lengths of wire or stripped electrical wire","Tape","10 small objects to test: e.g. coin, pencil graphite, rubber eraser, foil, plastic, wood, key, fabric"]',
  'Use only 1.5V batteries. Never use mains electricity. Do not touch bare wire ends together for more than a second. Adult supervision recommended for younger students.',
  '[
    {"phase":"Build","title":"Construct the test circuit","body":"Connect the battery to the bulb using your wires, leaving a gap between two of the wire ends. When you bridge the gap with a conductor, the bulb should light. Test that your circuit works by touching the two bare wire ends together briefly.","watchFor":"If the bulb does not light when you touch the wire ends together, check each connection. The most common problem is a loose wire at the battery."},
    {"phase":"Predict","title":"Sort your objects","body":"Before testing, sort your 10 objects into two piles: objects you think will conduct electricity, and objects you think will not. Write down your prediction for each.","record":true,"thinkingPrompt":"What do the objects you think are conductors have in common? What do the non-conductors share?"},
    {"phase":"Test","title":"Bridge the gap","body":"Take each object in turn. Hold it so it bridges the gap in your circuit (touching both bare wire ends). Observe whether the bulb lights or stays dark. Record your result.","record":true,"watchFor":"Some objects (like pencil graphite) conduct weakly — the bulb may glow dimly rather than brightly. Note any dim results separately."},
    {"phase":"Record","title":"Organise your results","body":"Draw a table with three columns: Object, Prediction, and Result. Mark each as Conductor or Insulator. Mark any predictions that turned out to be wrong.","record":true,"thinkingPrompt":"Were there any surprises? What do your conductors have in common in terms of their material?"},
    {"phase":"Explain","title":"Why do some materials conduct?","body":"Electrical conductors allow current to flow because they have free electrons that can move through the material. Write one or two sentences explaining why metals are generally good conductors, using the idea of free electrons.","record":true,"watchFor":"The pencil graphite result is worth explaining — carbon can conduct electricity even though it is not a metal."},
    {"phase":"Conclude","title":"Write your classification","body":"Write a sentence that classifies the objects you tested into conductors and insulators, and state the pattern you found about which types of material tend to conduct.","record":true}
  ]',
  '["Practical Thinking","Observation","Scientific Reasoning","Communication"]',
  '{
    "mission": "Which everyday materials allow electricity to flow through them?",
    "predictionPrompt": "Before you test anything: sort your objects into conductors and insulators based on what you already know, and write down the rule you used to decide.",
    "reflectionPrompts": [
      "Which result surprised you the most, and what does it tell you about what makes a material conduct?",
      "How would an electrician or engineer use what you found today when choosing materials?",
      "What would happen to the brightness of the bulb if you used a longer piece of the same conductor? Why?"
    ],
    "whatThisProves": "Your circuit test showed that metals (copper, iron, aluminium) are electrical conductors because they contain free electrons that can move through the material when a voltage is applied. Non-metals like plastic, rubber, and wood are insulators because their electrons are tightly bound. This is why electrical wires in your home are made of copper on the inside (conductor) with plastic coating on the outside (insulator).",
    "skillTags": ["Practical Thinking","Observation","Scientific Reasoning","Application"],
    "conceptSlug": "electricity",
    "conceptName": "Electricity and Circuits"
  }'
);

-- 4. FORCES AND PAPER BRIDGE
insert into lab_activities (
  slug, title, body, category, cat_fg, cat_bg, color,
  subject, difficulty, team_mode, equipment, time_estimate,
  objective, demonstrates, materials, safety, steps,
  dimensions, content
) values (
  'forces-paper-bridge',
  'Forces and Paper Bridge',
  'Design and build a bridge from one sheet of paper, then test how much load it can carry before it fails.',
  'Physics', '#185FA5', '#E6F1FB', '#633806',
  'Physics', 'Extension', 'Pairs or group', 'Household', '30 minutes',
  'Apply knowledge of forces, load distribution, and structural design to engineer a paper bridge that holds the maximum possible weight.',
  'forces, structural design, load distribution, and engineering thinking',
  '["1 sheet of A4 paper per attempt","Scissors","Tape (optional, limited to 10 cm per bridge)","Two stacks of books as bridge supports","Small coins or similar weights for loading","Ruler","Notebook and pen"]',
  'Do not lean over your bridge during testing. Keep coins contained in a small cup placed on the bridge so they do not scatter.',
  '[
    {"phase":"Design","title":"Plan your bridge","body":"You have one sheet of paper and 10 cm of tape. Your bridge must span a gap of 20 cm between two stacks of books. Before you cut or fold anything, sketch your design in your notebook. Label the features you think will make it strong.","record":true,"thinkingPrompt":"Which shapes are strongest under load? Think about what you know about arches, triangles, and folding."},
    {"phase":"Build","title":"Construct your bridge","body":"Build your bridge using only the materials allowed. You may fold, roll, cut, or crumple the paper. You may use up to 10 cm of tape. Place it across the gap so it rests on both book stacks.","watchFor":"The bridge must span the full 20 cm gap and hold its own weight before you add any load."},
    {"phase":"Predict","title":"How much can it hold?","body":"Before you start loading, predict how many coins (or the mass in grams) your bridge will hold before it fails. Write your prediction and explain the reasoning behind it.","record":true},
    {"phase":"Test","title":"Load it to failure","body":"Place coins one at a time onto the centre of your bridge. Count each coin as you add it. Stop when the bridge fails (collapses or deforms by more than half its height). Record the number of coins at failure.","record":true,"watchFor":"Watch how the bridge deforms under load. Note which part fails first and how it fails (buckling, tearing, bending)."},
    {"phase":"Analyse","title":"Understand the failure","body":"Examine your failed bridge. Write an explanation of exactly how it failed and why you think that part gave way first. Refer to the forces acting on the bridge (compression, tension, or bending).","record":true,"thinkingPrompt":"Compression pushes material together. Tension pulls it apart. Which force was acting on the part that failed?"},
    {"phase":"Redesign","title":"What would you change?","body":"If you had a second sheet of paper, how would you redesign the bridge to carry more load? Write your redesign idea and explain the engineering principle behind it.","record":true}
  ]',
  '["Engineering Design","Practical Thinking","Scientific Reasoning","Communication"]',
  '{
    "mission": "How much load can a single sheet of paper carry if you shape it well?",
    "predictionPrompt": "Before you build: sketch your design and predict how many coins it will hold. What engineering principle are you relying on to make it strong?",
    "reflectionPrompts": [
      "What engineering principle made the biggest difference to your bridge strength?",
      "Engineers always learn from failure. What is the most useful thing your bridge failure taught you?",
      "Where do you see the same forces (compression and tension) at work in real bridges you have seen in Ghana?"
    ],
    "whatThisProves": "Your bridge experiment demonstrates that the shape of a material determines how well it resists force. Folding paper into an arch or corrugated shape distributes load so that no single point bears all the force. This is the same principle used in real bridge construction, from the Adomi Bridge to simple market stalls. Forces, not just materials, determine structural strength.",
    "skillTags": ["Engineering Design","Practical Thinking","Scientific Reasoning","Application"],
    "conceptSlug": "forces",
    "conceptName": "Forces"
  }'
);

-- 5. COOLING AND TEMPERATURE DATA
insert into lab_activities (
  slug, title, body, category, cat_fg, cat_bg, color,
  subject, difficulty, team_mode, equipment, time_estimate,
  objective, demonstrates, materials, safety, steps,
  dimensions, content
) values (
  'cooling-temperature-data',
  'Cooling and Temperature Data',
  'Measure how hot water cools over time in two containers with different surface areas and graph your results.',
  'Physics', '#185FA5', '#E6F1FB', '#185FA5',
  'Physics', 'Core', 'Pairs', 'Household', '35 minutes',
  'Collect temperature-time data for cooling water, plot a cooling curve, and use it to explain how surface area affects the rate of heat loss.',
  'heat transfer, rate of cooling, and data graphing',
  '["Hot water (from a kettle or tap — not boiling)","Two containers: one wide and shallow, one narrow and tall (same volume of water in each)","Thermometer or a temperature-sensing app on a phone","Watch or phone timer","Notebook and pen for a data table","Graph paper or phone notes app"]',
  'Use warm water, not boiling. An adult should pour the water. Do not touch the containers with bare hands immediately after filling.',
  '[
    {"phase":"Set up","title":"Prepare your containers","body":"Pour the same volume of hot water into both containers. Place them side by side on a flat surface where they will not be disturbed. Record the starting temperature of both.","record":true,"watchFor":"The starting temperature should be the same for both containers. If they differ by more than 2°C, the comparison will not be fair."},
    {"phase":"Predict","title":"Which will cool faster?","body":"Look at the two containers. One has more surface exposed to the air than the other for the same volume of water. Predict which container will cool faster and write the scientific reason for your prediction.","record":true,"thinkingPrompt":"Heat escapes from liquid into the air through the surface. What does a larger surface area mean for the rate of heat loss?"},
    {"phase":"Measure","title":"Record temperature every 3 minutes","body":"Set a timer for 3 minutes. At each interval, record the temperature of both containers. Continue for at least 18 minutes (6 readings). Record in a two-column table: Wide container and Narrow container.","record":true,"watchFor":"Stir the water gently before each reading to get an even temperature. Take the reading from the same position each time."},
    {"phase":"Graph","title":"Plot your cooling curves","body":"On graph paper (or sketch in your notebook), plot time on the x-axis and temperature on the y-axis. Draw one line for each container. Label each line.","record":true,"thinkingPrompt":"What shape do you expect the lines to make? A straight line or a curve? Why?"},
    {"phase":"Interpret","title":"Read the data","body":"Using your graph, estimate at what time each container reached 10°C below its starting temperature. Write the time for each and calculate the difference.","record":true,"watchFor":"The steeper the cooling curve line, the faster the cooling rate. A flatter line means slower cooling."},
    {"phase":"Conclude","title":"Draw your conclusion","body":"Write a conclusion that answers: does surface area affect the rate of cooling? State the relationship clearly and support it with the data from your graph (actual temperatures or times).","record":true}
  ]',
  '["Data Interpretation","Measurement","Scientific Reasoning","Communication"]',
  '{
    "mission": "Does the surface area of a container affect how quickly hot water cools down?",
    "predictionPrompt": "Before you collect any data: predict which container will cool faster, and explain the physics behind your prediction using the idea of surface area and heat transfer.",
    "reflectionPrompts": [
      "What does the shape of your cooling curve tell you about how the rate of cooling changes over time?",
      "How does this experiment connect to everyday situations in Ghana, like keeping kenkey or soup hot?",
      "What would change in your results if you insulated one container with a cloth? Predict and explain."
    ],
    "whatThisProves": "Your cooling curves show that a container with greater surface area loses heat to the surrounding air more quickly than one with less surface area holding the same volume of liquid. This is why a wide, shallow bowl of soup cools faster than a narrow, deep pot. The same principle explains why engineers use finned heat sinks on electronics — the fins increase surface area to transfer heat away faster.",
    "skillTags": ["Measurement","Data Interpretation","Scientific Reasoning","Application"],
    "conceptSlug": "energy",
    "conceptName": "Energy and Heat Transfer"
  }'
);
