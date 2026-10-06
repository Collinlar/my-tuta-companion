-- Tier A content packages: 15 flagship concepts get approved Content Units.
-- Each concept receives: Core Explanation, 2 Worked Examples, 3 Guided Problems,
-- 2 Independent Problems, Recall Cards, 2 Mastery Check Items, 2 Interventions.
-- All units start as review_status = 'draft' so academic reviewers can approve before publish.
-- ai_generated = false because these are authored seed content.

-- =========================================================
-- Helper: insert content units for a concept by slug
-- =========================================================

DO $$
DECLARE
  c_id uuid;
BEGIN

-- =========================================================
-- 1. LINEAR EQUATIONS
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'linear-equations';

INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES

(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"What is a linear equation?","body":"A linear equation has one unknown (usually x) and the highest power of x is 1. Solving it means finding the value of x that makes both sides equal. The key rule: whatever you do to one side, you must do to the other side.","example":{"problem":"Solve 3x + 5 = 14","steps":["Subtract 5 from both sides: 3x = 9","Divide both sides by 3: x = 3"],"check":"3(3) + 5 = 14 ✓"},"local_context":"Kofi sells airtime at GHS 5 each. If his total sales are GHS 35, how many did he sell? Write 5x = 35, then x = 7."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'core', 6,
 '{"problem":"Solve 2x − 3 = 7","concept":"Linear equations","skill":"Calculation","difficulty":"Standard","steps":[{"n":1,"title":"Add 3 to both sides","work":"2x − 3 + 3 = 7 + 3","result":"2x = 10"},{"n":2,"title":"Divide both sides by 2","work":"2x ÷ 2 = 10 ÷ 2","result":"x = 5"},{"n":3,"title":"Check","work":"2(5) − 3 = 10 − 3 = 7 ✓","result":"Correct"}],"common_mistake":"Forgetting to apply the same operation to both sides."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'extension', 7,
 '{"problem":"Solve 4(x + 2) = 20","concept":"Linear equations","skill":"Calculation","difficulty":"Extension","steps":[{"n":1,"title":"Expand the bracket","work":"4x + 8 = 20"},{"n":2,"title":"Subtract 8 from both sides","work":"4x = 12"},{"n":3,"title":"Divide by 4","work":"x = 3"},{"n":4,"title":"Check","work":"4(3 + 2) = 4(5) = 20 ✓"}],"common_mistake":"Not expanding the bracket before subtracting."}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'foundation', 10,
 '{"question":"Solve 5x + 2 = 17","hints":[{"step":1,"prompt":"What would you do first to isolate the x term?","hint":"Subtract 2 from both sides."},{"step":2,"prompt":"After subtracting, what equation do you have?","hint":"5x = 15"},{"step":3,"prompt":"Now find x.","hint":"Divide both sides by 5: x = 3."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'core', 10,
 '{"question":"Ama thinks of a number. She multiplies it by 3 and adds 4. The result is 19. Write and solve the equation.","hints":[{"step":1,"prompt":"Let the number be n. Write the equation.","hint":"3n + 4 = 19"},{"step":2,"prompt":"Subtract 4 from both sides.","hint":"3n = 15"},{"step":3,"prompt":"Divide by 3.","hint":"n = 5"}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'extension', 12,
 '{"question":"Solve 2(3x − 1) = 16","hints":[{"step":1,"prompt":"Expand the bracket first.","hint":"6x − 2 = 16"},{"step":2,"prompt":"Add 2 to both sides.","hint":"6x = 18"},{"step":3,"prompt":"Divide by 6.","hint":"x = 3"}]}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'core', 12,
 '{"question":"Solve 7x − 4 = 24","correct_answer":"x = 4","explanation":"Add 4 to get 7x = 28, then divide by 7.","skill":"Calculation"}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'extension', 12,
 '{"question":"A rectangle has length (2x + 3) cm and width 4 cm. Its perimeter is 34 cm. Find x.","correct_answer":"x = 2.5","explanation":"Perimeter = 2(2x+3) + 2(4) = 34. So 4x + 6 + 8 = 34, 4x = 20, x = 5.","skill":"Application","common_mistake":"Forgetting perimeter uses both pairs of sides."}',
 'draft', false),

(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 5,
 '{"cards":[{"front":"What is the golden rule for solving equations?","back":"Whatever you do to one side, do to the other side."},{"front":"Solve: x + 7 = 12","back":"x = 5"},{"front":"What does it mean to solve an equation?","back":"Find the value of the unknown that makes both sides equal."},{"front":"Solve: 3x = 18","back":"x = 6"}]}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 8,
 '{"question":"Solve 5(x − 2) = 15","options":["x = 5","x = 1","x = 7","x = 3"],"correct":"x = 5","explanation":"Expand: 5x − 10 = 15. Add 10: 5x = 25. Divide by 5: x = 5.","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'extension', 10,
 '{"question":"Yaw earns GHS 12 per hour. After working for h hours he has earned GHS 84. Write and solve an equation to find h.","correct_answer":"h = 7","explanation":"12h = 84, so h = 7 hours.","skill":"Application","type":"Short Answer"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'foundation', 8,
 '{"misconception":"Students change the sign when moving terms instead of applying inverse operations.","title":"The balance method","explanation":"Think of the equation as a set of scales. Both sides must always be equal. Instead of moving a term, undo it with the opposite operation on both sides.","example":{"problem":"3x + 6 = 15","wrong":"3x = 15 + 6 (wrong: added instead of subtracting)","right":"3x = 15 − 6 = 9, then x = 3"},"follow_up":"Try: 2x + 5 = 13"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'core', 8,
 '{"misconception":"Students forget to expand brackets before solving.","title":"Expand first, always","explanation":"When brackets are multiplied by a number, every term inside must be multiplied. Write it out fully before doing anything else.","example":{"problem":"3(x + 4) = 21","wrong":"3x + 4 = 21 (wrong: did not multiply 4)","right":"3x + 12 = 21, so 3x = 9, x = 3"},"follow_up":"Try: 2(x + 5) = 16"}',
 'draft', false)

ON CONFLICT DO NOTHING;


-- =========================================================
-- 2. FRACTIONS
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'fractions';

INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES

(c_id, 'Core Explanation', 'Lower secondary', 'core', 7,
 '{"title":"What is a fraction?","body":"A fraction represents part of a whole. The number on the bottom (denominator) tells you how many equal parts the whole is divided into. The number on the top (numerator) tells you how many of those parts you have. For example, 3/4 means 3 out of 4 equal parts.","key_ideas":["Equivalent fractions: 1/2 = 2/4 = 4/8","Simplifying: divide top and bottom by the HCF","Comparing: use a common denominator"],"local_context":"If you share a loaf of bread into 8 equal pieces and take 3, you have taken 3/8 of the loaf."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'core', 6,
 '{"problem":"Add 2/3 + 1/4","steps":[{"n":1,"title":"Find the LCM of 3 and 4","work":"LCM = 12"},{"n":2,"title":"Convert both fractions","work":"2/3 = 8/12, 1/4 = 3/12"},{"n":3,"title":"Add the numerators","work":"8/12 + 3/12 = 11/12"},{"n":4,"title":"Check it cannot be simplified","work":"HCF(11,12) = 1, already in lowest terms"}],"common_mistake":"Adding numerators and denominators separately (2+1)/(3+4) = 3/7 — wrong."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'extension', 7,
 '{"problem":"Multiply 3/5 × 2/7","steps":[{"n":1,"title":"Multiply numerators","work":"3 × 2 = 6"},{"n":2,"title":"Multiply denominators","work":"5 × 7 = 35"},{"n":3,"title":"Result","work":"6/35"},{"n":4,"title":"Simplify","work":"HCF(6,35) = 1, so 6/35 is in lowest terms"}],"common_mistake":"Using LCM for multiplication instead of just multiplying straight across."}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'foundation', 8,
 '{"question":"Simplify 12/18","hints":[{"step":1,"prompt":"Find the HCF of 12 and 18.","hint":"HCF = 6"},{"step":2,"prompt":"Divide both numerator and denominator by 6.","hint":"12÷6 = 2, 18÷6 = 3"},{"step":3,"prompt":"Write the simplified fraction.","hint":"2/3"}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'core', 10,
 '{"question":"Kwame eats 1/3 of a pizza. His sister eats 1/4 of the same pizza. What fraction have they eaten altogether?","hints":[{"step":1,"prompt":"What is the LCM of 3 and 4?","hint":"12"},{"step":2,"prompt":"Convert both fractions to twelfths.","hint":"1/3 = 4/12 and 1/4 = 3/12"},{"step":3,"prompt":"Add them.","hint":"4/12 + 3/12 = 7/12"}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'extension', 10,
 '{"question":"Calculate 3/4 ÷ 3/8","hints":[{"step":1,"prompt":"Flip the second fraction and multiply.","hint":"3/4 × 8/3"},{"step":2,"prompt":"Multiply the numerators and denominators.","hint":"24/12"},{"step":3,"prompt":"Simplify.","hint":"2"}]}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'core', 10,
 '{"question":"Calculate 5/6 − 1/4","correct_answer":"7/12","explanation":"LCM = 12. 5/6 = 10/12. 1/4 = 3/12. 10/12 − 3/12 = 7/12.","skill":"Calculation"}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'extension', 12,
 '{"question":"Akosua spends 2/5 of her pocket money on food and 1/3 on transport. What fraction is left?","correct_answer":"4/15","explanation":"2/5 + 1/3 = 6/15 + 5/15 = 11/15 spent. 1 − 11/15 = 4/15 left.","skill":"Application"}',
 'draft', false),

(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the denominator?","back":"The bottom number — how many equal parts the whole is divided into."},{"front":"How do you simplify a fraction?","back":"Divide both numerator and denominator by their HCF."},{"front":"How do you add fractions with different denominators?","back":"Find a common denominator first, then add the numerators."},{"front":"What is 1/2 + 1/3?","back":"5/6"}]}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"Calculate 3/4 + 2/5","options":["5/9","23/20","1 3/20","11/20"],"correct":"23/20","explanation":"LCM = 20. 3/4 = 15/20. 2/5 = 8/20. 15/20 + 8/20 = 23/20.","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'extension', 8,
 '{"question":"A bag of rice weighs 5/8 kg. If you use 1/4 kg for cooking, what fraction of the original bag remains?","correct_answer":"3/8","explanation":"5/8 − 1/4 = 5/8 − 2/8 = 3/8 kg remains.","skill":"Application","type":"Short Answer"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'foundation', 7,
 '{"misconception":"Students add both numerators and both denominators separately: 1/2 + 1/3 = 2/5.","title":"You cannot add denominators","explanation":"The denominator names the size of the piece. Changing it changes the meaning. You must first cut all pieces to the same size (common denominator) before you can count them.","example":{"visual":"Imagine cutting a bar into 2 equal pieces (1/2) and then into 3 equal pieces (1/3). The pieces are different sizes — you cannot just add them until you use the same cut."},"follow_up":"Find the LCM of 4 and 5, then add 1/4 + 2/5."}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'core', 7,
 '{"misconception":"Students multiply denominators when adding instead of finding the LCM.","title":"Always find the LCM","explanation":"You need the smallest number both denominators divide into. Multiplying the denominators always works but gives a larger number you then have to simplify.","example":{"problem":"1/3 + 1/4","lcm_method":"LCM = 12. 4/12 + 3/12 = 7/12","multiply_method":"3×4 = 12. 4/12 + 3/12 = 7/12 — same answer, but harder to simplify if HCF is not 1."}}',
 'draft', false)

ON CONFLICT DO NOTHING;


-- =========================================================
-- 3. CELLS
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'cells';

INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES

(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"The cell: the basic unit of life","body":"All living things are made of cells. A cell is the smallest unit that can carry out the processes of life. Animal cells and plant cells share some structures but plants have extra ones because they make their own food.","structures":{"shared":["Cell membrane — controls what enters and leaves","Nucleus — contains DNA and controls the cell","Cytoplasm — jelly-like fluid where reactions happen","Mitochondria — release energy from glucose"],"plant_only":["Cell wall — extra support made of cellulose","Chloroplasts — capture light for photosynthesis","Vacuole — large, stores water and keeps the cell firm"]},"local_context":"When you eat kenkey, your gut cells absorb the nutrients through their cell membranes."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'core', 6,
 '{"problem":"Give two differences between an animal cell and a plant cell.","approach":"Compare the structures each has that the other does not.","answer":[{"feature":"Cell wall","animal":"No cell wall","plant":"Has a rigid cell wall made of cellulose"},{"feature":"Chloroplast","animal":"No chloroplasts","plant":"Has chloroplasts for photosynthesis"}],"common_mistake":"Saying the nucleus is only in plant cells — both have a nucleus."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'extension', 7,
 '{"problem":"Explain why a plant cell kept in the dark for a long time would lose its green colour.","steps":[{"n":1,"title":"What causes the green colour?","work":"Chlorophyll in chloroplasts"},{"n":2,"title":"What does chlorophyll need?","work":"Light to function; without light photosynthesis stops"},{"n":3,"title":"Long-term effect","work":"Without photosynthesis the plant cannot produce glucose; chloroplasts degrade and the green pigment is lost"}],"skill":"Reasoning"}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'foundation', 8,
 '{"question":"A student looks at a cell under a microscope. It has a cell wall, a large vacuole, and chloroplasts. Is it a plant cell or an animal cell? Explain.","hints":[{"step":1,"prompt":"Which structures are only found in plant cells?","hint":"Cell wall, large vacuole, and chloroplasts are plant-only features."},{"step":2,"prompt":"Name the type.","hint":"It must be a plant cell."},{"step":3,"prompt":"Give a reason using evidence from the question.","hint":"It has all three plant-specific structures: cell wall, large vacuole, and chloroplasts."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'core', 10,
 '{"question":"State the function of each: (a) nucleus, (b) cell membrane, (c) mitochondria.","hints":[{"step":1,"prompt":"What does the nucleus do?","hint":"Controls the activities of the cell; contains DNA with genetic information."},{"step":2,"prompt":"What does the cell membrane do?","hint":"Controls what enters and exits the cell (selective permeability)."},{"step":3,"prompt":"What do mitochondria do?","hint":"Site of aerobic respiration — release energy from glucose."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'extension', 12,
 '{"question":"A red blood cell has no nucleus. Suggest an advantage and a disadvantage of this.","hints":[{"step":1,"prompt":"What does losing the nucleus allow?","hint":"More space for haemoglobin — the cell can carry more oxygen."},{"step":2,"prompt":"What does lacking a nucleus prevent?","hint":"The cell cannot repair itself or divide; it has a short lifespan."}]}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'core', 10,
 '{"question":"Name the organelle responsible for each function: (a) energy release, (b) protein synthesis, (c) controlling cell activities.","correct_answer":"(a) Mitochondria, (b) Ribosomes, (c) Nucleus","skill":"Recall"}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'extension', 12,
 '{"question":"Explain why muscle cells contain many more mitochondria than skin cells.","correct_answer":"Muscle cells require large amounts of energy for contraction. More mitochondria means more aerobic respiration and more ATP produced to meet this demand.","skill":"Reasoning"}',
 'draft', false),

(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What controls what enters and exits the cell?","back":"The cell membrane"},{"front":"Where is DNA stored in the cell?","back":"In the nucleus"},{"front":"Which organelle releases energy from glucose?","back":"Mitochondria"},{"front":"Name two structures found only in plant cells.","back":"Cell wall and chloroplasts"}]}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"Which organelle is responsible for photosynthesis?","options":["Mitochondria","Nucleus","Chloroplast","Cell membrane"],"correct":"Chloroplast","explanation":"Chloroplasts contain chlorophyll and are the site of photosynthesis in plant cells.","skill":"Recall","type":"Multiple Choice"}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'extension', 8,
 '{"question":"Explain why plant cells but not animal cells have a cell wall.","correct_answer":"Plant cells need the rigid cell wall for structural support and to prevent them from bursting when they absorb water. Animal cells do not need this because they regulate water content differently and have a more flexible structure.","skill":"Reasoning","type":"Short Answer"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'foundation', 7,
 '{"misconception":"Students confuse the cell membrane with the cell wall.","title":"Membrane vs wall: two different things","explanation":"Every cell (plant and animal) has a cell membrane — it is thin and flexible, and it controls what goes in and out. Only plant cells also have a cell wall — it is thick and rigid, and it gives extra support. The membrane is always inside the wall in plant cells.","follow_up":"Draw a plant cell and label both the cell wall and the cell membrane."}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'core', 7,
 '{"misconception":"Students think the nucleus is the powerhouse of the cell (confusing it with mitochondria).","title":"Nucleus controls, mitochondria powers","explanation":"The nucleus contains DNA and controls the cell activities — it is like the manager. Mitochondria release energy through respiration — they are the power stations. These are two different organelles with two different jobs.","follow_up":"What would happen to a cell if its mitochondria stopped working?"}',
 'draft', false)

ON CONFLICT DO NOTHING;


-- =========================================================
-- 4. FORCES
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'forces';

INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES

(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"Forces and their effects","body":"A force is a push or pull on an object. Forces can change an object speed, direction, or shape. Newton first law: an object stays at rest or moves at constant speed unless a net force acts on it. Newton second law: Force = mass × acceleration (F = ma). Newton third law: every action has an equal and opposite reaction.","units":"Force is measured in newtons (N). Mass in kilograms (kg). Acceleration in m/s².","local_context":"When Kwame pushes a market trolley, he applies a force. The heavier the load, the more force needed for the same acceleration."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'core', 6,
 '{"problem":"A 5 kg box is pushed with a net force of 20 N. What is its acceleration?","steps":[{"n":1,"title":"Identify the formula","work":"F = ma, so a = F/m"},{"n":2,"title":"Substitute values","work":"a = 20 ÷ 5"},{"n":3,"title":"Calculate","work":"a = 4 m/s²"}],"common_mistake":"Using weight (W = mg) instead of net force."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'extension', 7,
 '{"problem":"A car of mass 1200 kg accelerates at 3 m/s². What net force acts on it?","steps":[{"n":1,"title":"Formula","work":"F = ma"},{"n":2,"title":"Substitute","work":"F = 1200 × 3"},{"n":3,"title":"Answer","work":"F = 3600 N"}],"skill":"Calculation"}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'foundation', 8,
 '{"question":"What net force is needed to accelerate a 2 kg ball at 5 m/s²?","hints":[{"step":1,"prompt":"Which formula links force, mass and acceleration?","hint":"F = ma"},{"step":2,"prompt":"Substitute the values.","hint":"F = 2 × 5"},{"step":3,"prompt":"Calculate.","hint":"F = 10 N"}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'core', 10,
 '{"question":"A 10 kg object is at rest. Explain what this tells us about the forces acting on it.","hints":[{"step":1,"prompt":"What does Newton first law say about a stationary object?","hint":"A stationary object has zero net force acting on it."},{"step":2,"prompt":"Does this mean no forces are acting?","hint":"No — there may be forces, but they are balanced and cancel out."},{"step":3,"prompt":"Give an example.","hint":"Gravity pulls the object down; the surface pushes up with equal force."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'extension', 12,
 '{"question":"Explain using Newton third law what happens when a football player kicks a ball.","hints":[{"step":1,"prompt":"What force does the player apply to the ball?","hint":"A force forward in the direction of the kick."},{"step":2,"prompt":"By Newton third law, what happens to the player foot?","hint":"The ball exerts an equal force backwards on the player foot."},{"step":3,"prompt":"Why does only the ball move significantly?","hint":"The ball has much less mass, so a = F/m gives it a larger acceleration."}]}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'core', 10,
 '{"question":"A net force of 36 N gives a trolley an acceleration of 4 m/s². What is the mass of the trolley?","correct_answer":"9 kg","explanation":"m = F/a = 36 ÷ 4 = 9 kg","skill":"Calculation"}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'extension', 12,
 '{"question":"Explain why it is harder to stop a fully loaded tro-tro than an empty one travelling at the same speed.","correct_answer":"A loaded tro-tro has greater mass. For the same braking force, F = ma means a = F/m — greater mass gives smaller deceleration, so the vehicle takes longer to stop.","skill":"Reasoning"}',
 'draft', false),

(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What is Newton second law?","back":"F = ma (Force = mass × acceleration)"},{"front":"What unit is force measured in?","back":"Newtons (N)"},{"front":"What is a balanced force?","back":"When forces cancel out and the net force is zero"},{"front":"State Newton third law.","back":"Every action has an equal and opposite reaction."}]}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"A net force of 50 N acts on a 10 kg object. What is the acceleration?","options":["0.2 m/s²","5 m/s²","500 m/s²","50 m/s²"],"correct":"5 m/s²","explanation":"a = F/m = 50 ÷ 10 = 5 m/s²","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'extension', 8,
 '{"question":"Two equal forces act in opposite directions on a stationary object. What happens to the object? Explain using Newton first law.","correct_answer":"The object remains stationary. The net force is zero (forces cancel out), so by Newton first law there is no change in motion.","skill":"Reasoning","type":"Short Answer"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'foundation', 7,
 '{"misconception":"Students think a moving object needs a constant force to keep moving.","title":"Newton first law: inertia","explanation":"An object keeps moving at constant speed if there is no net force. The reason things slow down is friction or air resistance — if you remove all resistance, no force is needed to maintain speed. This is inertia.","follow_up":"If you slide a book across a smooth table and a rough table, where does it stop faster and why?"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'core', 7,
 '{"misconception":"Students confuse mass and weight.","title":"Mass is not weight","explanation":"Mass is the amount of matter in an object, measured in kg. It does not change wherever you are. Weight is a force (gravity pulling the mass), measured in Newtons: W = mg. On the moon, your mass stays the same but your weight is less because gravity is weaker.","follow_up":"A person has a mass of 60 kg. On Earth (g = 10 N/kg), what is their weight?"}',
 'draft', false)

ON CONFLICT DO NOTHING;


-- =========================================================
-- 5. ENERGY
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'energy';

INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES

(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"Energy: forms and conservation","body":"Energy is the ability to do work. It exists in many forms: kinetic (movement), potential (stored by position), chemical (stored in bonds), thermal (heat), electrical, light, and sound. Energy cannot be created or destroyed — it is always transferred or transformed. This is the conservation of energy.","key_equations":{"work":"Work (J) = Force (N) × distance (m)","power":"Power (W) = Work (J) ÷ time (s)","efficiency":"Efficiency = useful output ÷ total input × 100%"},"local_context":"When Ama charges her phone, electrical energy is converted to chemical energy stored in the battery. When she uses it, it becomes light, sound, and heat."}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'core', 6,
 '{"problem":"A force of 30 N moves a box 4 m. Calculate the work done.","steps":[{"n":1,"title":"Formula","work":"W = Fd"},{"n":2,"title":"Substitute","work":"W = 30 × 4"},{"n":3,"title":"Answer","work":"W = 120 J"}]}',
 'draft', false),

(c_id, 'Worked Example', 'Lower secondary', 'extension', 7,
 '{"problem":"A motor does 600 J of work in 5 seconds. Calculate its power.","steps":[{"n":1,"title":"Formula","work":"P = W ÷ t"},{"n":2,"title":"Substitute","work":"P = 600 ÷ 5"},{"n":3,"title":"Answer","work":"P = 120 W"}],"skill":"Calculation"}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'foundation', 8,
 '{"question":"A light bulb receives 100 J of electrical energy and produces 15 J of light. Calculate its efficiency.","hints":[{"step":1,"prompt":"What is the formula for efficiency?","hint":"Efficiency = useful output ÷ total input × 100%"},{"step":2,"prompt":"Substitute the values.","hint":"Efficiency = 15 ÷ 100 × 100%"},{"step":3,"prompt":"Calculate.","hint":"15% — the other 85% is wasted as heat."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'core', 10,
 '{"question":"A 2 kg ball is dropped from a height of 5 m. Describe the energy changes from the moment it is released until it hits the ground. (g = 10 N/kg)","hints":[{"step":1,"prompt":"What type of energy does it have at the top?","hint":"Gravitational potential energy: GPE = mgh = 2 × 10 × 5 = 100 J"},{"step":2,"prompt":"What happens to this energy as it falls?","hint":"GPE converts to kinetic energy (KE = ½mv²)"},{"step":3,"prompt":"What is the KE just before impact?","hint":"100 J — assuming no air resistance, all GPE converts to KE."}]}',
 'draft', false),

(c_id, 'Guided Problem', 'Lower secondary', 'extension', 12,
 '{"question":"A solar panel converts 500 J of light energy into 150 J of electrical energy. What is its efficiency? Where does the rest go?","hints":[{"step":1,"prompt":"Calculate efficiency.","hint":"150 ÷ 500 × 100% = 30%"},{"step":2,"prompt":"How much energy is not converted to electricity?","hint":"500 − 150 = 350 J"},{"step":3,"prompt":"Where does this 350 J go?","hint":"It is dissipated as thermal energy (heat) in the panel."}]}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'core', 10,
 '{"question":"A machine does 2400 J of work in 20 seconds. Calculate its power.","correct_answer":"120 W","explanation":"P = W/t = 2400 ÷ 20 = 120 W","skill":"Calculation"}',
 'draft', false),

(c_id, 'Independent Problem', 'Lower secondary', 'extension', 12,
 '{"question":"An electric kettle has a power rating of 2000 W and takes 3 minutes to boil water. Calculate the energy used. Give your answer in joules.","correct_answer":"360000 J","explanation":"P = W/t, so W = P × t = 2000 × 180 = 360000 J","skill":"Calculation"}',
 'draft', false),

(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"State the law of conservation of energy.","back":"Energy cannot be created or destroyed — only transferred or transformed."},{"front":"What is the formula for work done?","back":"W = F × d (force × distance)"},{"front":"What unit is energy measured in?","back":"Joules (J)"},{"front":"What is the formula for power?","back":"P = W ÷ t (work ÷ time)"}]}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"A machine uses 800 J of energy and produces 600 J of useful work. What is its efficiency?","options":["60%","75%","80%","133%"],"correct":"75%","explanation":"Efficiency = 600/800 × 100 = 75%","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false),

(c_id, 'Mastery Check Item', 'Lower secondary', 'extension', 8,
 '{"question":"Explain using the conservation of energy why a ball dropped from a height never bounces back to its original height.","correct_answer":"When the ball hits the ground, some kinetic energy is converted to thermal energy and sound — it is not all converted back to kinetic energy for the bounce. The useful elastic potential energy recovered is always less than the energy before impact, so the ball rises to a lower height.","skill":"Reasoning","type":"Short Answer"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'foundation', 7,
 '{"misconception":"Students think energy is used up or destroyed.","title":"Energy is never destroyed","explanation":"Energy is always conserved — it just changes form. When a car engine runs, chemical energy (petrol) converts to kinetic energy (motion) and thermal energy (heat). The total energy at the end is always equal to the total at the start. Nothing is lost — it changes form.","follow_up":"A phone battery stores 18000 J. After 2 hours it is flat. Where did all the energy go?"}',
 'draft', false),

(c_id, 'Intervention', 'Lower secondary', 'core', 7,
 '{"misconception":"Students mix up power and energy.","title":"Energy vs power: a key difference","explanation":"Energy is the total amount of work done or stored, measured in joules. Power is how fast energy is used, measured in watts (1 W = 1 J/s). A 60 W bulb uses 60 joules every second. A 100 W bulb uses more energy per second — it is more powerful, not more energetic.","follow_up":"Two bulbs both use 3600 J total. One takes 60 s, the other 30 s. Which has greater power?"}',
 'draft', false)

ON CONFLICT DO NOTHING;

-- Additional Tier A concepts (Atoms, Motion, Electricity, Acids/Bases, Genetics,
-- Probability, Angles, Chemical Bonding) follow the same pattern.
-- These are inserted as minimal Core Explanation + 2 Recall Cards starter units
-- to populate the content pipeline for admin review and expansion.

-- =========================================================
-- 6. ATOMIC STRUCTURE (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'atomic-structure';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Upper secondary', 'core', 8,
 '{"title":"Inside the atom","body":"An atom has a tiny positive nucleus made of protons and neutrons. Electrons orbit the nucleus in shells. The atomic number (Z) = number of protons. The mass number (A) = protons + neutrons. Neutral atoms have equal protons and electrons. Ions form when electrons are gained or lost.","electronic_config":"Electrons fill shells 2, 8, 8 outward. The outer shell number determines group in the periodic table.","local_context":"Gold (Au) has atomic number 79 — 79 protons, 79 electrons in a neutral atom."}',
 'draft', false),
(c_id, 'Recall Cards', 'Upper secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the atomic number?","back":"The number of protons in the nucleus of an atom."},{"front":"What is the mass number?","back":"The total number of protons and neutrons in the nucleus."},{"front":"What charge does a proton have?","back":"Positive (+1)"},{"front":"Where are electrons found?","back":"In shells (energy levels) surrounding the nucleus."}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Upper secondary', 'core', 6,
 '{"question":"An atom has atomic number 11 and mass number 23. How many neutrons does it have?","options":["11","12","23","34"],"correct":"12","explanation":"Neutrons = mass number − atomic number = 23 − 11 = 12","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 7. MOTION (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'motion';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"Describing motion","body":"Speed = distance ÷ time. Velocity is speed in a specific direction. Acceleration = change in velocity ÷ time (a = Δv/t). The equations of motion link initial velocity (u), final velocity (v), acceleration (a), time (t), and displacement (s): v = u + at; s = ut + ½at²; v² = u² + 2as.","graphs":{"distance_time":"Gradient = speed. Flat line = stationary. Straight line = constant speed. Curve = changing speed.","velocity_time":"Gradient = acceleration. Area under graph = displacement."},"local_context":"A tro-tro travels 60 km in 1.5 hours on the Accra–Kumasi road. Average speed = 60 ÷ 1.5 = 40 km/h."}',
 'draft', false),
(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the formula for speed?","back":"Speed = distance ÷ time"},{"front":"How do you find acceleration?","back":"a = (v − u) ÷ t (change in velocity ÷ time)"},{"front":"What does the gradient of a velocity-time graph show?","back":"Acceleration"},{"front":"What does the area under a velocity-time graph give?","back":"Displacement"}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"A car accelerates from 10 m/s to 30 m/s in 5 seconds. What is its acceleration?","options":["2 m/s²","4 m/s²","6 m/s²","8 m/s²"],"correct":"4 m/s²","explanation":"a = (30 − 10) ÷ 5 = 20 ÷ 5 = 4 m/s²","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 8. ELECTRICITY (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'electricity';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Upper secondary', 'core', 9,
 '{"title":"Circuits, Ohm law, and power","body":"Current (I) is the flow of charge, measured in amps (A). Voltage (V) is the energy per unit charge, measured in volts. Resistance (R) opposes current flow, measured in ohms (Ω). Ohm law: V = IR. In series circuits: total resistance = sum of individual resistances, same current throughout. In parallel: voltage is the same across branches; total resistance is less than the smallest. Power: P = VI = I²R = V²/R.","local_context":"ECG uses voltage, current, and resistance every time you connect an appliance to a socket."}',
 'draft', false),
(c_id, 'Recall Cards', 'Upper secondary', 'foundation', 4,
 '{"cards":[{"front":"State Ohm law.","back":"V = IR (Voltage = Current × Resistance)"},{"front":"What is the formula for power in a circuit?","back":"P = VI"},{"front":"In a series circuit, how does current flow?","back":"The same current flows through every component."},{"front":"In a parallel circuit, how is voltage distributed?","back":"The same voltage appears across each parallel branch."}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Upper secondary', 'core', 6,
 '{"question":"A 12 V battery drives a current of 3 A through a resistor. What is the resistance?","options":["4 Ω","36 Ω","0.25 Ω","9 Ω"],"correct":"4 Ω","explanation":"R = V ÷ I = 12 ÷ 3 = 4 Ω","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 9. GENETICS (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'genetics';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Upper secondary', 'core', 9,
 '{"title":"Inheritance and genetic variation","body":"DNA carries genetic information in genes. Each gene exists in different forms called alleles. Dominant alleles are expressed even when only one copy is present. Recessive alleles are only expressed when two copies are present (homozygous recessive). A Punnett square predicts the probability of offspring genotypes. Key terms: genotype (genetic make-up), phenotype (observable characteristic), homozygous (both alleles identical), heterozygous (two different alleles).","local_context":"Sickle cell anaemia follows a recessive inheritance pattern common in West Africa."}',
 'draft', false),
(c_id, 'Recall Cards', 'Upper secondary', 'foundation', 4,
 '{"cards":[{"front":"What is an allele?","back":"An alternative form of a gene."},{"front":"What is a dominant allele?","back":"An allele that is expressed even when only one copy is present."},{"front":"What is homozygous?","back":"Having two identical alleles for a gene (e.g. AA or aa)."},{"front":"What tool is used to predict offspring ratios?","back":"A Punnett square"}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Upper secondary', 'core', 6,
 '{"question":"Two parents are both heterozygous for sickle cell trait (Ss). What is the probability their child will have sickle cell disease (ss)?","options":["0%","25%","50%","75%"],"correct":"25%","explanation":"Punnett square: SS, Ss, Ss, ss. Only ss has the disease = 1 out of 4 = 25%.","skill":"Reasoning","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 10. ACIDS AND BASES (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'acids-bases';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"Acids, bases, and the pH scale","body":"Acids produce H⁺ ions in solution and have pH below 7. Bases accept H⁺ ions. Alkalis are soluble bases and have pH above 7. Neutral solutions have pH = 7. Neutralisation: acid + base → salt + water. Common examples: hydrochloric acid (HCl), sulfuric acid (H₂SO₄), sodium hydroxide (NaOH).","indicators":"Litmus turns red in acid, blue in base. Universal indicator gives a range of colours.","local_context":"Tomatoes are acidic (pH ≈ 4). Soap is alkaline (pH ≈ 9–10). Drinking water is near-neutral."}',
 'draft', false),
(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What pH value indicates a neutral solution?","back":"pH 7"},{"front":"What do acids produce when dissolved in water?","back":"H⁺ (hydrogen) ions"},{"front":"What is neutralisation?","back":"Acid + base → salt + water"},{"front":"What colour does litmus turn in an acid?","back":"Red"}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"Which solution has the highest concentration of H⁺ ions?","options":["pH 7","pH 2","pH 9","pH 5"],"correct":"pH 2","explanation":"A lower pH means a higher concentration of H⁺ ions. pH 2 is more acidic than pH 5 or 7.","skill":"Interpretation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 11. ANGLES (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'angles';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Lower secondary', 'core', 7,
 '{"title":"Angle properties","body":"Angles on a straight line add to 180°. Angles at a point add to 360°. Vertically opposite angles are equal. Parallel lines cut by a transversal: alternate angles are equal (Z-angles), co-interior angles add to 180° (C-angles), corresponding angles are equal (F-angles). Interior angles of a triangle sum to 180°. Interior angles of a polygon sum to (n − 2) × 180°.","local_context":"Architects in Accra use angle properties to design buildings with right angles and parallel walls."}',
 'draft', false),
(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What do angles on a straight line add up to?","back":"180°"},{"front":"What do vertically opposite angles equal?","back":"They are equal to each other."},{"front":"What do interior angles of a triangle sum to?","back":"180°"},{"front":"What do corresponding angles (F-angles) equal?","back":"They are equal when lines are parallel."}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 5,
 '{"question":"Two angles on a straight line are 65° and x°. Find x.","options":["65°","115°","125°","180°"],"correct":"115°","explanation":"Angles on a straight line sum to 180°. x = 180 − 65 = 115°.","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 12. PROBABILITY (starter package)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'probability';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Upper secondary', 'core', 8,
 '{"title":"Probability: measuring chance","body":"Probability = number of favourable outcomes ÷ total number of possible outcomes. Probability ranges from 0 (impossible) to 1 (certain). The probability of an event not happening = 1 − P(event). For independent events: P(A and B) = P(A) × P(B). For mutually exclusive events: P(A or B) = P(A) + P(B). Tree diagrams show all possible outcomes across multiple events.","local_context":"If you pick a ball at random from a bag containing 4 red and 6 blue balls, P(red) = 4/10 = 2/5."}',
 'draft', false),
(c_id, 'Recall Cards', 'Upper secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the formula for probability?","back":"P(event) = favourable outcomes ÷ total outcomes"},{"front":"What is the probability of a certain event?","back":"1"},{"front":"If P(A) = 0.3, what is P(not A)?","back":"1 − 0.3 = 0.7"},{"front":"How do you find the probability of two independent events both occurring?","back":"Multiply their individual probabilities: P(A) × P(B)"}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Upper secondary', 'core', 6,
 '{"question":"A bag contains 3 red balls and 7 blue balls. A ball is picked at random. What is P(red)?","options":["3/10","7/10","3/7","1/3"],"correct":"3/10","explanation":"P(red) = 3 ÷ (3+7) = 3/10","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 13. CHEMICAL BONDING (starter package — already seeded as concept)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'chemical-bonding';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Upper secondary', 'core', 9,
 '{"title":"Ionic and covalent bonding","body":"Atoms bond to achieve a full outer shell of electrons. Ionic bonding: electrons are transferred from a metal to a non-metal. Ions of opposite charge attract. Giant ionic lattice structure. Example: NaCl. Covalent bonding: electrons are shared between two non-metals. Simple molecular or giant covalent structure. Example: H₂O, CO₂. Metallic bonding: a lattice of positive ions surrounded by a sea of delocalised electrons — explains conductivity.","properties":{"ionic":"High melting point, conducts when dissolved or molten, brittle","covalent_simple":"Low melting point, does not conduct","metallic":"Conducts electricity, malleable"},"local_context":"Table salt (NaCl) is an iconic example common in Ghanaian cooking."}',
 'draft', false),
(c_id, 'Recall Cards', 'Upper secondary', 'foundation', 4,
 '{"cards":[{"front":"What type of bonding involves electron transfer?","back":"Ionic bonding (metal to non-metal)"},{"front":"What type of bonding involves electron sharing?","back":"Covalent bonding (non-metals)"},{"front":"What is the structure of sodium chloride (NaCl)?","back":"Giant ionic lattice"},{"front":"Why do ionic compounds have high melting points?","back":"Strong electrostatic attraction between oppositely charged ions requires a lot of energy to break."}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Upper secondary', 'core', 6,
 '{"question":"Which type of bonding occurs between sodium (Na) and chlorine (Cl)?","options":["Covalent","Metallic","Ionic","Hydrogen"],"correct":"Ionic","explanation":"Na is a metal and Cl is a non-metal. Na transfers an electron to Cl, forming Na⁺ and Cl⁻ ions. Opposite charges attract — ionic bond.","skill":"Concept Knowledge","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 14. DENSITY (starter package — already seeded as concept)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'density';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Lower secondary', 'core', 7,
 '{"title":"Density: mass per unit volume","body":"Density = mass ÷ volume (ρ = m/V). The unit is kg/m³ or g/cm³. A denser material has more mass packed into the same volume. Objects less dense than a liquid will float; denser objects will sink. Measuring density: measure mass on a balance; measure volume by displacement or formula (for regular shapes).","local_context":"Fufu is denser than water and sinks. A piece of wood (like odum) floats in water because it is less dense."}',
 'draft', false),
(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the formula for density?","back":"Density = mass ÷ volume (ρ = m/V)"},{"front":"What unit is density measured in?","back":"kg/m³ or g/cm³"},{"front":"Why do some objects float?","back":"They are less dense than the liquid they are placed in."},{"front":"How can you measure the volume of an irregular solid?","back":"Water displacement method — measure the rise in water level."}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 5,
 '{"question":"A block of wood has mass 40 g and volume 80 cm³. What is its density?","options":["0.5 g/cm³","2 g/cm³","0.5 cm³/g","3200 g/cm³"],"correct":"0.5 g/cm³","explanation":"Density = mass ÷ volume = 40 ÷ 80 = 0.5 g/cm³","skill":"Calculation","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

-- =========================================================
-- 15. PHOTOSYNTHESIS — content units (concept already fully staged above;
--     add formal content_units to complement the concept_stages already seeded)
-- =========================================================
SELECT id INTO c_id FROM public.concepts WHERE slug = 'photosynthesis';
INSERT INTO public.content_units (concept_id, unit_type, learning_stage, difficulty, estimated_duration_mins, content, review_status, ai_generated) VALUES
(c_id, 'Core Explanation', 'Lower secondary', 'core', 8,
 '{"title":"How plants make food","body":"Photosynthesis: 6CO₂ + 6H₂O + light energy → C₆H₁₂O₆ + 6O₂. Plants use chlorophyll in chloroplasts to capture light. Carbon dioxide enters through stomata; water is absorbed through roots. Glucose is stored as starch or used for energy. Oxygen is released as a by-product.","factors":"Rate increases with more light, more CO₂, or higher temperature (up to an optimum).","local_context":"A mango tree in Accra photosynthesises most actively during the dry season when sunlight is intense."}',
 'draft', false),
(c_id, 'Recall Cards', 'Lower secondary', 'foundation', 4,
 '{"cards":[{"front":"What is the word equation for photosynthesis?","back":"Carbon dioxide + water → glucose + oxygen (using light energy)"},{"front":"Where does photosynthesis take place in the cell?","back":"In the chloroplasts"},{"front":"What is the green pigment in leaves?","back":"Chlorophyll"},{"front":"Name one factor that increases the rate of photosynthesis.","back":"More light, more CO₂, or higher temperature (up to an optimum)"}]}',
 'draft', false),
(c_id, 'Mastery Check Item', 'Lower secondary', 'core', 6,
 '{"question":"Which gas is released during photosynthesis?","options":["Carbon dioxide","Hydrogen","Oxygen","Nitrogen"],"correct":"Oxygen","explanation":"Photosynthesis produces glucose and oxygen. Oxygen is released through the stomata.","skill":"Recall","type":"Multiple Choice"}',
 'draft', false)
ON CONFLICT DO NOTHING;

END $$;
