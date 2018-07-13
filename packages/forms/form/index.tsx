import { h } from 'preact';
import { Provider } from 'redux-zero/preact';
import { createStore } from '../store';
import { FormConnectProps } from './form.props';
import FormConnect from './form.connect';

const FormStateProvider = ({schema, errors, value, ...otherProps}: FormConnectProps) => (
  <Provider store={createStore(schema, errors, value)}>
    <FormConnect schema={schema} {...otherProps}  />
  </Provider>
);

export default FormStateProvider;