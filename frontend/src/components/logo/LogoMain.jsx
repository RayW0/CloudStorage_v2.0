import { useTheme } from '@mui/material/styles';
import CloudOutlinedIcon from '@mui/icons-material/CloudOutlined';
import { Box } from '@mui/material';

// ==============================|| LOGO SVG ||============================== //

const Logo = () => {
  const theme = useTheme();

  return (
    <Box display="flex" alignItems="center">
      <CloudOutlinedIcon sx={{ color: theme.palette.primary.light, fontSize: 25, mr: 1 }} />
      <svg
        width="118"
        height="35"
        viewBox="0 0 118 35"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="SecureCloud Logo"
      >
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="19"
          fontWeight="bold"
          fill="url(#paint0_linear)"
        >
          SecureCloud
        </text>
        <defs>
          <linearGradient
            id="paint0_linear"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="0%"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#42a5f5" />
            <stop offset="1" stopColor="#6b8cd4" />
          </linearGradient>
        </defs>
      </svg>
    </Box>
  );
};

export default Logo;
