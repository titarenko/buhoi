# buhoi

[![Build Status](https://travis-ci.org/titarenko/buhoi.svg?branch=master)](https://travis-ci.org/titarenko/buhoi)
[![Coverage Status](https://coveralls.io/repos/github/titarenko/buhoi/badge.svg?branch=master)](https://coveralls.io/github/titarenko/buhoi?branch=master)

This framework is so simple, that even drunk people can produce typical admin web apps quickly by using it.

## env

| name | required | purpose | format | example |
| --- | --- | --- | --- |
| BUHOI_SLACK | no | slack token and channel to post error messages | token;channel;icon | xoxb-...;alerts;:hideyourpain: |
| BUHOI_LOGSTASH | no | logstash UDP socket to send each log message | udp://ip:port | udp://192.168.1.10:5000 |
| BUHOI_PORTS | no | overrides web server ports | http;https | 3000;3001 |
| BUHOI_CERTS_PATH | production | specifies path to directory with ssl certificates, make sure you have dhparams there (`openssl dhparam -out dhparam.pem 4096`) | /dir | /var/lib/letsencrypt/my.site.com
| 