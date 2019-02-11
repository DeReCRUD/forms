import { connect } from 'redux-zero/preact';
import { ComponentConstructor } from '../../models/constructors';
import { IStoreState } from '../../store';
import BlockHostRenderer from './block-host-renderer.component';
import {
  IBlockHostRendererConnectProps,
  IBlockHostRendererProps,
} from './block-host-renderer.props';

const mapToProps = ({
  schema,
  formId,
  value,
  renderers,
}: IStoreState): Partial<IBlockHostRendererProps> => {
  return {
    schema,
    formId,
    formValue: value,
    renderers,
  };
};

export default connect(mapToProps)(BlockHostRenderer) as ComponentConstructor<
  IBlockHostRendererConnectProps
>;
