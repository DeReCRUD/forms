import { h, ISelectListFieldRenderer } from '@de-re-crud/ui';
import Bootstrap4SelectRenderer from './select-renderer';

const Bootstrap4SelectListFieldRenderer = (props: ISelectListFieldRenderer) => (
  <div className="bootstrap4-select-list-renderer">
    <Bootstrap4SelectRenderer {...props} />
  </div>
);

export default Bootstrap4SelectListFieldRenderer;
