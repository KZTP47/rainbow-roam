export const runeSymbols = Object.freeze({
  sun: ['Sun','sun'], drop: ['Drop','droplet'], leaf: ['Leaf','sprout'], moon: ['Moon','moon']
});

const verses=[
  {title:'The Garden Seal',clue:'Wake the garden with daylight. Give it a drink, then greet what grows.',order:['sun','drop','leaf']},
  {title:'The Night Seal',clue:'Let night light the way. Follow the water until you find something green.',order:['moon','drop','leaf']},
  {title:'The Water Seal',clue:'Start where a puddle begins. Follow its reflection from midday to midnight.',order:['drop','sun','moon']},
  {title:'The Canopy Seal',clue:'First, what turns green in spring. Then what lights up the night. Last, what wakes the valley.',order:['leaf','moon','sun']},
  {title:'The Rain Seal',clue:'Begin with the light after sunset. Touch what falls from clouds, then what dries the stones.',order:['moon','drop','sun']}
];

export function runePuzzle(seed,depth) {
  return verses[((seed>>>0)+depth)%verses.length];
}

const cellar=[
  '#############',
  '##.........##',
  '##....D....##',
  '##.........##',
  '######.######',
  '######C######',
  '######G######',
  '####.....####',
  '####.....####',
  '####..E..####',
  '######U######',
  '#############'
];

const hollow=[
  '#############',
  '##.........##',
  '##.........##',
  '##.........##',
  '######C######',
  '######G######',
  '####.....####',
  '####.....####',
  '####..E..####',
  '######U######',
  '#############'
];

export const lowerFloorPlans = [cellar,hollow];

export function runeAnswerMatches(puzzle,answer) {
  return Boolean(puzzle&&Array.isArray(answer)&&answer.length===puzzle.order.length&&
    puzzle.order.every((rune,i)=>rune===answer[i]));
}
