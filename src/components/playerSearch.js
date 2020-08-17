import {
  Menu, MenuItem, Popover, PopoverPosition, Switch,
} from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';

const MIN_QUERY_LENGTH = 2;
const sanitizeString = (input) => input.replace(/[. -]/g, '').toLowerCase();

const PlayerSearch = ({ players, toggleDrafted }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    const results = [];
    if (query.length >= MIN_QUERY_LENGTH) {
      Object.keys(players).forEach((name) => {
        if (sanitizeString(name).includes(query)) {
          results.push(name);
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
              setQuery(sanitizeString(event.target.value));
            }
          }
        />
      </div>
      { searchResults.length === 0 ? <></>
        : (
          <Menu key="menu" style={{ maxHeight: '70vh', overflow: 'auto' }}>
            {
            searchResults.map((name, index) => (
              <MenuItem
                key={index}
                text={name}
                shouldDismissPopover={false}
                label={(
                  <Switch
                    checked={players[name].available}
                    onChange={() => {
                      toggleDrafted(name);
                    }}
                  />
                )}
              />
            ))
          }
          </Menu>
        )}
    </Popover>
  );
};

export default PlayerSearch;
