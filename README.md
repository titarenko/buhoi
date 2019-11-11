# buhoi

Because drunk people can create web apps too.

[![Build Status](https://travis-ci.org/titarenko/buhoi.svg?branch=master)](https://travis-ci.org/titarenko/buhoi)
[![Coverage Status](https://coveralls.io/repos/github/titarenko/buhoi/badge.svg?branch=master)](https://coveralls.io/github/titarenko/buhoi?branch=master)

Buhoi is an application server allowing you to write robust full-featured web-applications (with background tasks support) within tight timeframes.

![logo](https://i0.wp.com/eduncovered.com/wp-content/uploads/2014/01/simpsons-bender-drunk.jpg)

## env

| name | required | purpose | format | example |
| --- | --- | --- | --- | --- |
| BUHOI_CERTS_PATH | production | specifies path to directory with ssl certificates, make sure you have dhparams there (`openssl dhparam -out dhparam.pem 4096`) | /dir | /var/lib/letsencrypt/my.site.com |
| BUHOI_PORTS | no | overrides web server ports (to listen on 80, 443 you need to `setcap 'cap_net_bind_service=+ep' /path/to/node`) | http;https | 3000;3001 |
| BUHOI_PG | no | PostgreSQL connection string | if provided, then knex instance will be created and exposed | postgres://user:password@host:port/db | |
| BUHOI_PG_POOL | no | size of connection pool for PostgreSQL | integer | 100 |
| BUHOI_MQ | no | RabbitMQ connection string | if provided, mqu instance will be created and exposed | amqp://user:password@host:port/vhost | |
| BUHOI_REDIS | no | if provided, caching will be enabled | redis://host | |
| BUHOI_AUTH_CACHE_DURATION | no | RPC authentication cache duration | time in human readable format | 1 minute |
| BUHOI_MAX_INPUT_SIZE | no | max size of RPC request | size | 10mb |
| BUHOI_SLACK | no | slack token and channel to post error messages | token;channel;icon | xoxb-...;alerts;:hideyourpain: |
| BUHOI_LOGSTASH | no | logstash UDP socket to send each log message | udp://ip:port | udp://192.168.1.10:5000 |
