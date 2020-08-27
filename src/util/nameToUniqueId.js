import { Suffixes } from './constants';

const nameToUniqueId = (name) => {
  // make string lowercase and split names
  const nameLower = name.toLowerCase();
  const splitBySpaces = nameLower.split(' ');

  const subSections = splitBySpaces.length;
  if (subSections > 2) {
    // if last substring is a suffix, remove it
    if (Suffixes.hasOwnProperty(splitBySpaces[subSections - 1])) {
      splitBySpaces.splice(subSections - 1, 1);
    }
  }

  // fuse string back together
  let sanitizedName = '';
  splitBySpaces.forEach((sub) => {
    sanitizedName += sub;
  });

  // remove special characters
  sanitizedName = sanitizedName.replace(/[^a-z0-9]/g, '');

  return sanitizedName;
};

export default nameToUniqueId;
