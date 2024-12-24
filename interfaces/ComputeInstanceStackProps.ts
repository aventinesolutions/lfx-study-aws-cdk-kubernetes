import { StackProps } from "aws-cdk-lib";

import * as ec2 from "aws-cdk-lib/aws-ec2";

export interface ComputeInstanceStackProps extends StackProps {
  instanceName: string;
  instanceType: ec2.InstanceType;
  instanceMachineImage: ec2.IMachineImage;
  rootVolumeSize: number;
  roleNameTag: string;
}
