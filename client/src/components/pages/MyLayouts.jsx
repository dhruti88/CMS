import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import SelectionBar from "../atoms/SelectionBar";
import Pagination from "../atoms/Pagination";
import Footer from "../atoms/Footer";
import { useAuth } from "../../context/AuthContext";
//import { WorkbenchContext } from "../../context/WorkbenchContext";
import {
  Box,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Stack,
  Divider,
  Paper,
  Container,
  Skeleton,
  CardHeader,
  Avatar
} from "@mui/material";
import {
  CalendarMonth,
  LocationCity,
  Newspaper,
  Public,
  TaskAlt,
  GridView
} from "@mui/icons-material";

const MyLayouts = () => {
  const [newsItems, setNewsItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 8;

  const navigate = useNavigate();
  const { user } = useAuth();
  //const { loadLayoutFromSelected } = useContext(WorkbenchContext);

  // Load layout and navigate to editor
  const loadLayout = (item) => {
    //loadLayoutFromSelected(item);
    // slight delay to ensure context state is set before navigation
    setTimeout(() => navigate(`/page/${item._id}`), 10);
  };

  // Fetch layouts
  useEffect(() => {
    const fetchLayouts = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/signin");
        return;
      }
      
      setLoading(true);
      try {
        const { data: { layouts } } = await axios.get(
          "http://localhost:8000/api/my-layouts",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setNewsItems(layouts);
        setFilteredItems(layouts);
      } catch (err) {
        console.error("Error fetching layouts:", err.response?.data?.error || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchLayouts();
  }, [user, navigate]);

  // Filtering Logic
  const handleSearch = (filters) => {
    const filtered = newsItems.filter(item => {
      const fd = item.duedate
        ? new Date(item.duedate).toISOString().split("T")[0]
        : "";
      return (
        (!filters.city || item.city?.toLowerCase() === filters.city.toLowerCase()) &&
        (!filters.dueDate || fd === filters.dueDate) &&
        (!filters.taskStatus || item.taskstatus?.toLowerCase() === filters.taskStatus.toLowerCase()) &&
        (!filters.title || item.title?.toLowerCase().includes(filters.title.toLowerCase())) &&
        (!filters.layoutType || item.layouttype?.toLowerCase() === filters.layoutType.toLowerCase()) &&
        (!filters.rows || item.gridSettings?.rows === Number(filters.rows)) &&
        (!filters.cols || item.gridSettings?.columns === Number(filters.cols))
      );
    });
    setFilteredItems(filtered);
    setCurrentPage(1);
  };

  let totalPages = 0, paginatedItems = 0;
  // Pagination Logic
  if(filteredItems)
  { totalPages = Math.ceil(filteredItems.length / itemsPerPage);
    paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );}

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Function to get status color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'success';
      case 'in progress': return 'info';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  // Fixed function to handle image display from backend
  const getImageUrl = (item) => {
    console.log("Image Item:", item);
    // Check if the image data is already a URL string
    // if (item.stageImage?.data ) {
    //   // Already a string URL or base64
    //   return item.stageImage.data;
    // }
    
    // // If image data is present but not as expected format
    // if (item.stageImage?.contentType) {
    //   // Try to use the image directly if it's available as a URL
    //   return `/api/layouts/image/${item._id}`;
    // }
    
    // Fallback to placeholder
  
    return '/3.jpg';
  };

  return (
    <Container maxWidth="xl" sx = {{mt : "80px"}}> 
        <SelectionBar onSearch={handleSearch}/>

      {loading ? (
        <Grid container spacing={3}>
          {[...Array(8)].map((_, index) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={index}>
              <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton variant="text" height={32} width="80%" />
                  <Skeleton variant="text" height={20} width="60%" />
                  <Skeleton variant="text" height={20} width="40%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Grid container spacing={3}>
          {paginatedItems.length > 0 ? (
            paginatedItems.map(item => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item._id}>
                <Card 
                  elevation={3} 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: 8
                    }
                  }}
                >
                  <CardActionArea onClick={() => loadLayout(item)} sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={getImageUrl(item)}
                      alt={item.title}
                      sx={{ objectFit: "cover" }}
                    />
                    <CardHeader
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {item.name?.charAt(0) || "N"}
                        </Avatar>
                      }
                      title={
                        <Typography variant="subtitle1" fontWeight="bold" noWrap>
                          {item.name || "Newspaper"}
                        </Typography>
                      }
                      subheader={
                        <Chip 
                          size="small" 
                          label={item.taskstatus || "pending"}
                          color={getStatusColor(item.taskstatus)}
                          sx={{ fontSize: '0.7rem' }}
                        />
                      }
                    />
                    <CardContent sx={{ pt: 0, flexGrow: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom noWrap>
                        {item.title}
                      </Typography>
                      
                      <Divider sx={{ my: 1 }} />
                      
                      <Stack spacing={1} sx={{ mt: 2 }}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocationCity fontSize="small" color="action" />
                          <Typography variant="body2" color="text.secondary">
                            {item.city}{item.state ? `, ${item.state}` : ''}
                          </Typography>
                        </Stack>
                        
                        {item.day && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CalendarMonth fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {item.day}
                            </Typography>
                          </Stack>
                        )}
                        
                        {item.duedate && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <TaskAlt fontSize="small" color="error" />
                            <Typography variant="body2" color="error.main" fontWeight="medium">
                              Due: {formatDate(item.duedate)}
                            </Typography>
                          </Stack>
                        )}
                        
                        {item.publishingdate && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Public fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              Publishing: {formatDate(item.publishingdate)}
                            </Typography>
                          </Stack>
                        )}
                        
                        {item.gridSettings && (
                          <Stack direction="row" spacing={1} alignItems="center">
                            <GridView fontSize="small" color="action" />
                            <Typography variant="body2" color="text.secondary">
                              {item.gridSettings.columns}×{item.gridSettings.rows} grid
                            </Typography>
                          </Stack>
                        )}
                      </Stack>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Box sx={{ textAlign: 'center', width: '100%', py: 8 }}>
              <Typography variant="h6" color="text.secondary">
                No layouts found!
              </Typography>
            </Box>
          )}
        </Grid>
      )}

      {filteredItems && filteredItems.length > 0 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4, mb: 3 }}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            setCurrentPage={setCurrentPage}
          />
        </Box>
      )}

      <Footer />
    </Container>
  );
};

export default MyLayouts;