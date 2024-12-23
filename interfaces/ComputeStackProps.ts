import { StackProps } from "aws-cdk-lib";

import {ComputeInstanceStackProps} from "./ComputeInstanceStackProps";
import { VpcStack } from '../lib/VpcStack';


export interface ComputeStackProps extends StackProps {
  vpcStack: VpcStack,
  controlPlane: ComputeInstanceStackProps,
  worker: ComputeInstanceStackProps,
}