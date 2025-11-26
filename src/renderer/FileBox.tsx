import { useContext, useEffect, useState } from 'react';
import {
  SubscribedHomElements,
  HomElement,
  UITreeScope,
} from '@ar-project/host-object-model';
import { HomContext } from './context/HomContext';
import fileDescriptor from '../../descriptor/Filecontext.json';
import { FileInfoBox } from './components/FileInfoBox';

export type BoundingInfo = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const getFileListBoundingInfo = (fileList: HomElement[]): BoundingInfo[] => {
  if (!fileList || fileList.length === 0) {
    return [];
  }
  const boundingBoxes: BoundingInfo[] = [];
  // eslint-disable-next-line no-console
  console.log('fileList', fileList);
  fileList.forEach((file) => {
    const boundingBox = file.children[1]?.boundingBox;
    if (boundingBox) {
      const { x, y, width, height } = boundingBox;
      boundingBoxes.push({
        id: file.id,
        x,
        y,
        width,
        height,
      });
    }
  });
  return boundingBoxes;
};

export const FileBox = () => {
  const { subscribedHostInstance } = useContext(HomContext);
  const [fileContainer, setFileContainer] = useState<
    SubscribedHomElements | undefined
  >(undefined);
  const [fileInstance, setFileInstance] = useState<HomElement[] | undefined>(
    undefined,
  );

  const fileListBoundingInfo = getFileListBoundingInfo(fileInstance || []);

  // init File
  useEffect(() => {
    const initializeFile = async () => {
      const file = await subscribedHostInstance?.getElementsByDescriptor(
        fileDescriptor,
        UITreeScope.Subtree,
      );
      setFileContainer(file);
      const fileElements = file?.item(0).children;
      setFileInstance(fileElements);
    };
    if (subscribedHostInstance && !fileInstance) {
      initializeFile();
    }
  }, [subscribedHostInstance, fileInstance]);

  useEffect(() => {
    if (fileContainer) {
      fileContainer.onUIChanged((pre, cur) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] fileContainer.onUIChanged',
          pre,
          cur,
        );
        setFileInstance(cur[0].children);
      });

      fileContainer.onBoundingBoxChanged((ele) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] fileContainer.onBoundingBoxChanged',
        );
        setFileInstance(ele[0].children);
      });
    }
    return () => {
      if (fileContainer) {
        fileContainer.offUIChanged();
        fileContainer.offBoundingBoxChanged();
      }
    };
  }, [fileContainer]);

  return (
    <>
      {fileListBoundingInfo.map((boundingBox) => (
        <FileInfoBox boundingInfo={boundingBox} />
      ))}
    </>
  );
};

export default FileBox;
