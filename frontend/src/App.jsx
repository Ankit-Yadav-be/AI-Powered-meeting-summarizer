import { useState, useEffect } from "react";
import {
  Container,
  VStack,
  Heading,
  useToast,
  SimpleGrid,
  Box,
  Text,
  Center,
  Button,
  useColorMode,
  useColorModeValue,
  Flex,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";
import TranscriptInput from "../src/components/TranscriptInput";
import SummaryDisplay from "../src/components/SummaryDisplay";
import EmailForm from "../src/components/EmailForm";
import axios from "axios";

// Animated dots component for loader
const AnimatedDots = () => {
  const [dots, setDots] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "•"));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return <Text as="span" ml={1}>{dots}</Text>;
};

const Home = () => {
  const [transcript, setTranscript] = useState("");
  const [summary, setSummary] = useState("");
  const [recipients, setRecipients] = useState("");
  const [subject, setSubject] = useState("Meeting Summary");
  const [prompt, setPrompt] = useState(
    "Summarize the meeting notes in clear and best understandable points."
  );
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const toast = useToast();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.50", "gray.800");
  const boxBg = useColorModeValue("white", "gray.700");

  // Generate Summary
  const handleGenerate = async () => {
    if (!file && !transcript.trim()) {
      toast({
        title: "Please upload a PDF or enter transcript",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("prompt", prompt);

      if (file) formData.append("pdfFile", file);
      else formData.append("transcript", transcript);

      const res = await axios.post("https://ai-powered-meeting-summarizer.vercel.app/api/summarize", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSummary(res.data.summary);

      toast({
        title: "Summary generated",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to generate summary",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Send Email
  const handleSendEmail = async () => {
    if (!recipients.trim() || !summary.trim()) {
      toast({
        title: "Recipients and summary are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const recipientArray = recipients.split(",").map((email) => email.trim());

    try {
      await axios.post("https://ai-powered-meeting-summarizer.vercel.app/api/send-email", {
        recipients: recipientArray,
        subject,
        message: summary,
      });

      toast({
        title: "Email sent successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error(err);
      toast({
        title: "Failed to send email",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="7xl" py={0} bg={bgColor} minH="100vh">
      {/* Top bar - Dark Mode Toggle */}
      <Flex mb={4} align="center">
        <Spacer />
        <Button size="sm" onClick={toggleColorMode}>
          {colorMode === "dark" ? <FiMoon /> : <FiSun />}
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="start">
        {/* Left Column - Transcript / File Upload */}
        <Box>
          <TranscriptInput
            transcript={transcript}
            setTranscript={setTranscript}
            prompt={prompt}
            setPrompt={setPrompt}
            onGenerate={handleGenerate}
            onFileSelect={setFile}
            loading={loading}
          />
        </Box>

        {/* Right Column - Summary (top) + Email (bottom) */}
        <VStack spacing={6} align="stretch">
          {/* Summary Display */}
          <Box borderRadius="xl" p={5} shadow="md" bg={boxBg} minH="250px">
            {loading ? (
              <Center h="100%" flexDirection="column">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor={useColorModeValue("gray.200", "gray.600")}
                  color={useColorModeValue("blue.500", "blue.300")}
                  size="xl"
                  mb={4}
                />
                <Text color={useColorModeValue("gray.600", "gray.300")} fontSize="md" fontWeight="semibold">
                  Generating summary<AnimatedDots />
                </Text>
              </Center>
            ) : summary ? (
              <SummaryDisplay summary={summary} setSummary={setSummary} />
            ) : (
              <Center h="100%" flexDirection="column">
                <Text fontSize="md" color={useColorModeValue("gray.500", "gray.400")}>
                  No summary yet
                </Text>
                <Text fontSize="sm" color={useColorModeValue("gray.400", "gray.500")} textAlign="center" maxW="80%">
                  Upload a PDF or paste a transcript, then click <strong>Generate Summary</strong> to see results here.
                </Text>
              </Center>
            )}
          </Box>

          {/* Email Form */}
          <EmailForm
            recipients={recipients}
            setRecipients={setRecipients}
            subject={subject}
            setSubject={setSubject}
            message={summary || ""}
            onSend={handleSendEmail}
          />
        </VStack>
      </SimpleGrid>
    </Container>
  );
};

export default Home;
