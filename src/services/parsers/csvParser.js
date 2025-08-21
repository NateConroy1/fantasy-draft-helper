import { Columns, Positions, TeamAbbrevs } from '../../util/constants';
import nameToUniqueId from '../../util/nameToUniqueId';
import defenseToUniqueId from '../../util/defenseToUniqueId';

/**
 * Parses CSV text into a structured ranking list
 * @param {string} text - Raw CSV text
 * @param {function} onError - Error callback function
 * @returns {object|null} Parsed list object or null if parsing fails
 */
export const parseCSV = (text, onError) => {
  // Remove all quotes and split by line
  const lines = text.replace(/"/g, '').split('\n');
  
  // Parse headers
  const headers = lines[0].trim().split(',');
  const colIndices = parseHeaders(headers);
  
  // Validate required columns
  const validationError = validateRequiredColumns(colIndices);
  if (validationError) {
    onError(validationError);
    return null;
  }
  
  // Parse data rows
  const list = { positions: {}, rankings: { ALL: [] } };
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim().split(',');
    
    // Skip incomplete rows
    if (line.length !== headers.length) continue;
    
    const player = parsePlayerRow(line, colIndices, onError);
    if (!player) continue;
    
    // Add to appropriate lists
    addPlayerToList(list, player);
  }
  
  // Validate we have data
  if (list.rankings.ALL.length === 0) {
    onError('List is empty');
    return null;
  }
  
  // Clean up single-position lists
  if (Object.keys(list.rankings).length === 2) {
    delete list.rankings.ALL;
  }
  
  return list;
};

/**
 * Parse headers and map to column indices
 */
const parseHeaders = (headers) => {
  const colIndices = {};
  const recognizedCols = Object.keys(Columns);
  
  headers.forEach((header, index) => {
    const normalizedHeader = header.toLowerCase().replace(/[^a-z]/g, '');
    
    for (const colKey of recognizedCols) {
      const supportedMatches = Columns[colKey];
      if (supportedMatches.some(match => match === normalizedHeader)) {
        colIndices[supportedMatches[0]] = index;
        break;
      }
    }
  });
  
  return colIndices;
};

/**
 * Validate that all required columns are present
 */
const validateRequiredColumns = (colIndices) => {
  const required = ['name', 'position', 'team'];
  const missing = required.filter(col => !colIndices.hasOwnProperty(col));
  
  if (missing.length > 0) {
    return `Invalid file. Missing required column(s): ${missing.join(', ')}`;
  }
  
  return null;
};

/**
 * Parse a single player row
 */
const parsePlayerRow = (line, colIndices, onError) => {
  // Parse position
  const posIdx = colIndices.position;
  const position = line[posIdx].toUpperCase().replace(/[^A-Z]/g, '');
  
  if (!Positions.hasOwnProperty(position)) {
    onError(`File contains unrecognized position type: ${position}. Valid options are [RB, WR, TE, QB, K, DST].`);
    return null;
  }
  
  // Parse name
  const nameIdx = colIndices.name;
  const name = line[nameIdx];
  
  // Parse team
  const teamIdx = colIndices.team;
  let team = line[teamIdx].toUpperCase();
  
  if (!TeamAbbrevs.hasOwnProperty(team)) {
    // Try to determine team for defenses
    if (position === Positions.DST) {
      team = defenseToUniqueId(name);
      if (!team) {
        onError(`Can't recognize defensive team: ${name}`);
        return null;
      }
    }
    // TODO: For non-defense players, could check other lists for team info
  }
  
  const player = {
    name,
    position,
    team,
    bye: '',
  };
  
  // Parse optional fields
  if (colIndices.bye !== undefined) {
    const byeIdx = colIndices.bye;
    player.bye = line[byeIdx].replace(/[^0-9]/g, '');
  }
  
  if (colIndices.tier !== undefined) {
    const tierIdx = colIndices.tier;
    const tier = line[tierIdx].replace(/[^0-9]/g, '');
    if (tier.length > 0) {
      player.tier = parseInt(tier, 10);
    }
  }
  
  if (colIndices.value !== undefined) {
    const valIdx = colIndices.value;
    player.value = line[valIdx];
  }
  
  return player;
};

/**
 * Add a player to the appropriate position and overall lists
 */
const addPlayerToList = (list, player) => {
  const { position } = player;
  
  // Initialize position array if needed
  if (!list.rankings[position]) {
    list.rankings[position] = [];
  }
  
  // Add rank based on position in list
  const positionRank = list.rankings[position].length;
  const overallRank = list.rankings.ALL.length;
  
  const rankedPlayer = {
    ...player,
    rank: positionRank,
  };
  
  list.positions[position] = true;
  list.rankings[position].push(rankedPlayer);
  list.rankings.ALL.push({ ...rankedPlayer, rank: overallRank });
};

export default parseCSV;