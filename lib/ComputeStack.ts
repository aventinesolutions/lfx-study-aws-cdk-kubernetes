import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';

import { ComputeStackProps } from '../interfaces/ComputeStackProps';


export class ComputeStack extends Stack {

  controlPlane: ec2.Instance;
  worker: ec2.Instance;

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const securityGroups: ec2.ISecurityGroup[] = [];
    cdk.Fn.importValue('LFXCDK-security-group-ids').split(',').map(id => {
      securityGroups.push(ec2.SecurityGroup.fromSecurityGroupId(props.vpcStack, id, id));
    });

    const role = iam.Role.fromRoleName(this, 'LFXCDK-InstanceRole', props.instanceRoleName);

    // Create the Control Plane EC2 Compute Instance
    this.controlPlane = new ec2.Instance(this, props.controlPlane.instanceName, {
      vpc: props.vpcStack.vpc,
      instanceName: props.controlPlane.instanceName,
      instanceType: props.controlPlane.instanceType,
      machineImage: props.controlPlane.instanceMachineImage,
      role,
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
    // set Global Tags
    for (let entry of props.globalTags.entries()) {
      cdk.Tags.of(this.controlPlane).add(entry[0], entry[1]);
    }

    // Add Security Groups with Ingress/Egress Rules
    securityGroups.map(s => this.controlPlane.addSecurityGroup(s));

    // Create the Worker EC2 Compute Instance
    this.worker = new ec2.Instance(this, props.worker.instanceName, {
      vpc: props.vpcStack.vpc,
      instanceName: props.worker.instanceName,
      instanceType: props.worker.instanceType,
      machineImage: props.worker.instanceMachineImage,
      role,
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
    // set Global Tags
    for (let entry of props.globalTags.entries()) {
      cdk.Tags.of(this.worker).add(entry[0], entry[1]);
    }

    // Add Security Groups with Ingress/Egress Rules
    securityGroups.map(s => this.worker.addSecurityGroup(s));

    // Outputs
    new cdk.CfnOutput(this, 'ControlPlaneInstanceOutput', {
      value: this.controlPlane.instanceId,
      exportName: 'LFXCDK-control-plane-ids',
      description: "the instance ID's for our Kubernetes Control Plane Nodes",
    });
    new cdk.CfnOutput(this, 'WorkerInstanceOutput', {
      value: this.worker.instanceId,
      exportName: 'LFXCDK-worker-ids',
      description: "the instance ID's for our Kubernetes Worker Nodes",
    });
  }
}
