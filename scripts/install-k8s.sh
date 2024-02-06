#!/bin/bash

echo "-----------------------------"
echo "-- !!!!!!!!!!!!!!!!!!!!!!! --"
echo "-- Warning Warning Warning --"
echo "-- !!!!!!!!!!!!!!!!!!!!!!! --"
echo "-- please modify this file --"
echo "-- !!!!!!!!!!!!!!!!!!!!!!! --"
echo "-----------------------------"

exit 0

swapoff -a

yum install -y docker-ce kubelet kubeadm kubectl --disableexcludes=kubernetes
systemctl start docker  && systemctl enable docker
systemctl start kubelet && systemctl enable kubelet

aliyun_repo=registry.cn-hangzhou.aliyuncs.com/google_containers
vesion_kube=v1.22.0
# docker pull ${aliyun_repo}/kube-apiserver:${vesion_kube}
# docker tag  ${aliyun_repo}/kube-apiserver:${vesion_kube} k8s.gcr.io/kube-apiserver:${version_kube}
# # download other images
# or
# kubeadm config images list
# kubeadm config images pull
# or

kubeadm init \
	--apiserver-advertise-address=192.168.0.109 \
	--image-repository ${aliyun_repo} \
	--kubernetes-version v1.14.1 \
	--pod-network-cidr=10.244.0.0/16
# set authentication between kubectl and api-server
mkdir -p $HOME/.kube
sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
sudo chown $(id -u):$(id -g) $HOME/.kube/config

# install flannel (network plugin)
kubectl apply -f https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
# or
# wget https://raw.githubusercontent.com/coreos/flannel/master/Documentation/kube-flannel.yml
# modify kube-flannel.yml
# kubectl apply -f kube-flannel.yml

kubectl taint nodes --all node-role.kubernetes.io/master-

# execute the next command in master node
# kubeadm token create --print-join-command
# execute the next command in new slave node
# kubeadm join 192.168.0.200:6443 --token xxx --discovery-token-ca-cert-hash sha256:xxx
# kebeadm reset # re-init

# kubectl get nodes
# kubectl get pod --all-namespaces
# kubectl get pod -A
# kubectl describe pod xxx



# k8s dashboard
# weavescope => summary
# kuboard-v3


# usage
kubectl run kubernetes-bootcamp \
	--image=docker.io/jocatalin/kubernete-bootcamp:v1 \
	--port=8080

kubectl expose xxx
kubectl get services
kubectl scale xxx --replicas=3
kubectl set image xxx xxx
kubectl rollout undo xxx


