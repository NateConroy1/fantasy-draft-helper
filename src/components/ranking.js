import React, { useEffect, useState } from 'react';
import {
  Alignment, Checkbox, HTMLSelect, Navbar, Switch,
} from '@blueprintjs/core';
import {
  Cell, Column, RenderMode, Table,
} from '@blueprintjs/table';
import './ranking.css';
import { Positions } from '../util/constants';

const takenStyle = { backgroundColor: '#CED9E0', textDecoration: 'line-through' };

const RankingList = ({
  listName, list, players, toggleDrafted,
}) => {
  const [columnWidths, setColumnWidths] = useState([200, 67, 67, 67, 67]);
  const [hideDraftedPlayers, setHideDraftedPlayers] = useState(false);
  const [filterOptions, setFilterOptions] = useState([]);
  const [currentList, setCurrentList] = useState(list.rankings.ALL);

  useEffect(() => {
    const positions = [];
    Object.keys(list.positions).forEach((position) => {
      positions.push(position);
    });
    if (positions.length > 1) {
      positions.unshift(Positions.ALL);
    }
    setFilterOptions(positions);
  }, [list]);

  const resizeColumn = (index, width) => {
    columnWidths[index] = width;
    setColumnWidths(columnWidths.slice());
  };

  const tableCell = (row, type) => {
    const player = currentList[row];
    const available = players[player.name];
    return (<Cell style={available ? null : takenStyle}>{player[type]}</Cell>);
  };

  const toggleCell = (row) => {
    const player = currentList[row];
    const available = players[player.name];
    return (
      <Cell style={available ? null : takenStyle}>
        <Switch
          checked={players[player.name]}
          onChange={() => {
            toggleDrafted(player.name);
          }}
        />
      </Cell>
    );
  };

  return (
    <div
      className="window"
      style={{
        marginLeft: '3em', marginRight: '3em', background: '#BFCCD6', width: '500px', height: '100%',
      }}
    >
      <Navbar>
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>{listName}</Navbar.Heading>
          <Navbar.Divider />
          <HTMLSelect
            options={filterOptions}
            onChange={(event) => {
              setCurrentList(list.rankings[event.target.value]);
            }}
          />
        </Navbar.Group>
        <Navbar.Group align={Alignment.RIGHT}>
          <Checkbox
            checked={hideDraftedPlayers}
            label="Hide drafted players"
            style={{ margin: '0' }}
            onChange={() => { setHideDraftedPlayers(!hideDraftedPlayers); }}
          />
        </Navbar.Group>
      </Navbar>

      <Table
        className="ranking-table"
        numRows={currentList.length}
        columnWidths={columnWidths}
        onColumnWidthChanged={(i, size) => {
          resizeColumn(i, size);
        }}
        renderMode={RenderMode.NONE}
      >
        <Column
          name="Name"
          cellRenderer={(row) => (tableCell(row, 'name'))}
        />
        <Column
          name="Pos"
          cellRenderer={(row) => (tableCell(row, 'position'))}
        />
        <Column
          name="Team"
          cellRenderer={(row) => (tableCell(row, 'team'))}
        />
        <Column
          name="Bye"
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
