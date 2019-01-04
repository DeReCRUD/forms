export const DEFAULT_FIELD_WIDTH = 12;
export type StampSize = 1 | 2 | 3 | 4 | 5 | 6;

export type FieldConditionFunc = (fieldParent: object, form: object) => boolean;
export type BlockConditionFunc = (form: object) => boolean;

export type SimpleFieldType =
  | 'text'
  | 'keyword'
  | 'integer'
  | 'estimate'
  | 'date'
  | 'boolean'
  | 'percent'
  | 'money';

export type FieldType =
  | SimpleFieldType
  | 'foreignKey'
  | 'linkedStruct'
  | 'list'
  | 'derived'
  | 'stamp';

export interface ILabel {
  short: string;
  medium: string;
  long: string;
}

export interface IStruct {
  name: string;
  label?: ILabel;
  collectionLabel?: ILabel;
  fields: IField[];
  blocks: IBlock[];
}

export type SimpleFieldValue = string | number | boolean;
export type ComplexFieldValue = object | object[];

export type FieldValue = SimpleFieldValue | ComplexFieldValue;

export interface IField {
  struct: string;
  name: string;
  label: ILabel;
  keyField: boolean;
  type: FieldType;
  required: boolean;
  unique: boolean;
  help?: string;
  initialValue?: FieldValue;
  missingValue?: FieldValue;
  placeholder?: string;
  hints: {
    width: number;
  };
  customValidators: string[];
}

export interface ITextField extends IField {
  type: 'text';
  initialValue?: string;
  missingValue?: string;
  minLength?: number;
  maxLength?: number;
}

export interface IIntegerField extends IField {
  type: 'integer';
  initialValue?: number;
  missingValue?: number;
  min?: number;
  max?: number;
}

export type ListValue = string | number;

export interface IListField extends IField {
  type: 'list';
  initialValue?: ListValue | ListValue[];
  missingValue?: ListValue | ListValue[];
  multiSelect: boolean;
  options: IOption[];
  dynamicOptions: boolean;
  hints: {
    width: number;
    layout: 'select' | 'radio';
  };
}

export interface IOption {
  label: string;
  value: ListValue;
}

export type ReferenceValue = ListValue | object;

export interface IStructReference {
  struct: IStruct;
  block: IBlock;
}

export interface IReferenceField extends IField {
  type: 'linkedStruct' | 'foreignKey';
  initialValue?: ReferenceValue | ReferenceValue[];
  missingValue?: ReferenceValue | ReferenceValue[];
  reference: IStructReference;
}

export interface ILinkedStructField extends IReferenceField {
  type: 'linkedStruct';
  initialValue?: object[];
  missingValue?: object[];
  minInstances: number;
  maxInstances?: number;
}

export interface IForeignKeyField extends IReferenceField {
  type: 'foreignKey';
  initialValue?: ListValue;
  missingValue?: ListValue;
  reference: IStructReference & {
    labelField: IField;
  };
}

export interface IBlock {
  struct: string;
  name: string;
  label?: ILabel;
  condition: BlockConditionFunc;
  items: Array<
    IBlockReference | IFieldReference | ILinkedStructFieldReference | IStamp
  >;
  fields: Array<IFieldReference | ILinkedStructFieldReference>;
  hints: {
    layout: 'vertical' | 'horizontal';
  };
}

export interface IBlockReference {
  block: IBlock;
}

export interface IFieldReference {
  field: IField;
  condition: FieldConditionFunc;
  hints: {
    width?: number;
  };
}

export interface IStamp {
  text: string;
  size: StampSize;
  blockInstance: number;
  condition: FieldConditionFunc;
}

export interface ILinkedStructFieldReference extends IFieldReference {
  hints: {
    width?: number;
    layout: 'inline' | 'table';
    block?: IBlock;
  };
}

export interface ISchema {
  raw: any;
  structs: IStruct[];
  customValidators: ICustomValidator[];
}

export interface ICustomValidator {
  name: string;
  pattern: RegExp;
  message: string;
  negate: boolean;
}
