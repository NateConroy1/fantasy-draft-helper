import { Columns, Positions } from './constants';

function parseList(text, onError) {
  const lines = text.replace(/"/g, '').split('\n');
  const headers = lines[0].trim().split(',');
  let nameCol = -1;
  let posCol = -1;
  let teamCol = -1;
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i].toLowerCase();
    switch (header) {
      case Columns.NAME:
        nameCol = i;
        break;
      case Columns.POSITION:
        posCol = i;
        break;
      case Columns.TEAM:
        teamCol = i;
        break;
      default:
        break;
    }
  }

  // if missing headers
  if (nameCol === -1 || posCol === -1 || teamCol === -1) {
    const missingCols = [];
    if (nameCol === -1) missingCols.push(Columns.NAME);
    if (posCol === -1) missingCols.push(Columns.POSITION);
    if (teamCol === -1) missingCols.push(Columns.TEAM);
    onError(`Invalid file. Missing column(s): ${missingCols}`);
    return null;
  }

  // parse each line
  const list = { type: null, data: [] };
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim().split(',');
    if (line.length > Math.max(nameCol, posCol, teamCol)) {
      if (list.type === null) {
        list.type = line[posCol];
      } else if (list.type !== Positions.ALL && list.type !== line[posCol]) {
        list.type = Positions.ALL;
      }
      list.data.push({
        rank: i,
        name: line[nameCol],
        position: line[posCol],
        team: line[teamCol],
      });
    }
  }

  if (list.data.length < 0) {
    onError('List is empty');
    return null;
  }

  return list;
}

export default parseList;
