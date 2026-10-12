// Synthetic EN→HR test set (heating / appliance content). No client text.
// expected: verdicts accepted as correct for this segment.
const segments = [
  { id: 'S01', source: 'Connect the green/yellow earth wire to terminal PE.', target: 'Spojite zeleno-žutu žicu uzemljenja na stezaljku PE.', expected: ['OK'], note: 'green as colour (earth wire)' },
  { id: 'S02', source: 'The green LED lights up when the unit is ready.', target: 'Zelena LED dioda svijetli kada je uređaj spreman.', expected: ['OK'], note: 'green as colour (LED)' },
  { id: 'S03', source: 'Replace the carbon filter every six months.', target: 'Zamijenite ugljeni filtar svakih šest mjeseci.', expected: ['OK'], note: 'carbon = component' },
  { id: 'S04', source: 'Energy label class A+++ (35 °C application).', target: 'Razred energetske oznake A+++ (primjena pri 35 °C).', expected: ['OK'], note: 'regulated label class' },
  { id: 'S05', source: 'Uses the natural refrigerant R290.', target: 'Koristi prirodno rashladno sredstvo R290.', expected: ['OK'], note: 'technical term' },
  { id: 'S06', source: 'Our most eco-friendly heat pump ever.', target: 'Naša ekološki najprihvatljivija dizalica topline dosad.', expected: ['FLAG'], note: 'generic claim' },
  { id: 'S07', source: 'Carbon neutral heating for your home.', target: 'Ugljično neutralno grijanje za vaš dom.', expected: ['FLAG'], note: 'neutrality claim' },
  { id: 'S08', source: 'The most energy-efficient heat pump on the market.', target: 'Energetski najučinkovitija dizalica topline na tržištu.', expected: ['FLAG'], note: 'unsubstantiated superlative' },
  { id: 'S09', source: 'Sustainable comfort all year round.', target: 'Održiva udobnost tijekom cijele godine.', expected: ['FLAG'], note: 'generic claim' },
  { id: 'S10', source: 'Climate-friendly technology for every home.', target: 'Klimatski prihvatljiva tehnologija za svaki dom.', expected: ['FLAG'], note: 'generic claim' },
  { id: 'S11', source: 'Delivered in biodegradable packaging.', target: 'Isporučuje se u biorazgradivoj ambalaži.', expected: ['REVIEW'], note: 'specific claim, needs evidence' },
  { id: 'S12', source: 'Reduces CO2 emissions by up to 40% compared to a gas boiler (EN 14825 test conditions).', target: 'Smanjuje emisije CO2 do 40 % u usporedbi s plinskim kotlom (uvjeti ispitivanja prema EN 14825).', expected: ['REVIEW'], note: 'specific, quantified claim' },
  { id: 'S13', source: 'Environmentally friendly operation.', target: 'Rad prihvatljiv za okoliš.', expected: ['FLAG'], note: 'generic claim, split phrase in HR' },
  { id: 'S14', source: 'Quiet operation at 35 dB(A).', target: 'Tihi rad pri 35 dB(A).', expected: ['OK'], note: 'no claim' },
  { id: 'S15', source: 'Efficient operation in cold climates.', target: 'Ekološki učinkovit rad u hladnim klimama.', expected: ['FLAG'], note: 'claim introduced by translation' },
  { id: 'S16', source: 'Designed for a long service life.', target: 'Dizajniran za dug vijek trajanja i održivost.', expected: ['FLAG'], note: 'claim introduced by translation' },
  { id: 'S17', source: 'Complies with the ecodesign requirements of Regulation (EU) No 813/2013.', target: 'Usklađen sa zahtjevima za ekološki dizajn iz Uredbe (EU) br. 813/2013.', expected: ['OK'], note: 'regulatory term' },
  { id: 'S18', source: 'Green energy from your own solar panels.', target: 'Zelena energija iz vlastitih solarnih panela.', expected: ['FLAG', 'REVIEW'], note: 'green as environmental, borderline' },
  { id: 'S19', source: 'A green solution for modern homes.', target: 'Zeleno rješenje za moderne domove.', expected: ['FLAG'], note: 'green as environmental' },
  { id: 'S20', source: 'Available in white, black and green.', target: 'Dostupno u bijeloj, crnoj i zelenoj boji.', expected: ['OK'], note: 'green as colour, needs context' },
  { id: 'S21', source: 'Housing made with 30% recycled plastic.', target: 'Kućište izrađeno s 30 % reciklirane plastike.', expected: ['REVIEW'], note: 'specific claim, needs evidence' },
];
return segments.map(s => ({ json: s }));
