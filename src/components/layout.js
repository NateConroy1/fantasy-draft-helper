import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './layout.css';
import {
  Alignment, AnchorButton, Button, Classes, Dialog, InputGroup, Intent, Navbar, Tooltip,
} from '@blueprintjs/core';
import PlayerSearch from './playerSearch';

const Layout = ({
  children, emptyNav, players, toggleDrafted, onReset,
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  return (
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
              <Tooltip content="reset">
                <Button
                  minimal
                  icon="reset"
                  onClick={() => {
                    setResetDialogOpen(true);
                  }}
                />
              </Tooltip>
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
      <Dialog
        title="Confirmation"
        isOpen={resetDialogOpen}
        onClose={() => {
          setResetDialogOpen(false);
        }}
      >
        <div className={Classes.DIALOG_BODY}>
          Are you sure you want to reset? Doing so will mark all players as available.
        </div>
        <div className={Classes.DIALOG_FOOTER}>
          <div className={Classes.DIALOG_FOOTER_ACTIONS}>
            <Button
              onClick={() => {
                setResetDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <AnchorButton
              intent={Intent.DANGER}
              onClick={() => {
                setResetDialogOpen(false);
                onReset();
              }}
            >
              Reset
            </AnchorButton>
          </div>
        </div>
      </Dialog>
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
