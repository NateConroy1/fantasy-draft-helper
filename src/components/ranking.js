import React, { useState } from 'react';
import {
  Alignment, Button, Navbar, Switch,
} from '@blueprintjs/core';
import {
  Cell, Column, RenderMode, Table,
} from '@blueprintjs/table';
import './ranking.css';

const takenStyle = { backgroundColor: '#CED9E0', textDecoration: 'line-through' };

const RankingList = ({ list, players, toggleDrafted }) => {
  const [columnWidths, setColumnWidths] = useState([200, 67, 67, 67, 67]);

  const resizeColumn = (index, width) => {
    columnWidths[index] = width;
    setColumnWidths(columnWidths.slice());
  };

  return (
    <div
      className="window"
      style={{
        marginLeft: '3em', marginRight: '3em', background: '#BFCCD6', width: '500px', height: '100%',
      }}
    >
      <Navbar style={{ height: '3em' }}>
        <Navbar.Group align={Alignment.LEFT} style={{ height: '3em' }}>
          <Navbar.Heading>{list.name}</Navbar.Heading>
          <Navbar.Divider />
          <Button small className="bp3-minimal" icon="home" text="Home" />
          <Button small className="bp3-minimal" icon="document" text="Files" />
        </Navbar.Group>
      </Navbar>

      <Table
        className="ranking-table"
        numRows={list.list.data.length}
        columnWidths={columnWidths}
        onColumnWidthChanged={(i, size) => {
          resizeColumn(i, size);
        }}
        renderMode={RenderMode.NONE}
      >
        <Column
          name="Name"
          cellRenderer={(row) => {
            const player = list.list.data[row];
            const available = players[player.name];
            return (<Cell style={available ? null : takenStyle}>{player.name}</Cell>);
          }}
        />
        <Column
          name="Pos"
          cellRenderer={(row) => {
            const player = list.list.data[row];
            const available = players[player.name];
            return (<Cell style={available ? null : takenStyle}>{player.position}</Cell>);
          }}
        />
        <Column
          name="Team"
          cellRenderer={(row) => {
            const player = list.list.data[row];
            const available = players[player.name];
            return (<Cell style={available ? null : takenStyle}>{player.team}</Cell>);
          }}
        />
        <Column
          name="Bye"
          cellRenderer={(row) => {
            const player = list.list.data[row];
            const available = players[player.name];
            return (<Cell style={available ? null : takenStyle}>{player.bye}</Cell>);
          }}
        />
        <Column
          name=""
          cellRenderer={(row) => {
            const player = list.list.data[row];
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
          }}
        />
      </Table>
    </div>
  );
};

export default RankingList;
