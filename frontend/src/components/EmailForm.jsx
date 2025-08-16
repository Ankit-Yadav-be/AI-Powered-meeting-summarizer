import { Box, Input, Textarea, Button, VStack, Heading, Flex, Icon, Tooltip, Text, useColorModeValue } from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";

const EmailForm = ({ recipients, setRecipients, subject, setSubject, message, onSend }) => {
  // Color Mode Values
  const bg = useColorModeValue("white", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const inputBg = useColorModeValue("white", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const hoverBg = useColorModeValue("gray.50", "gray.600");
  const tooltipBg = useColorModeValue("gray.700", "gray.300");
  const tooltipColor = useColorModeValue("white", "gray.800");

  return (
    <Box
      w="100%"
      maxW="600px"
      p={6}
      borderWidth="1px"
      borderRadius="2xl"
      boxShadow="xl"
      bg={bg}
      borderColor={borderColor}
    >
      <VStack spacing={5} w="100%" align="stretch">
        {/* Header */}
        <Flex align="center" justify="space-between">
          <Heading size="md" color="teal.400">
             Send Summary via Email
          </Heading>
          <Tooltip label="Emails will be sent to all recipients" fontSize="xs" bg={tooltipBg} color={tooltipColor}>
            <Icon as={FiMail} w={5} h={5} color="teal.400" />
          </Tooltip>
        </Flex>

        {/* Recipients Input */}
        <Input
          placeholder="Recipient emails (comma separated)"
          value={recipients}
          onChange={(e) => setRecipients(e.target.value)}
          borderRadius="lg"
          focusBorderColor="teal.400"
          shadow="sm"
          _hover={{ shadow: "md", bg: hoverBg }}
          bg={inputBg}
          color={textColor}
          _placeholder={{ color: placeholderColor }}
        />

        {/* Subject Input */}
        <Input
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          borderRadius="lg"
          focusBorderColor="teal.400"
          shadow="sm"
          _hover={{ shadow: "md", bg: hoverBg }}
          bg={inputBg}
          color={textColor}
          _placeholder={{ color: placeholderColor }}
        />

        {/* Message Textarea */}
        <Textarea
          placeholder="Message"
          value={message}
          readOnly
          borderRadius="lg"
          minH="150px"
          focusBorderColor="teal.400"
          shadow="sm"
          _hover={{ shadow: "md", bg: hoverBg }}
          bg={inputBg}
          color={textColor}
          _placeholder={{ color: placeholderColor }}
        />

        {/* Send Button */}
        <Button
          colorScheme="teal"
          w="full"
          borderRadius="lg"
          _hover={{ transform: "scale(1.03)", boxShadow: "2xl" }}
          transition="all 0.2s ease-in-out"
          onClick={onSend}
        >
          Send Email
        </Button>

        {!recipients && (
          <Text fontSize="sm" color={useColorModeValue("gray.500", "gray.400")} textAlign="center">
            Enter recipient emails to enable sending.
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default EmailForm;
