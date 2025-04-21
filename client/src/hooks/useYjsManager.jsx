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
      console.log("getOrCreateDocaaaaaaaaaaaaaaaaaa", layoutId);
      if (!activeDocuments.has(layoutId)) {
        console.log(`Creating new Yjs document for layout: ${layoutId}`);
        console.log("--------------------------------");
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
          lastActivity: Date.now(),
          initialized: false // Track initialization state per document
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
    },
    
    // Check if layout exists and has been initialized
    // isLayoutInitialized: (layoutId) => {
    //   return activeDocuments.has(layoutId) && activeDocuments.get(layoutId).initialized;
    // },
    
    // // Mark layout as initialized
    setLayoutInitialized: (layoutId, value = true) => {
      console.log("setLayoutInitializedmmmmmmmmmmmmmmmmmmmm", layoutId, value);
      if (activeDocuments.has(layoutId)) {
        activeDocuments.get(layoutId).initialized = value;
      }
    }
  };
})();

const useYjsManager = ({ layoutid, cellWidth, cellHeight, gutterWidth, userID, userProfilePic, setSections }) => {   
  // State for local updates and initialization
  const [isLocalUpdate, setIsLocalUpdate] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [activeEditors, setActiveEditors] = useState([]);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const userId = userID;
  const currentLayoutId = useRef(layoutid);
  
  console.log("userId + layoutid : -", userId, layoutid);
  // if(layoutid == null){
  //   {
  //     console.log("layoutid is null");

  //     // return;
  //   }
  let layoutId = layoutid;
  // useEffect(() => {
  //   layoutId = layoutid;
  //   // layoutDocsManager.setLayoutInitialized(layoutId);
  // },[layoutid]);
  // Reset local state when layout changes

   // Get document and provider for this specific layout

   const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutId), [layoutId]);
   const { ydoc, wsProvider } = docInfo;
 
   // Get the shared map from Yjs
   const ySectionsMap = useMemo(() => ydoc.getMap(`sections-${layoutId}`), [ydoc, layoutId]);
  //  syncToYjs(sections);

  useEffect(() => {
    if (currentLayoutId.current !== layoutid) {
      console.log(`Layout changed from ${currentLayoutId.current} to ${layoutid}`);
      setIsInitialized(false);
      // Force setSections to empty array when switching layouts
      setSections([]);
      currentLayoutId.current = layoutid;
    }
  }, [layoutid, setSections]);
  
 
  
  // Initialize WebSocket provider with proper error handling
  useEffect(() => {
    const handleSync = (isSynced) => {
      try {
        if (isSynced && !isInitialized) {
          // Check if this is a new layout (no sections exist)
          const isNewLayout = ySectionsMap.size === 0;
          console.log(`Layout ${layoutId} synced. Is new layout: ${isNewLayout}`);
          
          if (isNewLayout) {
            // For new layouts, set empty sections
            console.log(`Setting empty sections for new layout ${layoutId}`);
            setSections([]);
          } else {
            // For existing layouts, load sections from Yjs
            const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
              try {
                return typeof value === 'string' ? JSON.parse(value) : value;
              } catch (error) {
                console.error('Error parsing section:', error);
                return null;
              }
            }).filter(Boolean);

            console.log(`Loaded ${existingSections.length} sections for layout ${layoutId}`);
            setSections(existingSections);
          }
          
          setIsInitialized(true);
          layoutDocsManager.setLayoutInitialized(layoutId);
        }
      } catch (error) {
        console.error('Sync error:', error);
      }
    };
    
    // Only initialize if not already initialized for this layout
    // isInitialized =false;
    // setIsInitialized(false);
    // console.log(layoutId);
    console.log(`Checking initial sync for layout ${layoutId}`);
    if (!isInitialized) {
      // Check immediately if already synced
      console.log(`Checking initial sync for layout ${layoutId}`);
      console.log(`WebSocket provider synced:=============== ${wsProvider.synced}`);

      console.log(`WebSocket provider sydfdsfasdasadaddasdnced:a=============== ${wsProvider.synced}`);
      console.log("dkm5");
      console.log("dkm5");
      if (wsProvider.synced) {
        handleSync(true);
      }
      
      wsProvider.on('sync', handleSync);
      
      return () => {
        wsProvider.off('sync', handleSync);
      };
    }
  }, [ySectionsMap, wsProvider, isInitialized, layoutId, setSections]);

  // Sync function to update Yjs when local changes occur
  const syncToYjs = useCallback((updatedSections) => {
    console.log(`Syncing ${updatedSections.length} sections to Yjs for layout ${layoutId}`);
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
  }, [ySectionsMap, cellWidth, cellHeight, gutterWidth, ydoc, layoutId]);

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
        layoutId: layoutId // Include layoutId to track which layout the user is editing
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
        .filter(user => user && user.layoutId === layoutId)
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
      
      // If there are no active users, setup inactivity check
      if (editors.length === 0) {
        layoutDocsManager.setupInactivityCheck(layoutId);
      }
    };

    awareness.on('change', handleChange);
    
    // Initial call to set up state
    handleChange();
    
    return () => {
      // Remove this user from active users when unmounting or changing layouts
      awareness.off('change', handleChange);
      docInfo.activeUsers.delete(userID);
      
      // Check if any users are left, if not setup cleanup
      if (docInfo.activeUsers.size === 0) {
        layoutDocsManager.setupInactivityCheck(layoutId);
      }
    };
  }, [wsProvider, userID, userProfilePic, layoutId, docInfo]);

  // Listen for remote changes
  useEffect(() => {
    const handleYjsUpdate = () => {
      if (isLocalUpdate) return;

      try {
        // Only process updates for the current layout
        if (currentLayoutId.current !== layoutId) {
          console.log(`Ignoring remote update for layout ${layoutId} - no longer active`);
          return;
        }
        
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

        console.log(`Received remote update with ${remoteSections.length} sections for layout ${layoutId}`);
        if (remoteSections.length > 0) {
          setSections(remoteSections);
        }
      } catch (error) {
        console.error('Error processing remote update:', error);
      }
    };

    ySectionsMap.observe(handleYjsUpdate);
    return () => ySectionsMap.unobserve(handleYjsUpdate);
  }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth, setSections, layoutId]);

  // Update all functions that modify sections to use syncToYjs
  const updateSectionsAndSync = useCallback((newSections) => {
    // Only update and sync if we're still on the same layout
    if (currentLayoutId.current === layoutId) {
      setSections(newSections);
      syncToYjs(newSections);
    }
  }, [syncToYjs, setSections, layoutId]);

  // Clean up when component unmounts
  useEffect(() => {
    return () => {
      // Handle cleanup when the component unmounts or layout changes
      docInfo.activeUsers.delete(userID);
      if (docInfo.activeUsers.size === 0) {
        layoutDocsManager.setupInactivityCheck(layoutId);
      }
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

//========================================================









//=============================================================


// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';

// // Layout document manager singleton - keeps track of all active Yjs documents
// const layoutDocsManager = (() => {
//   const activeDocuments = new Map();
//   const inactivityTimers = new Map();
//   const INACTIVITY_TIMEOUT = 60000; // 1 minute in milliseconds

//   return {
//     getOrCreateDoc: (layoutId) => {
//       if (!activeDocuments.has(layoutId)) {
//         console.log(`Creating new Yjs document for layout: ${layoutId}`);
//         const ydoc = new Y.Doc();
//         const wsProvider = new WebsocketProvider(
//           'ws://localhost:1234', 
//           `workbench-room-${layoutId}`, 
//           ydoc
//         );
        
//         activeDocuments.set(layoutId, { 
//           ydoc, 
//           wsProvider, 
//           activeUsers: new Set(), 
//           lastActivity: Date.now() 
//         });
//       } else {
//         // Update last activity time
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.lastActivity = Date.now();
        
//         // Clear any existing inactivity timer if users are active
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//           inactivityTimers.delete(layoutId);
//         }
//       }
      
//       return activeDocuments.get(layoutId);
//     },
    
//     setupInactivityCheck: (layoutId) => {
//       const docInfo = activeDocuments.get(layoutId);
//       if (!docInfo) return;
      
//       // Only set up inactivity timer if there are no active users
//       if (docInfo.activeUsers.size === 0) {
//         // Clear any existing timer
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//         }
        
//         // Set new timer
//         const timer = setTimeout(() => {
//           console.log(`Cleaning up inactive layout: ${layoutId}`);
//           if (docInfo.activeUsers.size === 0) {
//             // Disconnect the provider
//             docInfo.wsProvider.disconnect();
//             // Destroy the document
//             docInfo.ydoc.destroy();
//             // Remove from active documents
//             activeDocuments.delete(layoutId);
//           }
//           inactivityTimers.delete(layoutId);
//         }, INACTIVITY_TIMEOUT);
        
//         inactivityTimers.set(layoutId, timer);
//       }
//     },
    
//     cleanupDoc: (layoutId) => {
//       if (activeDocuments.has(layoutId)) {
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.wsProvider.disconnect();
//         docInfo.ydoc.destroy();
//         activeDocuments.delete(layoutId);
        
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//           inactivityTimers.delete(layoutId);
//         }
//       }
//     },

//     // New method to handle user leaving a layout
//     userLeaveLayout: (layoutId, userId) => {
//       if (activeDocuments.has(layoutId)) {
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.activeUsers.delete(userId);
        
//         // If no users remain, setup inactivity timer
//         if (docInfo.activeUsers.size === 0) {
//           layoutDocsManager.setupInactivityCheck(layoutId);
//         }
//       }
//     }
//   };
// })();

// const useYjsManager = ({ layoutid, cellWidth, cellHeight, gutterWidth, userID, userProfilePic, setSections }) => {   
//  // State for local updates and initialization
//    const [isLocalUpdate, setIsLocalUpdate] = useState(false);
//    const [isInitialized, setIsInitialized] = useState(false);
//    const [activeEditors, setActiveEditors] = useState([]);
//    const [activeUsersCount, setActiveUsersCount] = useState(0);
//    const userId = userID;
//   console.log("userId + layoutid : -",userId, layoutid);
//    // Get document and provider for this specific layout
//    const layoutId = layoutid;
//    const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutId), [layoutId]);
//    const { ydoc, wsProvider } = docInfo;
//    // Get the shared map from Yjs
//    const ySectionsMap = useMemo(() => ydoc.getMap(`sections-${layoutId}`), [ydoc, layoutId]);
 
//    // Initialize WebSocket provider with proper error handling
//    useEffect(() => {
//      const handleSync = (isSynced) => {
//        try {
//          if (isSynced && !isInitialized) {
//            // Get initial data from Yjs
//            const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//              try {
//                return typeof value === 'string' ? JSON.parse(value) : value;
//              } catch (error) {
//                console.error('Error parsing section:', error);
//                return null;
//              }
//            }).filter(Boolean);
 
//            if (existingSections.length > 0) {
//              setSections(existingSections);
//              console.log('Initial sections loaded:', existingSections);
//            }
//            setIsInitialized(true);
//          }
//        } catch (error) {
//          console.error('Sync error:', error);
//        }
//      };
     
//      // Check immediately if already synced
//      if (wsProvider.synced && !isInitialized) {
//        handleSync(true);
//      }
     
//      wsProvider.on('sync', handleSync);
     
//      // Error handling
//      wsProvider.on('connection-error', (error) => {
//        console.error('WebSocket connection error:', error);
//      });
 
//      return () => {
//        wsProvider.off('sync', handleSync);
//      };
//    }, [ySectionsMap, wsProvider, isInitialized]);
 
//    // Sync function to update Yjs when local changes occur
//    const syncToYjs = useCallback((updatedSections) => {
//      console.log("m1:", updatedSections);
//      try {
//        setIsLocalUpdate(true);
//        ydoc.transact(() => {
//          // Clear existing data
//          ySectionsMap.clear();
         
//          // Add updated sections
//          updatedSections.forEach(section => {
//            const sectionWithPositions = {
//              ...section,
//              x: section.gridX * (cellWidth + gutterWidth),
//              y: section.gridY * cellHeight,
//              items: section.items?.map(item => ({
//                ...item,
//                x: item.gridX * (cellWidth + gutterWidth),
//                y: item.gridY * cellHeight
//              })) || []
//            };
//            ySectionsMap.set(section.id, JSON.stringify(sectionWithPositions));
//          });
//        });
//      } catch (error) {
//        console.error('Error syncing to Yjs:', error);
//      } finally {
//        setIsLocalUpdate(false);
//      }
//    }, [ySectionsMap, cellWidth, cellHeight, gutterWidth, ydoc]);
 
//    // Add awareness to Yjs - track users per layout
//    useEffect(() => {
//      if (!wsProvider) return;
 
//      const awareness = wsProvider.awareness;
 
//      // Set local user state
//      awareness.setLocalState({
//        user: {
//          id: userID,
//          profilePic: userProfilePic,
//          name: userID,
//          layoutId: layoutId // Include layoutId to track which layout the user is editing
//        }
//      });
 
//      // Add user to active users set
//      docInfo.activeUsers.add(userID);
 
//      // Handle awareness changes
//      const handleChange = () => {
//        const states = Array.from(awareness.getStates());
       
//        // Filter only editors in this layout and remove duplicates by ID
//        const uniqueEditorIds = new Set();
//        const editors = states
//          .map(([clientId, state]) => state.user)
//          .filter(user => user && user.layoutId === layoutId)
//          .filter(user => {
//            if (uniqueEditorIds.has(user.id)) {
//              return false;
//            }
//            uniqueEditorIds.add(user.id);
//            return true;
//          });
       
//        setActiveEditors(editors);
//        setActiveUsersCount(editors.length);
       
//        // Update active users count in the document info
//        docInfo.activeUsers = new Set(editors.map(user => user.id));
       
//        // If there are no active users, setup inactivity check
//        if (editors.length === 0) {
//          layoutDocsManager.setupInactivityCheck(layoutId);
//        }
//      };
 
//      awareness.on('change', handleChange);
     
//      // Initial call to set up state
//      handleChange();
     
//      return () => {
//        // Remove this user from active users when unmounting
//        awareness.off('change', handleChange);
//        docInfo.activeUsers.delete(userID);
       
//        // Check if any users are left, if not setup cleanup
//        if (docInfo.activeUsers.size === 0) {
//          layoutDocsManager.setupInactivityCheck(layoutId);
//        }
//      };
//    }, [wsProvider, userID, userProfilePic, layoutId, docInfo]);
 
//    // Listen for remote changes
//    useEffect(() => {
//      const handleYjsUpdate = () => {
//        if (isLocalUpdate) return;
 
//        try {
//          const remoteSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//            try {
//              const section = typeof value === 'string' ? JSON.parse(value) : value;
//              return {
//                ...section,
//                items: section.items?.map(item => ({
//                  ...item,
//                  x: item.gridX * (cellWidth + gutterWidth),
//                  y: item.gridY * cellHeight
//                })) || []
//              };
//            } catch (error) {
//              console.error('Error parsing remote section:', error);
//              return null;
//            }
//          }).filter(Boolean);
 
//          if (remoteSections.length > 0) {
//            setSections(remoteSections);
//          }
//        } catch (error) {
//          console.error('Error processing remote update:', error);
//        }
//      };
 
//      ySectionsMap.observe(handleYjsUpdate);
//      return () => ySectionsMap.unobserve(handleYjsUpdate);
//    }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth]);
 
//    // Update all functions that modify sections to use syncToYjs
//    const updateSectionsAndSync = useCallback((newSections) => {
//      setSections(newSections);
//      syncToYjs(newSections);
//    }, [syncToYjs]);
 
//    // Clean up when component unmounts
//    useEffect(() => {
//      return () => {
//        // This will handle cleanup if needed when the component unmounts
//        docInfo.activeUsers.delete(userID);
//        if (docInfo.activeUsers.size === 0) {
//          layoutDocsManager.setupInactivityCheck(layoutId);
//        }
//      };
//    }, [layoutId, userID, docInfo]);
  
//     return {

//       activeEditors,
//       activeUsersCount,
//       updateSectionsAndSync,
//       syncToYjs, 
//       isLocalUpdate,
//       userId,
//     };
//   };
  
//   export default useYjsManager;






// import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
// import * as Y from 'yjs';
// import { WebsocketProvider } from 'y-websocket';

// // Layout document manager singleton - keeps track of all active Yjs documents
// const layoutDocsManager = (() => {
//   const activeDocuments = new Map();
//   const inactivityTimers = new Map();
//   const INACTIVITY_TIMEOUT = 60000; // 1 minute in milliseconds

//   return {
//     getOrCreateDoc: (layoutId) => {
//       if (!activeDocuments.has(layoutId)) {
//         console.log(`Creating new Yjs document for layout: ${layoutId}`);
//         const ydoc = new Y.Doc();
//         const wsProvider = new WebsocketProvider(
//           'ws://localhost:1234', 
//           `workbench-room-${layoutId}`, 
//           ydoc
//         );
        
//         activeDocuments.set(layoutId, { 
//           ydoc, 
//           wsProvider, 
//           activeUsers: new Set(), 
//           lastActivity: Date.now(),
//           initialized: false // Track initialization state per document
//         });
//       } else {
//         // Update last activity time
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.lastActivity = Date.now();
        
//         // Clear any existing inactivity timer if users are active
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//           inactivityTimers.delete(layoutId);
//         }
//       }
      
//       return activeDocuments.get(layoutId);
//     },
    
//     setupInactivityCheck: (layoutId) => {
//       const docInfo = activeDocuments.get(layoutId);
//       if (!docInfo) return;
      
//       // Only set up inactivity timer if there are no active users
//       if (docInfo.activeUsers.size === 0) {
//         // Clear any existing timer
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//         }
        
//         // Set new timer
//         const timer = setTimeout(() => {
//           console.log(`Cleaning up inactive layout: ${layoutId}`);
//           if (docInfo.activeUsers.size === 0) {
//             // Disconnect the provider
//             docInfo.wsProvider.disconnect();
//             // Destroy the document
//             docInfo.ydoc.destroy();
//             // Remove from active documents
//             activeDocuments.delete(layoutId);
//           }
//           inactivityTimers.delete(layoutId);
//         }, INACTIVITY_TIMEOUT);
        
//         inactivityTimers.set(layoutId, timer);
//       }
//     },
    
//     cleanupDoc: (layoutId) => {
//       if (activeDocuments.has(layoutId)) {
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.wsProvider.disconnect();
//         docInfo.ydoc.destroy();
//         activeDocuments.delete(layoutId);
        
//         if (inactivityTimers.has(layoutId)) {
//           clearTimeout(inactivityTimers.get(layoutId));
//           inactivityTimers.delete(layoutId);
//         }
//       }
//     },

//     // Handle user leaving a layout
//     userLeaveLayout: (layoutId, userId) => {
//       if (activeDocuments.has(layoutId)) {
//         const docInfo = activeDocuments.get(layoutId);
//         docInfo.activeUsers.delete(userId);
        
//         // If no users remain, setup inactivity timer
//         if (docInfo.activeUsers.size === 0) {
//           layoutDocsManager.setupInactivityCheck(layoutId);
//         }
//       }
//     },
    
//     // Check if layout exists and has been initialized
//     isLayoutInitialized: (layoutId) => {
//       return activeDocuments.has(layoutId) && activeDocuments.get(layoutId).initialized;
//     },
    
//     // Mark layout as initialized
//     setLayoutInitialized: (layoutId, value = true) => {
//       if (activeDocuments.has(layoutId)) {
//         activeDocuments.get(layoutId).initialized = value;
//       }
//     }
//   };
// })();

// const useYjsManager = ({ layoutid, cellWidth, cellHeight, gutterWidth, userID, userProfilePic, setSections }) => {   
//   // State for local updates and initialization
//   const [isLocalUpdate, setIsLocalUpdate] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
//   const [activeEditors, setActiveEditors] = useState([]);
//   const [activeUsersCount, setActiveUsersCount] = useState(0);
//   const userId = userID;
//   const currentLayoutId = useRef(layoutid);
//   const initializedLayouts = useRef(new Set());
  
//   console.log("userId + layoutid : -", userId, layoutid);
  
//   // Reset local state when layout changes
//   useEffect(() => {
//     if (currentLayoutId.current !== layoutid) {
//       console.log(`Layout changed from ${currentLayoutId.current} to ${layoutid}`);
//       setIsInitialized(false);
      
//       // Remove user from previous layout's active users
//       if (currentLayoutId.current) {
//         layoutDocsManager.userLeaveLayout(currentLayoutId.current, userID);
//       }
      
//       currentLayoutId.current = layoutid;
      
//       // Clear sections when switching layouts
//       // Only if the new layout hasn't been initialized yet
//       if (!initializedLayouts.current.has(layoutid)) {
//         console.log(`Clearing sections for new layout ${layoutid}`);
//         setSections([]);
//       }
//     }
//   }, [layoutid, setSections, userID]);
  
//   // Get document and provider for this specific layout
//   const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutid), [layoutid]);
//   const { ydoc, wsProvider } = docInfo;
  
//   // Get the shared map from Yjs with proper naming
//   const ySectionsMap = useMemo(() => ydoc.getMap(`sections-${layoutid}`), [ydoc, layoutid]);
  
//   // Initialize WebSocket provider with proper error handling
//   useEffect(() => {
//     if (isInitialized) return; // Skip if already initialized for this layout
    
//     const handleSync = (isSynced) => {
//       try {
//         if (isSynced && !isInitialized && currentLayoutId.current === layoutid) {
//           console.log(`Sync completed for layout ${layoutid}`);
          
//           // Check if this layout has existing data
//           if (ySectionsMap.size > 0) {
//             const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//               try {
//                 const section = typeof value === 'string' ? JSON.parse(value) : value;
//                 return {
//                   ...section,
//                   items: section.items?.map(item => ({
//                     ...item,
//                     x: item.gridX * (cellWidth + gutterWidth),
//                     y: item.gridY * cellHeight
//                   })) || []
//                 };
//               } catch (error) {
//                 console.error('Error parsing section:', error);
//                 return null;
//               }
//             }).filter(Boolean);

//             console.log(`Loaded ${existingSections.length} sections for layout ${layoutid}`);
            
//             // Only update if there are sections to load
//             if (existingSections.length > 0) {
//               setSections(existingSections);
//             }
//           } else {
//             console.log(`No existing sections found for layout ${layoutid}`);
//           }
          
//           // Mark this layout as initialized
//           setIsInitialized(true);
//           initializedLayouts.current.add(layoutid);
//           layoutDocsManager.setLayoutInitialized(layoutid);
//         }
//       } catch (error) {
//         console.error('Sync error:', error);
//       }
//     };
    
//     // Check immediately if already synced
//     if (wsProvider.synced) {
//       handleSync(true);
//     }
    
//     wsProvider.on('sync', handleSync);
    
//     // Error handling
//     wsProvider.on('connection-error', (error) => {
//       console.error('WebSocket connection error:', error);
//     });
    
//     return () => {
//       wsProvider.off('sync', handleSync);
//     };
//   }, [ySectionsMap, wsProvider, isInitialized, layoutid, setSections, cellWidth, cellHeight, gutterWidth]);

//   // Sync function to update Yjs when local changes occur
//   const syncToYjs = useCallback((updatedSections) => {
//     // Check if we're in the correct layout
//     if (currentLayoutId.current !== layoutid) {
//       console.log(`Not syncing - layout has changed from ${layoutid} to ${currentLayoutId.current}`);
//       return;
//     }
    
//     console.log(`Syncing ${updatedSections.length} sections to Yjs for layout ${layoutid}`);
    
//     try {
//       setIsLocalUpdate(true);
      
//       ydoc.transact(() => {
//         // Clear existing data
//         ySectionsMap.clear();
        
//         // Add updated sections
//         updatedSections.forEach(section => {
//           const sectionWithPositions = {
//             ...section,
//             x: section.gridX * (cellWidth + gutterWidth),
//             y: section.gridY * cellHeight,
//             items: section.items?.map(item => ({
//               ...item,
//               x: item.gridX * (cellWidth + gutterWidth),
//               y: item.gridY * cellHeight
//             })) || []
//           };
//           ySectionsMap.set(section.id, JSON.stringify(sectionWithPositions));
//         });
//       });
//     } catch (error) {
//       console.error('Error syncing to Yjs:', error);
//     } finally {
//       setTimeout(() => {
//         setIsLocalUpdate(false);
//       }, 50); // Small delay to ensure local updates complete first
//     }
//   }, [ySectionsMap, cellWidth, cellHeight, gutterWidth, ydoc, layoutid]);

//   // Add awareness to Yjs - track users per layout
//   useEffect(() => {
//     if (!wsProvider) return;

//     const awareness = wsProvider.awareness;

//     // Set local user state
//     awareness.setLocalState({
//       user: {
//         id: userID,
//         profilePic: userProfilePic,
//         name: userID,
//         layoutId: layoutid
//       }
//     });

//     // Add user to active users set
//     docInfo.activeUsers.add(userID);

//     // Handle awareness changes
//     const handleChange = () => {
//       if (currentLayoutId.current !== layoutid) return;
      
//       const states = Array.from(awareness.getStates());
      
//       // Filter only editors in this layout and remove duplicates by ID
//       const uniqueEditorIds = new Set();
//       const editors = states
//         .map(([_, state]) => state.user)
//         .filter(user => user && user.layoutId === layoutid)
//         .filter(user => {
//           if (uniqueEditorIds.has(user.id)) {
//             return false;
//           }
//           uniqueEditorIds.add(user.id);
//           return true;
//         });
      
//       setActiveEditors(editors);
//       setActiveUsersCount(editors.length);
      
//       // Update active users count in the document info
//       docInfo.activeUsers = new Set(editors.map(user => user.id));
//     };

//     awareness.on('change', handleChange);
    
//     // Initial call to set up state
//     handleChange();
    
//     return () => {
//       // Remove this user from active users when unmounting or changing layouts
//       awareness.off('change', handleChange);
//       docInfo.activeUsers.delete(userID);
      
//       // Check if any users are left, if not setup cleanup
//       if (docInfo.activeUsers.size === 0) {
//         layoutDocsManager.setupInactivityCheck(layoutid);
//       }
//     };
//   }, [wsProvider, userID, userProfilePic, layoutid, docInfo]);

//   // Listen for remote changes
//   useEffect(() => {
//     const handleYjsUpdate = (event) => {
//       // Skip if it's a local update
//       if (isLocalUpdate) return;
      
//       // Skip if we're not on this layout anymore
//       if (currentLayoutId.current !== layoutid) {
//         console.log(`Ignoring remote update for layout ${layoutid} - no longer active`);
//         return;
//       }

//       try {
//         // Do a full refresh of sections from Yjs
//         const remoteSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//           try {
//             const section = typeof value === 'string' ? JSON.parse(value) : value;
//             return {
//               ...section,
//               items: section.items?.map(item => ({
//                 ...item,
//                 x: item.gridX * (cellWidth + gutterWidth),
//                 y: item.gridY * cellHeight
//               })) || []
//             };
//           } catch (error) {
//             console.error('Error parsing remote section:', error);
//             return null;
//           }
//         }).filter(Boolean);

//         console.log(`Received remote update with ${remoteSections.length} sections for layout ${layoutid}`);
//         setSections(remoteSections);
//       } catch (error) {
//         console.error('Error processing remote update:', error);
//       }
//     };

//     ySectionsMap.observe(handleYjsUpdate);
    
//     return () => {
//       ySectionsMap.unobserve(handleYjsUpdate);
//     };
//   }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth, layoutid, setSections]);

//   // Update sections and sync to Yjs
//   const updateSectionsAndSync = useCallback((newSections) => {
//     // Only update and sync if we're still on the same layout
//     if (currentLayoutId.current === layoutid) {
//       setSections(newSections);
//       syncToYjs(newSections);
//     } else {
//       console.warn(`Attempted to update sections for inactive layout ${layoutid}`);
//     }
//   }, [syncToYjs, setSections, layoutid]);

//   // Clean up when component unmounts
//   useEffect(() => {
//     return () => {
//       // Handle cleanup when the component unmounts
//       layoutDocsManager.userLeaveLayout(layoutid, userID);
//     };
//   }, [layoutid, userID]);
  
//   return {
//     activeEditors,
//     activeUsersCount,
//     updateSectionsAndSync,
//     syncToYjs, 
//     isLocalUpdate,
//     userId,
//     isInitialized,
//   };
// };
  
// export default useYjsManager;