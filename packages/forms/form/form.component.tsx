import { h, Component } from 'preact';
import { IStruct } from '@de-re-crud/forms/models/schema';
import Logger from '@de-re-crud/forms/logger';
import combineCssClasses from '@de-re-crud/forms/utils/combine-css-classes';
import BlockHostRenderer from '@de-re-crud/forms/renderer-hosts/block-host-renderer';
import shallowCompare from '@de-re-crud/forms/utils/shallow-compare';
import { FormProps } from '@de-re-crud/forms/form/form.props';

export interface FormState {
  structs: IStruct[];
}

export default class Form extends Component<FormProps, FormState> {
  shouldComponentUpdate(nextProps: FormProps, nextState: FormState) {
    return shallowCompare(this, nextProps, nextState);
  }

  onSubmit = () => {
    this.props.submitForm();
  };

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
    submitting
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
      Logger.error(`No blocks defined for struct '${visibleStruct}'.`);
      return null;
    }

    let blockReference = structReference.blocks.find(
      x => x.name === visibleBlock
    );
    if (!blockReference) {
      Logger.warning(
        `No block specified and the 'default' block is not defined. Defalting to first defined block.`
      );

      blockReference = structReference.blocks[0];
    }

    const ButtonRenderer = rendererOptions.components.button;
    const path = navStack.length
      ? navStack[navStack.length - 1].path
      : null;

    return (
      <form className={combineCssClasses(...classNames)}>
        <BlockHostRenderer struct={visibleStruct} block={blockReference} path={path} />
        {!navStack.length ? (
          <ButtonRenderer
            text="Submit"
            onClick={this.onSubmit}
            disabled={submitting}
          />
        ) : (
          <ButtonRenderer text="Back" onClick={this.onBack} />
        )}
      </form>
    );
  }
}
