import storageService from '../storage/storageService';
import { RankingListsKey, AggregatedListKey, PlayersKey } from '../../util/constants';

describe('StorageService', () => {
  let mockLocalStorage;

  beforeEach(() => {
    // Create mock localStorage
    mockLocalStorage = {
      store: {},
      getItem: jest.fn((key) => mockLocalStorage.store[key] || null),
      setItem: jest.fn((key, value) => {
        mockLocalStorage.store[key] = value;
      }),
      removeItem: jest.fn((key) => {
        delete mockLocalStorage.store[key];
      }),
      clear: jest.fn(() => {
        mockLocalStorage.store = {};
      }),
    };

    // Replace window.localStorage with mock
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true,
    });

    // Reset the service state
    storageService.isAvailable = true;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkAvailability', () => {
    it('should return true when localStorage is available', () => {
      expect(storageService.isAvailable).toBe(true);
    });

    it('should return false when localStorage throws error', () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage disabled');
      });
      
      const available = storageService.checkAvailability();
      expect(available).toBe(false);
    });

    it('should return false when window is undefined', () => {
      const originalWindow = global.window;
      delete global.window;
      
      const available = storageService.checkAvailability();
      expect(available).toBe(false);
      
      global.window = originalWindow;
    });
  });

  describe('get', () => {
    it('should retrieve and parse JSON data', () => {
      const testData = { test: 'data', nested: { value: 123 } };
      mockLocalStorage.store['testKey'] = JSON.stringify(testData);

      const result = storageService.get('testKey');
      
      expect(result).toEqual(testData);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should return null for non-existent keys', () => {
      const result = storageService.get('nonExistent');
      
      expect(result).toBeNull();
    });

    it('should handle invalid JSON gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.store['badJson'] = 'not valid json{';

      const result = storageService.get('badJson');
      
      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return null when localStorage is unavailable', () => {
      storageService.isAvailable = false;
      
      const result = storageService.get('anyKey');
      
      expect(result).toBeNull();
      expect(mockLocalStorage.getItem).not.toHaveBeenCalled();
    });
  });

  describe('set', () => {
    it('should stringify and store data', () => {
      const testData = { test: 'data', array: [1, 2, 3] };

      const result = storageService.set('testKey', testData);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify(testData)
      );
      expect(mockLocalStorage.store['testKey']).toBe(JSON.stringify(testData));
    });

    it('should handle storage errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Quota exceeded');
      });

      const result = storageService.set('testKey', { data: 'test' });
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return false when localStorage is unavailable', () => {
      storageService.isAvailable = false;
      
      const result = storageService.set('testKey', {});
      
      expect(result).toBe(false);
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove items from localStorage', () => {
      mockLocalStorage.store['testKey'] = 'value';

      const result = storageService.remove('testKey');
      
      expect(result).toBe(true);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('testKey');
      expect(mockLocalStorage.store['testKey']).toBeUndefined();
    });

    it('should handle removal errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.removeItem.mockImplementation(() => {
        throw new Error('Remove failed');
      });

      const result = storageService.remove('testKey');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should return false when localStorage is unavailable', () => {
      storageService.isAvailable = false;
      
      const result = storageService.remove('testKey');
      
      expect(result).toBe(false);
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('clear', () => {
    it('should clear all localStorage', () => {
      mockLocalStorage.store = { key1: 'value1', key2: 'value2' };

      const result = storageService.clear();
      
      expect(result).toBe(true);
      expect(mockLocalStorage.clear).toHaveBeenCalled();
      expect(mockLocalStorage.store).toEqual({});
    });

    it('should handle clear errors gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockLocalStorage.clear.mockImplementation(() => {
        throw new Error('Clear failed');
      });

      const result = storageService.clear();
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getRankingLists', () => {
    it('should retrieve ranking lists', () => {
      const lists = [{ name: 'List 1' }, { name: 'List 2' }];
      mockLocalStorage.store[RankingListsKey] = JSON.stringify(lists);

      const result = storageService.getRankingLists();
      
      expect(result).toEqual(lists);
    });

    it('should return empty array when no lists exist', () => {
      const result = storageService.getRankingLists();
      
      expect(result).toEqual([]);
    });
  });

  describe('saveRankingLists', () => {
    it('should save ranking lists', () => {
      const lists = [{ name: 'List 1' }];

      const result = storageService.saveRankingLists(lists);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[RankingListsKey]).toBe(JSON.stringify(lists));
    });
  });

  describe('getAggregatedList', () => {
    it('should retrieve aggregated list', () => {
      const aggregated = { ALL: [], RB: [] };
      mockLocalStorage.store[AggregatedListKey] = JSON.stringify(aggregated);

      const result = storageService.getAggregatedList();
      
      expect(result).toEqual(aggregated);
    });

    it('should return empty object when no aggregated list exists', () => {
      const result = storageService.getAggregatedList();
      
      expect(result).toEqual({});
    });
  });

  describe('saveAggregatedList', () => {
    it('should save aggregated list', () => {
      const aggregated = { ALL: [{ name: 'Player1' }] };

      const result = storageService.saveAggregatedList(aggregated);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[AggregatedListKey]).toBe(JSON.stringify(aggregated));
    });
  });

  describe('getPlayers', () => {
    it('should retrieve players with correct version', () => {
      const players = { version: 2, data: { player1: {} } };
      mockLocalStorage.store[PlayersKey] = JSON.stringify(players);

      const result = storageService.getPlayers();
      
      expect(result).toEqual(players);
    });

    it('should return default when version mismatch', () => {
      const oldPlayers = { version: 1, data: { player1: {} } };
      mockLocalStorage.store[PlayersKey] = JSON.stringify(oldPlayers);

      const result = storageService.getPlayers();
      
      expect(result).toEqual({ version: 2, data: {} });
    });

    it('should return default when no players exist', () => {
      const result = storageService.getPlayers();
      
      expect(result).toEqual({ version: 2, data: {} });
    });
  });

  describe('savePlayers', () => {
    it('should save players data', () => {
      const players = { version: 2, data: { player1: { name: 'Test' } } };

      const result = storageService.savePlayers(players);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[PlayersKey]).toBe(JSON.stringify(players));
    });
  });

  describe('getAllData', () => {
    it('should retrieve all data at once', () => {
      const lists = [{ name: 'List 1' }];
      const aggregated = { ALL: [] };
      const players = { version: 2, data: {} };

      mockLocalStorage.store[RankingListsKey] = JSON.stringify(lists);
      mockLocalStorage.store[AggregatedListKey] = JSON.stringify(aggregated);
      mockLocalStorage.store[PlayersKey] = JSON.stringify(players);

      const result = storageService.getAllData();
      
      expect(result).toEqual({
        lists,
        aggregatedList: aggregated,
        players,
      });
    });

    it('should return defaults when no data exists', () => {
      const result = storageService.getAllData();
      
      expect(result).toEqual({
        lists: [],
        aggregatedList: {},
        players: { version: 2, data: {} },
      });
    });
  });

  describe('saveAllData', () => {
    it('should save all data at once', () => {
      const data = {
        lists: [{ name: 'List 1' }],
        aggregatedList: { ALL: [] },
        players: { version: 2, data: {} },
      };

      const result = storageService.saveAllData(data);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[RankingListsKey]).toBe(JSON.stringify(data.lists));
      expect(mockLocalStorage.store[AggregatedListKey]).toBe(JSON.stringify(data.aggregatedList));
      expect(mockLocalStorage.store[PlayersKey]).toBe(JSON.stringify(data.players));
    });

    it('should save only provided data', () => {
      const data = {
        lists: [{ name: 'List 1' }],
        // aggregatedList not provided
        // players not provided
      };

      const result = storageService.saveAllData(data);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(1);
      expect(mockLocalStorage.store[RankingListsKey]).toBe(JSON.stringify(data.lists));
    });

    it('should return false if any save fails', () => {
      mockLocalStorage.setItem.mockImplementationOnce(() => {})
        .mockImplementationOnce(() => {
          throw new Error('Failed');
        });

      const data = {
        lists: [{ name: 'List 1' }],
        players: { version: 2, data: {} },
      };

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const result = storageService.saveAllData(data);
      
      expect(result).toBe(false);
      consoleSpy.mockRestore();
    });
  });

  describe('exportData', () => {
    it('should export all data as formatted JSON', () => {
      const data = {
        lists: [{ name: 'List 1' }],
        aggregatedList: { ALL: [] },
        players: { version: 2, data: {} },
      };

      mockLocalStorage.store[RankingListsKey] = JSON.stringify(data.lists);
      mockLocalStorage.store[AggregatedListKey] = JSON.stringify(data.aggregatedList);
      mockLocalStorage.store[PlayersKey] = JSON.stringify(data.players);

      const result = storageService.exportData();
      const parsed = JSON.parse(result);
      
      expect(parsed).toEqual(data);
      expect(result).toContain('\n'); // Should be formatted
    });
  });

  describe('importData', () => {
    it('should import valid JSON data', () => {
      const data = {
        lists: [{ name: 'Imported List' }],
        aggregatedList: { ALL: [] },
        players: { version: 2, data: { player1: {} } },
      };

      const jsonString = JSON.stringify(data);
      const result = storageService.importData(jsonString);
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[RankingListsKey]).toBe(JSON.stringify(data.lists));
      expect(mockLocalStorage.store[AggregatedListKey]).toBe(JSON.stringify(data.aggregatedList));
      expect(mockLocalStorage.store[PlayersKey]).toBe(JSON.stringify(data.players));
    });

    it('should handle invalid JSON', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const result = storageService.importData('not valid json');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });

    it('should handle import with missing fields', () => {
      const data = {
        lists: [{ name: 'Partial Import' }],
        // Missing other fields
      };

      const result = storageService.importData(JSON.stringify(data));
      
      expect(result).toBe(true);
      expect(mockLocalStorage.store[RankingListsKey]).toBe(JSON.stringify(data.lists));
    });
  });
});