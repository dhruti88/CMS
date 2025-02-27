import { Link } from "react-router-dom";
import colors from "../../theme/colors";
import { Typography, CardContent, Card, Box, Container } from '@mui/material';

const Navbar = () => {
  return (
    <nav className="text-white p-4 shadow-md bg-gray-100">
      <div className="container mx-auto flex justify-between items-center">
      <Typography
            variant="h5"
            fontWeight="bold"
            align="center"
        >
            <span style={{ color: "black" }}>Page</span>
            <span style={{ color:  colors.primary  }}>Craft</span>
            </Typography>

      </div>
    </nav>
  );
};

export default Navbar;
