import { parseCSV } from '../parsers/csvParser';
import { Positions } from '../../util/constants';

describe('csvParser', () => {
  let mockErrorCallback;

  beforeEach(() => {
    mockErrorCallback = jest.fn();
  });

  describe('parseCSV', () => {
    describe('valid CSV parsing', () => {
      it('should parse a basic CSV with required columns', () => {
        const csv = `name,position,team
Patrick Mahomes,QB,KC
Christian McCaffrey,RB,SF
Justin Jefferson,WR,MIN`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeTruthy();
        expect(result.positions).toEqual({
          QB: true,
          RB: true,
          WR: true,
        });
        expect(result.rankings.ALL).toHaveLength(3);
        expect(result.rankings.QB).toHaveLength(1);
        expect(result.rankings.RB).toHaveLength(1);
        expect(result.rankings.WR).toHaveLength(1);
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should parse CSV with all optional columns', () => {
        const csv = `name,position,team,bye,tier,value
Patrick Mahomes,QB,KC,10,1,$45
Christian McCaffrey,RB,SF,9,1,$65`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.ALL[0]).toMatchObject({
          name: 'Patrick Mahomes',
          position: 'QB',
          team: 'KC',
          bye: '10',
          tier: 1,
          value: '$45',
          rank: 0,
        });
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should handle alternative column headers', () => {
        const csv = `player,pos,team,bye week
Travis Kelce,TE,KC,10`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeTruthy();
        expect(result.rankings.TE[0].name).toBe('Travis Kelce');
        expect(result.rankings.TE[0].bye).toBe('10');
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should parse defense/special teams correctly', () => {
        const csv = `name,position,team
Buffalo Bills,DST,BUF
San Francisco 49ers,DST,SF`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.DST).toHaveLength(2);
        expect(result.rankings.DST[0].team).toBe('BUF');
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should handle defenses with unrecognized team abbreviations', () => {
        const csv = `name,position,team
Buffalo Bills,DST,BUFF
Kansas City Chiefs,DST,KANSAS`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.DST).toHaveLength(2);
        expect(result.rankings.DST[0].team).toBe('BUF');
        expect(result.rankings.DST[1].team).toBe('KC');
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should handle single position lists correctly', () => {
        const csv = `name,position,team
Christian McCaffrey,RB,SF
Austin Ekeler,RB,LAC
Nick Chubb,RB,CLE`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.ALL).toBeUndefined();
        expect(result.rankings.RB).toHaveLength(3);
        expect(Object.keys(result.rankings)).toHaveLength(1);
      });

      it('should handle mixed case and extra spaces', () => {
        const csv = `NAME, Position ,TEAM
Patrick Mahomes , qb , kc
CHRISTIAN MCCAFFREY,Rb,sf`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.QB).toHaveLength(1);
        expect(result.rankings.RB).toHaveLength(1);
        expect(result.rankings.QB[0].team).toBe('KC');
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should skip incomplete rows', () => {
        const csv = `name,position,team,bye
Patrick Mahomes,QB,KC,10
Incomplete Row
Christian McCaffrey,RB,SF,9`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.ALL).toHaveLength(2);
        expect(mockErrorCallback).not.toHaveBeenCalled();
      });

      it('should handle empty bye weeks and tiers', () => {
        const csv = `name,position,team,bye,tier
Patrick Mahomes,QB,KC,,
Christian McCaffrey,RB,SF,9,1`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.QB[0].bye).toBe('');
        expect(result.rankings.QB[0].tier).toBeUndefined();
        expect(result.rankings.RB[0].bye).toBe('9');
        expect(result.rankings.RB[0].tier).toBe(1);
      });

      it('should strip non-numeric characters from bye week', () => {
        const csv = `name,position,team,bye
Patrick Mahomes,QB,KC,Week 10
Christian McCaffrey,RB,SF,BYE: 9`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.QB[0].bye).toBe('10');
        expect(result.rankings.RB[0].bye).toBe('9');
      });

      it('should preserve value field as-is', () => {
        const csv = `name,position,team,value
Patrick Mahomes,QB,KC,$45.50
Christian McCaffrey,RB,SF,65 pts`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.QB[0].value).toBe('$45.50');
        expect(result.rankings.RB[0].value).toBe('65 pts');
      });
    });

    describe('error handling', () => {
      it('should error on missing name column', () => {
        const csv = `player_name,position,team
Patrick Mahomes,QB,KC`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith(
          'Invalid file. Missing required column(s): name'
        );
      });

      it('should error on missing position column', () => {
        const csv = `name,pos_type,team
Patrick Mahomes,QB,KC`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith(
          'Invalid file. Missing required column(s): position'
        );
      });

      it('should error on missing team column', () => {
        const csv = `name,position,squad
Patrick Mahomes,QB,KC`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith(
          'Invalid file. Missing required column(s): team'
        );
      });

      it('should error on missing multiple required columns', () => {
        const csv = `player,pos,squad
Patrick Mahomes,QB,KC`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith(
          'Invalid file. Missing required column(s): name, position, team'
        );
      });

      it('should error on invalid position type', () => {
        const csv = `name,position,team
Patrick Mahomes,QUARTERBACK,KC
Invalid Player,XYZ,DAL`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(mockErrorCallback).toHaveBeenCalledWith(
          'File contains unrecognized position type: QUARTERBACK. Valid options are [RB, WR, TE, QB, K, DST].'
        );
        expect(mockErrorCallback).toHaveBeenCalledWith(
          'File contains unrecognized position type: XYZ. Valid options are [RB, WR, TE, QB, K, DST].'
        );
      });

      it('should error on unrecognized defense team', () => {
        const csv = `name,position,team
Unknown Team,DST,UNK`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(mockErrorCallback).toHaveBeenCalledWith(
          "Can't recognize defensive team: Unknown Team"
        );
      });

      it('should error on empty list', () => {
        const csv = `name,position,team`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith('List is empty');
      });

      it('should handle empty CSV', () => {
        const csv = '';

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalled();
      });

      it('should handle CSV with only headers', () => {
        const csv = `name,position,team
`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result).toBeNull();
        expect(mockErrorCallback).toHaveBeenCalledWith('List is empty');
      });
    });

    describe('edge cases', () => {
      it('should handle CSV with quotes already removed', () => {
        const csv = `name,position,team
"Patrick Mahomes","QB","KC"
Christian McCaffrey,RB,SF`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.QB[0].name).toBe('Patrick Mahomes');
        expect(result.rankings.RB[0].name).toBe('Christian McCaffrey');
      });

      it('should handle Windows line endings', () => {
        const csv = `name,position,team\r\nPatrick Mahomes,QB,KC\r\nChristian McCaffrey,RB,SF`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.ALL).toHaveLength(2);
      });

      it('should handle extra columns that are not recognized', () => {
        const csv = `name,position,team,random,another
Patrick Mahomes,QB,KC,data1,data2
Christian McCaffrey,RB,SF,data3,data4`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.ALL).toHaveLength(2);
        expect(result.rankings.QB[0]).not.toHaveProperty('random');
        expect(result.rankings.QB[0]).not.toHaveProperty('another');
      });

      it('should handle players with special characters in names', () => {
        const csv = `name,position,team
D'Andre Swift,RB,PHI
La'Mical Perine,RB,KC
Amon-Ra St. Brown,WR,DET`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.RB).toHaveLength(2);
        expect(result.rankings.WR).toHaveLength(1);
        expect(result.rankings.WR[0].name).toBe('Amon-Ra St. Brown');
      });

      it('should assign correct ranks to players', () => {
        const csv = `name,position,team
Player1,RB,DAL
Player2,RB,KC
Player3,WR,SF
Player4,RB,BUF`;

        const result = parseCSV(csv, mockErrorCallback);

        // Position ranks should be 0-indexed within position
        expect(result.rankings.RB[0].rank).toBe(0);
        expect(result.rankings.RB[1].rank).toBe(1);
        expect(result.rankings.RB[2].rank).toBe(2);
        expect(result.rankings.WR[0].rank).toBe(0);

        // Overall ranks should be 0-indexed across all positions
        expect(result.rankings.ALL[0].rank).toBe(0);
        expect(result.rankings.ALL[1].rank).toBe(1);
        expect(result.rankings.ALL[2].rank).toBe(2);
        expect(result.rankings.ALL[3].rank).toBe(3);
      });

      it('should handle kickers correctly', () => {
        const csv = `name,position,team
Justin Tucker,K,BAL
Harrison Butker,K,KC`;

        const result = parseCSV(csv, mockErrorCallback);

        expect(result.rankings.K).toHaveLength(2);
        expect(result.positions.K).toBe(true);
      });
    });
  });
});