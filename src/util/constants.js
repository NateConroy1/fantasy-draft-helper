export const Columns = {
  name: ['name', 'player'],
  position: ['position', 'pos'],
  team: ['team'],
  bye: ['bye', 'byeweek'],
  tier: ['tier'],
  value: ['value', 'val'],
};

export const Positions = {
  ALL: 'ALL',
  RB: 'RB',
  WR: 'WR',
  TE: 'TE',
  QB: 'QB',
  DST: 'DST',
  K: 'K',
};

export const Suffixes = {
  jr: true,
  sr: true,
  i: true,
  ii: true,
  iii: true,
  iv: true,
  v: true,
  vi: true,
  vii: true,
  viii: true,
  ix: true,
  x: true,
};

export const TeamAbbrevs = {
  ARI: { city: 'Arizona', mascot: 'Cardinals' },
  CHI: { city: 'Chicago', mascot: 'Bears' },
  GB: { city: 'Green Bay', mascot: 'Packers' },
  NYG: { city: 'New York', mascot: 'Giants' },
  DET: { city: 'Detroit', mascot: 'Lions' },
  WAS: { city: 'Washington', mascot: 'Football Team' },
  PHI: { city: 'Philadelphia', mascot: 'Eagles' },
  PIT: { city: 'Pittsburgh', mascot: 'Steelers' },
  LAR: { city: 'Los Angeles', mascot: 'Rams' },
  SF: { city: 'San Francisco', mascot: '49ers' },
  CLE: { city: 'Cleveland', mascot: 'Browns' },
  IND: { city: 'Indianapolis', mascot: 'Colts' },
  DAL: { city: 'Dallas', mascot: 'Cowboys' },
  KC: { city: 'Kansas City', mascot: 'Chiefs' },
  LAC: { city: 'Los Angeles', mascot: 'Chargers' },
  DEN: { city: 'Denver', mascot: 'Broncos' },
  NYJ: { city: 'New York', mascot: 'Jets' },
  NE: { city: 'New England', mascot: 'Patriots' },
  LV: { city: 'Las Vegas', mascot: 'Raiders' },
  TEN: { city: 'Tennessee', mascot: 'Titans' },
  BUF: { city: 'Buffalo', mascot: 'Bills' },
  MIN: { city: 'Minnesota', mascot: 'Vikings' },
  ATL: { city: 'Atlanta', mascot: 'Falcons' },
  MIA: { city: 'Miami', mascot: 'Dolphins' },
  NO: { city: 'New Orleans', mascot: 'Saints' },
  CIN: { city: 'Cincinnati', mascot: 'Bengals' },
  SEA: { city: 'Seattle', mascot: 'Seahawks' },
  TB: { city: 'Tampa Bay', mascot: 'Buccaneers' },
  CAR: { city: 'Carolina', mascot: 'Panthers' },
  JAC: { city: 'Jacksonville', mascot: 'Jaguars' },
  BAL: { city: 'Baltimore', mascot: 'Ravens' },
  HOU: { city: 'Houston', mascot: 'Texans' },
};

export const Cities = {};
export const Mascots = {};
Object.keys(TeamAbbrevs).forEach((abbr) => {
  const city = TeamAbbrevs[abbr].city.toLowerCase();
  const mascot = TeamAbbrevs[abbr].mascot.toLowerCase();
  if (!Cities.hasOwnProperty(city)) {
    Cities[city] = [];
  }
  Cities[city].push(abbr);
  Mascots[mascot] = abbr;
});

export const RankingListsKey = 'rankingLists';
export const AggregatedListKey = 'aggregatedList';
export const PlayersKey = 'playersKey';

export const REPO_URL = 'https://github.com/NateConroy1/fantasy-draft-helper';
