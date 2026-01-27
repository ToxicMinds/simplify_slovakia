from mangum import Mangum
from app.main import app

# Mangum adapts FastAPI for AWS Lambda
handler = Mangum(app, lifespan="off")
