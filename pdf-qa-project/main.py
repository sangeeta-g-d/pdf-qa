from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import upload, query

app = FastAPI(title="PDF Q&A System")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(query.router)

@app.get("/")
def root():
    return {"message": "PDF Q&A System is running!"}