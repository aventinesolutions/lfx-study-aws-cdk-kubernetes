import { StackProps } from 'aws-cdk-lib';
import { EnvProps } from "./EnvProps";

export interface VpcStackProps extends StackProps {
  env: EnvProps,
  vpcCidr: string,
  vpcAZs: string[],
  ngAZs: string[],
  publicCidrMask: number,
  privateCidrMask: number
}