import {icon} from './icons.js';
import {propertyBackground,propertyViewTitle} from './property-map.js';

export function propertyEntryPicker(state,view,preview){
  const garden=view==='garden';
  const iso=propertyBackground(state,view);
  const cards=[
    ['edit','armchair',garden?'Tend the garden':'Decorate',garden?'Plant, water and harvest from the garden plan.':'Place furniture and build new rooms.',iso],
    ['3d','compass','Walk in 3D',garden?'Explore the beds from the world camera.':'Step inside with the world camera.',preview],
    ['walk','map','Walk in isometric','Walk through the cutaway with your traveler.',iso]
  ];
  return `<section class="property-arrival" aria-label="Choose how to enter">
    <h3>${garden?'Kitchen garden':view==='house'?'Front door':propertyViewTitle(view)}</h3>
    <div class="property-choice-grid">${cards.map(([mode,symbol,label,description,art])=>`
      <button type="button" data-action="${mode==='3d'?'property-3d:'+view:'property-mode:'+mode}" class="property-choice choice-${mode}" aria-label="${label}" aria-describedby="choice-copy-${mode}">
        <span class="property-choice-art">${art?`<img src="${art}" alt="" draggable="false">`:''}
          <span>${icon(symbol,25)}</span></span>
        <strong>${label}</strong><small id="choice-copy-${mode}">${description}</small>
      </button>`).join('')}</div></section>`;
}
