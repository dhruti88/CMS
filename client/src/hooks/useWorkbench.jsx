import { useState, useRef, useEffect, useMemo , useCallback } from 'react';
import { getCellDimensions } from '../utils/gridHelpers';
import { saveAs } from "file-saver";
import {SERVER_URL} from '../Urls';
import axios from "axios";
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { useParams } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

// const ydoc = new Y.Doc();
// const provider = new WebsocketProvider('ws://localhost:1234', 'workbench-room', ydoc);
// const ySections = ydoc.getArray('sections');

// const ydoc = useMemo(() => new Y.Doc(), []);
// const provider = useMemo(() => 
//   new WebsocketProvider(
//     'ws://localhost:1234', 
//     'workbench-room', 
//     ydoc,
//     { connect: true }
//   ),
//   [ydoc]
// );
// const ySections = useMemo(() => ydoc.getArray('sections'), [ydoc]);
// console.table("provider",provider);

// // At the top of the file, outside the hook
// const ydoc = new Y.Doc();
// const wsProvider = new WebsocketProvider('ws://localhost:1234', 'workbench-room', ydoc);


//----------------------------------------------------

// Utility for managing Yjs documents and providers per layout
// Utility for managing Yjs documents and providers per layout
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
//---------------------------------------------------

const useWorkbench = () => {
  // Constants
  const defaultTitle = "default";
  const [showSetupForm, setShowSetupForm] = useState(true);
  const [layoutTitle, setLayoutTitle] = useState(defaultTitle);
  const [columns, setColumns] = useState(8);
  const [rows, setRows] = useState(12);
  const [gutterWidth, setGutterWidth] = useState(10);
  const [userID, setUserID] = useState("60d21b4667d0d8992e610c85");
  const token =localStorage.getItem("token");
  // Stage dimensions (minus toolbox width)
  const cellWidth = 100;
  const cellHeight = 50;

  const [userProfilePic, setUserProfilePic] = useState("");
// Fetch user info from the backend
  const fetchUser = async() =>
  {
    try {
      const response = await axios.get(`${SERVER_URL}/api/users/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserID(response.data.uid); // Set the user data
      setUserProfilePic(response.data.photoURL);
      console.log("User photoURL:", response.data.photoURL);
      console.log("User UID:", response.data.uid);
      localStorage.setItem('userId', response.data.uid);
      console.log("User data fetched:", response.data);
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const [isDeleting, setIsDeleting] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleDeleteLayout = async (layout) => {
      try {
        setIsDeleting(layout._id);
        
        // Assuming you have a way to get the current user's ID
        const userId = localStorage.getItem('userId'); // Adjust this based on your auth method
  
        const response = await fetch(`${SERVER_URL}/api/layout?_id=${encodeURIComponent(layout._id)}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
  
        const result = await response.json();
  console.log(result);
        if (result.success) {
          // Refresh the layouts list
          fetchAvailableLayouts();
          // Optionally, you can add a toast or alert here
          alert(`Layout "${layout.title}" deleted successfully`);
        } else {
          alert('Failed to delete layout');
        }
      } catch (error) {
        console.error('Error deleting layout:', error);
        alert('An error occurred while deleting the layout');
      } finally {
        setIsDeleting(null);
      }
    };
  

   useEffect(() => {
      if (token) {
        console.log("token--",token);
        fetchUser();
      } else {
        console.error("No token found. Please sign in.");
      }
    }, [token]);

  const userId = userID;
  console.log("userId : -",userId);
  


//city,dueDate,Status,layoutType
const [city, setCity] = useState("Chicago");
const [dueDate, setDueDate] = useState("");
const [taskStatus, setTaskStatus] = useState("Pending");
const [layoutType, setLayoutType] = useState("Page");

//handle image download and pdf
const [hideGrid, setHideGrid] = useState(false);          // State to control grid visibility
const [hideBackground, setHideBackground] = useState(false);  // State to control background visibility


  
  // Setup & grid configuration


  // Workbench items and layout state
  //const [items, setSections] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionId, setSectionId] = useState(''); // Ensure ID type matches
  
  //  // Helper function: Sync local sections state to Yjs
  //  const syncYjsSections = () => {
  //   console.log("Syncing Yjs sections with local state:", sections);
  //   ySections.delete(0, ySections.length);
  //   sections.forEach(sec => ySections.push([sec]));
  //   console.log("Yjs sections after sync:", ySections.toArray());
  // };


  // // ---------------------------
  //   // Yjs Integration: Synchronization Helpers
  //   // ---------------------------
  //   // Observe remote changes in Yjs and update local sections state
  //   useEffect(() => {
  //     const updateLocalSections = (event) => {
  //       console.log("Yjs sections updated:", event);
  //       const remoteSections = ySections.toArray();
  //       console.log("Remote sections received:", remoteSections);
  //       setSections(remoteSections);
  //     };
  
  //     ySections.observeDeep(updateLocalSections);
  //     return () => {
  //       ySections.unobserveDeep(updateLocalSections);
  //     };
  //   }, []);
  //===============================================================

  // State declarations
//   const [isLocalUpdate, setIsLocalUpdate] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
  
//   const [activeEditors, setActiveEditors] = useState([]);
//   // Get the shared map from Yjs
//   // Add active users count state
// const [activeUsersCount, setActiveUsersCount] = useState(0);
//   const ySectionsMap = useMemo(() => ydoc.getMap('sections'), []);

//   // Initialize WebSocket provider with proper error handling
//   useEffect(() => {
//     const handleSync = (isSynced) => {
//       try {
//         if (isSynced && !isInitialized) {
//           // Get initial data from Yjs
//           const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//             try {
//               return typeof value === 'string' ? JSON.parse(value) : value;
//             } catch (error) {
//               console.error('Error parsing section:', error);
//               return null;
//             }
//           }).filter(Boolean);

//           if (existingSections.length > 0) {
//             setSections(existingSections);
//             console.log('Initial sections loaded:', existingSections);
//           }
//           setIsInitialized(true);
//         }
//       } catch (error) {
//         console.error('Sync error:', error);
//       }
//     };
//     // Check immediately if already synced
//   if (wsProvider.synced && !isInitialized) {
//     handleSync(true);
//   }
//     wsProvider.on('sync', handleSync);
    
//     // Error handling
//     wsProvider.on('connection-error', (error) => {
//       console.error('WebSocket connection error:', error);
//     });

//     return () => {
//       wsProvider.off('sync', handleSync);
//     };
//   }, [ySectionsMap]);


//    // Sync function to update Yjs when local changes occur
//    const syncToYjs = useCallback((updatedSections) => {
//     // console.log("ms:",updatedSections);
    
//     // if (!isInitialized) {
//     // handleSync(true);
//     // console.log("ms0:",updatedSections);
//     // }

//     console.log("m1:",updatedSections);
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
//       setIsLocalUpdate(false);
//     }
//   }, [ySectionsMap, isInitialized, cellWidth, cellHeight, gutterWidth]);


//   // Add awareness to Yjs
//   useEffect(() => {
//     if (!wsProvider) return;

//     const awareness = wsProvider.awareness;

//     // Set local user state
//     awareness.setLocalState({
//       user: {
//         id: userID,
//         profilePic: userProfilePic,
//         name: userID // You can add more user info here
//       }
//     });

//     // Handle awareness changes
//     const handleChange = () => {
//       const states = Array.from(awareness.getStates());
//       const editors = states
//         .map(([clientId, state]) => state.user)
//         .filter(Boolean);
//       setActiveEditors(editors);
//     };

//     awareness.on('change', handleChange);
//     return () => awareness.off('change', handleChange);
//   }, [wsProvider, userID, userProfilePic]);



//   // Listen for remote changes
//   useEffect(() => {

//   //    // Check immediately if already synced
//   // if (wsProvider.synced && !isInitialized) {
//   //   handleSync(true);
//   // }


//     const handleYjsUpdate = () => {
//       if (isLocalUpdate) return;

//       try {
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

//         if (remoteSections.length > 0) {
//           setSections(remoteSections);
//         }
//       } catch (error) {
//         console.error('Error processing remote update:', error);
//       }
//     };

//     ySectionsMap.observe(handleYjsUpdate);
//     return () => ySectionsMap.unobserve(handleYjsUpdate);
//   }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth]);

//   // Update all functions that modify sections to use syncToYjs
//   const updateSectionsAndSync = useCallback((newSections) => {
//     setSections(newSections);
    
//     syncToYjs(newSections);
  
//   }, [syncToYjs]);
//   //====================================================================

 
//   // State declarations
//   const [isLocalUpdate, setIsLocalUpdate] = useState(false);
//   const [isInitialized, setIsInitialized] = useState(false);
  
//   const [activeEditors, setActiveEditors] = useState([]);
//   // Get the shared map from Yjs
//   // Add active users count state
// const [activeUsersCount, setActiveUsersCount] = useState(0);
//   const ySectionsMap = useMemo(() => ydoc.getMap('sections'), []);

//   // Initialize WebSocket provider with proper error handling
//   useEffect(() => {
//     const handleSync = (isSynced) => {
//       try {
//         if (isSynced && !isInitialized) {
//           // Get initial data from Yjs
//           const existingSections = Array.from(ySectionsMap.entries()).map(([_, value]) => {
//             try {
//               return typeof value === 'string' ? JSON.parse(value) : value;
//             } catch (error) {
//               console.error('Error parsing section:', error);
//               return null;
//             }
//           }).filter(Boolean);

//           if (existingSections.length > 0) {
//             setSections(existingSections);
//             console.log('Initial sections loaded:', existingSections);
//           }
//           setIsInitialized(true);
//         }
//       } catch (error) {
//         console.error('Sync error:', error);
//       }
//     };
//     // Check immediately if already synced
//   if (wsProvider.synced && !isInitialized) {
//     handleSync(true);
//   }
//     wsProvider.on('sync', handleSync);
    
//     // Error handling
//     wsProvider.on('connection-error', (error) => {
//       console.error('WebSocket connection error:', error);
//     });

//     return () => {
//       wsProvider.off('sync', handleSync);
//     };
//   }, [ySectionsMap]);


//    // Sync function to update Yjs when local changes occur
//    const syncToYjs = useCallback((updatedSections) => {
//     // console.log("ms:",updatedSections);
    
//     // if (!isInitialized) {
//     // handleSync(true);
//     // console.log("ms0:",updatedSections);
//     // }

//     console.log("m1:",updatedSections);
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
//       setIsLocalUpdate(false);
//     }
//   }, [ySectionsMap, isInitialized, cellWidth, cellHeight, gutterWidth]);


//   // Add awareness to Yjs
//   useEffect(() => {
//     if (!wsProvider) return;

//     const awareness = wsProvider.awareness;

//     // Set local user state
//     awareness.setLocalState({
//       user: {
//         id: userID,
//         profilePic: userProfilePic,
//         name: userID // You can add more user info here
//       }
//     });

//     // Handle awareness changes
//     const handleChange = () => {
//       const states = Array.from(awareness.getStates());
//       const editors = states
//         .map(([clientId, state]) => state.user)
//         .filter(Boolean);
//       setActiveEditors(editors);
//     };

//     awareness.on('change', handleChange);
//     return () => awareness.off('change', handleChange);
//   }, [wsProvider, userID, userProfilePic]);



//   // Listen for remote changes
//   useEffect(() => {

//   //    // Check immediately if already synced
//   // if (wsProvider.synced && !isInitialized) {
//   //   handleSync(true);
//   // }


//     const handleYjsUpdate = () => {
//       if (isLocalUpdate) return;

//       try {
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

//         if (remoteSections.length > 0) {
//           setSections(remoteSections);
//         }
//       } catch (error) {
//         console.error('Error processing remote update:', error);
//       }
//     };

//     ySectionsMap.observe(handleYjsUpdate);
//     return () => ySectionsMap.unobserve(handleYjsUpdate);
//   }, [ySectionsMap, isLocalUpdate, cellWidth, cellHeight, gutterWidth]);

//   // Update all functions that modify sections to use syncToYjs
//   const updateSectionsAndSync = useCallback((newSections) => {
//     setSections(newSections);
    
//     syncToYjs(newSections);
  
//   }, [syncToYjs]);





//   //=====================================================================

//-----------------------------------------------------------
  // Yjs document and provider


   // State declarations
   const [isLocalUpdate, setIsLocalUpdate] = useState(false);
   const [isInitialized, setIsInitialized] = useState(false);
   const [activeEditors, setActiveEditors] = useState([]);
   const [activeUsersCount, setActiveUsersCount] = useState(0);
   
   // Get document and provider for this specific layout
   const layoutId = localStorage.getItem('layoutid') || 'default-layout';
   const docInfo = useMemo(() => layoutDocsManager.getOrCreateDoc(layoutId), [layoutId]);
   const { ydoc, wsProvider } = docInfo;
   
   // Get the shared map from Yjs
   const ySectionsMap = useMemo(() => ydoc.getMap('sections'), [ydoc]);
 
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


//----------------------------------------------------------

    // Add new section to Yjs array
    const addSection = (size) => 
    {
      return {
        id: 'section-' + Date.now(),  // Ensuring ID remains a string
        type: 'section',
        sectionType: 'section',
        x: 0,
        y: 0,
        width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
        height: size.rows * cellHeight,
        fill: colors.grays[4],
        stroke: colors.grays[2],
        strokeWidth: 1,
        draggable: true,
        sizeInfo: size,
        gridX: 0,
        gridY: 0,
        items: [],
      };
    };
  // Item addition function
  const addBox = (size) => {
    return {
      id: 'box-' + Date.now(),
      type: 'box',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      fill: colors.grays[4],
      stroke: colors.grays[2],
      strokeWidth: 1,
      draggable: true,
      sizeInfo: size,
      gridX: 0,
      gridY: 0
    };
  };

    // // Image upload handler
    // const handleImageUpload = (sectionId, e) => {
    //   console.log("image : -", e);
    //   const file = e.target.files[0];
    
    //   if (file) {
    //     const reader = new FileReader();
    //     reader.onloadend = () => {
    //       const base64data = reader.result;
    //       const defaultSize = { cols: 2, rows: 2, label: '2×2' };
    //       const imageItem = addImageItem(defaultSize);
    //       imageItem.src = base64data; // Set uploaded image source
    
    //       setSections(prevSections =>
    //         prevSections.map(section => {
    //           if (section.id !== sectionId) return section; // Skip if not the correct section
    
    //           // Check available space before adding the image
    //           const bestPosition = findBestPositionForItem(imageItem, section.items, section.sizeInfo);
    //           if (!bestPosition) {
    //             alert("No space available in section!");
    //             return section;
    //           }
    
    //           // Assign correct position before adding the image
    //           imageItem.gridX = bestPosition.gridX;
    //           imageItem.gridY = bestPosition.gridY;
    //           imageItem.x = imageItem.gridX * (cellWidth + gutterWidth);
    //           imageItem.y = imageItem.gridY * cellHeight;
    
    //           return { ...section, items: [...section.items, imageItem] };
    //         })
    //       );
    
    //       setSelectedId(imageItem.id);

    //       // Sync to Yjs
    //      // Only sync after state update is complete
    // syncYjsSections()
    //     };
    
    //     reader.readAsDataURL(file);
    //   }
    // };
    
    const handleImageUpload = (sectionId, e) => {
      console.log("image : -", e);
      const file = e.target.files[0];
    
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64data = reader.result;
          const defaultSize = { cols: 2, rows: 2, label: '2×2' };
          const imageItem = addImageItem(defaultSize);
          imageItem.src = base64data; // Set uploaded image source
    
          // Create new sections array with updated section
          const updatedSections = sections.map(section => {
            if (section.id !== sectionId) return section;
    
            // Check available space before adding the image
            const bestPosition = findBestPositionForItem(imageItem, section.items, section.sizeInfo);
            if (!bestPosition) {
              alert("No space available in section!");
              return section;
            }
    
            // Assign correct position before adding the image
            imageItem.gridX = bestPosition.gridX;
            imageItem.gridY = bestPosition.gridY;
            imageItem.x = imageItem.gridX * (cellWidth + gutterWidth);
            imageItem.y = imageItem.gridY * cellHeight;
    
            return {
              ...section,
              items: [...section.items, imageItem]
            };
          });
    
          // Update sections and sync with Yjs in one go
          updateSectionsAndSync(updatedSections);
          setSelectedId(imageItem.id);
        };
    
        reader.readAsDataURL(file);
      }
    };
    
  
  // Add to state declarations in useWorkbench
const [positionDisplay, setPositionDisplay] = useState({
  show: false,
  x: 0,
  y: 0,
  gridX: 0,
  gridY: 0,
  isSection: false
});

    // const addItemToSection = (sectionId, size, type, e = null) => {
    //   let newItem;
    
    //   if (type === "text") {
    //     newItem = addTextBox(size);
    //   } else {
    //     newItem = addImageItem(size);
    //   }
    
    //   setSections(prevSections =>
    //     prevSections.map(section => {
    //       if (section.id !== sectionId) return section; // Skip if not the target section
    
    //       const bestPosition = findBestPositionForItem(newItem, section.items, section.sizeInfo);
    
    //       if (!bestPosition) {
    //         alert('No space available in section!');
    //         return section;
    //       }
    
    //       // Assign position
    //       newItem = {
    //         ...newItem,
    //         gridX: bestPosition.gridX,
    //         gridY: bestPosition.gridY,
    //         x: bestPosition.gridX * (cellWidth + gutterWidth),
    //         y: bestPosition.gridY * cellHeight,
    //       };
    
    //       return { ...section, items: [...section.items, newItem] };
    //     })
    //   );
    
    //   setSelectedId(newItem.id);
    //   // Sync to Yjs
    //    // Only sync after state update is complete
    // syncYjsSections()
    // };
    
  
    // const addNewSection = (size) => {
    //   // if (!newBoxContent && newBoxType === 'text') {
    //   //   alert('Please enter text content for the new box');
    //   //   return;
    //   // }
    //   const newSection = addSection(size)
    
    //   const position = findBestPositionForBox(newSection, sections, columns, rows);
    //   if (!position) {
    //     alert('No space available for new box');
    //     return;
    //   }
    //   console.log("position: - ",position);
    //   newSection.gridX = position.gridX;
    //   newSection.gridY = position.gridY;
    //   newSection.x = newSection.gridX * cellWidth + (newSection.gridX) * gutterWidth;
    //   newSection.y = newSection.gridY * cellHeight;
    //   setSections(prev => [...prev, newSection]);
    //   setSelectedId(newSection.id);
    //   setSectionId(newSection.id);
    //   // Sync to Yjs
    //    // Only sync after state update is complete
    // syncYjsSections()
    // };
  
  
  // Debugging useEffect to log sections when they change
 
  const addItemToSection = (sectionId, size, type, e = null) => {
    let newItem;
  
    if (type === "text") {
      newItem = addTextBox(size);
    } else {
      newItem = addImageItem(size);
    }
  
    // Create updated sections array
    const updatedSections = sections.map(section => {
      if (section.id !== sectionId) return section; // Skip if not the target section
  
      const bestPosition = findBestPositionForItem(newItem, section.items, section.sizeInfo);
  
      if (!bestPosition) {
        alert('No space available in section!');
        return section;
      }
  
      // Assign position
      newItem = {
        ...newItem,
        gridX: bestPosition.gridX,
        gridY: bestPosition.gridY,
        x: bestPosition.gridX * (cellWidth + gutterWidth),
        y: bestPosition.gridY * cellHeight,
      };
  
      return {
        ...section,
        items: [...section.items, newItem]
      };
    });
  
    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    setSelectedId(newItem.id);
  };
  
  const addNewSection = (size) => {
    const newSection = addSection(size);
  
    const position = findBestPositionForBox(newSection, sections, columns, rows);
    if (!position) {
      alert('No space available for new section');
      return;
    }
  
    // Calculate position
    newSection.gridX = position.gridX;
    newSection.gridY = position.gridY;
    newSection.x = newSection.gridX * cellWidth + (newSection.gridX) * gutterWidth;
    newSection.y = newSection.gridY * cellHeight;
  
    // Create updated sections array with new section
    const updatedSections = [...sections, newSection];
  
    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    setSelectedId(newSection.id);
    setSectionId(newSection.id);
  };
 
 
 
 
  useEffect(() => {
    console.log("Updated sections:", sections);
  }, [sections]);
  

  const itemsOverlap = (itemA, itemB) => {
    return (
      itemA.gridX < itemB.gridX + itemB.sizeInfo.cols &&
      itemA.gridX + itemA.sizeInfo.cols > itemB.gridX &&
      itemA.gridY < itemB.gridY + itemB.sizeInfo.rows &&
      itemA.gridY + itemA.sizeInfo.rows > itemB.gridY
    );
  };
  
  // Find the best position for an item inside a section
  const findBestPositionForItem = (item, sectionItems, sectionSize, originalPosition = null) => {

    console.log(sectionSize);
    if (originalPosition) {
      let conflict = sectionItems.some(other => itemsOverlap({ ...item, gridX: originalPosition.gridX, gridY: originalPosition.gridY }, other));
      if (!conflict) return originalPosition;
    }
  
    const possiblePositions = [];
    for (let y = 0; y <= sectionSize.rows - item.sizeInfo.rows; y++) {
      for (let x = 0; x <= sectionSize.cols - item.sizeInfo.cols; x++) {
        let conflict = sectionItems.some(other => itemsOverlap({ ...item, gridX: x, gridY: y }, other));
        if (!conflict) {
          let distance = originalPosition
            ? Math.sqrt(Math.pow(x - originalPosition.gridX, 2) + Math.pow(y - originalPosition.gridY, 2))
            : x + y;
          possiblePositions.push({ gridX: x, gridY: y, distance });
        }
      }
    }
  
    possiblePositions.sort((a, b) => a.distance - b.distance);
    return possiblePositions.length > 0 ? possiblePositions[0] : null;
  };
  
  const [selectedId, setSelectedId] = useState(null);
  const [availableLayouts, setAvailableLayouts] = useState([]);
  const [showLayoutList, setShowLayoutList] = useState(false);

  // Zoom and tool state
  const [stageScale, setStageScale] = useState(1);
  const [toolMode, setToolMode] = useState("pointer");

  // Text editing state
  const [textValue, setTextValue] = useState('');
  const [textFormatting, setTextFormatting] = useState({
    bold: false,
    italic: false,
    underline: false,
    fontSize: 16,
    align: 'left',
    fontFamily: 'Arial'
  });

  // Stage reference for Konva
  const stageRef = useRef(null);
  const transformerRef = useRef(null);


  const [stageSize, setStageSize] = useState({
    width: columns * cellWidth + (columns - 1) * gutterWidth,
    height: rows * cellHeight,
  });
  useEffect(() => {
    setStageSize({
      width: columns * cellWidth + (columns - 1) * gutterWidth,
      height: rows * cellHeight,
    });
  }, [columns, rows, gutterWidth, cellWidth, cellHeight]);

  // Available item sizes
  const itemSizes = [
    { cols: 1, rows: 1, label: '1×1' },
    { cols: 2, rows: 1, label: '2×1' },
    { cols: 2, rows: 2, label: '2×2' },
    { cols: 4, rows: 2, label: '4×2' },
    { cols: 4, rows: 4, label: '4×4' },
    { cols: 8, rows: 4, label: '8×4' },
  ];

  // Color palette
  const colors = {
    primary: ['#1a73e8', '#4285f4', '#8ab4f8'],
    accent: ['#ea4335', '#fbbc04', '#34a853'],
    grays: ['#202124', '#3c4043', '#5f6368', '#dadce0', '#f1f3f4']
  };

  // Layout endpoints
  const saveLayout = async ({e=1}) => {
    console.log(taskStatus);
    try {
      const gridSettings = { columns, rows, gutterWidth };
      const response = await fetch(`${SERVER_URL}/api/layout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' , 'Authorization': `Bearer ${token}`},
        body: JSON.stringify({ userId, title: layoutTitle, sections, gridSettings, layouttype: layoutType, city : city, duedate : dueDate, status : taskStatus }),
      });
      const data = await response.json();
      console.log('Layout saved successfully', data);
      if (!e) {
        console.log(data.layout._id);
        localStorage.setItem('layoutid', data.layout._id);

        // Wait until the localStorage item is set
        const checkLocalStorage = () => {
          if (localStorage.getItem('layoutid') === data.layout._id) {
        console.log("LocalStorage set successfully");
          } else {
        setTimeout(checkLocalStorage, 100); // Retry after 100ms
          }
        };

        checkLocalStorage();
      }
    } catch (error) {
      console.error('Error saving layout:', error);
    }
  };

  const fetchAvailableLayouts = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/layouts`, 
       { headers: { 'Authorization': `Bearer ${token}`}},
      );
      console.log("response : -",response);
      if (response.ok) {
        console.log("Hii",response);
        const data = await response.json();
        setAvailableLayouts(data.layouts);
        setShowLayoutList(true);
      } else {
        console.log("No layouts found.");
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

  const fetchAvailableSections = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/api/layouts?userId=${userId}`,
        { headers: { 'Authorization': `Bearer ${token}`}},
      );
      if (response.ok) {
        console.log("Hii2",response);
        const data = await response.json();
        setAvailableLayouts(data.layouts);
        // setShowLayoutList(true);
      } else {
        console.log("No layouts found.");
      }
    } catch (error) {
      console.error("Error fetching layouts:", error);
    }
  };

//   const loadLayoutFromSelected = (layout) => {
//     if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
//       setColumns(layout.gridSettings.columns);
//       setRows(layout.gridSettings.rows);
//       setGutterWidth(layout.gridSettings.gutterWidth);
//     }
//     const recalculatedSections = layout.sections.map(section => ({
//       ...section,
//       x: section.gridX * cellWidth + (section.gridX * gutterWidth),
//       y: section.gridY * cellHeight 
//     }));

//     setSections(recalculatedSections);
//     console.log("Sections array:", layout.sections);
//     setLayoutTitle(layout.title);
//     setShowLayoutList(false);
//     setShowSetupForm(false);
// //changes
//      // Only sync after state update is complete
//     syncYjsSections()
//     console.log("Loaded layout:", layout);
//     console.log("Yjs synced:", ySections.toArray());
//   };

  
  const addTextBox = (size) => {
    return {
      id: 'text-' + Date.now(),
      type: 'text',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      text: 'Add your text here',
      fontSize: 16,
      fontStyle: '',
      fontFamily: textFormatting.fontFamily,
      textDecoration: '',
      fill: colors.grays[0],
      align: 'left',
      padding: 10,
      backgroundFill: 'white',
      draggable: true,
      sizeInfo: size,
      gridX: 0,
      gridY: 0
    };
  };
  
  const addImageItem = (size) => {
    return {
      id: 'image-' + Date.now(),
      type: 'image',
      x: 0,
      y: 0,
      width: size.cols * cellWidth + (size.cols - 1) * gutterWidth,
      height: size.rows * cellHeight,
      src: 'https://konvajs.org/assets/lion.png',
      draggable: true,
      sizeInfo: size,
      gridX: 0,
      gridY: 0
    };
  };
  

  
// // Helper function to update sections
// const updateSections = (selectedId, sections, updateFn) => {
//   //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//   return sections.map(section => ({
//     ...section,
//     items: section.items.map(item => 
//       item.id === selectedId && item.type === 'text'
//         ? updateFn(item)
//         : item
//     )
      
//   }));


// };

// // Text change handler for text boxes
// const handleTextChange = (e) => {
//   const newText = e.target.value;
//   setTextValue(newText);

//   if (selectedId) {
//     setSections(prevSections => updateSections(selectedId, prevSections, item => ({
//       ...item,
//       text: newText
//     })));
//     //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//   }
// };

// // Toggle text formatting
// const toggleFormat = (format) => {
//   if (format === 'align') {
//     const alignments = ['left', 'center', 'right'];
//     const currentIndex = alignments.indexOf(textFormatting.align);
//     const nextIndex = (currentIndex + 1) % alignments.length;

//     setTextFormatting(prev => ({ ...prev, align: alignments[nextIndex] }));

//     if (selectedId) {
//       setSections(prevSections => updateSections(selectedId, prevSections, item => ({
//         ...item,
//         align: alignments[nextIndex]
//       })));
//       //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//     }
//     return;
//   }
//   setTextFormatting(prev => {
//     const updated = { ...prev, [format]: !prev[format] };

//     if (selectedId) {
//       setSections(prevSections => updateSections(selectedId, prevSections, item => {
//         const fontStyle = [
//           updated.bold ? 'bold' : '',
//           updated.italic ? 'italic' : ''
//         ].join(' ').trim();

//         const textDecoration = updated.underline ? 'underline' : '';

//         return { ...item, fontStyle, textDecoration };
//       }));
//       //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//     }

//     return updated;
//   });
// };

//   // Change font family handler
//   const changeFontFamily = (newFont) => {
//     setTextFormatting(prev => {
//       const updated = { ...prev, fontFamily: newFont };
  
//       if (selectedId) {
//         setSections(prevSections => updateSections(selectedId, prevSections, item => ({
//           ...item,
//           fontFamily: newFont
//         })));
//         //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//       }
  
//       return updated;
//     });
//   };

// // Change font size handler
// const changeFontSize = (change) => {
//   setTextFormatting(prev => {
//     const newSize = Math.max(8, Math.min(72, prev.fontSize + change));
//     const updated = { ...prev, fontSize: newSize };

//     if (selectedId) {
//       setSections(prevSections => updateSections(selectedId, prevSections, item => ({
//         ...item,
//         fontSize: newSize
//       })));
//       //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//     }

//     return updated;
//   });
// };

// // Change color for selected item
// const changeItemColor = (color) => {
//   if (selectedId) {
//     setSections(prevSections => updateSections(selectedId, prevSections, item => ({
//       ...item,
//       fill: color
//     })));
//     //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
//   }
// };

// // Delete selected section or item
// const deleteSelected = () => {
//   if (!selectedId) return;

//   setSections(prevSections => 
//     prevSections
//       .map(section => {
//         if (section.id === selectedId) return null; // Remove section
//         return { ...section, items: section.items.filter(item => item.id !== selectedId) }; // Filter out item
//       })
//       .filter(Boolean) // Remove null values (deleted sections)
//   );

//   setSelectedId(null);
//   //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
// };



  // Convert dataURL to Blob
  

  // Helper function to update sections with proper Yjs sync
const updateSections = (selectedId, sections, updateFn) => {
  return sections.map(section => ({
    ...section,
    items: section.items.map(item => 
      item.id === selectedId && item.type === 'text'
        ? updateFn(item)
        : item
    )
  }));
};

// Load layout function with proper sync
const loadLayoutFromSelected = (layout) => {
  if (layout.gridSettings && layout.gridSettings.gutterWidth !== undefined) {
    setColumns(layout.gridSettings.columns);
    setRows(layout.gridSettings.rows);
    setGutterWidth(layout.gridSettings.gutterWidth);
    setLayoutType("Page");
  }

  const recalculatedSections = layout.sections.map(section => ({
    ...section,
    x: section.gridX * cellWidth + (section.gridX * gutterWidth),
    y: section.gridY * cellHeight 
  }));

  // Update sections and sync with Yjs in one go
  updateSectionsAndSync(recalculatedSections);
  setLayoutTitle(layout.title);
  setShowLayoutList(false);
  setShowSetupForm(false);
  console.log("Loaded layout:", layout);
};

// Text change handler with proper sync
const handleTextChange = (e) => {
  const newText = e.target.value;
  setTextValue(newText);

  if (selectedId) {
    const updatedSections = updateSections(selectedId, sections, item => ({
      ...item,
      text: newText
    }));
    updateSectionsAndSync(updatedSections);
  }
};

// Toggle format with proper sync
const toggleFormat = (format) => {
  if (format === 'align') {
    const alignments = ['left', 'center', 'right', 'justify'];
    const currentIndex = alignments.indexOf(textFormatting.align);
    const nextIndex = (currentIndex + 1) % alignments.length;

    setTextFormatting(prev => ({ ...prev, align: alignments[nextIndex] }));

    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => ({
        ...item,
        align: alignments[nextIndex]
      }));
      updateSectionsAndSync(updatedSections);
    }
    return;
  }

  setTextFormatting(prev => {
    const updated = { ...prev, [format]: !prev[format] };

    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => {
        const fontStyle = [
          updated.bold ? 'bold' : '',
          updated.italic ? 'italic' : ''
        ].join(' ').trim();

        const textDecoration = updated.underline ? 'underline' : '';
        return { ...item, fontStyle, textDecoration };
      });
      updateSectionsAndSync(updatedSections);
    }

    return updated;
  });
};

// Change font family with proper sync
const changeFontFamily = (newFont) => {
  setTextFormatting(prev => {
    const updated = { ...prev, fontFamily: newFont };

    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => ({
        ...item,
        fontFamily: newFont
      }));
      updateSectionsAndSync(updatedSections);
    }

    return updated;
  });
};

// Change font size with proper sync
const changeFontSize = (change) => {
  setTextFormatting(prev => {
    const newSize = Math.max(8, Math.min(72, prev.fontSize + change));
    const updated = { ...prev, fontSize: newSize };

    if (selectedId) {
      const updatedSections = updateSections(selectedId, sections, item => ({
        ...item,
        fontSize: newSize
      }));
      updateSectionsAndSync(updatedSections);
    }

    return updated;
  });
};

// Change color with proper sync
const changeItemColor = (color) => {
  if (selectedId) {
    const updatedSections = updateSections(selectedId, sections, item => ({
      ...item,
      fill: color
    }));
    updateSectionsAndSync(updatedSections);
  }
};

// Delete selected with proper sync
const deleteSelected = () => {
  if (!selectedId) return;

  const updatedSections = sections
    .map(section => {
      if (section.id === selectedId) return null;
      return {
        ...section,
        items: section.items.filter(item => item.id !== selectedId)
      };
    })
    .filter(Boolean);

  updateSectionsAndSync(updatedSections);
  setSelectedId(null);
};


  // Convert dataURL to Blob
  
  
  
  
  const dataURLToBlob = (dataURL) => {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  // Upload canvas image
  const uploadCanvasImage = () => {
    const stage = stageRef.current;
    console.log(stage);
    if (stage) {
      console.log("stage : -",stage);
      const dataURL = stage.toDataURL();
      console.log("dataURL : -",dataURL);
      const blob = dataURLToBlob(dataURL);
      const formData = new FormData();
      formData.append("image", blob, "canvas-image.png");
      fetch(`${SERVER_URL}/upload`, {
        method: "POST",
        body: formData,
         headers: { 'Authorization': `Bearer ${token}`},
      })
        .then(response => response.json())
        .then(data => console.log("Upload successful:", data))
        .catch(error => console.error("Error uploading:", error));
    }
  };

  const exportToCMYKPDF = async () => {
    const stage = stageRef.current;
    console.log(stage);
    const dataURL = stage.toDataURL({ pixelRatio: 3 }); // High-resolution

    const response = await fetch(dataURL);
    const imageBlob = await response.blob();
    const formData = new FormData();
    formData.append("image", imageBlob, "konva_image.png");

    try {
      const res = await fetch(`${SERVER_URL}/api/pdf/convert-cmyk`, {
        method: "POST",
        body: formData,
       headers: { 'Authorization': `Bearer ${token}`},
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      saveAs(blob, "CMYK_Newspaper_Export.pdf");
    } catch (error) {
      console.error("PDF conversion failed:", error);
    }
  };

  // Zoom handlers
  
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    const oldScale = stage.scaleX();
    //console.log("old-" , oldScale);
    
    const scaleBy = 1.02;
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    let newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setStageScale(newScale);
    stage.scale({ x: newScale, y: newScale });
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
  };

  const zoomBy = (factor) => {
    // console.log("factor: ", factor)
    const stage = stageRef.current;
    const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
    const oldScale = stage.scaleX();
    const newScale = oldScale * factor;
    setStageScale(newScale);
    const mousePointTo = {
      x: (center.x - stage.x()) / oldScale,
      y: (center.y - stage.y()) / oldScale,
    };
    const newPos = {
      x: center.x - mousePointTo.x * newScale,
      y: center.y - mousePointTo.y * newScale,
    };
    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
  };

  const fitStageToScreen = () => {
    if (!stageRef.current) return;
  
    const stage = stageRef.current;
  
    // Reset scale
    setStageScale(1);
    stage.scale({ x: 1, y: 1 });
  
    // Reset position
    stage.position({ x: 0, y: 0 });
  
    // Redraw the stage
    stage.batchDraw();
  };
  

  const handleTransformEndHelper = (node, cellWidth, gutterWidth, cellHeight, stageSize) => {
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();
    const newWidth = node.width() * scaleX;
    const newHeight = node.height() * scaleY;
    const totalCellWidth = cellWidth + gutterWidth;
    const colSpan = Math.round((newWidth + gutterWidth) / totalCellWidth);
    const snappedWidth = colSpan * cellWidth + (colSpan - 1) * gutterWidth;
    const rowSpan = Math.round(newHeight / cellHeight);
    const snappedHeight = rowSpan * cellHeight;
    return { snappedWidth, snappedHeight, colSpan, rowSpan };
  };



// Transformer onTransformEnd handler
// const handleTransformEnd = (e) => {
//   console.log("end : - ");
//   const node = e.target;
//   if (!selectedId || !sectionId) return;

//   const section = sections.find(sec => sec.id === sectionId);
//   if (!section) return;

//   const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
//     node,
//     cellWidth,
//     gutterWidth,
//     cellHeight,
//     stageSize
//   );

//   // Compute new gridX, gridY inside section
//   const newGridX = Math.round((node.x() - section.x) / (cellWidth + gutterWidth));
//   const newGridY = Math.round((node.y() - section.y) / cellHeight);

//   // Ensure grid position doesn't exceed section boundaries
//   const maxGridX = (section.width - snappedWidth) / (cellWidth + gutterWidth);
//   const maxGridY = (section.height - snappedHeight) / cellHeight;

//   setSections(prevSections =>
//     prevSections.map(sec =>
//       sec.id === sectionId
//         ? {
//             ...sec,
//             items: sec.items.map(item =>
//               item.id === selectedId
//                 ? {
//                     ...item,
//                     width: snappedWidth,
//                     height: snappedHeight,
//                     gridX: Math.max(0, Math.min(maxGridX, newGridX)),
//                     gridY: Math.max(0, Math.min(maxGridY, newGridY)),
//                     sizeInfo: { cols: colSpan, rows: rowSpan },
//                   }
//                 : item
//             ),
//           }
//         : sec
//     )
//   );
// // Sync to Yjs
//  // Only sync after state update is complete
//     syncYjsSections()
//   // Reset transformation
//   node.scaleX(1);
//   node.scaleY(1);
// };

// const handleTransformEnd = (e) => {
//   console.log("Transform end");
//   const node = e.target;
//   if (!selectedId || !sectionId) return;

//   const section = sections.find(sec => sec.id === sectionId);
//   if (!section) return;

//   const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
//     node,
//     cellWidth,
//     gutterWidth,
//     cellHeight,
//     stageSize
//   );

//   // Compute new gridX, gridY inside section
//   const newGridX = Math.round((node.x() - section.x) / (cellWidth + gutterWidth));
//   const newGridY = Math.round((node.y() - section.y) / cellHeight);

//   // Ensure grid position doesn't exceed section boundaries
//   const maxGridX = (section.width - snappedWidth) / (cellWidth + gutterWidth);
//   const maxGridY = (section.height - snappedHeight) / cellHeight;

//   // Create updated sections array
//   const updatedSections = sections.map(sec =>
//     sec.id === sectionId
//       ? {
//           ...sec,
//           items: sec.items.map(item =>
//             item.id === selectedId
//               ? {
//                   ...item,
//                   width: snappedWidth,
//                   height: snappedHeight,
//                   gridX: Math.max(0, Math.min(maxGridX, newGridX)),
//                   gridY: Math.max(0, Math.min(maxGridY, newGridY)),
//                   sizeInfo: { cols: colSpan, rows: rowSpan },
//                 }
//               : item
//           ),
//         }
//       : sec
//   );

//   // Update sections and sync with Yjs in one go
//   // updateSectionsAndSync(updatedSections);
//   setTimeout(() => {
//     updateSectionsAndSync(updatedSections);
// }, 0);
//   // Reset transformation
//   node.scaleX(1);
//   node.scaleY(1);
// };


// const handleTransformEnd = (e) => {
//   console.log("Transform end");
//   const node = e.target;
//   if (!selectedId || !sectionId) return;

//   const section = sections.find(sec => sec.id === sectionId);
//   if (!section) return;

//   const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
//     node,
//     cellWidth,
//     gutterWidth,
//     cellHeight,
//     stageSize
//   );

//   // Get absolute position of the node
//   const absoluteX = node.x();
//   const absoluteY = node.y();

//   // Calculate gridX and gridY directly based on absolute positions
//   // This is the key change - using absolute values instead of calculating relative to section
//   const gridX = Math.round(absoluteX / (cellWidth + gutterWidth));
//   const gridY = Math.round(absoluteY / cellHeight);

//   // Calculate section's grid position
//   const sectionGridX = Math.round(section.x / (cellWidth + gutterWidth));
//   const sectionGridY = Math.round(section.y / cellHeight);

//   // Calculate item's position relative to section in grid coordinates
//   const relativeGridX = gridX - sectionGridX;
//   const relativeGridY = gridY - sectionGridY;

//   // Calculate max allowed positions to ensure item stays within section boundaries
//   const sectionWidthInCells = Math.floor(section.width / (cellWidth + gutterWidth));
//   const sectionHeightInCells = Math.floor(section.height / cellHeight);
  
//   const itemWidthInCells = Math.ceil(snappedWidth / (cellWidth + gutterWidth));
//   const itemHeightInCells = Math.ceil(snappedHeight / cellHeight);
  
//   const maxGridX = Math.max(0, sectionWidthInCells - itemWidthInCells);
//   const maxGridY = Math.max(0, sectionHeightInCells - itemHeightInCells);

//   // Ensure grid position is within bounds
//   const boundedGridX = Math.max(0, Math.min(maxGridX, relativeGridX));
//   const boundedGridY = Math.max(0, Math.min(maxGridY, relativeGridY));

//   console.log("Transform calculations:", {
//     absoluteX, 
//     absoluteY,
//     gridX, 
//     gridY,
//     sectionGridX,
//     sectionGridY,
//     relativeGridX,
//     relativeGridY,
//     boundedGridX,
//     boundedGridY,
//     sectionWidthInCells,
//     itemWidthInCells
//   });

//   // Create updated sections array
//   const updatedSections = sections.map(sec =>
//     sec.id === sectionId
//       ? {
//           ...sec,
//           items: sec.items.map(item =>
//             item.id === selectedId
//               ? {
//                   ...item,
//                   width: snappedWidth,
//                   height: snappedHeight,
//                   gridX: boundedGridX,  // Use bounded values
//                   gridY: boundedGridY,
//                   sizeInfo: { cols: colSpan, rows: rowSpan },
//                 }
//               : item
//           ),
//         }
//       : sec
//   );

//   // Update sections and sync with Yjs
//   // Using setTimeout to ensure the UI updates properly before syncing
//   setTimeout(() => {
//     updateSectionsAndSync(updatedSections);
//   }, 0);

//   // Reset transformation
//   node.scaleX(1);
//   node.scaleY(1);
// };

const handleTransformEnd = (e) => {
  console.log("Transform end");
  const node = e.target;
  if (!selectedId || !sectionId) return;

  const section = sections.find(sec => sec.id === sectionId);
  if (!section) return;

  const { snappedWidth, snappedHeight, colSpan, rowSpan } = handleTransformEndHelper(
    node,
    cellWidth,
    gutterWidth,
    cellHeight,
    stageSize
  );

  // Compute new gridX, gridY inside section
  const newGridX = Math.round((node.x() - section.x) / (cellWidth + gutterWidth));
  const newGridY = Math.round((node.y() - section.y) / cellHeight);

  // Ensure grid position doesn't exceed section boundaries
  const maxGridX = (section.width - snappedWidth) / (cellWidth + gutterWidth);
  const maxGridY = (section.height - snappedHeight) / cellHeight;

  // Create updated sections array
  const updatedSections = sections.map(sec =>
    sec.id === sectionId
      ? {
          ...sec,
          items: sec.items.map(item =>
            item.id === selectedId
              ? {
                  ...item,
                  width: snappedWidth,
                  height: snappedHeight,
                  gridX: Math.max(0, Math.min(maxGridX, newGridX)),
                  gridY: Math.max(0, Math.min(maxGridY, newGridY)),
                  sizeInfo: { cols: colSpan, rows: rowSpan },
                }
              : item
          ),
        }
      : sec
  );

  // Update sections and sync with Yjs in one go
  // updateSectionsAndSync(updatedSections);
  setTimeout(() => {
    updateSectionsAndSync(updatedSections);
}, 0);
  // Reset transformation
  node.scaleX(1);
  node.scaleY(1);
};

  // Update transformer when selection changes
 // Update transformer when selection changes
useEffect(() => {
  if (!selectedId || !transformerRef.current) {
    transformerRef.current?.nodes([]);
    transformerRef.current?.getLayer()?.batchDraw();
    return;
  }

  // Find selected item inside sections
  let selectedItem = null;
  let selectedSection = null;

  for (const section of sections) {
    const item = section.items.find(i => i.id === selectedId);
    if (item) {
      selectedItem = item;
      selectedSection = section;
      break; // Stop searching once found
    }
  }

  if (!selectedItem) return;

  // Find the corresponding node in the Konva stage
  const selectedNode = transformerRef.current.getStage().findOne(`#${selectedId}`);

  if (selectedNode) {
    transformerRef.current.nodes([selectedNode]);
    transformerRef.current.getLayer().batchDraw();
    
    if (selectedItem.type === 'text') {
      setTextValue(selectedItem.text);
      setTextFormatting({
        bold: selectedItem.fontStyle?.includes('bold') || false,
        italic: selectedItem.fontStyle?.includes('italic') || false,
        underline: selectedItem.textDecoration === 'underline' || false,
        fontSize: selectedItem.fontSize || 16,
        align: selectedItem.align || 'left',
        fontFamily: selectedItem.fontFamily || 'Arial'
      });
    }
  }
}, [selectedId, sections]);


  // Global keydown handler for Delete key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') && 
        selectedId && 
        (layoutType === "Page" || selectedId !== sectionId) && 
        document.activeElement === document.body
      ) {
        deleteSelected();
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, layoutType, sectionId]);
  
  
    useEffect(() => {
      console.log("s-",stageRef);
      
      const container = stageRef.current && stageRef.current.container();
      if (container) {
        container.style.cursor = toolMode === "hand" ? "grab" : "default";
      }
    }, [toolMode]);

// Check if two grid rectangles overlap
const rectanglesOverlap = (boxA, boxB) => {
  //console.log("boxA -",boxA," BoxB - ",boxB);
  return (
    boxA.gridX < boxB.gridX + boxB.sizeInfo.cols &&
    boxA.gridX + boxA.sizeInfo.cols > boxB.gridX &&
    boxA.gridY < boxB.gridY + boxB.sizeInfo.rows &&
    boxA.gridY + boxA.sizeInfo.rows > boxB.gridY
  );  
};

const findBestPositionForBox = (item, fixedItems, columns, rows, originalPosition) => {
  if (originalPosition) {
    let conflict = false;
    for (let other of fixedItems) {
      if (rectanglesOverlap({ ...item, gridX: originalPosition.gridX, gridY: originalPosition.gridY }, other)) {
        conflict = true;
        break;
      }
    }
    if (!conflict) return originalPosition;
  }

  const possiblePositions = [];
  
  // Use `item.sizeInfo.cols` and `item.sizeInfo.rows` instead of `item.width` & `item.height`
  console.log("size : -",item.sizeInfo);
  for (let y = 0; y <= rows - item.sizeInfo.rows; y++) {
    for (let x = 0; x <= columns - item.sizeInfo.cols; x++) {
      let conflict = false;
      for (let other of fixedItems) {
        if (rectanglesOverlap({ ...item, gridX: x, gridY: y }, other)) {
          conflict = true;
          break;
        }
      }
      if (!conflict) {
        let distance = originalPosition
          ? Math.sqrt(Math.pow(x - originalPosition.gridX, 2) + Math.pow(y - originalPosition.gridY, 2))
          : x + y;
        possiblePositions.push({ gridX: x, gridY: y, distance });
      }
    }
  }

  possiblePositions.sort((a, b) => a.distance - b.distance);
  return possiblePositions.length > 0 ? possiblePositions[0] : null;
};




// // addBox function for predefined sizes
// const addPredefineditem = (size,type) => {
//   // if (!newBoxContent && newBoxType === 'text') {
//   //   alert('Please enter text content for the new box');
//   //   return;
//   // }
//   let newItem;
//   if(type == "box")
//   newItem = addBox(size);
//   else if(type == "text")
//   newItem = addTextBox(size);
//   else
//   newItem = addImageItem(size);

//   const position = findBestPositionForBox(newItem, items, columns, rows);
//   if (!position) {
//     alert('No space available for new box');
//     return;
//   }
//   console.log("position: - ",position);
//   newItem.gridX = position.gridX;
//   newItem.gridY = position.gridY;
//   newItem.x = newItem.gridX * cellWidth + (newItem.gridX) * gutterWidth;
//   newItem.y = newItem.gridY * cellHeight;
//   setSections(prev => [...prev, newItem]);
//   setSelectedId(newItem.id);
//   //yjs
//    // Only sync after state update is complete
//     syncYjsSections()
  
// };


// Cascade reposition all boxes that would be displaced

const addPredefinedItem = (size, type) => {
  // Create new item based on type
  let newItem;
  if (type === "box") {
    newItem = addBox(size);
  } else if (type === "text") {
    newItem = addTextBox(size);
  } else {
    newItem = addImageItem(size);
  }

  // Find best position for the new item
  const position = findBestPositionForBox(newItem, sections, columns, rows);
  if (!position) {
    alert('No space available for new item');
    return;
  }

  // Calculate grid position and coordinates
  newItem.gridX = position.gridX;
  newItem.gridY = position.gridY;
  newItem.x = newItem.gridX * cellWidth + (newItem.gridX) * gutterWidth;
  newItem.y = newItem.gridY * cellHeight;

  // Create updated sections array with new item
  const updatedSections = [...sections, newItem];

  // Update sections and sync with Yjs in one go
  updateSectionsAndSync(updatedSections);
  setSelectedId(newItem.id);
};

const repositionBoxes = (movingItem, targetPosition, allItems, columns, rows) => {
  const result = { success: false, newPositions: {} };
  const fixedBoxes = [];
  const boxesToProcess = [...allItems];

  const movingBoxWithNewPos = { ...movingItem, gridX: targetPosition.gridX, gridY: targetPosition.gridY };
  fixedBoxes.push(movingBoxWithNewPos);
  result.newPositions[movingItem.id] = { gridX: targetPosition.gridX, gridY: targetPosition.gridY };

  const index = boxesToProcess.findIndex(b => b.id === movingItem.id);
  if (index !== -1) boxesToProcess.splice(index, 1);

  let overlappingBoxes = boxesToProcess.filter(box => rectanglesOverlap(movingBoxWithNewPos, box));

  const processBox = (box, remainingBoxes, processedBoxes = new Set()) => {
    if (processedBoxes.has(box.id)) return true;
    processedBoxes.add(box.id);
    const originalPos = { gridX: box.gridX, gridY: box.gridY };
    const newPos = findBestPositionForBox(box, fixedBoxes, columns, rows, originalPos);
    if (!newPos) return false;
    const boxWithNewPos = { ...box, gridX: newPos.gridX, gridY: newPos.gridY };
    fixedBoxes.push(boxWithNewPos);
    result.newPositions[box.id] = { gridX: newPos.gridX, gridY: newPos.gridY };

    const newOverlappingBoxes = remainingBoxes.filter(b => b.id !== box.id && rectanglesOverlap(boxWithNewPos, b));
    for (const overlappingBox of newOverlappingBoxes) {
      const success = processBox(overlappingBox, remainingBoxes.filter(b => b.id !== overlappingBox.id), processedBoxes);
      if (!success) return false;
    }
    return true;
  };

  let remainingToProcess = [...boxesToProcess];
  for (const overlappingBox of overlappingBoxes) {
    const success = processBox(overlappingBox, remainingToProcess.filter(b => b.id !== overlappingBox.id));
    if (!success) return result;
    remainingToProcess = remainingToProcess.filter(b => b.id !== overlappingBox.id);
  }
  result.success = true;
  return result;
};


  const [draggingBox, setDraggingBox] = useState(null);
  const [dragPreviewPosition, setDragPreviewPosition] = useState(null);
  const [dragStatus, setDragStatus] = useState(null);
  const [snapLines, setSnapLines] = useState([]);

  const repositionItemsInSection = (movingItem, targetPosition, section) => {
    const result = { success: false, newPositions: {} };
    const fixedItems = [];
    const itemsToProcess = [...section.items];
  
    // Update the position of the moving item
    const movingItemWithNewPos = { ...movingItem, gridX: targetPosition.gridX, gridY: targetPosition.gridY };
    fixedItems.push(movingItemWithNewPos);
    result.newPositions[movingItem.id] = { gridX: targetPosition.gridX, gridY: targetPosition.gridY };
  
    // Remove moving item from the processing list
    const index = itemsToProcess.findIndex(item => item.id === movingItem.id);
    if (index !== -1) itemsToProcess.splice(index, 1);
  
    let overlappingItems = itemsToProcess.filter(item => itemsOverlap(movingItemWithNewPos, item));
  
    const processItem = (item, remainingItems, processedItems = new Set()) => {
      if (processedItems.has(item.id)) return true;
      processedItems.add(item.id);
      
      const originalPos = { gridX: item.gridX, gridY: item.gridY };
      const newPos = findBestPositionForItem(item, fixedItems, section.sizeInfo, originalPos);
      
      if (!newPos) return false; // No space found
  
      const itemWithNewPos = { ...item, gridX: newPos.gridX, gridY: newPos.gridY };
      fixedItems.push(itemWithNewPos);
      result.newPositions[item.id] = { gridX: newPos.gridX, gridY: newPos.gridY };
  
      // Check for overlapping items after moving
      const newOverlappingItems = remainingItems.filter(
        b => b.id !== item.id && itemsOverlap(itemWithNewPos, b)
      );
      
      for (const overlappingItem of newOverlappingItems) {
        const success = processItem(overlappingItem, remainingItems.filter(b => b.id !== overlappingItem.id), processedItems);
        if (!success) return false;
      }
      return true;
    };
  
    let remainingToProcess = [...itemsToProcess];
    for (const overlappingItem of overlappingItems) {
      const success = processItem(overlappingItem, remainingToProcess.filter(b => b.id !== overlappingItem.id));
      if (!success) return result;
      remainingToProcess = remainingToProcess.filter(b => b.id !== overlappingItem.id);
    }
  
    result.success = true;
    return result;
  };
  

// Reset item position if movement is invalid
const resetItemPosition = (e, id, currentItem) => {
  if (!e || !e.target) {
    alert("Error: Dragging operation failed."); // Alert if event is missing
    return;
  }

  const stageNode = e.target.getStage();
  const layer = stageNode.findOne('Layer');
  const group = layer.findOne(`#${id}`);
  
  if (group) {
    group.to({
      x: currentItem.gridX * (cellWidth + gutterWidth),
      y: currentItem.gridY * cellHeight,
      duration: 0.3
    });
  }
};

// // Handle item drag inside a section
// const handleItemDragEnd = (e, itemId, sectionId) => {
//   setSections(prevSections =>
//     prevSections.map(section => {
//       if (section.id !== sectionId) return section; // Ignore other sections

//       const currentItem = section.items.find(item => item.id === itemId);
//       if (!currentItem || !dragPreviewPosition) {
//         resetDragState();
//         return section;
//       }

//       const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
//       if (newGridX === currentItem.gridX && newGridY === currentItem.gridY) {
//         resetDragState();
//         return section;
//       }

//       // Reposition items inside the section
//       const repositionResult = repositionItemsInSection(currentItem, { gridX: newGridX, gridY: newGridY }, section);
      
//       if (repositionResult.success) {
//         return {
//           ...section,
//           items: section.items.map(item =>
//             repositionResult.newPositions[item.id]
//               ? {
//                   ...item,
//                   gridX: repositionResult.newPositions[item.id].gridX,
//                   gridY: repositionResult.newPositions[item.id].gridY,
//                   x: repositionResult.newPositions[item.id].gridX * (cellWidth + gutterWidth),
//                   y: repositionResult.newPositions[item.id].gridY * cellHeight
//                 }
//               : item
//           )
//         };
//       } else {
//         alert("Cannot move item: No available space.");
//         resetItemPosition(e, itemId, currentItem); // Pass event here
//         return section;
//       }
//     })
//   );
//   console.log("Local drag end update applied for item:", itemId);
// // Sync to Yjs
//  // Only sync after state update is complete
//     syncYjsSections()
//   resetDragState();
// };
  
  
  // Handle item dragging
  
  const handleItemDragEnd = (e, itemId, sectionId) => {
    setSnapLines([]); // Clear snap lines
  
    // Create updated sections array
    const updatedSections = sections.map(section => {
      if (section.id !== sectionId) return section; // Ignore other sections
  
      const currentItem = section.items.find(item => item.id === itemId);
      if (!currentItem || !dragPreviewPosition) {
        resetDragState();
        return section;
      }
  
      const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
      if (newGridX === currentItem.gridX && newGridY === currentItem.gridY) {
        resetDragState();
        return section;
      }
  
      // Reposition items inside the section
      const repositionResult = repositionItemsInSection(
        currentItem, 
        { gridX: newGridX, gridY: newGridY }, 
        section
      );
      
      if (repositionResult.success) {
        return {
          ...section,
          items: section.items.map(item =>
            repositionResult.newPositions[item.id]
              ? {
                  ...item,
                  gridX: repositionResult.newPositions[item.id].gridX,
                  gridY: repositionResult.newPositions[item.id].gridY,
                  x: repositionResult.newPositions[item.id].gridX * (cellWidth + gutterWidth),
                  y: repositionResult.newPositions[item.id].gridY * cellHeight
                }
              : item
          )
        };
      } else {
        alert("Cannot move item: No available space.");
        resetItemPosition(e, itemId, currentItem);
        return section;
      }
    });
  
    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
    console.log("Item drag end update applied for:", itemId);
    
    resetDragState();
  };
  
  
  // const handleItemDragMove = (e, itemId, sectionId) => {
  //   if (!draggingBox) return;
  //   const shape = e.target;
  //   const pixelPosition = { x: shape.x(), y: shape.y() };
  //   const gridPosition = snapToGrid(pixelPosition);
  
  //   const currentSection = sections.find(section => section.id === sectionId);
  //   if (!currentSection) return;
    
  //   const currentItem = currentSection.items.find(item => item.id === itemId);
  //   if (!currentItem) return;
  
  //   const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), currentSection.sizeInfo.cols - currentItem.sizeInfo.cols);
  //   const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), currentSection.sizeInfo.rows - currentItem.sizeInfo.rows);
  
  //   setSnapLines(generateSnapLines(currentItem, { gridX: clampedGridX, gridY: clampedGridY }));
  //   shape.position({
  //     x: clampedGridX * (cellWidth + gutterWidth),
  //     y: clampedGridY * cellHeight
  //   });
  //   setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
  // };
  
  // Snap to grid logic for sections
  
  // In handleItemDragMove
const handleItemDragMove = (e, itemId, sectionId) => {
  if (!draggingBox) return;

  const shape = e.target;
  const section = sections.find(s => s.id === sectionId);
  const item = section?.items.find(i => i.id === itemId);
  
  if (!section || !item) return;

  const pixelPosition = { x: shape.x(), y: shape.y() };
  const gridPosition = snapToGrid(pixelPosition);

  const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), 
    section.sizeInfo.cols - item.sizeInfo.cols);
  const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), 
    section.sizeInfo.rows - item.sizeInfo.rows);
// Update position display
setPositionDisplay({
  show: true,
  x: shape.x() + section.x,
  y: shape.y() + section.y,
  gridX: clampedGridX,
  gridY: clampedGridY,
  isSection: false
});
  // Generate snap lines relative to section
  setSnapLines(generateSnapLines(item, { 
    gridX: clampedGridX, 
    gridY: clampedGridY 
  }, section));

  shape.position({
    x: clampedGridX * (cellWidth + gutterWidth),
    y: clampedGridY * cellHeight
  });
  
  setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
};
  
  const snapToGrid = (pixelPosition) => {
    const gridX = Math.round(pixelPosition.x / (cellWidth + gutterWidth));
    const gridY = Math.round(pixelPosition.y / cellHeight);
  
    return {
      gridX: Math.max(0, gridX),
      gridY: Math.max(0, gridY)
    };
  };
  
  // Generate snapping lines
  // const generateSnapLines = (currentItem, gridPos) => {
  //   if (!currentItem) return [];
  
  //   const lines = [];
  //   const leftX = gridPos.gridX * (cellWidth + gutterWidth);
  //   const rightX = leftX + (currentItem.sizeInfo.cols * cellWidth) + ((currentItem.sizeInfo.cols - 1) * gutterWidth);
  //   const topY = gridPos.gridY * cellHeight;
  //   const bottomY = topY + (currentItem.sizeInfo.rows * cellHeight);
  
  //   lines.push({ points: [leftX, 0, leftX, stageSize.height], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
  //   lines.push({ points: [rightX, 0, rightX, stageSize.height], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
  //   lines.push({ points: [0, topY, stageSize.width, topY], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
  //   lines.push({ points: [0, bottomY, stageSize.width, bottomY], stroke: '#2196F3', strokeWidth: 1, dash: [5, 5] });
  
  //   return lines;
  // };

  const generateSnapLines = (item, gridPos, container) => {
    if (!item || !gridPos || !container) return [];
  
    // Calculate positions
    const leftX = container.x + (gridPos.gridX * (cellWidth + gutterWidth));
    const rightX = leftX + item.width;
    const topY = container.y + (gridPos.gridY * cellHeight);
    const bottomY = topY + item.height;
  
    // Add center lines
    const centerX = leftX + (item.width / 2);
    const centerY = topY + (item.height / 2);
  
    // Container boundaries
    const containerLeft = container.x;
    const containerRight = container.x + container.width;
    const containerTop = container.y;
    const containerBottom = container.y + container.height;
  
    // Create snap lines with different colors for sections vs items
    const isSection = item.type === 'section';
    const primaryColor = isSection ? '#ff6b6b' : '#00ff00';
    const secondaryColor = isSection ? '#ff8787' : '#ff0000';
  
    const lines = [
      // Edges
      {
        points: [leftX, containerTop, leftX, containerBottom],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [rightX, containerTop, rightX, containerBottom],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [containerLeft, topY, containerRight, topY],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      {
        points: [containerLeft, bottomY, containerRight, bottomY],
        stroke: primaryColor,
        strokeWidth: isSection ? 3 : 2,
        dash: [8, 6],
        opacity: 0.8
      },
      // Center lines
      {
        points: [centerX, containerTop, centerX, containerBottom],
        stroke: secondaryColor,
        strokeWidth: isSection ? 2.5 : 2,
        dash: [6, 6],
        opacity: 0.7
      },
      {
        points: [containerLeft, centerY, containerRight, centerY],
        stroke: secondaryColor,
        strokeWidth: isSection ? 2.5 : 2,
        dash: [6, 6],
        opacity: 0.7
      }
    ];
  
    // Add grid snap indicators
    const gridLines = Array.from({ length: columns + 1 }, (_, i) => ({
      points: [
        i * (cellWidth + gutterWidth),
        containerTop,
        i * (cellWidth + gutterWidth),
        containerBottom
      ],
      stroke: '#4299e1',
      strokeWidth: 1,
      dash: [4, 4],
      opacity: 0.3
    }));
  
    return [...lines, ...gridLines];
  };
  
  // Reset drag state
  const resetDragState = () => {
    setDraggingBox(null);
    setDragPreviewPosition(null);
    setDragStatus(null);
    setPositionDisplay({ show: false, x: 0, y: 0, gridX: 0, gridY: 0, isSection: false });
  };
  const handleItemDragStart = (e, itemId, sectionId) => {
    setDraggingBox(itemId);
    setDragStatus(null);
  
    // Find the section and item being dragged
    const section = sections.find(sec => sec.id === sectionId);
    if (!section) return;
  
    const currentItem = section.items.find(item => item.id === itemId);
    if (!currentItem) return;
  
    // Generate snap lines within the section boundaries
    setSnapLines(generateSnapLines(currentItem, { gridX: currentItem.gridX, gridY: currentItem.gridY }));
  };
    
  const handleDragStart = (e, id) => {
    setDraggingBox(id);
    setDragStatus(null);
    
    const currentSection = sections.find(b => b.id === id);
    if (!currentSection) return;
  
    const canvasSection = {
      x: 0,
      y: 0,
      width: stageSize.width,
      height: stageSize.height
    };
  
    setSnapLines(generateSnapLines(currentSection, { 
      gridX: currentSection.gridX, 
      gridY: currentSection.gridY 
    }, canvasSection));
  };
    
    // const handleDragMove = (e, id) => {
    //   if (!draggingBox) return;
    //   const shape = e.target;
    //   const pixelPosition = { x: shape.x(), y: shape.y() };
    //   const gridPosition = snapToGrid(pixelPosition);
    //   const currentBox = sections.find(b => b.id === id);
    //   if (!currentBox) return;
    
    //   const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), columns - currentBox.sizeInfo.cols);
    //   const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), rows - currentBox.sizeInfo.rows);
    
    //   setSnapLines(generateSnapLines(currentBox, { gridX: clampedGridX, gridY: clampedGridY }));
    //   shape.position({
    //     x: clampedGridX * (cellWidth + gutterWidth),
    //     y: clampedGridY * cellHeight
    //   });
    //   setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
    // };
    
    
    // const handleDragEnd = (e, id) => {
    //   setSnapLines([]);
    //   const currentBox = sections.find(b => b.id === id);
      
    //   if (!currentBox || !dragPreviewPosition) {
    //     resetDragState();
    //     return;
    //   }
    
    //   const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
    //   if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
    //     resetDragState();
    //     return;
    //   }
    
    //   const repositionResult = repositionBoxes(currentBox, { gridX: newGridX, gridY: newGridY }, sections, columns, rows);
      
    //   if (repositionResult.success) {
    //     setSections(prevBoxes =>
    //       prevBoxes.map(box =>
    //         repositionResult.newPositions[box.id]
    //           ? {
    //               ...box,
    //               gridX: repositionResult.newPositions[box.id].gridX,
    //               gridY: repositionResult.newPositions[box.id].gridY,
    //               x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
    //               y: repositionResult.newPositions[box.id].gridY * cellHeight,
    //             }
    //           : box
    //       )
    //     );
    //   } else {
    //     alert("Cannot move item: No available space.");
    //     resetBoxPosition(e, id, currentBox); // ✅ Pass event `e`
    //   }
    //   //yjs
    //    // Only sync after state update is complete
    // syncYjsSections()
    //   resetDragState();
    // };

// ✅ Fix: Pass `e` as a parameter to prevent ReferenceError

// const handleDragMove = (e, id) => {
//   if (!draggingBox) return;
  
//   const shape = e.target;
//   const pixelPosition = { x: shape.x(), y: shape.y() };
//   const gridPosition = snapToGrid(pixelPosition);
//   const currentBox = sections.find(b => b.id === id);
  
//   if (!currentBox) return;

//   const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), columns - currentBox.sizeInfo.cols);
//   const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), rows - currentBox.sizeInfo.rows);

//   // Clear existing snap lines and generate new ones
//   setSnapLines(generateSnapLines(currentBox, { 
//     gridX: clampedGridX, 
//     gridY: clampedGridY 
//   }));

//   // Update position
//   shape.position({
//     x: clampedGridX * (cellWidth + gutterWidth),
//     y: clampedGridY * cellHeight
//   });
  
//   setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
// };

// In handleDragMove, update it to pass section context correctly
const handleDragMove = (e, id) => {
  if (!draggingBox) return;
  
  const shape = e.target;
  const currentSection = sections.find(b => b.id === id);
  
  if (!currentSection) return;

  const pixelPosition = { x: shape.x(), y: shape.y() };
  const gridPosition = snapToGrid(pixelPosition);

  const clampedGridX = Math.min(Math.max(0, gridPosition.gridX), 
    columns - currentSection.sizeInfo.cols);
  const clampedGridY = Math.min(Math.max(0, gridPosition.gridY), 
    rows - currentSection.sizeInfo.rows);

    // Update position display
  setPositionDisplay({
    show: true,
    x: shape.x(),
    y: shape.y(),
    gridX: clampedGridX,
    gridY: clampedGridY,
    isSection: true
  });

  
  // Create a parent section context for the whole canvas
  const canvasSection = {
    x: 0,
    y: 0,
    width: stageSize.width,
    height: stageSize.height
  };

  // Generate snap lines with canvas as parent section
  setSnapLines(generateSnapLines(currentSection, { 
    gridX: clampedGridX, 
    gridY: clampedGridY 
  }, canvasSection));

  shape.position({
    x: clampedGridX * (cellWidth + gutterWidth),
    y: clampedGridY * cellHeight
  });
  
  setDragPreviewPosition({ gridX: clampedGridX, gridY: clampedGridY });
};


const handleDragEnd = (e, id) => {
  setSnapLines([]); // Clear snap lines
  const currentBox = sections.find(b => b.id === id);
  
  if (!currentBox || !dragPreviewPosition) {
    resetDragState();
    return;
  }

  const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
  if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
    resetDragState();
    return;
  }

  const repositionResult = repositionBoxes(
    currentBox, 
    { gridX: newGridX, gridY: newGridY }, 
    sections, 
    columns, 
    rows
  );
  
  if (repositionResult.success) {
    // Create updated sections array
    const updatedSections = sections.map(box =>
      repositionResult.newPositions[box.id]
        ? {
            ...box,
            gridX: repositionResult.newPositions[box.id].gridX,
            gridY: repositionResult.newPositions[box.id].gridY,
            x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
            y: repositionResult.newPositions[box.id].gridY * cellHeight,
          }
        : box
    );

    // Update sections and sync with Yjs in one go
    updateSectionsAndSync(updatedSections);
  } else {
    alert("Cannot move item: No available space.");
    resetBoxPosition(e, id, currentBox);
  }

  resetDragState();
};



const resetBoxPosition = (e, id, currentBox) => {
  if (!e || !e.target) {
    alert("Error: Dragging operation failed."); // Alert if event is missing
    return;
  }

  const stageNode = e.target.getStage();
  const layer = stageNode.findOne('Layer');
  const group = layer.findOne(`#${id}`);

  if (group) {
    group.to({
      x: currentBox.gridX * (cellWidth + gutterWidth),
      y: currentBox.gridY * cellHeight,
      duration: 0.3, //
      easing: Konva.Easings.EaseOut
    });
  }
};
    
    
  
// Drag end handler (snapping)
// const handleDragEnd = (e) => {
//   const id = e.target.id();
//   const shape = e.target;
//   const totalCellWidth = cellWidth + gutterWidth;
//   const colIndex = Math.round(shape.x() / totalCellWidth);
//   const rowIndex = Math.round(shape.y() / cellHeight);
//   const maxColIndex = columns - (items.find(i => i.id === id)?.sizeInfo?.cols || 1);
//   const boundedColIndex = Math.min(Math.max(0, colIndex), maxColIndex);
//   const boundedX = boundedColIndex * totalCellWidth;
//   const maxRowIndex = rows - (items.find(i => i.id === id)?.sizeInfo?.rows || 1);
//   const boundedRowIndex = Math.min(Math.max(0, rowIndex), maxRowIndex);
//   const boundedY = boundedRowIndex * cellHeight;
//   const updatedItems = items.map(item =>
//     item.id === id ? { ...item, x: boundedX, y: boundedY} : item
//   );
//   setSections(updatedItems);
// };

// const handleDragEnd = (e, id) => {
//   setSnapLines([]); // Clear snap lines
  
//   const currentBox = items.find(b => b.id === id);
//   if (!currentBox || !dragPreviewPosition) {
//     setDraggingBox(null);
//     setDragPreviewPosition(null);
//     setDragStatus(null);
//     return;
//   }

//   const { gridX: newGridX, gridY: newGridY } = dragPreviewPosition;
  
//   // No movement, just reset
//   if (newGridX === currentBox.gridX && newGridY === currentBox.gridY) {
//     setDraggingBox(null);
//     setDragPreviewPosition(null);
//     setDragStatus(null);
//     return;
//   }

//   // Try repositioning
//   const repositionResult = repositionBoxes(
//     currentBox,
//     { gridX: newGridX, gridY: newGridY },
//     items,
//     columns,
//     rows
//   );

//   if (repositionResult.success) {
//     // Update the state with new positions
//     setSections(prevBoxes =>
//       prevBoxes.map(box => {
//         if (repositionResult.newPositions[box.id]) {
//           return {
//             ...box,
//             gridX: repositionResult.newPositions[box.id].gridX,
//             gridY: repositionResult.newPositions[box.id].gridY,
//             x: repositionResult.newPositions[box.id].gridX * (cellWidth + gutterWidth),
//             y: repositionResult.newPositions[box.id].gridY * cellHeight,
//           };
//         }
//         return box;
//       })
//     );
//   } else {
//     // If invalid, reset position visually
//     const stageNode = e.target.getStage();
//     const layer = stageNode.findOne('Layer');
//     const group = layer.findOne(`#${id}`);

//     if (group) {
//       group.to({
//         x: currentBox.gridX * (cellWidth + gutterWidth),
//         y: currentBox.gridY * cellHeight,
//         duration: 0.3
//       });
//     }
//   }

//   setDraggingBox(null);
//   setDragPreviewPosition(null);
//   setDragStatus(null);
// };




// // addCustomBox uses custom inputs for width/height
// const addCustomBox = () => {
//   // if (!newBoxContent && newBoxType === 'text') {
//   //   alert('Please enter text content for the new box');
//   //   return;
//   // }
//   const newBox = {
//     id: `box${boxes.length + 1}`,
//     width: newBoxWidth,
//     height: newBoxHeight,
//     type: newBoxType,
//     text: newBoxType === 'text' ? newBoxContent : 'Image'
//   };
//   const position = findBestPositionForBox(newBox, boxes, columns, rows);
//   if (!position) {
//     alert('No space available for new box');
//     return;
//   }
//   newBox.gridX = position.gridX;
//   newBox.gridY = position.gridY;
//   setBoxes([...boxes, newBox]);
//   setNewBoxContent('');
// };
//=================================

const [isLoading, setIsLoading] = useState(true);
const [error, setError] = useState(null);
const { layoutid } = useParams();

const fetchLayoutById = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${SERVER_URL}/api/layouts/${layoutid}`, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Layout not found');
    }

    const layout = await response.json();
    // Use the existing loadLayoutFromSelected function from context
    loadLayoutFromSelected(layout);
    setIsLoading(false);
  } catch (err) {
    console.error('Error fetching layout:', err);
    setError(err.message);
    setIsLoading(false);
  }
};
// Add this to your WorkPage component

const LoadingState = () => (
  <div className="loading-container" style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <CircularProgress />
    <Typography variant="h6" style={{ marginLeft: '1rem' }}>
      Loading layout...
    </Typography>
  </div>
);

// Update the loading check in your component:
// useEffect(() => {
// if (isLoading) {
//   return <LoadingState />;
// }
// }, [isLoading]);
const ErrorState = ({ error }) => (
  <div className="error-container" style={{
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  }}>
    <Typography variant="h5" color="error" gutterBottom>
      Error Loading Layout
    </Typography>
    <Typography variant="body1">
      {error}
    </Typography>
    <Button 
      variant="contained" 
      color="primary" 
      onClick={() => window.history.back()}
      style={{ marginTop: '1rem' }}
    >
      Go Back
    </Button>
  </div>
);

// Update the error check in your component:
// useEffect(() => {
// if (error) {
//   return <ErrorState error={error} />;
// }
// }, [error]);

// useEffect(() => {
//   if (layoutid) {
//     fetchLayoutById();
//   }
// }, [layoutid]);
if (isLoading) {
  LoadingState();
}

if (error) {
  ErrorState(error);
}

useEffect(() => {
  if (layoutid) {
    fetchLayoutById();
  }
}, [layoutid]);


//=================================
return {
  userId,
  showSetupForm,
  setShowSetupForm,
  layoutTitle,
  setSections,
  setLayoutTitle,
  columns,
  setColumns,
  rows,
  setRows,
  gutterWidth,
  setGutterWidth,
  stageSize,
  stageScale,
  toolMode,
  setToolMode,
  selectedId,
  setSelectedId,
  availableLayouts,
  showLayoutList,
  setShowLayoutList,
  textValue,
  setTextValue,
  textFormatting,
  setTextFormatting,
  stageRef,
  transformerRef,
  itemSizes,
  colors,
  uploadCanvasImage,
  saveLayout,
  fetchAvailableLayouts,
  zoomBy,
  handleWheel,
  addBox,
  addTextBox,
  addImageItem,
  handleImageUpload,
  handleTextChange,
  toggleFormat,
  changeFontSize,
  changeItemColor,
  deleteSelected,
  handleTransformEnd,
  loadLayoutFromSelected,
  cellWidth,
  cellHeight,
  addPredefinedItem,
  addNewSection,
  addItemToSection,
  setSectionId,
  sectionId,
  sections,
  handleItemDragEnd,
  handleItemDragStart,
  handleItemDragMove,
  handleDragStart,
  handleDragEnd,
  handleDragMove,
  // addNewSection,
  exportToCMYKPDF,
    fitStageToScreen,
    fetchAvailableSections,
  
    city,
    setCity,
    dueDate,
    setDueDate,
    taskStatus,
    setTaskStatus,
    layoutType,
    setLayoutType,
    setHideGrid,        // New state function to hide grid
    setHideBackground,  // New state function to hide background
    hideGrid,       // New prop to control grid visibility
    hideBackground, // New prop to control background visibility
    changeFontFamily,
    handleDeleteLayout,
    isDeleting,
    snapLines,
    userID,
    setUserID,
    userProfilePic,
    activeEditors,
    positionDisplay,
    activeUsersCount,
    // layoutType,
    // setLayoutType,
    fetchLayoutById,
    LoadingState,
};


};

export default useWorkbench;