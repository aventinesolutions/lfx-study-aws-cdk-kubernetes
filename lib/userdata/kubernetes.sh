#!/bin/bash

apt-get update

# Ubuntu Basics for Kubernetes DevOps
apt-get install -y tree emacs-nox vim zsh tmux
apt install curl apt-transport-https git wget -y
apt install software-properties-common lsb-release ca-certificates socat -y

# Bash Basics
chsh -s /bin/bash
chsh -s /bin/bash ssm-user

echo 'export FCEDIT=emacs' >> /root/.bashrc
echo 'export FCEDIT=emacs' >> /home/ssm-user/.bashrc

# System Modules and Parameters
modprobe overlay
echo 'overlay' | tee -a /etc/modules-load.d/overlay.conf
modprobe br_netfilter
echo 'br_netfilter' | tee -a /etc/modules-load.d/br_netfilter.conf
cat << EOF | tee /etc/sysctl.d/kubernetes.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
net.ipv4.ip_forward = 1
EOF
sysctl --system

mkdir -v -p -m 755 /etc/apt/keyrings

# Install Containerd
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo 'deb [arch=amd64 signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu jammy stable' | tee /etc/apt/sources.list.d/docker.list > /dev/null
apt-get update && apt-get install -y containerd.io
sed -e 's/SystemdCgroup = false/SystemdCgroup = true/g' -i /etc/containerd/config.toml
systemctl restart containerd

# Install Kubernetes Packages
curl -fsSL https://pkgs.k8s.io/core:/stable:/v1.30/deb/Release.key | gpg --dearmor -o /etc/apt/keyrings/kubernetes-apt-keyring.gpg
echo 'deb [signed-by=/etc/apt/keyrings/kubernetes-apt-keyring.gpg] https://pkgs.k8s.io/core:/stable:/v1.30/deb/ /' | tee /etc/apt/sources.list.d/kubernetes.list
apt-get update && apt-get install -y kubeadm kubelet kubectl
apt-mark hold kubeadm kubelet kubectl
echo 'source <(kubectl completion bash)' >> /root/.bashrc
echo 'source <(kubectl completion bash)' >> /home/ssm-user/.bashrc

# Install Helm
curl https://baltocdn.com/helm/signing.asc | gpg --dearmor -o /usr/share/keyrings/helm.gpg
echo 'deb [arch=amd64 signed-by=/usr/share/keyrings/helm.gpg] https://baltocdn.com/helm/stable/debian/ all main' | tee /etc/apt/sources.list.d/helm-stable-debian.list
apt-get update && apt install -y helm
helm version



