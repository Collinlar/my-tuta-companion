-- Expand concept catalog to 50 concepts.
-- The 5 already seeded (photosynthesis, linear-equations, density, fractions, chemical-bonding)
-- are skipped with ON CONFLICT DO NOTHING.
-- Each concept includes slug, subject, name, description, learning_stage, difficulty, related_areas.

INSERT INTO public.concepts (slug, subject, name, description, learning_stage, difficulty, related_areas) VALUES

-- === MATHEMATICS ===

('integers', 'Mathematics', 'Integers',
 'Positive and negative whole numbers, including zero, and operations on them.',
 'Lower secondary', 'easy',
 ARRAY['Number line','Addition','Subtraction','Directed numbers']),

('factors-multiples', 'Mathematics', 'Factors and Multiples',
 'Finding factors, multiples, HCF and LCM of whole numbers.',
 'Lower secondary', 'easy',
 ARRAY['Prime numbers','Division','Multiplication']),

('decimals', 'Mathematics', 'Decimals',
 'Place value with tenths, hundredths and beyond; operations on decimal numbers.',
 'Lower secondary', 'easy',
 ARRAY['Place value','Fractions','Rounding']),

('percentages', 'Mathematics', 'Percentages',
 'Expressing quantities as parts of 100; percentage increase, decrease, and reverse percentage.',
 'Lower secondary', 'medium',
 ARRAY['Fractions','Decimals','Ratio']),

('ratios-proportion', 'Mathematics', 'Ratios and Proportion',
 'Comparing quantities using ratios; direct and inverse proportion.',
 'Lower secondary', 'medium',
 ARRAY['Fractions','Percentages','Scaling']),

('algebraic-expressions', 'Mathematics', 'Algebraic Expressions',
 'Forming, simplifying and expanding algebraic expressions using letters.',
 'Lower secondary', 'medium',
 ARRAY['Variables','Like terms','Substitution','Expanding brackets']),

('inequalities', 'Mathematics', 'Inequalities',
 'Solving and representing linear inequalities on a number line.',
 'Lower secondary', 'medium',
 ARRAY['Linear equations','Number line','Directed numbers']),

('simultaneous-equations', 'Mathematics', 'Simultaneous Equations',
 'Solving two linear equations with two unknowns using substitution and elimination.',
 'Upper secondary', 'hard',
 ARRAY['Linear equations','Substitution','Elimination']),

('sequences', 'Mathematics', 'Sequences and Series',
 'Arithmetic and geometric sequences; finding the nth term.',
 'Upper secondary', 'medium',
 ARRAY['Patterns','Algebra','Functions']),

('angles', 'Mathematics', 'Angles',
 'Types of angles, angle properties of parallel lines, polygons, and circles.',
 'Lower secondary', 'easy',
 ARRAY['Geometry','Parallel lines','Triangles','Polygons']),

('triangles', 'Mathematics', 'Triangles',
 'Properties of triangles; congruence, similarity, Pythagoras theorem, and trigonometry ratios.',
 'Lower secondary', 'medium',
 ARRAY['Angles','Pythagoras','Trigonometry','Area']),

('transformations', 'Mathematics', 'Transformations',
 'Reflection, rotation, translation, and enlargement of plane shapes.',
 'Lower secondary', 'medium',
 ARRAY['Coordinates','Symmetry','Vectors']),

('coordinates', 'Mathematics', 'Coordinates',
 'Plotting and reading points on the Cartesian plane; straight-line graphs.',
 'Lower secondary', 'easy',
 ARRAY['Algebra','Graphs','Linear equations']),

('perimeter-area', 'Mathematics', 'Perimeter and Area',
 'Calculating perimeter and area of common 2D shapes including composite shapes.',
 'Lower secondary', 'easy',
 ARRAY['Measurement','Formulae','Fractions']),

('volume-surface-area', 'Mathematics', 'Volume and Surface Area',
 'Calculating volume and surface area of prisms, cylinders, cones, and spheres.',
 'Upper secondary', 'medium',
 ARRAY['Area','Units','Formulae']),

('statistics-data', 'Mathematics', 'Statistics and Data',
 'Data collection, frequency tables, bar charts, pie charts, mean, median, mode, and range.',
 'Lower secondary', 'medium',
 ARRAY['Data handling','Fractions','Percentages']),

('probability', 'Mathematics', 'Probability',
 'Simple probability, combined events, experimental probability, and tree diagrams.',
 'Upper secondary', 'medium',
 ARRAY['Fractions','Decimals','Statistics']),

('word-problems', 'Mathematics', 'Word Problems and Mathematical Reasoning',
 'Setting up and solving multi-step word problems using mathematical modelling.',
 'Lower secondary', 'hard',
 ARRAY['Algebra','Arithmetic','Interpretation']),

-- === BIOLOGY ===

('cells', 'Biology', 'Cells',
 'Structure and function of animal and plant cells; cell organelles; differences between cell types.',
 'Lower secondary', 'easy',
 ARRAY['Microscopy','Cell membrane','Nucleus','Chloroplast']),

('cell-organisation', 'Biology', 'Cell Organisation',
 'How cells are organised into tissues, organs, organ systems, and organisms.',
 'Lower secondary', 'easy',
 ARRAY['Cells','Specialisation','Tissues']),

('diffusion-osmosis', 'Biology', 'Diffusion and Osmosis',
 'Movement of particles across membranes down concentration gradients.',
 'Lower secondary', 'medium',
 ARRAY['Cells','Concentration','Semi-permeable membrane']),

('nutrition', 'Biology', 'Nutrition',
 'Nutrients required by the human body; balanced diet; deficiency diseases.',
 'Lower secondary', 'easy',
 ARRAY['Digestion','Enzymes','Health']),

('respiration', 'Biology', 'Respiration',
 'Aerobic and anaerobic respiration; energy release from glucose.',
 'Lower secondary', 'medium',
 ARRAY['Photosynthesis','Glucose','Oxygen','ATP']),

('transport-humans', 'Biology', 'Transport in Humans',
 'Structure and function of the heart, blood vessels, and blood; blood groups.',
 'Upper secondary', 'medium',
 ARRAY['Circulatory system','Heart','Blood','Oxygen']),

('genetics', 'Biology', 'Genetics and Inheritance',
 'DNA, chromosomes, genes, alleles, dominant and recessive traits, Mendelian genetics.',
 'Upper secondary', 'hard',
 ARRAY['DNA','Chromosomes','Reproduction','Evolution']),

('ecology', 'Biology', 'Ecology',
 'Ecosystems, food chains and webs, energy flow, population, and environmental factors.',
 'Upper secondary', 'medium',
 ARRAY['Food chains','Energy','Populations','Biomes']),

-- === CHEMISTRY ===

('particle-model', 'Chemistry', 'Particle Model of Matter',
 'States of matter; arrangement and movement of particles; changes of state.',
 'Lower secondary', 'easy',
 ARRAY['Solids','Liquids','Gases','Energy']),

('atomic-structure', 'Chemistry', 'Atomic Structure',
 'Protons, neutrons, electrons; atomic number and mass number; electronic configuration.',
 'Upper secondary', 'medium',
 ARRAY['Periodic table','Ions','Chemical bonding']),

('periodic-table', 'Chemistry', 'Periodic Table',
 'Organisation of elements; groups and periods; trends in properties.',
 'Upper secondary', 'medium',
 ARRAY['Atomic structure','Metals','Non-metals','Reactivity']),

('chemical-equations', 'Chemistry', 'Chemical Equations',
 'Writing and balancing chemical equations; state symbols; word and formula equations.',
 'Upper secondary', 'medium',
 ARRAY['Chemical bonding','Formulae','Conservation of mass']),

('acids-bases', 'Chemistry', 'Acids and Bases',
 'Properties of acids and bases; pH scale; neutralisation reactions; salts.',
 'Lower secondary', 'medium',
 ARRAY['Reactions','Indicators','pH','Salts']),

('rates-of-reaction', 'Chemistry', 'Rates of Reaction',
 'Factors affecting reaction rate: temperature, concentration, surface area, and catalysts.',
 'Upper secondary', 'medium',
 ARRAY['Collision theory','Energy','Enzymes']),

('organic-chemistry', 'Chemistry', 'Organic Chemistry',
 'Alkanes, alkenes, and alcohols; homologous series; functional groups; polymers.',
 'Upper secondary', 'hard',
 ARRAY['Chemical bonding','Structural formulae','Reactions']),

-- === PHYSICS ===

('scientific-measurement', 'Physics', 'Scientific Measurement',
 'SI units, significant figures, precision, accuracy, and experimental error.',
 'Lower secondary', 'easy',
 ARRAY['Units','Rounding','Graphs','Error']),

('motion', 'Physics', 'Motion',
 'Distance, displacement, speed, velocity, acceleration; distance-time and velocity-time graphs.',
 'Lower secondary', 'medium',
 ARRAY['Speed','Velocity','Acceleration','Graphs']),

('forces', 'Physics', 'Forces',
 'Types of forces; Newton laws of motion; friction; pressure.',
 'Lower secondary', 'medium',
 ARRAY['Motion','Mass','Acceleration','Weight']),

('energy', 'Physics', 'Energy',
 'Forms of energy; conservation of energy; work, power, and efficiency; energy transfers.',
 'Lower secondary', 'medium',
 ARRAY['Forces','Work','Power','Efficiency']),

('thermal-physics', 'Physics', 'Thermal Physics',
 'Heat transfer by conduction, convection, and radiation; specific heat capacity; thermometry.',
 'Upper secondary', 'medium',
 ARRAY['Energy','Temperature','States of matter']),

('waves', 'Physics', 'Waves',
 'Transverse and longitudinal waves; wave speed, frequency, and wavelength; the wave equation.',
 'Upper secondary', 'medium',
 ARRAY['Light','Sound','Vibrations']),

('light', 'Physics', 'Light',
 'Reflection, refraction, total internal reflection, lenses, and the electromagnetic spectrum.',
 'Lower secondary', 'medium',
 ARRAY['Waves','Optics','Vision','Colour']),

('electricity', 'Physics', 'Electricity',
 'Current, voltage, resistance; Ohm law; series and parallel circuits; power.',
 'Upper secondary', 'hard',
 ARRAY['Energy','Ohm law','Circuits','Charge']),

('magnetism', 'Physics', 'Magnetism and Electromagnetism',
 'Magnetic fields; solenoids; electromagnetic induction; transformers; electric motors.',
 'Upper secondary', 'hard',
 ARRAY['Electricity','Forces','Induction']),

-- === SCIENTIFIC PRACTICE ===

('experimental-design', 'Science', 'Experimental Design and Scientific Method',
 'Variables, hypothesis, experimental procedure, data collection, graphing, and evaluation.',
 'Lower secondary', 'medium',
 ARRAY['Variables','Graphs','Data','Accuracy'])

ON CONFLICT (slug) DO NOTHING;


-- === CONCEPT RELATIONSHIPS — KEY PREREQUISITE CHAINS ===

INSERT INTO public.concept_relationships
  (source_concept_id, target_concept_id, relationship_type, strength)
SELECT s.id, t.id, rel, strength FROM (VALUES
  -- Number chain
  ('integers',             'algebraic-expressions',  'prerequisite_of', 'strong'),
  ('fractions',            'decimals',               'prerequisite_of', 'strong'),
  ('decimals',             'percentages',            'prerequisite_of', 'strong'),
  ('percentages',          'ratios-proportion',      'builds_on',       'moderate'),
  -- Algebra chain
  ('algebraic-expressions','linear-equations',       'prerequisite_of', 'strong'),
  ('fractions',            'linear-equations',       'prerequisite_of', 'strong'),
  ('linear-equations',     'inequalities',           'prerequisite_of', 'strong'),
  ('linear-equations',     'simultaneous-equations', 'prerequisite_of', 'strong'),
  ('algebraic-expressions','sequences',              'prerequisite_of', 'moderate'),
  -- Geometry chain
  ('angles',               'triangles',              'prerequisite_of', 'strong'),
  ('coordinates',          'transformations',        'prerequisite_of', 'moderate'),
  ('perimeter-area',       'volume-surface-area',    'prerequisite_of', 'strong'),
  -- Chemistry chain
  ('particle-model',       'atomic-structure',       'prerequisite_of', 'strong'),
  ('atomic-structure',     'periodic-table',         'prerequisite_of', 'strong'),
  ('atomic-structure',     'chemical-bonding',       'prerequisite_of', 'strong'),
  ('chemical-bonding',     'chemical-equations',     'prerequisite_of', 'strong'),
  ('chemical-equations',   'rates-of-reaction',      'prerequisite_of', 'moderate'),
  ('atomic-structure',     'organic-chemistry',      'prerequisite_of', 'moderate'),
  -- Physics chain
  ('scientific-measurement','motion',                'prerequisite_of', 'strong'),
  ('motion',               'forces',                 'builds_on',       'strong'),
  ('forces',               'energy',                 'builds_on',       'strong'),
  ('energy',               'electricity',            'builds_on',       'moderate'),
  ('waves',                'light',                  'prerequisite_of', 'strong'),
  ('electricity',          'magnetism',              'builds_on',       'strong'),
  -- Biology chain
  ('cells',                'cell-organisation',      'prerequisite_of', 'strong'),
  ('cells',                'diffusion-osmosis',      'prerequisite_of', 'strong'),
  ('diffusion-osmosis',    'transport-humans',       'builds_on',       'moderate'),
  ('photosynthesis',       'respiration',            'commonly_confused_with', 'strong'),
  ('cells',                'genetics',               'prerequisite_of', 'moderate')
) AS v(src_slug, tgt_slug, rel, strength)
JOIN public.concepts s ON s.slug = v.src_slug
JOIN public.concepts t ON t.slug = v.tgt_slug
ON CONFLICT (source_concept_id, target_concept_id, relationship_type) DO NOTHING;
