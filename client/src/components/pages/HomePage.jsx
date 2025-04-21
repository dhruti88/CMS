import React from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ViewCompactIcon from "@mui/icons-material/ViewCompact";
import HistoryIcon from "@mui/icons-material/History";
import TipsAndUpdatesIcon from "@mui/icons-material/TipsAndUpdates";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const HomePage = () => {
  const cardData = [
    {
      title: "My Layouts",
      description: "Design and manage your page structures.",
      icon: <ViewCompactIcon sx={{ color: "var(--primary-color)", fontSize: 40 }} />,
      link: "/mylayout",
    },
    {
      title: "Workbench",
      description: "Start editing portions and collaborate in real-time.",
      icon: <DashboardIcon sx={{ color: "var(--primary-color)", fontSize: 40 }} />,
      link: "/page",
    },
    {
      title: "History",
      description: "View all previously published or edited pages.",
      icon: <HistoryIcon sx={{ color: "var(--primary-color)", fontSize: 40 }} />,
      link: "/history",
    },
  ];

  const carouselItems = [
    {
      src: "/1.jpg",
      caption: "Design Stunning Layouts",
    },
    {
      src: "/2.jpeg",
      caption: "Collaborate with Your Team",
    },
    {
      src: "/5.png",
      caption: "Publish with Confidence",
    },
  ];

  return (
    <Container sx={{ pt: 12, pb: 5 }}>
      <Box textAlign="center" mb={5}>
        <Typography variant="h3" sx={{ color: "var(--primary-color)" }} gutterBottom>
          Welcome to
          <span style={{ color: "var(--text-color)" }}> Page</span>
          <span style={{ color: "var(--primary-color)" }}>Craft</span>
        </Typography>
        <Typography variant="h6" sx={{ color: "var(--text-color)" }}>
          Your smart newspaper layout and collaboration platform.
        </Typography>
      </Box>

      <Box mb={6} display="flex" justifyContent="center">
        <Box
          sx={{
            width: "100%",
            maxWidth: 900,
            height: 400,
            borderRadius: 3,
            overflow: "hidden",
            position: "relative",
            border: "1px solid var(--border-color)",
          }}
        >
          <Carousel
            showThumbs={false}
            autoPlay
            infiniteLoop
            showStatus={false}
            interval={4000}
            stopOnHover
            swipeable
            emulateTouch
            dynamicHeight={false}
            renderArrowPrev={(onClickHandler, hasPrev, label) =>
              hasPrev && (
                <Box
                  onClick={onClickHandler}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: 10,
                    zIndex: 2,
                    cursor: "pointer",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    userSelect: "none",
                  }}
                >
                  ‹
                </Box>
              )
            }
            renderArrowNext={(onClickHandler, hasNext, label) =>
              hasNext && (
                <Box
                  onClick={onClickHandler}
                  sx={{
                    position: "absolute",
                    top: "50%",
                    right: 10,
                    zIndex: 2,
                    cursor: "pointer",
                    transform: "translateY(-50%)",
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundColor: "rgba(0,0,0,0.5)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 24,
                    userSelect: "none",
                  }}
                >
                  ›
                </Box>
              )
            }
          >
            {carouselItems.map((item, index) => (
              <div key={index}>
                <img
                  src={item.src}
                  alt={item.caption}
                  style={{
                    width: "100%",
                    height: "400px",
                    objectFit: "cover",
                  }}
                />
                <p className="legend">{item.caption}</p>
              </div>
            ))}
          </Carousel>
        </Box>
      </Box>

      <Grid container spacing={4}>
        {cardData.map((card, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Link to={card.link} style={{ textDecoration: "none" }}>
              <Card
                sx={{
                  transition: "0.3s",
                  borderRadius: 3,
                  backgroundColor: "var(--secondary-color)",
                  border: "1px solid var(--border-color)",
                  "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: 6,
                    backgroundColor: "var(--hover-color)",
                  },
                }}
              >
                <CardActionArea>
                  <CardContent sx={{ textAlign: "center", py: 4 }}>
                    {card.icon}
                    <Typography variant="h6" sx={{ color: "var(--primary-color)", mt: 2, mb: 1 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--text-color)" }}>
                      {card.description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Link>
          </Grid>
        ))}
      </Grid>

      <Box mt={8}>
        <Typography variant="h5" sx={{ color: "var(--text-color)" }} gutterBottom>
          <TipsAndUpdatesIcon sx={{ verticalAlign: "middle", mr: 1 }} />
          Quick Tips for Editors
        </Typography>
        <List sx={{ pl: 2 }}>
          <ListItem>
            <ListItemIcon>
              <TipsAndUpdatesIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="Use high-quality images to maintain print clarity." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TipsAndUpdatesIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="Assign specific portions to avoid content overlaps." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TipsAndUpdatesIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="Keep headlines consistent and engaging." />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <TipsAndUpdatesIcon color="action" />
            </ListItemIcon>
            <ListItemText primary="Preview the layout before publishing." />
          </ListItem>
        </List>
      </Box>
    </Container>
  );
};

export default HomePage;
