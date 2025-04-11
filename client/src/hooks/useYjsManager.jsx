import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

// Layout document manager singleton - keeps track of all active Yjs documents
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
        
        activeDocuments.set(layoutId, { 
          ydoc, 
          wsProvider, 
          activeUsers: new Set(), 
          lastActivity: Date.now() 
        });
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
    },

    // New method to handle user leaving a layout
    userLeaveLayout: (layoutId, userId) => {
      if (activeDocuments.has(layoutId)) {
        const docInfo = activeDocuments.get(layoutId);
        docInfo.activeUsers.delete(userId);
        
        // If no users remain, setup inactivity timer
        if (docInfo.activeUsers.size === 0) {
          layoutDocsManager.setupInactivityCheck(layoutId);
        }
      }
    }
  };
})();

const useYjsManager = ({  cellWidth, cellHeight, gutterWidth, userID, userProfilePic, setSections }) => {
  // State for local updates and initialization
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeEditors, setActiveEditors] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  // const layoutId=layoutid;
  // Track current layout ID using state so we can detect changes
  const [currentLayoutId, setCurrentLayoutId] = useState(
    localStorage.getItem('layoutid') || 'default-layout'
  );
  
  // References to current doc and provider for cleanup
  const docInfoRef = useRef(null);
  
  // Get document and provider for this specific layout - recreated when layoutId changes
  const docInfo = useMemo(() => {
    const info = layoutDocsManager.getOrCreateDoc(currentLayoutId);
    docInfoRef.current = info; // Store reference for cleanup
    return info;
  }, [currentLayoutId]);
  
  const { ydoc, wsProvider } = docInfo;
  
  // Get the shared map from Yjs
  // const ySectionsMap = useMemo(() => ydoc.getMap('sections'), [ydoc]);
  const ySectionsMap = useMemo(() => ydoc.getMap(`sections`), [ydoc]);

  // Watch for layout ID changes in localStorage
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'layoutid' && e.newValue !== currentLayoutId) {
        // Clean up the old layout connection
        if (docInfoRef.current) {
          docInfoRef.current.activeUsers.delete(userID);
          layoutDocsManager.setupInactivityCheck(currentLayoutId);
        }
        
        // Reset initialization state
        setIsInitialized(false);
        
        // Update layout ID state to trigger reconnection
        setCurrentLayoutId(e.newValue || 'default-layout');
        console.log(`Switching to layout: ${e.newValue || 'default-layout'}`);
      }
    };

    // Also listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);
    
    // Set up polling to check for direct localStorage changes in the same window
    const intervalId = setInterval(() => {
      const storedLayoutId = localStorage.getItem('layoutid') || 'default-layout';
      if (storedLayoutId !== currentLayoutId) {
        // Clean up the old layout connection
        if (docInfoRef.current) {
          docInfoRef.current.activeUsers.delete(userID);
          layoutDocsManager.setupInactivityCheck(currentLayoutId);
        }
        
        // Reset initialization state
        setIsInitialized(false);
        
        // Update layout ID state
        setCurrentLayoutId(storedLayoutId);
        console.log(`Switching to layout: ${storedLayoutId}`);
      }
    }, 1000); // Check every second

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, [currentLayoutId, userID]);

  // Initialize WebSocket provider with proper error handling
  useEffect(() => {
    const handleSync = (isSynced) => {
      try {
        if (isSynced && !isInitialized) {
          // Get initial data from Yjs
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
            console.log('Initial sections loaded for layout:', currentLayoutId, existingSections);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };
    
    // Check immediately if already synced
    if (wsProvider.synced && !isInitialized) {
      handleSync(true);
    }
    
    wsProvider.on('sync', handleSync);
    
    // Error handling
    wsProvider.on('connection-error', (error) => {
      console.error(`WebSocket connection error for layout ${currentLayoutId}:`, error);
    });

    return () => {
      wsProvider.off('sync', handleSync);
    };
  }, [ySectionsMap, wsProvider, isInitialized, currentLayoutId, setSections]);

  // Sync function to update Yjs when local changes occur
  const syncToYjs = useCallback((updatedSections) => {
    console.log(`Syncing to Yjs for layout ${currentLayoutId}:`, updatedSections);
    try {
      setIsLocalUpdate(true);
      ydoc.transact(() => {
        // Clear existing data
        ySectionsMap.clear();
        
        // Add updated sections
        updatedSections.forEach(section => {
          const sectionWithPositions = {
            ...section,
            x: section.gridX * (cellWidth + gutterWidth),
            y: section.gridY * cellHeight,
            items: section.items?.map(item => ({
              ...item,
              x: item.gridX * (cellWidth + gutterWidth),
              y: item.gridY * cellHeight
            })) || []
          };
          ySectionsMap.set(section.id, JSON.stringify(sectionWithPositions));
        });
      });
    } catch (error) {
      console.error('Error syncing to Yjs:', error);
    } finally {
      setIsLocalUpdate(false);
    }
  }, [ySectionsMap, cellWidth, cellHeight, gutterWidth, ydoc, currentLayoutId]);

  // Add awareness to Yjs - track users per layout
  useEffect(() => {
    if (!wsProvider) return;

    const awareness = wsProvider.awareness;

    // Set local user state
    awareness.setLocalState({
      user: {
        id: userID,
        profilePic: userProfilePic,
        name: userID,
        layoutId: currentLayoutId // Include layoutId to track which layout the user is editing
      }
    });

    // Add user to active users set
    docInfo.activeUsers.add(userID);

    // Handle awareness changes
    const handleChange = () => {
      const states = Array.from(awareness.getStates());
      
      // Filter only editors in this layout and remove duplicates by ID
      const uniqueEditorIds = new Set();
      const editors = states
        .map(([clientId, state]) => state.user)
        .filter(user => user && user.layoutId === currentLayoutId)
        .filter(user => {
          if (uniqueEditorIds.has(user.id)) {
            return false;
          }
          uniqueEditorIds.add(user.id);
          return true;
        });
      
      setActiveEditors(editors);
      setActiveUsersCount(editors.length);
      
      // Update active users count in the document info
      docInfo.activeUsers = new Set(editors.map(user => user.id));
    };

    awareness.on('change', handleChange);
    
    // Initial call to set up state
    handleChange();
    
    return () => {
      // Proper cleanup when effect is re-run or unmounted
      awareness.off('change', handleChange);
      layoutDocsManager.userLeaveLayout(currentLayoutId, userID);
    };
  }, [wsProvider, userID, userProfilePic, currentLayoutId, docInfo]);

  // Listen for remote changes
  useEffect(() => {
    const handleYjsUpdate = () => {
      if (isLocalUpdate) return;

      try {
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

        if (remoteSections.length > 0) {
          setSections(remoteSections);
        }
      } catch (error) {
        console.error('Error processing remote update:', error);
      }
    };

    ySectionsMap.observe(handleYjsUpdate);
    return () => ySectionsMap.unobserve(handleYjsUpdate);
  }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth, setSections]);

  // Update all functions that modify sections to use syncToYjs
  const updateSectionsAndSync = useCallback((newSections) => {
    setSections(newSections);
    syncToYjs(newSections);
  }, [syncToYjs, setSections]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // This will handle cleanup when the component unmounts completely
      layoutDocsManager.userLeaveLayout(currentLayoutId, userID);
    };
  }, [currentLayoutId, userID]);
  
  return {
    activeEditors,
    activeUsersCount,
    updateSectionsAndSync,
    syncToYjs, 
    isLocalUpdate,
    userId: userID,
    currentLayoutId,
  };
};

export default useYjsManager;