-- Phase 6: Labs and Challenges Scale
-- Expands labs to ~42 total, adds recurring/scope challenge support,
-- and updates next_best_action() with mastery-linked challenge recommendation.
-- Idempotent via ON CONFLICT (slug) DO NOTHING.

-- ── 1. recurring flag on catalog_challenges ───────────────────────────────────
ALTER TABLE public.catalog_challenges
  ADD COLUMN IF NOT EXISTS recurring boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS recurs_every_days int;

-- ── 2. Expand labs: Physics, General Science, Africa-context, no-equipment ────

INSERT INTO public.lab_activities
  (slug, category, subject, title, body, equipment, time_estimate, demonstrates,
   objective, materials, safety, steps, color, cat_fg, cat_bg, difficulty)
VALUES

-- PHYSICS
('forces-spring-balance', 'Experiment', 'Physics',
 'Investigate Hooke''s Law with a spring',
 'Measure how the extension of a spring changes with increasing load.',
 'School lab', '40 min', 'Force is proportional to extension',
 'Collect data to verify Hooke''s Law and identify the limit of proportionality.',
 '["Spring","Retort stand, boss and clamp","Ruler","Selection of masses (100 g each)","Pointer (cocktail stick taped to spring)"]'::jsonb,
 'Do not overload the spring beyond its elastic limit. Secure the retort stand.',
 '[{"n":1,"step":"Hang the spring from the clamp and measure its natural length."},{"n":2,"step":"Add 100 g and record the new length. Calculate extension = new length minus natural length."},{"n":3,"step":"Repeat for 200 g, 300 g, 400 g, 500 g, and 600 g."},{"n":4,"step":"Plot extension (y) against load (x). Describe the shape."},{"n":5,"step":"Identify where the line stops being straight. This is the limit of proportionality."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'core'),

('electricity-circuits', 'Experiment', 'Physics',
 'Build series and parallel circuits',
 'Measure voltage and current in series and parallel arrangements.',
 'School lab', '50 min', 'Current and voltage in circuit arrangements',
 'Compare the current through and voltage across components in series vs parallel.',
 '["Two identical bulbs","Battery pack (3 V)","Ammeter","Voltmeter","Connecting wires","Switch"]'::jsonb,
 'Use low-voltage battery packs only. Do not connect a voltmeter in series.',
 '[{"n":1,"step":"Build a series circuit with two bulbs. Record current (A) and voltage across each bulb (V)."},{"n":2,"step":"Build a parallel circuit with the same two bulbs. Record current from the battery and through each branch."},{"n":3,"step":"Unscrew one bulb in each circuit. What happens to the other? Explain why."},{"n":4,"step":"Summarise: how does current split in parallel? How does voltage split in series?"}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'core'),

('optics-mirror-lens', 'Experiment', 'Physics',
 'Investigate refraction with a glass block',
 'Measure angles of incidence and refraction to find the refractive index of glass.',
 'School lab', '40 min', 'Light bends when entering a denser medium',
 'Calculate the refractive index of a glass block using Snell''s Law.',
 '["Rectangular glass block","Ray box with single-slit aperture","Protractor","Plain paper","Pencil"]'::jsonb,
 'Handle the glass block carefully. Do not look directly into the ray box lamp.',
 '[{"n":1,"step":"Place the glass block on paper and trace its outline."},{"n":2,"step":"Direct a ray into the block at 30° to the normal. Mark the entry and exit points."},{"n":3,"step":"Remove the block and draw the full ray path. Measure the angle of refraction."},{"n":4,"step":"Repeat for angles of 40°, 50°, and 60°."},{"n":5,"step":"Calculate n = sin(i) / sin(r) for each angle. Do you get a consistent value?"}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'extension'),

('waves-ripple-tank', 'Experiment', 'Physics',
 'Investigate wave properties in water',
 'Observe reflection, refraction and diffraction of water waves.',
 'School lab', '45 min', 'Waves carry energy and show wave behaviours',
 'Observe and sketch wave patterns for reflection, refraction and diffraction.',
 '["Ripple tank with motor and lamp","Plane reflector","Shallow tray of water","Barrier with single gap","Stroboscope (optional)"]'::jsonb,
 'Keep electrical connections away from water. Wipe up spills immediately.',
 '[{"n":1,"step":"Set up the ripple tank and adjust the motor to produce clear, evenly-spaced plane waves."},{"n":2,"step":"Place a flat reflector at an angle. Observe and sketch the reflected waves."},{"n":3,"step":"Place a barrier with a wide gap (wider than wavelength). Sketch what happens."},{"n":4,"step":"Replace with a narrow gap (similar to wavelength). How does the pattern change?"},{"n":5,"step":"Add a shallow region in the tank using a submerged piece of perspex. Observe speed and direction change."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'extension'),

('pendulum-period', 'Investigation', 'Physics',
 'Investigate what affects a pendulum''s period',
 'Find out whether length, mass or amplitude changes the period of a pendulum.',
 'Household', '45 min', 'Period of a pendulum depends on length',
 'Identify that length is the only variable that affects period, and describe the relationship.',
 '["String (at least 1.5 m)","A heavy nut or small mass","Ruler","Stopwatch","Protractor (optional)","A fixed support point (e.g. door frame)"]'::jsonb,
 'Secure the string well. Keep amplitudes small (under 15°) for accurate results.',
 '[{"n":1,"step":"Set up a pendulum of length 0.5 m. Time 10 complete swings. Calculate period T = total time / 10."},{"n":2,"step":"Repeat for lengths of 0.75 m, 1.0 m, and 1.25 m. Keep the mass the same."},{"n":3,"step":"Plot period (y) against length (x). What shape is the graph?"},{"n":4,"step":"Now change the mass but keep length fixed. Does the period change?"},{"n":5,"step":"Conclude: which variable affects period? Suggest a rule."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'core'),

-- CHEMISTRY (additional)
('neutralisation-titration', 'Experiment', 'Chemistry',
 'Neutralise an acid with an alkali',
 'Use an indicator to find the exact volume of NaOH needed to neutralise HCl.',
 'School lab', '45 min', 'Acid plus alkali produces salt and water',
 'Perform a simple titration and determine the end-point using a colour change.',
 '["Burette and stand","25 cm³ pipette","Conical flask","0.1 mol/l HCl","0.1 mol/l NaOH","Phenolphthalein indicator","White tile"]'::jsonb,
 'Wear eye protection. NaOH is corrosive. Rinse any spillage immediately.',
 '[{"n":1,"step":"Rinse and fill the burette with NaOH solution. Record the initial reading."},{"n":2,"step":"Use the pipette to transfer exactly 25 cm³ of HCl into the conical flask. Add 2 drops of indicator."},{"n":3,"step":"Add NaOH dropwise from the burette, swirling constantly."},{"n":4,"step":"Stop when one drop causes a permanent pink colour. Record the final burette reading."},{"n":5,"step":"Calculate the volume of NaOH used. Repeat twice for concordant results."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'extension'),

('soap-making', 'Practical Activity', 'Chemistry',
 'Make soap from palm oil and caustic soda',
 'Carry out saponification to produce a usable bar of soap.',
 'Household', '60 min', 'Esters and saponification',
 'Demonstrate the chemical reaction that converts oil and alkali into soap and glycerol.',
 '["Palm oil (250 ml)","Caustic soda / lye (NaOH, 34 g)","Distilled water (90 ml)","Heat-resistant bowl","Stirring rod","Safety goggles and gloves","Mould (cardboard box lined with plastic)"]'::jsonb,
 'NaOH is highly corrosive. Adult supervision required. Do not allow lye to touch skin. Work in ventilated space.',
 '[{"n":1,"step":"Weigh out 34 g of NaOH. Carefully dissolve in 90 ml of cold distilled water in a heat-resistant bowl. The solution will get hot."},{"n":2,"step":"Gently heat the palm oil to 45°C."},{"n":3,"step":"Slowly pour the lye solution into the oil, stirring constantly."},{"n":4,"step":"Continue stirring until the mixture traces (leaves a trail when drizzled). Pour into mould."},{"n":5,"step":"Leave for 24 hours, then cut. Leave to cure for 4 weeks."},{"n":6,"step":"Explain what happened to the ester bonds in the oil and what reaction type this is."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'extension'),

-- BIOLOGY (additional)
('microscopy-cells', 'Investigation', 'Biology',
 'Compare plant and animal cells under a microscope',
 'Prepare slides and observe onion epidermal cells and cheek cells.',
 'School lab', '40 min', 'Plant and animal cells have different structures',
 'Identify and compare key structures in plant and animal cells.',
 '["Compound microscope","Glass slides and coverslips","Onion","Iodine solution","Cotton bud","Methylene blue stain","Forceps","Scalpel"]'::jsonb,
 'Take care with scalpels. Do not stain with methylene blue near clothing.',
 '[{"n":1,"step":"Peel a single layer of onion skin and lay it flat on a slide. Add a drop of iodine and a coverslip. Observe at ×40 and ×100."},{"n":2,"step":"Gently scrape the inside of your cheek with a cotton bud. Smear on a slide, add methylene blue, add coverslip. Observe."},{"n":3,"step":"Draw and label both cells: nucleus, cell membrane, cytoplasm. For onion only: cell wall, vacuole."},{"n":4,"step":"List two differences and one similarity between the two cell types."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('osmosis-potato', 'Experiment', 'Biology',
 'Investigate osmosis using potato cylinders',
 'Measure mass change in potato cylinders placed in solutions of different concentrations.',
 'Household', '50 min', 'Osmosis drives water movement across membranes',
 'Predict and observe osmosis in plant tissue and calculate percentage mass change.',
 '["Raw potato","Borer or knife","Ruler","Balance","Four beakers","Solutions: distilled water, 0.2 mol/l, 0.5 mol/l, 1.0 mol/l salt solution","Paper towels"]'::jsonb,
 'Take care when cutting. Dry cylinders with paper towel before weighing.',
 '[{"n":1,"step":"Cut 12 potato cylinders, each 5 cm long. Blot dry and record the initial mass of three cylinders per beaker."},{"n":2,"step":"Place three cylinders in each of the four solutions. Leave for 30 minutes."},{"n":3,"step":"Remove, blot dry, and reweigh. Record the final mass."},{"n":4,"step":"Calculate % change = (final - initial)/initial × 100 for each beaker."},{"n":5,"step":"Plot % change against concentration. At what concentration does no net water movement occur?"}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

-- GENERAL SCIENCE — VARIABLES & EXPERIMENTAL DESIGN
('variables-experiment', 'Investigation', 'General Science',
 'Design a controlled investigation',
 'Plan and conduct a fair test on a question of your choice.',
 'Household', '60 min', 'Scientific method: fair testing and variable control',
 'Apply the steps of scientific enquiry to answer a real question.',
 '["Materials depend on chosen question (e.g. sugar/salt/flour, water, ruler, stopwatch)"]'::jsonb,
 'Follow standard lab safety for the materials you choose.',
 '[{"n":1,"step":"Choose a question: e.g. Does water temperature affect how fast sugar dissolves?"},{"n":2,"step":"Identify: independent variable (what you change), dependent variable (what you measure), control variables (what you keep the same)."},{"n":3,"step":"Write a prediction with a reason: ''If..., then..., because...''"},{"n":4,"step":"Carry out the experiment three times at each value. Record all results in a table."},{"n":5,"step":"Plot a graph. Write a conclusion: was your prediction correct? What would you improve?"}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation'),

('data-collection-graphing', 'Investigation', 'General Science',
 'Collect real data and present it graphically',
 'Gather a set of real measurements from your environment and represent them as charts.',
 'Household', '45 min', 'Data collection, tables, and graphical representation',
 'Record real data, organise it in a table, and produce a bar chart and a line graph.',
 '["Ruler","Stopwatch or phone timer","Data recording sheet or notebook","Graph paper or phone with spreadsheet app"]'::jsonb,
 'No significant safety concerns for this activity.',
 '[{"n":1,"step":"Choose something to measure — e.g. heights of 10 people in your compound, time for objects of different sizes to fall the same distance, or daily temperature at noon for a week."},{"n":2,"step":"Record your measurements in a neat table with units."},{"n":3,"step":"Draw a bar chart to compare values."},{"n":4,"step":"If the data has a trend over time, draw a line graph."},{"n":5,"step":"Write three observations from your graphs. What question would you investigate next?"}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation'),

-- AFRICA-CONTEXT — no-equipment household labs
('palm-oil-density', 'Experiment', 'General Science',
 'Compare density of palm oil, water and salt water',
 'Layer different liquids to observe density differences using household materials.',
 'Household', '20 min', 'Density determines whether objects float or sink',
 'Demonstrate that liquids of different densities form layers, and predict object positions.',
 '["Palm oil","Water","Salt","Food colouring (optional)","Tall clear glass","Small objects: a grape, a piece of plastic, a small piece of wax"]'::jsonb,
 'No significant hazards. Palm oil may stain surfaces.',
 '[{"n":1,"step":"Pour water into the glass. Dissolve 3 tablespoons of salt into a separate cup of water and add food colouring."},{"n":2,"step":"Carefully pour palm oil on top of the plain water."},{"n":3,"step":"Gently add coloured salt water down the side. Observe how the layers arrange."},{"n":4,"step":"Drop in your three test objects. Record which layer each one floats at or sinks through."},{"n":5,"step":"Rank the four liquids from least dense to most dense. Explain your ranking."}]'::jsonb,
 '#e8a020', '#633806', '#fef3e2', 'foundation'),

('fermentation-bread', 'Experiment', 'Biology',
 'Fermentation: yeast and sugar in bread making',
 'Observe carbon dioxide production during fermentation and connect it to baking.',
 'Household', '90 min', 'Yeast respires anaerobically and produces CO2',
 'Measure the rise of dough as evidence of CO2 produced by yeast fermentation.',
 '["Active dry yeast (1 sachet, 7 g)","Warm water (37°C)","Sugar","Plain flour","Two mixing bowls","Ruler","Cling film or damp cloth"]'::jsonb,
 'No significant hazards.',
 '[{"n":1,"step":"Mix 1 tsp sugar and yeast in 100 ml warm water. Wait 5 minutes — you should see foam forming."},{"n":2,"step":"Mix 200 g flour with the yeast mixture. Knead for 5 minutes."},{"n":3,"step":"Place in a bowl, cover, and mark the starting height with a piece of tape."},{"n":4,"step":"Leave for 45 minutes. Record the new height. Calculate the % increase in volume."},{"n":5,"step":"Explain what the yeast produced and why the dough expanded. What is the word equation for anaerobic respiration?"}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('salt-crystallisation', 'Investigation', 'Chemistry',
 'Grow salt crystals and measure crystal size vs cooling rate',
 'Compare crystal size from fast-cooled and slow-cooled saturated solutions.',
 'Household', '48 hours', 'Crystal size depends on cooling rate',
 'Produce two samples of salt crystals and explain the size difference using particle theory.',
 '["Table salt (coarse sea salt preferred)","Water","Two small glass jars","String","Pencil","Ruler"]'::jsonb,
 'Boiling water: adult supervision for young students.',
 '[{"n":1,"step":"Make a saturated salt solution: dissolve as much salt as possible in 200 ml of hot water."},{"n":2,"step":"Pour half into one jar. Leave in the fridge (fast cool). Pour the other half into the second jar and leave at room temperature (slow cool)."},{"n":3,"step":"After 24 hours and again after 48 hours, observe and photograph both jars."},{"n":4,"step":"Measure the size of crystals in each jar using a ruler."},{"n":5,"step":"Explain: why are the crystals in the slow-cooled sample larger? What does this tell us about particle movement?"}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'core'),

('soil-composition', 'Field Study', 'General Science',
 'Analyse the composition of local soil',
 'Separate soil into sand, silt, clay and organic matter using the jar settling method.',
 'Outdoor', '24 hours', 'Soil composition affects drainage and plant growth',
 'Identify the components of a soil sample and relate them to plant growth suitability.',
 '["Soil sample from two different locations","Large clear jar with lid","Water","Ruler","Notepad"]'::jsonb,
 'Wash hands after handling soil. Avoid soil near waste areas.',
 '[{"n":1,"step":"Collect soil samples from two locations: one near a garden, one from open ground."},{"n":2,"step":"Fill the jar one-third with soil, add water to 2 cm from the top, shake vigorously for 2 minutes."},{"n":3,"step":"Leave undisturbed for 24 hours."},{"n":4,"step":"Observe and measure the layers: gravel/coarse sand at bottom, fine sand, silt, clay, organic matter at top."},{"n":5,"step":"Draw the layer diagram for each sample. Which soil is better for farming? Why?"}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation'),

('water-purification', 'Practical Activity', 'Chemistry',
 'Build a simple water filter',
 'Construct a multi-layer filter and test its effectiveness on muddy water.',
 'Household', '40 min', 'Filtration and water treatment',
 'Produce clearer water using a gravel-sand-charcoal filter and explain each layer''s role.',
 '["Plastic bottle (cut in half)","Coarse gravel","Fine sand","Activated charcoal or pieces of burnt wood","Cotton wool","Muddy water sample","Two beakers"]'::jsonb,
 'This produces cleaner but NOT drinking-safe water. Do not drink the filtered output.',
 '[{"n":1,"step":"Turn the top half of the bottle upside down to form a funnel. Layer from bottom to top: cotton wool, charcoal, fine sand, coarse gravel."},{"n":2,"step":"Pour muddy water through and collect the output in a beaker."},{"n":3,"step":"Compare the clarity of input and output water against a white background."},{"n":4,"step":"Explain what each layer removes and what filtration alone cannot remove (pathogens, dissolved chemicals)."},{"n":5,"step":"Describe what would need to be added to make this water safe to drink."}]'::jsonb,
 '#c47a17', '#6b3f00', '#fef3e2', 'core'),

('starch-iodine-leaf', 'Investigation', 'Biology',
 'Prove a leaf has made starch through photosynthesis',
 'Decolourise a leaf and test for starch to show that light is needed for photosynthesis.',
 'Household', '50 min', 'Photosynthesis produces starch in leaves',
 'Demonstrate that the green part of a leaf (with chlorophyll) contains starch, while covered areas do not.',
 '["Green leaf from a plant kept in light for 2 days","Ethanol (methylated spirits)","Water bath (hot water)","Iodine solution","White tile","Forceps","Beaker"]'::jsonb,
 'Ethanol is flammable — use a hot water bath, never a naked flame.',
 '[{"n":1,"step":"Cover part of a leaf with foil 24 hours before the experiment."},{"n":2,"step":"Place the leaf in boiling water for 1 minute to kill cells."},{"n":3,"step":"Move the leaf to ethanol in a hot water bath (ethanol must not be heated directly). Leave until the leaf is white."},{"n":4,"step":"Rinse the leaf in warm water and spread on a white tile."},{"n":5,"step":"Add iodine. Which part turns blue-black? Which part stays yellow-brown? Explain."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'core'),

('decomposition-observation', 'Field Study', 'Biology',
 'Observe decomposition in a local environment',
 'Track decomposition of organic material over several days.',
 'Outdoor', '5 days', 'Decomposers recycle nutrients in ecosystems',
 'Observe and record the stages of decomposition and identify which organisms are involved.',
 '["Two identical pieces of fruit (e.g. banana, mango) or bread","Two small containers","Soil sample","Notebook and pencil","Magnifying glass"]'::jsonb,
 'Do not handle decomposing material with bare hands. Wash hands thoroughly after.',
 '[{"n":1,"step":"Place one fruit piece in a container with a small amount of moist soil. Place the other in a clean dry container."},{"n":2,"step":"Observe both every day for 5 days. Record: colour, texture, smell, any visible organisms (use a magnifying glass)."},{"n":3,"step":"On day 5, sketch and describe both samples."},{"n":4,"step":"Which decayed faster? Why? Name the types of organisms responsible."},{"n":5,"step":"Explain how decomposition connects to the nutrient cycle."}]'::jsonb,
 '#2e9e6b', '#1f5c3f', '#e5f5ed', 'foundation'),

('mirror-angle-reflection', 'Experiment', 'Physics',
 'Verify the law of reflection',
 'Measure angles of incidence and reflection using a plane mirror.',
 'Household', '25 min', 'Angle of incidence equals angle of reflection',
 'Confirm the law of reflection and construct a simple ray diagram.',
 '["Small flat mirror","Torch or ray box (or phone torch with cardboard slit)","Protractor","Plain paper","Pencil","Book to hold mirror upright"]'::jsonb,
 'No significant hazards.',
 '[{"n":1,"step":"Stand the mirror on a sheet of paper. Draw a line along the mirror and draw a normal (perpendicular) to it."},{"n":2,"step":"Shine a ray at 30° to the normal. Mark the incident and reflected rays with dots."},{"n":3,"step":"Remove the mirror. Draw both rays and measure the angles of incidence and reflection."},{"n":4,"step":"Repeat for 45° and 60°."},{"n":5,"step":"State the law of reflection based on your results."}]'::jsonb,
 '#185fa5', '#0c3d71', '#e6f1fb', 'foundation'),

-- MATHEMATICS-CONNECTED LAB (measurement and data)
('measurement-accuracy', 'Investigation', 'General Science',
 'Investigate measurement accuracy and precision',
 'Compare measurements made by different tools and students to explore errors.',
 'Household', '35 min', 'All measurements carry uncertainty',
 'Distinguish between accuracy and precision, and calculate mean and range.',
 '["Ruler","Tape measure","Set of identical objects to measure (e.g. 10 pencils)","Notepad","Calculator"]'::jsonb,
 'No significant hazards.',
 '[{"n":1,"step":"Measure the length of one pencil ten times using the same ruler. Record each reading."},{"n":2,"step":"Calculate the mean, the range, and identify any outliers."},{"n":3,"step":"Ask two classmates to measure the same pencil with their own rulers. Compare results."},{"n":4,"step":"Now measure the same pencil with a tape measure. Is the result different?"},{"n":5,"step":"Explain the difference between accuracy (how close to the true value) and precision (how consistent the readings are)."}]'::jsonb,
 '#9b59b6', '#5c2d91', '#f3e8ff', 'foundation')

ON CONFLICT (slug) DO NOTHING;


-- ── 3. Mark recurring challenges ─────────────────────────────────────────────
-- These catalog challenges are designed to recur on a set cycle.
UPDATE public.catalog_challenges
SET    recurring = true, recurs_every_days = 7
WHERE  slug IN ('algebra-speed-sprint', 'science-facts-blitz');

UPDATE public.catalog_challenges
SET    recurring = true, recurs_every_days = 30
WHERE  slug = 'units-conversion-sprint';


-- ── 4. next_best_action() — adds mastery-linked challenge recommendation ──────
-- Inserts the 'challenge' signal between goal (5) and the fallback.
-- When the student has a concept in Secure or Mastered state with a linked
-- lab/challenge in the catalog, suggest it.
create or replace function public.next_best_action()
returns jsonb
language plpgsql security definer set search_path = public stable
as $$
declare
  v_uid     uuid := auth.uid();
  v_cands   jsonb := '[]'::jsonb;
  r         record;
  v_recall  int;
  v_paths   int;
  v_prereq  record;
begin
  if v_uid is null then return '{}'::jsonb; end if;

  -- ── 0. Prerequisite gap ───────────────────────────────────────────────────
  select
    mp.concept_name        as blocked_concept,
    c_pre.name             as prerequisite_name,
    c_pre.slug             as prerequisite_slug,
    mp.id                  as path_id
  into v_prereq
  from public.mastery_paths mp
  join public.concepts c_blocked on c_blocked.name = mp.concept_name
  join public.concept_relationships cr
    on cr.target_concept_id = c_blocked.id
    and cr.relationship_type = 'prerequisite_of'
  join public.concepts c_pre on c_pre.id = cr.source_concept_id
  left join public.mastery_profiles prof
    on prof.user_id = v_uid and prof.concept_id = c_pre.id
  where mp.user_id = v_uid
    and mp.status = 'active'
    and mp.pct < 30
    and (prof.id is null or prof.overall_state not in ('Secure','Mastered'))
  order by mp.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',           'prerequisite_gap',
      'action',        'Learn ' || v_prereq.prerequisite_name || ' first',
      'reason',        'You are working on ' || v_prereq.blocked_concept || ', but it builds on ' || v_prereq.prerequisite_name || '. A quick foundation session will make the harder topic much easier.',
      'route',         '/student/learn?concept=' || v_prereq.prerequisite_slug,
      'est_minutes',   15,
      'blocked_concept', v_prereq.blocked_concept,
      'prerequisite',    v_prereq.prerequisite_name
    );
  end if;

  -- ── 0b. Decayed mastery ───────────────────────────────────────────────────
  select mp.concept_name, c.slug, mp.overall_state
  into r
  from public.mastery_profiles mp
  join public.concepts c on c.id = mp.concept_id
  where mp.user_id   = v_uid
    and mp.decayed_at is not null
    and mp.decayed_at > now() - interval '14 days'
    and mp.overall_state not in ('Mastered')
  order by mp.decayed_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'decay_review',
      'action',      'Refresh ' || r.concept_name || ' before it fades',
      'reason',      'It has been a while since you practised ' || r.concept_name || '. A short session will bring it back to ' || r.overall_state || '.',
      'route',       '/student/learn?concept=' || r.slug,
      'est_minutes', 10
    );
  end if;

  -- ── 0c. Explanation not working ───────────────────────────────────────────
  select ee.content_unit_id, c.name as concept_name, c.slug, count(*) as fail_count
  into r
  from public.explanation_effectiveness ee
  join public.content_units cu on cu.id = ee.content_unit_id
  join public.concepts c on c.id = ee.concept_id
  where ee.user_id   = v_uid
    and ee.passed    = false
    and ee.created_at >= now() - interval '30 days'
  group by ee.content_unit_id, c.name, c.slug
  having count(*) >= 3
  order by count(*) desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'explanation_weak',
      'action',      'Try a different explanation for ' || r.concept_name,
      'reason',      'The current explanation for ' || r.concept_name || ' has not been clicking. mytuta has another approach that may work better for you.',
      'route',       '/student/learn?concept=' || r.slug || '&mode=alternative',
      'est_minutes', 8
    );
  end if;

  -- ── 1. Urgent teacher assignment ──────────────────────────────────────────
  select a.id, a.title, a.deadline, a.assessment_id, a.experience_id into r
  from public.assignments a
  join public.class_students cs on cs.class_id = a.class_id and cs.student_id = v_uid
  where a.deadline is not null
    and a.deadline >= current_date
    and a.deadline <= current_date + 5
    and (a.assessment_id is null or not exists (
          select 1 from public.assessment_submissions s
          where s.assessment_id = a.assessment_id and s.student_id = v_uid and s.submitted_at is not null))
    and (a.experience_id is null or not exists (
          select 1 from public.experience_progress ep
          where ep.experience_id = a.experience_id and ep.user_id = v_uid and ep.status = 'completed'))
  order by a.deadline asc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'assignment',
      'action',      'Complete your teacher''s assignment',
      'reason',      'Your teacher set "' || coalesce(r.title, 'an assignment') || '", due ' || to_char(r.deadline, 'Dy DD Mon') || '.',
      'route',       case
                       when r.assessment_id is not null then '/student/assessments/' || r.assessment_id
                       when r.experience_id is not null  then '/student/experiences/' || r.experience_id
                       else '/student/assignments'
                     end,
      'est_minutes', 20
    );
  end if;

  -- ── 2. Continue unfinished active Mastery Path ────────────────────────────
  select id, concept_name, stage_label, current_stage, pct into r
  from public.mastery_paths
  where user_id = v_uid and status = 'active' and coalesce(pct,0) < 100
  order by updated_at desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'continue',
      'action',      'Continue ' || r.concept_name,
      'reason',      'You reached ' || coalesce(nullif(r.stage_label,''), 'stage ' || (r.current_stage + 1)) || ' (' || coalesce(r.pct,0) || '% done). Pick up where you stopped.',
      'route',       '/student/mastery/' || r.id,
      'est_minutes', 10
    );
  end if;

  -- ── 3. Recall cards due ───────────────────────────────────────────────────
  select count(*) into v_recall
  from public.recall_cards where user_id = v_uid and due_at <= current_date;

  if v_recall > 0 then
    v_cands := v_cands || jsonb_build_object(
      'key',         'recall',
      'action',      'Review ' || v_recall || ' item' || case when v_recall = 1 then '' else 's' end || ' before you forget',
      'reason',      'A short review keeps what you have already learned from slipping away.',
      'route',       '/student/review',
      'est_minutes', least(v_recall * 1, 10)
    );
  end if;

  -- ── 4. Repeated misconception ─────────────────────────────────────────────
  select mistake_category, count(*) as n into r
  from public.attempts
  where user_id = v_uid
    and mistake_category is not null
    and created_at >= now() - interval '30 days'
  group by mistake_category
  having count(*) >= 3
  order by count(*) desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'misconception',
      'action',      'Target your ' || r.mistake_category || ' errors',
      'reason',      'You have made ' || r.n || ' ' || r.mistake_category || ' errors recently. A focused practice set will help.',
      'route',       '/student/solve',
      'est_minutes', 8
    );
  end if;

  -- ── 5. Active goal ────────────────────────────────────────────────────────
  select g.title, g.concept_id into r
  from public.student_goals g
  where g.user_id = v_uid and g.status = 'active'
  order by g.created_at desc limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'goal',
      'action',      'Work toward: ' || r.title,
      'reason',      'This is a goal you set. A focused session moves you closer.',
      'route',       '/student/learn',
      'est_minutes', 12
    );
  end if;

  -- ── 6. Mastery-linked challenge ───────────────────────────────────────────
  -- When the student has a concept in Secure or Mastered state and there is
  -- a catalog challenge linked to that concept via concept_relationships
  -- (relationship_type = 'used_in_challenge'), surface it.
  select
    cc.title  as challenge_title,
    cc.slug   as challenge_slug,
    cc.id     as challenge_id,
    c.name    as concept_name
  into r
  from public.mastery_profiles mprof
  join public.concepts c on c.id = mprof.concept_id
  join public.concept_relationships cr
    on cr.source_concept_id = c.id
    and cr.relationship_type = 'used_in_challenge'
  join public.catalog_challenges cc
    on cc.concept_id = cr.target_concept_id
       or cc.id::text = cr.target_concept_id::text
  where mprof.user_id = v_uid
    and mprof.overall_state in ('Secure', 'Mastered')
    -- has not already submitted this challenge
    and not exists (
      select 1 from public.challenge_entries ce
      where ce.challenge_id = cc.id
        and ce.student_id = v_uid
        and ce.status in ('submitted', 'graded')
    )
  order by mprof.updated_at desc
  limit 1;

  if found then
    v_cands := v_cands || jsonb_build_object(
      'key',         'challenge',
      'action',      'Take on the ' || r.challenge_title || ' challenge',
      'reason',      'You have a strong grasp of ' || r.concept_name || '. This challenge puts that knowledge to work in a real problem.',
      'route',       '/student/challenges',
      'challenge_id', r.challenge_id,
      'est_minutes', 30
    );
  end if;

  -- ── Fallback ──────────────────────────────────────────────────────────────
  select count(*) into v_paths from public.mastery_paths where user_id = v_uid;

  if v_paths = 0 then
    v_cands := v_cands || jsonb_build_object(
      'key',         'start',
      'action',      'Start your first Mastery Path',
      'reason',      'Pick a concept you want to understand and mytuta builds a path from a quick check to proven mastery.',
      'route',       '/student/learn',
      'est_minutes', 15
    );
  else
    v_cands := v_cands || jsonb_build_object(
      'key',         'explore',
      'action',      'Explore a new concept',
      'reason',      'You are up to date. Extend your learning with something new.',
      'route',       '/student/learn',
      'est_minutes', 12
    );
  end if;

  return jsonb_build_object(
    'primary',      v_cands->0,
    'alternatives', coalesce(
      (select jsonb_agg(e)
       from (select e from jsonb_array_elements(v_cands) with ordinality t(e, ord)
             where ord > 1 and ord <= 4) s
      ), '[]'::jsonb)
  );
end;
$$;

grant execute on function public.next_best_action() to authenticated;
