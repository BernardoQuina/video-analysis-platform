import { Node, Edge, Position } from '@xyflow/react';
import { UserRound } from 'lucide-react';

import {
  Alb,
  CloudFront,
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
  },
  {
    id: 'event-bridge-rule',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 500, y: 250 },
    data: {
      label: 'Event Bridge Rule',
      icon: <EventBridge />,
      description: 'Invokes video processing lambdas',
      sources: [
        { id: 'to-thumbnail-lambda', position: Position.Top },
        { id: 'to-transcribe-lambda' },
        { id: 'to-rekognition-lambda' },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'left-16 top-6' },
      ],
    },
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
  },
  {
    id: 'transcribe-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 350, y: 400 },
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
  },
  {
    id: 'amazon-transcribe',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 430, y: 600 },
    data: {
      label: 'Amazon Transcribe',
      icon: <Transcribe />,
      description:
        'Converts speech and dialog\nin video into a text transcript',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
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
  },
  {
    id: 'amazon-rekognition',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 600, y: 600 },
    data: {
      label: 'Amazon Rekognition',
      icon: <Rekognition />,
      description: 'Identifies objects, scenes\n and activities within video',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
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
      ],
      targets: [
        {
          id: 'default',
          position: Position.Bottom,
          // className: 'top-6 right-[4.25rem]',
        },
      ],
    },
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
  },
  {
    id: 'api-cluster',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 30, y: 250 },
    data: {
      label: 'Api Cluster',
      icon: <Ecs />,
      description: 'Auto-scales t2.micro\n Serving api requests',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-8',
        },
      ],
      targets: [{ id: 'default' }],
    },
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
      description: 'Auto-scales g4dn.xlarge\n Analyzing video through prompts',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'top-6 right-16',
        },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'top-6 left-16' },
      ],
    },
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
  },
];

export const initialEdges: Edge<NonNullable<CustomEdge['data']>>[] = [
  {
    id: 'user-frontend-distribution',
    type: 'customEdge',
    source: 'user',
    target: 'frontend-distribution',
    animated: true,
    data: { label: 'Site requests' },
    sourceHandle: 'user-source-to-frontend-distribution',
  },
  {
    id: 'user-igw',
    type: 'customEdge',
    source: 'user',
    target: 'igw',
    animated: true,
    data: { label: 'Api requests' },
  },
  {
    id: 'user-media-distribution',
    type: 'customEdge',
    source: 'user',
    target: 'media-distribution',
    animated: true,
    data: { label: 'Media requests' },
    sourceHandle: 'user-source-to-media-distribution',
  },
  {
    id: 'user-media-bucket',
    type: 'customEdge',
    source: 'user',
    target: 'media-bucket',
    animated: true,
    data: { label: 'Multipart upload (via signed urls)' },
  },
  {
    id: 'user-google-oauth',
    type: 'customEdge',
    source: 'user',
    target: 'google-oauth',
    animated: true,
    data: { label: 'Google Sign in' },
  },
  {
    id: 'cognito-user',
    type: 'customEdge',
    source: 'cognito',
    target: 'user',
    animated: true,
    data: { label: 'Code grant' },
  },
  {
    id: 'cognito-igw',
    type: 'customEdge',
    source: 'cognito',
    target: 'igw',
    animated: true,
    data: { label: 'Token exchange' },
  },
  {
    id: 'google-oauth-cognito',
    type: 'customEdge',
    source: 'google-oauth',
    target: 'cognito',
    animated: true,
    data: { label: 'User info', className: '-left-10 -top-2' },
  },
  {
    id: 'frontend-distribution-frontend-bucket',
    type: 'customEdge',
    source: 'frontend-distribution',
    target: 'frontend-bucket',
    animated: true,
    data: { label: 'Site requests' },
  },
  {
    id: 'media-distribution-media-bucket',
    type: 'customEdge',
    source: 'media-distribution',
    target: 'media-bucket',
    animated: true,
    data: { label: 'Media requests' },
  },
  {
    id: 'media-bucket-event-bridge-rule',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'event-bridge-rule',
    animated: true,
    data: { label: 'Trigger on video upload' },
  },
  {
    id: 'media-bucket-igw',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'igw',
    animated: true,
    data: { label: 'Video request', className: 'left-28 -top-7' },
    sourceHandle: 'media-bucket-source-to-igw',
  },
  {
    id: 'media-bucket-thumbnail-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'thumbnail-lambda',
    animated: true,
    data: { label: 'Video request', className: 'top-1' },
  },
  {
    id: 'media-bucket-transcribe-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'transcribe-lambda',
    animated: true,
    data: { label: 'Video requests', className: '-left-16 -top-5' },
    sourceHandle: 'media-bucket-source-to-transcribe-and-rekognition-lambda',
  },
  {
    id: 'media-bucket-rekognition-lambda',
    type: 'customEdge',
    source: 'media-bucket',
    target: 'rekognition-lambda',
    animated: true,
    sourceHandle: 'media-bucket-source-to-transcribe-and-rekognition-lambda',
  },
  {
    id: 'event-bridge-rule-thumbnail-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'thumbnail-lambda',
    animated: true,
    sourceHandle: 'event-bridge-rule-source-to-thumbnail-lambda',
  },
  {
    id: 'event-bridge-rule-transcribe-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'transcribe-lambda',
    animated: true,
    sourceHandle: 'event-bridge-rule-source-to-transcribe-lambda',
  },
  {
    id: 'event-bridge-rule-rekognition-lambda',
    type: 'customEdge',
    source: 'event-bridge-rule',
    target: 'rekognition-lambda',
    animated: true,
    sourceHandle: 'event-bridge-rule-source-to-rekognition-lambda',
  },
  {
    id: 'thumbnail-lambda-media-bucket',
    type: 'customEdge',
    source: 'thumbnail-lambda',
    target: 'media-bucket',
    animated: true,
    data: { label: 'Thumbnail upload' },
  },
  {
    id: 'transcribe-lambda-amazon-transcribe',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'amazon-transcribe',
    animated: true,
  },
  {
    id: 'rekognition-lambda-amazon-rekognition',
    type: 'customEdge',
    source: 'rekognition-lambda',
    target: 'amazon-rekognition',
    animated: true,
  },
  {
    id: 'transcribe-lambda-analysis-queue',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'analysis-queue',
    animated: true,
    data: { label: 'Readiness message' },
    sourceHandle: 'transcribe-lambda-source-to-analysis-queue',
  },
  {
    id: 'analysis-queue-igw',
    type: 'customEdge',
    source: 'analysis-queue',
    target: 'igw',
    animated: true,
    data: { label: 'Polled messages', className: 'left-10' },
  },
  {
    id: 'transcribe-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'transcribe-lambda',
    target: 'dynamodb-table',
    animated: true,
    data: { label: 'Save transcript results' },
  },
  {
    id: 'rekognition-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'rekognition-lambda',
    target: 'dynamodb-table',
    animated: true,
    data: {
      label: 'Save object detection results',
      className: '-left-40 top-5',
    },
    targetHandle: 'dynamodb-table-target-from-rekognition-lambda',
  },
  {
    id: 'thumbnail-lambda-dynamodb-table',
    type: 'customEdge',
    source: 'thumbnail-lambda',
    target: 'dynamodb-table',
    animated: true,
    data: { label: 'Save thumbnail details', className: 'left-16 -top-12' },
  },
  {
    id: 'igw-dynamodb-table-analysis-details',
    type: 'customEdge',
    source: 'igw',
    target: 'dynamodb-table',
    animated: true,
    data: { label: 'Save analysis results' },
    sourceHandle: 'igw-source-to-dynamodb-table',
  },
  {
    id: 'igw-dynamodb-table-video-details',
    type: 'customEdge',
    source: 'igw',
    target: 'dynamodb-table',
    animated: true,
    data: { label: 'CRUD database items' },
    sourceHandle: 'igw-source-to-dynamodb-table',
    targetHandle: 'dynamodb-table-target-from-igw',
  },
  {
    id: 'igw-vpc',
    type: 'customEdge',
    source: 'igw',
    target: 'vpc',
    animated: true,
    sourceHandle: 'igw-source-to-vpc',
    targetHandle: 'vpc-target-from-igw',
  },
  {
    id: 'vpc-igw',
    type: 'customEdge',
    source: 'vpc',
    target: 'igw',
    animated: true,
    sourceHandle: 'vpc-source-to-igw',
    targetHandle: 'igw-target-from-vpc',
  },
  {
    id: 'vpc-alb',
    type: 'customEdge',
    source: 'vpc',
    target: 'alb',
    animated: true,
    data: { perceiveSourcePosition: Position.Bottom },
  },
  {
    id: 'vpc-model-cluster',
    type: 'customEdge',
    source: 'vpc',
    target: 'model-cluster',
    animated: true,
    data: {
      label: 'Polled messages,\nVideo request',
      perceiveSourcePosition: Position.Bottom,
      className: '-top-20 -left-2',
    },
  },
  {
    id: 'api-cluster-alb',
    type: 'customEdge',
    source: 'alb',
    target: 'api-cluster',
    animated: true,
    data: { label: 'Api requests,\n Token exchange' },
  },
  {
    id: 'api-cluster-vpc',
    type: 'customEdge',
    source: 'api-cluster',
    target: 'vpc',
    animated: true,
    data: {
      label: 'CRUD database items',
      perceivedTargetPosition: Position.Bottom,
      className: '-left-40 top-[4.5rem]',
    },
  },
  {
    id: 'model-cluster-vpc',
    type: 'customEdge',
    source: 'model-cluster',
    target: 'vpc',
    animated: true,
    data: {
      label: 'Save analysis results',
      perceivedTargetPosition: Position.Bottom,
    },
  },
];
