import sortBy from 'lodash/sortBy';
import {
  Columns, RankingListsKey, PlayersKey, Positions, AggregatedListKey, TeamAbbrevs,
} from '../util/constants';
import nameToUniqueId from '../util/nameToUniqueId';
import defenseToUniqueId from '../util/defenseToUniqueId';

class DataService {
  constructor() {
    this.lists = this._retrieveFromLocalStorage(RankingListsKey);
    this.aggregatedList = this._retrieveFromLocalStorage(AggregatedListKey);
    this.players = this._retrieveFromLocalStorage(PlayersKey);

    if (this.lists === null
      || this.aggregatedList === null
      || this.players === null
      || this.players.version !== 2) {
      this.lists = [];
      this.aggregatedList = {};
      this.players = { version: 2, data: {} };
    }

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

  toggleDrafted(playerId) {
    if (this.players.data.hasOwnProperty(playerId)) {
      this.players.data[playerId].available = !this.players.data[playerId].available;
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
    Object.keys(this.players.data).forEach((playerId) => {
      // reset player availability
      this.players.data[playerId].available = true;
      // if player isn't contained in any of the lists, safe to delete
      if (this.players.data[playerId].posCount < 1) {
        playersToDelete.push(playerId);
      }
    });
    playersToDelete.forEach((playerId) => {
      delete this.players.data[playerId];
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
      const header = headers[i].toLowerCase().replace(/[^a-z]/g, '');
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
    if (nameCol === -1 || posCol === -1 || teamCol === -1) {
      const missingCols = [];
      if (nameCol === -1) missingCols.push(Columns.NAME);
      if (posCol === -1) missingCols.push(Columns.POSITION);
      if (teamCol === -1) missingCols.push(Columns.TEAM);
      onError(`Invalid file. Missing required column(s): ${missingCols}`);
      return null;
    }

    // parse each line
    const list = { positions: {}, rankings: { ALL: [] } };
    for (let i = 1; i < lines.length; i++) {
      // split line into individual cells
      const line = lines[i].trim().split(',');
      if (line.length > Math.max(nameCol, posCol, teamCol, byeCol)) {
        // parse position
        const position = line[posCol].toUpperCase().replace(/[^A-Z]/g, '');
        if (!Positions.hasOwnProperty(position)) {
          onError(`File contains unrecognized position type: ${position}. Valid options are [RB, WR, TE, QB, K, DST].`);
          return null;
        }

        const name = line[nameCol];

        // parse team
        let team = line[teamCol].toUpperCase();
        if (!TeamAbbrevs.hasOwnProperty(team)) {
          // if position is a defense we can try to determine from the name
          if (position === Positions.DST) {
            team = defenseToUniqueId(name);
            if (team === null) {
              onError(`Can't recognize defensive team: ${name}`);
              return null;
            }
          }
          // TODO: if position isn't a defense we can try to see if another list has the information
        }

        const bye = byeCol === -1 ? '' : line[byeCol];

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

    Object.keys(this.players.data).forEach((playerId) => {
      const p = this.players.data[playerId];
      const player = {
        name: p.name,
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
      newAggregatedList[position] = sortBy(newAggregatedList[position], [
        (player) => player[sortVar],
      ]);
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
          let playerId;
          // if position is defense, use the team abbreviation as the id
          if (position === Positions.DST) {
            playerId = player.team;
          } else {
            playerId = nameToUniqueId(player.name);
          }

          if (!updatedPlayers.hasOwnProperty(playerId)) {
            const newPlayer = {
              name: player.name,
              available: true,
              position,
              team: player.team,
              bye: player.bye,
              avgOverallRank: 0,
              avgPosRank: 0,
              posCount: 0,
              overallCount: 0,
            };
            updatedPlayers[playerId] = newPlayer;
            // if player doesn't exist in compiled map, add them
            if (!this.players.data.hasOwnProperty(playerId)) {
              this.players.data[playerId] = newPlayer;
            }
          }

          // set player's name to be the longer of the two values
          if (this.players.data[playerId].name.length < player.name.length) {
            this.players.data[playerId].name = player.name;
          }

          // set the bye week if we didn't already know it
          if (this.players.data[playerId].bye === '' && player.bye !== '') {
            this.players.data[playerId].bye = player.bye;
          }

          const data = updatedPlayers[playerId];
          updatedPlayers[playerId].avgPosRank = (
            (data.avgPosRank * data.posCount) + (index + 1)) / (data.posCount + 1);
          updatedPlayers[playerId].posCount += 1;
        });
      });

      // update avg overall rankings
      if (Object.keys(list.positions).length > 1) {
        list.rankings[Positions.ALL].forEach((player, index) => {
          let playerId;
          // if position is defense, use the team abbreviation as the id
          if (player.position === Positions.DST) {
            playerId = player.team;
          } else {
            playerId = nameToUniqueId(player.name);
          }
          const data = updatedPlayers[playerId];
          updatedPlayers[playerId].avgOverallRank = (
            (data.avgOverallRank * data.overallCount) + (index + 1)) / (data.overallCount + 1);
          updatedPlayers[playerId].overallCount += 1;
        });
      }
    });

    // update player data
    Object.keys(this.players.data).forEach((playerId) => {
      if (updatedPlayers.hasOwnProperty(playerId)) {
        // update ranking statistics in our compiled player dict
        this.players.data[playerId].avgOverallRank = updatedPlayers[playerId].avgOverallRank;
        this.players.data[playerId].avgPosRank = updatedPlayers[playerId].avgPosRank;
        this.players.data[playerId].posCount = updatedPlayers[playerId].posCount;
        this.players.data[playerId].overallCount = updatedPlayers[playerId].overallCount;
      } else {
        // player doesn't appear on any of our lists due to a list deletion
        // preserve draft availability, but reset ranking statistics
        this.players.data[playerId].avgOverallRank = 0;
        this.players.data[playerId].avgPosRank = 0;
        this.players.data[playerId].posCount = 0;
        this.players.data[playerId].overallCount = 0;
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
