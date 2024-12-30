import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';

import { Construct } from 'constructs';
import { Stack } from 'aws-cdk-lib';
import { Vpc } from 'aws-cdk-lib/aws-ec2';
import { VpcStackProps } from '../interfaces/VpcStackProps';

export class VpcStack extends Stack {
  public vpc: Vpc
  public securityGroups: ec2.SecurityGroup []

  constructor(scope: Construct, id: string, props: VpcStackProps) {
    super(scope, id, props);

    this.securityGroups = [];

    this.vpc = new ec2.Vpc(this, 'vpc', {
      ipAddresses: ec2.IpAddresses.cidr(props.vpcCidr),
      natGateways: props.natGateways,
      maxAzs: props.maxAzs,
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

    // set Global Tags
    for (let entry of props.globalTags.entries()) {
      cdk.Tags.of(this.vpc).add(entry[0], entry[1]);
    }

    // Security group so all hosts can communicate with each other.
    this.securityGroups[0] = new ec2.SecurityGroup(this, 'LFXCKA-see-each-other', {
      vpc: this.vpc,
      securityGroupName: 'LFXCKA-see-each-other'
    });
    this.securityGroups[0].addIngressRule(ec2.Peer.ipv4(props.vpcCidr), ec2.Port.allTraffic());
    this.securityGroups[0].connections.allowInternally(ec2.Port.allTraffic());

    // Outputs
    new cdk.CfnOutput(this, 'VPCIDOutput', {
      value: this.vpc.vpcId,
      exportName: 'LFXCDK-vpc-id',
      description: 'the ID for our Virtual Private Network',
    });
    new cdk.CfnOutput(this, 'SecurityGroupIDOutput', {
      value: this.securityGroups.map(s => s.securityGroupId).join(','),
      exportName: 'LFXCDK-security-group-ids',
      description: "comma separated list of Security Group ID's",
    });
  }
}
