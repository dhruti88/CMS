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
 // State for local updates and initialization
   const [isLocalUpdate, setIsLocalUpdate] = useState(false);
   const [isInitialized, setIsInitialized] = useState(false);
   const [activeEditors, setActiveEditors] = useState([]);
   const [activeUsersCount, setActiveUsersCount] = useState(0);
   const userId = userID;
  console.log("userId + layoutid : -",userId, layoutid);
   // Get document and provider for this specific layout
   const layoutId = layoutid;
   const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutId), [layoutId]);
   const { ydoc, wsProvider } = docInfo;
   // Get the shared map from Yjs
   const ySectionsMap = useMemo(() => ydoc.getMap(`sections-${layoutId}`), [ydoc, layoutId]);
 
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
             console.log('Initial sections loaded:', existingSections);
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
       console.error('WebSocket connection error:', error);
     });
 
     return () => {
       wsProvider.off('sync', handleSync);
     };
   }, [ySectionsMap, wsProvider, isInitialized]);
 
   // Sync function to update Yjs when local changes occur
   const syncToYjs = useCallback((updatedSections) => {
     console.log("m1:", updatedSections);
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
   }, [ySectionsMap, cellWidth, cellHeight, gutterWidth, ydoc]);
 
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
       // Remove this user from active users when unmounting
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
   }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth]);
 
   // Update all functions that modify sections to use syncToYjs
   const updateSectionsAndSync = useCallback((newSections) => {
     setSections(newSections);
     syncToYjs(newSections);
   }, [syncToYjs]);
 
   // Clean up when component unmounts
   useEffect(() => {
     return () => {
       // This will handle cleanup if needed when the component unmounts
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