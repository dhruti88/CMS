import React from 'react';
import Input from '../atoms/Input';
import Label from '../atoms/Label';
import Button from '../atoms/Button';

const SetupModal = ({
  layoutTitle,
  setLayoutTitle,
  columns,
  setColumns,
  rows,
  setRows,
  gutterWidth,
  setGutterWidth,
  setShowSetupForm,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    // When submitted, the context state is already updated from onChange events.
    setShowSetupForm(false);
  };

  return (
    <div className="setup-modal">
      <h2 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "10px" }}>
        Configure Grid Layout
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <Label>Layout Title:</Label>
          <Input
            type="text"
            value={layoutTitle}
            onChange={(e) => setLayoutTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <Label>Columns:</Label>
          <Input
            type="number"
            value={columns}
            min="1"
            onChange={(e) =>
              setColumns(Math.max(1, parseInt(e.target.value) || 8))
            }
          />
        </div>
        <div className="form-group">
          <Label>Rows:</Label>
          <Input
            type="number"
            value={rows}
            min="1"
            onChange={(e) =>
              setRows(Math.max(1, parseInt(e.target.value) || 12))
            }
          />
        </div>
        <div className="form-group">
          <Label>Gutter Width:</Label>
          <Input
            type="number"
            value={gutterWidth}
            min="0"
            onChange={(e) =>
              setGutterWidth(Math.max(0, parseInt(e.target.value) || 10))
            }
          />
        </div>
        <Button className="submit-button" type="submit">
          Create Workbench
        </Button>
      </form>
    </div>
  );
};

export default SetupModal;
