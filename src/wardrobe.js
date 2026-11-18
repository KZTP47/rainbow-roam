export const wardrobe = {
  morph: {label:'Traveler', choices:[['Male'],['Female'],['Angel'],['Teddy bear'],['Moonling alien'],['Mermaid']]},
  style: {label:'Hairstyle', choices:[['Side swept'],['Top knot'],['Twin braids'],['Soft curls'],['Short crop'],['Chin-length bob'],['Textured fringe'],['Long waves'],['Curtain bangs'],['Ponytail'],['Close curls'],['Long braids']]},
  hair: {label:'Hair color', choices:[['Chestnut','#653d48'],['Espresso','#342b3a'],['Auburn','#9b482e'],['Golden','#d69b58'],['Silver','#d4c5e0'],['Lilac','#9068b0'],['Blue-black','#30384c'],['Rose','#a95b78'],['Sandy blond','#e6c088'],['Pine','#385a56']]},
  skin: {label:'Skin tone', choices:[['Apricot','#e1a484'],['Porcelain','#f8cfaf'],['Honey','#c38659'],['Copper','#a76952'],['Walnut','#754d42'],['Deep umber','#513735'],['Sand','#dfb482'],['Rose beige','#e0b5a5']]},
  eyes: {label:'Eye color', choices:[['Brown','#715049'],['Green','#547a66'],['Blue','#59769e'],['Amber','#9d754b'],['Violet','#7e649b'],['Espresso eyes','#452e3b']]},
  outfit: {label:'Outfit', choices:[['Trail jacket'],['Market clothes'],['Ranger vest'],['Festival layers'],['Wizard robes']]},
  coat: {label:'Clothing color', choices:[['Rain blue','#80a6ab'],['Strawberry','#d36f88'],['Moss','#658c61'],['Midnight','#585c90'],['Marigold','#cf9a4f'],['Plum','#985b8b'],['Slate','#657689'],['Wine','#9f4c62'],['Cream','#d5bf9b'],['Forest','#496c64']]},
  accessory: {label:'Headwear', choices:[['Trail hat'],['Flower crown'],['Star clip'],['None'],['Rose ribbon'],['Blue ribbon'],['Crystal clips'],['Witch hat']]},
  beard: {label:'Facial hair', choices:[['Clean-shaven'],['Short beard'],['Full beard']]},
  scales:{label:'Tail scales',choices:[['Lagoon','#58aca8'],['Coral','#df8b96'],['Sea violet','#aa92ce'],['Deep blue','#678cc4']]},
  glowSkin:{label:'Moonling color',choices:[['Seafoam','#8fd7bd'],['Orchid','#c4a4de'],['Blue moon','#8ac8e8'],['Peach','#f4b495']]},
  feather:{label:'Feathers',choices:[['Ivory','#fff1de'],['Rose down','#edbfd7'],['Moon blue','#c7d9f0'],['Mint down','#cce5d2']]},
  halo:{label:'Halo',choices:[['Morning gold','#ffd88e'],['Opal','#cce5f3'],['Rose gold','#f6afaf']]},
  wingShape:{label:'Wing shape',choices:[['Dove'],['Long feathers'],['Soft wings']]},
  fur:{label:'Fur',choices:[
    ['Honey fur','#bf8f72'],['Rose fur','#cc9aa7'],['Lavender fur','#ac99bc'],['Cream fur','#e8cdb0'],['Cocoa fur','#956e63'],
    ['Red fur','#df686e'],['Orange fur','#e89856'],['Yellow fur','#eacb5b'],['Green fur','#78bd80'],
    ['Blue fur','#66aad9'],['Indigo fur','#626bb0'],['Violet fur','#a378d2']
  ]},
  ears:{label:'Ears',choices:[['Round ears'],['Tall ears'],['Button ears']]},
  toy:{label:'Teddy style',choices:[['Ribbon bear'],['Patchwork bear'],['Scout bear']]}
};

const extras=['scales','glowSkin','feather','halo','wingShape','fur','ears','toy'];
export const defaultLook=Object.fromEntries(Object.keys(wardrobe).filter(id=>!extras.includes(id)).map(id=>[id,0]));

export function normalizeLook(look) {
  return Object.fromEntries(Object.entries(wardrobe).filter(([id])=>!extras.includes(id)||look?.[id]!==undefined).map(([id,{choices}])=>{
    const choice=look?.[id];
    return [id,Number.isInteger(choice)&&choice>=0&&choice<choices.length?choice:0];
  }));
}

export function outfitColors(look) {
  return ['skin','coat','hair'].map(id=>wardrobe[id].choices[look[id]][1]);
}
