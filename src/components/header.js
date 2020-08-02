import React from 'react';
import {
  Alignment, Button, Navbar,
} from '@blueprintjs/core';

const Header = () => (
  <Navbar className="bp3-dark bp3-fixed-top">
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading>Fantasy Draft Helper</Navbar.Heading>
      <Navbar.Divider />
      <div className="bp3-input-group" style={{ width: '20em' }}>
        <span className="bp3-icon bp3-icon-search" />
        <input className="bp3-input" type="search" placeholder="Search player" dir="auto" />
      </div>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <Button className="bp3-minimal" icon="user" />
      <Button className="bp3-minimal" icon="notifications" />
      <Button className="bp3-minimal" icon="cog" />
    </Navbar.Group>
  </Navbar>
);

export default Header;
