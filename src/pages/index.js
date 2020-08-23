import React, { useState } from 'react';
import { FocusStyleManager } from '@blueprintjs/core';
import dataService from '../services';

import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';
import '@blueprintjs/table/lib/css/table.css';

import Landing from '../components/landing';
import Main from '../components/main';

FocusStyleManager.onlyShowFocusOnTabs();

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

  const onRenameList = (index, name) => {
    dataService.renameList(index, name);
    setLists(dataService.lists.slice());
  };

  const enterRoom = () => {
    setInLanding(false);
  };

  const toggleDrafted = (player) => {
    dataService.toggleDrafted(player);
    setPlayers({ ...dataService.players });
  };

  const resetPlayers = () => {
    dataService.resetPlayers();
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
            onRenameList={onRenameList}
            onDone={enterRoom}
          />
        )
        : (
          <Main
            lists={lists}
            aggregatedList={dataService.aggregatedList}
            players={players}
            onAddList={onAddList}
            onRemoveList={onRemoveList}
            onRenameList={onRenameList}
            onReset={resetPlayers}
            toggleDrafted={toggleDrafted}
          />
        )}
    </>
  );
};

export default IndexPage;
