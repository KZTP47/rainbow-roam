export const skyOrigin={x:33,z:-117,altitude:18};
export const skyRim=19.3;
export const skyWalkRadius=17.8;

export const skyIslands={
  auroraglass:{
    name:'Auroraglass Shelf', below:'frost', world:[-30,-178], lift:10, color:'#b8dbe7', biome:'ice',
    landmark:['The prism garden',0,-7,'mountain'], shop:'Prism and Pine',
    item:['auroraQuartz','Aurora quartz','gem','#89b9de'], native:'rimepop',
    resident:['Edda','Prism keeper'], pet:['Flurrybell','owl','#eff4f8','#91b5de'],
    task:['Leave the cracked one','item','The cracked prisms scatter light better than the smooth ones. I need three pieces for the frame. If you find one with a blue seam, put it in your pocket. It’s yours.','The seam went all the way through that one. Look at the blue on the snow.']
  },
  lanternroot:{
    name:'Lanternroot Isle', below:'woods', world:[-158,9], lift:5, color:'#a6c395', biome:'willow',
    landmark:['The lantern willow',0,-7,'tree'], shop:'Wick & Root',
    item:['lanternSeed','Lantern willow seed','sprout','#b7a156'], native:'woodcake',
    resident:['Marta','Wick maker'], pet:['Wicklet','moth','#f0dc9d','#8da57f'],
    task:['A place by the wick','bond','Wicklet keeps settling on the cold lantern. I used to take it down when I closed the stall. I think I’ll leave it up tonight. Would you keep it company until then?','It’s brought you back. I’ve put out a second lantern in case the two of you come by again.']
  },
  sunspindle:{
    name:'Sunspindle Cay', below:'mesa', world:[166,-6], lift:12, color:'#e1b487', biome:'sandstone',
    landmark:['The wind organ',0,-7,'wind'], shop:'The Copper Windstall',
    item:['sunspunGlass','Sunspun glass','gem','#ebae72'], native:'sunwafer',
    resident:['Samir','Wind organ tuner'], pet:['Pipwhistle','dragon','#f3c381','#b36a84'],
    task:['Three notes at noon','stamp','The little pipe plays when nobody’s standing near it. Go up to the survey marker and see what it plays when I stay here.','Just three notes? That’s the hole my brother plugged with his thumb. I’d forgotten how it sounded open.']
  },
  pearlfoam:{
    name:'Pearlfoam Reach', below:'coast', world:[-161,124], lift:3, color:'#86c6c1', biome:'shell',
    landmark:['The suspended tide pool',0,-7,'water'], shop:'Foam & Shell',
    item:['mistPearl','Mist pearl','gem','#c2b7e6'], native:'saltcrisp',
    resident:['Inez','Shell gardener'], pet:['Foamwhisk','gull','#f2efde','#79bec4'],
    task:['A weight for the tide book','item','My tide book blew down to Brinewatch yesterday. The ferry brought it back wet. Could you find me three mist pearls? The flat ones should hold it open.','They don’t roll even with the wind coming straight at us. I’ll keep one on the cup, too.']
  },
  owlpost:{
    name:'Owlpost Drift', below:'hogwarts', world:[-8,151], lift:8, color:'#afabc9', biome:'roost',
    landmark:['The slate owl loft',0,-7,'hall'], shop:'The Feather Counter',
    item:['silkQuill','Silk quill','wind','#b6a0ce'], native:'treat',
    resident:['Fenella','Postmistress'], pet:['Inkcap','owl','#cebfe2','#776b9b'],
    task:['The return address','bond','Inkcap made it back with every letter bar one. The missing one was mine. I think it’s tucked under a wing. If Inkcap lets you sit close, see whether you can spot it.','There it is. I’d written the address on the inside. I suppose all that practice flying in circles came in handy.']
  },
  jadegale:{
    name:'Jadegale Garden', below:'verdigris', world:[267,14], lift:15, color:'#91cdb0', biome:'terrace',
    landmark:['The bell terraces',0,-7,'tree'], shop:'The Bellflower Stall',
    item:['jadeBell','Jade bellflower','flower-2','#7bc6a6'], native:'verdigris-bake',
    resident:['Min','Terrace gardener'], pet:['Jadewing','sprite','#a3dfc6','#dfadce'],
    task:['Before anyone rings it','stamp','The lowest bell is there to tell me when the top bed needs water. The moths have taken up residence inside it. Check the marker and tell me whether the little channels still reach both beds.','Both beds, then. I’ll leave the bell alone while the moths are in it. Come back when the flowers open.']
  }
};

export const skyItemIslands=Object.fromEntries(Object.values(skyIslands).map(island=>[island.item[0],island]));
export function skyCounterPoint(place){return [place.x-4.8,place.z-1.65];}

export const skyShops=Object.fromEntries(Object.entries(skyIslands).map(([id,island])=>[id,{
  name:island.shop,goods:[[island.item[0],6],['skyfloss',4],['skymeringue',7],[island.native,8]]
}]));
