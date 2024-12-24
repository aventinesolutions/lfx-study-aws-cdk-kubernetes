import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from 'aws-cdk-lib';

import { ComputeStackProps } from '../interfaces/ComputeStackProps';


export class ComputeStack extends Stack {

  controlPlane: ec2.Instance;
  worker: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(props.vpcStack, 'OurVPC', {
      vpcName: 'LFXCDK-VPCStack/vpc',
    });

    const securityGroups: ec2.ISecurityGroup[] = [];
    cdk.Fn.importValue('security-group-ids').split(',').map(id => {
      securityGroups.push(ec2.SecurityGroup.fromSecurityGroupId(props.vpcStack, id, id));
    });

    // Create the Control Plane EC2 Compute Instance
    this.controlPlane = new ec2.Instance(this, props.controlPlane.instanceName, {
      vpc,
      instanceName: props.controlPlane.instanceName,
      instanceType: props.controlPlane.instanceType,
      machineImage: props.controlPlane.instanceMachineImage,
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(props.controlPlane.rootVolumeSize, {
            volumeType: ec2.EbsDeviceVolumeType.GP2
          }),
        }
      ],
    });
    cdk.Tags.of(this.controlPlane).add('Name', props.controlPlane.instanceName);
    cdk.Tags.of(this.controlPlane).add('Role', props.controlPlane.roleNameTag);

    // Add Security Groups with Ingress/Egress Rules
    securityGroups.map(s => this.controlPlane.addSecurityGroup(s));

    // Create the Worker EC2 Compute Instance
    this.worker = new ec2.Instance(this, props.worker.instanceName, {
      vpc,
      instanceName: props.worker.instanceName,
      instanceType: props.worker.instanceType,
      machineImage: props.worker.instanceMachineImage,
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(props.worker.rootVolumeSize, {
            volumeType: ec2.EbsDeviceVolumeType.GP2
          }),
        }
      ],
    });
    cdk.Tags.of(this.worker).add('Name', props.worker.instanceName);
    cdk.Tags.of(this.worker).add('Role', props.worker.roleNameTag);

    // Add Security Groups with Ingress/Egress Rules
    securityGroups.map(s => this.worker.addSecurityGroup(s));
  }
}
