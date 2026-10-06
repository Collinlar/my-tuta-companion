-- Expand concept catalog from ~50 to ~105 concepts.
-- Covers the full BECE/WASSCE curriculum across Mathematics, Biology, Chemistry,
-- Physics, and General Science for JSS1–SHS3 Ghanaian learners.

insert into concepts (slug, subject, name, description, learning_stage, difficulty, related_areas) values

-- ─────────────────────────────────────────────────────────────────────────────
-- MATHEMATICS — Upper Secondary additions (~20)
-- ─────────────────────────────────────────────────────────────────────────────
('quadratic-equations',   'Mathematics', 'Quadratic Equations',
 'Solve equations of the form ax² + bx + c = 0 by factorisation, completing the square, or the quadratic formula.',
 'Upper secondary', 'hard',   ARRAY['algebra','equations']),

('functions-graphs',      'Mathematics', 'Functions and Graphs',
 'Understand function notation, domain and range, and sketch linear, quadratic, and exponential graphs.',
 'Upper secondary', 'medium', ARRAY['algebra','coordinates']),

('indices-standard-form', 'Mathematics', 'Indices and Standard Form',
 'Apply index laws and write very large or very small numbers in standard form (scientific notation).',
 'Lower secondary', 'medium', ARRAY['number','algebra']),

('surds',                 'Mathematics', 'Surds and Irrational Numbers',
 'Simplify, add, subtract, and rationalise denominators involving surds.',
 'Upper secondary', 'hard',   ARRAY['number','algebra']),

('trigonometry-basic',    'Mathematics', 'Trigonometry — Right-Angled Triangles',
 'Use sine, cosine, and tangent ratios to find sides and angles in right-angled triangles.',
 'Upper secondary', 'medium', ARRAY['geometry','measurement']),

('trigonometry-advanced', 'Mathematics', 'Trigonometry — Identities and Graphs',
 'Apply trigonometric identities, solve equations, and sketch sin/cos/tan graphs.',
 'Upper secondary', 'hard',   ARRAY['algebra','functions']),

('circle-theorems',       'Mathematics', 'Circle Theorems',
 'Apply angle properties of circles: angles at the centre, cyclic quadrilaterals, tangents.',
 'Upper secondary', 'hard',   ARRAY['geometry','proof']),

('vectors-2d',            'Mathematics', 'Vectors in Two Dimensions',
 'Represent vectors as column vectors, find magnitudes, and use vectors to describe translations.',
 'Upper secondary', 'hard',   ARRAY['geometry','coordinates']),

('matrices',              'Mathematics', 'Matrices',
 'Add, subtract, and multiply matrices; find determinants and inverses of 2×2 matrices.',
 'Upper secondary', 'hard',   ARRAY['algebra','transformations']),

('differentiation',       'Mathematics', 'Differentiation — Introduction',
 'Find derivatives of polynomial functions and apply them to gradients and rates of change.',
 'Upper secondary', 'hard',   ARRAY['calculus','functions']),

('integration',           'Mathematics', 'Integration — Introduction',
 'Find indefinite and definite integrals of polynomial functions and calculate areas under curves.',
 'Upper secondary', 'hard',   ARRAY['calculus','functions']),

('logarithms',            'Mathematics', 'Logarithms',
 'Understand the relationship between logarithms and indices; apply log laws to solve equations.',
 'Upper secondary', 'hard',   ARRAY['indices','algebra']),

('bearings',              'Mathematics', 'Bearings and Navigation',
 'Measure and calculate three-figure bearings; solve bearing problems with trigonometry.',
 'Lower secondary', 'medium', ARRAY['geometry','trigonometry']),

('loci-construction',     'Mathematics', 'Loci and Construction',
 'Construct accurate geometric figures using compass and ruler; describe loci as sets of points.',
 'Lower secondary', 'medium', ARRAY['geometry','measurement']),

('direct-inverse-proportion', 'Mathematics', 'Direct and Inverse Proportion',
 'Solve problems involving quantities that vary directly or inversely, including real-world Ghanaian market contexts.',
 'Lower secondary', 'medium', ARRAY['ratio','algebra']),

('set-theory',            'Mathematics', 'Set Theory',
 'Use set notation, Venn diagrams, union, intersection, and complement to solve problems.',
 'Lower secondary', 'medium', ARRAY['logic','number']),

('venn-diagrams',         'Mathematics', 'Venn Diagrams',
 'Represent and solve two- and three-circle Venn diagram problems including shading and counting.',
 'Lower secondary', 'medium', ARRAY['sets','probability']),

('cumulative-frequency',  'Mathematics', 'Cumulative Frequency and Box Plots',
 'Construct cumulative frequency curves, find medians and quartiles, and draw box-and-whisker plots.',
 'Upper secondary', 'hard',   ARRAY['statistics','data']),

('number-bases',          'Mathematics', 'Number Bases',
 'Convert between base 10, base 2, and base 8; perform arithmetic in different number bases.',
 'Lower secondary', 'medium', ARRAY['number','computing']),

('geometric-sequences',   'Mathematics', 'Geometric Sequences and Series',
 'Identify and sum geometric progressions; apply to compound interest and population growth.',
 'Upper secondary', 'hard',   ARRAY['sequences','algebra']),

-- ─────────────────────────────────────────────────────────────────────────────
-- BIOLOGY — additional topics (~10)
-- ─────────────────────────────────────────────────────────────────────────────
('reproduction-humans',   'Biology', 'Human Reproduction',
 'Describe the male and female reproductive systems, fertilisation, pregnancy, and birth.',
 'Lower secondary', 'medium', ARRAY['health','development']),

('reproduction-plants',   'Biology', 'Plant Reproduction',
 'Compare sexual and asexual reproduction in plants; describe pollination, fertilisation, and seed dispersal.',
 'Lower secondary', 'medium', ARRAY['botany','ecology']),

('hormones-homeostasis',  'Biology', 'Hormones and Homeostasis',
 'Explain how the endocrine system regulates blood glucose, body temperature, and water balance.',
 'Upper secondary', 'hard',   ARRAY['control','health']),

('immune-system',         'Biology', 'The Immune System',
 'Describe how the body defends against disease: non-specific defences, antibodies, and vaccination.',
 'Upper secondary', 'medium', ARRAY['health','disease']),

('disease-pathogens',     'Biology', 'Disease and Pathogens',
 'Identify types of pathogens (bacteria, viruses, fungi, parasites) and how diseases spread and are controlled.',
 'Lower secondary', 'medium', ARRAY['health','microbiology']),

('evolution',             'Biology', 'Evolution and Natural Selection',
 'Explain Darwin''s theory of natural selection with evidence from fossils, homologous structures, and genetics.',
 'Upper secondary', 'hard',   ARRAY['genetics','ecology']),

('classification',        'Biology', 'Classification and Taxonomy',
 'Use binomial nomenclature and classify organisms into kingdoms, phyla, and further groups.',
 'Lower secondary', 'medium', ARRAY['biodiversity','ecology']),

('nervous-system',        'Biology', 'The Nervous System',
 'Describe the structure and function of the CNS and PNS; explain reflex arcs and nerve impulse transmission.',
 'Upper secondary', 'hard',   ARRAY['control','health']),

('plant-structure',       'Biology', 'Plant Structure and Function',
 'Identify plant organs and tissues (roots, stem, leaves, flowers) and explain their functions.',
 'Lower secondary', 'easy',   ARRAY['botany','cells']),

('biodiversity',          'Biology', 'Biodiversity and Conservation',
 'Explain the importance of biodiversity and describe threats and conservation strategies in Ghana and Africa.',
 'Upper secondary', 'medium', ARRAY['ecology','evolution']),

-- ─────────────────────────────────────────────────────────────────────────────
-- CHEMISTRY — additional topics (~10)
-- ─────────────────────────────────────────────────────────────────────────────
('redox-reactions',       'Chemistry', 'Redox Reactions',
 'Identify oxidation and reduction in terms of electron transfer and changes in oxidation state.',
 'Upper secondary', 'hard',   ARRAY['electrochemistry','bonding']),

('electrochemistry',      'Chemistry', 'Electrochemistry',
 'Explain electrolysis, electrodes, and applications including extraction of aluminium and electroplating.',
 'Upper secondary', 'hard',   ARRAY['redox','bonding']),

('bonding-and-structure', 'Chemistry', 'Bonding and Structure',
 'Compare ionic, covalent, and metallic bonding; relate bonding to properties such as conductivity and melting point.',
 'Upper secondary', 'hard',   ARRAY['atomic-structure','states-of-matter']),

('energy-in-reactions',   'Chemistry', 'Energy in Chemical Reactions',
 'Distinguish exothermic and endothermic reactions; draw energy profile diagrams and apply to combustion.',
 'Upper secondary', 'medium', ARRAY['thermodynamics','rates']),

('stoichiometry',         'Chemistry', 'Stoichiometry and Moles',
 'Use the mole concept, relative atomic mass, and balanced equations to calculate reacting masses.',
 'Upper secondary', 'hard',   ARRAY['equations','calculations']),

('metals-reactivity',     'Chemistry', 'Metals and the Reactivity Series',
 'Order metals by reactivity; explain displacement reactions, corrosion, and extraction methods.',
 'Lower secondary', 'medium', ARRAY['reactions','industry']),

('separation-techniques', 'Chemistry', 'Separation Techniques',
 'Apply filtration, distillation, chromatography, and crystallisation to separate mixtures.',
 'Lower secondary', 'easy',   ARRAY['practical','mixtures']),

('gases-atmosphere',      'Chemistry', 'Gases and the Atmosphere',
 'Describe the composition of the atmosphere, test for common gases, and explain air pollution.',
 'Lower secondary', 'medium', ARRAY['environment','reactions']),

('water-chemistry',       'Chemistry', 'Water Chemistry and Treatment',
 'Explain water purification, hardness, and the importance of clean water in Ghana.',
 'Lower secondary', 'easy',   ARRAY['environment','practical']),

('polymers',              'Chemistry', 'Polymers',
 'Describe addition and condensation polymerisation; give examples of natural and synthetic polymers.',
 'Upper secondary', 'medium', ARRAY['organic','carbon']),

-- ─────────────────────────────────────────────────────────────────────────────
-- PHYSICS — additional topics (~10)
-- ─────────────────────────────────────────────────────────────────────────────
('pressure-fluids',       'Physics', 'Pressure in Fluids',
 'Calculate pressure in liquids and gases; apply to hydraulic systems, atmospheric pressure, and Archimedes'' principle.',
 'Lower secondary', 'medium', ARRAY['forces','measurement']),

('momentum',              'Physics', 'Momentum and Impulse',
 'Define momentum and impulse; apply the law of conservation of momentum to collisions.',
 'Upper secondary', 'hard',   ARRAY['forces','motion']),

('circular-motion',       'Physics', 'Circular Motion',
 'Describe centripetal force and acceleration in circular motion; apply to satellites and everyday examples.',
 'Upper secondary', 'hard',   ARRAY['forces','motion']),

('nuclear-physics',       'Physics', 'Nuclear Physics',
 'Describe the structure of the nucleus; explain fission, fusion, and their energy applications.',
 'Upper secondary', 'hard',   ARRAY['atomic','energy']),

('radioactivity',         'Physics', 'Radioactivity',
 'Identify alpha, beta, and gamma radiation; explain half-life and applications in medicine and safety.',
 'Upper secondary', 'hard',   ARRAY['nuclear','atoms']),

('electromagnetic-induction', 'Physics', 'Electromagnetic Induction',
 'Explain Faraday''s and Lenz''s laws; describe how generators and transformers work.',
 'Upper secondary', 'hard',   ARRAY['electricity','magnetism']),

('ac-electricity',        'Physics', 'Alternating Current',
 'Compare AC and DC; describe the UK/Ghana mains supply and safety features of household circuits.',
 'Upper secondary', 'medium', ARRAY['electricity','energy']),

('space-solar-system',    'Physics', 'The Solar System and Space',
 'Describe the structure of the solar system; explain seasons, eclipses, and the scale of the universe.',
 'Lower secondary', 'easy',   ARRAY['astronomy','forces']),

('specific-heat-capacity','Physics', 'Specific Heat Capacity',
 'Define specific heat capacity; perform calculations for heating and cooling objects.',
 'Upper secondary', 'medium', ARRAY['thermal-physics','energy']),

('work-power-energy',     'Physics', 'Work, Power, and Energy',
 'Calculate work done, power, and efficiency; apply to machines and Ghana''s energy sources.',
 'Lower secondary', 'medium', ARRAY['forces','energy']),

-- ─────────────────────────────────────────────────────────────────────────────
-- GENERAL SCIENCE / CROSS-CURRICULAR (~5)
-- ─────────────────────────────────────────────────────────────────────────────
('graphs-interpretation', 'Science', 'Interpreting Graphs and Tables',
 'Read, construct, and describe trends in line graphs, bar charts, pie charts, and data tables.',
 'Lower secondary', 'easy',   ARRAY['data','maths-skills']),

('scientific-method',     'Science', 'The Scientific Method',
 'Describe the stages of scientific investigation: observation, hypothesis, experiment, analysis, conclusion.',
 'Lower secondary', 'easy',   ARRAY['practical','thinking']),

('error-analysis',        'Science', 'Error and Uncertainty in Measurement',
 'Distinguish systematic and random errors; calculate percentage error and identify sources of uncertainty.',
 'Upper secondary', 'medium', ARRAY['measurement','practical']),

('safety-laboratory',     'Science', 'Laboratory Safety',
 'Identify hazards, read safety symbols, and apply correct safety procedures in the school laboratory.',
 'Lower secondary', 'easy',   ARRAY['practical','health']),

('environmental-science', 'Science', 'Environmental Science and Sustainability',
 'Explain human impacts on the environment — deforestation, pollution, climate change — and conservation strategies in Ghana.',
 'Lower secondary', 'medium', ARRAY['ecology','geography'])

on conflict (slug) do nothing;

-- ─────────────────────────────────────────────────────────────────────────────
-- Prerequisite / builds_on relationships for new concepts
-- ─────────────────────────────────────────────────────────────────────────────
insert into concept_relationships (source_concept_id, target_concept_id, relationship_type, strength)
select s.id, t.id, rel, str
from (values
  -- Mathematics chains
  ('algebraic-expressions',     'quadratic-equations',        'prerequisite_of', 'strong'),
  ('linear-equations',          'quadratic-equations',        'prerequisite_of', 'strong'),
  ('quadratic-equations',       'functions-graphs',           'builds_on',       'strong'),
  ('sequences',                 'geometric-sequences',        'builds_on',       'strong'),
  ('indices-standard-form',     'logarithms',                 'prerequisite_of', 'strong'),
  ('indices-standard-form',     'surds',                      'builds_on',       'moderate'),
  ('trigonometry-basic',        'trigonometry-advanced',      'prerequisite_of', 'strong'),
  ('angles',                    'trigonometry-basic',         'prerequisite_of', 'moderate'),
  ('triangles',                 'trigonometry-basic',         'prerequisite_of', 'strong'),
  ('coordinates',               'vectors-2d',                 'builds_on',       'moderate'),
  ('transformations',           'matrices',                   'builds_on',       'moderate'),
  ('functions-graphs',          'differentiation',            'prerequisite_of', 'strong'),
  ('differentiation',           'integration',                'builds_on',       'strong'),
  ('ratios-proportion',         'direct-inverse-proportion',  'builds_on',       'strong'),
  ('statistics-data',           'cumulative-frequency',       'builds_on',       'strong'),
  ('probability',               'venn-diagrams',              'builds_on',       'moderate'),
  ('perimeter-area',            'circle-theorems',            'builds_on',       'weak'),
  ('linear-equations',          'set-theory',                 'related_to',      'weak'),

  -- Biology chains
  ('cells',                     'reproduction-humans',        'prerequisite_of', 'moderate'),
  ('cells',                     'nervous-system',             'prerequisite_of', 'moderate'),
  ('genetics',                  'evolution',                  'builds_on',       'strong'),
  ('ecology',                   'biodiversity',               'builds_on',       'strong'),
  ('transport-humans',          'hormones-homeostasis',       'builds_on',       'moderate'),
  ('diffusion-osmosis',         'plant-structure',            'builds_on',       'moderate'),
  ('plant-structure',           'reproduction-plants',        'prerequisite_of', 'moderate'),

  -- Chemistry chains
  ('chemical-equations',        'stoichiometry',              'prerequisite_of', 'strong'),
  ('atomic-structure',          'bonding-and-structure',      'prerequisite_of', 'strong'),
  ('chemical-bonding',          'bonding-and-structure',      'builds_on',       'strong'),
  ('bonding-and-structure',     'redox-reactions',            'builds_on',       'moderate'),
  ('redox-reactions',           'electrochemistry',           'builds_on',       'strong'),
  ('rates-of-reaction',         'energy-in-reactions',        'builds_on',       'moderate'),
  ('organic-chemistry',         'polymers',                   'builds_on',       'strong'),
  ('particle-model',            'separation-techniques',      'related_to',      'moderate'),
  ('particle-model',            'gases-atmosphere',           'builds_on',       'moderate'),

  -- Physics chains
  ('forces',                    'pressure-fluids',            'builds_on',       'strong'),
  ('motion',                    'momentum',                   'builds_on',       'strong'),
  ('motion',                    'circular-motion',            'builds_on',       'moderate'),
  ('electricity',               'electromagnetic-induction',  'prerequisite_of', 'strong'),
  ('magnetism',                 'electromagnetic-induction',  'prerequisite_of', 'strong'),
  ('electromagnetic-induction', 'ac-electricity',             'builds_on',       'strong'),
  ('thermal-physics',           'specific-heat-capacity',     'builds_on',       'strong'),
  ('energy',                    'work-power-energy',          'builds_on',       'strong'),
  ('atomic-structure',          'nuclear-physics',            'prerequisite_of', 'strong'),
  ('nuclear-physics',           'radioactivity',              'builds_on',       'strong')
) as r(src_slug, tgt_slug, rel, str)
join concepts s on s.slug = r.src_slug
join concepts t on t.slug = r.tgt_slug
on conflict (source_concept_id, target_concept_id, relationship_type) do nothing;
