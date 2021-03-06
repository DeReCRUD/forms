import {
  h,
  ITableLinkedStructFieldRenderer,
  createCssClass,
} from '@de-re-crud/ui';
import Bootstrap4ButtonRenderer from './button-renderer';

const cssName = 'bootstrap4-table-linked-struct-renderer';

const Bootstrap4TableLinkedStructFieldRenderer = ({
  renderFieldLabel,
  headers,
  disabled,
  value,
  valueErrorIndicators,
  disabledValues,
  deletedValues,
  canAdd,
  canRemove,
  onAdd,
  onEdit,
  onRemove,
}: ITableLinkedStructFieldRenderer) => {
  const rows = [];

  value.forEach((columns, index) => {
    if (deletedValues[index]) {
      return;
    }

    const removeButtonVisible = canRemove(index);

    rows.push(
      <tr
        data-testid={`row-${index + 1}`}
        className={valueErrorIndicators[index] && 'table-danger'}
      >
        {columns.map((x) => (
          <td>{x || ' '}</td>
        ))}
        <td>
          <div className={createCssClass(cssName, 'row', 'actions')}>
            <Bootstrap4ButtonRenderer
              classes="btn btn-link"
              text="Edit"
              onClick={() => onEdit(index)}
              disabled={disabledValues[index]}
            />
            {removeButtonVisible && <span>|</span>}
            {removeButtonVisible && (
              <Bootstrap4ButtonRenderer
                classes="btn btn-link"
                text="Remove"
                onClick={() => onRemove(index)}
                disabled={disabled || disabledValues[index]}
              />
            )}
          </div>
        </td>
      </tr>,
    );
  });

  return (
    <div className={createCssClass(cssName)}>
      <div className={createCssClass(cssName, 'controls')}>
        {renderFieldLabel()}{' '}
        {canAdd() && (
          <Bootstrap4ButtonRenderer
            classes="btn btn-sm btn-secondary"
            text="Add"
            onClick={() => onAdd()}
            disabled={disabled}
          />
        )}
      </div>
      <table className="table table-bordered table-sm">
        <thead>
          <tr>
            {headers.map((header) => (
              <th>{header}</th>
            ))}
            <th>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {!rows.length ? (
            <tr>
              <td colSpan={100}>None</td>
            </tr>
          ) : (
            rows
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Bootstrap4TableLinkedStructFieldRenderer;
