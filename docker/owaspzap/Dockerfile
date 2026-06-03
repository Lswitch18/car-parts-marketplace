FROM zaproxy/zap-stable
USER root
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*
USER zap
ENV ZAP_AUTH_HEADER="Authorization"
