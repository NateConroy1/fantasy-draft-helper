import storageService from './storage/storageService';
import playerService from './players/playerService';
import parseCSV from './parsers/csvParser';

/**
 * Main data service that coordinates between storage, players, and parsing
 * This is a refactored version that delegates to specialized services
 */
class DataService {
  constructor() {
    // Initialize data from storage
    this._initializeData();
    
    // Bind methods to maintain context
    this.toggleDrafted = this.toggleDrafted.bind(this);
    this.addList = this.addList.bind(this);
    this.deleteList = this.deleteList.bind(this);
    this.renameList = this.renameList.bind(this);
    this.parseList = this.parseList.bind(this);
    this.resetPlayers = this.resetPlayers.bind(this);
  }

  /**
   * Initialize data from storage or set defaults
   */
  _initializeData() {
    const storedData = storageService.getAllData();
    
    // Use stored data or defaults
    this.lists = storedData.lists || [];
    this.aggregatedList = storedData.aggregatedList || {};
    this.players = storedData.players || { version: 2, data: {} };
    
    // Ensure players data has correct version
    if (this.players.version !== 2) {
      this.players = { version: 2, data: {} };
      this.lists = [];
      this.aggregatedList = {};
      this._persistAll();
    }
  }

  /**
   * Parse a CSV list
   * @param {string} text - CSV text content
   * @param {function} onError - Error callback
   * @returns {object|null} Parsed list or null on error
   */
  parseList(text, onError) {
    return parseCSV(text, onError);
  }

  /**
   * Add a new ranking list
   * @param {string} name - List name
   * @param {object} list - Parsed list data
   */
  addList(name, list) {
    // Generate name if not provided
    const listName = name || `List ${this.lists.length + 1}`;
    
    // Add to lists
    this.lists.push({ name: listName, list });
    
    // Update all related data
    this._updateDataAfterListChange();
  }

  /**
   * Delete a ranking list
   * @param {number} index - List index to delete
   */
  deleteList(index) {
    if (index < 0 || index >= this.lists.length) {
      console.error(`Invalid list index: ${index}`);
      return;
    }
    
    // Remove list
    this.lists.splice(index, 1);
    
    // Update all related data
    this._updateDataAfterListChange();
  }

  /**
   * Rename a ranking list
   * @param {number} index - List index
   * @param {string} name - New name
   */
  renameList(index, name) {
    if (index < 0 || index >= this.lists.length) {
      console.error(`Invalid list index: ${index}`);
      return;
    }
    
    // Update name
    this.lists[index].name = name;
    
    // Only need to persist lists, no recalculation needed
    storageService.saveRankingLists(this.lists);
  }

  /**
   * Toggle a player's draft status
   * @param {string} playerId - Player ID
   */
  toggleDrafted(playerId) {
    // Update player draft status
    this.players.data = playerService.toggleDraftStatus(
      this.players.data,
      playerId
    );
    
    // Persist changes
    storageService.savePlayers(this.players);
  }

  /**
   * Reset all players to available
   */
  resetPlayers() {
    // Reset player availability
    this.players.data = playerService.resetAllPlayers(this.players.data);
    
    // Persist changes
    storageService.savePlayers(this.players);
  }

  /**
   * Update all data after lists change
   * This handles the complex recalculation of rankings and player data
   */
  _updateDataAfterListChange() {
    // Merge player info from all lists
    this._updatePlayersFromLists();
    
    // Update player rankings
    this.players.data = playerService.updatePlayerRankings(
      this.players.data,
      this.lists
    );
    
    // Build aggregated list
    this.aggregatedList = playerService.buildAggregatedList(this.players.data);
    
    // Persist all changes
    this._persistAll();
  }

  /**
   * Update player information from all lists
   * This ensures we have all players and their most complete information
   */
  _updatePlayersFromLists() {
    this.lists.forEach(({ list }) => {
      this.players.data = playerService.mergePlayerInfo(
        this.players.data,
        list
      );
    });
  }

  /**
   * Persist all data to storage
   */
  _persistAll() {
    storageService.saveAllData({
      lists: this.lists,
      aggregatedList: this.aggregatedList,
      players: this.players,
    });
  }

  /**
   * Export all data as JSON (for backup/debugging)
   * @returns {string} JSON string of all data
   */
  exportData() {
    return storageService.exportData();
  }

  /**
   * Import data from JSON
   * @param {string} jsonString - JSON data to import
   * @returns {boolean} Success status
   */
  importData(jsonString) {
    try {
      const success = storageService.importData(jsonString);
      if (success) {
        this._initializeData();
      }
      return success;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  /**
   * Get statistics about current data
   * @returns {object} Data statistics
   */
  getStats() {
    const totalPlayers = Object.keys(this.players.data).length;
    const draftedPlayers = Object.values(this.players.data)
      .filter(p => !p.available).length;
    const availablePlayers = totalPlayers - draftedPlayers;
    
    return {
      lists: this.lists.length,
      totalPlayers,
      draftedPlayers,
      availablePlayers,
      positions: Object.keys(this.aggregatedList).length,
    };
  }

  /**
   * Clear all data (for testing or reset)
   */
  clearAllData() {
    this.lists = [];
    this.aggregatedList = {};
    this.players = { version: 2, data: {} };
    this._persistAll();
  }
}

export default DataService;