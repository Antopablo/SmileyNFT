import React, { useState, useEffect } from "react";
import { Flex, Button, Spinner, Text, useToast } from "@chakra-ui/react";
import Layout from "../components/Layout/Layout";
import useEthersProvider from "../hooks/useEthersProvider";
import Contract from "../artifacts/contracts/SmileyERC721A.sol/SmileyERC721A.json";
import { ethers } from "ethers"
// components
import Before from "../components/Before/Before"
import WhitelistSale from "../components/WhitelistSale/WhitelistSale"
import PublicSale from "../components/PublicSale/PublicSale"
import SoldOut from "../components/SoldOut/SoldOut"
import Reveal from "../components/Reveal/Reveal"



export default function Home() {

  const { account, provider } = useEthersProvider();
  const [isLoading, setIsLoading] = useState(false);

  // 0: before, 1: whitelist sale, 2: public sale, 3: soldOut, 4: reveal
  const [sellingStep, setSellingStep] = useState(null);

  // SaleStartTime
  const [SaleStartTime, setSaleStartTime] = useState(null);

  // Whitelist price
  const [BNWlSalePrice, setBNWlSalePrice] = useState(null);
  const [wlSalePrice, setWlSalePrice] = useState(null)

  // Public price
  const [BNPublicSalePrice, setBNPublicSalePrice] = useState(null)
  const [publicSalePrice, setPublicSalePrice] = useState(null)

  // Total supply
  const [totalSupply, setTotalSupply] = useState(null);

  const toast = useToast();
  const ContractAddress = "0xE41398455CeC38D2E0A7612De9d336Cc258bC41F";

  useEffect(() => {
    if (account) {
      getDatas()
    }
  }, [account])

  const getDatas = async () => {

    setIsLoading(true);

    const contract = new ethers.Contract(ContractAddress, Contract.abi, provider);

    const sellingStep = await contract.sellingStep();

    // Get wl sale price in BN format
    let wlSalePrice = await contract.wlSalePrice();
    // Extract value
    let wlSalePriceBN = ethers.BigNumber.from(wlSalePrice._hex)
    // Convert in ether format
    wlSalePrice = ethers.utils.formatEther(wlSalePriceBN);

    // Get public sale price in BN format
    let publicSalePrice = await contract.publicSalePrice();
    // Extract value
    let publicSalePriceBN = ethers.BigNumber.from(publicSalePrice._hex)
    // Convert in ether format
    publicSalePrice = ethers.utils.formatEther(publicSalePriceBN);

    let totalSupply = await contract.totalSupply();
    totalSupply = totalSupply.toString();

    setSellingStep(sellingStep);
    setWlSalePrice(wlSalePrice);
    setBNWlSalePrice(wlSalePriceBN);
    setPublicSalePrice(publicSalePrice);
    setBNPublicSalePrice(publicSalePriceBN);
    setTotalSupply(totalSupply)

    setIsLoading(false);

  }


  return (
    <Layout>
      <Flex align="center" justify="center">
        {isLoading ? (
          <Spinner />
        ) : account ? (
          (() => {
            console.log(sellingStep)
            switch (sellingStep) {
              case null:
                return <Spinner />
              case 0:
                return (
                  <Before />
                )
            }
          })()
        ) : (
          <Text fontSize={30}>
            Please connect your wallet
          </Text>
        )}
      </Flex>
    </Layout >
  )
}
