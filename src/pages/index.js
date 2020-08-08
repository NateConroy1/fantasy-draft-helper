import React, { useEffect, useState } from 'react';
import dataService from '../services';

import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';

import Landing from '../components/landing';
import Main from '../components/main';

if (typeof window !== 'undefined') {
  window.dataService = dataService;
}

const IndexPage = () => {
  const [lists, setLists] = useState(dataService.lists);
  const [players, setPlayers] = useState(dataService.players);
  const [inLanding, setInLanding] = useState(true);

  const onAddList = (name, list) => {
    dataService.addList(name, list);
    setLists(dataService.lists.slice());
    setPlayers({ ...dataService.players });
  };

  const onRemoveList = (index) => {
    dataService.deleteList(index);
    setLists(dataService.lists.slice());
  };

  const enterRoom = () => {
    setInLanding(false);
  };

  const toggleDrafted = (player) => {
    dataService.toggleDrafted(player);
    setPlayers({ ...dataService.players });
  };

  return (
    <>
      { inLanding
        ? (
          <Landing
            lists={lists}
            onAddList={onAddList}
            onRemoveList={onRemoveList}
            parseList={dataService.parseList}
            onDone={enterRoom}
          />
        )
        : (
          <Main
            lists={lists}
            aggregatedList={dataService.aggregatedList}
            players={players}
            toggleDrafted={toggleDrafted}
          />
        )}
    </>
  );
};

export default IndexPage;
