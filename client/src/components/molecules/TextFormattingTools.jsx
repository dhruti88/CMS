import React from 'react';
import Button from '../atoms/Button';
import Label from '../atoms/Label';

const TextFormattingTools = ({
  textFormatting,
  toggleFormat,
  changeFontSize,
  handleTextChange,
  textValue,
  setTextFormatting,
  changeFontFamily
}) => {
  return (
    <div className="text-formatting-tools">
      <div className="formatting-buttons">
        <Button
          onClick={() => toggleFormat('bold')}
          className={`format-button ${textFormatting.bold ? 'active' : ''}`}
          title="Bold"
        >
          B
        </Button>
        <Button
          onClick={() => toggleFormat('italic')}
          className={`format-button ${textFormatting.italic ? 'active' : ''}`}
          title="Italic"
        >
          I
        </Button>
        <Button
          onClick={() => toggleFormat('underline')}
          className={`format-button ${textFormatting.underline ? 'active' : ''}`}
          title="Underline"
        >
          U
        </Button>
        <Button
          onClick={() => toggleFormat('align')}
          className="format-button align-button"
          title={`Align: ${textFormatting.align}`}
        >
          {textFormatting.align === 'left'
            ? '⫷'
            : textFormatting.align === 'center'
              ? '⫶'
              : textFormatting.align === 'right'
                ? '⫸'
                : '☰'}
        </Button>

      </div>
      <div className="font-size-control">
        <Button onClick={() => changeFontSize(-2)} className="format-button" title="Decrease font size">
          A-
        </Button>
        <span className="font-size-display">{textFormatting.fontSize}px</span>
        <Button onClick={() => changeFontSize(2)} className="format-button" title="Increase font size">
          A+
        </Button>
      </div>
      <div className="font-family-selector">
        <Label>Font:</Label>
        <select
          value={textFormatting.fontFamily}
          onChange={(e) => changeFontFamily(e.target.value)}
        >
          <option value="Arial">Arial</option>
          <option value="Helvetica">Helvetica</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
        </select>
      </div>
      <textarea
        value={textValue}
        onChange={handleTextChange}
        className="text-editor"
        placeholder="Enter text here..."
      />
    </div>
  );
};

export default TextFormattingTools;
