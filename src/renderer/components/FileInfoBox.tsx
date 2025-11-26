// renderer/components/FileInfoBox.tsx
import type { BoundingInfo } from '../FileBox';

type FileInfoBoxProps = {
  boundingInfo: BoundingInfo;
};

export const FileInfoBox = ({ boundingInfo }: FileInfoBoxProps) => {
  return (
    <>
      <div
        key={boundingInfo.id}
        style={{
          position: 'absolute',
          left: boundingInfo.x,
          top: boundingInfo.y,
          width: boundingInfo.width,
          height: boundingInfo.height,
          border: '1px solid red',
        }}
      />
      <span
        style={{
          position: 'absolute',
          left: boundingInfo.x + boundingInfo.width + 10,
          top: boundingInfo.y,
          color: 'white',
        }}
      >
        {`[${boundingInfo.x}, ${boundingInfo.y}, ${boundingInfo.width}, ${boundingInfo.height}]`}
      </span>
    </>
  );
};

export default FileInfoBox;
