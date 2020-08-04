import React from 'react';
import Layout from './layout';
import RankingList from './ranking';

const Main = ({ lists, players, toggleDrafted }) => (
  <Layout>
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      {lists.map((list, index) => (
        <RankingList key={`${list.name}-${index}`} listName={list.name} list={list.list} players={players} toggleDrafted={toggleDrafted} />
      ))}
    </div>

  </Layout>
);

export default Main;
