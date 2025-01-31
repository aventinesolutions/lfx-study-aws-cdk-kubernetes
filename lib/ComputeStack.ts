import { Stack } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as cdk from 'aws-cdk-lib';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as fs from 'fs';

import { ComputeStackProps } from '../interfaces/ComputeStackProps';


export class ComputeStack extends Stack {

  public userData: string;
  public controlPlane: ec2.Instance;
  public worker: ec2.Instance;
  public extraNodes: ec2.Instance[];

  constructor(scope: Construct, id: string, props: ComputeStackProps) {
    super(scope, id, props);

    const role = iam.Role.fromRoleName(this, 'LFXCDK-InstanceRole', props.instanceRoleName);

    this.userData = fs.readFileSync(props.userDataPath, 'utf8');

    // Create the Control Plane EC2 Compute Instance
    this.controlPlane = new ec2.Instance(this, props.controlPlane.instanceName, {
      vpc: props.vpcStack.vpc,
      instanceName: props.controlPlane.instanceName,
      instanceType: props.controlPlane.instanceType,
      machineImage: props.controlPlane.instanceMachineImage,
      userData: ec2.UserData.custom(this.userData),
      role,
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(props.controlPlane.rootVolumeSize, {
            volumeType: ec2.EbsDeviceVolumeType.GP2
          }),
        }
      ],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
    cdk.Tags.of(this.controlPlane).add('Name', props.controlPlane.instanceName);
    cdk.Tags.of(this.controlPlane).add('Role', props.controlPlane.roleNameTag);
    // set Global Tags
    for (let entry of props.globalTags.entries()) {
      cdk.Tags.of(this.controlPlane).add(entry[0], entry[1]);
    }

    // Add Security Groups with Ingress/Egress Rules
    props.vpcStack.securityGroups.forEach(s => this.controlPlane.addSecurityGroup(s));

    // Create the Worker EC2 Compute Instance
    this.worker = new ec2.Instance(this, props.worker.instanceName, {
      vpc: props.vpcStack.vpc,
      instanceName: props.worker.instanceName,
      instanceType: props.worker.instanceType,
      machineImage: props.worker.instanceMachineImage,
      userData: ec2.UserData.custom(this.userData),
      role,
      blockDevices: [
        {
          deviceName: '/dev/sda1',
          volume: ec2.BlockDeviceVolume.ebs(props.worker.rootVolumeSize, {
            volumeType: ec2.EbsDeviceVolumeType.GP2
          }),
        }
      ],
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });
    cdk.Tags.of(this.worker).add('Name', props.worker.instanceName);
    cdk.Tags.of(this.worker).add('Role', props.worker.roleNameTag);
    // set Global Tags
    for (let entry of props.globalTags.entries()) {
      cdk.Tags.of(this.worker).add(entry[0], entry[1]);
    }

    // Add Security Groups with Ingress/Egress Rules
    props.vpcStack.securityGroups.forEach(s => this.worker.addSecurityGroup(s));

    // The EC2 instances for Extra Nodes if they ar desired for practicing Kubernetes Cluster Availability

    this.extraNodes = [];
    for (const i of [...Array(props.numExtraNodes).keys()]) {
      const instanceName = `${props.extra.instanceName}${1 + i}`;
      this.extraNodes.push(new ec2.Instance(this, instanceName, {
        vpc: props.vpcStack.vpc,
        instanceName: instanceName,
        instanceType: props.extra.instanceType,
        machineImage: props.extra.instanceMachineImage,
        userData: ec2.UserData.custom(this.userData),
        role,
        blockDevices: [
          {
            deviceName: '/dev/sda1',
            volume: ec2.BlockDeviceVolume.ebs(props.extra.rootVolumeSize, {
              volumeType: ec2.EbsDeviceVolumeType.GP2
            }),
          }
        ],
        vpcSubnets: {
          subnetType: ec2.SubnetType.PUBLIC,
        },
      }));
      cdk.Tags.of(this.extraNodes[i]).add('Name', instanceName);
      cdk.Tags.of(this.extraNodes[i]).add('Role', props.extra.roleNameTag);
      // set Global Tags
      for (let entry of props.globalTags.entries()) {
        cdk.Tags.of(this.extraNodes[i]).add(entry[0], entry[1]);
      }

      // Add Security Groups with Ingress/Egress Rules
      props.vpcStack.securityGroups.forEach(s => this.extraNodes[i].addSecurityGroup(s));
    }

    // Outputs
    new cdk.CfnOutput(this, 'ControlPlaneInstanceOutput', {
      value: this.controlPlane.instanceId,
      exportName: 'LFXCDK-control-plane-ids',
      description: "the instance ID's for our Kubernetes Control Plane Nodes",
    });
    new cdk.CfnOutput(this, 'ControlPlanePublicIPs', {
      value: this.controlPlane.instancePublicIp,
      exportName: 'LFXCDK-control-plane-public-ips',
      description: 'the Public IP Addresses for our Kubernetes Control Plane Nodes',
    });
    new cdk.CfnOutput(this, 'WorkerInstanceOutput', {
      value: this.worker.instanceId,
      exportName: 'LFXCDK-worker-ids',
      description: 'the instance ID\'s for our Kubernetes Worker Nodes',
    });
    new cdk.CfnOutput(this, 'WorkerPublicIPs', {
      value: this.worker.instancePublicIp,
      exportName: 'LFXCDK-worker-public-ips',
      description: 'the Public IP Addresses for our Kubernetes Worker Nodes',
    });
    new cdk.CfnOutput(this, 'ExtraPublicIPs', {
      value: this.extraNodes.map(n => n.instanceId).join(','),
      exportName: 'LFXCDK-extra-public-ips',
      description: 'the Public IP Addresses for our Kubernetes Extra Nodes (the ones used for studying availability'
    });
  }
}
