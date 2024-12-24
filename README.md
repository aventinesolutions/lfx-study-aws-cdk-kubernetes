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
