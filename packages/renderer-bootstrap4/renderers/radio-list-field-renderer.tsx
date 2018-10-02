import { IRadioListFieldRenderer } from '@de-re-crud/core/models/renderers';
import Bootstrap4LabelRenderer from '@de-re-crud/renderer-bootstrap4/renderers/label-renderer';
import { h } from 'preact';

const Bootstrap4RadioListFieldRenderer = ({
  rendererId,
  label,
  onFocus,
  onBlur,
  onChange,
  required,
  options
}: IRadioListFieldRenderer) => (
  <div className="bootstrap4-radio-list-field-renderer">
    <Bootstrap4LabelRenderer fieldRequired={required}>
      {label}
    </Bootstrap4LabelRenderer>

    {options.map((option) => {
      const inputId = `${rendererId}.${option.value}`;

      return (
        <div className="custom-control custom-radio">
          <input
            id={inputId}
            className="custom-control-input"
            type="radio"
            onFocus={onFocus}
            onBlur={onBlur}
            onChange={onChange}
            value={option.value}
            checked={option.selected}
          />
          <Bootstrap4LabelRenderer
            htmlFor={inputId}
            className="custom-control-label"
            fieldRequired={false}
          >
            {option.label}
          </Bootstrap4LabelRenderer>
        </div>
      );
    })}
  </div>
);

export default Bootstrap4RadioListFieldRenderer;