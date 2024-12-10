import { Node, Edge, Position } from '@xyflow/react';
import { UserRound } from 'lucide-react';

import { Alb, CloudFront, Cognito, Ecs, Igw, S3, Vpc } from '../icons/aws';
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
      targetPosition: Position.Bottom,
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
      sourcePosition: Position.Top,
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
    },
  },
  {
    id: 'vpc',
    type: 'customGroupNode',
    position: { x: getMiddleOfScreen() - 80, y: 400 },
    data: {
      label: 'Virtual Private Cloud',
      icon: <Vpc className="h-8 w-8" />,
      sourcePosition: Position.Top,
      sourceClassName: 'left-[75%] translate-x-[-50%]',
      targetClassName: 'left-[75%] translate-x-[-50%]',
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
      description: 'Autoscaling t2.micro instances\n (one instance minimum)',
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
      description: 'Autoscaling (from zero)\n g4dn.xlarge GPU instances',
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
      description: 'Distributing traffic between tasks',
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
