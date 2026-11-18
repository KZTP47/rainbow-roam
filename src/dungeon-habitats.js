// Each family supplies the inhabitants, signature treasure and underground landmark.
const families={
  tide:['crab','Barnacle Crab','Brine Lantern','Admiral Claw','Pearl-inlaid Doubloon','Shell Bank','#57beb6','#efb087',.88],
  ice:['stoat','Rime Stoat','Aurora Wisp','The Glacier Runner','Aurora Teardrop','Rime Nursery','#b6d9ed','#a9bafa',1.26],
  grove:['turtle','Bracketback','Spore Light','Old Rootshell','Amber Spore Brooch','Mycelium Beds','#a5bc82','#efb892',.78],
  kiln:['beetle','Furnace Beetle','Kiln Spark','Emberhorn','Fireglass Cameo','Kiln Vent','#d48960','#f8ca73',1.05],
  fen:['newt','Rush Newt','Reedlight','The Fen Creeper','Reed Pearl Comb','Reed Beds','#82ac86','#e7c77b',1.15],
  harvest:['bee','Waxwing Bee','Pollen Sprite','Queen Honeycomb','Wax-sealed Seed Locket','Honey Stores','#edc26d','#c98759',1.20],
  sky:['ray','Cloud Ray','Zephyr Wisp','The Gale Skater','Windrose Feather','Updraft Well','#96d2db','#cdc1eb',1.20],
  forge:['golem','Rivet Golem','Forge Spark','Master Rivet','Foundry Maker’s Mark','Foundry Sluice','#af8c78','#cdd1ab',.80],
  stars:['bat','Starveil Bat','Lens Wisp','The Eclipse Bat','Meteor Lens','Star Lens Gallery','#b398d7','#9dd5df',1.18],
  silk:['moth','Skein Moth','Dyelight','The Brocade Spinner','Shot-silk Spindle','Skein Loft','#ca9fbb','#bbd7a3',1.10],
  moor:['hare','Heather Jack','Foxfire','The Cairn Jumper','Heatherstone Charm','Cairn Steps','#b1a6c7','#e7be91',1.27],
  prism:['beetle','Facet Beetle','Quartz Wisp','Crown of Facets','Faceted Geode','Crystal Seam','#a6b5e5','#efa9cf',.95]
};
const regions={
  tide:'coast silvercoast reef bellport seabloom pearldrift shellmirror saltbanner',
  ice:'frost hushsnow larkspur belltarn',grove:'woods gloam brambleglass inkroot coppercap',
  kiln:'mesa cinder safflower claycup sunhammer redfan',fen:'delta tamarack amberfen reedwatch rainchain fernwick',
  harvest:'valley orchards goldgraft honeywarden fennel',sky:'sky windmere windspool thornpost',
  forge:'silverrun cooperward verdigris',stars:'hogwarts starward stellarcairn',silk:'dyeward linen',moor:'heath',prism:'opalreach'
};
const local={auroraglass:'ice',lanternroot:'grove',pearlfoam:'tide',sunspindle:'kiln',orchid:'grove',moonrise:'stars',mossvault:'grove',prismfault:'prism',ridge:'prism',mushroom:'grove',willow:'grove',fernbank:'fen',shell:'tide',moon:'fen',cloud:'sky',kite:'sky',heatherpost:'moor'};
const byRealm=Object.fromEntries(Object.entries(regions).flatMap(([family,names])=>names.split(' ').map(name=>[name,family])));
export const dungeonRelics=Object.fromEntries(Object.entries(families).map(([id,data])=>['relic-'+id,[data[4],'gem']]));
export function dungeonHabitat(entrance){
  const family=local[entrance.place??entrance.id]??byRealm[entrance.realm];
  const [form,hunter,wisp,boss,relic,landmark,color,trim,pace]=families[family];
  return {family,form,hunter,wisp,boss,relic,landmark,color,trim,pace};
}
