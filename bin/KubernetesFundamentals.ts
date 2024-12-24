#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";

import { EnvProps } from "../interfaces/EnvProps";
import { VpcStack } from '../lib/VpcStack';
import { ComputeStack } from '../lib/ComputeStack';

let account = '<unknown>';
if (process.env.CDK_DEFAULT_ACCOUNT === undefined) {
  console.error("Error: CDK_DEFAULT_ACCOUNT environment variable is not set and is required to start Cloud Formation");
  process.exit(1);
} else {
  account = process.env.CDK_DEFAULT_ACCOUNT;
}

const env: EnvProps = {
  account,
  region: process.env.CDK_DEFAULT_REGION || 'eu-west-1',
};

const globalTags = new Map<string, string>([
  ['Student', 'matthew.evaneichler@luminis.eu'],
  ['Course', 'LFS258 Kubernetes Fundamentals'],
]);

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'LFXCDK-VPCStack', {
  env,
  vpcCidr: '10.100.0.0/20',
  natGateways: 1,
  maxAzs: 2,
  publicCidrMask: 26,
  privateCidrMask: 24,
  globalTags,
});

const ubuntuImage = ec2.MachineImage.lookup({
  owners: ['amazon'],
  name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*',
});

new ComputeStack(app, 'LFXCDK-ComputeStack', {
  env,
  vpcStack,
  instanceRoleName: 'LFXCDK-SSMRoleForInstancesDefault',
  controlPlane: {
    instanceName: 'kubernetes-control-plane',
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
    instanceMachineImage: ubuntuImage,
    rootVolumeSize: 250,
    roleNameTag: 'kubernetes-control-plane',
  },
  worker: {
    instanceName: 'kubernetes-worker',
    instanceType: ec2.InstanceType.of(ec2.InstanceClass.T3, ec2.InstanceSize.LARGE),
    instanceMachineImage: ubuntuImage,
    rootVolumeSize: 250,
    roleNameTag: 'kubernetes-worker',
  },
  globalTags,
});



