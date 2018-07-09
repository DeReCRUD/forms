import { h, Component } from 'preact';
import { IStruct } from '../models/schema';
import Logger from '../logger';
import combineCssClasses from '../utils/combine-css-classes';
import BlockHostRenderer from '../renderer-hosts/block-host-renderer';
import shallowCompare from '../utils/shallow-compare';
import { FormProps } from './form.props';

export interface FormState {
  structs: IStruct[];
}

export default class Form extends Component<FormProps, FormState> {
  shouldComponentUpdate(nextProps: FormProps, nextState: FormState) {
    return shallowCompare(this, nextProps, nextState);
  }

  onSubmit = () => {};

  onBack = () => {
    this.props.pop();
  };

  render({
    className,
    structs,
    struct,
    block,
    rendererOptions,
    navStack,
  }: FormProps) {
    let visibleBlock: string;
    let visibleStruct: string;

    if (navStack.length) {
      const navState = navStack[navStack.length - 1];
      visibleStruct = navState.struct;
      visibleBlock = navState.block;
    } else {
      visibleStruct = struct;
      visibleBlock = block;
    }

    const blockName = visibleBlock || 'default';
    const structReference = structs.find(x => x.name === visibleStruct);

    const classNames = [
      'de-re-crud-form',
      className,
      rendererOptions.formClassName
    ];

    if (!structReference) {
      Logger.error(`Struct '${struct}' is not defined.`);
      return null;
    }

    if (!structReference.blocks.length) {
      Logger.error(`No blocks defined for struct '${struct}'.`);
      return null;
    }

    let blockReference = structReference.blocks.find(x => x.name === blockName);
    if (!blockReference) {
      Logger.warning(
        `No block specified and the 'default' block is not defined. Defalting to first defined block.`
      );

      blockReference = structReference.blocks[0];
    }

    const ButtonRenderer = rendererOptions.components.button;

    return (
      <form className={combineCssClasses(...classNames)}>
        <BlockHostRenderer
          struct={struct}
          block={blockReference}
          rendererOptions={rendererOptions}
        />
        {!navStack.length ? (
          <ButtonRenderer text="Submit" onClick={this.onSubmit} />
        ) : (
          <ButtonRenderer text="Cancel" onClick={this.onBack} />
        )}
      </form>
    );
  }
}