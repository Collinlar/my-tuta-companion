"""Build reviewable draft fixtures; never generates approval or publishes content."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
# Every statement is a draft for the academic team, not an approval record.
concepts = [
    ("fractions", "quantitative", ["Explain numerator and denominator using equal parts", "Recognise equivalent fractions", "Compare fractions using a common whole", "Add and subtract fractions with compatible denominators", "Correct unequal-part and denominator misconceptions", "Use a fraction to describe a shared quantity"], ["Solve sharing problems using fractions", "Select suitable operations in fraction scenarios", "Explain whether a fractional answer is reasonable"], ["Analyse unfamiliar fraction problems", "Connect fractions, ratios and percentages", "Justify equivalence and comparison methods"]),
    ("ratios-proportion", "quantitative", ["Interpret a ratio as a comparison of quantities", "Identify the order and units of a ratio", "Recognise and simplify equivalent ratios", "Distinguish part-to-part and part-to-whole comparisons", "Correct additive scaling misconceptions", "Use a simple ratio to share a quantity"], ["Scale recipes and mixtures", "Solve direct proportion problems", "Interpret ratio tables"], ["Distinguish proportional and nonproportional relationships", "Evaluate competing proportional models", "Justify a scaling method in an unfamiliar problem"]),
    ("percentages", "quantitative", ["Explain percent as parts per hundred", "Connect percentages to fractions and decimals", "Find a simple percentage of a quantity", "Identify the whole used in a percentage", "Correct percent and percentage-point misconceptions", "Interpret a percentage in a practical situation"], ["Calculate discounts and percentage change", "Compare percentage information with different bases", "Use percentages in budgets and data"], ["Analyse successive percentage changes", "Evaluate misleading percentage claims", "Justify the choice of comparison base"]),
    ("linear-equations", "procedural", ["Explain equality and the role of a variable", "Identify inverse operations", "Solve one-step equations", "Solve two-step equations", "Explain why both sides need the same operation", "Check a solution by substitution", "Correct sign and balance errors"], ["Translate word problems into equations", "Select and apply a solution method", "Interpret a solution in its context"], ["Solve unfamiliar multi-step equations", "Connect equations to graphs", "Justify equivalent transformations"]),
    ("graphs-interpretation", "representational", ["Explain what a graph represents", "Identify axes, variables, units and scale", "Read a plotted value", "Describe a trend using evidence", "Distinguish a trend from a single point", "Correct misleading-scale misconceptions", "Use a graph to answer a simple contextual question"], ["Compare datasets using graphs", "Choose a suitable representation", "Interpret rate and change in context"], ["Evaluate graph-based claims", "Explain uncertainty and limitations", "Connect multiple representations to justify a conclusion"]),
    ("photosynthesis", "process", ["Explain photosynthesis as producing glucose using light energy", "Identify carbon dioxide and water as reactants", "Identify glucose and oxygen as products", "Describe the roles of chlorophyll and light", "Connect photosynthesis to plant structures", "Correct plant-food and respiration misconceptions", "Predict a simple effect of changing light availability"], ["Interpret a photosynthesis investigation", "Explain effects of limiting factors", "Use evidence to compare plant conditions"], ["Evaluate experimental controls and limitations", "Connect photosynthesis to ecosystems and respiration", "Analyse unfamiliar limiting-factor data"]),
    ("density", "quantitative", ["Define density as mass per unit volume", "Distinguish mass and volume", "Interpret density units", "Use the density formula", "Explain how mass and volume affect density", "Interpret density on a mass-volume graph", "Correct heavier-means-denser misconceptions", "Compare materials using density"], ["Measure mass and volume", "Calculate and compare densities from data", "Plan a simple density investigation"], ["Evaluate measurement error", "Determine the volume of an irregular object", "Connect density to buoyancy with appropriate conditions"]),
    ("forces", "causal", ["Define a force as an interaction that can change motion or shape", "Identify contact and noncontact forces", "Represent force direction and magnitude", "Distinguish balanced and unbalanced forces", "Relate resultant force to changes in motion", "Correct force-needed-for-steady-motion misconceptions", "Explain a simple push or pull scenario"], ["Draw and interpret force diagrams", "Predict motion from a resultant force", "Investigate the effect of a force"], ["Analyse unfamiliar interacting-force situations", "Evaluate evidence about force and motion", "Justify a model while stating its assumptions"]),
    ("electricity", "systems", ["Identify the components of a simple circuit", "Explain why a complete conducting path is needed", "Distinguish current and potential difference", "Read simple circuit symbols", "Compare basic series and parallel arrangements", "Correct current-used-up misconceptions", "Predict the effect of opening a switch"], ["Build and interpret a simple circuit", "Use current and voltage measurements", "Investigate a circuit change safely"], ["Analyse unfamiliar circuits", "Evaluate measurement limitations", "Justify circuit design choices"]),
    ("space-solar-system", "structural", ["Define the Solar System", "Explain the Sun's role", "Name the eight planets in order", "Distinguish inner rocky planets from outer giants", "Identify moons, dwarf planets, asteroids and comets", "Explain gravity and orbit", "Distinguish rotation from revolution", "Explain Solar System scale", "Correct common Solar System misconceptions", "Interpret a simple Solar System scenario"], ["Interpret Solar System diagrams", "Use simple scale information", "Apply orbital ideas to a scenario"], ["Analyse unfamiliar orbital scenarios", "Connect gravity, motion and scale", "Evaluate astronomical claims using evidence"]),
]

# title, block type, competency indexes, teaching, prompt, correct option, distractor
density = [
    ("Definition", "definition", [0], "Density describes the mass in each unit of volume. A material with more mass in the same volume has greater density. Density helps us compare materials even when the samples are different sizes.", "Two samples have the same volume. Which is denser?", "The sample with greater mass", "The sample with less mass"),
    ("Mass and volume", "components", [1], "Mass measures the amount of matter in a sample and is measured with a balance. Volume measures the space occupied by the sample. Changing the amount of a uniform material changes both its mass and volume.", "Which measurement gives the space occupied by a sample?", "Volume", "Mass"),
    ("Units", "vocabulary", [2], "Density units combine a mass unit with a volume unit. Grams per cubic centimetre means grams in each cubic centimetre. Keep the mass and volume units compatible before comparing calculated densities.", "What does a density of 3 grams per cubic centimetre mean?", "Each cubic centimetre has a mass of 3 grams", "Each gram occupies 3 cubic centimetres"),
    ("Formula", "relationships", [3], "Density equals mass divided by volume: $\\rho=m/V$. For a sample of mass 12 grams and volume 4 cubic centimetres, divide 12 by 4. Its density is 3 grams per cubic centimetre.", "A sample has mass 12 grams and volume 4 cubic centimetres. What is its density?", "3 grams per cubic centimetre", "48 grams per cubic centimetre"),
    ("Changing mass and volume", "relationships", [4], "At fixed volume, greater mass means greater density. At fixed mass, a greater volume means lower density. Cutting a uniform solid in half halves both mass and volume, so its density stays the same under the same conditions.", "A uniform block is cut in half. What happens to each piece's density?", "It stays the same", "It halves"),
    ("Physical meaning", "big_picture", [0, 4], "Imagine two identical measuring containers filled with different materials. Their equal volumes let you compare mass directly. The heavier filled sample, after subtracting the container mass, is the denser material; container size alone cannot tell you density.", "Why compare samples in equal-sized containers?", "Equal volumes let mass reveal the density difference", "Equal containers make every material equally dense"),
    ("Mass-volume graph", "visual_model", [5], "On a graph with volume on the horizontal axis and mass on the vertical axis, a uniform material at fixed conditions gives a straight line through the origin. The slope is mass divided by volume. A steeper line indicates greater density when both graphs use the same scales.", "Two mass-volume lines use the same axes and scales. Which represents greater density?", "The steeper line", "The flatter line"),
    ("Worked example", "worked_example", [3], "A small material sample has mass 20 grams and volume 10 cubic centimetres. First identify mass and volume, then divide mass by volume. $20/10=2$, so the density is 2 grams per cubic centimetre; multiplying the quantities would give the wrong meaning and units.", "A sample has mass 20 grams and volume 10 cubic centimetres. Which operation finds density?", "20 divided by 10", "20 multiplied by 10"),
    ("Common errors", "misconception", [6], "A heavier object is not always made of a denser material. A large wooden object may have more total mass than a small metal object because it has much greater volume. Compare mass per unit volume, rather than mass alone.", "A large piece of wood is heavier than a small metal piece. Is the wood necessarily denser?", "No, their volumes must also be considered", "Yes, greater mass always means greater density"),
    ("Compare materials", "application", [7], "At a workshop, two equal-volume samples are placed on a balance. Sample A has mass 30 grams and sample B has mass 20 grams. Because their volumes are equal, A has the greater density; this comparison needs no complicated calculation.", "Two samples each occupy 10 cubic centimetres. A has mass 30 grams and B has mass 20 grams. Which is denser?", "Sample A", "Sample B"),
]

solar = [
    ("What is the Solar System?", "definition", [0], "The Solar System consists of the Sun and the objects gravitationally bound to it. These include planets, dwarf planets, moons and many smaller bodies. It is part of the Milky Way galaxy, rather than the whole galaxy.", "Which description identifies the Solar System?", "The Sun and objects gravitationally bound to it", "Every star in the Milky Way"),
    ("The Sun", "components", [1], "The Sun is the star at the centre of the Solar System. It supplies most of the light and energy received by its planets. Its large mass makes its gravity the dominant influence on planetary orbits.", "Why is the Sun central to the Solar System?", "It is the system's star and dominant source of gravitational attraction", "It is a planet that reflects Earth's light"),
    ("The eight planets", "components", [2], "The eight planets in order from the Sun are Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus and Neptune. Earth is the third planet. A planet's position in this sequence describes its orbit relative to the other planetary orbits, not its size.", "Which sequence begins correctly from the Sun?", "Mercury, Venus, Earth, Mars", "Earth, Mars, Venus, Mercury"),
    ("Inner and outer planets", "categories", [3], "Mercury, Venus, Earth and Mars are the inner rocky planets. Jupiter and Saturn are gas giants; Uranus and Neptune are ice giants. The outer planets are much farther from the Sun, and the words gas and ice describe broad planetary categories rather than a simple surface covering.", "Which pair contains the ice giants?", "Uranus and Neptune", "Mercury and Mars"),
    ("Moons and dwarf planets", "categories", [4], "A moon is a natural satellite orbiting another body such as a planet. A dwarf planet orbits the Sun and is approximately round, but has not cleared the neighbourhood around its orbit. Pluto is a dwarf planet; changing its category did not remove it from the Solar System.", "Which statement about Pluto is correct?", "It is a dwarf planet within the Solar System", "It left the Solar System when its category changed"),
    ("Asteroids and comets", "categories", [4], "Asteroids are typically rocky or metallic small bodies. Comets contain substantial ice and dust; approaching the Sun can release gas and dust that form a coma and tails. These are smaller Solar System bodies, not stars.", "Which body can release gas and dust as it approaches the Sun?", "A comet", "A star called an asteroid"),
    ("Orbit and gravity", "relationships", [5], "Gravity attracts bodies with mass. A planet's forward motion and the Sun's gravitational attraction together produce its orbit. Planets do not need a solid track, and gravity still acts in space.", "Why does a planet follow an orbit around the Sun?", "Its motion combines with the Sun's gravitational attraction", "A solid invisible rail supports it"),
    ("Rotation and revolution", "process", [6], "Rotation means turning about an axis. Revolution means travelling around another body. Earth's rotation produces the day-night cycle, while its revolution around the Sun takes about one year.", "Which motion produces Earth's day-night cycle?", "Rotation about its axis", "Revolution around the Sun"),
    ("Scale and distance", "big_picture", [7], "Distances between planets are enormous compared with their sizes. An astronomical unit is approximately the average Earth-Sun distance. Many diagrams enlarge the planets so they are visible, so you should check whether both sizes and distances are drawn to scale.", "Why might a Solar System diagram show oversized planets?", "To make the planets visible despite the huge distances", "Because planets touch one another in space"),
    ("Common misconceptions", "misconception", [8], "The Sun is a star, not a planet. The Moon reflects sunlight rather than producing its own visible light. Earth's seasons mainly result from its axial tilt during its orbit, rather than simply being nearer to the Sun.", "Which statement is accurate?", "The Moon is visible because it reflects sunlight", "The Moon is a small star producing its own light"),
    ("Put it together", "application", [9], "A learner draws Earth spinning while its centre moves along a path around the Sun. The spinning arrow represents rotation; the path arrow represents revolution. Labelling both motions helps explain how day and year refer to different cycles without using unrelated mathematics.", "A diagram shows Earth spinning and moving around the Sun. Which labels are correct?", "Spinning is rotation; travelling around the Sun is revolution", "Spinning is revolution; travelling around the Sun is rotation"),
]

other_foundation = {
"fractions": [
 ("Equal parts", "A fraction compares a number of equal parts with the whole divided into those parts. The denominator names the total equal parts and the numerator counts the selected parts.", "In three quarters, what does the four represent?", "The number of equal parts in the whole", "The number of selected parts"),
 ("Equivalent fractions", "Multiplying or dividing both numerator and denominator by the same nonzero number keeps a fraction's value. One half and two quarters cover the same amount of the same whole.", "Which fraction equals one half?", "Two quarters", "One quarter"),
 ("Compare fairly", "Compare fractions using the same whole. With a common denominator, the fraction with the larger numerator represents more equal-sized parts.", "For the same whole, which is larger?", "Three fifths", "Two fifths"),
 ("Combine fractions", "To add fractions, first express them in equal-sized parts. One quarter plus two quarters is three quarters; keep the denominator because the parts remain quarters.", "What is one quarter plus two quarters?", "Three quarters", "Three eighths"),
 ("Unequal parts", "A shape divided into four pieces does not automatically show quarters. Each piece must have one quarter of the whole's area for each piece to represent a quarter.", "Four unequal pieces are cut from a cake. Is each piece a quarter?", "No, quarters must be equal portions", "Yes, there are four pieces"),
 ("Sharing a quantity", "Sharing eight oranges equally between four learners gives two oranges per learner. Each learner receives one quarter of the total, so one quarter of eight is two.", "Eight oranges are shared equally among four learners. How many does each receive?", "Two", "Four"),
],
"ratios-proportion": [
 ("Compare quantities", "A ratio states the relative amounts of two quantities. A ratio of two red counters to three blue counters means each matching group contains two red and three blue.", "What does red to blue of 2:3 mean?", "Two red for every three blue", "Three red for every two blue"),
 ("Order and units", "The order in a ratio matters: girls to boys is different from boys to girls. Convert measurements to the same units before simplifying a ratio of lengths.", "A class has 12 girls and 8 boys. What is girls to boys?", "12:8", "8:12"),
 ("Equivalent ratios", "Multiply or divide every part of a ratio by the same positive factor to keep the comparison. The ratio 4:6 simplifies to 2:3 by dividing both parts by two.", "Which ratio is equivalent to 4:6?", "2:3", "2:4"),
 ("Parts and whole", "In a red-to-blue ratio of 2:3, there are five parts altogether. Red is two parts out of five of the total, rather than two out of three.", "In a red-to-blue ratio of 2:3, what fraction of all counters is red?", "Two fifths", "Two thirds"),
 ("Scale both parts", "Equivalent ratios use multiplication, not the same addition to each number. Doubling 2:3 gives 4:6; adding two gives 4:5 and changes the comparison.", "To double the mixture described by 2:3, which ratio should be used?", "4:6", "4:5"),
 ("Share in a ratio", "To share ten exercise books in the ratio 2:3, first count five total parts. Each part is two books, so the shares are four books and six books.", "Ten books are shared in the ratio 2:3. What is the smaller share?", "Four books", "Two books"),
],
"percentages": [
 ("Parts per hundred", "Percent means per hundred. A result of 25 percent describes 25 equal parts out of every 100 parts of the reference whole.", "What does 25 percent mean?", "25 out of 100", "25 out of 10"),
 ("Equivalent forms", "A percentage can be written as a fraction over 100 or as a decimal. Fifty percent is 50/100, which equals one half and 0.5.", "Which decimal equals 50 percent?", "0.5", "50.0"),
 ("Find a percentage", "Ten percent is one tenth of a quantity. Divide the quantity by ten, so ten percent of 80 is 8.", "What is ten percent of 80?", "8", "10"),
 ("Identify the base", "A percentage is always taken relative to a whole or base. If 20 of 50 learners walk to school, the whole is the 50 learners, not the 20 who walk.", "Twenty of fifty learners walk to school. What is the reference whole?", "Fifty learners", "Twenty learners"),
 ("Percentage points", "A change from 20 percent to 30 percent is an increase of ten percentage points. It is a 50 percent relative increase because the change of ten is half the original twenty.", "From 20 percent to 30 percent is an increase of how many percentage points?", "Ten", "Fifty"),
 ("Use in context", "A 50 percent discount removes half the original price. An exercise book priced at 20 cedis therefore costs 10 cedis after the discount.", "An exercise book costs 20 cedis before a 50 percent discount. What is the discounted price?", "10 cedis", "15 cedis"),
],
"linear-equations": [
 ("Equality and variables", "An equation states that two expressions have the same value. A variable is a symbol whose value can make the equation true.", "What does the equals sign assert?", "Both expressions have the same value", "The answer must be written next"),
 ("Inverse operations", "Inverse operations undo one another. Subtraction undoes addition and division by a nonzero number undoes multiplication by that number.", "Which operation undoes adding three?", "Subtracting three", "Multiplying by three"),
 ("One-step equations", "To solve $x+3=8$, subtract three from both sides. This leaves $x=5$, which makes the original equality true.", "What solves x plus 3 equals 8?", "x equals 5", "x equals 11"),
 ("Two-step equations", "To solve $2x+3=11$, first subtract three from both sides to obtain $2x=8$. Then divide both sides by two to obtain $x=4$.", "What solves 2x plus 3 equals 11?", "x equals 4", "x equals 7"),
 ("Keep the balance", "Applying the same valid operation to both sides preserves equality. Subtracting three only from one side generally changes the equation's solutions.", "When subtracting three to solve an equation, what must you do?", "Subtract three from both sides", "Subtract three only from the variable side"),
 ("Check a solution", "Substitute your proposed value into the original equation. For $3x=12$, substituting four gives $3(4)=12$, so four is a solution.", "Which value passes substitution into 3x equals 12?", "Four", "Nine"),
 ("Signs and balance", "For $x-4=7$, add four to both sides to undo subtraction. The solution is eleven; subtracting four again does not undo the original operation.", "What solves x minus 4 equals 7?", "Eleven", "Three"),
],
"graphs-interpretation": [
 ("What a graph shows", "A graph represents a relationship or a set of data visually. Its title and labels tell you what the marks mean; a rising line has no clear physical meaning until the variables are identified.", "What must you identify before interpreting a graph?", "The variables represented", "Only the colour of its line"),
 ("Axes and scale", "Axis labels identify quantities and units. Read the spacing between numbered marks to determine the scale; one square can represent more than one unit.", "Axis marks are labelled 0, 10 and 20 at equal spacing. What does each interval represent?", "Ten units", "One unit"),
 ("Read a point", "To read a point, find its horizontal position and then its vertical position using the labelled scales. If a point is at day two and temperature 30 degrees Celsius, it records that temperature for day two.", "A point is at day 2 and temperature 30 degrees Celsius. What does it report?", "Thirty degrees Celsius on day two", "Two degrees Celsius on day thirty"),
 ("Describe a trend", "A trend is an overall pattern across data. If readings rise from 10 to 20 to 30, say they increase and cite the readings rather than describing just one point.", "Readings are 10, 20 and 30 over successive days. What is their trend?", "Increasing", "Decreasing"),
 ("Point versus pattern", "An individual point describes one observation. A trend uses several observations, so an unusual single point need not describe the overall pattern.", "Can one unusually high reading alone establish a long-term upward trend?", "No, several observations are needed", "Yes, the highest point is the trend"),
 ("Misleading scales", "A vertical axis that begins near the smallest data value can make small differences look large. Compare the labelled numbers and units before judging the size of an effect.", "Two bars look very different on an axis starting at 98. What should you inspect first?", "The actual values and axis scale", "Only the bar colours"),
 ("Answer with evidence", "If a rainfall graph gives Monday as 5 millimetres and Tuesday as 15 millimetres, Tuesday had 10 millimetres more rain. Use the labels and subtraction to support the comparison.", "Monday had 5 millimetres of rain and Tuesday had 15. How much more fell on Tuesday?", "Ten millimetres", "Twenty millimetres"),
],
"photosynthesis": [
 ("Make glucose using light", "Photosynthesis uses light energy to make glucose from carbon dioxide and water. Energy is transferred into chemical stores; light is an energy source, not a material ingredient added to the glucose.", "What does photosynthesis produce using light energy?", "Glucose", "Soil"),
 ("Reactants", "Carbon dioxide and water provide the atoms used in photosynthesis. In a typical land plant, carbon dioxide enters leaves through stomata and water reaches leaves from the roots.", "Which pair supplies the main reactants?", "Carbon dioxide and water", "Oxygen and soil"),
 ("Products", "Glucose and oxygen are products of photosynthesis. Plants can use glucose in respiration, store it as starch, or use it to build other substances.", "Which pair are photosynthesis products?", "Glucose and oxygen", "Water and carbon dioxide"),
 ("Chlorophyll and light", "Chlorophyll is a pigment that absorbs light for photosynthesis. It is found in chloroplasts; having water alone does not replace the need for light energy.", "What is chlorophyll's role?", "Absorbing light energy", "Supplying soil particles as food"),
 ("Plant structures", "Roots absorb water and leaf stomata allow gas exchange. Water is carried to leaves in xylem, while chloroplasts in leaf cells carry out photosynthesis.", "Which structure allows carbon dioxide to enter a typical leaf?", "Stomata", "Root hairs only"),
 ("Food and respiration", "Plants make their own organic food by photosynthesis rather than absorbing ready-made food from soil. Plants also respire during both day and night; photosynthesis and respiration are different processes.", "Which statement is accurate?", "Plants respire during day and night", "Plants only respire when it is dark"),
 ("Change light conditions", "If light is limiting, increasing light can increase the rate of photosynthesis. Other factors such as carbon dioxide supply or temperature can become limiting, so brighter light does not always increase the rate indefinitely.", "When light is limiting and other conditions are suitable, what can more light do?", "Increase photosynthesis rate", "Always stop photosynthesis"),
],
"forces": [
 ("Interactions", "A force is a push or pull arising from an interaction. It can change an object's motion or deform it; forces are measured in newtons.", "Which describes a force?", "A push or pull from an interaction", "The amount of space an object occupies"),
 ("Contact and noncontact", "Friction and a person's push require contact between interacting surfaces. Gravity can act between objects without their surfaces touching.", "Which force can act without surfaces touching?", "Gravity", "Surface friction"),
 ("Force arrows", "A force arrow points in the direction of the force. When a consistent scale is used, a longer arrow represents a greater force.", "On a scaled force diagram, what does arrow direction show?", "The direction of the force", "The object's mass"),
 ("Balanced forces", "Forces are balanced when their vector sum is zero. An object can then remain at rest or continue moving at constant velocity; balanced forces do not mean that no forces act.", "Can an object with balanced forces move at constant velocity?", "Yes", "No, balanced forces always stop it"),
 ("Resultant force", "The resultant is the combined effect of all forces. A nonzero resultant changes velocity, which may mean speeding up, slowing down or changing direction.", "What does a nonzero resultant force cause?", "A change in velocity", "Motion at an unchanging velocity in every case"),
 ("Steady motion", "A constant forward speed in a straight line does not require a nonzero resultant force. On a road, a driving force can balance resistive forces while a vehicle keeps a steady velocity.", "A vehicle moves straight at steady speed. How can its driving and resistive forces compare?", "They can balance", "Driving force must always exceed resistance"),
 ("Simple resultant", "Two opposite horizontal forces act on a box: ten newtons right and six newtons left. Subtract the smaller magnitude from the larger to get a resultant of four newtons right.", "Ten newtons right and six newtons left act on a box. What is the resultant?", "Four newtons right", "Sixteen newtons right"),
],
"electricity": [
 ("Circuit parts", "A cell supplies an electrical potential difference, wires provide conducting paths, and components such as lamps transfer electrical energy. A switch opens or closes a path.", "Which component can open or close a simple circuit?", "A switch", "A ruler beside the circuit"),
 ("Complete path", "A steady current through a simple lamp circuit requires a complete conducting path through the source and lamp. A gap in that path stops the steady current in the series circuit.", "What does a simple lamp circuit need for steady current?", "A complete conducting path", "A gap in the only conducting path"),
 ("Current and voltage", "Current is the rate of flow of electric charge and is measured in amperes. Potential difference is energy transferred per unit charge and is measured in volts; the quantities describe different properties.", "Which quantity is measured in amperes?", "Current", "Potential difference"),
 ("Circuit symbols", "Circuit diagrams use standard symbols rather than pictures of components. A cell is represented by a pair of unequal parallel lines; a lamp is commonly a circle with a cross inside.", "Which symbol commonly represents a lamp?", "A circle with a cross inside", "A pair of unequal parallel lines"),
 ("Series and parallel", "A series circuit has one path through its components. Parallel branches provide multiple paths, so opening one branch need not interrupt another complete branch.", "Which arrangement offers separate branch paths?", "Parallel", "Series only"),
 ("Charge is not used up", "A lamp transfers energy from the electrical system but does not use up charge. In a steady simple series circuit, the current is the same on either side of the lamp.", "How does steady current before and after a lamp compare in a simple series circuit?", "It is the same", "It is always zero after the lamp"),
 ("Open a switch", "In a cell-switch-lamp series circuit, opening the switch breaks the only conducting path. The lamp then goes out because the steady current stops.", "What happens when the switch opens in a simple series lamp circuit?", "The lamp goes out", "The lamp must become brighter"),
]}

payload = []
for slug, kind, foundation, applied, advanced in concepts:
    competencies = []
    for depth, descriptions in [("foundation", foundation), ("applied", applied), ("advanced", advanced)]:
        for i, description in enumerate(descriptions):
            evidence = "application" if depth == "applied" else "quick_check"
            if depth == "foundation" and ("misconception" in description or "Correct " in description): evidence = "misconception"
            if depth == "foundation" and i == len(descriptions)-1 and evidence != "misconception": evidence = "application"
            if depth == "foundation" and slug == "linear-equations" and i == 5: evidence = "application"
            competencies.append(dict(depth=depth, key=f"{depth}-{i+1}", description=description, evidence_type=evidence, sequence=i))
    blocks = []
    source = density if slug == "density" else solar if slug == "space-solar-system" else [
        (title, "misconception" if competencies[i]["evidence_type"] == "misconception" else "application" if competencies[i]["evidence_type"] == "application" else "definition" if i == 0 else "relationships", [i], body, prompt, correct, incorrect)
        for i, (title, body, prompt, correct, incorrect) in enumerate(other_foundation[slug])
    ]
    for i, (title, block_type, keys, body, prompt, correct, incorrect) in enumerate(source):
        blocks.append(dict(title=title, block_type=block_type, sequence=i, objective=foundation[keys[0]], required=True,
            content=dict(body=body, competencyKeys=[f"foundation-{key+1}" for key in keys], prerequisites=[],
                modes=[dict(label="Focus on the key idea", text=foundation[keys[0]]+". "+body.split('. ')[-1])],
                quickCheck=dict(prompt=prompt, options=[correct, incorrect], correctIndex=0, explanation=correct+". "+body))))
    for i, block in enumerate(blocks):
        check = block['content']['quickCheck']
        if i % 2:
            check['options'].reverse()
            check['correctIndex'] = 1
    if slug == 'density':
        blocks[6]['content']['visual'] = 'density_mass_volume'
    if slug == 'space-solar-system':
        blocks[2]['content']['visual'] = 'solar_system'
        blocks[4]['content']['body'] = blocks[4]['content']['body'].replace('but has not cleared', 'is not a moon, and has not cleared')
    payload.append(dict(slug=slug, concept_type=kind, competencies=competencies, blocks=blocks))

(ROOT / "competency_pilot_drafts.json").write_text(json.dumps(payload, indent=2, ensure_ascii=False)+"\n", encoding="utf-8")
serialized = json.dumps(payload, ensure_ascii=False)
sql = """-- Draft authoring pack. Never publishes or overwrites approved content.
BEGIN;
DO $seed$
DECLARE pack jsonb := $data$"""+serialized+"""$data$; item jsonb; comp jsonb; block jsonb; cid uuid;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements(pack) LOOP
    SELECT id INTO cid FROM public.concepts WHERE slug=item->>'slug';
    IF cid IS NULL THEN RAISE EXCEPTION 'Missing flagship concept %',item->>'slug'; END IF;
    UPDATE public.concepts SET concept_type=COALESCE(concept_type,item->>'concept_type') WHERE id=cid;
    FOR comp IN SELECT value FROM jsonb_array_elements(item->'competencies') LOOP
      INSERT INTO public.concept_competencies AS cc(concept_id,depth,competency_key,description,required,sequence,evidence_type,review_status)
        VALUES(cid,comp->>'depth',comp->>'key',comp->>'description',true,(comp->>'sequence')::int,comp->>'evidence_type','draft')
        ON CONFLICT(concept_id,depth,competency_key) DO UPDATE SET description=EXCLUDED.description,evidence_type=EXCLUDED.evidence_type,version=cc.version+1
        WHERE cc.review_status='draft' AND (cc.description IS DISTINCT FROM EXCLUDED.description OR cc.evidence_type IS DISTINCT FROM EXCLUDED.evidence_type);
    END LOOP;
    FOR block IN SELECT value FROM jsonb_array_elements(item->'blocks') LOOP
      PERFORM public.validate_knowledge_block_content(block->'content');
      INSERT INTO public.knowledge_blocks AS kb(concept_id,depth,block_type,title,objective,required,sequence,content,review_status)
        VALUES(cid,'foundation',block->>'block_type',block->>'title',block->>'objective',true,(block->>'sequence')::int,block->'content','draft')
        ON CONFLICT(concept_id,depth,sequence) DO UPDATE SET block_type=EXCLUDED.block_type,title=EXCLUDED.title,
          objective=EXCLUDED.objective,content=EXCLUDED.content,version=kb.version+1,updated_at=now()
        WHERE kb.review_status='draft' AND kb.content IS DISTINCT FROM EXCLUDED.content;
    END LOOP;
  END LOOP;
END;
$seed$;
COMMIT;
"""
(ROOT / "migrations" / "20270000000022_competency_pilot_drafts.sql").write_text(sql, encoding="utf-8")
