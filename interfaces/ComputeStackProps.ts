import { StackProps } from "aws-cdk-lib";

import {ComputeInstanceStackProps} from "./ComputeInstanceStackProps";
import { VpcStack } from '../lib/VpcStack';
import { EnvProps } from "./EnvProps";


export interface ComputeStackProps extends StackProps {
  env: EnvProps,
  vpcStack: VpcStack,
  instanceRoleName: string,
  controlPlane: ComputeInstanceStackProps,
  worker: ComputeInstanceStackProps,
  // these are the EC2 properties if you need Extra Kubernetes Nodes
  extra: ComputeInstanceStackProps,
  globalTags: Map<string, string>,
  userDataPath: string,
  // number of desired Extra EC2 Instances for practicing Kubernetes Availability
  // just set to zero if your skipping that bit
  numExtraNodes: number,
}
