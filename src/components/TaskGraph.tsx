import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  ConnectionLineType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { useTaskStore } from '../context/TaskStore';
import TaskNode from './TaskNode';
import { Task } from '../types';

// Custom node types
const nodeTypes = {
  taskNode: TaskNode,
};

// Layout algorithm - hierarchical layout
const getLayoutedElements = (tasks: Task[]) => {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  // Calculate levels using topological sort
  const levels = new Map<string, number>();
  const inDegree = new Map<string, number>();

  // Initialize in-degrees
  tasks.forEach((task) => {
    inDegree.set(task.taskId, 0);
  });

  tasks.forEach((task) => {
    task.dependencies.forEach((depId) => {
      inDegree.set(depId, (inDegree.get(depId) || 0) + 1);
    });
  });

  // Calculate levels
  const queue: string[] = [];
  tasks.forEach((task) => {
    if (task.dependencies.length === 0) {
      levels.set(task.taskId, 0);
      queue.push(task.taskId);
    }
  });

  while (queue.length > 0) {
    const taskId = queue.shift()!;
    const currentLevel = levels.get(taskId) || 0;

    tasks.forEach((task) => {
      if (task.dependencies.includes(taskId)) {
        const newLevel = Math.max(levels.get(task.taskId) || 0, currentLevel + 1);
        levels.set(task.taskId, newLevel);

        const deg = inDegree.get(task.taskId) || 0;
        inDegree.set(task.taskId, deg - 1);

        if (deg - 1 === 0) {
          queue.push(task.taskId);
        }
      }
    });
  }

  // Group tasks by level
  const levelGroups = new Map<number, Task[]>();
  tasks.forEach((task) => {
    const level = levels.get(task.taskId) ?? 0;
    if (!levelGroups.has(level)) {
      levelGroups.set(level, []);
    }
    levelGroups.get(level)!.push(task);
  });

  // Position nodes
  const horizontalSpacing = 350;
  const verticalSpacing = 150;

  tasks.forEach((task) => {
    const level = levels.get(task.taskId) ?? 0;
    const tasksInLevel = levelGroups.get(level) || [];
    const indexInLevel = tasksInLevel.indexOf(task);

    const x = indexInLevel * horizontalSpacing;
    const y = level * verticalSpacing;

    nodes.push({
      id: task.taskId,
      type: 'taskNode',
      position: { x, y },
      data: {
        ...task,
        label: task.description,
      },
    });

    // Create edges for dependencies
    task.dependencies.forEach((depId) => {
      edges.push({
        id: `${depId}-${task.taskId}`,
        source: depId,
        target: task.taskId,
        type: ConnectionLineType.SmoothStep,
        animated: task.status === 'blocked',
        style: {
          stroke: task.status === 'error' ? '#FC8181' : '#CBD5E0',
          strokeWidth: 2,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: task.status === 'error' ? '#FC8181' : '#CBD5E0',
        },
      });
    });
  });

  return { nodes, edges };
};

export default function TaskGraph() {
  const { tasks } = useTaskStore();
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Update graph when tasks change
  useEffect(() => {
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(tasks);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [tasks, setNodes, setEdges]);

  const proOptions = { hideAttribution: true };

  return (
    <div style={{ width: '100%', height: '600px' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        minZoom={0.1}
        maxZoom={1.5}
        defaultEdgeOptions={{
          type: ConnectionLineType.SmoothStep,
        }}
      >
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
