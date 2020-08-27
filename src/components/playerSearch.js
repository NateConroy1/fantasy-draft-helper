import {
  Menu, MenuItem, Popover, PopoverPosition, Switch,
} from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import nameToUniqueId from '../util/nameToUniqueId';
import { Positions } from '../util/constants';

const MIN_QUERY_LENGTH = 2;

const PlayerSearch = ({ players, toggleDrafted }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const results = [];
    if (query.length >= MIN_QUERY_LENGTH) {
      Object.keys(players).forEach((playerId) => {
        const player = players[playerId];
        // if it's a defense, check query against name rather than abbreviation
        if (player.position === Positions.DST) {
          const defenseName = nameToUniqueId(player.name);
          if (defenseName.includes(query)) {
            results.push(playerId);
          }
        } else if (playerId.includes(query)) {
          results.push(playerId);
        }
      });
    }
    setSearchResults(results);
  }, [query]);

  return (
    <Popover
      minimal
      autoFocus={false}
      enforceFocus={false}
      position={PopoverPosition.BOTTOM_LEFT}
    >
      <div className="bp3-input-group" style={{ width: '20em' }}>
        <span className="bp3-icon bp3-icon-search" />
        <input
          className="bp3-input"
          type="search"
          placeholder="Search player"
          dir="auto"
          onChange={
            (event) => {
              const playerId = nameToUniqueId(event.target.value);
              setQuery(playerId);
            }
          }
        />
      </div>
      { searchResults.length === 0 ? <></>
        : (
          <Menu key={searchResults.length} style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {
            searchResults.map((playerId, index) => {
              const { name } = players[playerId];
              return (
                <MenuItem
                  key={index}
                  text={name}
                  shouldDismissPopover={false}
                  label={(
                    <Switch
                      checked={players[playerId].available}
                      onChange={() => {
                        toggleDrafted(playerId);
                      }}
                    />
                )}
                />
              );
            })
          }
          </Menu>
        )}
    </Popover>
  );
};

export default PlayerSearch;
