-- Add per-step rubric array and doneVerb to the content jsonb of each flagship lab.
-- Rubric index matches step index (null for non-recording steps).
-- Total marks for recording steps sums to 100 per lab.

UPDATE public.lab_activities
SET content = content || '{
  "doneVerb": "measured",
  "rubric": [
    {"criterion":"Prediction with reasoning","description":"Ranks all three objects with a scientific reason for each ranking, not just a guess","max":10},
    {"criterion":"Mass recorded correctly","description":"Three masses recorded in grams with units stated and scale zeroed between readings","max":15},
    {"criterion":"Volume calculated correctly","description":"Uses l × w × h formula and records result in cm³ with working shown","max":15},
    {"criterion":"Density formula applied","description":"Applies ρ = m/V for all three objects with result in g/cm³ and comparison to 1 g/cm³ stated","max":20},
    {"criterion":"Observation accurate","description":"Float or sink result recorded for each object, consistent with the calculated density","max":15},
    {"criterion":"Scientific explanation","description":"Explains the density-floating relationship using the 1 g/cm³ threshold and addresses any prediction error","max":25}
  ]
}'::jsonb
WHERE slug = 'density-investigation';

UPDATE public.lab_activities
SET content = content || '{
  "doneVerb": "investigated",
  "rubric": [
    null,
    {"criterion":"Prediction with science","description":"States whether more or fewer bubbles will appear and links it to light energy and photosynthesis rate","max":10},
    {"criterion":"Bubble counts recorded","description":"Records bubble count for all three distances (5 cm, 10 cm, 20 cm) with readable numbers","max":25},
    {"criterion":"Results table complete","description":"Table has two labelled columns, all three readings filled in, and a written pattern statement","max":20},
    {"criterion":"Photosynthesis equation","description":"Writes the word equation correctly and identifies oxygen (bubbles) as the product being measured","max":20},
    {"criterion":"Conclusion supported by data","description":"States the relationship between light intensity and photosynthesis rate, citing actual bubble counts as evidence","max":25}
  ]
}'::jsonb
WHERE slug = 'photosynthesis-experiment';

UPDATE public.lab_activities
SET content = content || '{
  "doneVerb": "built and tested",
  "rubric": [
    null,
    {"criterion":"Prediction for all objects","description":"All objects sorted into conductor or insulator before testing, with a stated rule for the sorting","max":10},
    {"criterion":"Test results recorded","description":"Result (lights or does not light) recorded for all objects; dim results noted separately","max":30},
    {"criterion":"Table complete and accurate","description":"Table has object, prediction, and result columns; prediction errors marked; conductors identified correctly","max":20},
    {"criterion":"Free electrons explanation","description":"Explains why metals conduct using free electrons; addresses the pencil graphite result specifically","max":20},
    {"criterion":"Classification statement","description":"Writes a sentence that correctly classifies tested objects and states a pattern about conducting materials","max":20}
  ]
}'::jsonb
WHERE slug = 'simple-circuits';

UPDATE public.lab_activities
SET content = content || '{
  "doneVerb": "engineered",
  "rubric": [
    {"criterion":"Design sketch with reasoning","description":"Sketch labels the structural features and explains which engineering principle will make it strong","max":20},
    null,
    {"criterion":"Load prediction with reasoning","description":"Predicts a specific number of coins or mass and explains why based on the bridge design","max":15},
    {"criterion":"Test results recorded","description":"Records number of coins at failure, identifies which part failed first, and describes how failure occurred","max":25},
    {"criterion":"Failure analysis with forces","description":"Explains exactly how the bridge failed and names the force (compression, tension, or bending) responsible","max":25},
    {"criterion":"Redesign with principle","description":"Proposes a specific redesign change and names the engineering principle that would improve performance","max":15}
  ]
}'::jsonb
WHERE slug = 'forces-paper-bridge';

UPDATE public.lab_activities
SET content = content || '{
  "doneVerb": "graphed",
  "rubric": [
    {"criterion":"Starting temperature recorded","description":"Starting temperature recorded for both containers; notes if they differ by more than 2°C","max":10},
    {"criterion":"Prediction with physics","description":"Predicts which container cools faster and links it to surface area and rate of heat loss","max":15},
    {"criterion":"Six readings per container","description":"At least 6 time-temperature readings recorded for both containers in a clear two-column table","max":20},
    {"criterion":"Cooling curve plotted","description":"Graph has labelled axes (time and temperature), two lines drawn, and each line labelled","max":20},
    {"criterion":"Crossover time identified","description":"Reads from the graph the time each container reached 10°C below starting temperature; calculates the difference","max":15},
    {"criterion":"Conclusion with data","description":"States the effect of surface area on cooling rate and supports the claim with specific temperatures or times from the data","max":20}
  ]
}'::jsonb
WHERE slug = 'cooling-temperature-data';
