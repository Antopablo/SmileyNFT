import React, { useEffect, useState } from "react";
import { Image, Flex, Text, Spinter, iseToast, chakra, useToast, Spinner, Button } from "@chakra-ui/react";
import useEthersProvider from "../../hooks/useEthersProvider";
import { ethers } from "ethers";
import Contract from "../../artifacts/contracts/SmileyERC721A.sol/SmileyERC721A.json";
import tokens from "../../tokens.json";
import { MerkleTree } from "merkletreejs";
import keccak256 from "keccak256";

const WhitelistSale = (props) => {

    const { account, provider } = useEthersProvider();
    const [isLoading, setIsLoading] = useState(false);
    const [mintIsLoading, setMintIsLoading] = useState(false);
    const [seconds, setSeconds] = useState(null);
    const [minutes, setMinutes] = useState(null);
    const [hours, setHours] = useState(null);
    const [days, setDays] = useState(null);
    const [timestamp, setTimestamp] = useState(Math.floor(Date.now() / 1000));

    const saleStartTime = 1664099642;
    const endSaleTime = saleStartTime + 12 * 3600;

    const toast = useToast();

    const contractAddress = "0xE41398455CeC38D2E0A7612De9d336Cc258bC41F";

    useEffect(() => {
        getCount()
    }, [])

    const mint = async () => {
        const signer = provider.getSigner();
        const contract = new ethers.Contract(contractAddress, Contract.abi, signer);

        let tab = [];
        tokens.map((token) => {
            tab.push(token.address);
        });
        let leaves = tab.map((address) => keccak256(address));
        let tree = new MerkleTree(leaves, keccak256, { sort: true })
        let leaf = keccak256(account);
        let proof = tree.getHexProof(leaf);

        let overrides = {
            value: props.BNWlSalePrice
        }

        try {
            let transaction = await contract.whitelistMint(account, 1, proof, overrides);
            setMintIsLoading(true);
            await transaction.wait();
            setMintIsLoading(false);
            toast({
                description: "Congratulations ! You have minted one NFT ! ",
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
                            <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>Whitelist Sale Start  in </Text>
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
                            {timestamp > endSaleTime ? (
                                <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                    Whitelist sale is finished
                                </Text>
                            ) : (
                                <Text>
                                    {mintIsLoading ? (
                                        <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                            <Spinner /> Processing mint...
                                        </Text>
                                    ) : (
                                        <Flex>
                                            {props.totalSupply >= 3 ? (
                                                <Flex>
                                                    <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                                        Whitelist sale is SOLD OUT
                                                    </Text>
                                                </Flex>
                                            ) : (
                                                <Flex p="2rem" algin="center" direction={["column", "column", "row", "row"]}>
                                                    <Flex width={["100%", "100%", "50%", "50%"]} align="center" direction="column">
                                                        <Text fontWeight="bold" fontSize={["2rem", "2rem", "3rem", "4rem"]}>
                                                            Whitelist Sale
                                                        </Text>
                                                        <Text fontSize={["1.5rem", "1.5rem", "2rem", "3rem"]}>
                                                            <chakra.span fontWeight="bold">NFTs sold </chakra.span>
                                                            <chakra.span fontWeight="bold" color='orange'>{props.totalSupply} / 3</chakra.span>
                                                        </Text>
                                                        <Text fontSize="1.5rem">
                                                            <chakra.span fontWeight="bold">Price </chakra.span>
                                                            <chakra.span fontWeight="bold" color="orange">{props.wlSalePrice} Eth</chakra.span>
                                                        </Text>
                                                        <Flex mt="2rem">
                                                            <Button colorScheme="orange" onClick={mint}>Buy 1 NFT</Button>
                                                        </Flex>
                                                    </Flex>
                                                    <Flex width={["100%", "100%", "50%", "50%"]} justify="center" align="center" p={["2rem", "2rem", "0", "0"]}>
                                                        <Image src="/mintImage.png" width="60%"></Image>
                                                    </Flex>
                                                </Flex>
                                            )}
                                        </Flex>
                                    )}
                                </Text>
                            )}
                        </Flex>
                    )}
                </Flex>
            )}
        </Flex>
    )
}

export default WhitelistSale;