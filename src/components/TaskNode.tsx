import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Box, Text, Badge, VStack, Button, useToast } from '@chakra-ui/react';
import { Task } from '../types';
import { useTaskStore } from '../context/TaskStore';
import apiService from '../services/api';

interface TaskNodeData extends Task {
  label: string;
}

function TaskNode({ data }: NodeProps<TaskNodeData>) {
  const { completeTask, updateTasks } = useTaskStore();
  const toast = useToast();

  const getNodeColor = () => {
    switch (data.status) {
      case 'ready':
        return 'green.400';
      case 'blocked':
        return 'yellow.400';
      case 'completed':
        return 'gray.400';
      case 'error':
        return 'red.400';
      default:
        return 'gray.400';
    }
  };

  const getPriorityColor = () => {
    switch (data.priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const handleComplete = async () => {
    if (data.status !== 'ready') {
      toast({
        title: 'Cannot complete task',
        description:
          data.status === 'blocked'
            ? 'This task has unmet dependencies'
            : data.status === 'completed'
            ? 'This task is already completed'
            : 'This task has errors',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      // Call API to mark task as complete
      const response = await apiService.completeTask(data.taskId);

      // Update local state
      completeTask(data.taskId);

      // Update all tasks from server response
      updateTasks(response.data.allTasks);

      toast({
        title: 'Task completed!',
        description: 'Dependent tasks have been updated',
        status: 'success',
        duration: 2000,
        isClosable: true,
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.error?.message || 'Failed to complete task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      bg="white"
      borderWidth={2}
      borderColor={getNodeColor()}
      borderRadius="lg"
      p={4}
      minW="250px"
      maxW="300px"
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
      transition="all 0.2s"
    >
      <Handle type="target" position={Position.Top} style={{ background: '#555' }} />

      <VStack align="stretch" spacing={2}>
        <Badge colorScheme={getPriorityColor()} alignSelf="flex-start" fontSize="xs">
          {data.priority.toUpperCase()}
        </Badge>

        <Text fontSize="sm" fontWeight="bold" noOfLines={3}>
          {data.description}
        </Text>

        <Badge
          colorScheme={
            data.status === 'ready'
              ? 'green'
              : data.status === 'blocked'
              ? 'yellow'
              : data.status === 'completed'
              ? 'gray'
              : 'red'
          }
          fontSize="xs"
          textAlign="center"
        >
          {data.status.toUpperCase()}
        </Badge>

        {data.dependencies.length > 0 && (
          <Text fontSize="xs" color="gray.600">
            {data.dependencies.length} dependencies
          </Text>
        )}

        {data.errorMessage && (
          <Text fontSize="xs" color="red.500">
            {data.errorMessage}
          </Text>
        )}

        {data.status !== 'completed' && data.status !== 'error' && (
          <Button
            size="sm"
            colorScheme={data.status === 'ready' ? 'green' : 'gray'}
            onClick={handleComplete}
            isDisabled={data.status !== 'ready'}
          >
            {data.status === 'ready' ? 'Complete' : 'Blocked'}
          </Button>
        )}

        {data.status === 'completed' && (
          <Text fontSize="xs" color="green.600" textAlign="center" fontWeight="bold">
            ✓ Completed
          </Text>
        )}
      </VStack>

      <Handle type="source" position={Position.Bottom} style={{ background: '#555' }} />
    </Box>
  );
}

export default memo(TaskNode);
