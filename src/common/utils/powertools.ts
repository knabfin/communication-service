import { Logger } from '@aws-lambda-powertools/logger';
import { Metrics } from '@aws-lambda-powertools/metrics';
import { Tracer } from '@aws-lambda-powertools/tracer';

export const logger = new Logger({
  serviceName: 'kbackend',
  persistentLogAttributes: {
    aws_account_id: process.env.AWS_ACCOUNT_ID || 'N/A',
    aws_region: process.env.AWS_REGION || 'N/A',
    sst_stage: process.env.SST_STAGE || 'N/A',
  },
});

export const metrics = new Metrics({
  namespace: 'kbackend',
  serviceName: 'kbackend',
  defaultDimensions: {
    aws_account_id: process.env.AWS_ACCOUNT_ID || 'N/A',
    aws_region: process.env.AWS_REGION || 'N/A',
    sst_stage: process.env.SST_STAGE || 'N/A',
  },
});

export const tracer = new Tracer({ serviceName: 'kbackend' });
