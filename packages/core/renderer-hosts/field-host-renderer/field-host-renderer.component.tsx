import { h } from 'preact';
import BaseComponent from '../../base-component';
import {
  IInternalLinkedStructFieldReference,
  IInternalLinkedStructField,
  IInternalFieldReference,
  IInternalForeignKeyField,
  IInternalListField,
} from '../../internal-schema';
import Logger from '../../logger';
import {
  FieldBlurEvent,
  FieldChangeEvent,
  FieldFocusEvent,
  IFieldRenderer,
  IForeignKeyFieldRenderer,
  IInlineLinkedStructRenderer,
  ISelectableOption,
  ISelectListFieldRenderer,
  ITableLinkedStructRenderer,
} from '../../models/renderers';
import { SimpleFieldValue } from '../../models/schema';
import { getField, getKeyFields, getBlock } from '../../utils/schema-helper';
import BlockHostRenderer from '../block-host-renderer';
import { IFieldHostRendererProps } from './field-host-renderer.props';

export default class FieldHostRenderer extends BaseComponent<
  IFieldHostRendererProps
> {
  public render() {
    const {
      errors,
      schema,
      struct,
      fieldPath,
      fieldReference,
      fieldValue,
      rendererId,
      renderers,
    } = this.props;

    const field = getField(schema, struct, fieldReference.field);

    const fieldProps: IFieldRenderer = {
      errors,
      fieldDescription: field.help,
      fieldName: field.name,
      fieldType: field.type,
      label: field.label.short,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onValueChange: this.onValueChange,
      placeholder: field.placeholder,
      busy: this.isBusy(fieldPath),
      disabled: this.isDisabled(),
      readOnly: this.isReadOnly(),
      rendererId,
      required: field.required,
      value: fieldValue,
    };

    const renderedField = this.renderField(fieldReference, fieldProps);
    const FieldContainerRenderer = renderers.fieldContainer;

    return (
      <FieldContainerRenderer
        rendererId={rendererId}
        fieldName={fieldProps.fieldName}
        fieldDescription={fieldProps.fieldDescription}
        errors={fieldProps.errors}
        renderedField={renderedField}
      />
    );
  }

  private isReadOnly = () => {
    return false;
  };

  private isDisabled = () => {
    return this.props.formLocked;
  };

  private isBusy = (path: string) => {
    const { busy } = this.props;

    while (path.length) {
      const index = path.indexOf('.');

      if (busy[path] === true) {
        return true;
      }

      if (index === -1) {
        break;
      }

      path = path.substring(index + 1);
    }

    return false;
  };

  private changeValue = (
    fieldName: string,
    fieldPath: string,
    value: SimpleFieldValue | SimpleFieldValue[],
  ) => {
    this.props.changeValue(this.props.struct, fieldName, fieldPath, value);
  };

  private onFocus = (_: FieldFocusEvent) => {
    const {
      struct,
      focusField,
      fieldReference: { field },
      fieldPath,
    } = this.props;

    focusField(struct, field, fieldPath);
  };

  private onBlur = (_: FieldBlurEvent) => {
    const {
      struct,
      blurField,
      fieldReference: { field },
      fieldPath,
      parentPath,
    } = this.props;

    blurField(struct, field, fieldPath, parentPath);
  };

  private onChange = (e: FieldChangeEvent) => {
    let value: SimpleFieldValue | SimpleFieldValue[];

    switch (e.target.type) {
      case 'checkbox':
        value = e.target.checked;
        break;
      case 'select-multiple':
        value = [];

        const { options } = e.target;
        for (const option of options) {
          if (option.selected) {
            value.push(option.value);
          }
        }
        break;
      default:
        value = e.target.value;
        break;
    }

    this.onValueChange(value);
  };

  private onValueChange = (value: SimpleFieldValue | SimpleFieldValue[]) => {
    const {
      fieldReference: { field },
      fieldPath,
    } = this.props;

    this.changeValue(field, fieldPath, value);
  };

  private onAdd = (
    index: number,
    count: number = 1,
    navigate: boolean = true,
  ) => {
    const { struct, changeArrayValue, fieldReference, fieldPath } = this.props;
    const linkedStructFieldReference = fieldReference as IInternalLinkedStructFieldReference;
    const shouldNavigate =
      navigate && linkedStructFieldReference.hints.layout === 'table';

    changeArrayValue(
      struct,
      fieldReference.field,
      fieldPath,
      'add',
      index,
      count,
      shouldNavigate ? this.navigate : null,
    );
  };

  private navigate = (index: number) => {
    const { push, schema, struct, fieldReference, fieldPath } = this.props;
    const linkedStructFieldReference = getField(
      schema,
      struct,
      fieldReference.field,
    ) as IInternalLinkedStructField;

    const {
      reference: { struct: referenceStruct, block },
    } = linkedStructFieldReference;

    push({
      block,
      path: `${fieldPath}.${index}`,
      struct: referenceStruct,
    });
  };

  private canAdd = () => {
    const { schema, struct, fieldReference, fieldValue } = this.props;

    const linkedStructField = getField(
      schema,
      struct,
      fieldReference.field,
    ) as IInternalLinkedStructField;
    const value = (fieldValue as object[]) || [];

    if (
      linkedStructField.minInstances &&
      linkedStructField.maxInstances &&
      linkedStructField.minInstances === linkedStructField.maxInstances
    ) {
      return false;
    }

    return (
      typeof linkedStructField.maxInstances === 'undefined' ||
      value.length < linkedStructField.maxInstances
    );
  };

  private canRemove = (_: number) => {
    const { schema, struct, fieldReference, fieldValue } = this.props;

    const linkedStructField = getField(
      schema,
      struct,
      fieldReference.field,
    ) as IInternalLinkedStructField;
    const value = (fieldValue as object[]) || [];

    return value.length > linkedStructField.minInstances;
  };

  private onEdit = (index: number) => {
    this.navigate(index);
  };

  private onRemove = (index: number) => {
    const { struct, changeArrayValue, fieldReference, fieldPath } = this.props;

    changeArrayValue(
      struct,
      fieldReference.field,
      fieldPath,
      'remove',
      index,
      1,
    );
  };

  private renderField(
    fieldReference: IInternalFieldReference,
    fieldProps: IFieldRenderer,
  ) {
    const {
      schema,
      struct,
      childErrors,
      collectionReferences,
      fieldPath,
      formValue,
      parentValue,
      renderers,
    } = this.props;

    const field = getField(schema, struct, fieldReference.field);

    switch (field.type) {
      case 'text': {
        const TextFieldRenderer = renderers.textField;
        return (
          <TextFieldRenderer
            {...fieldProps}
            value={fieldProps.value as string}
          />
        );
      }
      case 'keyword': {
        const KeywordFieldRenderer = renderers.keywordField;
        return <KeywordFieldRenderer {...fieldProps} />;
      }
      case 'integer': {
        const IntegerFieldRenderer = renderers.integerField;
        return <IntegerFieldRenderer {...fieldProps} />;
      }
      case 'estimate': {
        const EsimateFieldRenderer = renderers.estimateField;
        return <EsimateFieldRenderer {...fieldProps} />;
      }
      case 'date': {
        const DateFieldRenderer = renderers.dateField;
        return <DateFieldRenderer {...fieldProps} />;
      }
      case 'boolean': {
        const BooleanFieldRenderer = renderers.booleanField;
        return (
          <BooleanFieldRenderer
            {...fieldProps}
            value={fieldProps.value as boolean}
          />
        );
      }
      case 'percent': {
        const PercentFieldRenderer = renderers.percentField;
        return <PercentFieldRenderer {...fieldProps} />;
      }
      case 'money': {
        const MoneyFieldRenderer = renderers.moneyField;
        return <MoneyFieldRenderer {...fieldProps} />;
      }
      case 'foreignKey': {
        const ForeignKeyFieldRenderer = renderers.foreignKeyField;
        let options: ISelectableOption[];

        const foreignKeyField = field as IInternalForeignKeyField;

        const {
          struct: referenceStruct,
          labelField,
        } = foreignKeyField.reference;

        const keyField = getKeyFields(schema, referenceStruct)[0];

        if (!collectionReferences || !collectionReferences[referenceStruct]) {
          Logger.error(
            `A collection reference must be defined for key: ${referenceStruct}.`,
          );
        } else {
          const collectionReference = collectionReferences[referenceStruct]({
            formValue,
            parentValue,
          });

          if (Array.isArray(collectionReference)) {
            options = collectionReference.map((x) => ({
              label: x[labelField],
              selected: x[keyField] === fieldProps.value,
              value: x[keyField],
            }));
          }
        }

        if (!options) {
          options = [];
        }

        if (typeof fieldProps.value === 'undefined') {
          options.unshift({ label: '', value: '', selected: false });
        }

        const foreignKeyFieldProps: IForeignKeyFieldRenderer = {
          ...fieldProps,
          options,
        };

        return <ForeignKeyFieldRenderer {...foreignKeyFieldProps} />;
      }
      case 'linkedStruct': {
        const { reference, minInstances } = field as IInternalLinkedStructField;
        const { hints } = fieldReference as IInternalLinkedStructFieldReference;
        const isTable = hints.layout === 'table';
        const blockName = hints.block || reference.block;
        const block = getBlock(schema, reference.struct, blockName);

        const LinkedStructFieldRenderer = isTable
          ? renderers.tableLinkedStructField
          : renderers.inlineLinkedStructField;

        let values = [];

        const busyValues = {};
        const disabledValues = {};

        if (Array.isArray(fieldProps.value)) {
          values = fieldProps.value as object[];
        }

        if (values.length < minInstances) {
          const startingIndex = values.length;
          const itemsToCreate = minInstances - values.length;

          this.onAdd(startingIndex, itemsToCreate, false);
        }

        if (isTable) {
          const mappedValue: any[][] = [];

          values.forEach((value, index) => {
            mappedValue.push(
              block.fields.map(({ field: blockField }) => value[blockField]),
            );

            busyValues[index] = this.isBusy(`${fieldPath}.${index}`);
            disabledValues[index] = this.isDisabled();
          });

          const tableLinkedStructFieldProps: ITableLinkedStructRenderer = {
            ...fieldProps,
            canAdd: this.canAdd,
            canRemove: this.canRemove,
            headers: block.fields.map((x) => {
              const blockField = getField(schema, reference.struct, x.field);
              return blockField.label.short;
            }),
            onAdd: () => this.onAdd((mappedValue && mappedValue.length) || 0),
            onEdit: this.onEdit,
            onRemove: this.onRemove,
            busyValues,
            disabledValues,
            value: mappedValue,
            valueErrorIndicators: childErrors,
          };

          return <LinkedStructFieldRenderer {...tableLinkedStructFieldProps} />;
        } else {
          const items = values.map((_, index) => {
            const itemPath = `${fieldPath}.${index}`;

            busyValues[index] = this.isBusy(itemPath);
            disabledValues[index] = this.isDisabled();

            return (
              <BlockHostRenderer
                key={itemPath}
                struct={reference.struct}
                block={block.name}
                path={itemPath}
              />
            );
          });

          const inlineLinkedStructFieldProps: IInlineLinkedStructRenderer = {
            ...fieldProps,
            canAdd: this.canAdd,
            canRemove: this.canRemove,
            onAdd: () => this.onAdd((values && values.length) || 0),
            onRemove: this.onRemove,
            busyRenderedItems: busyValues,
            disabledRenderedItems: disabledValues,
            renderedItems: items,
          };

          return (
            <LinkedStructFieldRenderer {...inlineLinkedStructFieldProps} />
          );
        }
      }
      case 'list': {
        const {
          multiSelect,
          options: listOptions,
          dynamicOptions,
          hints: { layout },
        } = field as IInternalListField;

        let ListFieldRenderer;

        if (layout === 'radio') {
          ListFieldRenderer = renderers.radioListField;
        } else if (multiSelect) {
          ListFieldRenderer = renderers.multiSelectListField;
        } else {
          ListFieldRenderer = renderers.selectListField;
        }

        let value;
        if (typeof fieldProps.value === 'undefined') {
          value = [];
        } else {
          value = !Array.isArray(fieldProps.value)
            ? [fieldProps.value]
            : fieldProps.value;
        }

        const options = listOptions.map((option) => ({
          ...option,
          selected: value.findIndex((x) => x === option.value) >= 0,
        }));

        if (
          layout === 'select' &&
          !multiSelect &&
          typeof fieldProps.value === 'undefined'
        ) {
          options.unshift({ label: '', value: '', selected: false });
        }

        const selectListFieldProps: ISelectListFieldRenderer = {
          ...fieldProps,
          options,
          dynamicOptions,
        };

        return <ListFieldRenderer {...selectListFieldProps} />;
      }
      case 'derived': {
        const DerivedFieldRenderer = renderers.derivedField;
        return <DerivedFieldRenderer {...fieldProps} />;
      }
      default: {
        Logger.error(`Field type ${field.type} is not supported.`);
        return null;
      }
    }
  }
}
