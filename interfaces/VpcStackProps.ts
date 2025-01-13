import { StackProps } from 'aws-cdk-lib';
import { EnvProps } from "./EnvProps";

export interface VpcStackProps extends StackProps {
  env: EnvProps,
  vpcCidr: string,
  natGateways: number,
  maxAzs: number,
  publicCidrMask: number,
  privateCidrMask: number,
  globalTags: Map<string, string>,
  // allowed public IP Addresses for SSH access to Kubernetes Nodes
  allowedPublicIps: string[],
}