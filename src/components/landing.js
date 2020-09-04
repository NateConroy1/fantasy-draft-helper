import React, { useEffect, useState } from 'react';
import {
  HTMLTable, Button, Card, FormGroup, Intent, ButtonGroup, Toaster, Position,
} from '@blueprintjs/core';
import './landing.css';
import PropTypes from 'prop-types';
import UploadModal from './uploadModal';
import createToast from '../util/createToast';
import Layout from './layout';
import RenameDialog from './renameDialog';
import dataService from '../services';
import { REPO_URL } from '../util/constants';

const toaster = (typeof document !== 'undefined') ? Toaster.create({
  position: Position.BOTTOM,
  maxToasts: 5,
}) : null;

const Landing = ({
  lists, onAddList, onRemoveList, onRenameList, onDone,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [dragEnterCount, setDragEnterCount] = useState(0);
  const [listCount, setListCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // list renaming
  const [renamingList, setRenamingList] = useState(false);
  const [listName, setListName] = useState('');
  const [renamingListIdx, setRenamingListIdx] = useState(-1);

  useEffect(() => {
    if (loading) {
      onDone();
    }
  }, [loading]);

  useEffect(() => {
    setListCount(lists.length);
  }, [lists]);

  const dragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const dragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragEnterCount(dragEnterCount + 1);
  };

  const dragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragEnterCount(dragEnterCount - 1);
  };

  const fileDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragEnterCount(0);

    const { files } = e.dataTransfer;

    const extension = files[0].name.split('.').pop().toLowerCase();
    if (extension !== 'csv') {
      createToast(toaster, Intent.DANGER, `Invalid file format .${extension}, expected .csv`);
      return;
    }

    const fr = new FileReader();
    fr.onload = () => {
      const list = dataService.parseList(fr.result, (error) => {
        createToast(toaster, Intent.DANGER, error);
      });

      if (list !== null) {
        setDroppedFile(list);
        setModalOpen(true);
      }
    };

    fr.readAsText(files[0]);
  };

  return (
    <>
      <Layout emptyNav>
        <div
          className="bp3-dark"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <FormGroup style={{ margin: 'auto' }}>
            <Card
              style={dragEnterCount > 0
                ? { backgroundColor: '#5C7080' }
                : { background: '#30404D' }}
            >
              <div
                id="container"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
              >
                { listCount === 0
                  ? (
                    <div
                      className="drop-container"
                    >
                      Drag & drop CSV files here or click button below to import
                    </div>
                  )
                  : (
                    <HTMLTable striped className="table">
                      <thead>
                        <tr>
                          <th>Imported Lists</th>
                        </tr>
                      </thead>
                      <tbody>
                        {lists.map((event, index) => (
                          <tr key={index}>
                            <td className="table-cell">
                              {event.name}
                            </td>
                            <td>
                              <ButtonGroup minimal style={{ marginLeft: '10px' }}>
                                <Button
                                  icon="edit"
                                  onClick={() => {
                                    setListName(event.name);
                                    setRenamingListIdx(index);
                                    setRenamingList(true);
                                  }}
                                />
                                <Button
                                  intent={Intent.DANGER}
                                  icon="cross"
                                  onClick={() => {
                                    onRemoveList(index);
                                  }}
                                />
                              </ButtonGroup>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </HTMLTable>
                  )}
              </div>
            </Card>
            <FormGroup style={{ paddingTop: '1em', alignItems: 'center' }}>
              <Button
                className="button"
                large
                icon="import"
                onClick={() => {
                  setModalOpen(true);
                }}
              >
                Import CSVs
              </Button>
              <Button
                large
                className="button"
                disabled={listCount === 0}
                intent={Intent.SUCCESS}
                icon="tick"
                onClick={() => {
                  setLoading(true);
                }}
                loading={loading}
              >
                Done
              </Button>
            </FormGroup>
          </FormGroup>
        </div>
      </Layout>
      <UploadModal
        file={droppedFile}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        parseList={dataService.parseList}
        onSubmit={onAddList}
      />
      <RenameDialog
        isOpen={renamingList}
        currentName={listName}
        onClose={() => {
          setRenamingList(false);
        }}
        onSubmit={(newName) => {
          onRenameList(renamingListIdx, newName);
          setRenamingList(false);
        }}
      />
    </>
  );
};

Landing.propTypes = {
  lists: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddList: PropTypes.func.isRequired,
  onRemoveList: PropTypes.func.isRequired,
  onRenameList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default Landing;
