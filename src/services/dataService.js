import sortBy from 'lodash/sortBy';
import {
  Columns, RankingListsKey, PlayersKey, Positions, AggregatedListKey,
} from '../util/constants';

class DataService {
  constructor() {
    const storedLists = this._retrieveFromLocalStorage(RankingListsKey);
    const storedAggregatedList = this._retrieveFromLocalStorage(AggregatedListKey);
    const storedPlayers = this._retrieveFromLocalStorage(PlayersKey);

    this.lists = (storedLists === null ? [] : storedLists);
    this.aggregatedList = (storedAggregatedList === null ? {} : storedAggregatedList);
    this.players = (storedPlayers === null ? {} : storedPlayers);

    this.toggleDrafted = this.toggleDrafted.bind(this);
    this.addList = this.addList.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.renameList = this.renameList.bind(this);
    this.parseList = this.parseList.bind(this);
    this._buildAggregatedList = this._buildAggregatedList.bind(this);
    this._updatePlayersDict = this._updatePlayersDict.bind(this);
    this._updateLocalStorage = this._updateLocalStorage.bind(this);
    this._retrieveFromLocalStorage = this._retrieveFromLocalStorage.bind(this);
  }

  toggleDrafted(player) {
    if (this.players.hasOwnProperty(player)) {
      this.players[player].available = !this.players[player].available;
      this._updateLocalStorage(PlayersKey, this.players);
    }
  }

  addList(name, list) {
    const newName = name === '' ? `List ${this.lists.length + 1}` : name;
    this.lists.push({ name: newName, list });
    this._updateLocalStorage(RankingListsKey, this.lists);
    this._updatePlayersDict();
  }

  deleteList(index) {
    this.lists.splice(index, 1);
    this._updateLocalStorage(RankingListsKey, this.lists);
    this._updatePlayersDict();
  }

  renameList(index, name) {
    this.lists[index].name = name;
    this._updateLocalStorage(RankingListsKey, this.lists);
  }

  resetPlayers() {
    const playersToDelete = [];
    Object.keys(this.players).forEach((name) => {
      // reset player availability
      this.players[name].available = true;
      // if player isn't contained in any of the lists, safe to delete
      if (this.players[name].posCount < 1) {
        playersToDelete.push(name);
      }
    });
    playersToDelete.forEach((name) => {
      delete this.players[name];
    });
    this._updateLocalStorage(PlayersKey, this.players);
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

    // if missing required headers
    if (nameCol === -1 || posCol === -1) {
      const missingCols = [];
      if (nameCol === -1) missingCols.push(Columns.NAME);
      if (posCol === -1) missingCols.push(Columns.POSITION);
      onError(`Invalid file. Missing required column(s): ${missingCols}`);
      return null;
    }

    // parse each line
    const list = { positions: {}, rankings: { ALL: [] } };
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim().split(',');
      if (line.length > Math.max(nameCol, posCol, teamCol, byeCol)) {
        const position = line[posCol].replace(/[0-9]/g, '');
        const name = line[nameCol];
        const team = teamCol !== -1 ? line[teamCol] : 'n/a';
        const bye = byeCol !== -1 ? line[byeCol] : 'n/a';
        const entry = {
          rank: i,
          name,
          position,
          team,
          bye,
        };
        list.positions[position] = true;
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

    if (Object.keys(list.rankings).length === 2) {
      delete list.rankings.ALL;
    }

    return list;
  }

  _buildAggregatedList() {
    const newAggregatedList = {};

    Object.keys(this.players).forEach((name) => {
      const p = this.players[name];
      const player = {
        name,
        position: p.position,
        team: p.team,
        bye: p.bye,
        avgOverallRank: p.avgOverallRank,
        avgPosRank: p.avgPosRank,
        overallCount: p.overallCount,
        posCount: p.posCount,
      };
      if (player.posCount > 0) {
        if (!newAggregatedList.hasOwnProperty(player.position)) {
          newAggregatedList[player.position] = [];
        }
        newAggregatedList[player.position].push(player);
      }

      if (player.overallCount > 0) {
        if (!newAggregatedList.hasOwnProperty(Positions.ALL)) {
          newAggregatedList[Positions.ALL] = [];
        }
        newAggregatedList[Positions.ALL].push(player);
      }
    });

    Object.keys(newAggregatedList).forEach((position) => {
      const sortVar = (position === Positions.ALL ? 'avgOverallRank' : 'avgPosRank');
      newAggregatedList[position] = sortBy(newAggregatedList[position], [(player) => player[sortVar]]);
    });

    this.aggregatedList = newAggregatedList;
    this._updateLocalStorage(AggregatedListKey, this.aggregatedList);
  }

  _updatePlayersDict() {
    const updatedPlayers = {};
    this.lists.forEach((l) => {
      const { list } = l;
      // update avg pos rankings
      Object.keys(list.positions).forEach((position) => {
        list.rankings[position].forEach((player, index) => {
          if (!updatedPlayers.hasOwnProperty(player.name)) {
            const newPlayer = {
              available: true,
              position,
              team: player.team,
              bye: player.bye,
              avgOverallRank: 0,
              avgPosRank: 0,
              posCount: 0,
              overallCount: 0,
            };
            updatedPlayers[player.name] = newPlayer;
            // if player doesn't exist in compiled map, add them
            if (!this.players.hasOwnProperty(player.name)) {
              this.players[player.name] = newPlayer;
            }
          }
          const data = updatedPlayers[player.name];
          updatedPlayers[player.name].avgPosRank = (
            (data.avgPosRank * data.posCount) + (index + 1)) / (data.posCount + 1);
          updatedPlayers[player.name].posCount += 1;
        });
      });

      // update avg overall rankings
      if (Object.keys(list.positions).length > 1) {
        list.rankings[Positions.ALL].forEach((player, index) => {
          const data = updatedPlayers[player.name];
          updatedPlayers[player.name].avgOverallRank = (
            (data.avgOverallRank * data.overallCount) + (index + 1)) / (data.overallCount + 1);
          updatedPlayers[player.name].overallCount += 1;
        });
      }
    });

    // update player data
    Object.keys(this.players).forEach((name) => {
      if (updatedPlayers.hasOwnProperty(name)) {
        // update ranking statistics in our compiled player dict
        this.players[name].avgOverallRank = updatedPlayers[name].avgOverallRank;
        this.players[name].avgPosRank = updatedPlayers[name].avgPosRank;
        this.players[name].posCount = updatedPlayers[name].posCount;
        this.players[name].overallCount = updatedPlayers[name].overallCount;
      } else {
        // player doesn't appear on any of our lists due to a list deletion
        // preserve draft availability, but reset ranking statistics
        this.players[name].avgOverallRank = 0;
        this.players[name].avgPosRank = 0;
        this.players[name].posCount = 0;
        this.players[name].overallCount = 0;
      }
    });
    this._updateLocalStorage(PlayersKey, this.players);
    this._buildAggregatedList();
  }

  _updateLocalStorage(key, object) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(object));
    }
  }

  _retrieveFromLocalStorage(key) {
    let object = null;
    if (typeof window !== 'undefined') {
      object = localStorage.getItem(key);
    }
    if (object === null) return null;
    return JSON.parse(object);
  }
}

export default DataService;
