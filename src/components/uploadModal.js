import {
  Button,
  Dialog,
  InputGroup,
  Intent,
  Spinner,
  FileInput,
  Toaster,
  Position,
} from '@blueprintjs/core';
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import createToast from '../util/createToast';

const toaster = (typeof document !== 'undefined') ? Toaster.create({
  position: Position.BOTTOM,
  maxToasts: 5,
}) : null;

const UploadModal = ({
  file, isOpen, onClose, parseList, onSubmit,
}) => {
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(file);
  const [name, setName] = useState('');

  const reset = () => {
    setIsParsingFile(false);
    setUploadedFile(null);
    setName('');
  };

  useEffect(() => {
    // when the modal closes, reset all data
    if (!isOpen) {
      reset();
    }
  }, [isOpen]);

  useEffect(() => {
    setUploadedFile(file);
  }, [file]);

  const loadFile = (event) => {
    const { files } = event.target;
    const extension = files[0].name.split('.').pop().toLowerCase();
    if (extension !== 'csv') {
      createToast(toaster, Intent.DANGER, `Invalid file format .${extension}, expected .csv`);
      return;
    }

    const fr = new FileReader();

    fr.onload = () => {
      setIsParsingFile(true);
      const list = parseList(fr.result, (errorMessage) => {
        createToast(toaster, Intent.DANGER, errorMessage);
      });
      if (list !== null) {
        setUploadedFile(list);
      }
      setIsParsingFile(false);
    };

    fr.readAsText(files[0]);
  };

  const submitButton = (
    <Button
      icon="tick"
      intent="success"
      onClick={() => {
        onSubmit(name, uploadedFile);
        reset();
        onClose();
        createToast(toaster, Intent.SUCCESS, `Successfully imported list ${name}`);
      }}
    />
  );

  return (
    <Dialog
      className="bp3-dark"
      isOpen={isOpen}
      onClose={onClose}
      title="Import CSV file"
      canOutsideClickClose={false}
    >
      <div className="bp3-dialog-body">
        {isParsingFile
          ? <Spinner />
          : (
            <>
              {uploadedFile !== null
                ? (
                  <InputGroup
                    placeholder="Enter a name for the list (optional)"
                    rightElement={submitButton}
                    onChange={(event) => {
                      setName(event.target.value);
                    }}
                  />
                )
                : (
                  <FileInput
                    className="bp3-fill"
                    onInputChange={loadFile}
                  />
                )}
            </>
          )}
      </div>
    </Dialog>
  );
};

UploadModal.propTypes = {
  file: PropTypes.shape({
    type: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.object),
  }),
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  parseList: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

UploadModal.defaultProps = {
  file: null,
};

export default UploadModal;
