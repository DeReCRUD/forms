import { ComponentConstructor, FunctionalComponent } from 'preact';
import {
  FieldContainerRendererProps,
  FieldRendererProps,
  TextFieldRendererProps,
  TableLinkedStructRendererProps,
  ListFieldRendererProps,
  ButtonRendererProps,
  InlinedLinkedStructRendererProps
} from '../models/renderers';

export interface RendererOptions {
  formClassName?: string;
  components: {
    button:
      | FunctionalComponent<ButtonRendererProps>
      | ComponentConstructor<ButtonRendererProps>;
    fieldContainer:
      | FunctionalComponent<FieldContainerRendererProps>
      | ComponentConstructor<FieldContainerRendererProps>;
    textField:
      | FunctionalComponent<TextFieldRendererProps>
      | ComponentConstructor<TextFieldRendererProps>;
    keywordField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    integerField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    estimateField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    dateField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    booleanField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    percentField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    moneyField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    foreignKeyField:
      | FunctionalComponent<ListFieldRendererProps>
      | ComponentConstructor<ListFieldRendererProps>;
    inlineLinkedStructField:
      | FunctionalComponent<InlinedLinkedStructRendererProps>
      | ComponentConstructor<InlinedLinkedStructRendererProps>;
    tableLinkedStructField:
      | FunctionalComponent<TableLinkedStructRendererProps>
      | ComponentConstructor<TableLinkedStructRendererProps>;
    listField:
      | FunctionalComponent<ListFieldRendererProps>
      | ComponentConstructor<ListFieldRendererProps>;
    derivedField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
    stampField:
      | FunctionalComponent<FieldRendererProps>
      | ComponentConstructor<FieldRendererProps>;
  };
}
