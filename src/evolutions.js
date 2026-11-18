import {species} from './content.js';
import {evolutionDesigns} from './evolution-designs.js';

export const affinities = [4, 9];
export const evolutionIds = Object.keys(evolutionDesigns);
export const evolutionColumns = 8;

export function friendStage(state, id) {
  return Object.hasOwn(evolutionDesigns, id) ? state.evolutions?.[id] ?? 0 : 0;
}

export function friendForm(id, stage) {
  const base = species[id];
  if (!base || !stage) return base;
  const form = evolutionDesigns[id]?.[stage];
  if (!form) return base;
  const [name, motif, accent, lore] = form;
  return {...base, name, accent, lore, evolution:{stage, motif, originalAccent:base.accent}};
}

export function currentFriend(state, id) {
  return friendForm(id, friendStage(state, id));
}

export function evolutionRequirement(state, id, stage) {
  if (!Object.hasOwn(evolutionDesigns, id) || ![1, 2].includes(stage)) return null;
  const item = stage === 1 ? species[id].favorite : evolutionDesigns[id][0];
  const count = stage === 1 || item === 'charm' ? 1 : 2;
  const affinity = affinities[stage - 1];
  const bonded = state.companions.includes(id);
  const away = state.bounties?.abducted?.pet === id || state.townLife?.trip?.pet === id;
  const friendship = state.care[id]?.affinity ?? 0;
  const stock = state.inventory[item] ?? 0;
  const ready = bonded && !away && friendStage(state, id) === stage - 1 && friendship >= affinity && stock >= count;
  return {affinity, item, count, bonded, away, friendship, stock, ready};
}

export function evolveFriend(state, id, stage) {
  const requirement = evolutionRequirement(state, id, stage);
  if (!requirement?.ready) return null;
  state.inventory[requirement.item] -= requirement.count;
  (state.evolutions ??= {})[id] = stage;
  return friendForm(id, stage);
}
