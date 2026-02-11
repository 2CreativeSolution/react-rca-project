import type { ReactNode } from "react";
import { Box, Container } from "@mui/material";
import Footer from "../components/Footer";
import Header from "../components/Header";

type Props = {
  children: ReactNode;
};

export default function MainLayout({ children }: Props) {
  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Header />

      <Box component="main" sx={{ flex: 1 }}>
        <Container sx={{ py: 4 }}>{children}</Container>
      </Box>

      <Footer />
    </Box>
  );
}
