// import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as cdk from 'aws-cdk-lib';

import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { VpcStackProps } from '../interfaces/VpcStackProps';

export class VpcStack extends Stack {
  public vpc: Vpc

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    this.vpc = new ec2.Vpc(this, 'vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
      natGateways: props.ngAZs.length,
      availabilityZones: props.vpcAZs,
      subnetConfiguration: [
        {
          cidrMask: props.publicCidrMask,
          name: 'public',
          subnetType: ec2.SubnetType.PUBLIC
        },
        {
          cidrMask: props.privateCidrMask,
          name: 'private',
          subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS
        }
      ]
    });
  }
}
