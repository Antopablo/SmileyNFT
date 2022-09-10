import React, { useState, useEffect } from "react";
import { Flex, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import Layout from "../components/Layout/Layout";
import useEthersProvider from "../hooks/useEthersProvider";

export default function Home() {
  return (
    <Layout>
      <Flex align="center" justtify="center">
        Contenu
      </Flex>
    </Layout>
  )
}
