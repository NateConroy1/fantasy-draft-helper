import React, { useEffect, useState } from 'react';
import {
  Alignment, Button, Checkbox, HTMLSelect, Intent, Navbar, Switch, Tag,
} from '@blueprintjs/core';
import {
  Cell, Column, RenderMode, Table,
} from '@blueprintjs/table';
import { Positions } from '../util/constants';
import './ranking.css';
import nameToUniqueId from '../util/nameToUniqueId';

const takenStyle = { backgroundColor: '#CED9E0', textDecoration: 'line-through' };

const renderTags = (player) => (
  <div className="ranking-cell-right">
    <div className="ranking-cell-tag-container">
      {player.showTier
        ? (
          <Tag
            minimal
            round
            className="ranking-cell-tag"
            intent={Intent.SUCCESS}
          >
            {`Tier ${player.tier}`}
          </Tag>
        )
        : null}
      {player.hasOwnProperty('value')
        ? (
          <Tag
            minimal
            round
            className="ranking-cell-tag"
            intent={Intent.PRIMARY}
          >
            {player.value}
          </Tag>
        )
        : null}
    </div>
  </div>
);

const RankingList = ({
  listName, list, players, toggleDrafted, editable, onRename, onRemove,
}) => {
  const [columnWidths, setColumnWidths] = useState([250, 70, 70, 70, 60]);
  const [hideDraftedPlayers, setHideDraftedPlayers] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [currentListType, setCurrentListType] = useState(
    list.hasOwnProperty(Positions.ALL)
      ? Positions.ALL
      : Object.keys(list)[0],
  );
  const [currentList, setCurrentList] = useState(list[currentListType]);

  const updateVisibleList = () => {
    const visibleList = [];
    let currentTier = -1;
    list[currentListType].forEach((player) => {
      const showTier = (player.hasOwnProperty('tier') && player.tier !== currentTier);
      if (hideDraftedPlayers) {
        let playerId;
        if (player.position === Positions.DST) {
          playerId = player.team;
        } else {
          playerId = nameToUniqueId(player.name);
        }

        if (players[playerId].available) {
          if (showTier) {
            currentTier = player.tier;
          }
          visibleList.push({ ...player, showTier });
        }
      } else {
        if (showTier) {
          currentTier = player.tier;
        }
        visibleList.push({ ...player, showTier });
      }
    });
    setCurrentList(visibleList);
  };

  useEffect(() => {
    const positions = [];
    Object.keys(list).forEach((position) => {
      if (position === Positions.ALL) {
        positions.unshift(position);
      } else {
        positions.push(position);
      }
    });
    setFilterOptions(positions);
  }, [list]);

  useEffect(() => {
    updateVisibleList();
  }, [players, currentListType, hideDraftedPlayers]);

  const resizeColumn = (index, width) => {
    columnWidths[index] = width;
    setColumnWidths(columnWidths.slice());
  };

  const tableCell = (row, type) => {
    const player = currentList[row];

    let playerId;
    if (player.position === Positions.DST) {
      playerId = player.team;
    } else {
      playerId = nameToUniqueId(player.name);
    }
    const { available } = players[playerId];
    return (
      <Cell className="ranking-text-cell" style={available ? null : takenStyle}>
        <div className="ranking-cell-container">
          {players[playerId][type]}
          {type === 'name' ? renderTags(player) : null}
        </div>
      </Cell>
    );
  };

  const toggleCell = (row) => {
    const player = currentList[row];

    let playerId;
    if (player.position === Positions.DST) {
      playerId = player.team;
    } else {
      playerId = nameToUniqueId(player.name);
    }

    const { available } = players[playerId];
    return (
      <Cell style={available ? null : takenStyle}>
        <Switch
          checked={available}
          onChange={() => {
            toggleDrafted(playerId);
          }}
        />
      </Cell>
    );
  };

  return (
    <div className="ranking-window">
      <Navbar>
        <Navbar.Group align={Alignment.LEFT} style={{ marginRight: '1em' }}>
          <Navbar.Heading className="ranking-header">{listName}</Navbar.Heading>
          {editable ? <Button minimal small icon="edit" onClick={onRename} /> : null}
          <Navbar.Divider />
          <HTMLSelect
            options={filterOptions}
            onChange={(event) => {
              setCurrentListType(event.target.value);
            }}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Checkbox
            checked={hideDraftedPlayers}
            label="Hide drafted"
            style={{ margin: '0' }}
            onChange={() => { setHideDraftedPlayers(!hideDraftedPlayers); }}
          />
          {editable
            ? (
              <Button
                small
                minimal
                icon="cross"
                intent={Intent.DANGER}
                style={{ marginLeft: '1em' }}
                onClick={onRemove}
              />
            ) : null}
        </Navbar.Group>
      </Navbar>

      <Table
        className="ranking-table"
        numRows={currentList.length}
        defaultRowHeight={24}
        columnWidths={columnWidths}
        onColumnWidthChanged={(i, size) => {
          resizeColumn(i, size);
        }}
        renderMode={RenderMode.NONE}
        key={currentList.length}
      >
        <Column
          nameRenderer={() => (<strong>Name</strong>)}
          cellRenderer={(row) => (tableCell(row, 'name'))}
        />
        <Column
          nameRenderer={() => (<strong>Pos</strong>)}
          cellRenderer={(row) => (tableCell(row, 'position'))}
        />
        <Column
          nameRenderer={() => (<strong>Team</strong>)}
          cellRenderer={(row) => (tableCell(row, 'team'))}
        />
        <Column
          nameRenderer={() => (<strong>Bye</strong>)}
          cellRenderer={(row) => (tableCell(row, 'bye'))}
        />
        <Column
          name=""
          cellRenderer={(row) => (toggleCell(row))}
        />
      </Table>
    </div>
  );
};

export default RankingList;
