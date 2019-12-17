import { h, IFieldContainerRenderer, combineCssClasses } from '@de-re-crud/ui';

const Bootstrap4FieldContainerRenderer = ({
  fieldDescription,
  errors,
  renderedField,
}: IFieldContainerRenderer) => (
  <div
    className={combineCssClasses(
      'form-group',
      'bootstrap4-field-container-renderer',
    )}
  >
    {renderedField}
    {fieldDescription &&
      !errors.length && (
        <span className="form-text text-muted">{fieldDescription}</span>
      )}
    {errors.length ? (
      <span data-testid="field-error" className="invalid-feedback d-block">
        {errors[0]}
      </span>
    ) : null}
  </div>
);

export default Bootstrap4FieldContainerRenderer;
