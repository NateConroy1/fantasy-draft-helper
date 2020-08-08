import React, { useEffect, useState } from 'react';
import {
  HTMLTable, Button, Card, FormGroup, Intent, ButtonGroup, Toaster, Position, Spinner,
} from '@blueprintjs/core';
import styled from 'styled-components';
import './landing.css';
import PropTypes from 'prop-types';
import UploadModal from './uploadModal';
import createToast from '../util/createToast';

const Window = styled.div`
    width: 100%;
    height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #30404d;
`;

const toaster = (typeof document !== 'undefined') ? Toaster.create({
  position: Position.BOTTOM,
  maxToasts: 5,
}) : null;

const Landing = ({
  lists, onAddList, onRemoveList, parseList, onDone,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [droppedFile, setDroppedFile] = useState(null);
  const [dragEnterCount, setDragEnterCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (loading) {
      onDone();
    }
  }, [loading]);

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
      const list = parseList(fr.result, (error) => {
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
      <div className="bp3-dark">
        <Window>
          <FormGroup>
            <Card
              style={dragEnterCount > 0 ? { backgroundColor: 'rgba(255,255,255,.4)' } : null}
            >
              <div
                id="container"
                onDragOver={dragOver}
                onDragEnter={dragEnter}
                onDragLeave={dragLeave}
                onDrop={fileDrop}
              >
                { lists.length === 0
                  ? (
                    <div
                      className="drop-container"
                    >
                      Drag & drop CSV files here or click button below to import
                    </div>
                  )
                  : (
                    <HTMLTable className="table">
                      <tbody>
                        {lists.map((event, index) => (
                          <tr key={index}>
                            <td className="table-cell">
                              {event.name}
                              <ButtonGroup minimal style={{ marginLeft: '10px' }}>
                                <Button
                                  icon="edit"
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
          </FormGroup>

          <FormGroup>
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
              disabled={lists.length === 0}
              intent={Intent.SUCCESS}
              icon={loading ? null : 'tick'}
              onClick={() => {
                setLoading(true);
              }}
            >
              {loading
                ? <Spinner size={20} intent={Intent.SUCCESS} />
                : 'Done'}
            </Button>
          </FormGroup>
        </Window>
      </div>
      <UploadModal
        file={droppedFile}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
        }}
        parseList={parseList}
        onSubmit={onAddList}
      />
    </>
  );
};

Landing.propTypes = {
  lists: PropTypes.arrayOf(PropTypes.object).isRequired,
  onAddList: PropTypes.func.isRequired,
  onRemoveList: PropTypes.func.isRequired,
  parseList: PropTypes.func.isRequired,
  onDone: PropTypes.func.isRequired,
};

export default Landing;
