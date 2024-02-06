#!/bin/bash

USERNAME=postgres
ROOT_PATH=/opt/postgresql
DATA_PATH=${ROOT_PATH}/data
pacman -Sy postgresql -y
useradd ${USERNAME}
passwd ${USERNAME}
mkdir -p ${DATA_PATH}
chown -R ${USERNAME} ${ROOT_PATH}
sh - ${USERNAME} -c "initdb --locale en_US.UTF-8 -D ${DATA_PATH}"
sh - ${USERNAME} -c "echo >>${DATA_PATH}/postgresql.conf"
sh - ${USERNAME} -c "echo listen_addresses = \'*\' >>${DATA_PATH}/postgresql.conf"
sh - ${USERNAME} -c "echo unix_socket_directories = \'/tmp\' >>${DATA_PATH}/postgresql.conf"
sh - ${USERNAME} -c "pg_ctl -D ${DATA_PATH} start"
systemctl enable postgresql
