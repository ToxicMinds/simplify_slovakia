# Replace the allow_origins line with this:
allow_origins=[
    "http://localhost:5173",  # Local dev
    "https://d3e8x2nvtghmci.cloudfront.net",  # CloudFront
    "http://simplify-slovakia-frontend-1769494476.s3-website.eu-central-1.amazonaws.com",  # S3
    "*"  # Or just allow all for now
],
