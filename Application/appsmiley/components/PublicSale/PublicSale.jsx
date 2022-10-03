import React, { useEffect, useState } from "react";
import { Image, Flex, Text, Spinter, iseToast, chakra, useToast, Spinner, Button } from "@chakra-ui/react";
import { ethers } from "ethers";
import useEthersProvider from "../../hooks/useEthersProvider";
import Contract from "../../artifacts/contracts/SmileyERC721A.sol/SmileyERC721A.json";

const PublicSale = (props) => {

    const { account, provider } = useEthersProvider();
    const [isLoading, setIsLoading] = useState(false);
    const [mintIsLoading, setMintIsLoading] = useState(false);
    const [seconds, setSeconds] = useState(null);
    const [minutes, setMinutes] = useState(null);
    const [hours, setHours] = useState(null);
    const [days, setDays] = useState(null);

    const saleStartTime = 1664748000 + 86400 * 7; // 7 jours après le début des ventes

    const toast = useToast();

    const contractAddress = "0xbaAb47d233978fFaa2f917696f0cE88f40d48DD2";

    useEffect(() => {
        getCount()
    }, [])

    const mint = async (quantity) => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Contract.abi, signer);

        let overrides = {
            value: props.BNPublicSalePrice.mul(quantity)
        }

        try {
            let transaction = await contract.publicMint(account, quantity, overrides);
            setMintIsLoading(true);
            await transaction.wait();
            setMintIsLoading(false);
            toast({
                description: "Congratulations ! You have minted " + { quantity } + "NFT ! ",
                status: "success",
                duration: 5000,
                isClosable: true
            });

            props.getDatas();
        }
        catch {
            toast({
                description: "Oops.. an error occured :( ",
                status: "error",
                duration: 5000,
                isClosable: true
            });

        }
    }

    const getCount = () => {
        setIsLoading(true);
        var calc = setInterval(function () {
            let unixTime = saleStartTime * 1000;
            let date_future = new Date(unixTime);
            let date_now = new Date();

            let seconds = Math.floor((date_future - (date_now)) / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);

            hours = hours - (days * 24)
            minutes = minutes - (days * 24 * 60) - (hours * 60);
            seconds = seconds - (days * 24 * 60 * 60) - (hours * 60 * 60) - (minutes * 60)

            setDays(days)
            setHours(hours)
            setMinutes(minutes)
            setSeconds(seconds)
            setIsLoading(false)
        }, 1000)
    }


    return (
        <Flex>
            {isLoading ? (
                <Spinner />
            ) : (
                <Flex>
                    {days >= 0 ? (
                        <Flex direction="column" align="center">
                            <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>Public Sale Start  in </Text>
                            <Flex align="center" justify="center" p="2rem">
                                <Flex direction="column" justify="center" align="center" p={["1rem", "1rem", "2rem", "2rem"]}>
                                    <Text fontWeight="bold" fontSize={["2rem", "2rem", "5rem", "5rem"]}>{days}</Text>
                                    <Text fontStyle="italic">days</Text>
                                </Flex>
                                <Flex direction="column" justify="center" align="center" p={["1rem", "1rem", "2rem", "2rem"]}>
                                    <Text fontWeight="bold" fontSize={["2rem", "2rem", "5rem", "5rem"]}>{hours}</Text>
                                    <Text fontStyle="italic">hours</Text>
                                </Flex>
                                <Flex direction="column" justify="center" align="center" p={["1rem", "1rem", "2rem", "2rem"]}>
                                    <Text fontWeight="bold" fontSize={["2rem", "2rem", "5rem", "5rem"]}>{minutes}</Text>
                                    <Text fontStyle="italic">mins</Text>
                                </Flex>
                                <Flex direction="column" justify="center" align="center" p={["1rem", "1rem", "2rem", "2rem"]}>
                                    <Text fontWeight="bold" fontSize={["2rem", "2rem", "5rem", "5rem"]}>{seconds}</Text>
                                    <Text fontStyle="italic">secs</Text>
                                </Flex>
                            </Flex>
                        </Flex>
                    ) : (
                        <Flex>
                            <Flex>
                                {mintIsLoading ? (
                                    <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                        <Spinner /> Processing mint...
                                    </Text>
                                ) : (
                                    <Flex>
                                        {props.totalSupply >= 26 ? (
                                            <Flex>
                                                <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                                    Public sale is SOLD OUT
                                                </Text>
                                            </Flex>
                                        ) : (
                                            <Flex p="2rem" align="center" direction={["column", "column", "row", "row"]}>
                                                <Flex width={["100%", "100%", "50%", "50%"]} align="center" direction="column">
                                                    <Text fontWeight="bold" fontSize={["2rem", "2rem", "3rem", "4rem"]}>
                                                        Public Sale
                                                    </Text>
                                                    <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                                        <chakra.span fontWeight="bold">NFTs sold </chakra.span>
                                                        <chakra.span fontWeight="bold" color='orange'>{props.totalSupply} / 26</chakra.span>
                                                    </Text>
                                                    <Text fontSize="1.5rem">
                                                        <chakra.span fontWeight="bold">Price </chakra.span>
                                                        <chakra.span fontWeight="bold" color="orange">{props.publicSalePrice} Eth</chakra.span>
                                                    </Text>
                                                    <Flex mt="2rem">
                                                        <Button colorScheme="orange" onClick={() => mint(1)} ml="1rem" mr="1rem">Buy 1 NFT</Button>
                                                        <Button colorScheme="orange" onClick={() => mint(2)} ml="1rem" mr="1rem">Buy 2 NFT</Button>
                                                    </Flex>
                                                </Flex>
                                                <Flex width={["100%", "100%", "50%", "50%"]} justify="center" align="center" p={["2rem", "2rem", "0", "0"]}>
                                                    <Image src="/mintImage.png" width="60%"></Image>
                                                </Flex>
                                            </Flex>
                                        )}
                                    </Flex>
                                )}
                            </Flex>
                        </Flex>
                    )}
                </Flex>
            )}
        </Flex>
    )
}

export default PublicSale;