import sortBy from 'lodash/sortBy';
import { Positions } from '../../util/constants';
import nameToUniqueId from '../../util/nameToUniqueId';

/**
 * Service for managing player data and operations
 */
class PlayerService {
  /**
   * Get player ID based on position and name
   */
  getPlayerId(player) {
    // Defenses use team abbreviation as ID
    if (player.position === Positions.DST) {
      return player.team;
    }
    // Other positions use normalized name
    return nameToUniqueId(player.name);
  }

  /**
   * Create a new player object
   */
  createPlayer(playerData) {
    return {
      name: playerData.name || '',
      available: true,
      position: playerData.position || '',
      team: playerData.team || '',
      bye: playerData.bye || '',
      avgOverallRank: 0,
      avgPosRank: 0,
      posCount: 0,
      overallCount: 0,
      ...playerData, // Allow overrides
    };
  }

  /**
   * Update player rankings based on lists
   */
  updatePlayerRankings(players, lists) {
    const updatedPlayers = {};

    // Process each list
    lists.forEach(({ list }) => {
      // Update position rankings
      Object.keys(list.positions).forEach((position) => {
        list.rankings[position].forEach((player, index) => {
          const playerId = this.getPlayerId(player);
          
          if (!updatedPlayers[playerId]) {
            updatedPlayers[playerId] = this.createRankingData();
          }

          const data = updatedPlayers[playerId];
          data.avgPosRank = this.calculateNewAverage(
            data.avgPosRank,
            data.posCount,
            index + 1
          );
          data.posCount += 1;
        });
      });

      // Update overall rankings (only for multi-position lists)
      if (Object.keys(list.positions).length > 1) {
        list.rankings[Positions.ALL]?.forEach((player, index) => {
          const playerId = this.getPlayerId(player);
          
          if (!updatedPlayers[playerId]) {
            updatedPlayers[playerId] = this.createRankingData();
          }

          const data = updatedPlayers[playerId];
          data.avgOverallRank = this.calculateNewAverage(
            data.avgOverallRank,
            data.overallCount,
            index + 1
          );
          data.overallCount += 1;
        });
      }
    });

    return this.mergePlayerUpdates(players, updatedPlayers);
  }

  /**
   * Create empty ranking data
   */
  createRankingData() {
    return {
      avgOverallRank: 0,
      avgPosRank: 0,
      posCount: 0,
      overallCount: 0,
    };
  }

  /**
   * Calculate new average
   */
  calculateNewAverage(currentAvg, currentCount, newValue) {
    return ((currentAvg * currentCount) + newValue) / (currentCount + 1);
  }

  /**
   * Merge updated rankings into existing player data
   */
  mergePlayerUpdates(players, updatedPlayers) {
    const merged = { ...players };

    // Update existing players
    Object.keys(merged).forEach((playerId) => {
      if (updatedPlayers[playerId]) {
        merged[playerId] = {
          ...merged[playerId],
          ...updatedPlayers[playerId],
        };
      } else {
        // Player no longer in any lists - reset rankings but preserve draft status
        merged[playerId] = {
          ...merged[playerId],
          avgOverallRank: 0,
          avgPosRank: 0,
          posCount: 0,
          overallCount: 0,
        };
      }
    });

    return merged;
  }

  /**
   * Build aggregated list from player data
   */
  buildAggregatedList(players) {
    const aggregated = {};

    Object.entries(players).forEach(([playerId, player]) => {
      // Add to position list if player appears in any position rankings
      if (player.posCount > 0) {
        if (!aggregated[player.position]) {
          aggregated[player.position] = [];
        }
        aggregated[player.position].push({
          name: player.name,
          position: player.position,
          team: player.team,
          bye: player.bye,
          avgOverallRank: player.avgOverallRank,
          avgPosRank: player.avgPosRank,
          overallCount: player.overallCount,
          posCount: player.posCount,
        });
      }

      // Add to overall list if player appears in any overall rankings
      if (player.overallCount > 0) {
        if (!aggregated[Positions.ALL]) {
          aggregated[Positions.ALL] = [];
        }
        aggregated[Positions.ALL].push({
          name: player.name,
          position: player.position,
          team: player.team,
          bye: player.bye,
          avgOverallRank: player.avgOverallRank,
          avgPosRank: player.avgPosRank,
          overallCount: player.overallCount,
          posCount: player.posCount,
        });
      }
    });

    // Sort each position by average rank
    Object.keys(aggregated).forEach((position) => {
      const sortField = position === Positions.ALL ? 'avgOverallRank' : 'avgPosRank';
      aggregated[position] = sortBy(aggregated[position], [sortField]);
    });

    return aggregated;
  }

  /**
   * Toggle player draft status
   */
  toggleDraftStatus(players, playerId) {
    if (!players[playerId]) {
      console.warn(`Player ${playerId} not found`);
      return players;
    }

    return {
      ...players,
      [playerId]: {
        ...players[playerId],
        available: !players[playerId].available,
      },
    };
  }

  /**
   * Reset all players to available
   */
  resetAllPlayers(players) {
    const reset = {};
    
    Object.entries(players).forEach(([playerId, player]) => {
      // Only keep players that appear in at least one list
      if (player.posCount > 0) {
        reset[playerId] = {
          ...player,
          available: true,
        };
      }
    });

    return reset;
  }

  /**
   * Merge player info from new list
   */
  mergePlayerInfo(existingPlayers, newList) {
    const merged = { ...existingPlayers };

    // Process all positions in the new list
    Object.keys(newList.rankings).forEach((position) => {
      newList.rankings[position].forEach((player) => {
        const playerId = this.getPlayerId(player);

        if (!merged[playerId]) {
          merged[playerId] = this.createPlayer(player);
        } else {
          // Update with longer name if found
          if (player.name.length > merged[playerId].name.length) {
            merged[playerId].name = player.name;
          }
          
          // Update bye week if we didn't have it
          if (!merged[playerId].bye && player.bye) {
            merged[playerId].bye = player.bye;
          }
        }
      });
    });

    return merged;
  }
}

// Export singleton instance
export default new PlayerService();