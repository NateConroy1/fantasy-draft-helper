import { Suffixes } from './constants';

const nameToUniqueId = (name) => {
  // make string lowercase, remove special characters, and split names
  const nameLower = name.toLowerCase().replace(/[^a-z0-9 ]/g, '');
  const splitBySpaces = nameLower.split(' ');

  const subSections = splitBySpaces.length;
  if (subSections > 2) {
    // if last substring is a suffix, remove it
    if (Suffixes.hasOwnProperty(splitBySpaces[subSections - 1])) {
      splitBySpaces.splice(subSections - 1, 1);
    }
  }

  // fuse string back together
  let playerId = '';
  splitBySpaces.forEach((sub) => {
    playerId += sub;
  });

  return playerId;
};

export default nameToUniqueId;
