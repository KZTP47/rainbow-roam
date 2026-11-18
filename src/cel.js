import * as T from 'three';

const bands = new T.DataTexture(
  new Uint8Array([33,33,33,55,55,82,82,126,126,158,158,197,197,226,250,250]),
  16,1,T.RedFormat
);
bands.minFilter=bands.magFilter=T.NearestFilter;
bands.needsUpdate=true;

export function celMaterial(color,options) {
  return new T.MeshToonMaterial({color,gradientMap:bands,...options});
}

const ink = new T.MeshBasicMaterial({color:'#443348',side:T.BackSide});

export function inkSilhouette(model) {
  const shells=[];
  model.traverse(mesh=>{
    if(!mesh.isMesh || mesh.scale.x<.13 || mesh.scale.y<.12 || mesh.scale.z<.11) return;
    const shell=new T.Mesh(mesh.geometry,ink);
    shell.scale.set(1+.012/mesh.scale.x,1+.012/mesh.scale.y,1+.012/mesh.scale.z);
    shells.push([mesh,shell]);
  });
  for(const [mesh,shell] of shells) mesh.add(shell);
}
