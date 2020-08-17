import React from 'react';
import PropTypes from 'prop-types';
import './layout.css';
import {
  Alignment, Button, Navbar,
} from '@blueprintjs/core';
import PlayerSearch from './playerSearch';

const Layout = ({
  children, emptyNav, players, toggleDrafted,
}) => (
  <>
    <Navbar className="bp3-dark bp3-fixed-top">
      <Navbar.Group align={Alignment.LEFT}>
        <Navbar.Heading>Fantasy Draft Helper</Navbar.Heading>
      </Navbar.Group>
      {emptyNav ? null : (
        <>
          <Navbar.Group align={Alignment.LEFT}>
            <Navbar.Divider />
            <PlayerSearch players={players} toggleDrafted={toggleDrafted} />
          </Navbar.Group>
          <Navbar.Group align={Alignment.RIGHT}>
            <Button className="bp3-minimal" icon="user" />
            <Button className="bp3-minimal" icon="notifications" />
            <Button className="bp3-minimal" icon="cog" />
          </Navbar.Group>
        </>
      )}
    </Navbar>
    <div
      style={{
        height: '100vh',
        width: 'max-content',
        minWidth: '100%',
        background: '#293742',
        paddingTop: '5em',
        paddingBottom: '5em',
      }}
    >
      {children}
      <footer style={{ color: '#CED9E0', paddingTop: '2em', paddingLeft: '2em' }}>
        {`© Nate Conroy, ${new Date().getFullYear()}`}
      </footer>
    </div>
  </>
);

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
