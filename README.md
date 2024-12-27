# AWS CDK Typescript Simple Project for Cloud Formation of Resources Required for Kubernetes Study
## The Linux Foundation
* [lfx-study-aws-cdk-kubernetes](https://github.com/aventinesolutions/lfx-study-aws-cdk-kubernetes)
* [Kubernetes Fundamentals LFS258](https://trainingportal.linuxfoundation.org/courses/kubernetes-fundamentals-lfs258)

## Instance Role for Kubernetes Control Plane and Worker Compute Instances
* IAM Role `LFXCDK-SSMRoleForInstancesDefault` is made by hand in the Web Console first with the following 
  Amazon Policies:
  * `AmazonEC2FullAccess`
  * `AmazonSSMManagedInstanceCore`
  * `CloudWatchAgentServerPolicy`
* this allows instances to be managed by the Systems Manager [SSM]

## Environment Variables
* set up the appropriate AWS account credentials and configuration
* Set these environment variables
```shell
export AWS_PROFILE=aventinesolutions
export CDK_DEFAULT_PROFILE=aventinesolutions
export CDK_DEFAULT_REGION=us-west-2
```
## CDK Workflow
* bootstrap the context based on the AWS account
```shell
npx cdk bootstrap
```
* deploy the two stacks (VPC and Security Groups will get created first, then the Compute Instances)
```shell
npx cdk deploy 'LFXCDK-*' 
```
* destroy the stacks when the course is complete
```shell
npx cdk destroy 'LFXCDK-*' 
```
* the IntelliJ Project includes some runtime configuration examples

## Systems Manager
* the compute instances will be accessible through the Systems Manager Fleet Manager



