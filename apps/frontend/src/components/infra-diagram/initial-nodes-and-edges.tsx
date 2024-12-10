import { Node, Edge, Position } from '@xyflow/react';
import { UserRound } from 'lucide-react';

import {
  Alb,
  CloudFront,
  Cognito,
  Ecs,
  EventBridge,
  Igw,
  Lambda,
  S3,
  Transcribe,
  Vpc,
} from '../icons/aws';
import { Google } from '../icons/google';

import { CustomGroupNode, CustomNode } from './custom-nodes';
import { CustomEdge } from './custom-edge';

function getMiddleOfScreen() {
  if (typeof window !== 'undefined') {
    return window.innerWidth / 2;
  }

  return 0;
}

export const initialNodes: Node<
  CustomGroupNode['data'] | CustomNode['data']
>[] = [
  {
    id: 'user',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 85, y: 50 },
    data: {
      label: 'User Client',
      icon: <UserRound className="stroke-[1.5]" />,
      description: 'Sends requests and uploads files',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default', position: Position.Bottom }],
    },
  },
  {
    id: 'frontend-distribution',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 400, y: 100 },
    data: {
      label: 'Frontend Distribution',
      icon: <CloudFront />,
      description: 'Distributes site globally',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'frontend-bucket',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 550, y: 280 },
    data: {
      label: 'Frontend Bucket',
      icon: <S3 />,
      description: 'Stores static site files',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'media-distribution',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 280, y: 100 },
    data: {
      label: 'Media Distribution',
      icon: <CloudFront />,
      description: 'Distributes media globally',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'media-bucket',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 300, y: 280 },
    data: {
      label: 'Media Bucket',
      icon: <S3 />,
      description: 'Stores video and thumbnail files',
      sources: [
        {
          id: 'default',
          position: Position.Right,
          className: 'right-14 top-6',
        },
      ],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'google-oauth',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 350, y: 280 },
    data: {
      label: 'Google OAuth',
      icon: <Google className="h-8 w-8" />,
      description: 'Authenticates users',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'cognito',
    type: 'customNode',
    position: { x: getMiddleOfScreen() - 230, y: 400 },
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
    position: { x: getMiddleOfScreen() + 520, y: 200 },
    data: {
      label: 'Event Bridge Rule',
      icon: <EventBridge />,
      description: 'Rule triggered on video upload',
      sources: [
        { id: 'to-thumbnail-lambda', position: Position.Top },
        { id: 'to-transcribe-lambda' },
        { id: 'to-rekognition-lambda' },
      ],
      targets: [
        { id: 'default', position: Position.Left, className: 'left-14 top-6' },
      ],
    },
  },
  {
    id: 'thumbnail-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 520, y: 50 },
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
    position: { x: getMiddleOfScreen() + 450, y: 370 },
    data: {
      label: 'Transcribe Lambda',
      icon: <Lambda />,
      description: 'Handles Transcribe job',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'amazon-transcribe',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 430, y: 500 },
    data: {
      label: 'Amazon Transcribe',
      icon: <Transcribe />,
      description:
        'Converts speech and dialog in\nvideo into a text transcript',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'rekognition-lambda',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 600, y: 370 },
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
    position: { x: getMiddleOfScreen() + 600, y: 500 },
    data: {
      label: 'Amazon Rekognition',
      icon: <Transcribe />,
      description: 'Identifies objects, scenes\n and activities within video',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'igw',
    type: 'customNode',
    position: { x: getMiddleOfScreen() + 20, y: 280 },
    data: {
      label: 'Internet Gateway',
      icon: <Igw />,
      description: 'Internet access for VPC resources',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'vpc',
    type: 'customGroupNode',
    position: { x: getMiddleOfScreen() - 80, y: 400 },
    data: {
      label: 'Virtual Private Cloud',
      icon: <Vpc className="h-8 w-8" />,
      sources: [
        {
          id: 'default',
          className: 'left-[75%] translate-x-[-50%]',
          position: Position.Top,
        },
      ],
      targets: [{ id: 'default', className: 'left-[75%] translate-x-[-50%]' }],
    },
    style: {
      zIndex: -1,
      backgroundColor: 'transparent',
      height: 370,
      width: 400,
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
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'model-cluster',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 230, y: 250 },
    data: {
      label: 'Analysis Model Cluster',
      icon: <Ecs />,
      description: 'Auto-scales g4dn.xlarge\n Analyzing video through prompts',
      sources: [{ id: 'default' }],
      targets: [{ id: 'default' }],
    },
  },
  {
    id: 'alb',
    type: 'customNode',
    parentId: 'vpc',
    extent: 'parent',
    position: { x: 60, y: 80 },
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
    data: { label: 'User info' },
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
    id: 'igw-vpc',
    type: 'customEdge',
    source: 'igw',
    target: 'vpc',
    animated: true,
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
      label: 'Sqs polling,\nGet video from S3,\nSave results in DynamoDB',
      perceiveSourcePosition: Position.Bottom,
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
];
