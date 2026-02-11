import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Textarea,
  Button,
  useToast,
  FormControl,
  FormLabel,
  FormHelperText,
  Card,
  CardBody,
  Badge,
} from '@chakra-ui/react';
import apiService from '../services/api';

const EXAMPLE_TRANSCRIPT = `Team Meeting - Product Launch Planning

Alice: Let's discuss the upcoming product launch. First, we need to finalize the product specifications.

Bob: Agreed. Once we have the specs, I can start designing the user interface mockups.

Charlie: After the mockups are approved, I'll need to set up the development environment and database schema.

Bob: I'll also need to create the wireframes before the mockups. That should be my first task.

Alice: Don't forget, we need to conduct market research before finalizing the specifications.

David: I can handle the backend API development once Charlie sets up the environment.

Eve: For the frontend, I'll need Bob's mockups completed before I start implementing the UI components.

Charlie: I also need to write unit tests for the backend API after David finishes.

Alice: Once everything is developed, we'll need to perform integration testing.

Bob: And we should prepare the marketing materials, but only after the product is tested.

David: Finally, we'll need to deploy to production and monitor the initial rollout.`;

export default function Home() {
  const [transcript, setTranscript] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async () => {
    if (transcript.trim().length < 50) {
      toast({
        title: 'Transcript too short',
        description: 'Please enter at least 50 characters',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await apiService.submitTranscript(transcript);

      toast({
        title: response.isDuplicate ? 'Duplicate detected' : 'Success!',
        description: response.message,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to results page
      navigate(`/results/${response.jobId}`);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to submit transcript',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loadExample = () => {
    setTranscript(EXAMPLE_TRANSCRIPT);
  };

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.lg">
        <VStack spacing={8} align="stretch">
          {/* Header */}
          <Box textAlign="center">
            <Heading
              as="h1"
              size="2xl"
              bgGradient="linear(to-r, blue.500, purple.500)"
              bgClip="text"
              mb={2}
            >
              InsightBoard AI
            </Heading>
            <Text fontSize="xl" color="gray.600">
              Transform meeting transcripts into actionable task dependencies
            </Text>
          </Box>

          {/* Features */}
          <Box display="flex" justifyContent="center" gap={4} flexWrap="wrap">
            <Badge colorScheme="green" fontSize="sm" px={3} py={1}>
              Level 1: Validation & Cycle Detection
            </Badge>
            <Badge colorScheme="blue" fontSize="sm" px={3} py={1}>
              Level 2: Async Processing
            </Badge>
            <Badge colorScheme="purple" fontSize="sm" px={3} py={1}>
              Level 3: Interactive Graph
            </Badge>
          </Box>

          {/* Input Card */}
          <Card>
            <CardBody>
              <FormControl>
                <FormLabel fontSize="lg" fontWeight="bold">
                  Meeting Transcript
                </FormLabel>
                <Textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste your meeting transcript here..."
                  size="lg"
                  minH="300px"
                  resize="vertical"
                />
                <FormHelperText>
                  Minimum 50 characters. The AI will extract tasks and their dependencies.
                </FormHelperText>
              </FormControl>

              <VStack mt={6} spacing={3}>
                <Button
                  colorScheme="blue"
                  size="lg"
                  width="full"
                  onClick={handleSubmit}
                  isLoading={isSubmitting}
                  loadingText="Processing..."
                  isDisabled={transcript.trim().length < 50}
                >
                  Generate Dependency Graph
                </Button>

                <Button
                  variant="outline"
                  size="md"
                  width="full"
                  onClick={loadExample}
                  isDisabled={isSubmitting}
                >
                  Load Example Transcript
                </Button>
              </VStack>
            </CardBody>
          </Card>

          {/* Info */}
          <Card bg="blue.50" borderColor="blue.200" borderWidth={1}>
            <CardBody>
              <Heading size="sm" mb={2}>
                How it works:
              </Heading>
              <VStack align="start" spacing={2} fontSize="sm">
                <Text>✅ Submit your meeting transcript</Text>
                <Text>✅ AI extracts tasks with dependencies</Text>
                <Text>✅ System validates and detects circular dependencies</Text>
                <Text>✅ Visualize tasks in an interactive dependency graph</Text>
                <Text>✅ Mark tasks as complete and unlock dependent tasks</Text>
              </VStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
