import {
  Logger,
  ScalarFieldValue,
  InternalSchemaHelper,
  ILinkedStructFieldReference,
  ILinkedStructField,
  IFieldReference,
  IForeignKeyField,
  IListField,
  ITextField,
  IIntegerField,
  getValueForPath,
} from '@de-re-crud/core';
import { FunctionalComponent, h } from 'preact';
import { useContext } from 'preact/hooks';
import BaseComponent from '../../base-component';
import {
  FieldChangeEvent,
  IFieldRenderer,
  IForeignKeyFieldRenderer,
  IInlineLinkedStructFieldRenderer,
  ISelectableOption,
  ISelectListFieldRenderer,
  ITableLinkedStructFieldRenderer,
  ITextFieldRenderer,
  IIntegerFieldRenderer,
  IKeywordFieldRenderer,
  IEstimateFieldRenderer,
  IDateFieldRenderer,
  IBooleanFieldRenderer,
  IPercentFieldRenderer,
  IMoneyFieldRenderer,
  IDerivedFieldRenderer,
} from '../..';
import NavContext, { INavState } from '../../../utils/navigation/context';
import BlockHostRenderer from '../block-host-renderer';
import { IFieldHostRendererProps } from './field-host-renderer.props';
import FieldHostRendererConnect from '.';

class FieldHostRenderer extends BaseComponent<
  IFieldHostRendererProps & { push: (state: INavState) => void }
> {
  public render() {
    const {
      errors,
      schema,
      struct,
      fieldPath,
      fieldReference,
      fieldValue,
      formId,
      rendererId,
      renderers,
    } = this.props;

    const field = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    );

    const customHints = {
      ...field.hints.custom,
      ...fieldReference.hints.custom,
    };

    const readOnly = this.isReadOnly();
    const label = field.label.short;

    const busy = this.isBusy(fieldPath);
    const disabled = this.isDisabled();

    const fieldProps: IFieldRenderer = {
      errors,
      fieldDescription: field.help,
      fieldName: field.name,
      fieldType: field.type,
      fieldPath,
      label,
      onBlur: this.onBlur,
      onChange: this.onChange,
      onFocus: this.onFocus,
      onValueChange: this.onValueChange,
      renderFieldLabel: (options: { className?: string } = {}) => {
        const FieldLabelRenderer = renderers.fieldLabel;

        return (
          <FieldLabelRenderer
            rendererId={`${rendererId}_label`}
            hints={customHints}
            formId={formId}
            label={label}
            className={options.className}
            errors={errors}
            fieldType={field.type}
            fieldDescription={field.help}
            fieldName={field.name}
            fieldPath={fieldPath}
            fieldRequired={field.required}
            fieldValue={fieldValue}
            fieldBusy={busy}
            fieldReadOnly={readOnly}
            fieldDisabled={disabled}
            onValueChange={this.onValueChange}
          />
        );
      },
      placeholder: field.placeholder,
      busy,
      disabled,
      readOnly,
      tabIndex: readOnly ? -1 : undefined,
      formId,
      rendererId,
      required: field.required,
      value: fieldValue,
      hints: customHints,
    };

    let renderedDescription: h.JSX.Element;
    let renderedErrors: h.JSX.Element;

    if (field.help) {
      const FieldDescriptionRenderer = renderers.fieldDescription;

      renderedDescription = (
        <FieldDescriptionRenderer
          rendererId={`${rendererId}_description`}
          formId={formId}
          hints={customHints}
          hasErrors={errors.length > 0}
          fieldDescription={field.help}
        />
      );
    }

    if (
      errors.length &&
      field.hints.showValidatorMessages &&
      fieldReference.hints.showValidatorMessages
    ) {
      const FieldErrorsRenderer = renderers.fieldErrors;

      renderedErrors = (
        <FieldErrorsRenderer
          rendererId={`${rendererId}_errors`}
          formId={formId}
          hints={customHints}
          errors={errors}
        />
      );
    }

    const renderedField = this.renderField(fieldReference, fieldProps);
    const FieldContainerRenderer = renderers.fieldContainer;

    return (
      <FieldContainerRenderer
        formId={formId}
        rendererId={`${rendererId}_container`}
        fieldPath={fieldProps.fieldPath}
        fieldType={fieldProps.fieldType}
        fieldName={fieldProps.fieldName}
        fieldDescription={fieldProps.fieldDescription}
        fieldValue={fieldProps.value}
        errors={fieldProps.errors}
        hints={customHints}
        renderedField={renderedField}
        renderedDescription={renderedDescription}
        renderedErrors={renderedErrors}
        onValueChange={this.onValueChange}
      />
    );
  }

  private isReadOnly = () => {
    const { schema, struct, fieldReference } = this.props;

    const field = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    );

    return field.hints.readOnly;
  };

  private isDisabled = () => {
    return (
      this.props.formSubmitting ||
      this.props.formLocked ||
      this.props.formDisabled
    );
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

  private isDeleted = (struct: string, value: object) => {
    const { schema } = this.props;

    if (!value) {
      return false;
    }

    const fields = InternalSchemaHelper.getDeletionFields(schema, struct);

    if (!fields.length) {
      return false;
    }

    return fields.every((field) => {
      const fieldValue = value[field];
      return !!fieldValue;
    });
  };

  private onFocus = () => {
    const {
      struct,
      focusField,
      fieldReference: { field },
      fieldPath,
    } = this.props;

    if (this.isReadOnly() || this.isDisabled()) {
      return;
    }

    focusField(struct, field, fieldPath);
  };

  private onBlur = () => {
    const {
      struct,
      blurField,
      fieldReference: { field },
      fieldPath,
      parentPath,
    } = this.props;

    if (this.isReadOnly() || this.isDisabled()) {
      return;
    }

    blurField(struct, field, fieldPath, parentPath);
  };

  private onChange = (e: FieldChangeEvent) => {
    let value: ScalarFieldValue | ScalarFieldValue[];

    switch (e.target.type) {
      case 'checkbox':
        value = e.target.checked;
        break;
      case 'select-multiple':
        {
          value = [];

          const { options } = e.target;

          options.forEach((option) => {
            if (option.selected) {
              (value as ScalarFieldValue[]).push(option.value);
            }
          });
        }
        break;
      default:
        ({ value } = e.target);
        break;
    }

    this.onValueChange(value);
  };

  private onValueChange = (value: ScalarFieldValue | ScalarFieldValue[]) => {
    const {
      fieldReference: { field },
      fieldPath,
    } = this.props;

    if (this.isReadOnly() || this.isDisabled()) {
      return;
    }

    this.props.changeValue(this.props.struct, field, fieldPath, value);
  };

  private onAdd = (
    index: number,
    count: number = 1,
    navigate: boolean = true,
    values: object[] = undefined,
  ) => {
    const { struct, changeArrayValue, fieldReference, fieldPath } = this.props;
    const linkedStructFieldReference = fieldReference as ILinkedStructFieldReference;
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
      values,
    );
  };

  private navigate = (index: number) => {
    const { push, schema, struct, fieldReference, fieldPath } = this.props;
    const linkedStructFieldReference = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    ) as ILinkedStructField;

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

    const linkedStructField = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    ) as ILinkedStructField;
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
      InternalSchemaHelper.getNonDeletedValues(schema, struct, value).length <
        linkedStructField.maxInstances
    );
  };

  private canRemove = (index: number) => {
    const { schema, struct, fieldReference, fieldValue } = this.props;

    const linkedStructField = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    ) as ILinkedStructField;

    const array = (fieldValue as object[]) || [];
    if (this.isDeleted(struct, array[index])) {
      return false;
    }

    return (
      InternalSchemaHelper.getNonDeletedValues(schema, struct, array).length >
      linkedStructField.minInstances
    );
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
    fieldReference: IFieldReference,
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

    const field = InternalSchemaHelper.getField(
      schema,
      struct,
      fieldReference.field,
    );

    switch (field.type) {
      case 'text': {
        const textField = field as ITextField;

        let {
          hints: { layout },
        } = textField;

        const textFieldRendererProps: ITextFieldRenderer = {
          ...fieldProps,
          minLength: textField.minLength,
          maxLength: textField.maxLength,
          value: fieldProps.value as string,
        };

        let TextFieldRenderer = renderers.textField;

        if ((layout as string) === 'textArea') {
          Logger.deprecate('Use "textarea" instead of "textArea"');
          layout = 'textarea';
        }

        if (layout === 'textarea') {
          TextFieldRenderer = renderers.textAreaField;
        } else {
          TextFieldRenderer = renderers.textField;
        }

        return <TextFieldRenderer {...textFieldRendererProps} />;
      }
      case 'keyword': {
        const keywordFieldRendererProps: IKeywordFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as string,
        };

        const KeywordFieldRenderer = renderers.keywordField;
        return <KeywordFieldRenderer {...keywordFieldRendererProps} />;
      }
      case 'integer': {
        const integerField = field as IIntegerField;

        const integerFieldRendererProps: IIntegerFieldRenderer = {
          ...fieldProps,
          min: integerField.min,
          max: integerField.max,
          value: fieldProps.value as number,
        };

        const IntegerFieldRenderer = renderers.integerField;
        return <IntegerFieldRenderer {...integerFieldRendererProps} />;
      }
      case 'estimate': {
        const estimateFieldRendererProps: IEstimateFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as number,
        };

        const EstimateFieldRenderer = renderers.estimateField;
        return <EstimateFieldRenderer {...estimateFieldRendererProps} />;
      }
      case 'date': {
        const dateFieldRendererProps: IDateFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as string,
        };

        const DateFieldRenderer = renderers.dateField;
        return <DateFieldRenderer {...dateFieldRendererProps} />;
      }
      case 'boolean': {
        const booleanFieldRendererProps: IBooleanFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as boolean,
        };

        const BooleanFieldRenderer = renderers.booleanField;
        return <BooleanFieldRenderer {...booleanFieldRendererProps} />;
      }
      case 'percent': {
        const percentFieldRendererProps: IPercentFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as number,
        };

        const PercentFieldRenderer = renderers.percentField;
        return <PercentFieldRenderer {...percentFieldRendererProps} />;
      }
      case 'money': {
        const moneyFieldRendererProps: IMoneyFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as number,
        };

        const MoneyFieldRenderer = renderers.moneyField;
        return <MoneyFieldRenderer {...moneyFieldRendererProps} />;
      }
      case 'foreignKey': {
        const ForeignKeyFieldRenderer = renderers.foreignKeyField;
        let options: ISelectableOption[];

        const foreignKeyField = field as IForeignKeyField;

        const {
          struct: referenceStruct,
          labelField,
        } = foreignKeyField.reference;

        const keyField = InternalSchemaHelper.getKeyFields(
          schema,
          referenceStruct,
        )[0];

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
        const {
          reference,
          minInstances,
          maxInstances,
        } = field as ILinkedStructField;
        const { hints } = fieldReference as ILinkedStructFieldReference;
        const isTable = hints.layout === 'table';
        const blockName = hints.block || reference.block;
        const block = InternalSchemaHelper.getBlock(
          schema,
          reference.struct,
          blockName,
        );

        const LinkedStructFieldRenderer = isTable
          ? renderers.tableLinkedStructField
          : renderers.inlineLinkedStructField;

        let values = [];

        const busyValues = {};
        const disabledValues = {};
        const deletedValues = {};
        let deletedCount = 0;

        if (Array.isArray(fieldProps.value)) {
          values = fieldProps.value as object[];
        }

        const renderChildField = (index: number, childFieldName: string) => {
          const itemPath: string = `${fieldPath}.${index}.${childFieldName}`;
          const rendererId = `${fieldProps.formId}.${itemPath}`;

          const childField = InternalSchemaHelper.getField(
            schema,
            struct,
            childFieldName,
          );

          if (!childField) {
            Logger.warning('Child field does not exist');
            return null;
          }

          return (
            <FieldHostRendererConnect
              formId={fieldProps.formId}
              rendererId={rendererId}
              struct={struct}
              fieldPath={itemPath}
              parentPath={fieldPath}
              fieldReference={{
                field: childField.name,
                condition: () => true,
                hints: childField.hints,
              }}
            />
          );
        };

        if (!isTable && values.length < minInstances) {
          const startingIndex = values.length;
          const itemsToCreate = minInstances - values.length;

          this.onAdd(startingIndex, itemsToCreate, false);
        } else if (isTable) {
          const mappedValue: any[][] = [];

          values.forEach((value, index) => {
            mappedValue.push(
              block.fields.map(({ field: blockField }) => value[blockField]),
            );

            busyValues[index] = this.isBusy(`${fieldPath}.${index}`);
            disabledValues[index] = this.isDisabled();
            deletedValues[index] = this.isDeleted(
              reference.struct,
              getValueForPath(formValue, `${fieldPath}.${index}`),
            );

            if (deletedValues[index]) {
              deletedCount++;
            }
          });

          const tableLinkedStructFieldProps: ITableLinkedStructFieldRenderer = {
            ...fieldProps,
            minInstances,
            maxInstances,
            canAdd: this.canAdd,
            canRemove: this.canRemove,
            headers: block.fields.map((x) => {
              const blockField = InternalSchemaHelper.getField(
                schema,
                reference.struct,
                x.field,
              );

              return blockField.label.short;
            }),
            onAdd: (value: object = undefined, navigate: boolean = true) => {
              this.onAdd(
                (mappedValue && mappedValue.length) || 0,
                1,
                navigate,
                [value],
              );
            },
            onEdit: this.onEdit,
            onRemove: this.onRemove,
            busyValues,
            disabledValues,
            deletedValues,
            value: mappedValue,
            valueErrorIndicators: childErrors,
            renderChildField,
            counts: {
              total: values.length,
              deleted: deletedCount,
              visible: values.length - deletedCount,
            },
          };

          const TableLinkedStructFieldRenderer = LinkedStructFieldRenderer as preact.FunctionalComponent<
            ITableLinkedStructFieldRenderer
          >;

          return (
            <TableLinkedStructFieldRenderer {...tableLinkedStructFieldProps} />
          );
        }

        const items = values.map((_, index) => {
          const itemPath = `${fieldPath}.${index}`;

          busyValues[index] = this.isBusy(itemPath);
          disabledValues[index] = this.isDisabled();
          deletedValues[index] = this.isDeleted(
            reference.struct,
            getValueForPath(formValue, `${fieldPath}.${index}`),
          );

          if (deletedValues[index]) {
            deletedCount++;
          }

          return (
            <BlockHostRenderer
              key={itemPath}
              struct={reference.struct}
              block={block.name}
              path={itemPath}
            />
          );
        });

        const inlineLinkedStructFieldProps: IInlineLinkedStructFieldRenderer = {
          ...fieldProps,
          canAdd: this.canAdd,
          canRemove: this.canRemove,
          onAdd: (value: object = undefined) => {
            this.onAdd((values && values.length) || 0, 1, false, [value]);
          },
          onRemove: this.onRemove,
          busyRenderedItems: busyValues,
          disabledRenderedItems: disabledValues,
          deletedRenderedItems: deletedValues,
          renderedItems: items,
          renderChildField,
          counts: {
            total: values.length,
            deleted: deletedCount,
            visible: values.length - deletedCount,
          },
        };

        const InlineLinkedStructFieldRenderer = LinkedStructFieldRenderer as preact.FunctionalComponent<
          IInlineLinkedStructFieldRenderer
        >;

        return (
          <InlineLinkedStructFieldRenderer {...inlineLinkedStructFieldProps} />
        );
      }
      case 'list': {
        const {
          multiSelect,
          options: listOptions,
          dynamicOptions,
          hints: { layout },
        } = field as IListField;

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

        const options = listOptions.map(
          (option) =>
            ({
              // TODO: Label should change depending on displayed size
              label: option.label.medium,
              value: option.value,
              selected: value.findIndex((x: number) => x === option.value) >= 0,
            } as ISelectableOption),
        );

        if (
          layout === 'select' &&
          !multiSelect &&
          typeof fieldProps.value === 'undefined'
        ) {
          options.unshift({
            label: '',
            value: '',
            selected: false,
          });
        }

        const selectListFieldProps: ISelectListFieldRenderer = {
          ...fieldProps,
          options,
          dynamicOptions,
        };

        return <ListFieldRenderer {...selectListFieldProps} />;
      }
      case 'derived': {
        const derivedFieldRendererProps: IDerivedFieldRenderer = {
          ...fieldProps,
          value: fieldProps.value as string,
        };

        const DerivedFieldRenderer = renderers.derivedField;
        return <DerivedFieldRenderer {...derivedFieldRendererProps} />;
      }
      default: {
        Logger.error(`Field type ${field.type} is not supported.`);
        return null;
      }
    }
  }
}

const FieldHostRendererWrapper: FunctionalComponent<IFieldHostRendererProps> = (
  props,
) => {
  const { push } = useContext(NavContext);

  return <FieldHostRenderer {...props} push={push} />;
};

export default FieldHostRendererWrapper;
