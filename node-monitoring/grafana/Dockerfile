FROM grafana/grafana:latest
ADD ./provisioning /etc/grafana/provisioning
ADD ./config.ini /etc/grafana/config.ini
RUN mkdir -p /var/lib/grafana
ADD ./dashboards /var/lib/grafana/dashboards