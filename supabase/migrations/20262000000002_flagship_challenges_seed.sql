-- Flagship Challenges: 3 fully authored challenges for the MVP experience upgrade.
-- Extended fields (story, rubric, conceptNames, coachContext) live in the `content` jsonb column.

-- Replace any thin placeholder versions of these challenges.
delete from challenges where title in (
  'Clean Water Challenge',
  'Paper Bridge Engineering Challenge',
  'Smarter Energy School Challenge'
);

-- 1. CLEAN WATER CHALLENGE
insert into challenges (
  title, body, brief, type, fg, bg, scope, mode, timeline, accent,
  is_featured, stages, content
) values (
  'Clean Water Challenge',
  'Design a low-cost water filtration system using household materials and test how well it removes visible impurities from dirty water.',
  'Clean water is not available to everyone in Ghana. In many communities, families collect water from rivers, ponds, or roadside sources. Your challenge: design a filtration system using only locally available materials that makes visibly dirty water clearer. You will investigate the science, design your filter, build it, test it, and present your reasoning.',
  'Design Challenge',
  '#085041', '#E1F5EE',
  'Ghana', 'Individual or pairs', '10 days', '#1D9E75',
  true,
  '[
    {"name":"Understand the problem","goal":"Research the water quality challenge and the science of filtration","task":"Find out: what makes water dirty? What methods do communities in Ghana use to clean water? What does a filter actually do at a scientific level? Write a one-page brief summarising what you found and the key concepts involved.","weight":15},
    {"name":"Design your filter","goal":"Propose a filtration design with clear scientific reasoning","task":"Design a filter using materials you can find at home (sand, gravel, charcoal, cloth, plastic bottles, etc.). Draw a labelled diagram of your design. Explain what each layer does scientifically and why you chose those materials.","weight":25},
    {"name":"Build and test","goal":"Construct the filter and collect data on its performance","task":"Build your filter. Prepare a sample of visibly dirty water. Pass it through your filter and observe the result. Record: colour of the water before and after, time taken to filter 250 ml, and any sediment removed. Repeat twice.","weight":30},
    {"name":"Analyse and improve","goal":"Evaluate the result and identify what you would change","task":"Was your filter effective? Write an honest analysis: what worked, what did not, and what you would change in a second version. Use the data you collected as evidence. If you can, test a small improvement.","weight":20},
    {"name":"Present your solution","goal":"Communicate your design and findings clearly","task":"Prepare a short presentation (written, drawn, or recorded) that explains your filter design, your test results, and your conclusion. Address this question: would your design be practical for a community with no access to hardware shops?","weight":10}
  ]',
  '{
    "story": "In 2023, over 3 million Ghanaians were still using untreated surface water as their main drinking source. Waterborne diseases from contaminated water remain one of the leading causes of illness in children under five. The problem is not that the science of water filtration is unknown — it is that most solutions are too expensive or require materials that are not available locally. Your challenge is to solve the practical version of this problem: using only what a family in a rural Ghanaian community could find or afford, can you build a filter that visibly improves water quality?",
    "rubric": [
      {"criterion":"Scientific understanding","description":"Correctly explains the science behind filtration, including why each layer is chosen","max":20},
      {"criterion":"Design quality","description":"Design is detailed, labelled, and shows clear reasoning for material choices","max":20},
      {"criterion":"Evidence collected","description":"Collects clear before-and-after data, repeats the test, records results accurately","max":25},
      {"criterion":"Analysis","description":"Honest evaluation of what worked and what did not, supported by the data","max":20},
      {"criterion":"Practical thinking","description":"Considers real-world constraints (cost, availability) in the proposed solution","max":15}
    ],
    "conceptNames": ["Water and Solutions","Filtration and Separation","Particle Model"],
    "coachContext": "This is a Design Challenge about water filtration. The key science concepts are: filtration removes suspended particles; different particle sizes need different filter media (large gravel for large particles, fine sand for smaller ones, charcoal for colour and odour); filtration does not remove dissolved chemicals or bacteria. Students should be guided to connect each layer of their filter to a specific scientific function, not just copy a design they found online."
  }'
);

-- 2. PAPER BRIDGE ENGINEERING CHALLENGE
insert into challenges (
  title, body, brief, type, fg, bg, scope, mode, timeline, accent,
  is_featured, stages, content
) values (
  'Paper Bridge Engineering Challenge',
  'Apply your knowledge of forces and structural design to build the strongest possible bridge from limited materials. Compete against other students to hold the most weight.',
  'Engineers do not just build things — they design under constraints. Your challenge: build a bridge that spans a 25 cm gap using only 3 sheets of A4 paper and 15 cm of tape, then load it to find its maximum holding capacity. The goal is not just to build a bridge that works — it is to build the strongest bridge you can, and to explain the engineering reasoning behind every choice you make.',
  'Engineering Challenge',
  '#185FA5', '#E6F1FB',
  'Ghana', 'Individual', '7 days', '#185FA5',
  false,
  '[
    {"name":"Study the forces","goal":"Understand how forces act on a bridge structure","task":"Research: what forces act on a bridge when it is loaded? What is the difference between compression and tension? What shapes are strongest under load and why? Write a short technical brief explaining the physics before you design anything.","weight":15},
    {"name":"Design with reasoning","goal":"Produce a design that reflects understanding of structural forces","task":"Sketch at least two different bridge designs. For each, explain which force (compression or tension) each part is designed to resist. Choose one design to build and explain your choice.","weight":25},
    {"name":"Build to specification","goal":"Construct the bridge within the material constraints","task":"Build your bridge using exactly 3 sheets of A4 paper and a maximum of 15 cm of tape. It must span a 25 cm gap and hold its own weight before loading. Photograph or describe your build process.","weight":20},
    {"name":"Test and record","goal":"Measure the bridge load capacity accurately","task":"Load your bridge using coins or known weights. Add one coin at a time. Record the total load at failure. Photograph or describe exactly how the bridge failed (where and how).","weight":25},
    {"name":"Explain and reflect","goal":"Connect your results to engineering principles","task":"Write a technical explanation: what happened when the bridge failed, which force was responsible, and how your next design would address it. If you were designing a real bridge, which principle from this experiment would you use?","weight":15}
  ]',
  '{
    "story": "Every bridge ever built is a solution to the same engineering problem: how do you span a gap and carry a load with the least material? Ghana has over 2,000 bridges, from small footbridges over streams in the Volta Region to major road bridges like the Adomi Bridge spanning the Volta River. Every one of them was designed by an engineer who understood the same forces you are working with today: compression, tension, and the way shape determines strength. In this challenge, you are working with the same principles at a smaller scale.",
    "rubric": [
      {"criterion":"Technical brief","description":"Accurately explains compression, tension, and how they apply to bridges","max":20},
      {"criterion":"Design reasoning","description":"Design choices are explained using correct engineering principles","max":25},
      {"criterion":"Construction quality","description":"Bridge is well-built within material limits and spans the required gap","max":20},
      {"criterion":"Load testing","description":"Test is carried out carefully, results are accurate and clearly recorded","max":20},
      {"criterion":"Reflection","description":"Failure analysis correctly identifies the force responsible and proposes a sound improvement","max":15}
    ],
    "conceptNames": ["Forces","Structural Design","Compression and Tension"],
    "coachContext": "This is an engineering challenge about forces and structural design. Key science: compression forces push a material together (the top surface of a bridge under load is in compression); tension forces pull a material apart (the bottom surface of a bridge under load is in tension). Strong shapes: arches redirect compression forces outward; triangles resist deformation because they cannot be distorted without changing the length of a side; corrugated/folded paper resists bending. Common student errors: building flat bridges with no structural shaping (these fail by bending, not by force on the material), and using tape to hold pieces together rather than to strengthen structure."
  }'
);

-- 3. SMARTER ENERGY SCHOOL CHALLENGE
insert into challenges (
  title, body, brief, type, fg, bg, scope, mode, timeline, accent,
  is_featured, stages, content
) values (
  'Smarter Energy School Challenge',
  'Conduct an energy audit of your school or home, identify the three biggest sources of energy waste, and design a practical plan to reduce them.',
  'Ghana''s national electricity grid faces regular demand pressure. Schools are major energy users — lighting, fans, computers, and equipment run for hours every day. Your challenge: act as an energy consultant. Audit a real space, find where energy is being wasted, calculate the potential savings, and design a practical plan that does not require spending money the school does not have.',
  'Investigation Challenge',
  '#633806', '#FEF3E2',
  'Ghana', 'Individual or team (up to 3)', '14 days', '#E8A020',
  false,
  '[
    {"name":"Energy audit","goal":"Systematically survey energy use in a real space","task":"Choose a space to audit: your classroom, your home, or a specific area of your school. List every device that uses electricity or fuel (fans, lights, fridges, cooking stoves, phone chargers). For each device, estimate how many hours per day it runs and find its power rating (usually printed on the device or its box). Record everything in a table.","weight":20},
    {"name":"Calculate energy use","goal":"Use the formula for electrical energy to quantify consumption","task":"For each device, calculate daily energy consumption using $E = P \\times t$, where $P$ is power in watts and $t$ is time in hours. This gives you energy in watt-hours. Convert to kilowatt-hours by dividing by 1000. Add up the total to find your space''s daily energy consumption in kWh.","weight":25},
    {"name":"Find the waste","goal":"Identify where the biggest savings are possible","task":"Review your audit data. Which three devices or habits account for the most energy use? Are there any that run longer than necessary (lights left on in empty rooms, devices on standby, fans running in empty spaces)? Calculate how much energy you could save if you changed each of those three behaviours.","weight":20},
    {"name":"Design the plan","goal":"Produce a practical, cost-aware energy reduction proposal","task":"Write a practical plan for reducing energy use in your audited space by at least 20%. For each recommendation: state the change, the energy it would save (in kWh per day), and whether it costs money to implement. Prioritise changes that cost nothing.","weight":25},
    {"name":"Present and persuade","goal":"Communicate your findings and recommendations clearly","task":"Prepare a short presentation for the headteacher or your family that explains: what you found, what it costs in terms of energy (and potentially money — research ECG tariffs), and your three priority recommendations. The goal is to be persuasive enough that someone actually acts on your plan.","weight":10}
  ]',
  '{
    "story": "In 2024, ECG (Electricity Company of Ghana) reported that industrial and commercial customers account for over 60% of electricity demand in the country. Schools fall into this category. Yet most schools have no energy monitoring, no one whose job it is to reduce waste, and no data on where electricity is actually going. A single secondary school can spend GHS 3,000 to 8,000 per term on electricity. A 20% reduction through behaviour changes alone — turning off lights, reducing standby, adjusting fan schedules — costs nothing and saves real money. In this challenge, you are doing work that has direct, practical value for your school community.",
    "rubric": [
      {"criterion":"Audit completeness","description":"All major energy users identified, data table is complete and accurate","max":20},
      {"criterion":"Calculation accuracy","description":"$E = P \\times t$ applied correctly, units used consistently, totals correct","max":25},
      {"criterion":"Waste identification","description":"The three biggest waste sources are correctly identified with evidence from the data","max":20},
      {"criterion":"Plan quality","description":"Recommendations are specific, practical, prioritised by impact, and cost-aware","max":25},
      {"criterion":"Communication","description":"Presentation is clear, data is used as evidence, recommendations are persuasive","max":10}
    ],
    "conceptNames": ["Energy","Electrical Power","Energy Transfer"],
    "coachContext": "This is an investigation challenge about energy and electrical power. Key science: electrical energy is calculated using $E = P \\times t$ (energy = power x time); power is measured in watts (W) and energy in watt-hours (Wh) or kilowatt-hours (kWh); 1 kWh = 1 unit on an ECG bill. Common student errors: confusing power and energy (a 100W bulb uses 100 watts of power, but 100 watt-hours of energy per hour); not converting to kWh consistently; listing devices but not estimating actual usage time. Good audit technique: walk through the space at different times of day, not just once."
  }'
);
