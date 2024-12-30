import { StackProps } from 'aws-cdk-lib';

export interface EnvProps extends StackProps {
  account: string,
  region: string,
}