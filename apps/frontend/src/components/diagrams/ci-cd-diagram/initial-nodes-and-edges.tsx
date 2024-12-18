import { Node, Edge, Position } from '@xyflow/react';
import { UserRound } from 'lucide-react';

import { CustomGroupNode, CustomNode } from '../custom-nodes';
import { CustomEdge } from '../custom-edge';
import { Github, GithubActions } from '../../icons/github';
import { CloudFormation, CloudFront, S3 } from '../../icons/aws';

// #############
// ### NODES ###
// #############
export const initialNodes: Node<
  CustomGroupNode['data'] | CustomNode['data']
>[] = [
  {
    id: 'developer',
    type: 'customNode',
    position: { x: -85, y: 20 },
    data: {
      label: 'Developer',
      icon: <UserRound className="stroke-[1.5]" />,
      description: 'Pushes code to Github\nand executes deployment scripts',
      sources: [
        {
          id: 'default',
          position: Position.Left,
          className: 'top-5 left-[4.25rem]',
        },
        {
          id: 'to-cloudformation-main-stack',
          position: Position.Right,
          className: 'top-5 right-[4.25rem]',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'github-repository',
    type: 'customNode',
    position: { x: -400, y: 157 },
    data: {
      label: 'GitHub Repository',
      icon: <Github className="h-8 w-8 stroke-[1.5]" />,
      description: 'Stores source code and CI/CD workflows',
      sources: [
        { id: 'default' },
        {
          id: 'to-stack-upload-workflow',
          position: Position.Right,
          className: 'top-5 right-[5.4rem]',
        },
        {
          id: 'to-frontend-deployment-workflow',
          position: Position.Left,
          className: 'top-5 left-[5.4rem]',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'stack-upload-workflow',
    type: 'customNode',
    position: { x: -70, y: 150 },
    data: {
      label: 'Stack Upload Workflow',
      icon: <GithubActions />,
      description: 'Uploads CloudFormation\n template files to S3',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-12',
        },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'top-6 left-14' },
      ],
    },
    selectable: false,
  },
  {
    id: 'cloudformation-templates-bucket',
    type: 'customNode',
    position: { x: 150, y: 150 },
    data: {
      label: 'Templates Bucket',
      icon: <S3 />,
      description: 'Stores CloudFormation templates',
      sources: [{ id: 'default' }],
      targets: [
        { id: 'default', position: Position.Left, className: 'top-6 left-16' },
      ],
    },
    selectable: false,
  },
  {
    id: 'cloudformation-main-stack',
    type: 'customNode',
    position: { x: 320, y: 350 },
    data: {
      label: 'CloudFormation Main Stack',
      icon: <CloudFormation />,
      description: 'Manages infrastructure\n through nested stacks updates',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'frontend-deployment-workflow',
    type: 'customNode',
    position: { x: -700, y: 150 },
    data: {
      label: 'Frontend Deployment Workflow',
      icon: <GithubActions />,
      description:
        'Builds frontend, uploads to S3,\ninvalidates CloudFront Distribution',
      sources: [
        { id: 'default' },
        {
          id: 'to-frontend-bucket',
          position: Position.Left,
          className: 'top-6 left-20',
        },
      ],
      targets: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-[4.5rem]',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'frontend-bucket',
    type: 'customNode',
    position: { x: -950, y: 150 },
    data: {
      label: 'Frontend Bucket',
      icon: <S3 />,
      description: 'Stores static site files',
      sources: [{ id: 'default' }],
      targets: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-8',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'frontend-distribution',
    type: 'customNode',
    position: { x: -820, y: 280 },
    data: {
      label: 'Frontend Distribution',
      icon: <CloudFront />,
      description: 'Distributes site globally',
      sources: [{ id: 'default' }],
      targets: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-10',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'api-deployment-workflow',
    type: 'customNode',
    position: { x: -600, y: 350 },
    data: {
      label: 'Api Deployment Workflow',
      icon: <GithubActions />,
      description:
        'Builds docker image, pushes it\nto ECR, updates ECS service',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-14',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'analysis-model-deployment-workflow',
    type: 'customNode',
    position: { x: -280, y: 350 },
    data: {
      label: 'Analysis Model Deployment Workflow',
      icon: <GithubActions />,
      description:
        'Builds docker image, pushes it\nto ECR, updates ECS service',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-14',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'lambdas-deployment-workflow',
    type: 'customNode',
    position: { x: 50, y: 350 },
    data: {
      label: 'Lambdas Deployment Workflow',
      icon: <GithubActions />,
      description:
        'Builds and packages lambda functions\nuploads to S3, updates functions code',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-14',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
];

// #############
// ### EDGES ###
// #############
const commonProperties = { selectable: false, animated: true };

export const initialEdges: Edge<NonNullable<CustomEdge['data']>>[] = [
  {
    id: 'developer-github-repository',
    type: 'customEdge',
    source: 'developer',
    target: 'github-repository',
    data: { label: 'Code push', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'developer-cloudformation-main-stack',
    type: 'customEdge',
    source: 'developer',
    target: 'cloudformation-main-stack',
    data: {
      label: 'Deployment script execution',
      pathType: 'bezier',
      className: '-top-10 -left-14',
    },
    sourceHandle: 'developer-source-to-cloudformation-main-stack',
    ...commonProperties,
  },
  {
    id: 'github-repository-stack-upload-workflow',
    type: 'customEdge',
    source: 'github-repository',
    target: 'stack-upload-workflow',
    data: {
      label: 'Triggers on template changes',
      pathType: 'bezier',
    },
    sourceHandle: 'github-repository-source-to-stack-upload-workflow',
    ...commonProperties,
  },
  {
    id: 'stack-upload-workflow-cloudformation-templates-bucket',
    type: 'customEdge',
    source: 'stack-upload-workflow',
    target: 'cloudformation-templates-bucket',
    data: {
      label: 'Templates upload',
      pathType: 'bezier',
      className: '-left-2',
    },
    ...commonProperties,
  },
  {
    id: 'cloudformation-templates-bucket-cloudformation-main-stack',
    type: 'customEdge',
    source: 'cloudformation-templates-bucket',
    target: 'cloudformation-main-stack',
    data: {
      label: 'Templates request',
      pathType: 'bezier',
      className: '-left-2',
    },
    ...commonProperties,
  },
  {
    id: 'github-repository-frontend-deployment-workflow',
    type: 'customEdge',
    source: 'github-repository',
    target: 'frontend-deployment-workflow',
    data: {
      label: 'Triggers on frontend app changes',
      pathType: 'bezier',
    },
    sourceHandle: 'github-repository-source-to-frontend-deployment-workflow',
    ...commonProperties,
  },
  {
    id: 'frontend-deployment-workflow-frontend-bucket',
    type: 'customEdge',
    source: 'frontend-deployment-workflow',
    target: 'frontend-bucket',
    data: {
      label: 'Build files upload',
      pathType: 'bezier',
    },
    sourceHandle: 'frontend-deployment-workflow-source-to-frontend-bucket',
    ...commonProperties,
  },
  {
    id: 'frontend-deployment-workflow-frontend-distribution',
    type: 'customEdge',
    source: 'frontend-deployment-workflow',
    target: 'frontend-distribution',
    data: {
      label: 'distribution invalidation',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'github-repository-api-deployment-workflow',
    type: 'customEdge',
    source: 'github-repository',
    target: 'api-deployment-workflow',
    data: {
      label: 'Triggers on api app changes',
      pathType: 'bezier',
      className: 'top-4 -left-10',
    },
    ...commonProperties,
  },
  {
    id: 'github-repository-analysis-model-deployment-workflow',
    type: 'customEdge',
    source: 'github-repository',
    target: 'analysis-model-deployment-workflow',
    data: {
      label: 'Triggers on model app changes',
      pathType: 'bezier',
      className: 'top-4 left-4',
    },
    ...commonProperties,
  },
  {
    id: 'github-repository-lambdas-deployment-workflow',
    type: 'customEdge',
    source: 'github-repository',
    target: 'lambdas-deployment-workflow',
    data: {
      label: 'Triggers on lambda apps changes',
      pathType: 'bezier',
      className: 'top-4 left-24',
    },
    ...commonProperties,
  },
];
