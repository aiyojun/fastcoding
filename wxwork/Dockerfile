FROM ubuntu:22.04
ARG http_proxy=
ARG https_proxy=
RUN apt update
RUN dpkg --add-architecture i386 
RUN mkdir -pm755 /etc/apt/keyrings
RUN apt install wget vim -y
RUN wget -O /etc/apt/keyrings/winehq-archive.key https://dl.winehq.org/wine-builds/winehq.key
RUN wget -NP /etc/apt/sources.list.d/ https://dl.winehq.org/wine-builds/ubuntu/dists/jammy/winehq-jammy.sources
RUN apt update
RUN apt install --install-recommends winehq-stable -y
COPY system.reg /opt
COPY msyh.ttc /opt/share/fonts/
COPY msyhbd.ttc /opt/share/fonts/
COPY msyhl.ttc /usr/share/fonts/
VOLUME ["/tmp/.X11-unix", "/opt/share"]
ENV DISPLAY=:0
RUN wget -O /opt/wxwork-installer.exe -c "https://work.weixin.qq.com/wework_admin/commdownload?platform=win&from=wwindex"