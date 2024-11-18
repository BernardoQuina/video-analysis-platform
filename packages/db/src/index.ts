import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { Entity, EntityItem, Service } from 'electrodb';

import { getTimestampDaysFromNow } from './utils/miscellaneous';

// ################
// ### ENTITIES ###
// ################
const Videos = new Entity({
  model: {
    entity: 'videos',
    version: '1',
    service: 'main',
  },
  attributes: {
    id: { type: 'string', required: true },
    s3Key: { type: 'string', required: true },
    thumbnailS3Key: { type: 'string', required: true },
    fileName: { type: 'string', required: true },
    uploadComplete: { type: 'boolean', required: true, default: false },
    visibility: {
      type: ['PUBLIC', 'PRIVATE'] as const,
      required: true,
      default: 'PUBLIC' as const,
    },
    prompt: {
      type: 'string',
      required: true,
      default: 'Explain what is happening in this video',
    },
    analysisResult: { type: 'string' },
    analysisError: { type: 'string' },
    transcriptResult: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          person: { type: 'string' },
          transcript: { type: 'string' },
        },
      },
    },
    transcriptError: { type: 'string' },
    rekognitionObjects: {
      type: 'list',
      items: {
        type: 'map',
        properties: {
          Label: {
            type: 'map',
            properties: {
              Name: { type: 'string' },
              Categories: {
                type: 'list',
                items: {
                  type: 'map',
                  properties: { Name: { type: 'string' } },
                },
              },
              Parents: {
                type: 'list',
                items: {
                  type: 'map',
                  properties: { Name: { type: 'string' } },
                },
              },
              TimestampData: {
                type: 'list',
                items: {
                  type: 'map',
                  properties: {
                    Timestamp: { type: 'number' },
                    Confidence: { type: 'number' },
                  },
                },
              },
            },
          },
        },
      },
    },
    rekognitionObjectsError: { type: 'string' },
    createdAt: {
      type: 'number',
      required: true,
      default: () => Date.now(),
    },
    userPicture: { type: 'string', required: true },
    userName: { type: 'string', required: true },
    userId: { type: 'string', required: true },
  },
  // Mappings to dynamoDB table definitions
  indexes: {
    byUser: {
      pk: { field: 'pk', composite: ['userId'] },
      sk: { field: 'sk', composite: ['id'] },
      collection: 'user',
    },
    publicVideos: {
      index: 'gsi2pk-public-videos',
      pk: { field: 'visibility', composite: ['visibility'] },
      sk: { field: 'createdAt', composite: ['createdAt'] },
    },
  },
});

export type Video = EntityItem<typeof Videos>;

const UserLimits = new Entity({
  model: {
    entity: 'userLimits',
    version: '1',
    service: 'main',
  },
  attributes: {
    id: { type: 'string', required: true },
    videosProcessed: { type: 'number', required: true, default: 0 },
    expiresAt: {
      type: 'number',
      required: true,
      default: () => getTimestampDaysFromNow(30), // 30 days
    },
    createdAt: {
      type: 'number',
      required: true,
      default: () => Date.now(),
    },
    userId: { type: 'string', required: true },
  },
  // Mappings to dynamoDB table definitions
  indexes: {
    byUser: {
      pk: { field: 'pk', composite: ['userId'] },
      sk: { field: 'sk', composite: ['id'] },
      collection: 'user',
    },
  },
});

export type UserLimits = EntityItem<typeof UserLimits>;

const Sessions = new Entity({
  model: {
    entity: 'sessions',
    version: '1',
    service: 'main',
  },
  attributes: {
    id: { type: 'string', required: true },
    refreshToken: { type: 'string', required: true },
    expiresAt: {
      type: 'number',
      required: true,
      default: () => getTimestampDaysFromNow(365), // Should be equal to refresh token
    },
    createdAt: {
      type: 'number',
      required: true,
      default: () => Date.now(),
    },
    userId: { type: 'string', required: true },
  },
  // Mappings to dynamoDB table definitions
  indexes: {
    primaryKey: {
      pk: { field: 'pk', composite: ['id'] },
      sk: { field: 'sk', composite: ['userId'] },
    },
    byUser: {
      index: 'gsi1pk-gsi1sk-index',
      pk: { field: 'gsi1pk', composite: ['userId'] },
      sk: { field: 'gsi1sk', composite: ['id'] },
      // collection: 'user', Not possible because it must be on same index
    },
  },
});

export type Session = EntityItem<typeof Sessions>;

type DbConfig = {
  region: string;
  tableName: string;
};

export function useDB({ region, tableName }: DbConfig) {
  const client = new DynamoDBClient({ region });

  Videos.setClient(client);
  Videos.setTableName(tableName);

  Sessions.setClient(client);
  Sessions.setTableName(tableName);

  UserLimits.setClient(client);
  UserLimits.setTableName(tableName);

  // ################
  // ### SERVICES ###
  // ################
  return new Service({
    videos: Videos,
    sessions: Sessions,
    userLimits: UserLimits,
  });
}
