import { Flex, Text } from "@chakra-ui/react";

const Footer = () => {
    return (
        <Flex align="center" justify="center" my="sm" p="2rem">
            <Text fontSize={12} fontWeight={400}>
                Copyright &copy; {new Date().getFullYear()}, All rights reserved - Antopablo
            </Text>
        </Flex>
    )
}

export default Footer;