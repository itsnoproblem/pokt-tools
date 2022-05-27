FROM prom/prometheus
ARG PROMETHEUS_TARGETS="'pokt-000:8083','pokt-001:8083'"
ADD prometheus.yml.tpl /etc/prometheus/
RUN /bin/sed -e "s/__PROMETHEUS_TARGETS__/$PROMETHEUS_TARGETS/g"