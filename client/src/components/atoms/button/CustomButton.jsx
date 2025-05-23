import React from "react";
import { Button } from "@mui/material";
import colors from "../../../theme/colors";

const CustomButton = ({
    type = "button",
    children,
    sx = {},
    onClick
}) => {
    return (
        <Button type={type} onClick={onClick} variant="contained" sx={{
            backgroundColor: colors.primary,
            width: "150px",
            fontFamily: "'Poppins', sans-serif",
            marginRight : "20px",
            ...sx,
        }}>{children}</Button>

    );
}

export default CustomButton;