import { h } from '../../h';

export default function NoopRenderer() {
  return (
    <div className="de-re-crud-noop-renderer" style={{ color: 'red' }}>
      No rendererer defined
    </div>
  );
}