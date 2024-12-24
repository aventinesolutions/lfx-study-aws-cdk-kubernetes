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

const app = new cdk.App();

const vpcStack = new VpcStack(app, 'LFXCDK-VPCStack', {
  env,
  vpcCidr: '10.100.0.0/20',
  vpcAZs: ['eu-west-1a', 'eu-west-1b',],
  ngAZs: ['eu-west-1a',],
  publicCidrMask: 26,
  privateCidrMask: 24,
});

const ubuntuImage = ec2.MachineImage.lookup({
  owners: ['amazon'],
  name: 'ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-20240530',
});

new ComputeStack(app, 'LFXCDK-ComputeStack', {
  env,
  vpcStack,
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
  }
});



