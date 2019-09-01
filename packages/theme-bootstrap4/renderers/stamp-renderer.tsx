import { h } from '@de-re-crud/ui';
import { IStampRenderer } from '@de-re-crud/ui/renderers';

const Bootstrap4StampRenderer = ({ text, size }: IStampRenderer) => {
  const HeaderComponent: any = `h${size}`;

  return (
    <HeaderComponent className="bootstrap4-stamp-renderer">
      {text}
    </HeaderComponent>
  );
};

export default Bootstrap4StampRenderer;
