import { useContext, useEffect, useState } from 'react';
import {
  SubscribedHomElements,
  HomElement,
  UITreeScope,
} from '@ar-project/host-object-model';
import { HomContext } from './context/HomContext';
import XandHeightDescriptor from '../../descriptor/XandHeight.json';
import YinfoDescriptor from '../../descriptor/Yinfo.json';
import { PrintBox } from './components/PrintBox';

import { useLineNumberDetector } from './hooks/useLineNumberDetector';
import { CommentOverlay } from './components/CommentOverlay';

export type BoundingInfo = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

const getMergedBoundingInfo = (
  xElement: HomElement | undefined,
  yElement: HomElement | undefined,
): BoundingInfo | null => {
  if (
    !xElement ||
    !xElement.boundingBox ||
    !yElement ||
    !yElement.boundingBox
  ) {
    return null;
  }
  const { x, height } = xElement.boundingBox;

  const width = 50;
  const y = yElement.boundingBox.bottom;

  return {
    id: `${xElement.id}-${yElement.id}`,
    x: x + 15,
    y,
    width,
    height: height - 80,
  };
};

export const LineBox = () => {
  const { subscribedHostInstance } = useContext(HomContext);

  const [xhContainer, setXhContainer] = useState<
    SubscribedHomElements | undefined
  >(undefined);
  const [xhInstance, setXhInstance] = useState<HomElement | undefined>(
    undefined,
  );

  const [yContainer, setYContainer] = useState<
    SubscribedHomElements | undefined
  >(undefined);
  const [yInstance, setYInstance] = useState<HomElement | undefined>(undefined);

  // 計算屬性：將兩個 Instance 的資料合併
  const mergedBoundingInfo = getMergedBoundingInfo(xhInstance, yInstance);

  // 2. 【新增】在這裡直接呼叫 Hook 取得 API 資料
  // 我們把 mergedBoundingInfo 傳給 Hook，讓它去截圖辨識
  const { results: detectedLines } = useLineNumberDetector({
    boundingBox: mergedBoundingInfo || undefined, // 如果是 null 轉 undefined
    enabled: !!mergedBoundingInfo,
  });

  // init File
  useEffect(() => {
    const initializeFile = async () => {
      // 抓取 X/Height 元件
      const xhFile = await subscribedHostInstance?.getElementsByDescriptor(
        XandHeightDescriptor,
        UITreeScope.Subtree,
      );
      setXhContainer(xhFile);
      const xhFileElement = xhFile?.item(0);
      setXhInstance(xhFileElement);

      // 抓取 Y元件
      const yFile = await subscribedHostInstance?.getElementsByDescriptor(
        YinfoDescriptor,
        UITreeScope.Subtree,
      );
      setYContainer(yFile);
      const yFileElement = yFile?.item(0);
      setYInstance(yFileElement);
    };
    if (subscribedHostInstance && !xhInstance && !yInstance) {
      initializeFile();
    }
  }, [subscribedHostInstance, xhInstance, yInstance]);

  // 監聽 X/Height 元件的變化
  useEffect(() => {
    if (xhContainer) {
      xhContainer.onUIChanged((pre, cur) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] xhContainer.onUIChanged',
          pre,
          cur,
        );
        setXhInstance(cur[0]);
      });
      xhContainer.onBoundingBoxChanged((ele) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] xhContainer.onBoundingBoxChanged',
        );
        setXhInstance(ele[0]);
      });
    }
    return () => {
      if (xhContainer) {
        xhContainer.offUIChanged();
        xhContainer.offBoundingBoxChanged();
      }
    };
  }, [xhContainer]);

  // 監聽 Y/Width 元件的變化
  useEffect(() => {
    if (yContainer) {
      yContainer.onUIChanged((pre, cur) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] yContainer.onUIChanged',
          pre,
          cur,
        );
        setYInstance(cur[0]);
      });
      yContainer.onBoundingBoxChanged((ele) => {
        // eslint-disable-next-line no-console
        console.log(
          '[Renderer Process - React] yContainer.onBoundingBoxChanged',
        );
        setYInstance(ele[0]);
      });
    }
    return () => {
      if (yContainer) {
        yContainer.offUIChanged();
        yContainer.offBoundingBoxChanged();
      }
    };
  }, [yContainer]);

  return (
    <>
      {mergedBoundingInfo && <PrintBox boundingInfo={mergedBoundingInfo} />}

      {/* 3. 【新增】將座標傳給 LineNumberDetector 進行辨識與繪製 */}
      {mergedBoundingInfo && (
        <CommentOverlay
          detectedLines={detectedLines}
          targetBoundingBox={mergedBoundingInfo}
        />
      )}
    </>
  );
};

export default LineBox;
