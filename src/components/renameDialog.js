import React, { useEffect, useState } from 'react';

import {
  AnchorButton, Button, Classes, Dialog, InputGroup, Intent,
} from '@blueprintjs/core';

const RenameDialog = ({
  isOpen, currentName, onClose, onSubmit,
}) => {
  const [name, setName] = useState('');

  useEffect(() => {
    setName(currentName);
  }, [currentName]);

  return (
    <Dialog
      title="Rename List"
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className={Classes.DIALOG_BODY}>
        <InputGroup
          defaultValue={currentName}
          placeholder="Enter a name for the list (optional)"
          onChange={(event) => {
            setName(event.target.value);
          }}
        />
      </div>
      <div className={Classes.DIALOG_FOOTER}>
        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
          <Button
            onClick={onClose}
          >
            Cancel
          </Button>
          <AnchorButton
            intent={Intent.PRIMARY}
            onClick={() => { onSubmit(name); }}
          >
            Submit
          </AnchorButton>
        </div>
      </div>
    </Dialog>
  );
};

export default RenameDialog;
