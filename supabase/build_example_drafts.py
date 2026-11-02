"""Author prerequisite-aware pilot alternatives without publishing them."""
import json
from pathlib import Path
ROOT = Path(__file__).resolve().parent

def check(prompt, correct, other, explanation):
    return dict(prompt=prompt, options=[correct, other], correctIndex=0, explanation=explanation)

division = dict(kind="skill", key="whole-number-division", label="Divide whole numbers", refresher="Division finds the number of equal groups. Six objects in groups of two make three groups.", check=check("Six divided by two equals what?", "Three", "Four", "Three groups of two contain six objects."))
notation = dict(kind="representation", key="scientific-notation", label="Read scientific notation", refresher="A positive power of ten shifts the decimal place to the right. Three times ten squared represents three hundred.", check=check("What does three times ten squared represent?", "Three hundred", "Thirty", "Ten squared is one hundred, so three times one hundred is three hundred."))
formula = dict(kind="formula", key="time-from-distance-and-speed", label="Time from distance and speed", refresher="For constant speed, travel time equals distance divided by speed. A trip of six metres at two metres per second takes three seconds.", check=check("Six metres at two metres per second takes how long?", "Three seconds", "Twelve seconds", "Divide distance by speed: six divided by two is three seconds."))

pack = [
 dict(slug="density", sequence=7, prerequisites=[division], examples=[
  dict(key="unit-volume", category="recognition", difficulty=1, support="guided", prerequisites=[], body="A sample fills exactly one cubic centimetre and has a mass of two grams. Use density = mass divided by volume: two divided by one is two grams per cubic centimetre.", quickCheck=check("What is the density of two grams in one cubic centimetre?", "Two grams per cubic centimetre", "One gram per cubic centimetre", "Divide the mass of two grams by the volume of one cubic centimetre.")),
  dict(key="equal-groups", category="application", difficulty=2, support="guided", prerequisites=[division], body="A sample has a mass of twenty grams and a volume of ten cubic centimetres. Divide twenty by ten to find a density of two grams per cubic centimetre. Include both units in the result.", quickCheck=check("Twenty grams in ten cubic centimetres has what density?", "Two grams per cubic centimetre", "Ten grams per cubic centimetre", "Density is twenty divided by ten, which is two.")),
  dict(key="independent-density", category="quantitative", difficulty=3, support="independent", prerequisites=[division], body="Choose the density formula for a sample with mass sixty grams and volume twenty cubic centimetres. Use the measured quantities and justify the units before checking your result.", quickCheck=check("What is sixty grams divided by twenty cubic centimetres?", "Three grams per cubic centimetre", "Thirty grams per cubic centimetre", "Sixty divided by twenty is three; the units are grams per cubic centimetre.")),
 ]),
 dict(slug="space-solar-system", sequence=8, prerequisites=[], examples=[
  dict(key="diagram-scale", category="recognition", difficulty=1, support="guided", prerequisites=[], body="A page-sized Solar System diagram often makes planets much larger relative to the gaps than they really are. Check its scale statement before using it to compare actual sizes or distances.", quickCheck=check("A diagram says planet sizes are enlarged. Can it show the true size-to-distance proportions?", "No, the enlarged sizes change those proportions", "Yes, every labelled diagram is fully to scale", "Labels identify objects; a scale statement tells you whether their proportions are accurate.")),
  dict(key="relative-distance", category="relationship", difficulty=2, support="guided", prerequisites=[], body="Earth's average distance from the Sun is about one astronomical unit. An object at three astronomical units is about three times that distance. This compares distances from the Sun rather than the object's diameter.", quickCheck=check("Compared with Earth's average Sun distance of one astronomical unit, three astronomical units is what?", "About three times that distance", "About three times Earth's diameter", "Both quantities are distances from the Sun, with the same astronomical-unit reference.")),
  dict(key="light-travel-extension", category="quantitative", difficulty=4, support="independent", prerequisites=[notation, formula], body="An extension model uses a light-travel distance of 1.5 times ten to the eight kilometres and a speed of 3 times ten to the five kilometres per second. The model is an approximation. It requires interpreting the notation and using time = distance divided by speed before drawing a conclusion.", quickCheck=check("Using those approximate values, the travel time is closest to what?", "Five hundred seconds", "Five seconds", "Divide 1.5 by 3 and ten to the eight by ten to the five: 0.5 times one thousand gives five hundred seconds.")),
 ]),
]
(ROOT / "competency_example_drafts.json").write_text(json.dumps(pack, indent=2)+"\n", encoding="utf-8")
sql = """BEGIN;
DO $seed$
DECLARE item jsonb; b public.knowledge_blocks;
BEGIN
 FOR item IN SELECT value FROM jsonb_array_elements($data$"""+json.dumps(pack)+"""$data$::jsonb) LOOP
  SELECT kb.* INTO b FROM public.knowledge_blocks kb JOIN public.concepts c ON c.id=kb.concept_id
   WHERE c.slug=item->>'slug' AND kb.depth='foundation' AND kb.sequence=(item->>'sequence')::int FOR UPDATE OF kb;
  IF NOT FOUND THEN RAISE EXCEPTION 'Missing pilot block'; END IF;
  IF b.review_status='draft' AND (b.content->'examples' IS DISTINCT FROM item->'examples' OR b.content->'prerequisites' IS DISTINCT FROM item->'prerequisites') THEN
   UPDATE public.knowledge_blocks SET content=content||jsonb_build_object('examples',item->'examples','prerequisites',item->'prerequisites'),version=version+1,updated_at=now() WHERE id=b.id;
  END IF;
 END LOOP;
END;
$seed$;
COMMIT;
"""
(ROOT / "migrations" / "20270000000029_example_selection_drafts.sql").write_text(sql, encoding="utf-8")
