import {
  createContext,
  useEffect,
  useMemo,
  useCallback,
  useState,
  ReactNode,
} from 'react';
import {
  Venom,
  SubscribedHost,
  UITreeScope,
  HomElement,
  SubscribedHomElements,
  BoundingBox,
} from '@ar-project/host-object-model';
import { getVenom, getSubscribedHost } from '../Hom';
import { getFileName } from '../utils/getFileName';
import breadCrumbDescriptor from '../../../descriptor/Yinfo.json';
import EditorAreaDescriptor from '../../../descriptor/XandHeight.json';

interface IHomContextData {
  venomInstance: Venom | null;
  subscribedHostInstance: SubscribedHost | null;
  setSubscribedHost: () => Promise<void>;
  isOnTop: boolean;
  breadCrumbContainerInstance: SubscribedHomElements | undefined;
  breadCrumbBoundingBox: BoundingBox | null | undefined;
  currentFileName: string | null;
  editorAreaBoundingBox: BoundingBox | null | undefined;
}

export const HomContext = createContext<IHomContextData>({
  venomInstance: null,
  subscribedHostInstance: null,
  setSubscribedHost: async () => {},
  isOnTop: true,
  breadCrumbContainerInstance: undefined,
  breadCrumbBoundingBox: undefined,
  currentFileName: null,
  editorAreaBoundingBox: undefined,
});

export const HomProvider = ({ children }: { children: ReactNode }) => {
  const [venomInstance, setVenomInstance] = useState<Venom | null>(null);
  const [subscribedHostInstance, setSubscribedHostInstance] =
    useState<SubscribedHost | null>(null);

  useEffect(() => {
    const initializeVenom = async () => {
      const venom = await getVenom();
      setVenomInstance(venom);
    };
    initializeVenom();
  }, []);

  const setSubscribedHost = useCallback(async () => {
    const host = await getSubscribedHost();
    setSubscribedHostInstance(host);
  }, []);

  // ---------- Subscribed Host Part ----------
  const [isOnTop, setIsOnTop] = useState<boolean>(true);
  useEffect(() => {
    if (!subscribedHostInstance) {
      setIsOnTop(true);
      return;
    }
    subscribedHostInstance.onIsOnTopChanged((subscribeHost) => {
      setIsOnTop(subscribeHost.isOnTop);
    });
  }, [subscribedHostInstance]);

  useEffect(() => {
    if (isOnTop) {
      window.api.event.ShowWindow();
    } else {
      window.api.event.HideWindow();
    }
  }, [isOnTop]);

  // ---------- Element Part ----------

  // [BreadCrumb]
  const [breadCrumbContainerInstance, setBreadCrumbContainerInstance] =
    useState<SubscribedHomElements | undefined>(undefined);
  const [breadCrumbs, setBreadCrumbs] = useState<HomElement[] | null>(null);
  const [currentFileName, setcurrentFileName] = useState<string | null>(null);
  const [breadCrumbBoundingBox, setBreadCrumbBoundingBox] = useState<
    BoundingBox | null | undefined
  >(undefined);
  // init
  useEffect(() => {
    const setBreadCrumbInfo = async () => {
      const breadCrumbContainer =
        await subscribedHostInstance?.getElementsByDescriptor(
          breadCrumbDescriptor,
          UITreeScope.Subtree,
        );
      setBreadCrumbContainerInstance(breadCrumbContainer);
      const breadCrumbElements = breadCrumbContainer?.item(0)?.children; // TODO: Error handle
      setBreadCrumbs(breadCrumbElements || []);
      setBreadCrumbBoundingBox(breadCrumbContainer?.item(0)?.boundingBox);
    };
    if (subscribedHostInstance && !breadCrumbs) {
      setBreadCrumbInfo();
    }
  }, [subscribedHostInstance, breadCrumbs]);

  // handle UI Change (when selected file change)
  useEffect(() => {
    breadCrumbContainerInstance?.onUIChanged((pre, cur) => {
      const breadCrumbElements = cur[0].children;
      setBreadCrumbs(breadCrumbElements || []);
    });
    return () => {
      breadCrumbContainerInstance?.offUIChanged();
    };
  }, [breadCrumbContainerInstance]);

  // update filePath when breadCrumbs change
  useEffect(() => {
    if (breadCrumbs) {
      const { fileName } = getFileName(breadCrumbs);
      setcurrentFileName(fileName);
    }
  }, [breadCrumbs]);

  // handle BoundingBox Change
  useEffect(() => {
    breadCrumbContainerInstance?.onBoundingBoxChanged((e) => {
      setBreadCrumbBoundingBox(e[0].boundingBox);
      // console.log('BreadCrumb Bounding Box Changed:', e[0].boundingBox);
    });
    return () => {
      breadCrumbContainerInstance?.offBoundingBoxChanged();
    };
  }, [breadCrumbContainerInstance]);

  // [EditArea]
  const [editorAreaContainerInstance, setEditorAreaContainerInstance] =
    useState<SubscribedHomElements | undefined>(undefined);
  const [editorAreaBoundingBox, setEditorAreaBoundingBox] = useState<
    BoundingBox | null | undefined
  >(undefined);
  // init
  useEffect(() => {
    const setEditorAreaInfo = async () => {
      const editAreaContainer =
        await subscribedHostInstance?.getElementsByDescriptor(
          EditorAreaDescriptor,
          UITreeScope.Subtree,
        );
      setEditorAreaContainerInstance(editAreaContainer);
      setEditorAreaBoundingBox(editAreaContainer?.item(0).boundingBox);
    };
    if (subscribedHostInstance && !editorAreaContainerInstance) {
      setEditorAreaInfo();
    }
  }, [subscribedHostInstance, editorAreaContainerInstance]);

  // handle BoundingBox Change
  useEffect(() => {
    editorAreaContainerInstance?.onBoundingBoxChanged((e) => {
      setEditorAreaBoundingBox(e[0].boundingBox);
      // console.log('Editor Area Bounding Box Changed:', e[0].boundingBox);
    });
    return () => {
      editorAreaContainerInstance?.offBoundingBoxChanged();
    };
  }, [editorAreaContainerInstance]);

  // ---------- Context Data ----------

  const homContextData: IHomContextData = useMemo(() => {
    return {
      venomInstance,
      subscribedHostInstance,
      setSubscribedHost,
      isOnTop,
      breadCrumbContainerInstance,
      breadCrumbBoundingBox,
      currentFileName,
      editorAreaBoundingBox,
    };
  }, [
    venomInstance,
    subscribedHostInstance,
    setSubscribedHost,
    isOnTop,
    breadCrumbContainerInstance,
    breadCrumbBoundingBox,
    currentFileName,
    editorAreaBoundingBox,
  ]);

  return (
    <HomContext.Provider value={homContextData}>{children}</HomContext.Provider>
  );
};
