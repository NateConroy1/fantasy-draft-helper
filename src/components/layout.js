import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Alignment, AnchorButton, Button, Classes, Dialog, InputGroup, Intent, Navbar, Tooltip,
} from '@blueprintjs/core';
import PlayerSearch from './playerSearch';
import UploadModal from './uploadModal';
import dataService from '../services';
import { REPO_URL } from '../util/constants';

const Layout = ({
  children, emptyNav, players, toggleDrafted, onReset, onAddList,
}) => {
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  return (
    <>
      <Navbar className="bp3-dark bp3-fixed-top">
        <Navbar.Group align={Alignment.LEFT}>
          <Navbar.Heading>Fantasy Draft Helper</Navbar.Heading>
        </Navbar.Group>
        <>
          {emptyNav ? null : (
            <Navbar.Group align={Alignment.LEFT}>
              <Navbar.Divider />
              <PlayerSearch players={players} toggleDrafted={toggleDrafted} />
            </Navbar.Group>
          )}
          <Navbar.Group id="nav-group-right" align={Alignment.RIGHT}>
            {emptyNav ? null : (
              <Button
                minimal
                icon="add"
                onClick={() => {
                  setUploadDialogOpen(true);
                }}
              >
                Import
              </Button>
            )}
            {emptyNav ? null : (
              <Button
                minimal
                icon="reset"
                onClick={() => {
                  setResetDialogOpen(true);
                }}
              >
                Reset
              </Button>
            )}
            <Button
              minimal
              icon="git-repo"
              onClick={() => {
                window.open(REPO_URL, '_blank');
              }}
            >
              Doc
            </Button>
          </Navbar.Group>
        </>
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
          {'© '}
          <a style={{ color: 'rgb(206, 217, 224)' }} href="https://www.nateconroy.com">Nate Conroy</a>
          {', '}
          {new Date().getFullYear()}
        </footer>
      </div>
      {emptyNav ? null
        : (
          <>
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
            <UploadModal
              isOpen={uploadDialogOpen}
              onClose={() => {
                setUploadDialogOpen(false);
              }}
              parseList={dataService.parseList}
              onSubmit={onAddList}
            />
          </>
        )}
    </>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
