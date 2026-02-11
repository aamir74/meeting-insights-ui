import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Badge,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import apiService from '../services/api';
import { useTaskStore } from '../context/TaskStore';
import TaskGraph from '../components/TaskGraph';

export default function Results() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { setTasks, tasks } = useTaskStore();

  const [status, setStatus] = useState<'pending' | 'processing' | 'completed' | 'failed'>('pending');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metadata, setMetadata] = useState<any>(null);

  useEffect(() => {
    if (!jobId) {
      navigate('/');
      return;
    }

    // Poll for job status
    const pollInterval = setInterval(async () => {
      try {
        const response = await apiService.getJobStatus(jobId);

        setStatus(response.data.status);
        setMetadata(response.data.metadata);

        if (response.data.status === 'completed') {
          setTasks(response.data.tasks);
          setLoading(false);
          clearInterval(pollInterval);
        } else if (response.data.status === 'failed') {
          setError(response.data.errorMessage || 'Processing failed');
          setLoading(false);
          clearInterval(pollInterval);
        }
      } catch (err: any) {
        setError(err.response?.data?.error?.message || 'Failed to fetch job status');
        setLoading(false);
        clearInterval(pollInterval);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [jobId, navigate, setTasks]);

  const handleBack = () => {
    navigate('/');
  };

  // Loading state
  if (loading && status !== 'completed') {
    return (
      <Box minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.lg">
          <VStack spacing={8}>
            <Heading size="lg">Processing Transcript...</Heading>
            <VStack spacing={4}>
              <Spinner size="xl" thickness="4px" color="blue.500" />
              <Text color="gray.600">
                {status === 'pending' && 'Waiting in queue...'}
                {status === 'processing' && 'AI is analyzing transcript and extracting tasks...'}
              </Text>
              <Badge colorScheme="blue" fontSize="md" px={4} py={2}>
                Job ID: {jobId}
              </Badge>
            </VStack>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Error state
  if (error) {
    return (
      <Box minH="100vh" bg="gray.50" py={10}>
        <Container maxW="container.lg">
          <VStack spacing={6}>
            <Alert
              status="error"
              variant="subtle"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              textAlign="center"
              height="200px"
              borderRadius="lg"
            >
              <AlertIcon boxSize="40px" mr={0} />
              <AlertTitle mt={4} mb={1} fontSize="lg">
                Processing Failed
              </AlertTitle>
              <AlertDescription maxWidth="sm">{error}</AlertDescription>
            </Alert>
            <Button onClick={handleBack} colorScheme="blue">
              Try Again
            </Button>
          </VStack>
        </Container>
      </Box>
    );
  }

  // Success state
  const readyTasks = tasks.filter((t) => t.status === 'ready').length;
  const blockedTasks = tasks.filter((t) => t.status === 'blocked').length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const errorTasks = tasks.filter((t) => t.status === 'error').length;

  return (
    <Box minH="100vh" bg="gray.50" py={10}>
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          {/* Header */}
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="lg" mb={1}>
                Dependency Graph
              </Heading>
              <Text color="gray.600">Job ID: {jobId}</Text>
            </Box>
            <Button onClick={handleBack} variant="outline">
              New Transcript
            </Button>
          </HStack>

          {/* Stats */}
          <Card>
            <CardBody>
              <StatGroup>
                <Stat>
                  <StatLabel>Total Tasks</StatLabel>
                  <StatNumber>{tasks.length}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Ready</StatLabel>
                  <StatNumber color="green.500">{readyTasks}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Blocked</StatLabel>
                  <StatNumber color="yellow.500">{blockedTasks}</StatNumber>
                </Stat>
                <Stat>
                  <StatLabel>Completed</StatLabel>
                  <StatNumber color="gray.500">{completedTasks}</StatNumber>
                </Stat>
                {errorTasks > 0 && (
                  <Stat>
                    <StatLabel>Errors</StatLabel>
                    <StatNumber color="red.500">{errorTasks}</StatNumber>
                  </Stat>
                )}
              </StatGroup>

              {metadata && (
                <HStack mt={4} spacing={4}>
                  {metadata.cyclesDetected && (
                    <Badge colorScheme="red" fontSize="sm">
                      Circular Dependencies Detected
                    </Badge>
                  )}
                  {metadata.processingTime && (
                    <Badge colorScheme="blue" fontSize="sm">
                      Processed in {metadata.processingTime}ms
                    </Badge>
                  )}
                </HStack>
              )}
            </CardBody>
          </Card>

          {/* Cycle Warning */}
          {metadata?.cyclesDetected && (
            <Alert status="warning" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Circular Dependencies Detected</AlertTitle>
                <AlertDescription>
                  Some tasks have circular dependencies and are marked as errors. These need to be
                  resolved before proceeding.
                </AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Task Graph */}
          <Card>
            <CardBody p={0}>
              <TaskGraph />
            </CardBody>
          </Card>

          {/* Legend */}
          <Card>
            <CardBody>
              <Heading size="sm" mb={3}>
                Legend
              </Heading>
              <HStack spacing={6} flexWrap="wrap">
                <HStack>
                  <Box w={4} h={4} bg="green.400" borderRadius="sm" />
                  <Text fontSize="sm">Ready (no dependencies)</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="yellow.400" borderRadius="sm" />
                  <Text fontSize="sm">Blocked (dependencies not met)</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="gray.400" borderRadius="sm" />
                  <Text fontSize="sm">Completed</Text>
                </HStack>
                <HStack>
                  <Box w={4} h={4} bg="red.400" borderRadius="sm" />
                  <Text fontSize="sm">Error (circular dependency)</Text>
                </HStack>
              </HStack>
            </CardBody>
          </Card>
        </VStack>
      </Container>
    </Box>
  );
}
