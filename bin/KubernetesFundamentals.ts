#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { VpcStack } from '../lib/VpcStack';

const app = new cdk.App();

new VpcStack(app, 'LFXCDKVpcStack', {
  vpcCidr: '10.100.0.0/20',
  vpcAZs: ['eu-west-1a', 'eu-west-1b',],
  ngAZs: ['eu-west-1a',],
  publicCidrMask: 26,
  privateCidrMask: 24,
});