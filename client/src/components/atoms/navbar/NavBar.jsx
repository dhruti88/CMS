import { Link } from "react-router-dom";
import colors from "../../../theme/colors";
import { Typography } from '@mui/material';

const Navbar = ({ children }) => {
  return (
    <nav className="navbar">
      <Typography variant="h4" fontWeight="bold" align="left">
        <span className="text-black">Page</span>
        <span style={{ color: colors.primary }}>Craft</span>
      </Typography>
      <div className="nav-button">{children}</div>
    </nav>
  );
};

export default Navbar;