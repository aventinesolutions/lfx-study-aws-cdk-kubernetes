import { StackProps } from 'aws-cdk-lib';

export interface VpcStackProps extends StackProps {
    vpcCidr: string,
    vpcAZs: string[],
    ngAZs: string[],
    publicCidrMask: number,
    privateCidrMask: number
}