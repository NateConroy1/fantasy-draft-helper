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
    // remove all quotes and split by line
    const lines = text.replace(/"/g, '').split('\n');
    // get list of headers
    const headers = lines[0].trim().split(',');

    const recognizedCols = Object.keys(Columns);
    const colIndices = {};

    // set all column indices
    for (let i = 0; i < headers.length; i++) {
      const header = headers[i].toLowerCase().replace(/[^a-z]/g, '');
      let found = false;
      for (let j = 0; j < recognizedCols.length; j++) {
        const supportedMatches = Columns[recognizedCols[j]];
        for (let k = 0; k < supportedMatches.length; k++) {
          if (header === supportedMatches[k]) {
            colIndices[supportedMatches[0]] = i;
            found = true;
            break;
          }
        }
        if (found) {
          break;
        }
      }
    }

    // check for missing required cols, throw error and return null if found
    const missingRequiredCols = [];
    if (!colIndices.hasOwnProperty(Columns.name[0])) missingRequiredCols.push(Columns.name[0]);
    if (!colIndices.hasOwnProperty(Columns.position[0])) missingRequiredCols.push(Columns.position[0]);
    if (!colIndices.hasOwnProperty(Columns.team[0])) missingRequiredCols.push(Columns.team[0]);
    if (missingRequiredCols.length > 0) {
      onError(`Invalid file. Missing required column(s): ${missingRequiredCols}`);
      return null;
    }

    // parse data line by line
    const list = { positions: {}, rankings: { ALL: [] } };
    for (let i = 1; i < lines.length; i++) {
      // split line into individual cells
      const line = lines[i].trim().split(',');
      // make sure line has all cells
      if (line.length === headers.length) {
        // parse position
        const posIdx = colIndices[Columns.position[0]];
        const position = line[posIdx].toUpperCase().replace(/[^A-Z]/g, '');
        if (!Positions.hasOwnProperty(position)) {
          onError(`File contains unrecognized position type: ${position}. Valid options are [RB, WR, TE, QB, K, DST].`);
          return null;
        }

        // parse name
        const nameIdx = colIndices[Columns.name[0]];
        const name = line[nameIdx];

        // parse team
        const teamIdx = colIndices[Columns.team[0]];
        let team = line[teamIdx].toUpperCase();
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

        // parse bye week
        let bye = '';
        if (colIndices.hasOwnProperty(Columns.bye[0])) {
          const byeIdx = colIndices[Columns.bye[0]];
          bye = line[byeIdx].replace(/[^0-9]/g, '');
        }

        const entry = {
          rank: i,
          name,
          position,
          team,
          bye,
        };

        // parse and set the tier if given
        if (colIndices.hasOwnProperty(Columns.tier[0])) {
          const tierIdx = colIndices[Columns.tier[0]];
          const tier = line[tierIdx].replace(/[^0-9]/g, '');
          if (tier.length > 0) {
            entry.tier = parseInt(tier, 10);
          }
        }

        // set the value if given
        if (colIndices.hasOwnProperty(Columns.value[0])) {
          const valIdx = colIndices[Columns.value[0]];
          entry.value = line[valIdx];
        }

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
