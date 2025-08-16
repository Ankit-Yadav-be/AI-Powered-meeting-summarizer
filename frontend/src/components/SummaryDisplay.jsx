import { Box, Textarea, VStack, Heading, Flex, IconButton, Tooltip, useClipboard, Text, useColorModeValue } from "@chakra-ui/react";
import { FiCopy } from "react-icons/fi";

const SummaryDisplay = ({ summary, setSummary }) => {
  const { hasCopied, onCopy } = useClipboard(summary || "");

  // Dark/Light mode colors
  const bg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.100", "gray.600");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const headingColor = useColorModeValue("blue.600", "blue.400");

  return (
    <VStack spacing={4} w="100%" align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" w="100%">
        <Heading size="md" color={headingColor}>
           Generated Summary
        </Heading>
        {summary && (
          <Tooltip label={hasCopied ? "Copied!" : "Copy to clipboard"} fontSize="sm">
            <IconButton
              icon={<FiCopy />}
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={onCopy}
              aria-label="Copy summary"
            />
          </Tooltip>
        )}
      </Flex>

      {/* Summary Box */}
      <Box
        w="100%"
        bg={bg}
        borderRadius="xl"
        shadow="md"
        p={4}
        border="1px solid"
        borderColor={borderColor}
        maxH="450px"
        overflowY="auto"
        _hover={{ borderColor: "blue.400", bg: hoverBg }}
      >
        <Textarea
          placeholder="Summary will appear here..."
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          size="md"
          resize="vertical"
          bg="transparent"
          border="none"
          minH="300px"
          fontSize="md"
          color={textColor}
          _placeholder={{ color: placeholderColor, fontStyle: "italic" }}
          _focus={{ boxShadow: "none" }}
        />
        {!summary && (
          <Text color={placeholderColor} fontSize="sm" mt={2}>
            The generated summary will appear here after processing your transcript or uploaded file.
          </Text>
        )}
      </Box>
    </VStack>
  );
};

export default SummaryDisplay;
