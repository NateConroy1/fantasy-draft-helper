import DataService from '../dataService';
import storageService from '../storage/storageService';
import playerService from '../players/playerService';
import parseCSV from '../parsers/csvParser';

// Mock the dependencies
jest.mock('../storage/storageService');
jest.mock('../players/playerService');
jest.mock('../parsers/csvParser');

describe('DataService', () => {
  let dataService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Setup default mock returns
    storageService.getAllData.mockReturnValue({
      lists: [],
      aggregatedList: {},
      players: { version: 2, data: {} },
    });
    
    storageService.saveAllData.mockReturnValue(true);
    storageService.saveRankingLists.mockReturnValue(true);
    storageService.savePlayers.mockReturnValue(true);
    
    playerService.updatePlayerRankings.mockImplementation((players) => players);
    playerService.buildAggregatedList.mockReturnValue({});
    playerService.mergePlayerInfo.mockImplementation((players) => players);
    playerService.toggleDraftStatus.mockImplementation((players) => players);
    playerService.resetAllPlayers.mockImplementation((players) => players);
    
    // Create new instance for each test
    dataService = new DataService();
  });

  describe('initialization', () => {
    it('should initialize with stored data', () => {
      const mockData = {
        lists: [{ name: 'Test List', list: {} }],
        aggregatedList: { ALL: [] },
        players: { version: 2, data: { player1: {} } },
      };
      
      storageService.getAllData.mockReturnValue(mockData);
      dataService = new DataService();
      
      expect(dataService.lists).toEqual(mockData.lists);
      expect(dataService.aggregatedList).toEqual(mockData.aggregatedList);
      expect(dataService.players).toEqual(mockData.players);
    });

    it('should reset data if version mismatch', () => {
      const oldVersionData = {
        lists: [{ name: 'Old List', list: {} }],
        aggregatedList: { ALL: [] },
        players: { version: 1, data: {} }, // Old version
      };
      
      storageService.getAllData.mockReturnValue(oldVersionData);
      dataService = new DataService();
      
      expect(dataService.lists).toEqual([]);
      expect(dataService.aggregatedList).toEqual({});
      expect(dataService.players.version).toBe(2);
      expect(storageService.saveAllData).toHaveBeenCalled();
    });

    it('should handle no stored data', () => {
      storageService.getAllData.mockReturnValue({});
      dataService = new DataService();
      
      expect(dataService.lists).toEqual([]);
      expect(dataService.aggregatedList).toEqual({});
      expect(dataService.players).toEqual({ version: 2, data: {} });
    });
  });

  describe('parseList', () => {
    it('should delegate to parseCSV', () => {
      const csvText = 'name,position,team\nPlayer1,RB,DAL';
      const mockError = jest.fn();
      const expectedResult = { positions: { RB: true }, rankings: {} };
      
      parseCSV.mockReturnValue(expectedResult);
      
      const result = dataService.parseList(csvText, mockError);
      
      expect(parseCSV).toHaveBeenCalledWith(csvText, mockError);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('addList', () => {
    it('should add list with provided name', () => {
      const list = { positions: { RB: true }, rankings: { RB: [] } };
      
      dataService.addList('My Rankings', list);
      
      expect(dataService.lists).toHaveLength(1);
      expect(dataService.lists[0].name).toBe('My Rankings');
      expect(dataService.lists[0].list).toEqual(list);
    });

    it('should generate name if not provided', () => {
      const list = { positions: { RB: true }, rankings: { RB: [] } };
      
      dataService.addList('', list);
      
      expect(dataService.lists[0].name).toBe('List 1');
    });

    it('should update all related data after adding', () => {
      const list = { positions: { RB: true }, rankings: { RB: [] } };
      
      dataService.addList('Test', list);
      
      expect(playerService.mergePlayerInfo).toHaveBeenCalled();
      expect(playerService.updatePlayerRankings).toHaveBeenCalled();
      expect(playerService.buildAggregatedList).toHaveBeenCalled();
      expect(storageService.saveAllData).toHaveBeenCalled();
    });
  });

  describe('deleteList', () => {
    beforeEach(() => {
      dataService.lists = [
        { name: 'List 1', list: {} },
        { name: 'List 2', list: {} },
        { name: 'List 3', list: {} },
      ];
    });

    it('should delete list at index', () => {
      dataService.deleteList(1);
      
      expect(dataService.lists).toHaveLength(2);
      expect(dataService.lists[0].name).toBe('List 1');
      expect(dataService.lists[1].name).toBe('List 3');
    });

    it('should handle invalid index', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      dataService.deleteList(-1);
      expect(dataService.lists).toHaveLength(3);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid list index: -1');
      
      dataService.deleteList(5);
      expect(dataService.lists).toHaveLength(3);
      expect(consoleSpy).toHaveBeenCalledWith('Invalid list index: 5');
      
      consoleSpy.mockRestore();
    });

    it('should update all related data after deleting', () => {
      dataService.deleteList(0);
      
      expect(playerService.updatePlayerRankings).toHaveBeenCalled();
      expect(playerService.buildAggregatedList).toHaveBeenCalled();
      expect(storageService.saveAllData).toHaveBeenCalled();
    });
  });

  describe('renameList', () => {
    beforeEach(() => {
      dataService.lists = [
        { name: 'Old Name', list: {} },
      ];
    });

    it('should rename list at index', () => {
      dataService.renameList(0, 'New Name');
      
      expect(dataService.lists[0].name).toBe('New Name');
      expect(storageService.saveRankingLists).toHaveBeenCalledWith(dataService.lists);
    });

    it('should handle invalid index', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      
      dataService.renameList(-1, 'New Name');
      expect(consoleSpy).toHaveBeenCalledWith('Invalid list index: -1');
      
      consoleSpy.mockRestore();
    });
  });

  describe('toggleDrafted', () => {
    it('should toggle player draft status', () => {
      const playerId = 'player1';
      const mockPlayers = { player1: { available: true } };
      
      playerService.toggleDraftStatus.mockReturnValue({
        player1: { available: false },
      });
      
      dataService.players.data = mockPlayers;
      dataService.toggleDrafted(playerId);
      
      expect(playerService.toggleDraftStatus).toHaveBeenCalledWith(
        mockPlayers,
        playerId
      );
      expect(storageService.savePlayers).toHaveBeenCalledWith(dataService.players);
    });
  });

  describe('resetPlayers', () => {
    it('should reset all players to available', () => {
      const mockPlayers = {
        player1: { available: false },
        player2: { available: false },
      };
      
      const resetPlayers = {
        player1: { available: true },
        player2: { available: true },
      };
      
      playerService.resetAllPlayers.mockReturnValue(resetPlayers);
      
      dataService.players.data = mockPlayers;
      dataService.resetPlayers();
      
      expect(playerService.resetAllPlayers).toHaveBeenCalledWith(mockPlayers);
      expect(dataService.players.data).toEqual(resetPlayers);
      expect(storageService.savePlayers).toHaveBeenCalled();
    });
  });

  describe('exportData', () => {
    it('should delegate to storage service', () => {
      const mockExport = '{"lists":[],"players":{}}';
      storageService.exportData.mockReturnValue(mockExport);
      
      const result = dataService.exportData();
      
      expect(storageService.exportData).toHaveBeenCalled();
      expect(result).toBe(mockExport);
    });
  });

  describe('importData', () => {
    it('should import valid JSON data', () => {
      const jsonData = '{"lists":[],"players":{}}';
      storageService.importData.mockReturnValue(true);
      
      const result = dataService.importData(jsonData);
      
      expect(storageService.importData).toHaveBeenCalledWith(jsonData);
      expect(result).toBe(true);
    });

    it('should handle import errors', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      storageService.importData.mockImplementation(() => {
        throw new Error('Invalid JSON');
      });
      
      const result = dataService.importData('invalid');
      
      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();
      
      consoleSpy.mockRestore();
    });
  });

  describe('getStats', () => {
    it('should return correct statistics', () => {
      dataService.lists = [{ name: 'List1' }, { name: 'List2' }];
      dataService.players.data = {
        player1: { available: true },
        player2: { available: false },
        player3: { available: true },
        player4: { available: false },
      };
      dataService.aggregatedList = {
        ALL: [],
        RB: [],
        WR: [],
      };
      
      const stats = dataService.getStats();
      
      expect(stats).toEqual({
        lists: 2,
        totalPlayers: 4,
        draftedPlayers: 2,
        availablePlayers: 2,
        positions: 3,
      });
    });
  });

  describe('clearAllData', () => {
    it('should reset all data', () => {
      dataService.lists = [{ name: 'List1' }];
      dataService.players.data = { player1: {} };
      dataService.aggregatedList = { ALL: [] };
      
      dataService.clearAllData();
      
      expect(dataService.lists).toEqual([]);
      expect(dataService.players.data).toEqual({});
      expect(dataService.aggregatedList).toEqual({});
      expect(storageService.saveAllData).toHaveBeenCalled();
    });
  });
});