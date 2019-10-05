import { storiesOf } from '@storybook/angular';
import { IFormSubmission } from '@de-re-crud/angular/public-api';
import { CustomRendererModule } from './app/custom-renderer.module';

storiesOf('Custom renderers', module)
  .add('text field', () => ({
    moduleMetadata: {
      imports: [CustomRendererModule],
    },
    template: `
    <drc-text-field-renderer-form (submitted)="onSubmit($event)"></drc-text-field-renderer-form>
  `,
    props: {
      onSubmit: (e: IFormSubmission) => {
        e.onComplete();
      },
    },
  }))
  .add('table linked struct', () => ({
    moduleMetadata: {
      imports: [CustomRendererModule],
    },
    template: `
    <drc-table-struct-renderer-form (submitted)="onSubmit($event)"></drc-table-struct-renderer-form>
  `,
    props: {
      onSubmit: (e: IFormSubmission) => {
        e.onComplete();
      },
    },
  }));