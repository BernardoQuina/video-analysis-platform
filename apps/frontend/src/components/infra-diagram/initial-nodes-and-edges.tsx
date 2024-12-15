import { Node, Edge, Position } from '@xyflow/react';
import { UserRound } from 'lucide-react';

import {
  Alb,
  ASG,
  CloudFront,
  CloudWatch,
  Cognito,
  DynamoDB,
  Ecs,
  EventBridge,
  Igw,
  Lambda,
  Rekognition,
  S3,
  SQS,
  Transcribe,
  Vpc,
} from '../icons/aws';
import { Google } from '../icons/google';

import { CustomGroupNode, CustomNode } from './custom-nodes';
import { CustomEdge } from './custom-edge';

function getMiddleOfScreen() {
  // if (typeof window !== 'undefined') {
  //   return window.innerWidth / 2 - 200;
  // }

  return 0;
}

// #############
// ### NODES ###
// #############
export const initialNodes: Node<
  CustomGroupNode['data'] | CustomNode['data']
>[] = [
  {
    id: 'user',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 85, y: 20 },
    data: {
      label: 'User Client',
      icon: <UserRound className="stroke-[1.5]" />,
      description: 'Sends requests and uploads files',
      sources: [
        { id: 'default' },
        {
          id: 'to-frontend-distribution',
          position: Position.Left,
          className: 'left-[4.25rem] top-5',
        },
        {
          id: 'to-media-distribution',
          position: Position.Right,
          className: 'right-[4.25rem] top-5',
        },
      ],
      targets: [{ id: 'default', position: Position.Bottom }],
    },
    selectable: false,
  },
  {
    id: 'frontend-distribution',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 400, y: 50 },
    data: {
      label: 'Frontend Distribution',
      icon: <CloudFront />,
      description: 'Distributes site globally',
      sources: [
        { id: 'default', position: Position.Left, className: 'top-6 left-10' },
      ],
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
    id: 'frontend-bucket',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 690, y: 80 },
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
    id: 'media-distribution',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 280, y: 50 },
    data: {
      label: 'Media Distribution',
      icon: <CloudFront />,
      description: 'Distributes media globally',
      sources: [{ id: 'default' }],
      targets: [
        {
          id: 'default',
          position: Position.Left,
          className: 'top-6 left-10',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'media-bucket',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 120, y: 200 },
    data: {
      label: 'Media Bucket',
      icon: <S3 />,
      description: 'Stores video and thumbnail files',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'right-[3.75rem] top-6',
        },
        {
          id: 'to-igw',
          position: Position.Left,
          className: 'left-[3.75rem] top-6',
        },
        {
          id: 'to-transcribe-and-rekognition-lambda',
          position: Position.Bottom,
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'google-oauth',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 690, y: 250 },
    data: {
      label: 'Google OAuth',
      icon: <Google className="h-8 w-8" />,
      description: 'Authenticates users',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-8',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'cognito',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 500, y: 320 },
    data: {
      label: 'Cognito',
      icon: <Cognito />,
      description: 'Manages User Pool\n and authentication tokens',
      sources: [{ id: 'default', position: Position.Top }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'event-bridge-rule',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 560, y: 250 },
    data: {
      label: 'Event Bridge Rule',
      icon: <EventBridge />,
      description: 'Invokes processing lambdas',
      sources: [
        { id: 'to-thumbnail-lambda', position: Position.Top },
        { id: 'to-transcribe-lambda' },
        { id: 'to-rekognition-lambda' },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'left-16 top-6' },
      ],
    },
    selectable: false,
  },
  {
    id: 'thumbnail-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 470, y: 80 },
    data: {
      label: 'Thumbnail Lambda',
      icon: <Lambda />,
      description: 'Generates thumbnail with ffmpeg',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default', position: Position.Bottom }],
    },
    selectable: false,
  },
  {
    id: 'transcribe-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 340, y: 400 },
    data: {
      label: 'Transcribe Lambda',
      icon: <Lambda />,
      description: 'Handles Transcribe job',
      sources: [
        { id: 'default' },
        {
          id: 'to-analysis-queue',
          position: Position.Left,
          className: 'top-6 left-10',
        },
      ],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'amazon-transcribe',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 540, y: 600 },
    data: {
      label: 'Amazon Transcribe',
      icon: <Transcribe />,
      description:
        'Converts speech and dialog\nin video into a text transcript',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'rekognition-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 550, y: 400 },
    data: {
      label: 'Rekognition Lambda',
      icon: <Lambda />,
      description: 'Handles Rekognition job',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'amazon-rekognition',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 710, y: 600 },
    data: {
      label: 'Amazon Rekognition',
      icon: <Rekognition />,
      description: 'Identifies objects, scenes\n and activities within video',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'analysis-queue',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 40, y: 255 },
    data: {
      label: 'Analysis SQS Queue',
      icon: <SQS />,
      description:
        'Signals video readiness for analysis\nmodel (transcript is available)',
      sources: [
        {
          id: 'default',
          position: Position.Left,
          className: 'top-6 left-[4.25rem]',
        },
        { id: 'to-cloudwatch-metrics', position: Position.Bottom },
      ],
      targets: [{ id: 'default', position: Position.Bottom }],
    },
    selectable: false,
  },
  {
    id: 'dynamodb-table',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 80, y: 550 },
    data: {
      label: 'DynamoDB Table',
      icon: <DynamoDB />,
      description: 'Stores videos, sessions and user limits',
      sources: [{ id: 'default' }],
      targets: [
        { id: 'default' },
        {
          id: 'from-rekognition-lambda',
          position: Position.Right,
          className: 'top-6 right-20',
        },
        {
          id: 'from-igw',
          position: Position.Left,
          className: 'top-6 left-20',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'igw',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 280, y: 350 },
    data: {
      label: 'Internet Gateway',
      icon: <Igw />,
      description: 'Internet access for VPC resources',
      sources: [
        { id: 'default' },
        {
          id: 'to-dynamodb-table',
          position: Position.Right,
          className: 'top-6 right-16',
        },
        {
          id: 'to-vpc',
          position: Position.Bottom,
        },
      ],
      targets: [
        { id: 'default' },
        { id: 'from-vpc', position: Position.Bottom },
      ],
    },
    selectable: false,
  },
  {
    id: 'vpc',
    type: 'customGroupNode',
    position: { x: getMiddleOfScreen() - 685, y: 470 },
    data: {
      label: 'Virtual Private Cloud',
      icon: <Vpc className="h-8 w-8" />,
      sources: [
        {
          id: 'default',
          className: 'left-[65%] translate-x-[-50%]',
          position: Position.Top,
        },
        {
          id: 'to-igw',
          className: 'left-[90%] translate-x-[-50%]',
          position: Position.Top,
        },
      ],
      targets: [
        { id: 'default', className: 'left-[90%] translate-x-[-50%]' },
        { id: 'from-igw', className: 'left-[65%] translate-x-[-50%]' },
      ],
    },
    style: {
      zIndex: -1,
      backgroundColor: 'transparent',
      height: 370,
      width: 600,
    },
    selectable: false,
  },
  {
    id: 'api-cluster',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 30, y: 255 },
    data: {
      label: 'Api Cluster',
      icon: <Ecs />,
      description: 'Runs ECS tasks on t2.micro\n Serving api requests',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-12',
        },
        {
          id: 'to-cloudwatch',
          position: Position.Bottom,
          className: 'left-20',
        },
      ],
      targets: [
        { id: 'default' },
        {
          id: 'from-cloudwatch-alarms',
          position: Position.Right,
          className: 'top-6 right-12',
        },
        { id: 'from-api-asg', position: Position.Bottom, className: 'left-16' },
      ],
    },
    selectable: false,
  },
  {
    id: 'model-cluster',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 390, y: 250 },
    data: {
      label: 'Analysis Model Cluster',
      icon: <Ecs />,
      description:
        'Runs ECS tasks on g4dn.xlarge\n Analyzing video through prompts',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-16',
        },
        {
          id: 'to-cloudwatch',
          position: Position.Bottom,
          className: 'left-[5.90rem]',
        },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'top-6 left-16' },
        {
          id: 'from-model-asg',
          position: Position.Bottom,
          className: 'left-[4.75rem]',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'alb',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 30, y: 80 },
    data: {
      label: 'Application Load Balancer',
      icon: <Alb />,
      description: 'Distributes traffic between tasks',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
    selectable: false,
  },
  {
    id: 'cloudwatch-logs',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 340, y: 750 },
    data: {
      label: 'CloudWatch Logs',
      icon: <CloudWatch />,
      description: 'Captures application logs',
      sources: [{ id: 'default' }],
      targets: [
        { id: 'default' },
        {
          id: 'from-clusters',
          position: Position.Bottom,
          // className: 'top-6 left-10',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'cloudwatch-metrics',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 70, y: 640 },
    data: {
      label: 'CloudWatch Metrics',
      icon: <CloudWatch />,
      description: 'Tracks performance and queue data',
      sources: [
        { id: 'default' },
        {
          id: 'to-cloudwatch-alarms',
          position: Position.Right,
          className: 'top-6 right-[4.5rem]',
        },
      ],
      targets: [
        { id: 'default' },
        { id: 'from-model-cluster', position: Position.Bottom },
      ],
    },
    selectable: false,
  },
  {
    id: 'cloudwatch-alarms',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 500, y: 1100 },
    data: {
      label: 'CloudWatch Alarms',
      icon: <CloudWatch />,
      description: 'Triggers actions on metrics thresholds',
      sources: [{ id: 'default', position: Position.Top }],
      targets: [
        { id: 'default' },
        {
          id: 'from-cloudwatch-metrics',
          position: Position.Right,
          className: 'top-6 right-[4.5rem]',
        },
      ],
    },
    selectable: false,
  },
  {
    id: 'api-asg',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 685, y: 950 },
    data: {
      label: 'Api Auto Scaling Group',
      icon: <ASG />,
      description:
        'Manages scaling of EC2 container \ninstances registered with the cluster',
      sources: [{ id: 'default', position: Position.Top }],
      targets: [{ id: 'default', position: Position.Bottom }],
    },
    selectable: false,
  },
  {
    id: 'model-asg',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 330, y: 950 },
    data: {
      label: 'Analysis Model Auto Scaling Group',
      icon: <ASG />,
      description:
        'Manages scaling of EC2 container \ninstances registered with the cluster',
      sources: [{ id: 'default', position: Position.Top }],
      targets: [{ id: 'default', position: Position.Bottom }],
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
    id: 'user-frontend-distribution',
    type: 'customEdge',
    source: 'user',
    target: 'frontend-distribution',
    data: { label: 'Site requests', pathType: 'bezier' },
    sourceHandle: 'user-source-to-frontend-distribution',
    ...commonProperties,
  },
  {
    id: 'user-igw',
    type: 'customEdge',
    source: 'user',
    target: 'igw',
    data: { label: 'Api requests', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'user-media-distribution',
    type: 'customEdge',
    source: 'user',
    target: 'media-distribution',
    data: { label: 'Media requests', pathType: 'bezier' },
    sourceHandle: 'user-source-to-media-distribution',
    ...commonProperties,
  },
  {
    id: 'user-media-bucket',
    type: 'customEdge',
    source: 'user',
    target: 'media-bucket',
    data: { label: 'Multipart upload (via signed urls)', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'user-google-oauth',
    type: 'customEdge',
    source: 'user',
    target: 'google-oauth',
    data: { label: 'Google Sign in', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'cognito-user',
    type: 'customEdge',
    source: 'cognito',
    target: 'user',
    data: { label: 'Code grant', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'cognito-igw',
    type: 'customEdge',
    source: 'cognito',
    target: 'igw',
    data: { label: 'Token exchange', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'google-oauth-cognito',
    type: 'customEdge',
    source: 'google-oauth',
    target: 'cognito',
    data: {
      label: 'User info',
      className: '-left-10 -top-2',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'frontend-distribution-frontend-bucket',
    type: 'customEdge',
    source: 'frontend-distribution',
    target: 'frontend-bucket',
    data: { label: 'Site requests', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'media-distribution-media-bucket',
    type: 'customEdge',
    source: 'media-distribution',
    target: 'media-bucket',
    data: { label: 'Media requests', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'media-bucket-event-bridge-rule',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'event-bridge-rule',
    data: { label: 'Trigger on video upload', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'media-bucket-igw',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'igw',
    data: {
      label: 'Video request',
      className: 'left-28 -top-7',
      pathType: 'bezier',
    },
    sourceHandle: 'media-bucket-source-to-igw',
    ...commonProperties,
  },
  {
    id: 'media-bucket-thumbnail-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'thumbnail-lambda',
    data: { label: 'Video request', className: 'top-1', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'media-bucket-transcribe-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'transcribe-lambda',
    data: {
      label: 'Video requests',
      className: '-left-16 -top-5',
      pathType: 'bezier',
    },
    sourceHandle: 'media-bucket-source-to-transcribe-and-rekognition-lambda',
    ...commonProperties,
  },
  {
    id: 'media-bucket-rekognition-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'rekognition-lambda',
    sourceHandle: 'media-bucket-source-to-transcribe-and-rekognition-lambda',
    ...commonProperties,
  },
  {
    id: 'event-bridge-rule-thumbnail-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'thumbnail-lambda',
    sourceHandle: 'event-bridge-rule-source-to-thumbnail-lambda',
    ...commonProperties,
  },
  {
    id: 'event-bridge-rule-transcribe-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'transcribe-lambda',
    sourceHandle: 'event-bridge-rule-source-to-transcribe-lambda',
    ...commonProperties,
  },
  {
    id: 'event-bridge-rule-rekognition-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'rekognition-lambda',
    sourceHandle: 'event-bridge-rule-source-to-rekognition-lambda',
    ...commonProperties,
  },
  {
    id: 'thumbnail-lambda-media-bucket',
    type: 'customEdge',
    source: 'thumbnail-lambda',
    target: 'media-bucket',
    data: { label: 'Thumbnail upload', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'transcribe-lambda-amazon-transcribe',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'amazon-transcribe',
    ...commonProperties,
  },
  {
    id: 'rekognition-lambda-amazon-rekognition',
    type: 'customEdge',
    source: 'rekognition-lambda',
    target: 'amazon-rekognition',
    ...commonProperties,
  },
  {
    id: 'transcribe-lambda-analysis-queue',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'analysis-queue',
    data: { label: 'Readiness message', pathType: 'bezier' },
    sourceHandle: 'transcribe-lambda-source-to-analysis-queue',
    ...commonProperties,
  },
  {
    id: 'analysis-queue-igw',
    type: 'customEdge',
    source: 'analysis-queue',
    target: 'igw',
    data: {
      label: 'Polled messages',
      className: 'left-10',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'transcribe-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'dynamodb-table',
    data: { label: 'Save transcript results', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'rekognition-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'rekognition-lambda',
    target: 'dynamodb-table',
    data: {
      label: 'Save object detection results',
      className: '-left-[12rem] top-6',
      pathType: 'bezier',
    },
    targetHandle: 'dynamodb-table-target-from-rekognition-lambda',
    ...commonProperties,
  },
  {
    id: 'thumbnail-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'thumbnail-lambda',
    target: 'dynamodb-table',
    data: {
      label: 'Save thumbnail details',
      className: 'left-20 -top-12',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'igw-dynamodb-table-analysis-details',
    type: 'customEdge',
    source: 'igw',
    target: 'dynamodb-table',
    data: {
      label: 'Save analysis results',
      pathType: 'bezier',
      className: 'top-8 left-12',
    },
    sourceHandle: 'igw-source-to-dynamodb-table',
    ...commonProperties,
  },
  {
    id: 'igw-dynamodb-table-video-details',
    type: 'customEdge',
    source: 'igw',
    target: 'dynamodb-table',
    data: {
      label: 'CRUD database items',
      pathType: 'bezier',
      className: '-top-5 -left-6',
    },
    sourceHandle: 'igw-source-to-dynamodb-table',
    targetHandle: 'dynamodb-table-target-from-igw',
    ...commonProperties,
  },
  {
    id: 'igw-vpc',
    type: 'customEdge',
    source: 'igw',
    target: 'vpc',
    sourceHandle: 'igw-source-to-vpc',
    targetHandle: 'vpc-target-from-igw',
    ...commonProperties,
  },
  {
    id: 'vpc-igw',
    type: 'customEdge',
    source: 'vpc',
    target: 'igw',
    sourceHandle: 'vpc-source-to-igw',
    targetHandle: 'igw-target-from-vpc',
    ...commonProperties,
  },
  {
    id: 'vpc-alb',
    type: 'customEdge',
    source: 'vpc',
    target: 'alb',
    data: { perceiveSourcePosition: Position.Bottom, pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'vpc-model-cluster',
    type: 'customEdge',
    source: 'vpc',
    target: 'model-cluster',
    data: {
      label: 'Polled messages,\nVideo request',
      perceiveSourcePosition: Position.Bottom,
      className: '-top-20 -left-2',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'api-cluster-alb',
    type: 'customEdge',
    source: 'alb',
    target: 'api-cluster',
    data: { label: 'Api requests,\n Token exchange', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'api-cluster-vpc',
    type: 'customEdge',
    source: 'api-cluster',
    target: 'vpc',
    data: {
      label: 'CRUD database items',
      perceivedTargetPosition: Position.Bottom,
      className: '-left-40 top-[4.5rem]',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'model-cluster-vpc',
    type: 'customEdge',
    source: 'model-cluster',
    target: 'vpc',
    data: {
      label: 'Save analysis results',
      perceivedTargetPosition: Position.Bottom,
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'api-cluster-cloudwatch-logs',
    type: 'customEdge',
    source: 'api-cluster',
    target: 'cloudwatch-logs',
    data: { label: 'Sends logs', pathType: 'smoothStep', offset: 50 },
    sourceHandle: 'api-cluster-source-to-cloudwatch',
    targetHandle: 'cloudwatch-logs-target-from-clusters',
    ...commonProperties,
  },
  {
    id: 'model-cluster-cloudwatch-logs',
    type: 'customEdge',
    source: 'model-cluster',
    target: 'cloudwatch-logs',
    data: { pathType: 'smoothStep', offset: 50 },
    sourceHandle: 'model-cluster-source-to-cloudwatch',
    targetHandle: 'cloudwatch-logs-target-from-clusters',
    ...commonProperties,
  },
  {
    id: 'thumbnail-lambda-cloudwatch-logs',
    type: 'customEdge',
    source: 'thumbnail-lambda',
    target: 'cloudwatch-logs',
    data: {
      label: 'Sends logs',
      pathType: 'bezier',
      className: '-top-12 left-6',
    },
    ...commonProperties,
  },
  {
    id: 'transcribe-lambda-cloudwatch-logs',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'cloudwatch-logs',
    data: { label: 'Sends logs', pathType: 'bezier', className: '-top-20 ' },
    ...commonProperties,
  },
  {
    id: 'rekognition-lambda-cloudwatch-logs',
    type: 'customEdge',
    source: 'rekognition-lambda',
    target: 'cloudwatch-logs',
    data: { label: 'Sends logs', pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'analysis-queue-cloudwatch-metrics',
    type: 'customEdge',
    source: 'analysis-queue',
    target: 'cloudwatch-metrics',
    data: {
      label: 'Provides queue data',
      pathType: 'bezier',
      className: 'top-20 -left-4',
    },
    sourceHandle: 'analysis-queue-source-to-cloudwatch-metrics',
    ...commonProperties,
  },
  {
    id: 'api-cluster-cloudwatch-metrics',
    type: 'customEdge',
    source: 'api-cluster',
    target: 'cloudwatch-metrics',
    data: { pathType: 'smoothStep', offset: 25 },
    sourceHandle: 'api-cluster-source-to-cloudwatch',
    targetHandle: 'cloudwatch-metrics-target-from-model-cluster',
    ...commonProperties,
  },
  {
    id: 'model-cluster-cloudwatch-metrics',
    type: 'customEdge',
    source: 'model-cluster',
    target: 'cloudwatch-metrics',
    data: {
      label: 'Provides instance and task data',
      pathType: 'smoothStep',
      offset: 30,
    },
    sourceHandle: 'model-cluster-source-to-cloudwatch',
    targetHandle: 'cloudwatch-metrics-target-from-model-cluster',
    ...commonProperties,
  },
  {
    id: 'cloudwatch-metrics-cloudwatch-alarms',
    type: 'customEdge',
    source: 'cloudwatch-metrics',
    target: 'cloudwatch-alarms',
    data: {
      label: 'Metrics data for alarms thresholds',
      pathType: 'smoothStep',
      offset: 100,
      className: 'top-20',
    },
    sourceHandle: 'cloudwatch-metrics-source-to-cloudwatch-alarms',
    targetHandle: 'cloudwatch-alarms-target-from-cloudwatch-metrics',
    ...commonProperties,
  },
  {
    id: 'cloudwatch-alarms-api-asg',
    type: 'customEdge',
    source: 'cloudwatch-alarms',
    target: 'api-asg',
    data: {
      label: 'Triggers instance scaling',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'cloudwatch-alarms-model-asg',
    type: 'customEdge',
    source: 'cloudwatch-alarms',
    target: 'model-asg',
    data: {
      label: 'Triggers instance scaling',
      pathType: 'bezier',
    },
    ...commonProperties,
  },
  {
    id: 'cloudwatch-alarms-api-cluster',
    type: 'customEdge',
    source: 'cloudwatch-alarms',
    target: 'api-cluster',
    data: {
      label: 'Triggers task scaling',
      pathType: 'bezier',
      className: 'top-32 left-12',
    },
    targetHandle: 'api-cluster-target-from-cloudwatch-alarms',
    ...commonProperties,
  },
  {
    id: 'cloudwatch-alarms-model-cluster',
    type: 'customEdge',
    source: 'cloudwatch-alarms',
    target: 'model-cluster',
    data: { pathType: 'bezier' },
    ...commonProperties,
  },
  {
    id: 'api-asg-api-cluster',
    type: 'customEdge',
    source: 'api-asg',
    target: 'api-cluster',
    data: {
      pathType: 'bezier',
      label: 'Launches/Terminates instances',
      className: 'top-8',
    },
    targetHandle: 'api-cluster-target-from-api-asg',
    ...commonProperties,
  },
  {
    id: 'model-asg-model-cluster',
    type: 'customEdge',
    source: 'model-asg',
    target: 'model-cluster',
    data: {
      pathType: 'bezier',
      label: 'Launches/Terminates instances',
      className: 'top-8',
    },
    targetHandle: 'model-cluster-target-from-model-asg',
    ...commonProperties,
  },
];
