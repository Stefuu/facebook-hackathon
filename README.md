# Facebook Hackathon Journalism Project

## Storytelling news format via messenger bot

## Como utilizar

    git clone https://github.com/Stefuu/facebook-hackathon.git
    cd facebook-hackathon

    ## environment config
    cat > .env
      DATABASE_AUTH_MECHANISM=SCRAM-SHA-1
      DATABASE_NAME=your-database-name
      DATABASE_URI=your-database-uri
      DATABASE_USER=your-database-username
      DATABASE_PASS=your-database-pass
      FB_VALIDATION_TOKEN=fb-webhook-token
      PAGE_ACCESS_TOKEN=secret-fb-page-access-token
      PORT=80
    > ctlr+c

    npm start
