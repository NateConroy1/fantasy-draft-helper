import { Cities, Mascots, TeamAbbrevs } from './constants';

const defenseToUniqueId = (defenseString) => {
  // make string lowercase and remove special characters
  const nameLower = defenseString.toLowerCase().replace(/[^a-z0-9 ]/g, '');

  // split by spaces
  const splitBySpaces = nameLower.split(' ');

  for (let i = 0; i < splitBySpaces.length; i++) {
    const sub = splitBySpaces[i];

    // check if the substring matches an official team abbreviation
    if (TeamAbbrevs.hasOwnProperty(sub.toUpperCase())) {
      return sub.toUpperCase();
    }

    // check if the substring matches an official mascot
    if (Mascots.hasOwnProperty(sub)) {
      return Mascots[sub];
    }
  }

  // check by city as a last resort
  // cities can be duplicates so only determine if we are positive
  const cities = Object.keys(Cities);
  for (let i = 0; i < cities.length; i++) {
    const city = cities[i];
    if (nameLower.includes(city)) {
      const cityList = Cities[city];
      if (cityList.length === 1) {
        return cityList[0];
      }
    }
  }

  // we can't identify the unique team by its name
  return null;
};

export default defenseToUniqueId;
