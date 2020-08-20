import React, { useState } from 'react';
import Layout from './layout';
import RankingList from './ranking';
import RenameDialog from './renameDialog';

const Main = ({
  lists, aggregatedList, players, toggleDrafted, onRenameList,
}) => {
  // list renaming
  const [renamingList, setRenamingList] = useState(false);
  const [selectedListName, setSelectedListName] = useState('');
  const [selectedListIdx, setSelectedListIdx] = useState(-1);

  return (
    <>
      <Layout players={players} toggleDrafted={toggleDrafted}>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
          <RankingList key="aggregated-rankings" listName="Aggregated Rankings" list={aggregatedList} players={players} toggleDrafted={toggleDrafted} />
          {lists.map((list, index) => (
            <RankingList
              renameAllowed
              key={`${list.name}-${index}`}
              listName={list.name}
              list={list.list.rankings}
              players={players}
              toggleDrafted={toggleDrafted}
              onRename={() => {
                setSelectedListIdx(index);
                setSelectedListName(list.name);
                setRenamingList(true);
              }}
            />
          ))}
        </div>

      </Layout>
      <RenameDialog
        isOpen={renamingList}
        currentName={selectedListName}
        onClose={() => {
          setRenamingList(false);
        }}
        onSubmit={(newName) => {
          onRenameList(selectedListIdx, newName);
          setRenamingList(false);
        }}
      />
    </>
  );
};
export default Main;
