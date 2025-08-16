import { Box, Textarea, Input, Button, VStack, Heading, Text, Flex, Icon, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";
import { FiUpload } from "react-icons/fi";

const TranscriptInput = ({ transcript, setTranscript, prompt, setPrompt, onGenerate, onFileSelect }) => {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    onFileSelect(file);
  };

  // Color Mode Values
  const bg = useColorModeValue("gray.50", "gray.800");
  const boxBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.100");
  const placeholderColor = useColorModeValue("gray.400", "gray.400");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const fileTextColor = selectedFile ? "green.400" : useColorModeValue("gray.600", "gray.300");

  return (
    <Box
      w="100%"
      maxW="750px"
      mx="auto"
      p={6}
      bg={bg}
      rounded="2xl"
      shadow="xl"
      border="1px solid"
      borderColor={borderColor}
    >
      <VStack spacing={5} w="100%">
        {/* Heading */}
        <Heading size="lg" color={textColor} textAlign="center">
          📝 AI Meeting Summarizer
        </Heading>
        <Text color={useColorModeValue("gray.500", "gray.400")} fontSize="sm" textAlign="center">
          Paste your transcript or upload a PDF/DOC file. Add a custom instruction for the summary.
        </Text>

        {/* Transcript Input */}
        <Textarea
          placeholder="Paste your meeting transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          size="md"
          resize="vertical"
          minH="260px"
          fontSize="md"
          bg={boxBg}
          color={textColor}
          _placeholder={{ color: placeholderColor, fontStyle: "italic" }}
          borderRadius="lg"
          shadow="sm"
          p={4}
        />

        {/* File Upload */}
        <Flex
          align="center"
          justify="space-between"
          w="100%"
          p={3}
          bg={boxBg}
          borderRadius="lg"
          shadow="sm"
          border="2px dashed"
          borderColor={borderColor}
          cursor="pointer"
          _hover={{ bg: useColorModeValue("gray.100", "gray.600"), borderColor: "blue.300" }}
        >
          <Input
            type="file"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleFileChange}
            display="none"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}
          >
            <Text color={fileTextColor} fontWeight={selectedFile ? "bold" : "normal"}>
              {selectedFile ? selectedFile.name : "📂 Click to upload a file"}
            </Text>
            <Icon as={FiUpload} w={6} h={6} color="blue.500" />
          </label>
        </Flex>

        {/* Prompt Input */}
        <Input
          placeholder="Enter your custom instruction (e.g., Summarize in bullet points)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          size="md"
          bg={boxBg}
          color={textColor}
          _placeholder={{ color: placeholderColor, fontStyle: "italic" }}
          borderRadius="lg"
          shadow="sm"
          p={3}
        />

        {/* Generate Button */}
        <Button
          colorScheme="blue"
          w="full"
          size="lg"
          onClick={onGenerate}
          _hover={{ transform: "scale(1.05)", boxShadow: "2xl" }}
          transition="all 0.2s ease"
        >
           Generate Summary
        </Button>
      </VStack>
    </Box>
  );
};

export default TranscriptInput;
