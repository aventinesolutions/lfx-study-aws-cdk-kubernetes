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
  globalTags: Map<string, string>,
}