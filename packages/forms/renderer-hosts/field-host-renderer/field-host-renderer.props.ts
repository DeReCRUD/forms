import { RendererOptions } from '../../models/renderer-options';
import { IFieldReference, IField } from '../../models/schema';
import { ChangeArrayActionType } from './field-host-renderer.actions';
import { NavState } from '../../store';

export type FieldHostRendererConnectProps = {
  fieldReference: IFieldReference;
  rendererOptions: RendererOptions;
};

export type FieldHostRendererProps = FieldHostRendererConnectProps & {
  fieldPath: string;
  parentPath?: string;
  formValue: object;
  touched: boolean;
  errors: string[];
  touchField: (
    field: IField,
    fieldPath: string
  ) => void;
  changeValue: (
    field: IField,
    fieldPath: string,
    value: any
  ) => void;
  changeArrayValue: (
    field: IField,
    fieldPath: string,
    itemPath: string,
    type: ChangeArrayActionType
  ) => void;
  push: (state: NavState) => void;
  pop: () => void;
};
