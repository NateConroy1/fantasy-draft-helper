import React, { useState } from 'react';
import dataService from '../services';

import 'normalize.css';
import '@blueprintjs/core/lib/css/blueprint.css';
import '@blueprintjs/icons/lib/css/blueprint-icons.css';

import Landing from '../components/landing';

window.dataService = dataService;

const IndexPage = () => {
  const [lists, setLists] = useState(dataService.lists);
  const [inLanding, setInLanding] = useState(true);

  const onAddList = (name, list) => {
    setLists(dataService.addList(name, list));
  };

  const onRemoveList = (index) => {
    setLists(dataService.deleteList(index));
  };

  const enterRoom = () => {
    setInLanding(false);
  };

  return (
    <>
      { inLanding
        ? (
          <Landing
            lists={lists}
            onAddList={onAddList}
            onRemoveList={onRemoveList}
            onDone={enterRoom}
          />
        )
        : <></>}
    </>
  );
};

export default IndexPage;
