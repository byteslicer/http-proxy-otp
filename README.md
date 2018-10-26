docker run -p 127.0.0.1:8088:8080 --name=http-proxy-otp -d --restart unless-stopped --env-file .env lazzrek/http-proxy-otp
