import { Columns, RankingListsKey, PlayersKey } from '../util/constants';

class DataService {
  constructor() {
    const storedLists = this._retrieveFromLocalStorage(RankingListsKey);
    const storedPlayers = this._retrieveFromLocalStorage(PlayersKey);

    this.lists = (storedLists === null ? [] : storedLists);
    this.players = (storedPlayers === null ? {} : storedPlayers);

    this.addPlayers = this.addPlayers.bind(this);
    this.toggleDrafted = this.toggleDrafted.bind(this);
    this.addList = this.addList.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.parseList = this.parseList.bind(this);
    this._updateLocalStorage = this._updateLocalStorage.bind(this);
    this._retrieveFromLocalStorage = this._retrieveFromLocalStorage.bind(this);
  }

  addPlayers(players) {
    Object.keys(players).forEach((name) => {
      if (!this.players.hasOwnProperty(name)) {
        this.players[name] = true;
      }
    });
    this._updateLocalStorage(PlayersKey, this.players);
  }

  toggleDrafted(player) {
    if (this.players.hasOwnProperty(player)) {
      this.players[player] = !this.players[player];
      this._updateLocalStorage(PlayersKey, this.players);
    }
  }

  addList(name, list) {
    const newName = name === '' ? `List ${this.lists.length + 1}` : name;
    this.lists.push({ name: newName, list });
    this.addPlayers(list.players);
    this._updateLocalStorage(RankingListsKey, this.lists);
  }

  deleteList(index) {
    this.lists.splice(index, 1);
    this._updateLocalStorage(RankingListsKey, this.lists);
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
    const list = { positions: {}, players: {}, rankings: { ALL: [] } };
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim().split(',');
      if (line.length > Math.max(nameCol, posCol, teamCol, byeCol)) {
        const position = line[posCol].replace(/[0-9]/g, '');
        const name = line[nameCol];
        const entry = {
          rank: i,
          name,
          position,
          team: line[teamCol],
          bye: line[byeCol],
        };
        list.positions[position] = true;
        list.players[name] = 1;
        if (!list.rankings.hasOwnProperty(position)) {
          list.rankings[position] = [];
        }
        list.rankings[position].push(entry);
        list.rankings.ALL.push(entry);
      }
    }

    if (list.rankings.ALL.length === 0) {
      onError('List is empty');
      return null;
    }

    return list;
  }

  _updateLocalStorage(key, object) {
    localStorage.setItem(key, JSON.stringify(object));
  }

  _retrieveFromLocalStorage(key) {
    const object = localStorage.getItem(key);
    if (object === null) return null;
    return JSON.parse(object);
  }
}

export default DataService;
