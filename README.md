# [Fantasy Draft Helper](https://www.fantasy.nateconroy.com)

Simple assistant for compiling your rankings and managing your offline fantasy football draft.

Hosted at www.fantasy.nateconroy.com

![fantasy-draft-helper](assets/screenshot.png)

## Usage

* Import CSV ranking list files (overall or by postition). 
* View them side by side in table format, as well as the generated aggregate rankings calculated by taking the average ranking of each player across each of your imported lists. 
* Search and select, or click to toggle any player's draft availability. This will propagate to each of the lists.
* Reset to clear the boards and mark all players as available after completing a draft, and draft again.
* Imported rankings and player availability are persisted in local storage, so you can navigate away and come back.

## Ranking List Requirements

Imported ranking lists must be in CSV format. The following column header strings are recognized by the tool. 
They can appear in any order and additional columns are ignored.

| Accepted Headers                               | Required | Description                                                                        |
| -----------------------------------------------| -------- | ---------------------------------------------------------------------------------- |
| <ul><li>`"name"`</li><li>`"player"`</li></ul>  | Yes      | name of the player                                                                 |
| <ul><li>`"position"`</li><li>`"pos"`</li></ul> | Yes      | position of the player (`"RB"`, `"WR"`, `"TE"`, `"QB"`, `"K"`, `"DST"`)            |
| <ul><li>`"team"`</li></ul>                     | Yes      | official abbreviation of the player's team if applicable (ex. `"BUF"`)             |
| <ul><li>`"bye"`</li><li>`"bye week"`</li></ul> | No       | player bye week if applicable                                                      |
| <ul><li>`"tier"`</li></ul>                     | No       | integer representing a tier for the player (one per player, many players per tier) |
| <ul><li>`"value"`</li><li>`"val"`</li></ul>    | No       | string representing the value of a player (ex. `"$50"`)                            |

## Development

Clone the repo

```bash
$ git clone https://github.com/NateConroy1/fantasy-draft-helper.git
```

Go to the project directory and install dependencies

```bash
$ cd fantasy-draft-helper && npm install
```

Build a dev version
```bash 
$ gatsby develop
```

Build a production version

```bash
$ gatsby build
$ gatsby serve
```
