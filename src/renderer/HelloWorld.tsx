import React, { useContext, useEffect } from 'react';
import { HomContext } from './context/HomContext';
import { ToolBar } from './components/toolbar/ToolBar';
import { LineBox } from './LineBox';

export const HelloWorld = () => {
  const { venomInstance, setSubscribedHost, subscribedHostInstance } =
    useContext(HomContext);

  useEffect(() => {
    const initializeSubscribedHost = async () => {
      if (venomInstance && !subscribedHostInstance) {
        await setSubscribedHost();
      }
    };

    initializeSubscribedHost();
  }, [venomInstance, subscribedHostInstance, setSubscribedHost]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log('[Renderer Process - React] hom:', subscribedHostInstance);
    // eslint-disable-next-line no-console
    console.log(
      '[Renderer Process - React] hose.boundingBox',
      subscribedHostInstance?.boundingBox,
    );
  }, [subscribedHostInstance]);

  return (
    <>
      <LineBox />
      <ToolBar>
        <ToolBar.ActionButton
          label="Start"
          onClick={async () => {
            // eslint-disable-next-line no-console
            console.log('Start button clicked');
          }}
        />
        <ToolBar.ActionButton
          label="Stop"
          onClick={async () => {
            // eslint-disable-next-line no-console
            console.log('Stop button clicked');
          }}
        />
        <ToolBar.ActionButton
          label="Close"
          onClick={async () => {
            // eslint-disable-next-line no-console
            console.log('Settings button clicked');
            window.api.event.CloseWindow();
          }}
        />
      </ToolBar>
    </>
  );
};

export default HelloWorld;
