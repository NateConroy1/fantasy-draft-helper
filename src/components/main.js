import React from 'react';
import Layout from './layout';
import RankingList from './ranking';

const Main = ({
  lists, aggregatedList, players, toggleDrafted,
}) => (
  <Layout>
    <div style={{ display: 'flex', flexDirection: 'row', height: '100%' }}>
      <RankingList key="aggregated-rankings" listName="Aggregated Rankings" list={aggregatedList} players={players} toggleDrafted={toggleDrafted} />
      {lists.map((list, index) => (
        <RankingList key={`${list.name}-${index}`} listName={list.name} list={list.list.rankings} players={players} toggleDrafted={toggleDrafted} />
      ))}
    </div>

  </Layout>
);
export default Main;
