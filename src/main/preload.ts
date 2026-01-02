// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge } from 'electron';
import { myAPI } from './libs/myApi';
import { API } from './libs/api';
import { apiKey, myApiKey } from '../shared/contextBridgeKeys';

contextBridge.exposeInMainWorld(apiKey, API);
contextBridge.exposeInMainWorld(myApiKey, myAPI);
