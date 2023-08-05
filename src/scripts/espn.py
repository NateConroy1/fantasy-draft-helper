import json
import requests

teamIdToString = {
    0: "FA",
    1: "ATL",
    2: "BUF",
    3: "CHI",
    4: "CIN",
    5: "CLE",
    6: "DAL",
    7: "DEN",
    8: "DET",
    9: "GB",
    10: "TEN",
    11: "IND",
    12: "KC",
    13: "LV",
    14: "LAR",
    15: "MIA",
    16: "MIN",
    17: "NE",
    18: "NO",
    19: "NYG",
    20: "NYJ",
    21: "PHI",
    22: "ARI",
    23: "PIT",
    24: "LAC",
    25: "SF",
    26: "SEA",
    27: "TB",
    28: "WAS",
    29: "CAR",
    30: "JAX",
    33: "BAL",
    34: "HOU"
};
posIdToString = {1: "QB", 2: "RB", 3: "WR", 4: "TE", 5: "K", 16: "DST"};

url_ = "https://fantasy.espn.com/apis/v3/games/ffl/seasons/2023/segments/0/leaguedefaults/3?view=kona_player_info"
headers_ = {"x-fantasy-filter": "{\"players\":{\"filterStatsForExternalIds\":{\"value\":[2021,2022]},\"filterSlotIds\":{\"value\":[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,23,24]},\"filterStatsForSourceIds\":{\"value\":[0,1]},\"useFullProjectionTable\":{\"value\":true},\"sortAppliedStatTotal\":{\"sortAsc\":false,\"sortPriority\":3,\"value\":\"102022\"},\"sortDraftRanks\":{\"sortPriority\":2,\"sortAsc\":true,\"value\":\"PPR\"},\"sortPercOwned\":{\"sortPriority\":4,\"sortAsc\":false},\"limit\":200,\"filterRanksForSlotIds\":{\"value\":[0,2,4,6,17,16]},\"filterStatsForTopScoringPeriodIds\":{\"value\":2,\"additionalValue\":[\"002022\",\"102022\",\"002021\",\"022022\"]}}}"}

res = requests.get(url_, headers=headers_)
responseObj = json.loads(res.text)
players = responseObj["players"]

fileName = "espn_{0}_top{1}.csv".format("ppr",200)

file = open(fileName, 'w')
file.write("player,position,team,value\n")

for row in players:
    player = row["player"]

    name = player["fullName"]
    pos = posIdToString[int(player["defaultPositionId"])]
    team = teamIdToString[int(player["proTeamId"])]
    value = player["draftRanksByRankType"]["PPR"]["auctionValue"]

    file.write("{0},{1},{2},{3}\n".format(name,pos,team,value))

file.close()