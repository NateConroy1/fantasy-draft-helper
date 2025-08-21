import { RankingListsKey, AggregatedListKey, PlayersKey } from '../../util/constants';

/**
 * Service for handling all localStorage operations
 */
class StorageService {
  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  /**
   * Check if localStorage is available
   */
  checkAvailability() {
    try {
      if (typeof window === 'undefined') return false;
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, test);
      window.localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Generic get method
   */
  get(key) {
    if (!this.isAvailable) return null;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error reading ${key} from localStorage:`, error);
      return null;
    }
  }

  /**
   * Generic set method
   */
  set(key, value) {
    if (!this.isAvailable) return false;
    
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error(`Error writing ${key} to localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove a specific key
   */
  remove(key) {
    if (!this.isAvailable) return false;
    
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all stored data
   */
  clear() {
    if (!this.isAvailable) return false;
    
    try {
      window.localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Specific methods for fantasy football data
  
  /**
   * Get all ranking lists
   */
  getRankingLists() {
    return this.get(RankingListsKey) || [];
  }

  /**
   * Save ranking lists
   */
  saveRankingLists(lists) {
    return this.set(RankingListsKey, lists);
  }

  /**
   * Get aggregated list
   */
  getAggregatedList() {
    return this.get(AggregatedListKey) || {};
  }

  /**
   * Save aggregated list
   */
  saveAggregatedList(list) {
    return this.set(AggregatedListKey, list);
  }

  /**
   * Get players data
   */
  getPlayers() {
    const players = this.get(PlayersKey);
    
    // Check for version and migrate if needed
    if (!players || players.version !== 2) {
      return { version: 2, data: {} };
    }
    
    return players;
  }

  /**
   * Save players data
   */
  savePlayers(players) {
    return this.set(PlayersKey, players);
  }

  /**
   * Get all data at once
   */
  getAllData() {
    return {
      lists: this.getRankingLists(),
      aggregatedList: this.getAggregatedList(),
      players: this.getPlayers(),
    };
  }

  /**
   * Save all data at once (useful for batch updates)
   */
  saveAllData({ lists, aggregatedList, players }) {
    const results = [];
    
    if (lists !== undefined) {
      results.push(this.saveRankingLists(lists));
    }
    
    if (aggregatedList !== undefined) {
      results.push(this.saveAggregatedList(aggregatedList));
    }
    
    if (players !== undefined) {
      results.push(this.savePlayers(players));
    }
    
    return results.every(result => result === true);
  }

  /**
   * Export all data as JSON (for backup)
   */
  exportData() {
    return JSON.stringify(this.getAllData(), null, 2);
  }

  /**
   * Import data from JSON
   */
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      return this.saveAllData(data);
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new StorageService();