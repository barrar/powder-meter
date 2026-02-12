import { Box, Button, Stack, Typography } from "@mui/material";

export default function PageFooter() {
  return (
    <Box
      component="footer"
      sx={{
        mt: { xs: 4, md: 5 },
        pt: 2,
        borderTop: "1px solid rgba(226, 232, 255, 0.2)",
      }}
    >
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
        <Typography variant="body2" color="text.secondary">
          {`© ${new Date().getFullYear()} Jeremiah Barrar`}
        </Typography>
        <Button
          href="https://github.com/barrar/powder-meter"
          target="_blank"
          rel="noreferrer"
          color="primary"
          variant="contained"
          sx={{ textTransform: "none" }}
        >
          Source Code on GitHub
        </Button>
      </Stack>
    </Box>
  );
}
