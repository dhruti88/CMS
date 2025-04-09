import { useState, useEffect, useMemo , useCallback } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

const layoutDocsManager = (() => {
  const activeDocuments = new Map();
  const inactivityTimers = new Map();
  const INACTIVITY_TIMEOUT = 60000; // 1 minute in milliseconds

  return {
    getOrCreateDoc: (layoutId) => {
      if (!activeDocuments.has(layoutId)) {
        console.log(`Creating new Yjs document for layout: ${layoutId}`);
        const ydoc = new Y.Doc();
        const wsProvider = new WebsocketProvider(
          'ws://localhost:1234', 
          `workbench-room-${layoutId}`, 
          ydoc
        );
        
        activeDocuments.set(layoutId, { ydoc, wsProvider, activeUsers: new Set(), lastActivity: Date.now() });
      } else {
        // Update last activity time
        const docInfo = activeDocuments.get(layoutId);
        docInfo.lastActivity = Date.now();
        
        // Clear any existing inactivity timer if users are active
        if (inactivityTimers.has(layoutId)) {
          clearTimeout(inactivityTimers.get(layoutId));
          inactivityTimers.delete(layoutId);
        }
      }
      
      return activeDocuments.get(layoutId);
    },
    
    setupInactivityCheck: (layoutId) => {
      const docInfo = activeDocuments.get(layoutId);
      if (!docInfo) return;
      
      // Only set up inactivity timer if there are no active users
      if (docInfo.activeUsers.size === 0) {
        // Clear any existing timer
        if (inactivityTimers.has(layoutId)) {
          clearTimeout(inactivityTimers.get(layoutId));
        }
        
        // Set new timer
        const timer = setTimeout(() => {
          console.log(`Cleaning up inactive layout: ${layoutId}`);
          if (docInfo.activeUsers.size === 0) {
            // Disconnect the provider
            docInfo.wsProvider.disconnect();
            // Destroy the document
            docInfo.ydoc.destroy();
            // Remove from active documents
            activeDocuments.delete(layoutId);
          }
          inactivityTimers.delete(layoutId);
        }, INACTIVITY_TIMEOUT);
        
        inactivityTimers.set(layoutId, timer);
      }
    },
    
    cleanupDoc: (layoutId) => {
      if (activeDocuments.has(layoutId)) {
        const docInfo = activeDocuments.get(layoutId);
        docInfo.wsProvider.disconnect();
        docInfo.ydoc.destroy();
        activeDocuments.delete(layoutId);
        
        if (inactivityTimers.has(layoutId)) {
          clearTimeout(inactivityTimers.get(layoutId));
          inactivityTimers.delete(layoutId);
        }
      }
    }
  };
})();


const useYjsManager = ({ layoutid, cellWidth, cellHeight, gutterWidth, userID, userProfilePic, setSections }) => {
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeEditors, setActiveEditors] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const userId = userID;

  const layoutId = layoutid;
  console.log("Initialized useYjsManager with layoutId:", layoutId);

  // Scoped layoutDocsManager (isolated per hook instance)
  const layoutDocsManager = useMemo(() => {
    const activeDocuments = new Map();
    const inactivityTimers = new Map();
    const INACTIVITY_TIMEOUT = 60000;

    return {
      getOrCreateDoc: (layoutId) => {
        if (!activeDocuments.has(layoutId)) {
          console.log(`Creating new Yjs document for layout: ${layoutId}`);
          const ydoc = new Y.Doc();
          const wsProvider = new WebsocketProvider(
            'ws://localhost:1234',
            `workbench-room-${layoutId}`,
            ydoc
          );
          activeDocuments.set(layoutId, {
            ydoc,
            wsProvider,
            activeUsers: new Set(),
            lastActivity: Date.now()
          });
        }
        return activeDocuments.get(layoutId);
      },

      setupInactivityCheck: (layoutId) => {
        const docInfo = activeDocuments.get(layoutId);
        if (!docInfo) return;

        if (docInfo.activeUsers.size === 0) {
          if (inactivityTimers.has(layoutId)) clearTimeout(inactivityTimers.get(layoutId));

          const timer = setTimeout(() => {
            console.log(`Cleaning up inactive layout: ${layoutId}`);
            docInfo.wsProvider.disconnect();
            docInfo.ydoc.destroy();
            activeDocuments.delete(layoutId);
            inactivityTimers.delete(layoutId);
          }, INACTIVITY_TIMEOUT);

          inactivityTimers.set(layoutId, timer);
        }
      },

      cleanupDoc: (layoutId) => {
        if (activeDocuments.has(layoutId)) {
          const docInfo = activeDocuments.get(layoutId);
          docInfo.wsProvider.disconnect();
          docInfo.ydoc.destroy();
          activeDocuments.delete(layoutId);
          if (inactivityTimers.has(layoutId)) {
            clearTimeout(inactivityTimers.get(layoutId));
            inactivityTimers.delete(layoutId);
          }
        }
      }
    };
  }, []);

  // Get or create document + provider
  const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutId), [layoutDocsManager, layoutId]);
  const { ydoc, wsProvider } = docInfo;

  const ySectionsMap = useMemo(() => ydoc.getMap(`sections-${layoutId}`), [ydoc, layoutId]);

  // Initialize from Yjs state on sync
  useEffect(() => {
    const handleSync = (isSynced) => {
      if (isSynced && !isInitialized) {
        const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
          try {
            return typeof value === 'string' ? JSON.parse(value) : value;
          } catch (error) {
            console.error('Error parsing section:', error);
            return null;
          }
        }).filter(Boolean);

        if (existingSections.length > 0) {
          setSections(existingSections);
          console.log('Initial sections loaded:', existingSections);
        }
        setIsInitialized(true);
      }
    };

    if (wsProvider.synced && !isInitialized) handleSync(true);

    wsProvider.on('sync', handleSync);
    wsProvider.on('connection-error', (error) => console.error('WebSocket connection error:', error));

    return () => wsProvider.off('sync', handleSync);
  }, [ySectionsMap, wsProvider, isInitialized]);

  // Sync to Yjs when local changes occur
  const syncToYjs = useCallback((updatedSections) => {
    try {
      setIsLocalUpdate(true);
      ydoc.transact(() => {
        ySectionsMap.clear();
        updatedSections.forEach(section => {
          const sectionWithPos = {
            ...section,
            x: section.gridX * (cellWidth + gutterWidth),
            y: section.gridY * cellHeight,
            items: section.items?.map(item => ({
              ...item,
              x: item.gridX * (cellWidth + gutterWidth),
              y: item.gridY * cellHeight
            })) || []
          };
          ySectionsMap.set(section.id, JSON.stringify(sectionWithPos));
        });
      });
    } catch (error) {
      console.error('Error syncing to Yjs:', error);
    } finally {
      setIsLocalUpdate(false);
    }
  }, [ydoc, ySectionsMap, cellWidth, cellHeight, gutterWidth]);

  // Awareness for multi-user tracking
  useEffect(() => {
    if (!wsProvider) return;

    const awareness = wsProvider.awareness;

    awareness.setLocalState({
      user: {
        id: userID,
        profilePic: userProfilePic,
        name: userID,
        layoutId
      }
    });

    docInfo.activeUsers.add(userID);

    const handleChange = () => {
      const states = Array.from(awareness.getStates());

      const uniqueEditorIds = new Set();
      const editors = states
        .map(([_, state]) => state.user)
        .filter(user => user?.layoutId === layoutId)
        .filter(user => {
          if (uniqueEditorIds.has(user.id)) return false;
          uniqueEditorIds.add(user.id);
          return true;
        });

      setActiveEditors(editors);
      setActiveUsersCount(editors.length);
      docInfo.activeUsers = new Set(editors.map(user => user.id));

      if (editors.length === 0) {
        layoutDocsManager.setupInactivityCheck(layoutId);
      }
    };

    awareness.on('change', handleChange);
    handleChange();

    return () => {
      awareness.off('change', handleChange);
      docInfo.activeUsers.delete(userID);
      if (docInfo.activeUsers.size === 0) {
        layoutDocsManager.setupInactivityCheck(layoutId);
      }
    };
  }, [wsProvider, userID, userProfilePic, layoutId, docInfo]);

  // Observe remote updates from Yjs
  useEffect(() => {
    const handleYjsUpdate = () => {
      if (isLocalUpdate) return;

      const remoteSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
        try {
          const section = typeof value === 'string' ? JSON.parse(value) : value;
          return {
            ...section,
            items: section.items?.map(item => ({
              ...item,
              x: item.gridX * (cellWidth + gutterWidth),
              y: item.gridY * cellHeight
            })) || []
          };
        } catch (error) {
          console.error('Error parsing remote section:', error);
          return null;
        }
      }).filter(Boolean);

      if (remoteSections.length > 0) setSections(remoteSections);
    };

    ySectionsMap.observe(handleYjsUpdate);
    return () => ySectionsMap.unobserve(handleYjsUpdate);
  }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth]);

  // External setter that syncs to Yjs
  const updateSectionsAndSync = useCallback((newSections) => {
    setSections(newSections);
    syncToYjs(newSections);
  }, [syncToYjs]);

  // Final cleanup on unmount
  useEffect(() => {
    return () => {
      docInfo.wsProvider.destroy();
      ydoc.destroy();
      layoutDocsManager.cleanupDoc(layoutId);
    };
  }, [layoutId, userID, docInfo]);

  return {
    activeEditors,
    activeUsersCount,
    updateSectionsAndSync,
    syncToYjs,
    isLocalUpdate,
    userId,
  };
};

export default useYjsManager;