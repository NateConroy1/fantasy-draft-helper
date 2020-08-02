import { Columns, Positions } from '../util/constants';

class DataService {
  constructor() {
    this.lists = [];
    this.players = {};

    this.addPlayers = this.addPlayers.bind(this);
    this.toggleDrafted = this.toggleDrafted.bind(this);
    this.addList = this.addList.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.parseList = this.parseList.bind(this);
  }

  addPlayers(players) {
    Object.keys(players).forEach((name) => {
      if (!this.players.hasOwnProperty(name)) {
        this.players[name] = true;
      }
    });
  }

  toggleDrafted(player) {
    if (this.players.hasOwnProperty(player)) {
      this.players[player] = !this.players[player];
    }
  }

  addList(name, list) {
    const newName = name === '' ? `List ${this.lists.length + 1}` : name;
    this.lists.push({ name: newName, list });
    this.addPlayers(list.players);
  }

  deleteList(index) {
    this.lists.splice(index, 1);
  }

  parseList(text, onError) {
    const lines = text.replace(/"/g, '').split('\n');
    const headers = lines[0].trim().split(',');
    let nameCol = -1;
    let posCol = -1;
    let teamCol = -1;
    let byeCol = -1;
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
        case Columns.BYE:
          byeCol = i;
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
      if (byeCol === -1) missingCols.push(Columns.BYE);
      onError(`Invalid file. Missing column(s): ${missingCols}`);
      return null;
    }

    // parse each line
    const list = { type: null, players: {}, data: [] };
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim().split(',');
      if (line.length > Math.max(nameCol, posCol, teamCol, byeCol)) {
        if (list.type === null) {
          list.type = line[posCol];
        } else if (list.type !== Positions.ALL && list.type !== line[posCol]) {
          list.type = Positions.ALL;
        }
        const name = line[nameCol];
        list.players[name] = 1;
        list.data.push({
          rank: i,
          name,
          position: line[posCol],
          team: line[teamCol],
          bye: line[byeCol],
        });
      }
    }

    if (list.data.length < 0) {
      onError('List is empty');
      return null;
    }

    return list;
  }
}

export default DataService;
