import { h, Component } from 'preact';
import Form from '@de-re-crud/forms/form';
import { FormSubmissionCallback } from '@de-re-crud/forms/form/form.props';
import Bootstrap3RendererOptions from '../forms-renderer-bootstrap3/options';
import * as schemJson from './schema.json';
import './style.css';

export default class App extends Component {
  onSubmit = (value: any, cb: FormSubmissionCallback) => {
    cb();
  }

  render() {
    return (
      <div className="container">
        <div className="row">
          <div class="col-sm-6">
            <Form
              schema={schemJson}
              struct="field"
              rendererOptions={Bootstrap3RendererOptions}
              onSubmit={this.onSubmit}
            />
          </div>
        </div>
      </div>
    );
  }
}
